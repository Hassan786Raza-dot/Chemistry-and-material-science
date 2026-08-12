import type { LiteratureRecord, SourceRecord } from '../types';

const endpoint = (query: string) => `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&select=DOI,title,author,published,container-title`;

export async function searchLiterature(query: string, timeoutMs = 5000): Promise<{ records: LiteratureRecord[]; warning?: string }> {
  if (!query.trim()) return { records: [], warning: 'Enter a topic to search literature metadata.' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint(query), { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Crossref responded with HTTP ${response.status}`);
    const payload = await response.json();
    const retrievedAt = new Date().toISOString();
    const records: LiteratureRecord[] = (payload?.message?.items ?? []).map((item: any) => {
      const year = item.published?.['date-parts']?.[0]?.[0];
      const source: SourceRecord = { title: 'Crossref metadata', uri: 'https://api.crossref.org/', publisher: 'Crossref', year, sourceType: 'literature-metadata', retrievedAt, status: 'live' };
      return { title: item.title?.[0] || 'Untitled work', uri: item.DOI ? `https://doi.org/${item.DOI}` : 'https://search.crossref.org/', authors: (item.author ?? []).slice(0, 3).map((author: any) => `${author.given || ''} ${author.family || ''}`.trim()).join(', '), year, journal: item['container-title']?.[0], source };
    });
    return { records };
  } catch (error) {
    return { records: [], warning: `Live literature search unavailable (${error instanceof Error ? error.message : 'unknown error'}). Continue with local documentation and verify sources manually.` };
  } finally { clearTimeout(timer); }
}
