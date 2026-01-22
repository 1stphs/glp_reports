import React, { useState } from 'react';
import { ExtractedRStatData } from '../types';
import { FileCode, Database, Palette, Layout, Play, Loader2, Download, AlertCircle } from 'lucide-react';

interface RChartRendererProps {
    data: ExtractedRStatData;
}

const RChartRenderer: React.FC<RChartRendererProps> = ({ data }) => {
    const { chartType, style_config, data_payload } = data;
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateChart = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Map chart type to endpoint
            // Currently only survival is fully implemented in the backend, but we route others there or specific ones
            const endpoint = chartType === 'survival' ? 'survival' : chartType;

            const response = await fetch(`http://localhost:8000/render/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Map frontend 'chartType' to backend 'chart_type' expectation
                body: JSON.stringify({
                    ...data,
                    chart_type: data.chartType
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`R Backend Error: ${response.status} ${errText}`);
            }

            // Convert Blob to URL
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to connect to R Workbench');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <Layout className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 capitalize">{chartType.replace('_', ' ')} Chart</h3>
                        <p className="text-xs text-slate-500">R-Grade Specification</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded border border-slate-200">
                        theme: {style_config?.journal_theme || 'N/A'}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {/* Main Render Preview - Full Width */}
                <div className="w-full bg-slate-100 rounded-xl border border-slate-200 border-dashed p-2 flex flex-col relative min-h-[600px]">
                    {imageUrl ? (
                        <div className="relative w-full h-full flex flex-col">
                            <img src={imageUrl} className="flex-1 object-contain bg-white rounded-lg shadow-sm w-full h-full" alt="R Generated Plot" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <a href={imageUrl} download={`r_plot_${chartType}.png`} className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 backdrop-blur-sm transition-colors">
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            {error ? (
                                <div className="text-center max-w-md">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-slate-800 font-bold mb-2">Rendering Error</h3>
                                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                                    <p className="text-xs text-slate-400 font-mono bg-slate-200 p-2 rounded">Check terminal where 'R -e ...' is running</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 transform rotate-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/R_logo.svg/724px-R_logo.svg.png" className="w-12 h-10 opacity-80" alt="R Logo" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700">Ready to Render</h3>
                                    <p className="text-slate-500 max-w-sm mt-2 mb-8">
                                        High-fidelity vector reconstruction using local R engine (ggplot2 + survminer).
                                    </p>
                                    <button
                                        onClick={handleGenerateChart}
                                        disabled={isLoading}
                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-1 flex items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />}
                                        {isLoading ? 'Processing in R...' : 'Generate High-Fidelity Chart'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>

    );
};

export default RChartRenderer;
