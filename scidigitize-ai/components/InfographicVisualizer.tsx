import React from 'react';
import { ExtractedInfographicData } from '../types';
import { Network, List, FileText } from 'lucide-react';

interface InfographicVisualizerProps {
  data: ExtractedInfographicData;
}

const InfographicVisualizer: React.FC<InfographicVisualizerProps> = ({ data }) => {
  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2">
      
      {/* Header Info */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Network className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 text-lg">{data.topic}</h3>
            <p className="text-purple-700 text-sm mt-1">{data.title}</p>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div>
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <List className="w-4 h-4" /> Key Takeaways
        </h4>
        <div className="grid gap-3">
          {data.keyPoints.map((point, i) => (
            <div key={i} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Description */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Mechanism Description
        </h4>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm prose prose-sm max-w-none text-slate-600">
           <div className="whitespace-pre-wrap leading-7">
             {data.detailedDescription}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InfographicVisualizer;
