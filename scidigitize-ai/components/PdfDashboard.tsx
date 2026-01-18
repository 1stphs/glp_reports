import React, { useState, useMemo } from 'react';
import { FileItem, SubItem } from '../types';
import { CheckCircle2, Loader2, Play, AlertCircle, Eye, FileText, CheckSquare, Square, Table, BarChart3, Network, Image as ImageIcon } from 'lucide-react';

interface PdfDashboardProps {
  fileItem: FileItem;
  onProcessSelected: (subItemIds: string[]) => void;
  onViewResult: (subItem: SubItem) => void;
}

const PdfDashboard: React.FC<PdfDashboardProps> = ({ fileItem, onProcessSelected, onViewResult }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const subItems = fileItem.subItems || [];

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === subItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subItems.map(i => i.id)));
    }
  };

  const handleProcessClick = () => {
    onProcessSelected(Array.from(selectedIds));
    setSelectedIds(new Set()); // Clear selection after starting
  };

  const stats = useMemo(() => {
    return {
      total: subItems.length,
      charts: subItems.filter(i => i.type === 'chart').length,
      tables: subItems.filter(i => i.type === 'table').length,
      infographics: subItems.filter(i => i.type === 'infographic').length,
      completed: subItems.filter(i => i.status === 'completed').length,
    };
  }, [subItems]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 className="w-3 h-3" />;
      case 'table': return <Table className="w-3 h-3" />;
      case 'infographic': return <Network className="w-3 h-3" />;
      default: return <ImageIcon className="w-3 h-3" />;
    }
  };

  if (fileItem.status === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-800">Scanning PDF Document...</h3>
        <p className="max-w-md text-center mt-2">
          AI is analyzing every page to extract context and identify visual elements.
        </p>
      </div>
    );
  }

  if (subItems.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-800">No Items Detected</h3>
        <p className="max-w-md text-center mt-2">
          We couldn't find any clear visual elements in this document.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{fileItem.file.name}</h2>
            {fileItem.globalContext && (
               <p className="text-xs text-slate-400 mt-1 max-w-xl truncate" title={fileItem.globalContext}>
                 Context: {fileItem.globalContext.substring(0, 150)}...
               </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                <BarChart3 className="w-3.5 h-3.5" /> {stats.charts} Charts
              </span>
              <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-100">
                <Table className="w-3.5 h-3.5" /> {stats.tables} Tables
              </span>
              <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-100">
                <Network className="w-3.5 h-3.5" /> {stats.infographics} Info
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button 
              onClick={toggleAll}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            >
              {selectedIds.size === subItems.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {selectedIds.size === subItems.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              onClick={handleProcessClick}
              disabled={selectedIds.size === 0}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Digitize Selected ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subItems.map(item => {
            const isSelected = selectedIds.has(item.id);
            const isDone = item.status === 'completed';
            const isProcessing = item.status === 'processing';
            
            return (
              <div 
                key={item.id} 
                onClick={() => !isProcessing && item.status !== 'completed' && toggleSelection(item.id)}
                className={`
                  relative bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col group
                  ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md' : 'border-slate-200 hover:border-indigo-300 hover:shadow-sm'}
                  ${isDone ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {/* Image Area */}
                <div className="h-48 bg-slate-100 relative border-b border-slate-100">
                  <img src={item.previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                  
                  {/* Type Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-white text-[10px] font-bold uppercase backdrop-blur-sm flex items-center gap-1 shadow-sm
                    ${item.type === 'chart' ? 'bg-blue-600/90' : item.type === 'table' ? 'bg-orange-600/90' : 'bg-purple-600/90'}
                  `}>
                    {getTypeIcon(item.type)}
                    {item.type.toUpperCase()}
                  </div>
                  
                  {/* Page Badge */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/40 text-white text-[10px] backdrop-blur-sm">
                    Pg {item.pageNumber}
                  </div>

                  {/* Status Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center flex-col gap-2">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <span className="text-xs font-semibold text-indigo-600">AI Digitizing...</span>
                    </div>
                  )}
                  {isDone && (
                    <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onViewResult(item); }}
                        className="bg-white text-green-700 px-4 py-2 rounded-full font-medium shadow-sm border border-green-200 flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <Eye className="w-4 h-4" /> View Results
                      </button>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
                      <span className="text-red-500 flex items-center gap-1 font-medium"><AlertCircle className="w-4 h-4" /> Failed</span>
                    </div>
                  )}

                  {/* Selection Checkbox (only if not done) */}
                  {!isDone && !isProcessing && (
                    <div className="absolute bottom-3 right-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Local Context (Page {item.pageNumber})</h4>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed" title={item.context}>
                      {/* Only show the caption part in the card preview to avoid wall of text */}
                      {item.context.split('[FULL PAGE TEXT]')[0].replace('[CAPTION]:', '') || "Context available"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PdfDashboard;
