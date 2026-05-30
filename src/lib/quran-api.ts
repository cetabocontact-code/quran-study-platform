/**
 * Quran.com API v4 — typed client library
 *
 * Base URL : https://api.quran.com/api/v4
 * Audio CDN: https://audio.qurancdn.com/
 *
 * All endpoints are public (no auth required).
 */

const BASE_URL = 'https://api.quran.com/api/v4';
const AUDIO_CDN = 'https://audio.qurancdn.com/';

// ─── In-memory cache with TTL ───────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1_000; // 1 hour

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Shared fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const cacheKey = url.toString();
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },           // Next.js fetch-level cache hint
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Quran API ${res.status}: ${text || res.statusText}`);
  }

  const json = (await res.json()) as T;
  setCache(cacheKey, json);
  return json;
}

// ─── TypeScript interfaces ──────────────────────────────────────────────────

export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_number: number | null;
  page_number: number;
  juz_number: number;
  text_uthmani?: string;
  text_uthmani_tajweed?: string;
  text_imlaei?: string;
  words?: Word[];
  translations?: VerseTranslation[];
  audio?: VerseTimestamp;
}

export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  text_uthmani: string;
  text_imlaei?: string;
  page_number: number;
  line_number: number;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface VerseTranslation {
  id: number;
  resource_id: number;
  resource_name: string;
  text: string;
}

export interface VerseTimestamp {
  url: string;
  duration: number;
  segments: number[][];
}

export interface VerseOptions {
  translations?: string;        // comma-separated resource IDs, e.g. "20,131"
  words?: boolean;
  word_fields?: string;         // e.g. "text_uthmani,translation,transliteration,audio"
  fields?: string;              // e.g. "text_uthmani,text_uthmani_tajweed,text_imlaei"
  per_page?: number;            // max 50
  page?: number;
  language?: string;            // e.g. "ar", "en"
}

export interface Pagination {
  per_page: number;
  current_page: number;
  next_page: number | null;
  total_pages: number;
  total_records: number;
}

export interface VerseResponse {
  verses: Verse[];
  pagination: Pagination;
}

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface AudioFile {
  audio_file: {
    id: number;
    chapter_id: number;
    file_size: number;
    format: string;
    audio_url: string;
  };
}

export interface VerseAudioFile {
  verse_key: string;
  url: string;
}

export interface Translation {
  id: number;
  name: string;
  author_name: string;
  slug: string | null;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface Tafsir {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface TafsirContent {
  tafsir: {
    resource_id: number;
    text: string;
  };
}

export interface SearchOptions {
  size?: number;
  page?: number;
  language?: string;
}

export interface SearchResult {
  verse_key: string;
  verse_id: number;
  text: string;
  highlighted: string | null;
  words: unknown[];
  translations: { text: string; resource_id: number; name: string }[];
}

export interface SearchResponse {
  search: {
    query: string;
    total_results: number;
    current_page: number;
    total_pages: number;
    results: SearchResult[];
  };
}

// ─── Chapter / Surah ────────────────────────────────────────────────────────

export async function getChapters(language = 'ar'): Promise<Chapter[]> {
  const data = await apiFetch<{ chapters: Chapter[] }>('/chapters', { language });
  return data.chapters;
}

export async function getChapter(id: number): Promise<Chapter> {
  const data = await apiFetch<{ chapter: Chapter }>(`/chapters/${id}`);
  return data.chapter;
}

// ─── Verses ─────────────────────────────────────────────────────────────────

function verseParams(options?: VerseOptions): Record<string, string | number | boolean | undefined> {
  if (!options) return {};
  return {
    translations: options.translations,
    words: options.words,
    word_fields: options.word_fields,
    fields: options.fields,
    per_page: options.per_page,
    page: options.page,
    language: options.language,
  };
}

export async function getVersesByChapter(chapterId: number, options?: VerseOptions): Promise<VerseResponse> {
  return apiFetch<VerseResponse>(`/verses/by_chapter/${chapterId}`, verseParams(options));
}

export async function getVersesByPage(pageNumber: number, options?: VerseOptions): Promise<VerseResponse> {
  return apiFetch<VerseResponse>(`/verses/by_page/${pageNumber}`, verseParams(options));
}

export async function getVersesByJuz(juzNumber: number, options?: VerseOptions): Promise<VerseResponse> {
  return apiFetch<VerseResponse>(`/verses/by_juz/${juzNumber}`, verseParams(options));
}

export async function getVerse(verseKey: string, options?: VerseOptions): Promise<Verse> {
  const data = await apiFetch<{ verse: Verse }>(`/verses/by_key/${verseKey}`, verseParams(options));
  return data.verse;
}

// ─── Audio / Reciters ───────────────────────────────────────────────────────

export async function getReciters(): Promise<Reciter[]> {
  const data = await apiFetch<{ reciters: Reciter[] }>('/resources/recitations');
  return data.reciters;
}

export async function getChapterRecitation(reciterId: number, chapterId: number): Promise<AudioFile> {
  return apiFetch<AudioFile>(`/chapter_recitations/${reciterId}/${chapterId}`);
}

export async function getVerseAudio(recitationId: number, chapterId: number): Promise<VerseAudioFile[]> {
  const data = await apiFetch<{ audio_files: VerseAudioFile[] }>(
    `/recitations/${recitationId}/by_chapter/${chapterId}`,
  );
  return data.audio_files;
}

export { AUDIO_CDN };

// ─── Translations ───────────────────────────────────────────────────────────

export async function getAvailableTranslations(): Promise<Translation[]> {
  const data = await apiFetch<{ translations: Translation[] }>('/resources/translations');
  return data.translations;
}

// ─── Tafsir ─────────────────────────────────────────────────────────────────

export async function getAvailableTafsirs(): Promise<Tafsir[]> {
  const data = await apiFetch<{ tafsirs: Tafsir[] }>('/resources/tafsirs');
  return data.tafsirs;
}

export async function getTafsirByAyah(tafsirId: number, verseKey: string): Promise<TafsirContent> {
  return apiFetch<TafsirContent>(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
}

// ─── Search ─────────────────────────────────────────────────────────────────

export async function searchQuran(query: string, options?: SearchOptions): Promise<SearchResponse> {
  return apiFetch<SearchResponse>('/search', {
    q: query,
    size: options?.size,
    page: options?.page,
    language: options?.language,
  });
}
