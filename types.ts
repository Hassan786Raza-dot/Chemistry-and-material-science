
export interface FormData {
  monomer: string;
  initiator: string;
  reactionType: string;
  monomerConcentration: string;
  initiatorConcentration: string;
  temperature: string;
}

export interface KineticPoint {
  time: number;
  conversion: number;
  molecularWeight: number;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface GeneratedData {
  summary: string;
  kineticData: KineticPoint[];
  sources: GroundingSource[];
}
