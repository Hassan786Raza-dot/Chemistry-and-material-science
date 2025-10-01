import React from 'react';
import type { KineticPoint } from '../types';

interface DataTableProps {
  data: KineticPoint[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const monomerKeys = Object.keys(data[0].conversion ?? {}).filter(k => k !== 'overall');

    const headers = [
        "Time (min)",
        ...monomerKeys.map(name => `${name} Conv. (%)`),
        "Overall Conv. (%)",
        "Mn (g/mol)",
        "Dispersity (Đ)"
    ];

    return (
        <div className="w-full max-h-96 overflow-auto bg-slate-800/50 border border-slate-700 rounded-lg shadow-md">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-300 uppercase bg-slate-700/50 sticky top-0">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-4 py-3 whitespace-nowrap">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((point, index) => {
                        const mn = point.molecularWeightMn;
                        const mw = point.molecularWeightMw;
                        const dispersity = mn != null && mn > 0 && mw != null
                            ? (mw / mn).toFixed(2)
                            : (1.0).toFixed(2);

                        return (
                            <tr key={point.time ?? index} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                                <td className="px-4 py-2 font-medium">{point.time?.toFixed(0) ?? 'N/A'}</td>
                                {monomerKeys.map(key => (
                                   <td key={key} className="px-4 py-2">{point.conversion?.[key]?.toFixed(2) ?? 'N/A'}</td>
                                ))}
                                <td className="px-4 py-2 font-semibold text-cyan-300">{point.conversion?.overall?.toFixed(2) ?? 'N/A'}</td>
                                <td className="px-4 py-2">{mn?.toLocaleString() ?? 'N/A'}</td>
                                <td className="px-4 py-2">{dispersity}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;