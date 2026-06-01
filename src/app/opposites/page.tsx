"use client";

import { ArrowLeftRight, Loader2, Scale, Search, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import pairsData from "@/data/opposite_pairs.json";

type Side = { label: string; query: string };

type Verse = {
  gid: number;
  surahId: number;
  surahName: string;
  ayahDisplay: string;
  juz: number;
  text: string;
};

type SideStats = {
  label: string;
  query: string;
  verseCount: number;
  occurrenceCount: number;
  surahDistribution: { surahId: number; surahName: string; count: number }[];
  sampleVerses: Verse[];
};

type OppositeInsight = {
  pair: { id: string; theme: string; a: Side; b: Side };
  typedSide: "a" | "b" | null;
  a: SideStats;
  b: SideStats;
  coOccurrence: { count: number; verses: Verse[] };
  generatedAt: string;
};

const PAIRS = pairsData as {
  pairs: { id: string; theme: string; a: Side; b: Side }[];
};

const toArabicNumber = (value: number): string => value.toLocaleString("ar-EG");

export default function OppositesPage() {
  const [insight, setInsight] = useState<OppositeInsight | null>(null);
  const [wordInput, setWordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState("");

  const load = async (params?: { word?: string; id?: string }) => {
    setLoading(true);
    setError("");
    setNotFound("");

    try {
      const qs = params?.id
        ? `?id=${encodeURIComponent(params.id)}`
        : params?.word
        ? `?word=${encodeURIComponent(params.word)}`
        : "";
      const response = await fetch(`/api/opposites${qs}`);
      const data = await response.json();

      if (response.status === 404) {
        setNotFound(data.error ?? "لا يوجد ضدّ معروف لهذه الكلمة بعد");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error ?? "تعذّر تحميل الأضداد");
      }

      setInsight(data.insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  // Open on a featured pair so the page never starts empty.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const word = wordInput.trim();
    if (word) load({ word });
  };

  const maxOccurrence = useMemo(() => {
    if (!insight) return 1;
    return Math.max(insight.a.occurrenceCount, insight.b.occurrenceCount, 1);
  }, [insight]);

  const maxVerse = useMemo(() => {
    if (!insight) return 1;
    return Math.max(insight.a.verseCount, insight.b.verseCount, 1);
  }, [insight]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-sm text-teal-300">
          <Scale className="h-4 w-4" />
          <span>الأضداد القرآنية</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-100 md:text-4xl">الأضداد</h1>
          <p className="max-w-3xl text-zinc-400">
            اكتب كلمة فيظهر لك ضدّها في القرآن، ومعهما إحصاءات حيّة عن كلٍّ منهما:
            عدد الورود، عدد الآيات، توزيع السور، والمواضع التي يلتقيان فيها.
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/45 p-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              value={wordInput}
              onChange={(event) => setWordInput(event.target.value)}
              placeholder="اكتب كلمة مثل: الدنيا"
              className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 pr-11 pl-4 font-amiri text-xl text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-500/20"
            />
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 font-semibold text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            <span>اكتشف الضدّ</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {PAIRS.pairs.map((pair) => (
            <button
              key={pair.id}
              onClick={() => {
                setWordInput("");
                load({ id: pair.id });
              }}
              className="group rounded-full border border-zinc-700 bg-zinc-950/70 px-4 py-2 transition-all hover:border-teal-400/70 hover:bg-teal-500/10"
            >
              <span className="font-amiri text-lg text-zinc-100 group-hover:text-teal-200">
                {pair.a.label}
              </span>
              <ArrowLeftRight className="mx-2 inline h-3.5 w-3.5 text-zinc-600 group-hover:text-teal-400" />
              <span className="font-amiri text-lg text-zinc-100 group-hover:text-amber-200">
                {pair.b.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4 text-red-300">
          {error}
        </div>
      )}

      {notFound && (
        <section className="rounded-3xl border border-amber-700/40 bg-amber-950/15 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-zinc-100">{notFound}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-zinc-500">
            جرّب إحدى الأزواج المختارة أعلاه — قائمة الأضداد منتقاة بعناية وتتوسّع تدريجياً.
          </p>
        </section>
      )}

      {loading && !insight && (
        <div className="flex items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/45 p-16 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {insight && (
        <section className="space-y-6">
          {/* Hero comparison */}
          <div className="rounded-3xl border border-teal-500/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/20 p-7 shadow-2xl shadow-black/20">
            <div className="mb-6 flex items-center justify-center">
              <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-1 font-amiri text-base text-zinc-300">
                {insight.pair.theme}
              </span>
            </div>

            <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
              <WordHead
                stats={insight.a}
                accent="teal"
                typed={insight.typedSide === "a"}
              />

              <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-950/60">
                  <ArrowLeftRight className="h-5 w-5 text-teal-300" />
                </div>
                <span className="font-amiri text-sm">ضدّان</span>
              </div>

              <WordHead
                stats={insight.b}
                accent="amber"
                typed={insight.typedSide === "b"}
              />
            </div>

            {/* Numeric balance */}
            <div className="mt-8 space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Scale className="h-4 w-4 text-teal-300" />
                <span>الموازنة العددية</span>
              </div>
              <BalanceRow
                label="عدد الورود"
                aLabel={insight.a.label}
                bLabel={insight.b.label}
                aValue={insight.a.occurrenceCount}
                bValue={insight.b.occurrenceCount}
                max={maxOccurrence}
              />
              <BalanceRow
                label="عدد الآيات"
                aLabel={insight.a.label}
                bLabel={insight.b.label}
                aValue={insight.a.verseCount}
                bValue={insight.b.verseCount}
                max={maxVerse}
              />
            </div>
          </div>

          {/* Surah distribution side by side */}
          <div className="grid gap-5 lg:grid-cols-2">
            <SurahCard stats={insight.a} accent="teal" />
            <SurahCard stats={insight.b} accent="amber" />
          </div>

          {/* Co-occurrence */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
                <ArrowLeftRight className="h-5 w-5 text-teal-300" />
                حيث يلتقيان
              </h2>
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                {toArabicNumber(insight.coOccurrence.count)} آية يجتمعان فيها
              </span>
            </div>

            {insight.coOccurrence.count === 0 ? (
              <p className="text-zinc-500">
                لا تجتمع الكلمتان في آية واحدة — كلٌّ منهما يسكن سياقه الخاصّ.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {insight.coOccurrence.verses.map((verse) => (
                  <VerseCard key={verse.gid} verse={verse} accent="teal" />
                ))}
              </div>
            )}
          </div>

          {/* Sample verses side by side */}
          <div className="grid gap-5 lg:grid-cols-2">
            <SampleCard stats={insight.a} accent="teal" />
            <SampleCard stats={insight.b} accent="amber" />
          </div>
        </section>
      )}
    </div>
  );
}

type Accent = "teal" | "amber";

const accentText: Record<Accent, string> = {
  teal: "text-teal-200",
  amber: "text-amber-200",
};
const accentRing: Record<Accent, string> = {
  teal: "border-teal-500/40 ring-1 ring-teal-500/20",
  amber: "border-amber-500/40 ring-1 ring-amber-500/20",
};
const accentBar: Record<Accent, string> = {
  teal: "from-teal-300 to-teal-600",
  amber: "from-amber-300 to-amber-600",
};
const accentChip: Record<Accent, string> = {
  teal: "text-teal-300",
  amber: "text-amber-300",
};

function WordHead({
  stats,
  accent,
  typed,
}: {
  stats: SideStats;
  accent: Accent;
  typed: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-zinc-950/40 p-5 text-center transition-all ${
        typed ? accentRing[accent] : "border-zinc-800"
      }`}
    >
      {typed && (
        <div className={`mb-2 text-xs font-medium ${accentChip[accent]}`}>كلمتك</div>
      )}
      <div className={`font-amiri text-5xl leading-[1.4] md:text-6xl ${accentText[accent]}`}>
        {stats.label}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-2">
          <div className="text-xs text-zinc-500">ورود</div>
          <div className="text-2xl font-bold tabular-nums text-zinc-50">
            {toArabicNumber(stats.occurrenceCount)}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-2">
          <div className="text-xs text-zinc-500">آيات</div>
          <div className="text-2xl font-bold tabular-nums text-zinc-50">
            {toArabicNumber(stats.verseCount)}
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceRow({
  label,
  aLabel,
  bLabel,
  aValue,
  bValue,
  max,
}: {
  label: string;
  aLabel: string;
  bLabel: string;
  aValue: number;
  bValue: number;
  max: number;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 font-amiri text-base text-teal-200">{aLabel}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-l from-teal-300 to-teal-600"
              style={{ width: `${Math.max(6, (aValue / max) * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-left tabular-nums text-sm text-teal-300">
            {toArabicNumber(aValue)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 font-amiri text-base text-amber-200">{bLabel}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-l from-amber-300 to-amber-600"
              style={{ width: `${Math.max(6, (bValue / max) * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-left tabular-nums text-sm text-amber-300">
            {toArabicNumber(bValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SurahCard({ stats, accent }: { stats: SideStats; accent: Accent }) {
  const maxCount = Math.max(...stats.surahDistribution.map((s) => s.count), 1);
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <span className={`font-amiri text-2xl ${accentText[accent]}`}>{stats.label}</span>
          <span className="text-sm font-normal text-zinc-500">· توزيع السور</span>
        </h2>
      </div>
      {stats.surahDistribution.length === 0 ? (
        <p className="text-zinc-500">لا توجد مواضع.</p>
      ) : (
        <div className="space-y-4">
          {stats.surahDistribution.map((item) => (
            <div key={item.surahId} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-zinc-200">سورة {item.surahName}</span>
                <span className={`tabular-nums ${accentChip[accent]}`}>
                  {toArabicNumber(item.count)}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-l ${accentBar[accent]}`}
                  style={{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SampleCard({ stats, accent }: { stats: SideStats; accent: Accent }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 p-6">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-zinc-100">
        <span className={`font-amiri text-2xl ${accentText[accent]}`}>{stats.label}</span>
        <span className="text-sm font-normal text-zinc-500">· آيات عينة</span>
      </h2>
      {stats.sampleVerses.length === 0 ? (
        <p className="text-zinc-500">لا توجد آيات.</p>
      ) : (
        <div className="space-y-4">
          {stats.sampleVerses.map((verse) => (
            <VerseCard key={verse.gid} verse={verse} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}

function VerseCard({ verse, accent }: { verse: Verse; accent: Accent }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/45 p-5 transition-colors hover:border-zinc-700">
      <div className={`mb-3 text-sm ${accentChip[accent]}`}>
        سورة {verse.surahName} · آية {verse.ayahDisplay}
      </div>
      <p className="font-amiri text-2xl leading-[2.1] text-zinc-100 md:text-3xl">
        {verse.text}
      </p>
    </article>
  );
}
