"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  Network,
  Sparkles,
  GitBranch,
  Search,
  BookOpen,
} from "lucide-react";
import surahs from "@/data/surahs.json";

// ── Local data ───────────────────────────────────────────────────────────────
type Surah = { id: number; name: string; ayahs: number };
const SURAHS = surahs as Surah[];

type Connection = {
  verse_key: string;
  text: string;
  sura_id: number | null;
  sura_name: string | null;
  aya_id: number | null;
  aya_id_display: string | null;
  shared_roots: string[];
  similarity_score: number;
};

type ApiResponse = {
  source: {
    verse_key: string;
    text: string;
    sura_name: string | null;
    aya_id_display: string | null;
  };
  count: number;
  results: Connection[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const ar = (n: number | string) => Number(n).toLocaleString("ar-EG");
const rootLabel = (root: string) => root.replace(/-/g, ""); // ا-ل-ه → اله (connected, review #6)

const EXAMPLES: { key: string; label: string }[] = [
  { key: "2:255", label: "آية الكرسي" },
  { key: "24:35", label: "آية النور" },
  { key: "112:1", label: "الإخلاص" },
  { key: "1:1", label: "البسملة" },
  { key: "59:22", label: "أسماء الله" },
];

// ── Component ────────────────────────────────────────────────────────────────
function SelfReferenceContent() {
  const params = useSearchParams();

  const [surahId, setSurahId] = useState(2);
  const [ayah, setAyah] = useState(255);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const surah = useMemo(
    () => SURAHS.find((s) => s.id === surahId) ?? SURAHS[0],
    [surahId]
  );

  // Top result carries the highest score — used to normalize the strength bars.
  const maxScore = data?.results[0]?.similarity_score ?? 1;

  const run = async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/self-reference?verse=${encodeURIComponent(key)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "تعذّر جلب الروابط.");
      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقّع.");
    } finally {
      setLoading(false);
    }
  };

  const explore = (sId: number, a: number) => {
    const s = SURAHS.find((x) => x.id === sId) ?? SURAHS[0];
    const clamped = Math.min(Math.max(1, a || 1), s.ayahs);
    setSurahId(s.id);
    setAyah(clamped);
    run(`${s.id}:${clamped}`);
  };

  const onSurahChange = (sId: number) => {
    const s = SURAHS.find((x) => x.id === sId) ?? SURAHS[0];
    setSurahId(s.id);
    setAyah((prev) => Math.min(Math.max(1, prev), s.ayahs));
  };

  // Initial load: honor ?verse=2:255 deep links, else default to Ayat al-Kursi.
  useEffect(() => {
    const q = params.get("verse");
    if (q && /^\d{1,3}:\d{1,3}$/.test(q)) {
      const [s, a] = q.split(":").map(Number);
      explore(s, a);
    } else {
      explore(2, 255);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasResults = data && data.results.length > 0 && !loading;
  const isEmpty = data && data.results.length === 0 && !loading;

  return (
    <div className="space-y-8">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الإحالة الذاتية</h1>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 max-w-3xl">
          <div className="flex items-start gap-3">
            <Network className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
            <p className="text-zinc-400 text-sm leading-relaxed">
              يكشف هذا المحرك كيف{" "}
              <span className="text-zinc-200 font-medium">يُحيل القرآن إلى نفسه</span>:
              اختر آية، فيعرض لك الآيات الأكثر ارتباطاً بها عبر{" "}
              <span className="text-teal-400">الجذور المشتركة</span>. كلما زادت
              الجذور المشتركة وكانت أندر في القرآن، اشتدّت قوة الإحالة —{" "}
              <span className="text-zinc-200 font-medium">
                فيشرح النصُّ نفسَه بنفسه.
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* ── Verse selector ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            explore(surahId, ayah);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          {/* Surah dropdown */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">السورة</span>
            <select
              value={surahId}
              onChange={(e) => onSurahChange(Number(e.target.value))}
              className="bg-zinc-900 border border-teal-700/50 rounded-xl py-3 px-4 text-zinc-100 font-amiri text-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all min-w-[12rem] cursor-pointer"
            >
              {SURAHS.map((s) => (
                <option key={s.id} value={s.id} className="font-cairo">
                  {ar(s.id)} · {s.name}
                </option>
              ))}
            </select>
          </label>

          {/* Ayah number */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500">
              الآية{" "}
              <span className="text-zinc-600">
                (١ – {ar(surah.ayahs)})
              </span>
            </span>
            <input
              type="number"
              min={1}
              max={surah.ayahs}
              value={ayah}
              onChange={(e) => {
                const v = Number(e.target.value);
                setAyah(Math.min(Math.max(1, v || 1), surah.ayahs));
              }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl py-3 px-4 text-zinc-100 w-28 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all tabular-nums"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            اكتشف الروابط
          </button>
        </form>

        {/* Example verses */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => {
            const [s, a] = ex.key.split(":").map(Number);
            const active = data?.source.verse_key === ex.key;
            return (
              <button
                key={ex.key}
                onClick={() => explore(s, a)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "border-teal-700/60 bg-teal-900/20 text-teal-300"
                    : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                <span className="font-amiri text-sm">{ex.label}</span>
                <span className="text-zinc-600 tabular-nums">{ar(s)}:{ar(a)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400">
          {error}
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center gap-3 p-6 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>يجري تتبّع شبكة الجذور عبر المصحف...</span>
        </div>
      )}

      {/* ── Source verse ─────────────────────────────────────────────────── */}
      {data && !loading && (
        <div className="rounded-2xl border border-teal-900/40 bg-gradient-to-bl from-teal-950/30 to-zinc-900/20 overflow-hidden">
          <div className="px-5 py-2.5 bg-teal-950/30 border-b border-teal-900/30 flex items-center gap-2 text-xs">
            <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-teal-300 font-medium">الآية المختارة</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              سورة {data.source.sura_name} — آية {data.source.aya_id_display}
            </span>
          </div>
          <div className="p-6">
            <p className="font-amiri text-3xl text-zinc-50 leading-loose text-right">
              {data.source.text}
            </p>
          </div>
        </div>
      )}

      {/* ── Connected verses ─────────────────────────────────────────────── */}
      {hasResults && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
            <h2 className="font-bold text-zinc-100">الآيات المترابطة</h2>
            <span className="text-xs text-zinc-500">
              {ar(data!.count)} آية مرتبطة، مرتّبة حسب قوة الإحالة عبر الجذور المشتركة
            </span>
          </div>

          <div className="space-y-3">
            {data!.results.map((c, i) => {
              const pct = Math.max(6, Math.round((c.similarity_score / maxScore) * 100));
              return (
                <div
                  key={c.verse_key}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-teal-900/50 transition-colors"
                >
                  {/* Card header */}
                  <div className="px-4 py-2.5 bg-zinc-900 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-600 tabular-nums text-xs">
                        {ar(i + 1)}.
                      </span>
                      <span className="font-amiri text-base text-zinc-100">
                        سورة {c.sura_name}
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-500 text-xs">
                        آية {c.aya_id_display}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <GitBranch className="w-3.5 h-3.5 text-teal-500/70" />
                      <span className="tabular-nums">
                        {ar(c.shared_roots.length)} جذور مشتركة
                      </span>
                    </div>
                  </div>

                  {/* Connection strength bar */}
                  <div className="px-4 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-teal-400 to-teal-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-teal-500/80 tabular-nums shrink-0 w-10 text-left">
                        {c.similarity_score.toLocaleString("ar-EG", {
                          maximumFractionDigits: 1,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Arabic verse text */}
                  <div className="px-4 pt-4 pb-3">
                    <p className="font-amiri text-2xl text-zinc-100 leading-loose text-right">
                      {c.text}
                    </p>
                  </div>

                  {/* Shared roots — highlighted in teal */}
                  <div className="px-4 pb-4 flex flex-wrap gap-1.5 border-t border-zinc-800/50 pt-3">
                    {c.shared_roots.map((root) => (
                      <span
                        key={root}
                        title="جذر مشترك"
                        className="px-2 py-0.5 rounded-md bg-teal-900/40 text-teal-300 border border-teal-800/50 font-amiri text-base"
                      >
                        {rootLabel(root)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/20 text-center space-y-2">
          <p className="text-zinc-400">
            لا تشترك هذه الآية مع غيرها في ثلاثة جذور فأكثر.
          </p>
          <p className="text-xs text-zinc-600">
            الآيات القصيرة قليلة الجذور لا تُكوِّن روابط كافية — جرّب آية أطول.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SelfReference() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 p-8 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>جاري التحميل...</span>
        </div>
      }
    >
      <SelfReferenceContent />
    </Suspense>
  );
}
