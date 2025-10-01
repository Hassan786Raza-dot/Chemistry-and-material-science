import React, { useState, useEffect } from 'react';
import type { FormData, RecipeSuggestion } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AlertCircleIcon } from './icons/AlertCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { REACTION_TYPES } from '../constants';
import Modal from './Modal';
import { getAIRecommendation } from '../services/geminiService';

interface KineticsFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

type FormErrors = {
    monomers?: { id: string; name?: string; concentration?: string }[];
    initiator?: string;
    initiatorConcentration?: string;
    temperature?: string;
    reactivityRatios?: { r1?: string; r2?: string };
    chainTransferAgent?: string;
    ctaConcentration?: string;
    solvent?: string;
    solventVolume?: string;
};

const InputField: React.FC<{
  label: string;
  id: keyof Omit<FormData, 'monomers' | 'reactivityRatios'>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  error?: string;
  placeholder?: string;
  title?: string;
}> = ({ label, id, value, onChange, unit, error, placeholder, title }) => (
  <div title={title}>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-700 border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 transition ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {unit && <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm pointer-events-none">{unit}</span>}
    </div>
    {error && (
        <p id={`${id}-error`} className="flex items-center mt-1 text-sm text-red-400">
            <AlertCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            {error}
        </p>
    )}
  </div>
);


const KineticsForm: React.FC<KineticsFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string | RecipeSuggestion | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const validate = () => {
        const newErrors: FormErrors = {};

        // Monomers
        const monomerErrors: { id: string; name?: string; concentration?: string }[] = [];
        formData.monomers.forEach(m => {
            const currentMonomerErrors: { id: string; name?: string; concentration?: string } = { id: m.id };
            if (!m.name.trim()) currentMonomerErrors.name = 'Monomer name is required.';
            if (!m.concentration.trim()) currentMonomerErrors.concentration = 'Concentration is required.';
            else if (isNaN(Number(m.concentration)) || Number(m.concentration) <= 0) currentMonomerErrors.concentration = 'Concentration must be a positive number.';
            if (Object.keys(currentMonomerErrors).length > 1) monomerErrors.push(currentMonomerErrors);
        });
        if (monomerErrors.length > 0) newErrors.monomers = monomerErrors;

        // Initiator
        if (!formData.initiator.trim()) newErrors.initiator = 'Initiator/Catalyst name is required.';
        if (!formData.initiatorConcentration.trim()) newErrors.initiatorConcentration = 'Concentration is required.';
        else if (isNaN(Number(formData.initiatorConcentration)) || Number(formData.initiatorConcentration) <= 0) newErrors.initiatorConcentration = 'Concentration must be a positive number.';

        // Temperature
        if (!formData.temperature.trim()) newErrors.temperature = 'Temperature is required.';
        else if (isNaN(Number(formData.temperature))) newErrors.temperature = 'Must be a valid number.';

        // Reactivity Ratios
        if (formData.monomers.length === 2 && formData.reactivityRatios) {
            const ratioErrors: { r1?: string; r2?: string } = {};
            if (formData.reactivityRatios.r1 && (isNaN(Number(formData.reactivityRatios.r1)) || Number(formData.reactivityRatios.r1) < 0)) ratioErrors.r1 = 'Must be a non-negative number.';
            if (formData.reactivityRatios.r2 && (isNaN(Number(formData.reactivityRatios.r2)) || Number(formData.reactivityRatios.r2) < 0)) ratioErrors.r2 = 'Must be a non-negative number.';
            if (Object.keys(ratioErrors).length > 0) newErrors.reactivityRatios = ratioErrors;
        }
        
        // Chain Transfer Agent
        const hasCtaName = formData.chainTransferAgent && formData.chainTransferAgent.trim();
        const hasCtaConc = formData.ctaConcentration && formData.ctaConcentration.trim();
        if (hasCtaName && !hasCtaConc) newErrors.ctaConcentration = 'Concentration is required if agent is named.';
        else if (hasCtaConc) {
            if (!hasCtaName) newErrors.chainTransferAgent = 'Agent name is required if concentration is set.';
            if (isNaN(Number(formData.ctaConcentration)) || Number(formData.ctaConcentration) < 0) newErrors.ctaConcentration = 'Concentration must be a non-negative number.';
        }

        // Solvent
        const hasSolvent = formData.solvent && formData.solvent.trim();
        const hasVolume = formData.solventVolume && formData.solventVolume.trim();
        if (hasSolvent && !hasVolume) newErrors.solventVolume = 'Volume is required if solvent is named.';
        else if (hasVolume) {
          if (!hasSolvent) newErrors.solvent = 'Solvent name is required if volume is set.';
          if (isNaN(Number(formData.solventVolume)) || Number(formData.solventVolume) <= 0) newErrors.solventVolume = 'Volume must be a positive number.';
        }

        setErrors(newErrors);
    };
    validate();
  }, [formData]);

  const isFormValid = Object.keys(errors).length === 0;
  const selectedReactionType = REACTION_TYPES.find(rt => rt.name === formData.reactionType);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMonomerChange = (id: string, field: 'name' | 'concentration', value: string) => {
    setFormData(prev => ({
      ...prev,
      monomers: prev.monomers.map(monomer => 
        monomer.id === id ? { ...monomer, [field]: value } : monomer
      )
    }));
  };
  
  const handleReactivityRatioChange = (field: 'r1' | 'r2', value: string) => {
      setFormData(prev => ({
          ...prev,
          reactivityRatios: { ...prev.reactivityRatios, [field]: value } as { r1: string; r2: string },
      }));
  };

  const addMonomer = () => {
    setFormData(prev => ({
      ...prev,
      monomers: [...prev.monomers, { id: `monomer_${Date.now()}`, name: '', concentration: '1.0' }]
    }));
  };

  const removeMonomer = (id: string) => {
    if (formData.monomers.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      monomers: prev.monomers.filter(m => m.id !== id)
    }));
  };
  
  const getMonomerError = (id: string, field: 'name' | 'concentration') => {
    return errors.monomers?.find(e => e.id === id)?.[field];
  };

  const handleGetRecommendation = async (type: 'initiator' | 'recipe') => {
    setIsAiLoading(true);
    setModalTitle(type === 'initiator' ? 'AI Initiator Suggestions' : 'AI Recipe Suggestion');
    setModalContent(null);
    setIsModalOpen(true);
    try {
        const recommendation = await getAIRecommendation(formData, type);
        setModalContent(recommendation);
    } catch (err) {
        setModalContent(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred.');
    } finally {
        setIsAiLoading(false);
    }
  };
  
  const handleApplyRecipe = (recipe: RecipeSuggestion) => {
    setFormData(prev => {
        // Create a map for efficient lookup of suggested concentrations
        const concentrationMap = new Map(
            recipe.monomerConcentrations.map(m => [m.name.toLowerCase(), m.concentration])
        );

        // Update existing monomers with new concentrations if a match is found
        const newMonomers = prev.monomers.map(currentMonomer => {
            const newConcentration = concentrationMap.get(currentMonomer.name.toLowerCase());
            return newConcentration !== undefined
                ? { ...currentMonomer, concentration: newConcentration }
                : currentMonomer;
        });

        return {
            ...prev,
            monomers: newMonomers,
            initiator: recipe.initiator,
            initiatorConcentration: recipe.initiatorConcentration,
            temperature: recipe.temperature,
            chainTransferAgent: recipe.chainTransferAgent ?? '',
            ctaConcentration: recipe.ctaConcentration ?? '',
            solvent: recipe.solvent ?? '',
            solventVolume: recipe.solventVolume ?? '',
        };
    });
    setIsModalOpen(false);
  };

  return (
    <>
    <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalTitle}
        isLoading={isAiLoading}
        onApplyRecipe={typeof modalContent === 'object' && modalContent !== null ? handleApplyRecipe : undefined}
    >
        {modalContent}
    </Modal>
    <form onSubmit={onSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-4 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-2">Reaction Parameters</h2>
      
      {/* MONOMERS */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">Monomers</label>
        {formData.monomers.map((monomer) => (
          <div key={monomer.id} className="p-3 bg-slate-700/50 rounded-md">
            <div className="flex items-start gap-2">
              <div className="flex-grow" title="Name of the monomer (e.g., Styrene)"><input type="text" id={`monomer_name_${monomer.id}`} placeholder="Styrene" value={monomer.name} onChange={(e) => handleMonomerChange(monomer.id, 'name', e.target.value)} className={`w-full bg-slate-700 border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 transition ${getMonomerError(monomer.id, 'name') ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`} required aria-invalid={!!getMonomerError(monomer.id, 'name')} aria-describedby={getMonomerError(monomer.id, 'name') ? `monomer_name_${monomer.id}-error` : undefined}/></div>
              <div className="w-28 flex-shrink-0" title="Initial concentration of the monomer in mol/L"><div className="relative"><input type="text" id={`monomer_conc_${monomer.id}`} placeholder="1.0" value={monomer.concentration} onChange={(e) => handleMonomerChange(monomer.id, 'concentration', e.target.value)} className={`w-full bg-slate-700 border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 transition ${getMonomerError(monomer.id, 'concentration') ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`} required aria-invalid={!!getMonomerError(monomer.id, 'concentration')} aria-describedby={getMonomerError(monomer.id, 'concentration') ? `monomer_conc_${monomer.id}-error` : undefined}/><span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-xs pointer-events-none">mol/L</span></div></div>
              <div className="pt-1.5"><button type="button" onClick={() => removeMonomer(monomer.id)} disabled={formData.monomers.length <= 1} className="p-1 text-slate-400 hover:text-red-400 disabled:text-slate-600 disabled:cursor-not-allowed transition" aria-label="Remove Monomer" title="Remove this monomer"><TrashIcon className="w-5 h-5" /></button></div>
            </div>
            {getMonomerError(monomer.id, 'name') && <p id={`monomer_name_${monomer.id}-error`} className="mt-1 text-xs text-red-400 flex items-center"><AlertCircleIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />{getMonomerError(monomer.id, 'name')}</p>}
            {getMonomerError(monomer.id, 'concentration') && <p id={`monomer_conc_${monomer.id}-error`} className="mt-1 text-xs text-red-400 flex items-center"><AlertCircleIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />{getMonomerError(monomer.id, 'concentration')}</p>}
          </div>
        ))}
        <button type="button" onClick={addMonomer} className="w-full text-sm bg-slate-700 text-cyan-300 font-semibold py-2 px-4 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition">+ Add Monomer</button>
      </div>

      {/* REACTIVITY RATIOS */}
      {formData.monomers.length === 2 && (
          <><hr className="border-slate-700" /><div className="space-y-3 p-3 bg-slate-700/30 rounded-md"><h3 className="text-sm font-medium text-slate-300">Reactivity Ratios (for Copolymerization)</h3><div className="grid grid-cols-2 gap-4"><div title="Ratio of rate constant of monomer 1 reacting with itself vs. reacting with monomer 2"><label htmlFor="r1" className="block text-xs text-slate-400 mb-1 truncate">r1 ({formData.monomers[0]?.name || 'Monomer 1'})</label><input type="text" id="r1" value={formData.reactivityRatios?.r1 || ''} onChange={(e) => handleReactivityRatioChange('r1', e.target.value)} placeholder="e.g., 0.52" className={`w-full bg-slate-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 transition ${errors.reactivityRatios?.r1 ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`} aria-invalid={!!errors.reactivityRatios?.r1} aria-describedby={errors.reactivityRatios?.r1 ? 'r1-error' : undefined}/>{errors.reactivityRatios?.r1 && <p id="r1-error" className="mt-1 text-xs text-red-400 flex items-center"><AlertCircleIcon className="w-3.5 h-3.5 mr-1"/>{errors.reactivityRatios.r1}</p>}</div><div title="Ratio of rate constant of monomer 2 reacting with itself vs. reacting with monomer 1"><label htmlFor="r2" className="block text-xs text-slate-400 mb-1 truncate">r2 ({formData.monomers[1]?.name || 'Monomer 2'})</label><input type="text" id="r2" value={formData.reactivityRatios?.r2 || ''} onChange={(e) => handleReactivityRatioChange('r2', e.target.value)} placeholder="e.g., 0.46" className={`w-full bg-slate-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 transition ${errors.reactivityRatios?.r2 ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-cyan-500'}`} aria-invalid={!!errors.reactivityRatios?.r2} aria-describedby={errors.reactivityRatios?.r2 ? 'r2-error' : undefined}/>{errors.reactivityRatios?.r2 && <p id="r2-error" className="mt-1 text-xs text-red-400 flex items-center"><AlertCircleIcon className="w-3.5 h-3.5 mr-1"/>{errors.reactivityRatios.r2}</p>}</div></div></div></>
      )}

      {/* REACTION TYPE & INITIATOR */}
      <hr className="border-slate-700" />
      <div><label htmlFor="reactionType" className="block text-sm font-medium text-slate-300 mb-1">Reaction Type</label><select id="reactionType" name="reactionType" value={formData.reactionType} onChange={handleGeneralChange} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition">{REACTION_TYPES.map(rt => (<option key={rt.name} value={rt.name}>{rt.name}</option>))}</select>{selectedReactionType && (<p className="mt-2 text-xs text-slate-400 bg-slate-700/50 p-2 rounded-md">{selectedReactionType.description}</p>)}</div>
      <InputField label="Initiator / Catalyst" id="initiator" value={formData.initiator} onChange={handleGeneralChange} error={errors.initiator} placeholder="e.g., AIBN" title="Chemical used to start the polymerization" />
      <InputField label="Initiator Concentration" id="initiatorConcentration" value={formData.initiatorConcentration} onChange={handleGeneralChange} unit="mol/L" error={errors.initiatorConcentration} placeholder="e.g., 0.01" title="Initial concentration of the initiator in mol/L" />
      
      {/* AI ASSISTANTS */}
      <hr className="border-slate-700" />
      <div className="space-y-3 p-3 bg-slate-700/30 rounded-md">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2"><LightbulbIcon className="w-5 h-5 text-amber-300"/>AI Assistants</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" onClick={() => handleGetRecommendation('initiator')} disabled={isAiLoading} className="text-xs w-full bg-slate-700 text-amber-300 font-semibold py-2 px-3 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition disabled:opacity-50 disabled:cursor-wait">Suggest Initiators</button>
            <button type="button" onClick={() => handleGetRecommendation('recipe')} disabled={isAiLoading} className="text-xs w-full bg-slate-700 text-amber-300 font-semibold py-2 px-3 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition disabled:opacity-50 disabled:cursor-wait">Suggest Recipe</button>
        </div>
      </div>
      
      {/* CTA */}
      <hr className="border-slate-700" />
      <div className="space-y-3 p-3 bg-slate-700/30 rounded-md">
        <h3 className="text-sm font-medium text-slate-300">Chain Transfer Agent (Optional)</h3>
        <InputField label="Agent Name" id="chainTransferAgent" value={formData.chainTransferAgent || ''} onChange={handleGeneralChange} error={errors.chainTransferAgent} placeholder="e.g., Dodecanethiol" title="Chemical used to control molecular weight. Leave blank if not used." />
        <InputField label="Concentration" id="ctaConcentration" value={formData.ctaConcentration || ''} onChange={handleGeneralChange} unit="mol/L" error={errors.ctaConcentration} placeholder="e.g., 0.005" title="Initial concentration of the CTA in mol/L" />
      </div>

      {/* SOLVENT */}
      <hr className="border-slate-700" />
      <div className="space-y-3 p-3 bg-slate-700/30 rounded-md">
        <h3 className="text-sm font-medium text-slate-300">Solvent System (Optional)</h3>
        <InputField label="Solvent Name" id="solvent" value={formData.solvent || ''} onChange={handleGeneralChange} error={errors.solvent} placeholder="e.g., Toluene" title="The reaction solvent. Leave blank for bulk polymerization." />
        <InputField label="Solvent Volume" id="solventVolume" value={formData.solventVolume || ''} onChange={handleGeneralChange} unit="mL" error={errors.solventVolume} placeholder="e.g., 500" title="Total volume of the solvent in mL." />
      </div>

      {/* TEMPERATURE */}
      <hr className="border-slate-700" />
      <InputField label="Temperature" id="temperature" value={formData.temperature} onChange={handleGeneralChange} unit="°C" error={errors.temperature} placeholder="e.g., 60" title="Reaction temperature in degrees Celsius (°C)"/>

      <button type="submit" disabled={isLoading || !isFormValid} className="w-full flex justify-center items-center bg-cyan-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition duration-150 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed disabled:text-slate-300">
        {isLoading ? (<><LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />Generating...</>) : (isFormValid ? 'Generate Data' : 'Please correct the errors')}
      </button>
    </form>
    </>
  );
};

export default KineticsForm;