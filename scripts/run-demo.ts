import { writeFile } from 'node:fs/promises';
import { INITIAL_FORM_DATA } from '../constants.ts';
import { simulateFreeRadicalScreening } from '../services/kineticsModel.ts';

const output = simulateFreeRadicalScreening(INITIAL_FORM_DATA);
await writeFile('demo-output.json', JSON.stringify(output, null, 2));
console.log(`Wrote demo-output.json with ${output.kineticData.length} points; status=${output.diagnostics.status}`);
