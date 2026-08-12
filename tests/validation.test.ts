import assert from 'node:assert/strict';
import { INITIAL_FORM_DATA } from '../constants.ts';
import { simulateFreeRadicalScreening } from '../services/kineticsModel.ts';
import { validateFormData } from '../services/validation.ts';

const valid = validateFormData(INITIAL_FORM_DATA);
assert.equal(valid.valid, true);
assert.equal(valid.errors.length, 0);
assert.ok(valid.warnings.length >= 1);

const invalid = validateFormData({ ...INITIAL_FORM_DATA, temperature: '1000' });
assert.equal(invalid.valid, false);
assert.match(invalid.errors.join(' '), /Temperature/);

const output = simulateFreeRadicalScreening(INITIAL_FORM_DATA);
assert.equal(output.diagnostics.status, 'deterministic-estimate');
assert.equal(output.kineticData.length, 25);
assert.equal(output.kineticData[0].time, 0);
assert.ok(output.kineticData.every((point) => point.conversion.overall >= 0 && point.conversion.overall <= 100));
assert.ok(output.kineticData.every((point) => point.molecularWeightMw >= point.molecularWeightMn));
assert.ok(output.kineticData.every((point) => point.dispersity >= 1.5 && point.dispersity <= 2.2));
console.log('Validation and deterministic model tests passed.');
