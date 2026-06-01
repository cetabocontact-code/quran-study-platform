import { NextResponse } from "next/server";
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  search,
  removeTashkeel,
} from "quran-search-engine";
import pairsData from "@/data/opposite_pairs.json";

// ---------------------------------------------------------------------------
// Curated Qur'anic opposite pairs. Stats are computed LIVE (exact matching)
// from the search engine so the numbers are honest — no stored folklore counts.
// We deliberately DO NOT pass an inverted index here: exact matching only,
// the same context the count-consistency work was verified against.
// ---------------------------------------------------------------------------

type Side = { label: string; query: string };
type Pair = { id: string; theme: string; a: Side; b: Side };
type PairsPayload = {
  generatedAt: string;
  matchMode: string;
  note: string;
  pairs: Pair[];
};

const PAIRS = pairsData as PairsPayload;

// Pairs we like to surface first when the page opens with no query.
const FEATURED = ["dunya-akhira", "nur-zulumat", "iman-kufr", "layl-nahar"];

const g = global as any;

async function loadData() {
  if (!g._quranData)     g._quranData     = await loadQuranData();
  if (!g._morphologyMap) g._morphologyMap = await loadMorphology();
  if (!g._wordMap)       g._wordMap       = await loadWordMap();
  return {
    quranData:     g._quranData,
    morphologyMap: g._morphologyMap,
    wordMap:       g._wordMap,
  };
}

// Tashkeel-free + alef-normalized + kashida-stripped, so user input lines up
// with the curated `query` forms regardless of how it was typed.
function normalize(input: string): string {
  return removeTashkeel(input)
    .replace(/[أإآ]/g, "ا")
    .replace(/ـ/g, "")
    .trim();
}

const EXACT = { lemma: false, root: false, fuzzy: false };
const FULL = 100000;

type SideStats = {
  label: string;
  query: string;
  verseCount: number;
  occurrenceCount: number;
  surahDistribution: { surahId: number; surahName: string; count: number }[];
  sampleVerses: {
    gid: number;
    surahId: number;
    surahName: string;
    ayahDisplay: string;
    juz: number;
    text: string;
  }[];
};

type SideResult = { stats: SideStats; gidMap: Map<number, any> };

function runSide(side: Side, data: any): SideResult {
  const res = search(side.query, data, EXACT, { page: 1, limit: FULL });
  const results: any[] = res.results ?? [];

  let occurrenceCount = 0;
  const surahCounts = new Map<number, { surahName: string; count: number }>();
  const gidMap = new Map<number, any>();

  for (const r of results) {
    const tokens = Array.isArray(r.matchedTokens) ? r.matchedTokens.length : 1;
    occurrenceCount += tokens;
    gidMap.set(r.gid, r);

    const existing = surahCounts.get(r.sura_id);
    if (existing) existing.count += 1;
    else surahCounts.set(r.sura_id, { surahName: r.sura_name, count: 1 });
  }

  const surahDistribution = [...surahCounts.entries()]
    .map(([surahId, v]) => ({ surahId, surahName: v.surahName, count: v.count }))
    .sort((x, y) => y.count - x.count || x.surahId - y.surahId)
    .slice(0, 6);

  const sampleVerses = results.slice(0, 4).map((r) => ({
    gid: r.gid,
    surahId: r.sura_id,
    surahName: r.sura_name,
    ayahDisplay: r.aya_id_display,
    juz: r.juz_id,
    text: r.uthmani,
  }));

  return {
    stats: {
      label: side.label,
      query: side.query,
      verseCount: res.pagination?.totalResults ?? results.length,
      occurrenceCount,
      surahDistribution,
      sampleVerses,
    },
    gidMap,
  };
}

function coOccurrence(a: SideResult, b: SideResult) {
  // Verses where BOTH words appear (intersect the gid sets).
  const shared: number[] = [];
  for (const gid of a.gidMap.keys()) {
    if (b.gidMap.has(gid)) shared.push(gid);
  }
  shared.sort((x, y) => x - y);

  const verses = shared.slice(0, 6).map((gid) => {
    const r = a.gidMap.get(gid);
    return {
      gid,
      surahId: r.sura_id,
      surahName: r.sura_name,
      ayahDisplay: r.aya_id_display,
      juz: r.juz_id,
      text: r.uthmani,
    };
  });

  return { count: shared.length, verses };
}

function buildInsight(pair: Pair, typedSide: "a" | "b" | null, data: any) {
  const a = runSide(pair.a, data);
  const b = runSide(pair.b, data);
  return {
    pair: { id: pair.id, theme: pair.theme, a: pair.a, b: pair.b },
    typedSide,
    a: a.stats,
    b: b.stats,
    coOccurrence: coOccurrence(a, b),
    generatedAt: PAIRS.generatedAt,
  };
}

// Match a user-typed word to one of the curated pairs. Returns the pair plus
// which side they landed on, so the UI can say "you typed X → its opposite Y".
function findPairByWord(word: string): { pair: Pair; side: "a" | "b" } | null {
  const n = normalize(word);
  if (!n) return null;
  for (const pair of PAIRS.pairs) {
    const aForms = [normalize(pair.a.query), normalize(pair.a.label)];
    const bForms = [normalize(pair.b.query), normalize(pair.b.label)];
    if (aForms.includes(n)) return { pair, side: "a" };
    if (bForms.includes(n)) return { pair, side: "b" };
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");
  const id = searchParams.get("id");

  try {
    const data = await loadData();
    if (!g._quranData) {
      return NextResponse.json(
        { error: "تعذّر تحميل بيانات القرآن" },
        { status: 500 }
      );
    }

    // Exact pair lookup by id (used by the featured-pair chips).
    if (id) {
      const pair = PAIRS.pairs.find((p) => p.id === id);
      if (!pair) {
        return NextResponse.json(
          { error: "لا يوجد هذا الزوج", id },
          { status: 404 }
        );
      }
      return NextResponse.json({ insight: buildInsight(pair, null, data) });
    }

    // Word lookup → find its curated opposite.
    if (word && word.trim()) {
      const match = findPairByWord(word);
      if (!match) {
        return NextResponse.json(
          {
            error: "لا يوجد ضدّ معروف لهذه الكلمة بعد",
            word: word.trim(),
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        insight: buildInsight(match.pair, match.side, data),
      });
    }

    // No params → open on a featured pair.
    const featuredId = FEATURED[Math.floor(Math.random() * FEATURED.length)];
    const pair =
      PAIRS.pairs.find((p) => p.id === featuredId) ?? PAIRS.pairs[0];
    return NextResponse.json({ insight: buildInsight(pair, null, data) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Stats are computed live from query params, so never statically cache.
export const dynamic = "force-dynamic";
