import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import { FileItem, SubItem } from './types';
import { analyzeChartImage, analyzeTableImage, analyzeInfographicImage, detectChartsInPage, analyzeRStatImage, autoParseVisualElement } from './services/geminiService';
import { uploadFileToTos } from './services/tosService';
import { triggerCustomMineruParsing } from './services/mineruCustomService';
import { processMineruDirectResponse } from './services/mineruResultHandler';
import * as pdfjsLib from 'pdfjs-dist';

// Define worker globally
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  const handleUpload = async (fileList: FileList) => {
    const uploadedFiles = Array.from(fileList);

    // Separate Documents (PDF/Word/PPT) and Images
    const docFiles = uploadedFiles.filter(f =>
      f.type === 'application/pdf' ||
      f.type.includes('msword') ||
      f.type.includes('wordprocessingml') ||
      f.type.includes('presentation') ||
      f.type.includes('powerpoint') ||
      f.name.endsWith('.doc') || f.name.endsWith('.docx') || f.name.endsWith('.ppt') || f.name.endsWith('.pptx') || f.name.endsWith('.pdf')
    );

    const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'));

    // Handle normal images immediately (Gemini)
    if (imageFiles.length > 0) {
      const newImageFiles: FileItem[] = imageFiles.map(file => ({
        id: generateId(),
        type: 'image',
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle',
        timestamp: Date.now()
      }));
      setFiles(prev => [...prev, ...newImageFiles]);
      if (!selectedFileId && newImageFiles.length > 0) setSelectedFileId(newImageFiles[0].id);
    }

    // Handle Docs via Mineru (TOS + Custom API)
    if (docFiles.length > 0) {
      for (const docFile of docFiles) {
        // Avoid duplicates if image filter picked it up
        if (!docFile.type.startsWith('image/')) {
          const docId = generateId();
          const newDocItem: FileItem = {
            id: docId,
            type: 'document', // Unified type for PDF/Word/PPT
            file: docFile,
            previewUrl: '', // Could generate a thumbnail if possible, but empty for now
            status: 'idle', // Idle, waiting for manual trigger
            mineruStatus: 'idle',
            timestamp: Date.now(),
            subItems: []
          };

          setFiles(prev => [...prev, newDocItem]);
          if (!selectedFileId) setSelectedFileId(docId);
        }
      }
    }
  };

  const handleStartMineruParse = async (fileId: string) => {
    const item = files.find(f => f.id === fileId);
    if (!item) return;

    // Update state to scanning
    setFiles(prev => prev.map(f => f.id === fileId ? {
      ...f,
      status: 'scanning',
      mineruStatus: 'uploading'
    } : f));

    try {
      // 1. Upload to Volcengine TOS
      const tosUrl = await uploadFileToTos(item.file);
      console.log('[Upload] TOS Upload Success:', tosUrl);

      // 2. Transition to "Parsing" State
      setFiles(prev => prev.map(f => f.id === fileId ? {
        ...f,
        mineruStatus: 'processing', // Indicates custom API is being called
        tosUrl: tosUrl,
      } : f));

      // 3. Trigger Custom Parsing Webhook and WAIT for result
      try {
        const results = await triggerCustomMineruParsing(tosUrl, item.file.name);
        console.log('[Mineru] Parsing results:', results);

        const result = results.find(r => r.file_name === item.file.name) || results[0];

        if (result && result.images && result.images.length > 0) {
          // 4. Process Results
          const subItems = await processMineruDirectResponse(result.images, result.layout);

          setFiles(prev => prev.map(f => f.id === fileId ? {
            ...f,
            status: 'idle', // Ready for user interaction
            mineruStatus: 'done',
            mineruResultUrl: result.full, // Link to Markdown
            subItems: subItems,
            mineruProgress: {
              current: result.images.length,
              total: result.images.length
            },
            // Clear error if any
            errorMessage: undefined
          } : f));
        } else {
          // Handle case with no images - treat as success but warn user
          console.warn('[Mineru] Parsing finished but no images found.');
          setFiles(prev => prev.map(f => f.id === fileId ? {
            ...f,
            status: 'idle',
            mineruStatus: 'done',
            mineruResultUrl: result?.full,
            subItems: [],
            mineruProgress: {
              current: 0,
              total: 0
            },
            errorMessage: "该文档没有识别到图片"
          } : f));
        }

      } catch (mineruErr) {
        console.error('[Mineru] Parsing Failed:', mineruErr);
        const msg = (mineruErr as any).message || "Parsing service failed";
        setFiles(prev => prev.map(f => f.id === fileId ? {
          ...f,
          status: 'error',
          mineruStatus: 'error',
          errorMessage: `Parsing Failed: ${msg}`
        } : f));
      }

    } catch (e) {
      console.error("Upload Error", e);
      // Only show error if TOS upload itself failed
      let msg = (e as any).message || "Unknown error";
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', mineruStatus: 'error', errorMessage: msg } : f));
    }
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (selectedFileId === id) {
        setSelectedFileId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Process single image manual trigger
  const handleStartImageAnalysis = async (fileId: string) => {
    const item = files.find(f => f.id === fileId);
    if (!item) return;

    setIsProcessing(true);
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));

    try {
      const result = await analyzeChartImage(item.file, item.context);
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed', result } : f));
    } catch (error) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMessage: 'Failed' } : f));
    } finally {
      setIsProcessing(false);
    }
  };

  // Process the legacy image queue (default to chart for now)
  const processQueue = useCallback(async () => {
    setIsProcessing(true);
    const queue = files.filter(f => f.type === 'image' && (f.status === 'idle' || f.status === 'queued'));

    for (const item of queue) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));
      setSelectedFileId(item.id);

      try {
        const result = await analyzeChartImage(item.file, item.context);
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed', result } : f));
      } catch (error) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', errorMessage: 'Failed' } : f));
      }
    }
    setIsProcessing(false);
  }, [files]);

  // Process selected items within a PDF
  const processPdfSubItems = useCallback(async (fileId: string, subItemIds: string[]) => {

    setFiles(prev => prev.map(f => {
      if (f.id === fileId && f.subItems) {
        return {
          ...f,
          subItems: f.subItems.map(sub => subItemIds.includes(sub.id) ? { ...sub, status: 'processing' } : sub)
        };
      }
      return f;
    }));

    const parentFile = files.find(f => f.id === fileId);
    if (!parentFile || !parentFile.subItems) return;

    const globalContext = parentFile.globalContext;
    const itemsToProcess = parentFile.subItems.filter(sub => subItemIds.includes(sub.id));

    for (const item of itemsToProcess) {
      try {
        // --- UPDATED LOGIC FOR OPTION 2 ---
        // Instead of switching by pre-defined type, we call the Auto-Parser.
        // It will Classify -> Then Extract using the High-Intelligence Model.
        const result = await autoParseVisualElement(item.file, item.context, globalContext);

        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.subItems) {
            return {
              ...f,
              subItems: f.subItems.map(sub => sub.id === item.id ? {
                ...sub,
                status: 'completed',
                type: result.dataType as any, // Update the type based on what AI found
                result
              } : sub)
            };
          }
          return f;
        }));

      } catch (error) {
        console.error("Auto Parse Failed for item:", item.id, error);
        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.subItems) {
            return {
              ...f,
              subItems: f.subItems.map(sub => sub.id === item.id ? { ...sub, status: 'error' } : sub)
            };
          }
          return f;
        }));
      }
    }

  }, [files]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-900">
      <Sidebar
        files={files}
        selectedFileId={selectedFileId}
        onSelectFile={setSelectedFileId}
        onUpload={handleUpload}
        onProcessQueue={processQueue}
        onDeleteFile={handleDeleteFile}
        isProcessing={isProcessing}
        isScanning={isScanning}
      />
      <MainView
        selectedFile={selectedFile}
        onStartDigitization={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.click();
        }}
        onProcessPdfItems={processPdfSubItems}
        onStartMineruParse={handleStartMineruParse}
        onStartImageAnalysis={handleStartImageAnalysis}
      />
    </div>
  );
};

export default App;
