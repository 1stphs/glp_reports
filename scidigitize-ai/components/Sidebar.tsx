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
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  // Only count single images in the "queue", PDFs have their own internal state
  const queueCount = files.filter(f => f.type === 'image' && (f.status === 'queued' || f.status === 'idle')).length;
  // ...

  return (
    <div
      className={`w-80 border-r border-slate-200 flex flex-col h-full shadow-sm z-10 relative transition-colors ${isDragging ? 'bg-indigo-50 border-indigo-300' : 'bg-white'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-100/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-2 border-indigo-400 border-dashed m-2 rounded-xl">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Upload className="w-8 h-8 text-indigo-600 animate-bounce" />
          </div>
          <h3 className="text-lg font-bold text-indigo-700">Drop Files Here</h3>
          <p className="text-sm text-indigo-500">Documents or Images</p>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        {/* ... (rest of header) */}
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
        {/* ... (buttons remain same) */}
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
          accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
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
        {/* ... */}
        <div className="flex border-b border-slate-200">
          <div className="px-4 py-2 text-xs font-semibold text-indigo-600 border-b-2 border-indigo-600 cursor-pointer">
            FILES ({files.length})
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* ... (list content) */}
        {files.length === 0 && !isScanning && (
          <div className="text-center py-10 px-4">
            <p className="text-sm text-slate-400">Drag & Drop PDFs or use Upload button</p>
          </div>
        )}

        {/* ... (rest of list) */}
        {/* I will assume the rest is same, focusing on the replace of keys */}
        {/* To make it robust I should return the whole block since I am replacing logic flow */}
        {itemsList(files, onSelectFile, selectedFileId, isScanning, onDeleteFile)}
      </div>
    </div>
  );
};

// Helper to keep the replacement clean (inlining it in reality)
const itemsList = (files: any[], onSelectFile: any, selectedFileId: any, isScanning: any, onDeleteFile: any) => {
  // ... just mapping ...
  // To simplify: I will just use the provided context to replace the relevant top parts
  // and assume the user's tool can match context.
  // The instructions say "Complete replacement of the component body" is safer given the wrap.
  return (
    files.map((file) => (
      <div
        key={file.id}
        onClick={() => onSelectFile(file.id)}
        className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md
              ${selectedFileId === file.id
            ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
            : 'bg-white border-slate-100 hover:border-indigo-100'}`}
      >
        <div className={`w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border relative flex items-center justify-center
               ${file.type === 'pdf' || file.type === 'document' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}
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
            <div className="flex flex-col items-center">
              {file.status === 'scanning' ? (
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              ) : (
                <>
                  <Folder className="w-6 h-6 text-indigo-500 fill-indigo-100" />
                  <span className="text-[9px] font-bold text-indigo-500 mt-0.5">DOC</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium truncate ${selectedFileId === file.id ? 'text-indigo-900' : 'text-slate-700'}`}>
            {file.file.name}
          </h3>

          {file.type === 'pdf' || file.type === 'document' ? (
            <div className="flex flex-col gap-0.5 mt-1">
              {file.mineruStatus === 'uploading' ? (
                <span className="text-xs text-blue-500 animate-pulse flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Uploading...
                </span>
              ) : file.mineruStatus === 'processing' || file.status === 'scanning' ? (
                <span className="text-xs text-purple-500 animate-pulse flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Deep Analysis (~2-5m)...
                </span>
              ) : file.mineruStatus === 'error' ? (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {file.errorMessage || "Parsing Failed"}
                </span>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {file.subItems?.length || 0} charts found
                </span>
              )}
              {file.subItems && file.subItems.some((i: any) => i.status === 'processing') && (
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

        <button
          onClick={(e) => onDeleteFile(file.id, e)}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-md transition-all absolute top-2 right-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    ))
  );
};


export default Sidebar;
