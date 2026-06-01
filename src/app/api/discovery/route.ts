import { NextResponse } from "next/server";
import rootStatsData from "@/data/root_stats.json";

type RootStats = {
  root: string;
  occurrenceCount: number;
  verseCount: number;
  surahDistribution: { surahId: number; surahName: string; count: number }[];
  coOccurringRoots: { root: string; count: number }[];
  positionalPatterns: {
    openingVerses: number;
    closingVerses: number;
    firstAyah: number;
    lastAyah: number;
  };
  sampleVerses: {
    gid: number;
    surahId: number;
    surahName: string;
    ayah: number;
    ayahDisplay: string;
    text: string;
  }[];
};

type RootStatsPayload = {
  generatedAt: string;
  source: string;
  rootCount: number;
  roots: Record<string, RootStats>;
};

const rootStats = rootStatsData as RootStatsPayload;

function normalizeRoot(input: string): string {
  const parts = input
    .replace(/[ـ]/g, "")
    .replace(/[،,]+/g, " ")
    .trim()
    .split(/\s+|-/)
    .filter(Boolean);
  // Accept connected roots too (e.g. "مكر"): split a single separator-less
  // token into its individual letters so it maps to the stored "م-ك-ر" key.
  const letters =
    parts.length === 1 && [...parts[0]].length > 1 ? [...parts[0]] : parts;
  return letters.join("-");
}

// Roots are stored hyphen-separated (م-ك-ر). Present them connected (مكر)
// without adding any diacritics — review feedback #6.
function formatRoot(root: string): string {
  return root.replace(/-/g, "");
}

function arabicNumber(value: number): string {
  return value.toLocaleString("ar-EG");
}

function buildDescription(stats: RootStats): string {
  const topSurah = stats.surahDistribution[0];
  const topRoots = stats.coOccurringRoots.slice(0, 2).map((item) => formatRoot(item.root));
  const surahText = topSurah
    ? `ويتركز أكثر في سورة ${topSurah.surahName} بعدد ${arabicNumber(topSurah.count)} موضع.`
    : "";
  const coText = topRoots.length
    ? `وأقرب الجذور ظهورا معه: ${topRoots.join(" و ")}.`
    : "";

  return `جذر ${formatRoot(stats.root)} يظهر ${arabicNumber(stats.occurrenceCount)} مرة في ${arabicNumber(stats.verseCount)} آية. ${coText} ${surahText}`.trim();
}

function buildInsight(stats: RootStats) {
  return {
    root: stats.root,
    rootLabel: formatRoot(stats.root),
    occurrenceCount: stats.occurrenceCount,
    verseCount: stats.verseCount,
    topCoOccurringRoots: stats.coOccurringRoots.slice(0, 8).map((item) => ({
      ...item,
      label: formatRoot(item.root),
    })),
    surahDistribution: stats.surahDistribution.slice(0, 5),
    positionalPatterns: stats.positionalPatterns,
    sampleVerses: stats.sampleVerses.slice(0, 4),
    description: buildDescription(stats),
    generatedAt: rootStats.generatedAt,
  };
}

function randomStats(): RootStats {
  const candidates = Object.values(rootStats.roots).filter(
    (stats) => stats.occurrenceCount >= 5 && stats.coOccurringRoots.length >= 2
  );
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const root = searchParams.get("root");

  if (!root) {
    return NextResponse.json({ insight: buildInsight(randomStats()) });
  }

  const normalizedRoot = normalizeRoot(root);
  const stats = rootStats.roots[normalizedRoot];

  if (!stats) {
    return NextResponse.json(
      {
        error: "لم يتم العثور على هذا الجذر",
        root: normalizedRoot,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ insight: buildInsight(stats) });
}
