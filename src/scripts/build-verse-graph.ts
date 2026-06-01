/**
 * Pre-computes the Qur'an Self-Reference graph.
 *
 * Two verses are "connected" when they share >= MIN_SHARED distinct roots.
 * Connection strength is the sum of the IDF weights of the shared roots, so a
 * pair that shares rare, distinctive roots ranks far above a pair that merely
 * shares ubiquitous ones (الله، قال، كان). For every verse we keep its strongest
 * TOP_PER_VERSE connections and write the whole graph to src/data/verse_graph.json.
 *
 * Run:  node src/scripts/build-verse-graph.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadQuranData, loadMorphology, SURAS } from "quran-search-engine";

const MIN_SHARED = 3;
const TOP_PER_VERSE = 20;

type Connection = { verse: string; shared: string[]; score: number };

async function main() {
  console.log("Loading Qur'an data + morphology...");
  const quran = await loadQuranData();
  const morphology = await loadMorphology();
  const N = quran.size;
  console.log(`Loaded ${N} verses.`);

  // verse_key uses sura_id:aya_id — aya_id_display is Arabic-Indic numerals.
  const keyByGid = new Map<number, string>();
  // Distinct roots per verse (morphology.roots repeats roots per word).
  const rootsByGid = new Map<number, string[]>();
  // Inverted index: root -> gids that contain it. Document frequency per root.
  const rootToGids = new Map<string, number[]>();
  const df = new Map<string, number>();

  for (const [gid, verse] of quran) {
    keyByGid.set(gid, `${verse.sura_id}:${verse.aya_id}`);
    const entry = morphology.get(gid);
    const roots = entry ? [...new Set(entry.roots)] : [];
    rootsByGid.set(gid, roots);
    for (const root of roots) {
      df.set(root, (df.get(root) ?? 0) + 1);
      let bucket = rootToGids.get(root);
      if (!bucket) {
        bucket = [];
        rootToGids.set(root, bucket);
      }
      bucket.push(gid);
    }
  }

  // Inverse document frequency: rarer roots carry more semantic weight.
  const idf = new Map<string, number>();
  for (const [root, freq] of df) idf.set(root, Math.log(N / freq));

  const verses: Record<string, { connections: Connection[] }> = {};
  let connectedCount = 0;

  for (const [gid, roots] of rootsByGid) {
    if (roots.length < MIN_SHARED) continue; // can never reach the threshold

    // Accumulate shared roots + score against every candidate in a single pass.
    const sharedRoots = new Map<number, string[]>();
    const scores = new Map<number, number>();
    for (const root of roots) {
      const weight = idf.get(root) ?? 0;
      for (const other of rootToGids.get(root)!) {
        if (other === gid) continue;
        let list = sharedRoots.get(other);
        if (!list) {
          list = [];
          sharedRoots.set(other, list);
        }
        list.push(root);
        scores.set(other, (scores.get(other) ?? 0) + weight);
      }
    }

    const connections: Connection[] = [];
    for (const [other, shared] of sharedRoots) {
      if (shared.length < MIN_SHARED) continue;
      connections.push({
        verse: keyByGid.get(other)!,
        shared,
        score: Math.round((scores.get(other) ?? 0) * 100) / 100,
      });
    }
    if (connections.length === 0) continue;

    connections.sort(
      (a, b) => b.score - a.score || b.shared.length - a.shared.length
    );
    verses[keyByGid.get(gid)!] = {
      connections: connections.slice(0, TOP_PER_VERSE),
    };
    connectedCount++;
  }

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      totalVerses: N,
      minSharedRoots: MIN_SHARED,
      topPerVerse: TOP_PER_VERSE,
      scoring: "sum of IDF weights over distinct shared roots",
    },
    verses,
  };

  const outPath = join(process.cwd(), "src", "data", "verse_graph.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output));
  console.log(
    `Wrote ${outPath}\n  ${connectedCount} verses have >= ${MIN_SHARED} shared-root connections.`
  );

  // Compact surah index (id, Arabic name, ayah count) for the UI selector,
  // so the page stays self-contained on local data with no external API.
  const surahs = SURAS.map((s) => ({
    id: s.id,
    name: s.sura_name,
    ayahs: s.total_verses,
  }));
  const surahPath = join(process.cwd(), "src", "data", "surahs.json");
  writeFileSync(surahPath, JSON.stringify(surahs));
  console.log(`Wrote ${surahPath} — ${surahs.length} surahs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
