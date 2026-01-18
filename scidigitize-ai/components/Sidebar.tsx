import React, { useRef } from 'react';
import { FileItem } from '../types';
import { Upload, Play, CheckCircle2, Loader2, FileBarChart, AlertCircle, X, Image as ImageIcon, FileText, Folder } from 'lucide-react';

interface SidebarProps {
  files: FileItem[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  onUpload: (files: FileList) => void;
  onProcessQueue: () => void;
  onDeleteFile: (id: string, e: React.MouseEvent) => void;
  isProcessing: boolean;
  isScanning?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  selectedFileId, 
  onSelectFile, 
  onUpload, 
  onProcessQueue,
  onDeleteFile,
  isProcessing,
  isScanning
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Only count single images in the "queue", PDFs have their own internal state
  const queueCount = files.filter(f => f.type === 'image' && (f.status === 'queued' || f.status === 'idle')).length;
  const resultCount = files.filter(f => f.type === 'image' && f.status === 'completed').length;
  // Count PDF sub-items for a more accurate total? Let's stick to top level for now or it gets confusing.
  
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">SciDigitize AI</h1>
        </div>
        <p className="text-xs text-slate-500 font-medium ml-10">HIGH ACCURACY EXTRACTION</p>
      </div>

      {/* Actions */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isScanning ? 'Scanning...' : 'Upload'}
        </button>
        <input 
          type="file" 
          multiple 
          accept="image/*,application/pdf" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        <button 
          onClick={onProcessQueue}
          disabled={isProcessing || queueCount === 0 || isScanning}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm
            ${isProcessing || queueCount === 0 || isScanning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Queue
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-2">
        <div className="flex border-b border-slate-200">
          <div className="px-4 py-2 text-xs font-semibold text-indigo-600 border-b-2 border-indigo-600 cursor-pointer">
            FILES ({files.length})
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {files.length === 0 && !isScanning && (
          <div className="text-center py-10 px-4">
            <p className="text-sm text-slate-400">Upload Images or PDFs to identify and digitize charts.</p>
          </div>
        )}

        {isScanning && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1">
              <div className="h-3 bg-indigo-200 rounded w-24 mb-2"></div>
              <div className="h-2 bg-indigo-200 rounded w-16"></div>
            </div>
          </div>
        )}
        
        {files.map((file) => (
          <div 
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md
              ${selectedFileId === file.id 
                ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-indigo-100'}`}
          >
            {/* Thumbnail / Icon */}
            <div className={`w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border relative flex items-center justify-center
               ${file.type === 'pdf' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}
            `}>
              {file.type === 'image' ? (
                <>
                  <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover" />
                  {file.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {file.status === 'completed' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </>
              ) : (
                // PDF ICON
                <div className="flex flex-col items-center">
                   {file.status === 'scanning' ? (
                     <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                   ) : (
                     <>
                      <Folder className="w-6 h-6 text-indigo-500 fill-indigo-100" />
                      <span className="text-[9px] font-bold text-indigo-500 mt-0.5">PDF</span>
                     </>
                   )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium truncate ${selectedFileId === file.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                {file.file.name}
              </h3>
              
              {file.type === 'pdf' ? (
                 <div className="flex flex-col gap-0.5 mt-1">
                   {file.status === 'scanning' ? (
                      <span className="text-xs text-indigo-500 italic">Scanning pages...</span>
                   ) : (
                      <span className="text-xs text-slate-500">
                        {file.subItems?.length || 0} charts found
                      </span>
                   )}
                   {/* Progress bar for PDF batch processing */}
                   {file.subItems && file.subItems.some(i => i.status === 'processing') && (
                      <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-pulse w-1/2"></div>
                      </div>
                   )}
                 </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  {file.status === 'idle' || file.status === 'queued' ? (
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">IDLE</span>
                  ) : file.status === 'processing' ? (
                    <span className="text-xs text-indigo-500 font-medium">Processing...</span>
                  ) : file.status === 'completed' ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                       Done
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Error
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Delete Action */}
            <button 
              onClick={(e) => onDeleteFile(file.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-md transition-all absolute top-2 right-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
