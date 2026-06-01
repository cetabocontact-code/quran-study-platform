import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMorphology, loadQuranData } from "quran-search-engine";

type QuranVerse = {
  gid: number;
  sura_id: number;
  aya_id: number;
  aya_id_display: string;
  uthmani: string;
  standard: string;
  sura_name: string;
};

type MorphologyVerse = {
  gid: number;
  roots: string[];
};

type MutableRootStats = {
  root: string;
  occurrenceCount: number;
  verseCount: number;
  surahDistribution: Map<number, { surahId: number; surahName: string; count: number }>;
  coOccurringRoots: Map<string, number>;
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

const ROOT_STATS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/root_stats.json"
);

function normalizeRoot(root: string): string {
  return root.replace(/\s+/g, "-").replace(/ـ/g, "").trim();
}

function rootLabel(root: string): string {
  return root.replace(/-/g, " ");
}

function ensureStats(statsByRoot: Map<string, MutableRootStats>, root: string) {
  let stats = statsByRoot.get(root);

  if (!stats) {
    stats = {
      root,
      occurrenceCount: 0,
      verseCount: 0,
      surahDistribution: new Map(),
      coOccurringRoots: new Map(),
      positionalPatterns: {
        openingVerses: 0,
        closingVerses: 0,
        firstAyah: 0,
        lastAyah: 0,
      },
      sampleVerses: [],
    };
    statsByRoot.set(root, stats);
  }

  return stats;
}

function topEntries<T extends { count: number }>(entries: T[], limit: number): T[] {
  return entries.sort((a, b) => b.count - a.count).slice(0, limit);
}

async function buildRootStats() {
  const quranData = (await loadQuranData()) as Map<number, QuranVerse>;
  const morphologyMap = (await loadMorphology()) as Map<number, MorphologyVerse>;

  const surahLengths = new Map<number, number>();
  for (const verse of quranData.values()) {
    const current = surahLengths.get(verse.sura_id) ?? 0;
    if (verse.aya_id > current) surahLengths.set(verse.sura_id, verse.aya_id);
  }

  const statsByRoot = new Map<string, MutableRootStats>();

  for (const [gid, morphology] of morphologyMap.entries()) {
    const verse = quranData.get(gid);
    if (!verse || !morphology.roots?.length) continue;

    const roots = morphology.roots.map(normalizeRoot).filter(Boolean);
    const uniqueRoots = [...new Set(roots)];
    const lastAyah = surahLengths.get(verse.sura_id) ?? verse.aya_id;

    for (const root of uniqueRoots) {
      const stats = ensureStats(statsByRoot, root);
      const occurrencesInVerse = roots.filter((candidate) => candidate === root).length;
      stats.occurrenceCount += occurrencesInVerse;
      stats.verseCount += 1;

      const surahStats = stats.surahDistribution.get(verse.sura_id) ?? {
        surahId: verse.sura_id,
        surahName: verse.sura_name,
        count: 0,
      };
      surahStats.count += occurrencesInVerse;
      stats.surahDistribution.set(verse.sura_id, surahStats);

      if (verse.aya_id <= 3) stats.positionalPatterns.openingVerses += 1;
      if (lastAyah - verse.aya_id < 3) stats.positionalPatterns.closingVerses += 1;
      if (verse.aya_id === 1) stats.positionalPatterns.firstAyah += 1;
      if (verse.aya_id === lastAyah) stats.positionalPatterns.lastAyah += 1;

      if (stats.sampleVerses.length < 6) {
        stats.sampleVerses.push({
          gid: verse.gid,
          surahId: verse.sura_id,
          surahName: verse.sura_name,
          ayah: verse.aya_id,
          ayahDisplay: verse.aya_id_display,
          text: verse.uthmani,
        });
      }

      for (const otherRoot of uniqueRoots) {
        if (otherRoot === root) continue;
        stats.coOccurringRoots.set(
          otherRoot,
          (stats.coOccurringRoots.get(otherRoot) ?? 0) + 1
        );
      }
    }
  }

  const rootStats: Record<string, RootStats> = {};

  for (const [root, stats] of statsByRoot.entries()) {
    rootStats[root] = {
      root,
      occurrenceCount: stats.occurrenceCount,
      verseCount: stats.verseCount,
      surahDistribution: topEntries([...stats.surahDistribution.values()], 10),
      coOccurringRoots: topEntries(
        [...stats.coOccurringRoots.entries()].map(([coRoot, count]) => ({
          root: coRoot,
          count,
        })),
        12
      ),
      positionalPatterns: stats.positionalPatterns,
      sampleVerses: stats.sampleVerses,
    };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "quran-search-engine",
    rootCount: Object.keys(rootStats).length,
    roots: Object.fromEntries(
      Object.entries(rootStats).sort(([, a], [, b]) => b.occurrenceCount - a.occurrenceCount)
    ),
  };

  await mkdir(path.dirname(ROOT_STATS_PATH), { recursive: true });
  await writeFile(ROOT_STATS_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `Built ${payload.rootCount} roots into ${path.relative(process.cwd(), ROOT_STATS_PATH)}`
  );
  console.log(
    `Top root: ${rootLabel(Object.keys(payload.roots)[0] ?? "")}`
  );
}

buildRootStats().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
