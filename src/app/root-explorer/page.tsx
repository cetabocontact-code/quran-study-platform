"use client";

import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

export default function RootExplorer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

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

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError("حدث خطأ أثناء البحث. تأكد من تشغيل الخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الجذور و الصرف</h1>
        <p className="text-zinc-400">تحليل الجذور اللغوية وسياقات ورودها في القرآن الكريم.</p>
      </header>
      
      <div className="space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className="relative max-w-2xl"
        >
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن جذر أو كلمة (مثل: حمار، ر ح م، ع ق ل)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pr-12 pl-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-500 transition-all"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" /> : <Search className="w-5 h-5 text-zinc-500 hover:text-teal-400 transition-colors" />}
          </button>
        </form>

        <div className="max-w-2xl">
          <div className="text-sm text-zinc-500 mb-2">أمثلة مقترحة للتجربة (انقر للتجربة):</div>
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

      {results && (
        <div className="space-y-6">
          <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/30 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">نتائج البحث عن: <span className="text-teal-400">{query}</span></h2>
              <p className="text-zinc-400 mt-1">تم العثور على {results.pagination.totalResults} نتيجة مطابقة في القرآن.</p>
            </div>
            <div className="text-5xl font-amiri text-teal-500 opacity-20">{query}</div>
          </div>

          <div className="space-y-4">
            {results.results.map((item: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/30 transition-all">
                <div className="flex items-center gap-2 mb-4 text-sm text-teal-400 font-medium">
                  <span>سورة {item.sura_name}</span>
                  <span className="text-zinc-600">•</span>
                  <span>آية {item.aya_id_display}</span>
                </div>
                <p className="font-amiri text-2xl leading-loose text-zinc-100">
                  {item.uthmani}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
