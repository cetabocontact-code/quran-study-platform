import { loadQuranData, loadMorphology, loadWordMap, search, removeTashkeel } from 'quran-search-engine';

async function test() {
  console.log("Loading data...");
  const quranData = await loadQuranData();
  const morphologyMap = await loadMorphology();
  const wordMap = await loadWordMap();
  console.log("Data loaded.");

  const queries = ["حمار", "حِمَار", "ر ح م", "ن و ر", "ع ق ل", "ك ت ب", "ق ل ب", "ن ف س", "ح ك م", "ش ك ر", "س ل م"];
  
  for (const q of queries) {
    const normalized = removeTashkeel(q);
    const result = search(normalized, { quranData, morphologyMap, wordMap }, { lemma: true, root: true, fuzzy: false }, { page: 1, limit: 5 });
    const total = result.pagination?.totalResults ?? 0;
    const topVerse = result.results?.[0];
    console.log(`\n🔍 "${q}" → normalized: "${normalized}" → ${total} results`);
    if (topVerse) {
      console.log(`   First: ${topVerse.sura_name} ${topVerse.aya_id_display} [${topVerse.matchType}]`);
    } else {
      console.log("   ❌ NO RESULTS");
    }
  }
}

test().catch(console.error);
