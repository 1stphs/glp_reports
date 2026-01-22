import React from 'react';
import { DataPoint } from '../types';

interface DataTableProps {
  data: DataPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, xAxisLabel, yAxisLabel }) => {
  if (!data) return null;
  return (
    <div className="overflow-hidden border border-slate-200 rounded-lg">
      <div className="overflow-y-auto max-h-[700px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 border-b border-slate-200">
                Series Label
              </th>
              <th scope="col" className="px-6 py-3 border-b border-slate-200">
                {xAxisLabel || 'X Value'}
              </th>
              <th scope="col" className="px-6 py-3 border-b border-slate-200">
                {yAxisLabel || 'Y Value'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data.map((point, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                  {point.series || 'Series 1'}
                </td>
                <td className="px-6 py-2.5 text-slate-600">
                  {point.x}
                </td>
                <td className="px-6 py-2.5 font-mono text-slate-600">
                  {point.y}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
