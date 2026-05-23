"use client";

import { Search, Loader2, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ── Real tested examples embedded from verified API runs ──────────────────────
const EXAMPLES = [
  {
    query: "حمار",
    label: "حمار",
    type: "بحث بكلمة محددة",
    total: 2,
    suras: [
      {
        name: "البقرة",
        count: 1,
        verses: [{ aya: "٢٥٩", text: "أَوْ كَالَّذِي مَرَّ عَلَىٰ قَرْيَةٍ وَهِيَ خَاوِيَةٌ عَلَىٰ عُرُوشِهَا ۖ قَالَ أَنَّىٰ يُحْيِي هَٰذِهِ اللَّهُ بَعْدَ مَوْتِهَا ۖ فَأَمَاتَهُ اللَّهُ مِائَةَ عَامٍ ثُمَّ بَعَثَهُ ۖ قَالَ كَمْ لَبِثْتَ ۖ قَالَ لَبِثْتُ يَوْمًا أَوْ بَعْضَ يَوْمٍ ۖ قَالَ بَل لَّبِثْتَ مِائَةَ عَامٍ فَانظُرْ إِلَىٰ طَعَامِكَ وَشَرَابِكَ لَمْ يَتَسَنَّهْ ۖ وَانظُرْ إِلَىٰ حِمَارِكَ..." }],
      },
      {
        name: "الجمعة",
        count: 1,
        verses: [{ aya: "٥", text: "مَثَلُ الَّذِينَ حُمِّلُوا التَّوْرَاةَ ثُمَّ لَمْ يَحْمِلُوهَا كَمَثَلِ الْحِمَارِ يَحْمِلُ أَسْفَارًا ۚ بِئْسَ مَثَلُ الْقَوْمِ الَّذِينَ كَذَّبُوا بِآيَاتِ اللَّهِ" }],
      },
    ],
  },
  {
    query: "نور",
    label: "نور",
    type: "بحث بكلمة — يشمل جميع المشتقات",
    total: 436,
    suras: [
      {
        name: "البقرة",
        count: 17,
        verses: [
          { aya: "١٧", text: "مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ مَا حَوْلَهُ ذَهَبَ اللَّهُ بِنُورِهِمْ وَتَرَكَهُمْ فِي ظُلُمَاتٍ لَّا يُبْصِرُونَ" },
          { aya: "٢٥٧", text: "اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ ۖ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُم مِّنَ النُّورِ إِلَى الظُّلُمَاتِ" },
        ],
      },
      {
        name: "النساء",
        count: 5,
        verses: [{ aya: "١٧٤", text: "يَا أَيُّهَا النَّاسُ قَدْ جَاءَكُم بُرْهَانٌ مِّن رَّبِّكُمْ وَأَنزَلْنَا إِلَيْكُمْ نُورًا مُّبِينًا" }],
      },
    ],
  },
  {
    query: "ر ح م",
    label: "ر ح م",
    type: "بحث بالجذر — جميع المشتقات الصرفية",
    total: 2248,
    suras: [
      {
        name: "الفاتحة",
        count: 4,
        verses: [
          { aya: "١", text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
          { aya: "٣", text: "الرَّحْمَٰنِ الرَّحِيمِ" },
        ],
      },
      {
        name: "البقرة",
        count: 107,
        verses: [{ aya: "١٦٣", text: "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ" }],
      },
    ],
  },
];

function RootExplorerContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedSuras, setExpandedSuras] = useState<Set<string>>(new Set());
  const [activeExample, setActiveExample] = useState(0);

  const quickExamples = [
    { label: "حمار", desc: "(كلمة)" },
    { label: "ر ح م", desc: "(رحمة)" },
    { label: "ع ق ل", desc: "(عقل)" },
    { label: "ن و ر", desc: "(نور)" },
    { label: "س ل م", desc: "(سلام)" },
    { label: "ق ل ب", desc: "(قلب)" },
    { label: "ك ت ب", desc: "(كتاب)" },
    { label: "ش ك ر", desc: "(شكر)" },
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
    if (q) handleSearch(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groupedBySura: Record<string, any[]> =
    results?.results?.reduce((acc: Record<string, any[]>, item: any) => {
      if (!acc[item.sura_name]) acc[item.sura_name] = [];
      acc[item.sura_name].push(item);
      return acc;
    }, {}) ?? {};

  const toggleSura = (sura: string) => {
    setExpandedSuras((prev) => {
      const next = new Set(prev);
      if (next.has(sura)) next.delete(sura); else next.add(sura);
      return next;
    });
  };

  const ex = EXAMPLES[activeExample];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الجذور و الصرف</h1>
        <p className="text-zinc-400">ابحث عن أي كلمة أو جذر ثلاثي من القرآن الكريم لاستكشاف جميع سياقات وروده.</p>
      </header>

      {/* Search bar */}
      <div className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className="relative max-w-2xl"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب أي كلمة أو جذر (مثال: نور، رحمة، ر ح م، ع ق ل)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pr-12 pl-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-500 transition-all"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2" disabled={loading}>
            {loading
              ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
              : <Search className="w-5 h-5 text-zinc-500 hover:text-teal-400 transition-colors" />}
          </button>
        </form>

        <div className="max-w-2xl">
          <p className="text-xs text-zinc-500 mb-2">جذور وكلمات مقترحة (انقر للبحث الفوري):</p>
          <div className="flex flex-wrap gap-2">
            {quickExamples.map((ex, i) => (
              <button
                key={i}
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
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400">{error}</div>
      )}

      {loading && (
        <div className="flex items-center gap-3 p-6 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>جاري البحث في القرآن الكريم...</span>
        </div>
      )}

      {/* ── Live results ─────────────────────────────────────────────────── */}
      {results && (
        <div className="space-y-4">
          <div className="p-5 border border-zinc-800 rounded-2xl bg-zinc-900/30 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                نتائج: <span className="text-teal-400">{query}</span>
              </h2>
              <p className="text-zinc-400 mt-1 text-sm">
                <span className="text-teal-400 font-medium">{results.pagination?.totalResults ?? 0}</span> نتيجة في{" "}
                <span className="text-teal-400 font-medium">{Object.keys(groupedBySura).length}</span> سورة
                {(results.pagination?.totalResults ?? 0) > 100 && (
                  <span className="text-zinc-500"> — يعرض أول ١٠٠</span>
                )}
              </p>
            </div>
            <div className="text-4xl font-amiri text-teal-500 opacity-20 select-none">{query}</div>
          </div>

          <div className="space-y-3">
            {Object.keys(groupedBySura).length === 0 && (
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-center text-zinc-500">
                لم يتم العثور على نتائج لـ &quot;{query}&quot;. جرب كلمة أو جذراً مختلفاً.
              </div>
            )}
            {Object.entries(groupedBySura).map(([sura, verses]) => {
              const expanded = expandedSuras.has(sura);
              const shown = expanded ? verses : verses.slice(0, 2);
              return (
                <div key={sura} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/20 transition-all overflow-hidden">
                  <button onClick={() => toggleSura(sura)} className="w-full p-4 flex items-center justify-between text-right">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-teal-400">سورة {sura}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{verses.length} آية</span>
                    </div>
                    {verses.length > 2 && (
                      expanded
                        ? <ChevronUp className="w-4 h-4 text-zinc-500" />
                        : <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  <div className="px-4 pb-4 space-y-3">
                    {shown.map((item: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80">
                        <p className="text-xs text-zinc-500 mb-2">آية {item.aya_id_display}</p>
                        <p className="font-amiri text-2xl leading-loose text-zinc-100">{item.uthmani}</p>
                      </div>
                    ))}
                    {!expanded && verses.length > 2 && (
                      <button onClick={() => toggleSura(sura)} className="text-sm text-teal-500 hover:text-teal-400 transition-colors">
                        + {verses.length - 2} آية أخرى
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tested examples (shown only before first search) ─────────────── */}
      {!results && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <FlaskConical className="w-4 h-4 text-teal-500" />
            <span className="font-medium text-zinc-300">أمثلة من بيانات مختبرة فعلياً</span>
            <span className="text-zinc-600">— انقر على مثال لتشغيله مباشرةً</span>
          </div>

          {/* Example tabs */}
          <div className="flex gap-2 flex-wrap">
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => setActiveExample(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeExample === i
                    ? "bg-teal-900/30 border-teal-600/50 text-teal-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <span className="font-amiri text-base ml-1">{e.label}</span>
                <span className="text-xs opacity-60">({e.total.toLocaleString("ar-EG")} نتيجة)</span>
              </button>
            ))}
          </div>

          {/* Example output */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-sm text-zinc-400">البحث عن </span>
                <span className="font-amiri text-lg text-teal-400 mx-1">{ex.label}</span>
                <span className="text-xs text-zinc-500 mr-2">({ex.type})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">
                  <span className="text-teal-400 font-bold">{ex.total.toLocaleString("ar-EG")}</span> نتيجة في{" "}
                  <span className="text-teal-400 font-bold">{ex.suras.length}+</span> سورة
                </span>
                <button
                  onClick={() => handleSearch(ex.query)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors"
                >
                  جرب البحث ←
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {ex.suras.map((s) => (
                <div key={s.name} className="rounded-xl border border-zinc-800 overflow-hidden">
                  <div className="px-4 py-2 bg-zinc-900/60 flex items-center gap-2 text-sm">
                    <span className="text-teal-400 font-medium">سورة {s.name}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">{s.count} آية في هذه السورة</span>
                  </div>
                  {s.verses.map((v) => (
                    <div key={v.aya} className="px-4 py-3 border-t border-zinc-800/50">
                      <p className="text-xs text-zinc-600 mb-1">آية {v.aya}</p>
                      <p className="font-amiri text-xl leading-loose text-zinc-200">{v.text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* How-to guide */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
            <div>
              <p className="text-zinc-200 font-medium mb-1">بحث بالجذر الثلاثي</p>
              <p>اكتب الحروف مفصولة بمسافات: <span className="text-teal-400">ر ح م</span> أو <span className="text-teal-400">ن و ر</span></p>
            </div>
            <div>
              <p className="text-zinc-200 font-medium mb-1">بحث بالكلمة</p>
              <p>اكتب الكلمة مباشرةً: <span className="text-teal-400">رحمة</span> أو <span className="text-teal-400">النور</span></p>
            </div>
            <div>
              <p className="text-zinc-200 font-medium mb-1">النتائج</p>
              <p>تُجمَّع تلقائياً حسب السورة مع إمكانية التوسيع</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RootExplorer() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-3 p-8 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
        <span>جاري التحميل...</span>
      </div>
    }>
      <RootExplorerContent />
    </Suspense>
  );
}
