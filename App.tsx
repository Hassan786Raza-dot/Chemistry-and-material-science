
import React, { useState } from 'react';
import KineticsForm from './components/KineticsForm';
import ResultsDisplay from './components/ResultsDisplay';
import { BeakerIcon } from './components/icons/BeakerIcon';
import { generateKineticsData } from './services/geminiService';
import { INITIAL_FORM_DATA } from './constants';
import type { FormData, GeneratedData } from './types';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
      const data = await generateKineticsData(formData);
      setGeneratedData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to generate data: ${err.message}. Please check your inputs and try again.`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-2">
            <BeakerIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Polymer Reaction Kinetics Simulator
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Enter reaction parameters to generate a simulated kinetic profile using Gemini, grounded with Google Search for enhanced accuracy.
          </p>
        </header>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <KineticsForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <ResultsDisplay
              data={generatedData}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        <footer className="text-center mt-12 text-slate-500 text-sm">
           <p>Disclaimer: This tool provides simulated data for educational and research purposes. Always verify results with experimental data.</p>
           <p>&copy; {new Date().getFullYear()} Gemini AI Solutions. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
