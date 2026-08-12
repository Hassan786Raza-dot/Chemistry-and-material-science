import React, { useCallback, useState } from 'react';
import KineticsForm from './components/KineticsForm';
import ResultsDisplay from './components/ResultsDisplay';
import MeasuredDataPanel from './components/MeasuredDataPanel';
import { INITIAL_FORM_DATA } from './constants';
import { simulateFreeRadicalScreening } from './services/kineticsModel';
import { lookupChemical } from './services/pubchemService';
import { searchLiterature } from './services/literatureService';
import { validateFormData } from './services/validation';
import type { FormData, GeneratedData, ValidationResult } from './types';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [data, setData] = useState<GeneratedData | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [], warnings: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (event?: React.FormEvent, selectedData: FormData = formData) => {
    event?.preventDefault();
    const result = validateFormData(selectedData);
    setValidation(result);
    if (!result.valid) return;
    setIsLoading(true); setError(null); setData(null);
    try {
      const local = simulateFreeRadicalScreening(selectedData);
      const [chemicalRecords, literature] = await Promise.all([
        Promise.all(selectedData.monomers.map((monomer) => lookupChemical(monomer.name))),
        searchLiterature(`${selectedData.reactionType} ${selectedData.monomers.map((monomer) => monomer.name).join(' ')}`),
      ]);
      const literatureSources = literature.records.map((record) => record.source);
      setData({ ...local, chemicalRecords, sources: [...local.sources, ...chemicalRecords.map((record) => record.source), ...literatureSources] });
      if (literature.warning) setValidation((current) => ({ ...current, warnings: [...current.warnings, literature.warning as string] }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The workflow failed unexpectedly. The local model can still be run offline if the integration step is disabled.');
    } finally { setIsLoading(false); }
  }, [formData]);

  const runDemo = () => { setFormData(INITIAL_FORM_DATA); void run(undefined, INITIAL_FORM_DATA); };
  return <div className="min-h-screen bg-[#07111f] text-slate-100"><header className="border-b border-slate-800/80 bg-[#07111f]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Research workbench</p><h1 className="text-xl font-bold text-white md:text-2xl">Polymer Kinetics Atlas</h1></div><button type="button" onClick={runDemo} className="rounded-lg border border-cyan-400/40 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10">Run demo</button></div></header><main className="mx-auto max-w-7xl px-4 py-8 md:px-8"><section className="mb-8 max-w-4xl"><div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-300">Evidence-aware · offline-safe · researcher focused</div><h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">Understand the curve before you trust it.</h2><p className="mt-4 max-w-3xl text-base leading-7 text-slate-400 md:text-lg">A transparent screening workspace for polymerization kinetics. Run a bounded local model, optionally enrich compound names with PubChem and literature metadata with Crossref, and inspect every assumption before using any result in research.</p></section><div className="grid gap-6 xl:grid-cols-[390px_1fr]"><KineticsForm formData={formData} setFormData={setFormData} onSubmit={run} isLoading={isLoading} onValidation={setValidation} /><ResultsDisplay data={data} isLoading={isLoading} error={error} /></div><div className="mt-6"><MeasuredDataPanel onFit={() => undefined} /></div><section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"><h3 className="font-bold text-white">Deterministic first</h3><p className="mt-1 text-sm text-slate-400">The screening curve is generated locally with documented equations and no hidden model call.</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"><h3 className="font-bold text-white">Sources stay visible</h3><p className="mt-1 text-sm text-slate-400">Live chemical and literature metadata is linked, timestamped, and allowed to fail without inventing facts.</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"><h3 className="font-bold text-white">Not evidence by default</h3><p className="mt-1 text-sm text-slate-400">All model outputs are labeled exploratory until fitted and validated against independent experimental data.</p></div></section></main><footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 md:px-8">For research planning and transparent screening only. Validate chemistry, measurements, uncertainty, safety, and regulatory context independently before publication or lab use.</footer></div>;
};
export default App;
;