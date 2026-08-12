import type { FormData, ValidationResult } from '../types';

const number = (value: string) => Number(value);

export function validateFormData(data: FormData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (data.monomers.length < 1 || data.monomers.length > 2) errors.push('Use one or two monomers for this screening model.');
  const names = new Set<string>();
  for (const monomer of data.monomers) {
    const name = monomer.name.trim();
    const concentration = number(monomer.concentration);
    if (!name) errors.push('Every monomer needs a name.');
    if (names.has(name.toLowerCase())) errors.push(`Duplicate monomer name: ${name}.`);
    names.add(name.toLowerCase());
    if (!Number.isFinite(concentration) || concentration <= 0 || concentration > 20) errors.push(`${name || 'Monomer'} concentration must be between 0 and 20 mol/L.`);
  }
  const initiator = number(data.initiatorConcentration);
  const temperature = number(data.temperature);
  if (!data.initiator.trim()) errors.push('Initiator or catalyst is required.');
  if (!Number.isFinite(initiator) || initiator <= 0 || initiator > 2) errors.push('Initiator concentration must be between 0 and 2 mol/L.');
  if (!Number.isFinite(temperature) || temperature < -80 || temperature > 300) errors.push('Temperature must be between -80 and 300 °C.');
  if (data.monomers.length === 2) {
    for (const [key, value] of Object.entries(data.reactivityRatios)) {
      const ratio = number(value);
      if (!Number.isFinite(ratio) || ratio < 0 || ratio > 100) errors.push(`${key} must be between 0 and 100.`);
    }
  }
  const cta = number(data.ctaConcentration);
  if (data.chainTransferAgent.trim() && (!Number.isFinite(cta) || cta <= 0 || cta > 10)) errors.push('CTA concentration must be between 0 and 10 mol/L when a CTA is supplied.');
  if (!data.chainTransferAgent.trim() && data.ctaConcentration.trim()) warnings.push('CTA concentration was supplied without a CTA name and will be ignored.');
  if (data.reactionType !== 'Free Radical Polymerization') warnings.push('The current local model is calibrated only as a screening estimate for free-radical polymerization; other reaction types are not mechanistically implemented.');
  warnings.push('Results are deterministic screening estimates, not experimental measurements or validated predictions.');
  warnings.push('Molecular weight is estimated from conversion and an idealized chain-length relation; chain-transfer and termination chemistry are simplified.');
  return { valid: errors.length === 0, errors, warnings };
}
