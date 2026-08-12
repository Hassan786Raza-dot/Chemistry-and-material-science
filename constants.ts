import type { FormData } from './types';

export const INITIAL_FORM_DATA: FormData = {
  monomers: [
    { id: 'monomer_1', name: 'Styrene', concentration: '1.0' },
    { id: 'monomer_2', name: 'Methyl methacrylate', concentration: '0.5' },
  ],
  initiator: 'AIBN', initiatorConcentration: '0.01', temperature: '60', reactionType: 'Free Radical Polymerization',
  reactivityRatios: { r1: '0.52', r2: '0.46' }, chainTransferAgent: 'Dodecanethiol', ctaConcentration: '0.005', solvent: 'Toluene', solventVolume: '50',
};

export const REACTION_TYPES = [
  { name: 'Free Radical Polymerization', description: 'Screening model: monotonic conversion with simple temperature and initiator scaling.' },
  { name: 'Anionic Polymerization', description: 'Input accepted for planning, but no mechanistic local model is implemented.' },
  { name: 'Cationic Polymerization', description: 'Input accepted for planning, but no mechanistic local model is implemented.' },
  { name: 'Ring-Opening Polymerization', description: 'Input accepted for planning, but no mechanistic local model is implemented.' },
  { name: 'Condensation Polymerization', description: 'Input accepted for planning, but no mechanistic local model is implemented.' },
] as const;