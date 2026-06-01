import { NextResponse } from 'next/server';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  loadSemanticData,
  buildInvertedIndex,
  search,
  removeTashkeel,
} from 'quran-search-engine';

const g = global as any;

// ── Normalisation ─────────────────────────────────────────────────────────────
// The corpus stores hamza inconsistently, so we need TWO normalisers:
//   • normKey  — fold only أ/إ/آ → ا (KEEP ء/ؤ/ئ). For wordMap KEY lookups and for
//     surface words, whose keys retain the bare hamza (folding it would break
//     سماء، خطيئة …).
//   • normRoot — fold ALL hamza carriers ء/أ/إ/آ/ؤ/ئ → ا. For ROOT strings: the
//     morphology writes roots with bare alif (آخر → ا-خ-ر، قرآن → ق-ر-ا) while the
//     wordMap’s root field uses ء/أ; folding lets the two spaces meet.
const normKey = (s: string) =>
  removeTashkeel(s || '').replace(/[أإآ]/g, 'ا').replace(/ـ/g, '');
const normRoot = (s: string) =>
  removeTashkeel(s || '').replace(/[أإآءؤئ]/g, 'ا').replace(/ـ/g, '');

// Verse → its display word tokens (Arabic letters only, no diacritics/markers).
const tokensOf = (v: any) =>
  String(v?.standard || v?.uthmani || '')
    .split(/\s+/)
    .map((w) => w.replace(/[^ء-ي]/g, ''))
    .filter(Boolean);

const wmGet = (k: string) =>
  g._wordMap instanceof Map ? g._wordMap.get(k) : g._wordMap?.[k];

// Reliable surface-word → hyphen-root via the wordMap (its `root` field is sound;
// its `lemma` field is corrupt and must never be used). Key lookup uses normKey,
// the returned root value is normalised into root-space with normRoot.
const wmRootOf = (w: string): string | null => {
  const e = wmGet(normKey(w));
  return e && e.root ? normRoot(e.root).replace(/\s+/g, '-') : null;
};

function normalizeMorph(morphologyMap: any): Map<any, any> {
  return morphologyMap instanceof Map
    ? morphologyMap
    : new Map(
        (Array.isArray(morphologyMap) ? morphologyMap : Object.values(morphologyMap)).map(
          (m: any) => [m.gid, m],
        ),
      );
}

async function loadData() {
  if (!g._quranData)     g._quranData     = await loadQuranData();
  if (!g._morphologyMap) g._morphologyMap = await loadMorphology();
  if (!g._wordMap)       g._wordMap       = await loadWordMap();
  if (!g._semanticMap)   g._semanticMap   = await loadSemanticData();
  if (!g._invertedIndex) g._invertedIndex = buildInvertedIndex(g._morphologyMap, g._quranData, g._semanticMap);
  if (!g._verseList) {
    g._verseList  = Array.isArray(g._quranData) ? g._quranData : Array.from(g._quranData.values());
    g._verseByGid = new Map(g._verseList.map((v: any) => [v.gid, v]));
  }
  if (!g._morphMap)   g._morphMap   = normalizeMorph(g._morphologyMap);
  if (!g._rootIndex)  g._rootIndex  = buildRootIndex(g._morphMap);
  if (!g._lemmaData)  g._lemmaData  = buildLemmaData(g._morphMap, g._verseByGid);
  g._quranLoaded = true;
}

// ── Root index ────────────────────────────────────────────────────────────────
// Authoritative root → verses, straight from the morphology (Quranic Arabic
// Corpus). Key = hyphen-joined root (normRoot-space), value = the set of verse
// gids carrying ≥1 word of that root, plus a raw occurrence count.
function buildRootIndex(morph: Map<any, any>): Map<string, { gids: Set<number>; occ: number }> {
  const idx = new Map<string, { gids: Set<number>; occ: number }>();
  for (const [gid, m] of morph) {
    for (const r of (m.roots || [])) {
      if (!r) continue;
      const key = normRoot(r);
      let e = idx.get(key);
      if (!e) idx.set(key, (e = { gids: new Set<number>(), occ: 0 }));
      e.gids.add(gid as number);
      e.occ++;
    }
  }
  return idx;
}

// Resolve a query to a single morphological root, or null. Three input forms,
// in priority order:
//   (a) a spaced skeleton «ك ت ب»          → the root itself
//   (b) a surface word «كتاب»/«الكتاب»      → its root via the wordMap (+ال-variant)
//   (c) a bare 3/4-letter stem «عقل»        → the letters AS the root, if it exists
// Every candidate is validated against the morphology index, so we never invent
// a root that has zero verses. Key lookups use normKey; root strings use normRoot.
function resolveRoot(normalizedQuery: string): string | null {
  const rootIndex: Map<string, any> = g._rootIndex;
  const rawToks = normalizedQuery.trim().split(/\s+/).filter(Boolean);
  const nrToks = rawToks.map((t) => normRoot(t)).filter(Boolean);

  // (a) separated single letters → root skeleton (normRoot so «ا خ ر» folds right)
  if (nrToks.length >= 2 && nrToks.every((t) => t.length === 1)) {
    const h = nrToks.join('-');
    return rootIndex.has(h) ? h : null;
  }

  const keyWord = normKey(rawToks.join(''));
  if (!keyWord) return null;

  // (b) surface word → wordMap root, trying the ال-variant as well
  const cands = keyWord.startsWith('ال') ? [keyWord, keyWord.slice(2)] : [keyWord, 'ال' + keyWord];
  for (const c of cands) {
    const e = wmGet(c);
    if (e && e.root) {
      const h = normRoot(e.root).replace(/\s+/g, '-');
      if (rootIndex.has(h)) return h;
    }
  }

  // (c) bare letters as the root
  const h = nrToks.join('').split('').join('-');
  return rootIndex.has(h) ? h : null;
}

// Pick the family words to highlight inside one (already root-matched) verse.
// Primary: words whose own wordMap root equals the target root. Fallback (only
// when that finds nothing, e.g. a wordMap gap like «الحمير»): words whose
// skeleton contains the root letters in order. Both run only on verses the
// morphology already confirmed, so they cannot introduce false matches.
function rootFamilyTokens(verse: any, root: string): string[] {
  const words = String(verse.standard || verse.uthmani || '').split(/\s+/);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const w of words) {
    const display = w.replace(/[^ء-ي]/g, '');
    if (!display || seen.has(display)) continue;
    const e = wmGet(normKey(display));
    if (e && e.root && normRoot(e.root).replace(/\s+/g, '-') === root) {
      seen.add(display);
      out.push(display);
    }
  }

  if (out.length === 0) {
    const letters = root.split('-');
    for (const w of words) {
      const display = w.replace(/[^ء-ي]/g, '');
      if (!display || seen.has(display)) continue;
      const cw = normRoot(display);
      let i = 0;
      for (const ch of cw) {
        if (ch === letters[i]) i++;
        if (i === letters.length) break;
      }
      if (i === letters.length) {
        seen.add(display);
        out.push(display);
      }
    }
  }
  return out;
}

// ── Lemma machinery ───────────────────────────────────────────────────────────
// «بحث باللفظ» must return verses sharing the query word’s LEMMA (e.g. نور «light»
// → 33 verses, NOT the 174 of root ن-و-ر which also sweeps in نار «fire»). The
// engine’s lemma mode keys off wordMap.lemma, which is corrupt (نور→"كتب"), so we
// derive the truth from morphology.lemmas instead:
//   • lemmaIndex   norm(lemma) → set of gids                 (the count of record)
//   • lemmaRoot    lemma → its root, via reliable wordMap.root, else a vote over
//                  positionally-aligned verses
//   • surfaceLemma surface word → lemma votes: pass 1 positional on aligned verses
//                  (weight 2), pass 2 root-anchored on every verse (weight 1, only
//                  when exactly one verse-lemma carries the token’s root) — this
//                  recovers votes from the ~43% of verses where clitic splitting
//                  desyncs token and lemma counts
//   • rootToLemmas root → its lemmas, sorted by verse frequency
function buildLemmaData(morph: Map<any, any>, byGid: Map<any, any>) {
  const lemmaIndex = new Map<string, Set<number>>();
  const allRoots = new Set<string>();
  for (const [gid, m] of morph) {
    for (const lem of (m.lemmas || [])) {
      const k = normKey(lem);
      if (!k) continue;
      let e = lemmaIndex.get(k);
      if (!e) lemmaIndex.set(k, (e = new Set<number>()));
      e.add(gid as number);
    }
    for (const r of (m.roots || [])) if (r) allRoots.add(normRoot(r));
  }
  const lemVerses = (lem: string) => { const s = lemmaIndex.get(normKey(lem)); return s ? s.size : 0; };

  // lemma → root vote, from positionally-aligned verses only
  const lemmaRootVote = new Map<string, Map<string, number>>();
  for (const [gid, m] of morph) {
    const v = byGid.get(gid); if (!v) continue;
    const toks = tokensOf(v);
    const lems = (m.lemmas || []).map((x: string) => normKey(x));
    if (toks.length !== lems.length) continue;
    for (let i = 0; i < toks.length; i++) {
      const r = wmRootOf(toks[i]);
      if (!r || !lems[i]) continue;
      let rr = lemmaRootVote.get(lems[i]);
      if (!rr) lemmaRootVote.set(lems[i], (rr = new Map<string, number>()));
      rr.set(r, (rr.get(r) || 0) + 1);
    }
  }
  const lemmaRoot = (lem: string): string | null => {
    const direct = wmRootOf(lem);
    if (direct) return direct;
    const rr = lemmaRootVote.get(normKey(lem));
    if (rr) return [...rr.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return null;
  };

  // surface → lemma votes (pass 1 aligned positional, pass 2 root-anchored)
  const surfaceLemma = new Map<string, Map<string, number>>();
  const addVote = (w: string, lem: string, k = 1) => {
    const nw = normKey(w);
    let mm = surfaceLemma.get(nw);
    if (!mm) surfaceLemma.set(nw, (mm = new Map<string, number>()));
    mm.set(lem, (mm.get(lem) || 0) + k);
  };
  for (const [gid, m] of morph) {
    const v = byGid.get(gid); if (!v) continue;
    const toks = tokensOf(v);
    const lems = (m.lemmas || []).map((x: string) => normKey(x));
    if (toks.length === lems.length)
      for (let i = 0; i < toks.length; i++) if (toks[i] && lems[i]) addVote(toks[i], lems[i], 2);
  }
  for (const [gid, m] of morph) {
    const v = byGid.get(gid); if (!v) continue;
    const toks = tokensOf(v);
    const lems = [...new Set((m.lemmas || []).map((x: string) => normKey(x)))] as string[];
    for (const w of toks) {
      const r = wmRootOf(w);
      if (!r) continue;
      const cand = lems.filter((l) => lemmaRoot(l) === r);
      if (cand.length === 1) addVote(w, cand[0], 1);
    }
  }

  // root → its lemmas, most-frequent first
  const rootToLemmas = new Map<string, string[]>();
  for (const lem of lemmaIndex.keys()) {
    const r = lemmaRoot(lem);
    if (!r) continue;
    let a = rootToLemmas.get(r);
    if (!a) rootToLemmas.set(r, (a = []));
    a.push(lem);
  }
  for (const a of rootToLemmas.values()) a.sort((x, y) => lemVerses(y) - lemVerses(x));

  return { lemmaIndex, allRoots, lemmaRootVote, surfaceLemma, rootToLemmas, lemmaRoot };
}

// Resolve a query word to its single best lemma (or null). Priority:
//   P1 surface+root — a surface-voted lemma sharing the query’s reliable root
//   P2 exact-lemma  — a lemma of that root equal to the query surface (fixes كاتب,
//                     which otherwise drifts to the dominant كتب)
//   P3 surface      — best surface vote with no root signal
//   P4 root-top     — dominant lemma carrying that root (recovers bare عقل, whose
//                     surface form never appears as a standalone token)
function resolveLemma(query: string): { lemma: string | null; qRoot: string | null; via: string } {
  const { surfaceLemma, allRoots, rootToLemmas, lemmaRoot } = g._lemmaData;
  const n = normKey(query);
  const bareN = n.replace(/^ال/, '');
  const cands = n.startsWith('ال') ? [n, n.slice(2)] : [n, 'ال' + n];
  let qRoot: string | null = wmRootOf(query) || wmRootOf(cands[1]);
  if (!qRoot) { const bare = normRoot(bareN).split('').join('-'); if (allRoots.has(bare)) qRoot = bare; }

  const votes = new Map<string, number>();
  for (const c of cands) {
    const mm = surfaceLemma.get(c);
    if (mm) for (const [lem, k] of mm) votes.set(lem, (votes.get(lem) || 0) + k);
  }
  const ranked = [...votes.entries()].sort((a, b) => b[1] - a[1]).map(([lem]) => lem);
  const ofRoot: string[] = qRoot ? (rootToLemmas.get(qRoot) || []) : [];

  if (qRoot) { const m = ranked.filter((l) => lemmaRoot(l) === qRoot); if (m.length) return { lemma: m[0], qRoot, via: 'surface+root' }; }
  if (qRoot) { const exact = ofRoot.find((l) => l === n || l === bareN); if (exact) return { lemma: exact, qRoot, via: 'exact-lemma' }; }
  if (ranked.length) return { lemma: ranked[0], qRoot, via: 'surface' };
  if (ofRoot.length) return { lemma: ofRoot[0], qRoot, via: ofRoot.length === 1 ? 'root-unique' : 'root-top' };
  return { lemma: null, qRoot, via: 'unresolved' };
}

// Words to highlight inside one (already lemma-matched) verse. Aligned verses:
// the positional tokens whose lemma equals the target. Otherwise: tokens whose
// dominant surface→lemma vote is the target. Verses are pre-confirmed by the
// lemma index, so this only chooses which words to mark, never which verses.
function lemmaFamilyTokens(verse: any, gid: number, lemma: string): string[] {
  const m = g._morphMap.get(gid);
  const displays = String(verse.standard || verse.uthmani || '')
    .split(/\s+/)
    .map((w) => w.replace(/[^ء-ي]/g, ''))
    .filter(Boolean);
  const lems = (m?.lemmas || []).map((x: string) => normKey(x));
  const out: string[] = [];
  const seen = new Set<string>();

  if (displays.length === lems.length) {
    for (let i = 0; i < displays.length; i++) {
      if (lems[i] === lemma && !seen.has(displays[i])) { seen.add(displays[i]); out.push(displays[i]); }
    }
  }
  if (out.length === 0) {
    for (const d of displays) {
      if (seen.has(d)) continue;
      const mm = g._lemmaData.surfaceLemma.get(normKey(d));
      if (mm && mm.has(lemma)) {
        const top = [...mm.entries()].sort((a: any, b: any) => b[1] - a[1])[0][0];
        if (top === lemma) { seen.add(d); out.push(d); }
      }
    }
  }
  return out;
}

function arabicVariant(q: string): string | null {
  const t = q.trim();
  if (t.includes(' ') || t.length < 3) return null;
  if (t.startsWith('ال') && t.slice(2).length >= 2) return t.slice(2);
  if (!t.startsWith('ال')) return 'ال' + t;
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const perPage = parseInt(searchParams.get('per_page') ?? '50', 10);
  const mode = searchParams.get('mode') ?? 'all'; // 'all' | 'exact' | 'root' | 'lemma' | 'semantic'

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

    const normalizedQuery = removeTashkeel(query.trim());

    let merged: any[];

    // --- Root search (the authoritative path for «الكل» and «بحث بالجذر») -------
    // Return every verse containing ANY word of the SAME root as the query —
    // resolved against the morphology, not by letter/substring soup. Handles both
    // a whole word «كتاب» and a bare skeleton «ك ت ب» → root ك-ت-ب → 279 verses.
    // Old bugs it fixes: «ك ت ب» split into single letters matched anywhere in a
    // verse (Fatiha 1:5 = letter soup, ~2856 hits); and substring false positives
    // like التنور «oven» / نورث «we inherit» are NOT ن-و-ر, so نور = 174 not 177.
    const letterTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const isSeparatedLetters =
      letterTokens.length >= 2 && letterTokens.every((t) => t.length === 1);
    const wantsRoot = isSeparatedLetters || mode === 'all' || mode === 'root';
    const resolvedRoot = wantsRoot ? resolveRoot(normalizedQuery) : null;

    // Lemma resolution for «بحث باللفظ»: morphology lemma, NOT the corrupt
    // wordMap.lemma the engine would use. نور «light» → 33 (≠ root ن-و-ر = 174).
    const lemmaRes = mode === 'lemma' ? resolveLemma(normalizedQuery) : null;

    if (resolvedRoot) {
      const entry = g._rootIndex.get(resolvedRoot);
      const gids: Set<number> = entry ? entry.gids : new Set();
      merged = [];
      for (const v of g._verseList) {
        if (!gids.has(v.gid)) continue;
        const tokens = rootFamilyTokens(v, resolvedRoot);
        merged.push({
          ...v,
          matchType: 'root',
          matchScore: tokens.length || 1,
          matchedTokens: tokens,
          tokenTypes: Object.fromEntries(tokens.map((t) => [t, 'root'])),
        });
      }
    } else if (isSeparatedLetters) {
      // A spaced skeleton that is not a real Quranic root → no matches. Never
      // fall back to letter-soup (the source of the old «ك ت ب» = 2856 bug).
      merged = [];
    } else if (lemmaRes && lemmaRes.lemma) {
      // Lemma path: verses whose morphology lemma equals the resolved lemma.
      const gids: Set<number> = g._lemmaData.lemmaIndex.get(lemmaRes.lemma) || new Set();
      merged = [];
      for (const v of g._verseList) {
        if (!gids.has(v.gid)) continue;
        const tokens = lemmaFamilyTokens(v, v.gid, lemmaRes.lemma);
        merged.push({
          ...v,
          matchType: 'lemma',
          matchScore: tokens.length || 1,
          matchedTokens: tokens,
          tokenTypes: Object.fromEntries(tokens.map((t) => [t, 'lemma'])),
        });
      }
    } else {
      // Engine path: exact / semantic, plus the fallback for an unresolved root
      // («الكل») or an unresolved lemma. An unresolved lemma must NOT run the
      // engine’s corrupt wordMap.lemma matching, so it degrades to exact instead.
      const engineMode = mode === 'lemma' ? 'exact' : mode;
      const isSemantic = engineMode === 'semantic';
      const data = isSemantic
        ? {
            quranData:     g._quranData,
            morphologyMap: g._morphologyMap,
            wordMap:       g._wordMap,
            semanticMap:   g._semanticMap,
            invertedIndex: g._invertedIndex,
          }
        : {
            quranData:     g._quranData,
            morphologyMap: g._morphologyMap,
            wordMap:       g._wordMap,
          };

      // Map the UI mode to engine options. Exact matches are always computed;
      // root/lemma are additive. Pushing the mode into the engine (instead of
      // post-filtering a single page) keeps total, page count, and the visible
      // list consistent.
      const optionsByMode: Record<string, { lemma: boolean; root: boolean; fuzzy: boolean; semantic?: boolean }> = {
        all:      { lemma: true,  root: true,  fuzzy: false },
        exact:    { lemma: false, root: false, fuzzy: false },
        root:     { lemma: false, root: true,  fuzzy: false },
        lemma:    { lemma: true,  root: false, fuzzy: false },
        semantic: { lemma: false, root: false, fuzzy: false, semantic: true },
      };
      const options = optionsByMode[engineMode] ?? optionsByMode.all;

      // Fetch the FULL result set (the engine computes every match internally
      // anyway), merge the ال-variant, dedupe, then paginate ourselves.
      const FULL = 100000;
      const primary = search(normalizedQuery, data, options, { page: 1, limit: FULL });
      merged = primary.results ?? [];

      const variant = isSemantic ? null : arabicVariant(normalizedQuery);
      if (variant) {
        const secondary = search(variant, data, options, { page: 1, limit: FULL });
        const seen = new Set(merged.map((r: any) => r.gid));
        const extras = (secondary.results ?? []).filter((r: any) => !seen.has(r.gid));
        merged = [...merged, ...extras];
      }
    }

    // Counts derived from the full merged set so the breakdown sums to the total.
    const counts = {
      simple: 0, lemma: 0, root: 0, fuzzy: 0,
      range: 0, semantic: 0, regex: 0, total: merged.length,
    };
    for (const r of merged) {
      const t = r.matchType;
      if (t === 'root' || t === 'lemma' || t === 'fuzzy' || t === 'semantic' || t === 'range' || t === 'regex') {
        (counts as Record<string, number>)[t] += 1;
      }
      else counts.simple += 1;
    }

    // Paginate the merged set ourselves.
    const totalResults = merged.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * perPage;
    const results = merged.slice(start, start + perPage);

    return NextResponse.json({
      results,
      counts,
      pagination: {
        totalResults,
        totalPages,
        currentPage: safePage,
        limit: perPage,
      },
      query: normalizedQuery,
      mode,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
