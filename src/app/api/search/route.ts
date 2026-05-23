import { NextResponse } from 'next/server';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  buildInvertedIndex,
  search,
  removeTashkeel,
} from 'quran-search-engine';

// Use global to persist data across Next.js hot reloads in dev
// In production on Vercel, the function instance is reused anyway
const g = global as any;

async function loadData() {
  if (g._quranLoaded) return;

  console.log('[Search API] Loading Quran data...');
  try {
    g._quranData = await loadQuranData();
    g._morphologyMap = await loadMorphology();
    g._wordMap = await loadWordMap();

    console.log(`[Search API] Loaded ${Array.isArray(g._quranData) ? g._quranData.size || g._quranData.length || 'Map' : 'unknown'} verses`);

    try {
      g._invertedIndex = buildInvertedIndex(g._morphologyMap, g._quranData);
      console.log('[Search API] Inverted index built successfully');
    } catch (e) {
      console.warn('[Search API] Could not build inverted index:', e);
      g._invertedIndex = undefined;
    }

    g._quranLoaded = true;
    console.log('[Search API] Data loaded successfully');
  } catch (err) {
    console.error('[Search API] Failed to load data:', err);
    throw err;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    await loadData();

    if (!g._quranData) {
      return NextResponse.json({ error: 'Quran data failed to load' }, { status: 500 });
    }

    // Strip diacritics so حِمَار matches حمار in the dataset
    const normalizedQuery = removeTashkeel(query.trim());

    console.log(`[Search API] Searching for: "${normalizedQuery}" (original: "${query}")`);

    const result = search(
      normalizedQuery,
      {
        quranData: g._quranData,
        morphologyMap: g._morphologyMap,
        wordMap: g._wordMap,
        invertedIndex: g._invertedIndex,
      },
      { lemma: true, root: true, fuzzy: false },
      { page: 1, limit: 100 }
    );

    console.log(`[Search API] Found ${result.pagination?.totalResults ?? 0} results`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Search API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
