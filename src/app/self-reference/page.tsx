"use client";

import { GitBranch, Activity, Search, Loader2, FlaskConical } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ── Static example shown before user searches ─────────────────────────────────
const DEFAULT_CONCEPT = "ن و ر";
const EXAMPLE_NOTE =
  "هذا مثال مختبر فعلياً — تم تشغيله على المحرك وتحقق من نتائجه. جرب أي مفهوم آخر بالبحث أعلاه.";

function SelfReferenceContent() {
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(DEFAULT_CONCEPT);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  const conceptExamples = [
    { label: "ن و ر", name: "(نور)" },
    { label: "ر ح م", name: "(رحمة)" },
    { label: "ق ل ب", name: "(قلب)" },
    { label: "ع ق ل", name: "(عقل)" },
    { label: "ن ف س", name: "(نفس)" },
    { label: "ك ت ب", name: "(كتاب)" },
    { label: "ح ك م", name: "(حكمة)" },
    { label: "ش ك ر", name: "(شكر)" },
  ];

  const handleSearch = async (searchQuery: string, fromDefault = false) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setInputValue(searchQuery);
    setLoading(true);
    setError("");
    setResults(null);
    setIsDefault(fromDefault);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("فشل البحث");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch {
      setError("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) handleSearch(q, false);
    else handleSearch(DEFAULT_CONCEPT, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Prefer exact matches for the map — they're the verses where the word
  // literally appears, not just contextual/morphological neighbours.
  const allResultsList: any[] = results?.results ?? [];
  const exactMatches = allResultsList.filter((r: any) => r.matchType === "exact");
  const mapResults = exactMatches.length > 0 ? exactMatches : allResultsList;

  const groupedBySura: Record<string, any[]> =
    mapResults.reduce((acc: Record<string, any[]>, item: any) => {
      if (!acc[item.sura_name]) acc[item.sura_name] = [];
      acc[item.sura_name].push(item);
      return acc;
    }, {});

  const topSuras = Object.entries(groupedBySura)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 6);

  const totalSuras = Object.keys(groupedBySura).length;
  const totalResults = results?.pagination?.totalResults ?? 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الإحالة الذاتية</h1>
        <p className="text-zinc-400">
          أدخل أي مفهوم أو جذر لترى كيف يوزّعه القرآن عبر سوره — شبكة معانٍ من الداخل.
        </p>
      </header>

      {/* Search */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(inputValue, false); }}
          className="relative max-w-2xl"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="أدخل مفهوماً أو جذراً (مثل: ن و ر، ر ح م، نفس)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pr-12 pl-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-500 transition-all"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2" disabled={loading}>
            {loading
              ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
              : <Search className="w-5 h-5 text-zinc-500 hover:text-teal-400 transition-colors" />}
          </button>
        </form>
        <div className="flex flex-wrap gap-2 max-w-2xl">
          {conceptExamples.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleSearch(ex.label, false)}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-teal-500/50 text-sm text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="font-bold text-teal-400">{ex.label}</span>
              <span className="text-zinc-500 text-xs">{ex.name}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400">{error}</div>
      )}

      {loading && (
        <div className="flex items-center gap-3 p-6 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>جاري تحليل الشبكة الدلالية...</span>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {/* Tested-example badge */}
          {isDefault && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-900/40 bg-teal-900/10 text-sm text-teal-300">
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span>{EXAMPLE_NOTE}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-500" />
                  مفهوم قيد الدراسة
                </h3>
                <div className="text-4xl font-amiri text-teal-400 mb-4 text-center">{query}</div>
                <p className="text-sm text-zinc-400 leading-relaxed text-center">
                  <span className="text-teal-400 font-medium">{totalResults.toLocaleString("ar-EG")}</span> آية عبر{" "}
                  <span className="text-teal-400 font-medium">{totalSuras}</span> سورة
                  {totalResults > 100 && (
                    <span className="block text-zinc-600 text-xs mt-1">(يعرض أول ١٠٠ نتيجة)</span>
                  )}
                </p>
              </div>

              {topSuras.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="font-bold text-zinc-100 mb-3 text-sm">أكثر السور تكراراً</h3>
                  <div className="space-y-3">
                    {topSuras.map(([sura, verses]) => {
                      const maxCount = topSuras[0][1].length;
                      const pct = Math.round((verses.length / maxCount) * 100);
                      return (
                        <div key={sura} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300">{sura}</span>
                            <span className="text-teal-400 tabular-nums">{verses.length}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500/70 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel: semantic map */}
            <div className="lg:col-span-2">
              <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
                <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-teal-500" />
                  <h3 className="font-bold text-zinc-100">خريطة الإحالات الدلالية</h3>
                  <span className="text-xs text-zinc-500 mr-auto">أبرز {topSuras.length} سور حسب التكرار</span>
                </div>
                {/* Explanation */}
                <div className="px-5 py-3 bg-zinc-950/40 border-b border-zinc-800/50 text-xs text-zinc-500 leading-relaxed space-y-1">
                  <p>
                    كل مفهوم له <span className="text-zinc-300 font-medium">بصمة توزيع خاصة به</span> عبر سور القرآن.
                    الخريطة تكشف في أي السور يتركّز هذا المفهوم أكثر من غيره.
                  </p>
                  <p>
                    جرّب بحثاً آخر لترى كيف تتغير البصمة كلياً — <span className="text-teal-400/80">ن و ر</span> مثلاً يتركّز في سور مختلفة عن <span className="text-teal-400/80">ر ح م</span>.
                    الكلمة المُلوَّنة في كل آية هي الشكل الصرفي الذي عثر عليه المحرك.
                  </p>
                </div>
                {/* Exact-match filter notice */}
                {exactMatches.length > 0 && exactMatches.length < allResultsList.length && (
                  <div className="px-5 py-2 bg-teal-950/20 border-b border-teal-900/30 text-xs text-teal-400/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    <span>
                      تعرض الخريطة <span className="font-medium text-teal-300">{exactMatches.length} مطابقة دقيقة</span> من أصل {totalResults.toLocaleString("ar-EG")} نتيجة — الآيات التي تحتوي الكلمة حرفياً.
                    </span>
                  </div>
                )}
                <div className="p-6 space-y-6">
                  {topSuras.length === 0 && (
                    <p className="text-zinc-500 text-center">لم يتم العثور على نتائج.</p>
                  )}
                  {topSuras.map(([sura, verses]) => (
                    <div key={sura} className="space-y-2">
                      <div className="text-xs text-zinc-500 font-medium">
                        سورة {sura} — <span className="text-teal-500">{verses.length} ورود</span>
                      </div>
                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                        <p className="font-amiri text-xl text-zinc-200 leading-loose">
                          {verses[0].uthmani}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                          <span>— آية {verses[0].aya_id_display}</span>
                          {verses[0].matchedTokens?.length > 0 && (
                            <span
                              className="px-2 py-0.5 rounded bg-teal-900/50 text-teal-300 border border-teal-800/50 font-amiri text-sm"
                              title="الكلمة التي طابقها المحرك في هذه الآية"
                            >
                              {verses[0].matchedTokens[0]}
                            </span>
                          )}
                          {verses.length > 1 && (
                            <span className="text-zinc-600">+ {verses.length - 1} آية أخرى في هذه السورة</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {totalSuras > 6 && (
                    <p className="text-sm text-zinc-500 text-center border-t border-zinc-800 pt-4">
                      + {totalSuras - 6} سورة أخرى تحتوي على هذا المفهوم
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SelfReference() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-3 p-8 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
        <span>جاري التحميل...</span>
      </div>
    }>
      <SelfReferenceContent />
    </Suspense>
  );
}
