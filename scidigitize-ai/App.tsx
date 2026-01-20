import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import { FileItem, SubItem } from './types';
import { analyzeChartImage, analyzeTableImage, analyzeInfographicImage, detectChartsInPage, analyzeRStatImage } from './services/geminiService';
import { initiateBatchUpload, uploadFileToUrl, pollBatchResult } from './services/mineruService';
import { processMineruZip } from './services/mineruResultHandler';
import * as pdfjsLib from 'pdfjs-dist';

// Define worker globally
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);



  // Mineru Logic
  const handleStartMineruParse = async (fileId: string) => {
    const fileItem = files.find(f => f.id === fileId);
    if (!fileItem || !fileItem.file) return;

    // 1. Update State: Uploading
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, mineruStatus: 'uploading' } : f));

    try {
      // 2. Initiate Batch
      const batchInit = await initiateBatchUpload([fileItem.file]);
      if (batchInit.code !== 0) throw new Error(batchInit.msg);

      const batchId = batchInit.data.batch_id;
      const uploadUrl = batchInit.data.file_urls[0];

      // 3. Upload File
      await uploadFileToUrl(uploadUrl, fileItem.file);

      // 4. Update State: Processing
      setFiles(prev => prev.map(f => f.id === fileId ? {
        ...f,
        mineruStatus: 'processing',
        mineruBatchId: batchId
      } : f));

      // 5. Start Polling
      const pollInterval = setInterval(async () => {
        try {
          const resultRes = await pollBatchResult(batchId);
          if (resultRes.code !== 0) return; // Wait for next poll or handle error

          // Mineru returns a list of results for the batch
          // Since we uploaded 1 file, we look at extract_result[0]
          // But API result structure might vary slightly, let's be robust
          const result = resultRes.data.extract_result.find(r => r.file_name === fileItem.file.name);

          if (!result) return;

          if (result.state === 'done') {
            clearInterval(pollInterval);
            setFiles(prev => prev.map(f => f.id === fileId ? {
              ...f,
              mineruStatus: 'done',
              mineruResultUrl: result.full_zip_url
            } : f));
          } else if (result.state === 'failed') {
            clearInterval(pollInterval);
            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, mineruStatus: 'error' } : f));
            alert(`Mineru Parsing Failed: ${result.err_msg}`);
          } else if (result.state === 'running') {
            // Update progress if available
            if (result.extract_progress) {
              setFiles(prev => prev.map(f => f.id === fileId ? {
                ...f,
                mineruProgress: {
                  current: result.extract_progress!.extracted_pages,
                  total: result.extract_progress!.total_pages
                }
              } : f));
            }
          }
        } catch (err) {
          console.error("Polling Error", err);
          // Optionally clear interval on hard network error
        }
      }, 3000); // Poll every 3 seconds

    } catch (err: any) {
      console.error("Mineru Start Error", err);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, mineruStatus: 'error' } : f));
      alert(`Failed to start Mineru parsing: ${err.message}`);
    }
  };

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

    // Handle PDFs via Mineru
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

    // Initial State: Scanning (which covers Uploading/Processing in UI)
    const newPdfItem: FileItem = {
      id: pdfId,
      type: 'pdf',
      file: file,
      previewUrl: '',
      status: 'scanning', // Block UI with scanning state
      mineruStatus: 'uploading',
      timestamp: Date.now(),
      subItems: []
    };

    setFiles(prev => [...prev, newPdfItem]);
    setSelectedFileId(pdfId);

    try {
      // 1. Upload
      const batchInit = await initiateBatchUpload([file]);
      if (batchInit.code !== 0) throw new Error(batchInit.msg);

      const batchId = batchInit.data.batch_id;
      const uploadUrl = batchInit.data.file_urls[0];

      await uploadFileToUrl(uploadUrl, file);

      // Update to Processing
      setFiles(prev => prev.map(f => f.id === pdfId ? {
        ...f,
        mineruStatus: 'processing',
        mineruBatchId: batchId
      } : f));

      // 2. Poll
      const pollInterval = setInterval(async () => {
        try {
          const resultRes = await pollBatchResult(batchId);
          if (resultRes.code !== 0) return;

          const result = resultRes.data.extract_result.find(r => r.file_name === file.name);
          if (!result) return;

          if (result.state === 'done') {
            clearInterval(pollInterval);

            // 3. Download and Parse Zip
            if (result.full_zip_url) {
              const zipRes = await fetch(result.full_zip_url);
              const zipBlob = await zipRes.blob();
              const subItems = await processMineruZip(zipBlob, file.name);

              setFiles(prev => prev.map(f => f.id === pdfId ? {
                ...f,
                status: 'idle', // Ready
                mineruStatus: 'done',
                mineruResultUrl: result.full_zip_url,
                subItems: subItems
              } : f));
            }
          } else if (result.state === 'failed') {
            clearInterval(pollInterval);
            setFiles(prev => prev.map(f => f.id === pdfId ? { ...f, status: 'error', mineruStatus: 'error' } : f));
          } else if (result.state === 'running' && result.extract_progress) {
            setFiles(prev => prev.map(f => f.id === pdfId ? {
              ...f,
              mineruProgress: {
                current: result.extract_progress!.extracted_pages,
                total: result.extract_progress!.total_pages
              }
            } : f));
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);

    } catch (e) {
      console.error("Mineru Flow Error", e);
      setFiles(prev => prev.map(f => f.id === pdfId ? { ...f, status: 'error' } : f));
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

  // Process the legacy image queue (default to chart for now, or update logic if we allow single image type selection)
  const processQueue = useCallback(async () => {
    setIsProcessing(true);
    const queue = files.filter(f => f.type === 'image' && (f.status === 'idle' || f.status === 'queued'));

    for (const item of queue) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));
      setSelectedFileId(item.id);

      try {
        // Default legacy behavior: Assume chart for single uploads unless we add UI to choose
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

    // Get the global context from the parent file
    const globalContext = parentFile.globalContext;

    const itemsToProcess = parentFile.subItems.filter(sub => subItemIds.includes(sub.id));

    for (const item of itemsToProcess) {
      try {
        let result;
        // Pass both local item.context (rich page text) and globalContext

        switch (item.type) {
          case 'r_stat':
            // R-Grade Statistics
            result = await analyzeRStatImage(item.file, item.context, globalContext);
            break;

          case 'standard_chart':
            // Standard Quantitative Charts
            result = await analyzeChartImage(item.file, item.context, globalContext);
            break;

          case 'table': // Legacy Fallback
          case 'complex_table':
            // Complex Tables
            result = await analyzeTableImage(item.file, item.context, globalContext);
            break;

          case 'infographic':
            // Infographics
            result = await analyzeInfographicImage(item.file, item.context, globalContext);
            break;

          default:
            // Default to standard chart if unknown
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
