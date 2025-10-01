
import React from 'react';
import type { GeneratedData, KineticPoint } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import KineticsChart from './KineticsChart';
import { BeakerIcon } from './icons/BeakerIcon';
import DataTable from './DataTable';
import { FileTextIcon } from './icons/FileTextIcon';

interface ResultsDisplayProps {
  data: GeneratedData | null;
  isLoading: boolean;
  error: string | null;
}

const ExportButton: React.FC<{ onClick: () => void; children: React.ReactNode; ariaLabel: string }> = ({ onClick, children, ariaLabel }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
    >
        {children}
    </button>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isLoading, error }) => {

  const handleExportCSV = () => {
    if (!data?.kineticData || data.kineticData.length === 0) return;
    
    const kineticData = data.kineticData;
    const monomerKeys = Object.keys(kineticData[0].conversion ?? {}).filter(k => k !== 'overall');
    
    const headers = [
      "Time (min)",
      ...monomerKeys.map(name => `${name} Conv. (%)`),
      "Overall Conv. (%)",
      "Mn (g/mol)",
      "Mw (g/mol)",
      "Dispersity (Đ)"
    ];
    const csvRows = [headers.join(',')];

    for (const point of kineticData) {
        const mn = point.molecularWeightMn;
        const mw = point.molecularWeightMw;
        const dispersity = mn != null && mn > 0 && mw != null ? (mw / mn) : 1;
        const values = [
            point.time?.toFixed(0) ?? '',
            ...monomerKeys.map(key => point.conversion?.[key]?.toFixed(2) ?? ''),
            point.conversion?.overall?.toFixed(2) ?? '',
            mn?.toLocaleString('en-US', {useGrouping: false}) ?? '',
            mw?.toLocaleString('en-US', {useGrouping: false}) ?? '',
            dispersity.toFixed(2)
        ];
        csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polymer-kinetics-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <LoaderIcon className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
          <p className="text-xl font-medium text-slate-300">Generating Simulation...</p>
          <p className="text-slate-400">This may take a moment. The model is processing your request.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 border border-red-500/50 p-6 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
          <p className="text-red-400 max-w-md">{error}</p>
        </div>
      );
    }

    if (data) {
      const showRatios = data.inputs.monomers.length === 2 && data.inputs.reactivityRatios;
      const showCTA = data.inputs.chainTransferAgent && data.inputs.ctaConcentration;
      const showSolvent = data.inputs.solvent && data.inputs.solventVolume;

      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Kinetic Summary</h3>
            <div className="space-y-2 mb-4">
              {showRatios && (
                  <div className="text-xs text-slate-400 p-3 bg-slate-800/50 rounded-md border border-slate-700 flex items-center gap-4 flex-wrap">
                      <strong>Input Ratios:</strong>
                      <span>r1 ({data.inputs.monomers[0].name}): <strong>{data.inputs.reactivityRatios?.r1}</strong></span>
                      <span>r2 ({data.inputs.monomers[1].name}): <strong>{data.inputs.reactivityRatios?.r2}</strong></span>
                  </div>
              )}
              {showCTA && (
                  <div className="text-xs text-slate-400 p-3 bg-slate-800/50 rounded-md border border-slate-700 flex items-center gap-4 flex-wrap">
                      <strong>Input CTA:</strong>
                      <span>Agent: <strong>{data.inputs.chainTransferAgent}</strong></span>
                      <span>Concentration: <strong>{data.inputs.ctaConcentration} mol/L</strong></span>
                  </div>
              )}
               {showSolvent && (
                  <div className="text-xs text-slate-400 p-3 bg-slate-800/50 rounded-md border border-slate-700 flex items-center gap-4 flex-wrap">
                      <strong>Solvent System:</strong>
                      <span>Solvent: <strong>{data.inputs.solvent}</strong></span>
                      <span>Volume: <strong>{data.inputs.solventVolume} mL</strong></span>
                  </div>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-md border border-slate-700">{data.summary}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl font-bold text-white">Kinetics Profile</h3>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700 h-96">
                <KineticsChart data={data.kineticData} />
            </div>
          </div>
           <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl font-bold text-white">Simulation Data Table</h3>
                <ExportButton onClick={handleExportCSV} ariaLabel="Export table as CSV">
                    <FileTextIcon className="w-4 h-4" /> CSV
                </ExportButton>
            </div>
            <DataTable data={data.kineticData} />
          </div>
          {data.sources && data.sources.length > 0 && (
             <div>
                <h3 className="text-2xl font-bold text-white mb-3">Data Sources (from Google Search)</h3>
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                    <ul className="space-y-2">
                        {data.sources.map((source, index) => (
                            <li key={index} className="truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors text-sm">
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
        <BeakerIcon className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-300">Awaiting Simulation</h3>
        <p>Your generated kinetic data will appear here.</p>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg min-h-[600px] border border-slate-700 flex justify-center items-center">
       <div className="w-full h-full">
         {renderContent()}
       </div>
    </div>
  );
};

export default ResultsDisplay;