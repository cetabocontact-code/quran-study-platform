import { NextResponse } from 'next/server';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  search,
  removeTashkeel,
} from 'quran-search-engine';

const g = global as any;

async function loadData() {
  if (g._quranLoaded) return;
  g._quranData     = await loadQuranData();
  g._morphologyMap = await loadMorphology();
  g._wordMap       = await loadWordMap();
  g._quranLoaded   = true;
}

function arabicVariant(q: string): string | null {
  const t = q.trim();
  if (t.includes(' ') || t.length < 3) return null;
  if (t.startsWith('ال') && t.slice(2).length >= 2) return t.slice(2);
  if (!t.startsWith('ال')) return 'ال' + t;
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const perPage = parseInt(searchParams.get('per_page') ?? '50', 10);
  const mode = searchParams.get('mode') ?? 'all'; // 'all' | 'exact' | 'root' | 'lemma'

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    await loadData();

    if (!g._quranData) {
      return NextResponse.json(
        { error: 'Quran data failed to load' },
        { status: 500 }
      );
    }

    const data = {
      quranData:     g._quranData,
      morphologyMap: g._morphologyMap,
      wordMap:       g._wordMap,
    };

    const normalizedQuery = removeTashkeel(query.trim());

    // Run primary search — return ALL results, not just exact
    const primary = search(
      normalizedQuery,
      data,
      { lemma: true, root: true, fuzzy: false },
      { page, limit: perPage }
    );

    let results: any[] = primary.results ?? [];

    // Filter by mode if requested
    if (mode === 'exact') {
      results = results.filter((r: any) => r.matchType === 'exact');
    } else if (mode === 'root') {
      results = results.filter((r: any) => r.matchType === 'root' || r.matchType === 'exact');
    } else if (mode === 'lemma') {
      results = results.filter((r: any) => r.matchType === 'lemma' || r.matchType === 'exact');
    }
    // mode === 'all' → no filtering, return everything

    // ال-variant merge for single words
    const variant = arabicVariant(normalizedQuery);
    if (variant) {
      const secondary = search(
        variant,
        data,
        { lemma: true, root: true, fuzzy: false },
        { page: 1, limit: 50 }
      );
      const secondaryResults: any[] = secondary.results ?? [];
      const seen = new Set(results.map((r: any) => r.gid));
      const extras = secondaryResults.filter((r: any) => !seen.has(r.gid));
      results = [...results, ...extras];
    }

    return NextResponse.json({
      results,
      counts: primary.counts ?? {},
      pagination: {
        totalResults: primary.pagination?.totalResults ?? results.length,
        totalPages: primary.pagination?.totalPages ?? 1,
        currentPage: page,
        limit: perPage,
      },
      query: normalizedQuery,
      mode,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
