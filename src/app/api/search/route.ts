import { NextResponse } from 'next/server';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  search,
  removeTashkeel,
} from 'quran-search-engine';

// NOTE: buildInvertedIndex is intentionally NOT used — it breaks root-format
// queries (e.g. "ر ح م") causing them to return 0 results.
// The library's root search works correctly without the index.

const g = global as any;

async function loadData() {
  if (g._quranLoaded) return;

  g._quranData     = await loadQuranData();
  g._morphologyMap = await loadMorphology();
  g._wordMap       = await loadWordMap();
  g._quranLoaded   = true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

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

    // Strip diacritics — حِمَار → حمار, preserves spaces for root queries like ر ح م
    const normalizedQuery = removeTashkeel(query.trim());

    const result = search(
      normalizedQuery,
      {
        quranData:    g._quranData,
        morphologyMap: g._morphologyMap,
        wordMap:      g._wordMap,
        // ⚠️  Do NOT pass invertedIndex — it zeroes out all root-format results
      },
      { lemma: true, root: true, fuzzy: false },
      { page: 1, limit: 100 }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
