import React from 'react';
import { ExtractedTableData } from '../types';

interface GenericDataTableProps {
  data: ExtractedTableData;
}

const GenericDataTable: React.FC<GenericDataTableProps> = ({ data }) => {
  return (
    <div className="overflow-hidden border border-slate-300 rounded-lg h-full flex flex-col bg-white shadow-sm">
      <div className="overflow-auto flex-1 w-full">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              {data.headers.map((header, i) => (
                <th key={i} scope="col" className="px-4 py-3 border-b border-r border-slate-300 font-bold whitespace-nowrap bg-slate-100 last:border-r-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/50 transition-colors even:bg-slate-50/30">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 border-r border-slate-200 text-slate-700 whitespace-nowrap last:border-r-0 font-mono text-xs">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium flex justify-between px-4">
         <span>Spreadsheet View</span>
         <span>{data.rows.length} Rows x {data.headers.length} Columns</span>
      </div>
    </div>
  );
};

export default GenericDataTable;
