import type { ChemicalRecord, SourceRecord } from '../types';

const endpoint = (name: string) => `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES/JSON`;
const source = (name: string, status: SourceRecord['status']): SourceRecord => ({ title: `PubChem PUG REST lookup: ${name}`, uri: endpoint(name), publisher: 'National Center for Biotechnology Information', sourceType: 'chemical-database', retrievedAt: new Date().toISOString(), status });

export async function lookupChemical(name: string, timeoutMs = 5000): Promise<ChemicalRecord> {
  const query = name.trim();
  if (!query) return { query, source: source(query || 'empty query', 'local'), warning: 'No chemical name supplied.' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint(query), { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`PubChem responded with HTTP ${response.status}`);
    const payload = await response.json();
    const property = payload?.PropertyTable?.Properties?.[0];
    if (!property) throw new Error('No matching compound record was returned.');
    return { query, matchedName: property.IUPACName || query, cid: property.CID, molecularFormula: property.MolecularFormula, molecularWeight: Number(property.MolecularWeight), canonicalSmiles: property.CanonicalSMILES, source: source(query, 'live') };
  } catch (error) {
    return { query, source: source(query, 'cached'), warning: `Live lookup unavailable; no local chemical facts were substituted (${error instanceof Error ? error.message : 'unknown error'}).` };
  } finally { clearTimeout(timer); }
}
