export interface Monomer {
  id: string;
  name: string;
  concentration: string;
}

export interface FormData {
  monomers: Monomer[];
  initiator: string;
  reactionType: string;
  initiatorConcentration: string;
  temperature: string;
  reactivityRatios?: {
    r1: string;
    r2: string;
  };
  chainTransferAgent?: string;
  ctaConcentration?: string;
  solvent?: string;
  solventVolume?: string;
}

export interface KineticPoint {
  time: number;
  conversion: {
    [monomerName: string]: number; // e.g., "Styrene": 15.5
    overall: number;
  };
  molecularWeightMn: number;
  molecularWeightMw: number;
}


export interface GroundingSource {
    uri: string;
    title: string;
}

export interface GeneratedData {
  summary: string;
  kineticData: KineticPoint[];
  sources: GroundingSource[];
  inputs: FormData; // Pass inputs through for display
}

export interface RecipeSuggestion {
  monomerConcentrations: { name: string; concentration: string }[];
  initiator: string;
  initiatorConcentration: string;
  temperature: string;
  chainTransferAgent?: string | null;
  ctaConcentration?: string | null;
  solvent?: string | null;
  solventVolume?: string | null;
  justification: string;
}