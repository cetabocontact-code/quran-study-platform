"use client";

import {
  ArrowLeftRight,
  Layers,
  Sparkles,
  Loader2,
  Search,
  FlaskConical,
  Network,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ── Semantic pairs ─────────────────────────────────────────────────────────────
// The Quran constructs meaning through internal polarity: each concept acquires
// its depth through its opposite or companion concept. These curated pairs are
// the primary structural axes of the Quran's semantic architecture.
const PAIRS: Record<string, { b: string; labelA: string; labelB: string }> = {
  "نور":   { b: "ظلمة",  labelA: "النور",   labelB: "الظلمة"  },
  "ظلمة":  { b: "نور",   labelA: "الظلمة",  labelB: "النور"   },
  "ر ح م": { b: "ع ذ ب", labelA: "الرحمة",  labelB: "العذاب"  },
  "ع ذ ب": { b: "ر ح م", labelA: "العذاب",  labelB: "الرحمة"  },
  "ه د ى": { b: "ض ل ل", labelA: "الهدى",   labelB: "الضلال"  },
  "ض ل ل": { b: "ه د ى", labelA: "الضلال",  labelB: "الهدى"   },
  "ح ي ا": { b: "م و ت", labelA: "الحياة",  labelB: "الموت"   },
  "م و ت": { b: "ح ي ا", labelA: "الموت",   labelB: "الحياة"  },
  "ع ل م": { b: "ج ه ل", labelA: "العلم",   labelB: "الجهل"   },
  "ج ه ل": { b: "ع ل م", labelA: "الجهل",   labelB: "العلم"   },
  "ع د ل": { b: "ظ ل م", labelA: "العدل",   labelB: "الظلم"   },
  "ظ ل م": { b: "ع د ل", labelA: "الظلم",   labelB: "العدل"   },
  "ص ب ر": { b: "ش ك ر", labelA: "الصبر",   labelB: "الشكر"   },
  "ش ك ر": { b: "ص ب ر", labelA: "الشكر",   labelB: "الصبر"   },
  "ق ل ب": { b: "ع ق ل", labelA: "القلب",   labelB: "العقل"   },
  "ع ق ل": { b: "ق ل ب", labelA: "العقل",   labelB: "القلب"   },
  "ن ف س": { b: "ر و ح", labelA: "النفس",   labelB: "الروح"   },
  "ر و ح": { b: "ن ف س", labelA: "الروح",   labelB: "النفس"   },
  "ك ت ب": { b: "ح ك م", labelA: "الكتاب",  labelB: "الحكمة"  },
  "ح ك م": { b: "ك ت ب", labelA: "الحكمة",  labelB: "الكتاب"  },
  "ن و ر": { b: "ظ ل م", labelA: "النور",   labelB: "الظلام"  },
};

const QUICK_PAIRS = [
  { a: "نور",   b: "ظلمة",  labelA: "النور",  labelB: "الظلمة"  },
  { a: "ر ح م", b: "ع ذ ب", labelA: "الرحمة", labelB: "العذاب"  },
  { a: "ه د ى", b: "ض ل ل", labelA: "الهدى",  labelB: "الضلال"  },
  { a: "ح ي ا", b: "م و ت", labelA: "الحياة", labelB: "الموت"   },
  { a: "ع ل م", b: "ج ه ل", labelA: "العلم",  labelB: "الجهل"   },
  { a: "ق ل ب", b: "ع ق ل", labelA: "القلب",  labelB: "العقل"   },
  { a: "ص ب ر", b: "ش ك ر", labelA: "الصبر",  labelB: "الشكر"   },
];

// ── Component ──────────────────────────────────────────────────────────────────
function SelfReferenceContent() {
  const searchParams = useSearchParams();

  const [inputA, setInputA] = useState("نور");
  const [inputB, setInputB] = useState("ظلمة");
  const [loading, setLoading] = useState(false);
  const [resultsA, setResultsA] = useState<any>(null);
  const [resultsB, setResultsB] = useState<any>(null);
  const [labelA, setLabelA] = useState("النور");
  const [labelB, setLabelB] = useState("الظلمة");
  const [error, setError] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  // Derive display labels from the query strings
  function getLabels(a: string, b: string): [string, string] {
    const lA = PAIRS[a]?.labelA ?? a;
    const lB = PAIRS[a]?.labelB ?? PAIRS[b]?.labelA ?? b;
    return [lA, lB];
  }

  const runPair = async (a: string, b: string, def = false) => {
    const trimA = a.trim();
    const trimB = b.trim();
    if (!trimA || !trimB) return;
    const [lA, lB] = getLabels(trimA, trimB);
    setLabelA(lA);
    setLabelB(lB);
    setLoading(true);
    setError("");
    setResultsA(null);
    setResultsB(null);
    setIsDefault(def);
    try {
      const [ra, rb] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(trimA)}`).then(r => r.json()),
        fetch(`/api/search?q=${encodeURIComponent(trimB)}`).then(r => r.json()),
      ]);
      if (ra.error) throw new Error(ra.error);
      if (rb.error) throw new Error(rb.error);
      setResultsA(ra);
      setResultsB(rb);
    } catch {
      setError("حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill B when A matches a known pair
  const onChangeA = (val: string) => {
    setInputA(val);
    const p = PAIRS[val.trim()];
    if (p) setInputB(p.b);
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      const p = PAIRS[q.trim()];
      setInputA(q.trim());
      if (p) {
        setInputB(p.b);
        runPair(q.trim(), p.b, false);
      } else {
        runPair(q.trim(), "ظلمة", false);
      }
    } else {
      runPair("نور", "ظلمة", true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived computations ───────────────────────────────────────────────────
  // API now pre-filters to exact matches; keep the belt-and-suspenders
  // filter here as a safety net in case of a cold-cache fallback response.
  const listA: any[] = resultsA?.results ?? [];
  const listB: any[] = resultsB?.results ?? [];

  const exactA = listA.filter((r: any) => r.matchType === "exact");
  const exactB = listB.filter((r: any) => r.matchType === "exact");
  const useA   = exactA.length > 0 ? exactA : listA;
  const useB   = exactB.length > 0 ? exactB : listB;

  // Verse-level co-occurrence: same verse (gid) in both result sets
  const gidsA = new Set(useA.map((r: any) => r.gid as string));
  const gidsB = new Set(useB.map((r: any) => r.gid as string));
  const coVerses = useA.filter((r: any) => gidsB.has(r.gid));
  const coBMap: Record<string, any> = {};
  for (const r of useB) {
    if (gidsA.has(r.gid)) coBMap[r.gid] = r;
  }

  // Surah-level grouping
  const groupA: Record<string, any[]> = {};
  for (const r of useA) {
    if (!groupA[r.sura_name]) groupA[r.sura_name] = [];
    groupA[r.sura_name].push(r);
  }
  const groupB: Record<string, any[]> = {};
  for (const r of useB) {
    if (!groupB[r.sura_name]) groupB[r.sura_name] = [];
    groupB[r.sura_name].push(r);
  }

  const surasA = new Set(Object.keys(groupA));
  const surasB = new Set(Object.keys(groupB));
  const intersectionSuras = Object.keys(groupA)
    .filter(s => surasB.has(s))
    .sort(
      (a, b) =>
        (groupA[b].length + (groupB[b]?.length ?? 0)) -
        (groupA[a].length + (groupB[a]?.length ?? 0))
    )
    .slice(0, 8);

  const onlyACount = [...surasA].filter(s => !surasB.has(s)).length;
  const onlyBCount = [...surasB].filter(s => !surasA.has(s)).length;
  const totalA = resultsA?.pagination?.totalResults ?? 0;
  const totalB = resultsB?.pagination?.totalResults ?? 0;

  const hasResults = resultsA && resultsB && !loading;

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">محرك الإحالة الذاتية</h1>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 max-w-3xl">
          <div className="flex items-start gap-3">
            <Network className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
            <p className="text-zinc-400 text-sm leading-relaxed">
              القرآن الكريم يبني معانيه من الداخل عبر{" "}
              <span className="text-zinc-200 font-medium">إحالات ذاتية</span>{" "}
              — كل مفهوم يكتسب عمقه من مقابله أو مرافقه في نفس النص.
              أدخل{" "}
              <span className="text-teal-400">مفهومين متقابلين أو متلازمين</span>،
              وسيكشف المحرك: أيّ السور تجمعهما، وأيّ الآيات تحوي
              كليهما في سطر واحد —{" "}
              <span className="text-zinc-200 font-medium">
                تلك هي نقاط الإحالة الذاتية الحقيقية.
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* ── Pair search ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <form
          onSubmit={e => { e.preventDefault(); runPair(inputA, inputB); }}
          className="flex items-center gap-3 max-w-2xl flex-wrap sm:flex-nowrap"
        >
          <input
            type="text"
            value={inputA}
            onChange={e => onChangeA(e.target.value)}
            placeholder="المفهوم الأول — مثل: نور، ر ح م"
            className="flex-1 min-w-0 bg-zinc-900 border border-teal-700/50 rounded-xl py-3 px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-600 transition-all"
          />
          <ArrowLeftRight className="w-5 h-5 text-zinc-600 shrink-0" />
          <input
            type="text"
            value={inputB}
            onChange={e => setInputB(e.target.value)}
            placeholder="المفهوم الثاني — مثل: ظلمة، ع ذ ب"
            className="flex-1 min-w-0 bg-zinc-900 border border-amber-700/40 rounded-xl py-3 px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/70 placeholder-zinc-600 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 px-5 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
            كشف
          </button>
        </form>

        {/* Quick pairs */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PAIRS.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setInputA(p.a);
                setInputB(p.b);
                runPair(p.a, p.b);
              }}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-teal-400 font-amiri text-sm">{p.labelA}</span>
              <ArrowLeftRight className="w-3 h-3 text-zinc-600" />
              <span className="text-amber-400 font-amiri text-sm">{p.labelB}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400">
          {error}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center gap-3 p-6 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>يُحلَّل التوزيع الدلالي لمفهومَين في آنٍ واحد...</span>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && (
        <div className="space-y-8">

          {isDefault && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-900/40 bg-teal-900/10 text-sm text-teal-300">
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span>مثال مختبر — جرّب أي زوج آخر بالبحث أعلاه أو الأزواج السريعة</span>
            </div>
          )}

          {/* Three-zone overview */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-4 space-y-1">
              <div className="text-3xl font-bold text-teal-400 tabular-nums">{onlyACount}</div>
              <div className="text-xs text-zinc-500">سورة تختص بـ</div>
              <div className="font-amiri text-base text-teal-300">{labelA}</div>
              <div className="text-xs text-zinc-600 tabular-nums">
                {totalA.toLocaleString("ar-EG")} آية
              </div>
            </div>
            <div className="rounded-xl border border-purple-900/50 bg-purple-950/20 p-4 space-y-1">
              <div className="text-3xl font-bold text-purple-400 tabular-nums">
                {intersectionSuras.length}+
              </div>
              <div className="text-xs text-zinc-300 font-medium">سورة تجمعهما</div>
              <div className="text-xs text-purple-400/80">نقطة الإحالة</div>
              {coVerses.length > 0 && (
                <div className="text-xs text-purple-300 tabular-nums">
                  {coVerses.length} آية بكليهما
                </div>
              )}
            </div>
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 space-y-1">
              <div className="text-3xl font-bold text-amber-400 tabular-nums">{onlyBCount}</div>
              <div className="text-xs text-zinc-500">سورة تختص بـ</div>
              <div className="font-amiri text-base text-amber-300">{labelB}</div>
              <div className="text-xs text-zinc-600 tabular-nums">
                {totalB.toLocaleString("ar-EG")} آية
              </div>
            </div>
          </div>

          {/* ── Co-occurrence verses — the crown jewel ──────────────────────── */}
          {coVerses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <h2 className="font-bold text-zinc-100">آيات الإحالة الذاتية المباشرة</h2>
                <span className="text-xs text-zinc-500">
                  الآيات التي يرد فيها كِلا المفهومَين صراحةً في سطر واحد
                </span>
              </div>
              <div className="space-y-3">
                {coVerses.slice(0, 7).map((vA: any) => {
                  const vB = coBMap[vA.gid];
                  return (
                    <div
                      key={vA.gid}
                      className="rounded-xl border border-purple-900/30 bg-purple-950/10 overflow-hidden"
                    >
                      <div className="px-4 py-2 bg-purple-950/20 flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-purple-300 font-medium">{vA.sura_name}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-zinc-500">آية {vA.aya_id_display}</span>
                        {/* Teal badge = A's matched word */}
                        {vA.matchedTokens?.[0] && (
                          <span
                            title={`${labelA} — الكلمة المطابقة`}
                            className="px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-800/50 font-amiri text-sm"
                          >
                            {vA.matchedTokens[0]}
                          </span>
                        )}
                        {/* Amber badge = B's matched word */}
                        {vB?.matchedTokens?.[0] &&
                          vB.matchedTokens[0] !== vA.matchedTokens?.[0] && (
                            <span
                              title={`${labelB} — الكلمة المطابقة`}
                              className="px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 border border-amber-800/40 font-amiri text-sm"
                            >
                              {vB.matchedTokens[0]}
                            </span>
                          )}
                      </div>
                      <div className="p-5">
                        <p className="font-amiri text-2xl text-zinc-100 leading-loose">
                          {vA.uthmani}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {coVerses.length > 7 && (
                  <p className="text-sm text-zinc-600 text-center py-2">
                    + {coVerses.length - 7} آية أخرى تجمع{" "}
                    <span className="text-teal-400">{labelA}</span> و
                    <span className="text-amber-400">{labelB}</span> في سطر واحد
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Intersection surahs — distribution fingerprint ──────────────── */}
          {intersectionSuras.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Layers className="w-5 h-5 text-zinc-400 shrink-0" />
                <h2 className="font-bold text-zinc-100">السور الجامعة</h2>
                <span className="text-xs text-zinc-500">
                  مرتبة حسب الكثافة الدلالية المشتركة
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intersectionSuras.map(sura => {
                  const vA = groupA[sura] ?? [];
                  const vB = groupB[sura] ?? [];
                  const mx = Math.max(vA.length, vB.length, 1);
                  return (
                    <div
                      key={sura}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
                    >
                      {/* Surah header */}
                      <div className="px-4 py-3 bg-zinc-900 flex items-center justify-between">
                        <span className="font-amiri text-lg font-bold text-zinc-100">
                          سورة {sura}
                        </span>
                        <div className="flex items-center gap-4 text-xs tabular-nums">
                          <span className="text-teal-400">{labelA}: {vA.length}</span>
                          <span className="text-amber-400">{labelB}: {vB.length}</span>
                        </div>
                      </div>
                      {/* Comparative bars */}
                      <div className="px-4 pt-3 pb-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-teal-500/70 shrink-0 min-w-0">
                            {labelA}
                          </span>
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500/70 rounded-full"
                              style={{ width: `${Math.round((vA.length / mx) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-500/70 shrink-0 min-w-0">
                            {labelB}
                          </span>
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500/70 rounded-full"
                              style={{ width: `${Math.round((vB.length / mx) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Sample verse from A */}
                      {vA[0] && (
                        <div className="px-4 pb-4 pt-2 border-t border-zinc-800/50">
                          <p className="font-amiri text-lg text-zinc-300 leading-loose">
                            {vA[0].uthmani}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-600">
                            <span>— آية {vA[0].aya_id_display}</span>
                            {vA[0].matchedTokens?.[0] && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-900/40 text-teal-400/80 border border-teal-900/40 font-amiri">
                                {vA[0].matchedTokens[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────────────────── */}
          {intersectionSuras.length === 0 && coVerses.length === 0 && (
            <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/20 text-center space-y-2">
              <p className="text-zinc-400">
                لم يتم العثور على تقاطع بين المفهومين في هذا النطاق.
              </p>
              <p className="text-xs text-zinc-600">
                حاول جذوراً أو مفاهيم أوسع انتشاراً في القرآن.
              </p>
            </div>
          )}

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
