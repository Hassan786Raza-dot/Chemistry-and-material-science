
import React from 'react';
import type { GeneratedData } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import KineticsChart from './KineticsChart';
import { BeakerIcon } from './icons/BeakerIcon';

interface ResultsDisplayProps {
  data: GeneratedData | null;
  isLoading: boolean;
  error: string | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isLoading, error }) => {
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
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Kinetic Summary</h3>
            <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-md border border-slate-700">{data.summary}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">Monomer Conversion vs. Time</h3>
            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700 h-96">
                <KineticsChart data={data.kineticData} />
            </div>
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
      {renderContent()}
    </div>
  );
};

export default ResultsDisplay;
