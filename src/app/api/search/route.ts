import { NextResponse } from 'next/server';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  buildInvertedIndex,
  search,
  removeTashkeel
} from 'quran-search-engine';

// Cache the loaded data globally in memory
let quranData: any = null;
let morphologyMap: any = null;
let wordMap: any = null;
let invertedIndex: any = null;

async function loadData() {
  if (!quranData) {
    quranData = await loadQuranData();
    morphologyMap = await loadMorphology();
    wordMap = await loadWordMap();
    try {
      invertedIndex = buildInvertedIndex(morphologyMap, quranData);
    } catch (e) {
      console.warn("Could not build inverted index, search will run without it.");
    }
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

    // Normalize query (remove tashkeel) to ensure robust matches even if user types with diacritics
    const normalizedQuery = removeTashkeel(query);

    // Perform root and lemma search automatically
    const result = search(
      normalizedQuery,
      { quranData, morphologyMap, wordMap, invertedIndex },
      { lemma: true, root: true, fuzzy: false },
      { page: 1, limit: 100 }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
