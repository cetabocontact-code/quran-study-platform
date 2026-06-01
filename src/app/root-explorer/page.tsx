"use client";

import { Search, Loader2, Filter } from "lucide-react";
import { useState, useEffect } from "react";

const toArabicNumeral = (n: number): string =>
  n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

// Present root letters joined (ر ح م → رحم) without diacritics — review #6.
// (Search still runs on the original value so matching behaviour is unchanged.)
const connectLetters = (s: string): string => s.replace(/[\s-]+/g, "");

const matchTypeLabels: Record<string, { label: string; color: string }> = {
  exact:  { label: "مطابقة تامة", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  root:   { label: "جذر",        color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  lemma:  { label: "لفظ",        color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  fuzzy:  { label: "تقريبي",     color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  semantic: { label: "مفهوم", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
};

const searchModes = [
  { value: "all",   label: "الكل" },
  { value: "exact", label: "مطابقة تامة" },
  { value: "root",  label: "بحث بالجذر" },
  { value: "lemma", label: "بحث باللفظ" },
  { value: "semantic", label: "بحث بالمفهوم" },
];

export default function RootExplorer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("all");
  const [page, setPage] = useState(1);

  const examples = [
    { label: "حمار", desc: "(كلمة)" },
    { label: "ر ح م", desc: "(جذر: رحمة)" },
    { label: "ع ق ل", desc: "(جذر: عقل)" },
    { label: "ن و ر", desc: "(جذر: نور)" },
    { label: "س ل م", desc: "(جذر: سلام)" },
    { label: "ق ل ب", desc: "(جذر: قلب)" },
    { label: "ك ت ب", desc: "(جذر: كتابة)" },
    { label: "ن ف س", desc: "(جذر: نفس)" },
  ];

  const semanticCategories = [
    { label: "حيوانات", key: "حيوان" },
    { label: "نباتات", key: "نبات" },
    { label: "ماء", key: "ماء" },
    { label: "نار", key: "نار" },
    { label: "حجارة", key: "حجارة" },
    { label: "معادن", key: "معدن" },
    { label: "شمس", key: "شمس" },
    { label: "قمر", key: "قمر" },
    { label: "نجوم", key: "نجوم" },
    { label: "ألوان", key: "لون" },
  ];

  const handleSearch = async (searchQuery: string, searchPage = 1, searchMode = mode) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setMode(searchMode);
    setLoading(true);
    setError("");
    if (searchPage === 1) setResults(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: searchPage.toString(),
        per_page: "50",
        mode: searchMode,
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
      setPage(searchPage);
    } catch {
      setError("حدث خطأ أثناء البحث. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Run a search automatically when arriving with ?q=… (e.g. from the homepage
  // "جذور مختبرة" cards). Reads window.location on mount only — no Suspense
  // boundary needed, and the search stays client-side as before.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const m = params.get("mode");
    if (q && q.trim()) handleSearch(q, 1, m || "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الجذور و الصرف</h1>
        <p className="text-zinc-400">ابحث عن أي كلمة أو جذر في القرآن الكريم — بالكلمة أو بالجذر أو باللفظ.</p>
      </header>
      
      <div className="space-y-4">
        {/* Search bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(query, 1, mode); }}
          className="relative max-w-2xl"
        >
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن جذر أو كلمة (مثل: حمار، ر ح م، نور)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pr-12 pl-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-500 transition-all text-lg"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" /> : <Search className="w-5 h-5 text-zinc-500 hover:text-teal-400 transition-colors" />}
          </button>
        </form>

        {/* Search mode selector */}
        <div className="max-w-2xl flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <div className="flex gap-1.5">
            {searchModes.map((m) => (
              <button
                key={m.value}
                onClick={() => { setMode(m.value); if (query) handleSearch(query, 1, m.value); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  mode === m.value
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Example queries */}
        <div className="max-w-2xl">
          <div className="text-sm text-zinc-500 mb-2">أمثلة مقترحة (انقر للتجربة):</div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(ex.label)}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-teal-500/50 text-sm text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="font-bold text-teal-400">{connectLetters(ex.label)}</span>
                <span className="text-zinc-500 text-xs">{ex.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Semantic concept chips */}
        <div className="max-w-2xl">
          <div className="text-sm text-zinc-500 mb-2">تصفّح بالمفهوم:</div>
          <div className="flex flex-wrap gap-2">
            {semanticCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => handleSearch(category.key, 1, "semantic")}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-teal-500/50 text-sm text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="font-bold text-teal-400">{category.label}</span>
                <span className="text-zinc-500 text-xs">(مفهوم)</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Results header */}
          <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-100">
                  نتائج البحث عن: <span className="text-teal-400">{results.query || query}</span>
                </h2>
                <p className="text-zinc-400 mt-1">
                  تم العثور على <span className="text-teal-400 font-bold">{toArabicNumeral(results.pagination?.totalResults ?? results.results?.length ?? 0)}</span> نتيجة
                  {results.counts && (
                    <span className="text-zinc-600 mr-2">
                      (مطابقة: {toArabicNumeral(results.counts.simple ?? 0)} · جذر: {toArabicNumeral(results.counts.root ?? 0)} · لفظ: {toArabicNumeral(results.counts.lemma ?? 0)} · مفهوم: {toArabicNumeral(results.counts.semantic ?? 0)})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-3">
            {(results.results ?? []).map((item: any, idx: number) => {
              const mt = matchTypeLabels[item.matchType] ?? matchTypeLabels.exact;
              return (
                <div key={idx} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-teal-400 font-medium">سورة {item.sura_name}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-teal-400">آية {item.aya_id_display}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-500">جزء {toArabicNumeral(item.juz_id ?? 0)}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs border ${mt.color}`}>
                      {mt.label}
                    </span>
                  </div>
                  <p className="font-amiri text-2xl md:text-3xl leading-[2] text-zinc-100 selection:bg-teal-900 selection:text-teal-100">
                    {item.uthmani}
                  </p>
                  {item.matchedTokens && item.matchedTokens.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.matchedTokens.map((token: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-sm border border-teal-500/20">
                          {token}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {results.pagination && results.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-3">
              {page > 1 && (
                <button
                  onClick={() => handleSearch(query, page - 1, mode)}
                  className="px-6 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-teal-500/40 text-zinc-300 transition-all"
                >
                  ← السابق
                </button>
              )}
              <span className="px-4 py-2.5 text-zinc-500 text-sm">
                صفحة {toArabicNumeral(page)} من {toArabicNumeral(results.pagination.totalPages)}
              </span>
              {page < results.pagination.totalPages && (
                <button
                  onClick={() => handleSearch(query, page + 1, mode)}
                  className="px-6 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-teal-500/40 text-zinc-300 transition-all"
                >
                  التالي →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
