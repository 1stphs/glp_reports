import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import { FileItem, SubItem } from './types';
import { analyzeChartImage, analyzeTableImage, analyzeInfographicImage, detectChartsInPage, analyzeRStatImage } from './services/geminiService';
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

    // Separate PDFs and Images
    const pdfFiles = uploadedFiles.filter(f => f.type === 'application/pdf');
    const imageFiles = uploadedFiles.filter(f => f.type.startsWith('image/'));

    // Handle normal images immediately
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

    // Handle PDFs via Mineru (TOS + Custom API)
    if (pdfFiles.length > 0) {
      setIsScanning(true);
      try {
        for (const pdfFile of pdfFiles) {
          await processPdfViaMineru(pdfFile);
        }
      } catch (err) {
        console.error("PDF Processing Error", err);
        alert("Failed to process PDF. Please check the file.");
      } finally {
        setIsScanning(false);
      }
    }
  };

  const processPdfViaMineru = async (file: File) => {
    const pdfId = generateId();

    // Initial State: Scanning
    const newPdfItem: FileItem = {
      id: pdfId,
      type: 'pdf',
      file: file,
      previewUrl: '', // PDF preview not generated locally to save resources, or we could use pdf.js if needed
      status: 'scanning',
      mineruStatus: 'uploading',
      timestamp: Date.now(),
      subItems: []
    };

    setFiles(prev => [...prev, newPdfItem]);
    setSelectedFileId(pdfId);

    try {
      // 1. Upload to Volcengine TOS
      const tosUrl = await uploadFileToTos(file);

      // Update to Processing
      setFiles(prev => prev.map(f => f.id === pdfId ? {
        ...f,
        mineruStatus: 'processing',
      } : f));

      // 2. Trigger Custom Parsing Webhook
      const results = await triggerCustomMineruParsing(tosUrl, file.name);
      // We assume we get results for the single file we sent
      // Flexible matching: check matches by filename or just take first if length 1
      // The API returns an array of objects where each object keys include metadata.
      // Our service already normalized this to MineruExtractResult[]

      const result = results.find(r => r.file_name === file.name) || results[0];

      if (result && result.images && result.images.length > 0) {
        // 3. Process the returned direct image URLs
        const subItems = await processMineruDirectResponse(result.images, result.layout);

        setFiles(prev => prev.map(f => f.id === pdfId ? {
          ...f,
          status: 'idle', // Ready
          mineruStatus: 'done',
          mineruResultUrl: result.full, // Link to Markdown
          subItems: subItems,
          mineruProgress: {
            current: result.images!.length,
            total: result.images!.length
          }
        } : f));
      } else {
        throw new Error("Parsing finished but no images were returned.");
      }

    } catch (e) {
      console.error("Mineru Flow Error", e);
      // Extract error message potentially
      let msg = (e as any).message || "Unknown error";
      setFiles(prev => prev.map(f => f.id === pdfId ? { ...f, status: 'error', mineruStatus: 'error', errorMessage: msg } : f));
    }
  };

  // Deprecated manual start
  const handleStartMineruParse = async (fileId: string) => {
    console.warn("handleStartMineruParse is deprecated. Use drag & drop upload.");
    throw new Error("Deprecated: Please re-upload the file.");
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
        let result;
        switch (item.type) {
          case 'r_stat':
            result = await analyzeRStatImage(item.file, item.context, globalContext);
            break;
          case 'standard_chart':
            result = await analyzeChartImage(item.file, item.context, globalContext);
            break;
          case 'table':
          case 'complex_table':
            result = await analyzeTableImage(item.file, item.context, globalContext);
            break;
          case 'infographic':
            result = await analyzeInfographicImage(item.file, item.context, globalContext);
            break;
          default:
            result = await analyzeChartImage(item.file, item.context, globalContext);
            break;
        }

        setFiles(prev => prev.map(f => {
          if (f.id === fileId && f.subItems) {
            return {
              ...f,
              subItems: f.subItems.map(sub => sub.id === item.id ? { ...sub, status: 'completed', result } : sub)
            };
          }
          return f;
        }));

      } catch (error) {
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
      />
    </div>
  );
};

export default App;
