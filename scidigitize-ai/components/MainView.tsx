import React, { useState, useEffect } from 'react';
import { FileItem, SubItem } from '../types';
import ChartVisualizer from './ChartVisualizer';
import DataTable from './DataTable';
import GenericDataTable from './GenericDataTable';
import InfographicVisualizer from './InfographicVisualizer';
import PdfDashboard from './PdfDashboard';
import { Download, Sparkles, Maximize2, FileDigit, ArrowLeft, Network, Table, BarChart3 } from 'lucide-react';

interface MainViewProps {
  selectedFile: FileItem | undefined;
  onStartDigitization: () => void;
  onProcessPdfItems: (fileId: string, subItemIds: string[]) => void;
}

const MainView: React.FC<MainViewProps> = ({ selectedFile, onStartDigitization, onProcessPdfItems }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'data' | 'json'>('visual');
  const [viewingSubItem, setViewingSubItem] = useState<SubItem | null>(null);

  useEffect(() => {
    setViewingSubItem(null);
  }, [selectedFile?.id]);

  if (!selectedFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-12 text-center h-full">
        <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
          <FileDigit className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Scientific Data Lab</h2>
        <p className="text-slate-500 max-w-lg mb-10 text-lg leading-relaxed">
          Convert complex scientific plots into reusable CSV data. Optimized for Pharmacokinetics (PK), Log-Log plots, and Multi-subject series.
        </p>

        <button
          onClick={onStartDigitization}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-lg hover:-translate-y-1"
        >
          <Sparkles className="w-5 h-5" />
          Begin New Digitization
        </button>
      </div>
    );
  }

  // --- PDF DASHBOARD MODE ---
  if (selectedFile.type === 'pdf' && !viewingSubItem) {
    return (
      <PdfDashboard
        fileItem={selectedFile}
        onProcessSelected={(ids) => onProcessPdfItems(selectedFile.id, ids)}
        onViewResult={(item) => setViewingSubItem(item)}
      />
    );
  }

  // --- RESULT MODE ---
  const activeResult = viewingSubItem?.result || selectedFile.result;
  const activeStatus = viewingSubItem ? viewingSubItem.status : selectedFile.status;
  const activeName = viewingSubItem ? `Item from ${selectedFile.file.name}` : selectedFile.file.name;
  const activePreview = viewingSubItem ? viewingSubItem.previewUrl : selectedFile.previewUrl;

  const dataType = activeResult?.dataType;

  const handleDownloadCSV = () => {
    if (!activeResult) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeResult.dataType === 'chart') {
      const header = `Series,${activeResult.xAxisLabel},${activeResult.yAxisLabel}\n`;
      const rows = activeResult.dataPoints.map(p => `${p.series || 'Default'},${p.x},${p.y}`).join('\n');
      csvContent += header + rows;
    } else if (activeResult.dataType === 'table') {
      const header = activeResult.headers.join(',') + '\n';
      const rows = activeResult.rows.map(row => row.join(',')).join('\n');
      csvContent += header + rows;
    } else if (activeResult.dataType === 'infographic') {
      // For infographics, download the text summary
      csvContent = "data:text/plain;charset=utf-8,";
      csvContent += `Title: ${activeResult.title}\n`;
      csvContent += `Topic: ${activeResult.topic}\n\n`;
      csvContent += `Key Points:\n${activeResult.keyPoints.map(k => `- ${k}`).join('\n')}\n\n`;
      csvContent += `Description:\n${activeResult.detailedDescription}`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeName}_data.${activeResult.dataType === 'infographic' ? 'txt' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (activeTab === 'json') {
      return (
        <div className="h-full overflow-auto bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs">
          <pre>{JSON.stringify(activeResult, null, 2)}</pre>
        </div>
      );
    }

    if (dataType === 'infographic') {
      // Infographics typically don't have a "Raw Data" tab in the same sense, just the visualizer
      return <InfographicVisualizer data={activeResult as any} />;
    }

    if (dataType === 'table') {
      return <GenericDataTable data={activeResult as any} />;
    }

    // Charts have two tabs
    return activeTab === 'visual' ? (
      <ChartVisualizer data={activeResult as any} />
    ) : (
      <div className="h-full">
        <DataTable
          data={(activeResult as any).dataPoints || (activeResult as any).data_payload}
          xAxisLabel={(activeResult as any).xAxisLabel || 'X'}
          yAxisLabel={(activeResult as any).yAxisLabel || 'Y'}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          {viewingSubItem && (
            <button
              onClick={() => setViewingSubItem(null)}
              className="mr-2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Back to PDF Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 truncate max-w-md">
              {activeName}
            </h2>
            {activeResult && (
              <div className="flex flex-col mt-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                     ${dataType === 'chart' ? 'bg-blue-100 text-blue-700' :
                      dataType === 'r_stat' ? 'bg-red-100 text-red-700' :
                        dataType === 'table' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'}
                   `}>
                    {dataType === 'r_stat' ? 'R-Grade Medical Stats' :
                      dataType === 'complex_table' ? 'Complex Tables' :
                        dataType === 'chart' ? 'Standard Data Viz' :
                          'Infographics'}
                  </span>
                  <span className="text-[10px] text-slate-400">Confidence: {activeResult.confidence}%</span>
                </div>
                {viewingSubItem?.reason && (
                  <span className="text-[10px] text-slate-500 italic mt-0.5">
                    "{viewingSubItem.reason}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeResult && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Download {dataType === 'infographic' ? 'Text' : 'CSV'}
          </button>
        </div>
      )}
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeStatus === 'processing' ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-medium text-slate-800">Digitizing Item...</h3>
            <p className="text-slate-500 mt-2">Gemini 3 Pro Vision is analyzing structure and data.</p>
          </div>
        ) : activeResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
            {/* Left Col: Original Image */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original Source</span>
                <button className="text-slate-400 hover:text-slate-600"><Maximize2 className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center bg-slate-100/50">
                <img
                  src={activePreview}
                  alt="Original"
                  className="max-w-full max-h-[500px] object-contain shadow-lg rounded-lg"
                />
              </div>
              {viewingSubItem && viewingSubItem.context && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-600 border-l-4 border-indigo-500 max-h-32 overflow-y-auto">
                  <span className="font-semibold text-slate-700 block mb-1">Context:</span>
                  {viewingSubItem.context}
                </div>
              )}
            </div>

            {/* Right Col: Extracted Data */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50">
                {dataType === 'chart' || dataType === 'r_stat' ? (
                  <>
                    <button
                      onClick={() => setActiveTab('visual')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'visual' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      Reconstructed Chart
                    </button>
                    <button
                      onClick={() => setActiveTab('data')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      Data Points
                    </button>
                    <button
                      onClick={() => setActiveTab('json')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'json' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                      JSON Config
                    </button>
                  </>
                ) : dataType === 'table' ? (
                  <button className="px-6 py-3 text-sm font-medium border-b-2 border-orange-600 text-orange-700 bg-white flex items-center gap-2">
                    <Table className="w-4 h-4" /> Extracted Grid
                  </button>
                ) : (
                  <button className="px-6 py-3 text-sm font-medium border-b-2 border-purple-600 text-purple-700 bg-white flex items-center gap-2">
                    <Network className="w-4 h-4" /> Infographic Analysis
                  </button>
                )}
              </div>

              <div className="flex-1 p-6 min-h-[400px]">
                {renderContent()}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p>Waiting to process...</p>
          </div>
        )}
      </div>
    </div >
  );
};

export default MainView;
