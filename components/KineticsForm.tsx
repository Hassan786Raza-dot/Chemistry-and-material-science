
import React from 'react';
import type { FormData } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';

interface KineticsFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const InputField: React.FC<{ label: string; id: keyof FormData; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit?: string }> = ({ label, id, value, onChange, unit }) => (
  <div>
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
        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        required
      />
      {unit && <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm">{unit}</span>}
    </div>
  </div>
);


const KineticsForm: React.FC<KineticsFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-4 border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-2">Reaction Parameters</h2>
      
      <div>
        <label htmlFor="monomer" className="block text-sm font-medium text-slate-300 mb-1">Monomer</label>
        <input type="text" id="monomer" name="monomer" value={formData.monomer} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" required />
      </div>

      <div>
        <label htmlFor="initiator" className="block text-sm font-medium text-slate-300 mb-1">Initiator</label>
        <input type="text" id="initiator" name="initiator" value={formData.initiator} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" required />
      </div>

      <div>
        <label htmlFor="reactionType" className="block text-sm font-medium text-slate-300 mb-1">Reaction Type</label>
        <select id="reactionType" name="reactionType" value={formData.reactionType} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition">
          <option>Free Radical Polymerization</option>
          <option>Anionic Polymerization</option>
          <option>Cationic Polymerization</option>
          <option>Ring-Opening Polymerization</option>
        </select>
      </div>

      <InputField label="Monomer Concentration" id="monomerConcentration" value={formData.monomerConcentration} onChange={handleChange} unit="mol/L" />
      <InputField label="Initiator Concentration" id="initiatorConcentration" value={formData.initiatorConcentration} onChange={handleChange} unit="mol/L" />
      <InputField label="Temperature" id="temperature" value={formData.temperature} onChange={handleChange} unit="°C" />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center bg-cyan-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition duration-150 ease-in-out disabled:bg-slate-500 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Generating...
          </>
        ) : (
          'Generate Data'
        )}
      </button>
    </form>
  );
};

export default KineticsForm;
