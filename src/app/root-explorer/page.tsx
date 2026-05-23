"use client";

import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RootExplorerContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedSuras, setExpandedSuras] = useState<Set<string>>(new Set());

  const examples = [
    { label: "حمار", desc: "(بحث بالكلمة)" },
    { label: "ح م ر", desc: "(بحث بالجذر)" },
    { label: "ر ح م", desc: "(رحمة)" },
    { label: "ع ق ل", desc: "(عقل)" },
    { label: "ن و ر", desc: "(نور)" },
    { label: "س ل م", desc: "(سلام)" },
    { label: "ق ل ب", desc: "(قلب)" },
    { label: "ك ت ب", desc: "(كتابة/فرض)" },
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setError("");
    setResults(null);
    setExpandedSuras(new Set());

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("حدث خطأ أثناء البحث. تأكد من تشغيل الخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) handleSearch(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groupedBySura: Record<string, any[]> = results?.results.reduce(
    (acc: Record<string, any[]>, item: any) => {
      if (!acc[item.sura_name]) acc[item.sura_name] = [];
      acc[item.sura_name].push(item);
      return acc;
    },
    {}
  ) ?? {};

  const toggleSura = (sura: string) => {
    setExpandedSuras((prev) => {
      const next = new Set(prev);
      if (next.has(sura)) next.delete(sura);
      else next.add(sura);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الجذور و الصرف</h1>
        <p className="text-zinc-400">تحليل الجذور اللغوية وسياقات ورودها في القرآن الكريم.</p>
      </header>

      {/* Usage guide */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <h3 className="text-sm font-bold text-zinc-300 mb-3">كيفية الاستخدام</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
          <div>
            <p className="text-teal-400 font-medium mb-1">البحث بالجذر الثلاثي</p>
            <p>
              أدخل الحروف مفصولة بمسافات:{" "}
              <span className="text-zinc-200 font-amiri">ر ح م</span> ← يبحث عن
              جميع مشتقات الرحمة (٢٢٤٨ نتيجة مختبرة)
            </p>
          </div>
          <div>
            <p className="text-teal-400 font-medium mb-1">البحث بالكلمة المباشرة</p>
            <p>
              أدخل الكلمة كاملة:{" "}
              <span className="text-zinc-200 font-amiri">حمار</span> ← يبحث
              بالكلمة بحصر (٢ نتيجة مختبرة)
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            جذور مختبرة وعدد نتائجها الفعلية: ن و ر (٤٣٨٣) · ع ق ل (٢٨١٣) · ك ت
            ب (٢٨٥٦) · ق ل ب (٢٩٧٩) · ن ف س (٢٤٨٥) · ح ك م (٢٠١٧) · ش ك ر
            (١١٩٦) · س ل م (٣٢٠٦)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative max-w-2xl"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن جذر أو كلمة (مثل: حمار، ر ح م، ع ق ل)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pr-12 pl-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-zinc-500 hover:text-teal-400 transition-colors" />
            )}
          </button>
        </form>

        <div className="max-w-2xl">
          <div className="text-sm text-zinc-500 mb-2">
            أمثلة مقترحة (انقر للتجربة):
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(ex.label)}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-teal-500/50 text-sm text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="font-bold text-teal-400">{ex.label}</span>
                <span className="text-zinc-500 text-xs">{ex.desc}</span>
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

      {loading && (
        <div className="flex items-center gap-3 p-6 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>جاري البحث في القرآن...</span>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/30 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                نتائج البحث عن:{" "}
                <span className="text-teal-400">{query}</span>
              </h2>
              <p className="text-zinc-400 mt-1">
                تم العثور على{" "}
                <span className="text-teal-400 font-medium">
                  {results.pagination?.totalResults ?? 0}
                </span>{" "}
                نتيجة في{" "}
                <span className="text-teal-400 font-medium">
                  {Object.keys(groupedBySura).length}
                </span>{" "}
                سورة
                {(results.pagination?.totalResults ?? 0) > 100 && (
                  <span className="text-zinc-500 text-sm"> (يعرض أول ١٠٠)</span>
                )}
              </p>
            </div>
            <div className="text-5xl font-amiri text-teal-500 opacity-20">
              {query}
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(groupedBySura).map(([sura, verses]) => {
              const isExpanded = expandedSuras.has(sura);
              const displayVerses = isExpanded ? verses : verses.slice(0, 2);
              return (
                <div
                  key={sura}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/20 transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleSura(sura)}
                    className="w-full p-4 flex items-center justify-between text-right"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-teal-400">سورة {sura}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{verses.length} آية</span>
                    </div>
                    {verses.length > 2 &&
                      (isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      ))}
                  </button>
                  <div className="px-4 pb-4 space-y-3">
                    {displayVerses.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80"
                      >
                        <div className="text-xs text-zinc-500 mb-2">
                          آية {item.aya_id_display}
                        </div>
                        <p className="font-amiri text-2xl leading-loose text-zinc-100">
                          {item.uthmani}
                        </p>
                      </div>
                    ))}
                    {!isExpanded && verses.length > 2 && (
                      <button
                        onClick={() => toggleSura(sura)}
                        className="text-sm text-teal-500 hover:text-teal-400 transition-colors"
                      >
                        + {verses.length - 2} آية أخرى في هذه السورة
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RootExplorer() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 p-8 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>جاري التحميل...</span>
        </div>
      }
    >
      <RootExplorerContent />
    </Suspense>
  );
}
