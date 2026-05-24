import { NextResponse } from 'next/server';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  search,
  removeTashkeel,
} from 'quran-search-engine';

// NOTE: buildInvertedIndex intentionally NOT used — it zeroes out all
// root-format queries (e.g. "ر ح م") causing them to return 0 results.

const g = global as any;

async function loadData() {
  if (g._quranLoaded) return;
  g._quranData     = await loadQuranData();
  g._morphologyMap = await loadMorphology();
  g._wordMap       = await loadWordMap();
  g._quranLoaded   = true;
}

/**
 * Arabic ال-variant: for single words, try both with and without the
 * definite article so "حمار" also finds "الحمار"/"الحمير"/etc., and
 * "الحمار" also finds bare "حمار" forms.
 * Returns null if the query has spaces (root search) or is too short.
 */
function arabicVariant(q: string): string | null {
  const t = q.trim();
  if (t.includes(' ') || t.length < 3) return null;
  if (t.startsWith('ال') && t.slice(2).length >= 2) return t.slice(2); // strip ال
  if (!t.startsWith('ال')) return 'ال' + t;                             // add ال
  return null;
}

function runSearch(q: string, data: any, limit = 100) {
  return search(
    q,
    {
      quranData:     data.quranData,
      morphologyMap: data.morphologyMap,
      wordMap:       data.wordMap,
      // ⚠️ Do NOT pass invertedIndex — zeroes root-format results
    },
    { lemma: true, root: true, fuzzy: false },
    { page: 1, limit }
  );
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

    const data = {
      quranData:     g._quranData,
      morphologyMap: g._morphologyMap,
      wordMap:       g._wordMap,
    };

    // Strip diacritics — حِمَار → حمار, preserves spaces for roots like ر ح م
    const normalizedQuery = removeTashkeel(query.trim());

    // Primary search
    const primary = runSearch(normalizedQuery, data, 100);

    // ال-variant: merge any additional unique verses
    const variant = arabicVariant(normalizedQuery);
    if (variant) {
      const secondary = runSearch(variant, data, 500);
      const seen = new Set((primary.results ?? []).map((r: any) => r.gid));
      const extras = (secondary.results ?? []).filter((r: any) => !seen.has(r.gid));

      if (extras.length > 0) {
        const merged = [...(primary.results ?? []), ...extras].slice(0, 100);
        return NextResponse.json({
          ...primary,
          results: merged,
          pagination: {
            ...(primary.pagination ?? {}),
            totalResults: (primary.pagination?.totalResults ?? 0) + extras.length,
          },
        });
      }
    }

    return NextResponse.json(primary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
