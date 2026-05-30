"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, ChevronDown, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_arabic: string;
  name_simple: string;
  name_complex: string;
  verses_count: number;
  translated_name: { language_name: string; name: string };
}

interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

interface Word {
  id: number;
  position: number;
  text_uthmani: string;
  text_indopak?: string;
  char_type_name: string;
}

interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  translations: Translation[];
  words?: Word[];
}

interface Pagination {
  per_page: number;
  current_page: number;
  next_page: number | null;
  total_pages: number;
  total_records: number;
}

type ViewMode = "continuous" | "mushaf_page" | "word_by_word";

// ── Helpers ──────────────────────────────────────────────────────────────────
const toArabicNumeral = (n: number): string =>
  n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

const TOTAL_MUSHAF_PAGES = 604;

// ── Skeleton Components ──────────────────────────────────────────────────────
function VerseSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-zinc-800/60 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-7 bg-zinc-800/60 rounded-lg w-full" />
          <div className="h-7 bg-zinc-800/60 rounded-lg w-4/5" />
          <div className="h-7 bg-zinc-800/60 rounded-lg w-3/5" />
          <div className="h-4 bg-zinc-800/40 rounded w-full mt-4" />
          <div className="h-4 bg-zinc-800/40 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-3 py-8">
      <div className="h-10 bg-zinc-800/60 rounded-xl w-48" />
      <div className="h-5 bg-zinc-800/40 rounded w-32" />
      <div className="h-4 bg-zinc-800/40 rounded w-24" />
    </div>
  );
}

function MushafPageSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-10">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-8 bg-zinc-800/40 rounded-lg w-full" />
      ))}
    </div>
  );
}

// ── View Switcher ────────────────────────────────────────────────────────────
function ViewSwitcher({
  activeView,
  onViewChange,
}: {
  activeView: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  const views: { key: ViewMode; label: string; icon: string }[] = [
    { key: "continuous", label: "قراءة متصلة", icon: "📖" },
    { key: "mushaf_page", label: "صفحة المصحف", icon: "📄" },
    { key: "word_by_word", label: "كلمة بكلمة", icon: "🔤" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onViewChange(v.key)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            activeView === v.key
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-teal-500/40 hover:text-zinc-200"
          }`}
        >
          <span>{v.icon}</span>
          <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Word Component for Word-by-Word view ─────────────────────────────────────
function WordCard({
  word,
  isHighlighted,
  onToggle,
}: {
  word: Word;
  isHighlighted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`group relative px-4 py-3 rounded-xl transition-all duration-200 text-center min-w-[80px] ${
        isHighlighted
          ? "bg-teal-500/15 border-teal-500/50 ring-1 ring-teal-500/30"
          : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700"
      } border`}
    >
      <span
        className={`font-amiri text-2xl md:text-3xl leading-relaxed block transition-colors ${
          isHighlighted ? "text-teal-300" : "text-zinc-100 group-hover:text-teal-200"
        }`}
      >
        {word.text_uthmani}
      </span>
    </button>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function MushafPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [visibleVerses, setVisibleVerses] = useState<Set<number>>(new Set());

  // ── View mode state ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("continuous");
  const [mushafPageNumber, setMushafPageNumber] = useState(1);
  const [mushafPageVerses, setMushafPageVerses] = useState<Verse[]>([]);
  const [loadingMushafPage, setLoadingMushafPage] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(new Set());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Fetch chapters ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch("/api/chapters");
        if (!res.ok) throw new Error("Failed to fetch chapters");
        const data = await res.json();
        setChapters(data.chapters ?? []);
      } catch {
        setError("تعذر تحميل قائمة السور");
      } finally {
        setLoadingChapters(false);
      }
    }
    fetchChapters();
  }, []);

  // ── Fetch verses for selected chapter (continuous + word-by-word) ──────
  const fetchVerses = useCallback(
    async (chapter: number, page = 1, append = false) => {
      if (page === 1) {
        setLoadingVerses(true);
        setVisibleVerses(new Set());
      } else {
        setLoadingMore(true);
      }
      setError("");

      try {
        const params = new URLSearchParams({
          chapter: chapter.toString(),
          words: "true",
          per_page: "50",
          page: page.toString(),
        });
        const res = await fetch(`/api/verses?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch verses");
        const data = await res.json();

        if (append) {
          setVerses((prev) => [...prev, ...(data.verses ?? [])]);
        } else {
          setVerses(data.verses ?? []);
        }
        setPagination(data.pagination ?? null);
      } catch {
        setError("تعذر تحميل الآيات");
      } finally {
        setLoadingVerses(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (viewMode === "continuous" || viewMode === "word_by_word") {
      fetchVerses(selectedChapter);
    }
  }, [selectedChapter, fetchVerses, viewMode]);

  // ── Fetch mushaf page verses ──────────────────────────────────────────
  const fetchMushafPage = useCallback(async (pageNum: number) => {
    setLoadingMushafPage(true);
    setError("");
    try {
      const params = new URLSearchParams({
        mushaf_page: pageNum.toString(),
        words: "true",
        per_page: "50",
      });
      const res = await fetch(`/api/verses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch mushaf page");
      const data = await res.json();
      setMushafPageVerses(data.verses ?? []);
    } catch {
      setError("تعذر تحميل صفحة المصحف");
    } finally {
      setLoadingMushafPage(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "mushaf_page") {
      fetchMushafPage(mushafPageNumber);
    }
  }, [mushafPageNumber, viewMode, fetchMushafPage]);

  // ── Close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Intersection observer for verse fade-in animations ─────────────────
  const verseCallbackRef = useCallback(
    (node: HTMLDivElement | null, verseId: number) => {
      if (!node) return;
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const id = Number(entry.target.getAttribute("data-verse-id"));
                setVisibleVerses((prev) => new Set(prev).add(id));
                observerRef.current?.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );
      }
      node.setAttribute("data-verse-id", String(verseId));
      observerRef.current.observe(node);
    },
    []
  );

  // ── Load more pages ────────────────────────────────────────────────────
  const handleLoadMore = () => {
    if (pagination?.next_page) {
      fetchVerses(selectedChapter, pagination.next_page, true);
    }
  };

  // ── Word highlight toggle ──────────────────────────────────────────────
  const toggleWordHighlight = (wordId: number) => {
    setHighlightedWords((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  // ── Mushaf page navigation ────────────────────────────────────────────
  const goToNextPage = () => {
    if (mushafPageNumber < TOTAL_MUSHAF_PAGES) {
      setMushafPageNumber((p) => p + 1);
    }
  };
  const goToPrevPage = () => {
    if (mushafPageNumber > 1) {
      setMushafPageNumber((p) => p - 1);
    }
  };

  // ── View mode change handler ───────────────────────────────────────────
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setHighlightedWords(new Set());
  };

  // ── Filtered chapters for dropdown search ──────────────────────────────
  const filteredChapters = chapters.filter(
    (ch) =>
      ch.name_arabic.includes(searchFilter) ||
      ch.name_simple.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ch.id.toString().includes(searchFilter)
  );

  const activeChapter = chapters.find((ch) => ch.id === selectedChapter);




  return (
    <div className="space-y-6 -mx-4 md:-mx-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="px-4 md:px-8 space-y-1">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-teal-500" />
          <h1 className="text-3xl font-bold text-zinc-100">المصحف الشريف</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          اقرأ القرآن الكريم بخط عثماني واضح مع الترجمة
        </p>
      </header>

      {/* ── View Switcher ──────────────────────────────────────────────── */}
      <div className="px-4 md:px-8">
        <ViewSwitcher activeView={viewMode} onViewChange={handleViewChange} />
      </div>

      {/* ── Surah Selector (shown for continuous + word_by_word modes) ── */}
      {viewMode !== "mushaf_page" && (
        <div className="px-4 md:px-8">
          <div ref={dropdownRef} className="relative max-w-md">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm hover:border-teal-500/40 transition-all"
              disabled={loadingChapters}
            >
              {loadingChapters ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                  <span className="text-zinc-400">جاري تحميل السور...</span>
                </div>
              ) : activeChapter ? (
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-sm font-medium">
                    {toArabicNumeral(activeChapter.id)}
                  </span>
                  <div className="text-right">
                    <span className="text-zinc-100 font-bold text-lg font-amiri">
                      سورة {activeChapter.name_arabic}
                    </span>
                    <span className="text-zinc-500 text-sm mr-2">
                      {activeChapter.name_simple} · {toArabicNumeral(activeChapter.verses_count)} آية
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-zinc-400">اختر سورة</span>
              )}
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown list */}
            {dropdownOpen && (
              <div className="absolute top-full mt-2 right-0 left-0 z-50 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Search filter */}
                <div className="p-3 border-b border-zinc-800">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="ابحث عن سورة..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 placeholder-zinc-500"
                    autoFocus
                  />
                </div>

                {/* Chapters list */}
                <div className="max-h-80 overflow-y-auto overscroll-contain">
                  {filteredChapters.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 text-sm">
                      لا توجد نتائج
                    </div>
                  ) : (
                    filteredChapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setSelectedChapter(ch.id);
                          setDropdownOpen(false);
                          setSearchFilter("");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-zinc-900 ${
                          ch.id === selectedChapter
                            ? "bg-teal-900/20 border-r-2 border-teal-500"
                            : ""
                        }`}
                      >
                        <span className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-medium shrink-0">
                          {toArabicNumeral(ch.id)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-zinc-100 font-amiri text-lg">
                            {ch.name_arabic}
                          </span>
                          <span className="text-zinc-500 text-xs mr-2">
                            {ch.name_simple}
                          </span>
                        </div>
                        <div className="text-left shrink-0">
                          <span className="text-zinc-600 text-xs">
                            {toArabicNumeral(ch.verses_count)} آية
                          </span>
                          <span className="text-zinc-700 text-xs mr-1">
                            · {ch.revelation_place === "makkah" ? "مكية" : "مدنية"}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mushaf Page Navigation (shown only for mushaf_page mode) ─── */}
      {viewMode === "mushaf_page" && (
        <div className="px-4 md:px-8">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={goToNextPage}
              disabled={mushafPageNumber >= TOTAL_MUSHAF_PAGES || loadingMushafPage}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-teal-500/40 hover:bg-zinc-900 text-zinc-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-sm">الصفحة التالية</span>
            </button>

            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
              <span className="text-teal-400 text-sm">صفحة</span>
              <input
                type="number"
                value={mushafPageNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val >= 1 && val <= TOTAL_MUSHAF_PAGES) {
                    setMushafPageNumber(val);
                  }
                }}
                min={1}
                max={TOTAL_MUSHAF_PAGES}
                className="w-16 bg-transparent border-b border-teal-500/40 text-center text-teal-300 text-lg font-bold focus:outline-none focus:border-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-teal-500/60 text-sm">
                من {toArabicNumeral(TOTAL_MUSHAF_PAGES)}
              </span>
            </div>

            <button
              onClick={goToPrevPage}
              disabled={mushafPageNumber <= 1 || loadingMushafPage}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-teal-500/40 hover:bg-zinc-900 text-zinc-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-sm">الصفحة السابقة</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="mx-4 md:mx-8 p-4 rounded-xl bg-red-900/20 border border-red-900/50 text-red-400">
          {error}
        </div>
      )}

      {/* ── Surah Header Card (continuous + word_by_word) ──────────────── */}
      {viewMode !== "mushaf_page" && (
        <>
          {loadingVerses ? (
            <div className="mx-4 md:mx-8">
              <HeaderSkeleton />
            </div>
          ) : (
            activeChapter && (
              <div className="mx-4 md:mx-8 rounded-2xl border border-zinc-800 bg-gradient-to-b from-teal-950/20 to-zinc-950/50 backdrop-blur-sm overflow-hidden">
                <div className="relative px-8 py-10 flex flex-col items-center text-center">
                  {/* Decorative ornament */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-4 right-8 text-8xl font-amiri text-teal-500">
                      ﷽
                    </div>
                  </div>

                  <h2 className="text-4xl font-amiri text-zinc-100 font-bold mb-2">
                    سورة {activeChapter.name_arabic}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {activeChapter.name_simple} · {activeChapter.translated_name?.name}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span>{toArabicNumeral(activeChapter.verses_count)} آية</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>
                      {activeChapter.revelation_place === "makkah" ? "مكية" : "مدنية"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>ترتيب النزول: {toArabicNumeral(activeChapter.revelation_order)}</span>
                  </div>

                  {/* Bismillah */}
                  {activeChapter.bismillah_pre && (
                    <div className="mt-6 font-amiri text-3xl text-teal-400/80 leading-relaxed">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 1: Continuous Reading
          ══════════════════════════════════════════════════════════════════ */}
      {viewMode === "continuous" && (
        <>
          {loadingVerses ? (
            <div className="mx-4 md:mx-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 divide-y divide-zinc-800/50">
              {[...Array(5)].map((_, i) => (
                <VerseSkeleton key={i} />
              ))}
            </div>
          ) : (
            verses.length > 0 && (
              <div className="mx-4 md:mx-8">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-hidden divide-y divide-zinc-800/50">
                  {verses.map((verse) => {
                    const isVisible = visibleVerses.has(verse.id);

                    return (
                      <div
                        key={verse.id}
                        ref={(node) => verseCallbackRef(node, verse.id)}
                        className={`group px-6 py-8 md:px-10 md:py-10 transition-all duration-700 ease-out hover:bg-zinc-900/40 ${
                          isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }`}
                      >
                        <div className="flex gap-4 md:gap-6">
                          {/* Verse number badge */}
                          <div className="shrink-0 mt-2">
                            <div className="w-11 h-11 rounded-full border-2 border-teal-500/40 bg-teal-500/5 flex items-center justify-center group-hover:border-teal-500/70 group-hover:bg-teal-500/10 transition-all">
                              <span className="text-teal-400 text-sm font-bold">
                                {toArabicNumeral(verse.verse_number)}
                              </span>
                            </div>
                          </div>

                          {/* Verse content */}
                          <div className="flex-1 min-w-0 space-y-4">
                            {/* Arabic text */}
                            <p
                              className="font-amiri text-3xl md:text-4xl leading-[2.2] text-zinc-100 selection:bg-teal-900 selection:text-teal-100"
                              style={{ wordSpacing: "0.08em" }}
                            >
                              {verse.text_uthmani}
                            </p>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load more button */}
                {pagination?.next_page && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-teal-500/40 text-zinc-300 transition-all flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                          <span>جاري التحميل...</span>
                        </>
                      ) : (
                        <>
                          <span>تحميل المزيد من الآيات</span>
                          <span className="text-zinc-600 text-sm">
                            (صفحة {toArabicNumeral(pagination.next_page)} من{" "}
                            {toArabicNumeral(pagination.total_pages)})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 2: Mushaf Page View
          ══════════════════════════════════════════════════════════════════ */}
      {viewMode === "mushaf_page" && (
        <div className="mx-4 md:mx-8">
          {loadingMushafPage ? (
            <div className="rounded-2xl border-2 border-teal-900/30 bg-zinc-950/80 shadow-2xl shadow-black/40">
              <MushafPageSkeleton />
            </div>
          ) : (
            <div className="relative max-w-3xl mx-auto">
              {/* Outer decorative frame */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-teal-900/20 via-transparent to-teal-900/20 pointer-events-none" />

              {/* Page container */}
              <div className="relative rounded-2xl border-2 border-teal-900/30 bg-zinc-950/80 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
                {/* Top ornament bar */}
                <div className="h-1 bg-gradient-to-l from-transparent via-teal-500/40 to-transparent" />

                {/* Page number header */}
                <div className="flex items-center justify-center py-3 border-b border-zinc-800/50">
                  <span className="text-teal-500/70 text-sm font-medium">
                    ─── صفحة {toArabicNumeral(mushafPageNumber)} ───
                  </span>
                </div>

                {/* Verses content */}
                <div className="px-8 md:px-14 py-8 md:py-12 space-y-1">
                  {mushafPageVerses.length === 0 ? (
                    <div className="text-center text-zinc-500 py-12">
                      لا توجد آيات في هذه الصفحة
                    </div>
                  ) : (
                    <div className="text-center leading-[2.8] md:leading-[3]">
                      {mushafPageVerses.map((verse, idx) => (
                        <span key={verse.id}>
                          {/* Surah separator if verse_key starts a new surah */}
                          {(idx === 0 ||
                            verse.verse_key.split(":")[0] !==
                              mushafPageVerses[idx - 1].verse_key.split(":")[0]) &&
                            verse.verse_number === 1 && (
                              <div className="my-6 py-3 border-y border-teal-500/20">
                                <span className="font-amiri text-2xl text-teal-400 font-bold">
                                  سورة{" "}
                                  {chapters.find(
                                    (ch) =>
                                      ch.id === parseInt(verse.verse_key.split(":")[0])
                                  )?.name_arabic ?? verse.verse_key.split(":")[0]}
                                </span>
                              </div>
                            )}
                          <span
                            className="font-amiri text-3xl md:text-[1.75rem] lg:text-3xl text-zinc-100 selection:bg-teal-900 selection:text-teal-100"
                            style={{ wordSpacing: "0.05em" }}
                          >
                            {verse.text_uthmani}
                          </span>
                          {/* Verse end marker */}
                          <span className="inline-flex items-center justify-center mx-1 text-teal-500/70 font-amiri text-lg">
                            ﴿{toArabicNumeral(verse.verse_number)}﴾
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom ornament bar */}
                <div className="h-1 bg-gradient-to-l from-transparent via-teal-500/40 to-transparent" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 3: Word-by-Word View
          ══════════════════════════════════════════════════════════════════ */}
      {viewMode === "word_by_word" && (
        <>
          {loadingVerses ? (
            <div className="mx-4 md:mx-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 divide-y divide-zinc-800/50">
              {[...Array(3)].map((_, i) => (
                <VerseSkeleton key={i} />
              ))}
            </div>
          ) : (
            verses.length > 0 && (
              <div className="mx-4 md:mx-8 space-y-6">
                {verses.map((verse) => (
                  <div
                    key={verse.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-hidden"
                  >
                    {/* Verse header */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/40">
                      <div className="w-9 h-9 rounded-full border-2 border-teal-500/40 bg-teal-500/5 flex items-center justify-center">
                        <span className="text-teal-400 text-sm font-bold">
                          {toArabicNumeral(verse.verse_number)}
                        </span>
                      </div>
                      <span className="text-zinc-500 text-sm">
                        {verse.verse_key}
                      </span>
                    </div>

                    {/* Words grid */}
                    <div className="px-5 py-6">
                      <div className="flex flex-wrap gap-3 justify-end">
                        {verse.words
                          ?.filter((w) => w.char_type_name !== "end")
                          .map((word) => (
                            <WordCard
                              key={word.id}
                              word={word}
                              isHighlighted={highlightedWords.has(word.id)}
                              onToggle={() => toggleWordHighlight(word.id)}
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load more button */}
                {pagination?.next_page && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-teal-500/40 text-zinc-300 transition-all flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                          <span>جاري التحميل...</span>
                        </>
                      ) : (
                        <>
                          <span>تحميل المزيد من الآيات</span>
                          <span className="text-zinc-600 text-sm">
                            (صفحة {toArabicNumeral(pagination.next_page)} من{" "}
                            {toArabicNumeral(pagination.total_pages)})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}
