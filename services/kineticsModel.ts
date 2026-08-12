import type { FormData, GeneratedData, KineticPoint, ModelDiagnostics, SourceRecord } from '../types';

const now = () => new Date().toISOString();

function pseudoRateConstant(data: FormData): number {
  const temperatureK = Number(data.temperature) + 273.15;
  const initiator = Number(data.initiatorConcentration);
  // Arrhenius-like screening term; units are intentionally not presented as a measured k.
  return Math.max(0.0001, 0.0015 * Math.sqrt(initiator) * Math.exp((temperatureK - 333.15) / 55));
}

export function simulateFreeRadicalScreening(data: FormData): GeneratedData {
  const k = pseudoRateConstant(data);
  const r1 = Number(data.reactivityRatios.r1) || 1;
  const r2 = Number(data.reactivityRatios.r2) || 1;
  const cta = Number(data.ctaConcentration) || 0;
  const totalMonomer = data.monomers.reduce((sum, item) => sum + Number(item.concentration), 0);
  const points: KineticPoint[] = [];
  for (let index = 0; index < 25; index += 1) {
    const time = index * 10;
    const overall = Math.min(99.5, 100 * (1 - Math.exp(-k * time)));
    const firstShare = data.monomers.length === 2 ? r1 / Math.max(0.001, r1 + r2) : 1;
    const conversion: Record<string, number> = { overall: overall };
    data.monomers.forEach((monomer, monomerIndex) => {
      const share = data.monomers.length === 1 ? 1 : monomerIndex === 0 ? firstShare : 1 - firstShare;
      conversion[monomer.name] = Math.min(99.5, overall * (0.85 + 0.3 * share));
    });
    const idealDegree = Math.max(1, (totalMonomer * 1000) / Math.max(0.01, Number(data.initiatorConcentration) * 1000 + cta * 1000));
    const mn = Math.max(100, idealDegree * Math.max(0.02, overall / 100) * 100);
    const dispersity = Math.min(2.2, Math.max(1.5, 1.5 + overall / 250 + (cta > 0 ? 0.15 : 0)));
    points.push({ time, conversion, molecularWeightMn: mn, molecularWeightMw: mn * dispersity, dispersity });
  }
  const retrievedAt = now();
  const localSource: SourceRecord = { title: 'Local deterministic screening model', uri: 'local://kinetics-model', sourceType: 'model-assumption', retrievedAt, status: 'local' };
  const diagnostics: ModelDiagnostics = {
    modelName: 'free-radical-screening-v1', status: 'deterministic-estimate',
    assumptions: ['Pseudo-first-order conversion curve with temperature-scaled screening rate.', 'Copolymer composition uses supplied r1/r2 as a simple share heuristic.', 'Mn and dispersity are idealized proxies, not calibrated molecular-weight predictions.', 'No oxygen inhibition, diffusion limitation, heat transfer, solvent quality, termination-mode, or side-reaction model is included.'],
    warnings: ['Do not cite these simulated values as experimental evidence.', 'Fit experimental data separately and report confidence intervals, residuals, and independent replicates.'],
    parameterSummary: { pseudoRateConstant: k, totalMonomerMolPerL: totalMonomer, temperatureC: Number(data.temperature), initiatorMolPerL: Number(data.initiatorConcentration), ctaMolPerL: cta },
  };
  return {
    summary: `A deterministic screening curve was generated for ${data.reactionType}. Conversion rises monotonically under a pseudo-first-order assumption; molecular weight and dispersity are displayed as bounded proxies. This output is an exploratory model estimate and is not a validated prediction for the supplied chemistry.`,
    kineticData: points, sources: [localSource], inputs: data, chemicalRecords: [], diagnostics, createdAt: retrievedAt,
  };
}
