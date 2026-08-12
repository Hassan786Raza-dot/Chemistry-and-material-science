export interface Monomer { id: string; name: string; concentration: string; }

export interface FormData {
  monomers: Monomer[];
  initiator: string;
  reactionType: string;
  initiatorConcentration: string;
  temperature: string;
  reactivityRatios: { r1: string; r2: string };
  chainTransferAgent: string;
  ctaConcentration: string;
  solvent: string;
  solventVolume: string;
}

export interface KineticPoint {
  time: number;
  conversion: Record<string, number>;
  molecularWeightMn: number;
  molecularWeightMw: number;
  dispersity: number;
}

export interface SourceRecord {
  title: string;
  uri: string;
  publisher?: string;
  year?: number;
  sourceType: 'chemical-database' | 'literature-metadata' | 'model-assumption' | 'local-demo';
  retrievedAt: string;
  status: 'live' | 'cached' | 'local';
}

export interface ChemicalRecord {
  query: string;
  matchedName?: string;
  cid?: number;
  molecularFormula?: string;
  molecularWeight?: number;
  canonicalSmiles?: string;
  source: SourceRecord;
  warning?: string;
}

export interface ModelDiagnostics {
  modelName: string;
  status: 'deterministic-estimate' | 'experimental-fit';
  assumptions: string[];
  warnings: string[];
  parameterSummary: Record<string, number | string>;
}

export interface GeneratedData {
  summary: string;
  kineticData: KineticPoint[];
  sources: SourceRecord[];
  inputs: FormData;
  chemicalRecords: ChemicalRecord[];
  diagnostics: ModelDiagnostics;
  createdAt: string;
  recordVersion: string;
  inputHash: string;
}

export interface ValidationResult { valid: boolean; errors: string[]; warnings: string[]; }

export type EvidenceTier = 'exploratory-screening' | 'measured-fit' | 'externally-validated';

export interface MeasuredPoint { time: number; conversion: number; replicate?: string; uncertainty?: number; }

export interface FitResult { diagnostics: FitDiagnostics; fitted: Array<{ time: number; observed: number; fitted: number; residual: number; split: 'train' | 'validation' }>; }

export interface FitDiagnostics {
  evidenceTier: EvidenceTier;
  modelName: string;
  nObservations: number;
  nReplicates: number;
  rmse: number;
  rSquared: number;
  parameterEstimate: number;
  parameterStdError?: number;
  confidenceInterval95?: [number, number];
  trainCount: number;
  validationCount: number;
  residuals: Array<{ time: number; observed: number; fitted: number; residual: number }>;
  warnings: string[];
}

export interface LiteratureRecord {
  title: string;
  uri: string;
  authors: string;
  year?: number;
  journal?: string;
  source: SourceRecord;
}
