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
 * definite article so "حمار" also finds "الحمار"/"الحمير"/etc.
 */
function arabicVariant(q: string): string | null {
  const t = q.trim();
  if (t.includes(' ') || t.length < 3) return null;
  if (t.startsWith('ال') && t.slice(2).length >= 2) return t.slice(2);
  if (!t.startsWith('ال')) return 'ال' + t;
  return null;
}

/**
 * Run the underlying search with a generous limit so we harvest enough
 * exact-match results after filtering.
 */
function runSearch(q: string, data: any, limit = 500) {
  return search(
    q,
    {
      quranData:     data.quranData,
      morphologyMap: data.morphologyMap,
      wordMap:       data.wordMap,
      // ⚠️ Do NOT pass invertedIndex — it zeroes out root-format results
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

    // ── Primary search ────────────────────────────────────────────────────
    const primary = runSearch(normalizedQuery, data, 500);
    const allPrimary: any[] = primary.results ?? [];

    // Keep only verses where the word/root is literally present.
    // matchType "exact"  → word appears in the verse  (signal)
    // matchType "none"   → broad morphological match   (noise)
    const exactPrimary = allPrimary.filter((r: any) => r.matchType === 'exact');

    // Fall back to all results only if zero exact matches found
    // (e.g. very rare word or unusual query form)
    const usePrimary = exactPrimary.length > 0 ? exactPrimary : allPrimary;
    const exactOnly  = exactPrimary.length > 0;

    // ── ال-variant merge ──────────────────────────────────────────────────
    const variant = arabicVariant(normalizedQuery);
    let merged = usePrimary;

    if (variant) {
      const secondary = runSearch(variant, data, 500);
      const allSecondary: any[] = secondary.results ?? [];
      const exactSecondary = allSecondary.filter((r: any) => r.matchType === 'exact');
      const useSecondary   = exactSecondary.length > 0 ? exactSecondary : allSecondary;

      const seen   = new Set(usePrimary.map((r: any) => r.gid));
      const extras = useSecondary.filter((r: any) => !seen.has(r.gid));
      merged = [...usePrimary, ...extras];
    }

    const results = merged.slice(0, 100);

    return NextResponse.json({
      ...primary,
      results,
      pagination: {
        ...(primary.pagination ?? {}),
        // engine's totalResults is kept as the upper-bound count;
        // exactOnly tells the client whether results are filtered
        totalResults: primary.pagination?.totalResults ?? merged.length,
        exactOnly,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
