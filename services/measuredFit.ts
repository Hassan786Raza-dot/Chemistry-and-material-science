import type { FitResult, MeasuredPoint } from '../types';

const predict = (k: number, time: number) => 100 * (1 - Math.exp(-k * time));
const rmse = (values: number[]) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / Math.max(1, values.length));

export function parseMeasuredCsv(text: string): { points: MeasuredPoint[]; errors: string[] } {
  const errors: string[] = [];
  const points: MeasuredPoint[] = [];
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 3) return { points: [], errors: ['Provide a header and at least two measured rows.'] };
  const header = lines[0].split(',').map((value) => value.trim().toLowerCase());
  const timeIndex = header.findIndex((value) => ['time', 'time_min', 'time (min)'].includes(value));
  const conversionIndex = header.findIndex((value) => ['conversion', 'conversion_percent', 'conversion (%)'].includes(value));
  if (timeIndex < 0 || conversionIndex < 0) return { points: [], errors: ['CSV must contain time and conversion columns. Accepted names include time_min and conversion_percent.'] };
  lines.slice(1).forEach((line, rowIndex) => {
    const cells = line.split(',').map((value) => value.trim());
    const time = Number(cells[timeIndex]);
    const conversion = Number(cells[conversionIndex]);
    if (!Number.isFinite(time) || !Number.isFinite(conversion)) errors.push(`Row ${rowIndex + 2} contains a non-numeric time or conversion.`);
    else if (time < 0 || conversion < 0 || conversion > 100) errors.push(`Row ${rowIndex + 2} must have time ≥ 0 and conversion between 0 and 100%.`);
    else points.push({ time, conversion });
  });
  const sorted = points.sort((a, b) => a.time - b.time);
  if (sorted.some((point, index) => index > 0 && point.time === sorted[index - 1].time)) errors.push('Duplicate time values are not allowed in this simple fit. Aggregate replicates before fitting or extend the data schema with replicate IDs.');
  if (sorted.length < 6) errors.push('At least six valid observations are required for a train/validation split.');
  return { points: sorted, errors };
}

export function fitMeasuredConversion(points: MeasuredPoint[]): FitResult {
  if (points.length < 6) throw new Error('At least six measured points are required.');
  const splitIndex = Math.max(4, Math.floor(points.length * 0.8));
  const train = points.slice(0, splitIndex);
  let bestK = 0.001;
  let bestError = Number.POSITIVE_INFINITY;
  for (let index = 0; index <= 1000; index += 1) {
    const k = Math.exp(Math.log(0.00001) + (index / 1000) * (Math.log(10) - Math.log(0.00001)));
    const error = rmse(train.map((point) => predict(k, point.time) - point.conversion));
    if (error < bestError) { bestError = error; bestK = k; }
  }
  const fitted = points.map((point, index) => ({ time: point.time, observed: point.conversion, fitted: predict(bestK, point.time), residual: point.conversion - predict(bestK, point.time), split: index < splitIndex ? 'train' as const : 'validation' as const }));
  const mean = points.reduce((sum, point) => sum + point.conversion, 0) / points.length;
  const ssTot = points.reduce((sum, point) => sum + (point.conversion - mean) ** 2, 0);
  const residuals = fitted.map((point) => point.residual);
  const residualRmse = rmse(residuals);
  const rSquared = ssTot > 0 ? 1 - residuals.reduce((sum, value) => sum + value ** 2, 0) / ssTot : 0;
  const variance = residuals.reduce((sum, value) => sum + value ** 2, 0) / Math.max(1, points.length - 1);
  const stdError = Math.sqrt(variance) / Math.max(1, Math.sqrt(points.reduce((sum, point) => sum + point.time ** 2, 0)));
  const ci: [number, number] = [Math.max(0, bestK - 1.96 * stdError), bestK + 1.96 * stdError];
  const warnings = ['This is a one-parameter screening fit and does not identify a reaction mechanism.', 'The validation split is temporal, not an independent experimental batch.', 'No externally validated evidence tier is assigned until an independent dataset and pre-specified acceptance criteria are supplied.'];
  if (rSquared < 0.9) warnings.push('R² is below 0.90; inspect residuals and alternative models before interpretation.');
  return { diagnostics: { evidenceTier: 'measured-fit', modelName: 'one-parameter pseudo-first-order conversion fit', nObservations: points.length, nReplicates: new Set(points.map((point) => point.replicate).filter(Boolean)).size, rmse: residualRmse, rSquared, parameterEstimate: bestK, parameterStdError: stdError, confidenceInterval95: ci, trainCount: splitIndex, validationCount: points.length - splitIndex, residuals: fitted.map(({ time, observed, fitted: value, residual }) => ({ time, observed, fitted: value, residual })), warnings }, fitted };
}
