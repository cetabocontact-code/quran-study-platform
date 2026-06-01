"use client";

import { Hash, Loader2, Search, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type DiscoveryInsight = {
  root: string;
  rootLabel: string;
  occurrenceCount: number;
  verseCount: number;
  topCoOccurringRoots: { root: string; label: string; count: number }[];
  surahDistribution: { surahId: number; surahName: string; count: number }[];
  positionalPatterns: {
    openingVerses: number;
    closingVerses: number;
    firstAyah: number;
    lastAyah: number;
  };
  sampleVerses: {
    gid: number;
    surahId: number;
    surahName: string;
    ayah: number;
    ayahDisplay: string;
    text: string;
  }[];
  description: string;
};

const toArabicNumber = (value: number): string => value.toLocaleString("ar-EG");

export default function DiscoveryPage() {
  const [insight, setInsight] = useState<DiscoveryInsight | null>(null);
  const [rootInput, setRootInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxSurahCount = useMemo(() => {
    if (!insight?.surahDistribution.length) return 1;
    return Math.max(...insight.surahDistribution.map((item) => item.count));
  }, [insight]);

  const loadInsight = async (root?: string) => {
    setLoading(true);
    setError("");

    try {
      const params = root ? `?root=${encodeURIComponent(root)}` : "";
      const response = await fetch(`/api/discovery${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "تعذر تحميل الاكتشاف");
      }

      setInsight(data.insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleRootSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const root = rootInput.trim();
    if (root) loadInsight(root);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-sm text-teal-300">
          <Sparkles className="h-4 w-4" />
          <span>اكتشاف الأنماط</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-100 md:text-4xl">وضع الاكتشاف</h1>
          <p className="max-w-3xl text-zinc-400">
            أنماط جذرية تظهر من توزيع الألفاظ، وتجاور الجذور، ومواضعها داخل السور.
          </p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <form
          onSubmit={handleRootSearch}
          className="flex min-w-0 flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              value={rootInput}
              onChange={(event) => setRootInput(event.target.value)}
              placeholder="اكتب جذرا مثل: ر ح م"
              className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 pr-11 pl-4 font-amiri text-xl text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-500/20"
            />
            <Hash className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 font-semibold text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>استكشف الجذر</span>
          </button>
        </form>

        <button
          onClick={() => loadInsight()}
          disabled={loading}
          className="inline-flex h-full min-h-20 items-center justify-center gap-2 rounded-2xl border border-teal-500/30 bg-teal-500/10 px-6 font-semibold text-teal-200 transition-all hover:border-teal-400/60 hover:bg-teal-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          <span>اكتشف نمطا</span>
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-red-300">
          {error}
        </div>
      )}

      {!insight && !loading && !error && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/25 bg-teal-500/10 text-teal-300">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-zinc-100">ابدأ باكتشاف نمط</h2>
          <p className="mx-auto mt-2 max-w-2xl text-zinc-500">
            اختر جذرا محددا، أو دع النظام يعرض جذرا من بيانات القرآن.
          </p>
        </section>
      )}

      {insight && (
        <section className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-teal-500/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/30 p-7 shadow-2xl shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="text-sm text-zinc-500">الجذر</div>
                  <div className="mt-3 font-amiri text-6xl leading-[1.35] text-teal-200 md:text-7xl">
                    {insight.rootLabel}
                  </div>
                </div>
                <div className="rounded-2xl border border-teal-500/20 bg-zinc-950/50 px-5 py-4 text-center">
                  <div className="text-sm text-zinc-500">عدد الورود</div>
                  <div className="mt-1 text-4xl font-bold tabular-nums text-zinc-50">
                    {toArabicNumber(insight.occurrenceCount)}
                  </div>
                </div>
              </div>

              <p className="mt-7 text-lg leading-9 text-zinc-300">{insight.description}</p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="آيات" value={insight.verseCount} />
                <Metric label="أوائل السور" value={insight.positionalPatterns.openingVerses} />
                <Metric label="أواخر السور" value={insight.positionalPatterns.closingVerses} />
                <Metric label="فاتحة السورة" value={insight.positionalPatterns.firstAyah} />
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-zinc-100">توزيع السور</h2>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                  أعلى {toArabicNumber(insight.surahDistribution.length)}
                </span>
              </div>

              <div className="space-y-4">
                {insight.surahDistribution.map((item) => (
                  <div key={item.surahId} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-zinc-200">سورة {item.surahName}</span>
                      <span className="tabular-nums text-teal-300">{toArabicNumber(item.count)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-teal-300 to-teal-600"
                        style={{ width: `${Math.max(8, (item.count / maxSurahCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-6">
              <h2 className="mb-5 text-xl font-bold text-zinc-100">الجذور المتجاورة</h2>
              <div className="flex flex-wrap gap-2">
                {insight.topCoOccurringRoots.map((item) => (
                  <button
                    key={item.root}
                    onClick={() => {
                      setRootInput(item.label);
                      loadInsight(item.root);
                    }}
                    className="group rounded-full border border-zinc-700 bg-zinc-950/70 px-4 py-2 transition-all hover:border-teal-400/70 hover:bg-teal-500/10"
                  >
                    <span className="font-amiri text-xl text-zinc-100 group-hover:text-teal-200">
                      {item.label}
                    </span>
                    <span className="mr-2 text-xs tabular-nums text-zinc-500 group-hover:text-teal-300">
                      {toArabicNumber(item.count)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-6">
              <h2 className="mb-5 text-xl font-bold text-zinc-100">آيات عينة</h2>
              <div className="space-y-4">
                {insight.sampleVerses.map((verse) => (
                  <article
                    key={verse.gid}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/45 p-5 transition-colors hover:border-teal-500/20"
                  >
                    <div className="mb-3 text-sm text-teal-300">
                      سورة {verse.surahName} · آية {verse.ayahDisplay}
                    </div>
                    <p className="font-amiri text-2xl leading-[2.1] text-zinc-100 md:text-3xl">
                      {verse.text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/45 p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-zinc-100">
        {toArabicNumber(value)}
      </div>
    </div>
  );
}
