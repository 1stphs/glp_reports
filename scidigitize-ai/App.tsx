import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import { FileItem, SubItem } from './types';
import { analyzeChartImage, analyzeTableImage, analyzeInfographicImage, detectChartsInPage } from './services/geminiService';
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

    // Handle PDFs
    if (pdfFiles.length > 0) {
      setIsScanning(true);
      try {
        for (const pdfFile of pdfFiles) {
          await processPdf(pdfFile);
        }
      } catch (err) {
        console.error("PDF Processing Error", err);
        alert("Failed to process PDF. Please check the file.");
      } finally {
        setIsScanning(false);
      }
    }
  };

  const processPdf = async (file: File) => {
    const pdfId = generateId();
    
    // Create placeholder for PDF
    const newPdfItem: FileItem = {
      id: pdfId,
      type: 'pdf',
      file: file,
      previewUrl: '', // Will update later? Or generic icon.
      status: 'scanning',
      timestamp: Date.now(),
      subItems: []
    };
    
    setFiles(prev => [...prev, newPdfItem]);
    setSelectedFileId(pdfId); // Focus on the new PDF

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // IMPORTANT: Extract global context (First page usually contains Title + Abstract)
    let globalContext = "";
    try {
      const firstPage = await pdf.getPage(1);
      const textContent = await firstPage.getTextContent();
      globalContext = textContent.items.map((item: any) => item.str).join(' ');
      // Update the file item with this context immediately
      setFiles(prev => prev.map(f => f.id === pdfId ? { ...f, globalContext } : f));
    } catch (e) {
      console.warn("Failed to extract global text context", e);
    }

    // Scan all pages (or limit to a reasonable number if performance is a concern, but user requested full scan)
    // Let's loop through all pages but process sequentially to not crash browser
    const maxPages = pdf.numPages; 
    const discoveredItems: SubItem[] = [];
    
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        
        // 1. Extract Text for this specific page (Local Context)
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');

        // 2. Render Page to Image for Vision AI
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport } as any).promise;
        const pageBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        // 3. Detect Items
        const detectedResults = await detectChartsInPage(pageBase64.split(',')[1]);

        for (const item of detectedResults) {
          // Crop logic
          const [ymin, xmin, ymax, xmax] = item.box_2d;
          
          const pX = (xmin / 1000) * canvas.width;
          const pY = (ymin / 1000) * canvas.height;
          const pW = ((xmax - xmin) / 1000) * canvas.width;
          const pH = ((ymax - ymin) / 1000) * canvas.height;

          const padding = 20;
          const cropX = Math.max(0, pX - padding);
          const cropY = Math.max(0, pY - padding);
          const cropW = Math.min(canvas.width - cropX, pW + padding * 2);
          const cropH = Math.min(canvas.height - cropY, pH + padding * 2);

          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          
          if (cropCtx) {
            cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            
            await new Promise<void>(resolve => {
              cropCanvas.toBlob((blob) => {
                if (blob) {
                  const croppedFile = new File([blob], `${file.name}_pg${i}_${item.label}.jpg`, { type: 'image/jpeg' });
                  
                  // Combine detected caption with full page text for rich local context
                  const richContext = `[CAPTION]: ${item.caption}\n\n[FULL PAGE TEXT]: ${pageText}`;

                  discoveredItems.push({
                    id: generateId(),
                    type: item.type as 'chart' | 'table' | 'infographic', 
                    file: croppedFile,
                    previewUrl: URL.createObjectURL(croppedFile),
                    context: richContext,
                    pageNumber: i,
                    status: 'idle'
                  });
                }
                resolve();
              }, 'image/jpeg', 0.95);
            });
          }
        }
      } catch (err) {
        console.warn(`Error scanning page ${i}`, err);
      }
    }

    // Update PDF Item with discovered items
    setFiles(prev => prev.map(f => {
      if (f.id === pdfId) {
        return {
          ...f,
          status: 'idle', // Ready for user to select
          subItems: discoveredItems
        };
      }
      return f;
    }));
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
        if (item.type === 'table') {
          result = await analyzeTableImage(item.file, item.context, globalContext);
        } else if (item.type === 'infographic') {
          result = await analyzeInfographicImage(item.file, item.context, globalContext);
        } else {
          result = await analyzeChartImage(item.file, item.context, globalContext);
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
           if(fileInput) fileInput.click();
        }}
        onProcessPdfItems={processPdfSubItems}
      />
    </div>
  );
};

export default App;
