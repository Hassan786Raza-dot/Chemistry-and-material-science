import assert from 'node:assert/strict';
import { INITIAL_FORM_DATA } from '../constants.ts';
import { simulateFreeRadicalScreening } from '../services/kineticsModel.ts';
import { validateFormData } from '../services/validation.ts';
import { fitMeasuredConversion, parseMeasuredCsv } from '../services/measuredFit.ts';

const valid = validateFormData(INITIAL_FORM_DATA);
assert.equal(valid.valid, true);
assert.equal(valid.errors.length, 0);
assert.ok(valid.warnings.length >= 1);

const invalid = validateFormData({ ...INITIAL_FORM_DATA, temperature: '1000' });
assert.equal(invalid.valid, false);
assert.match(invalid.errors.join(' '), /Temperature/);

const output = simulateFreeRadicalScreening(INITIAL_FORM_DATA);
assert.equal(output.diagnostics.status, 'deterministic-estimate');
assert.equal(output.recordVersion, '1.1.0');
assert.match(output.inputHash, /^[0-9a-f]{8}$/);
assert.equal(output.kineticData.length, 25);
assert.equal(output.kineticData[0].time, 0);
assert.ok(output.kineticData.every((point) => point.conversion.overall >= 0 && point.conversion.overall <= 100));
assert.ok(output.kineticData.every((point) => point.molecularWeightMw >= point.molecularWeightMn));
assert.ok(output.kineticData.every((point) => point.dispersity >= 1.5 && point.dispersity <= 2.2));
const parsed = parseMeasuredCsv(`time_min,conversion_percent\n0,0\n10,18\n20,34\n30,47\n40,59\n50,68\n60,76\n70,82`);
assert.equal(parsed.errors.length, 0);
const fit = fitMeasuredConversion(parsed.points);
assert.equal(fit.diagnostics.evidenceTier, 'measured-fit');
assert.equal(fit.diagnostics.nObservations, 8);
assert.equal(fit.fitted.length, 8);
assert.equal(fit.diagnostics.residuals.length, 8);
assert.ok(fit.diagnostics.confidenceInterval95);
assert.equal(parseMeasuredCsv(`time,conversion\n0,0\n1,10`).errors.length > 0, true);
console.log('Validation, deterministic model, and measured-fit tests passed.');
