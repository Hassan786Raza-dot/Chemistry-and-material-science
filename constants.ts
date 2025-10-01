import type { FormData } from './types';

export const INITIAL_FORM_DATA: FormData = {
  monomers: [
    { id: 'monomer_1', name: 'Styrene', concentration: '1.0' },
    { id: 'monomer_2', name: 'Methyl Methacrylate', concentration: '0.5' },
  ],
  initiator: 'AIBN',
  reactionType: 'Free Radical Polymerization',
  initiatorConcentration: '0.01',
  temperature: '60',
  reactivityRatios: {
    r1: '0.52',
    r2: '0.46',
  },
  chainTransferAgent: 'Dodecanethiol',
  ctaConcentration: '0.005',
  solvent: 'Toluene',
  solventVolume: '500',
};

export const REACTION_TYPES = [
    {
        name: 'Free Radical Polymerization',
        description: 'Involves chain-propagating radical species. Common for vinyl monomers.'
    },
    {
        name: 'Anionic Polymerization',
        description: 'Involves negatively charged propagating species (carbanions). Can exhibit "living" characteristics.'
    },
    {
        name: 'Cationic Polymerization',
        description: 'Involves positively charged propagating species (carbocations). Sensitive to reaction conditions.'
    },
    {
        name: 'Ring-Opening Polymerization',
        description: 'Involves the opening of a cyclic monomer to form a linear polymer.'
    },
    {
        name: 'Condensation Polymerization',
        description: 'Involves step-growth mechanism where monomers react to form larger structural units while releasing smaller molecules such as water or methanol as a byproduct.'
    }
];