import { loadQuranData, loadMorphology, loadWordMap, search } from 'quran-search-engine';
import fs from 'fs';

async function test() {
  console.log("Loading data...");
  const quranData = await loadQuranData();
  const morphologyMap = await loadMorphology();
  const wordMap = await loadWordMap();
  
  const queries = ["حمار", "ح م ر", "ر ح م", "ع ق ل", "ن و ر", "س ل م", "ق ل ب", "ن ف س", "ك ت ب", "ح ك م", "ش ك ر"];
  const results = {};
  
  for (const q of queries) {
    console.log("Searching:", q);
    const result = search(q, { quranData, morphologyMap, wordMap }, { lemma: true, root: true, fuzzy: false }, { page: 1, limit: 3 });
    results[q] = {
      totalMatches: result.pagination.totalResults,
      topVerses: result.results.map(d => ({ text: d.standard, sura: d.sura_name, aya: d.aya_id_display }))
    };
  }
  
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log("Done");
}
test().catch(console.error);
