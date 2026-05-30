# Quran.com Platform & API — Comprehensive Audit Report

*Researched by Antigravity subagent, 2026-05-30*

## 1. User-Facing Features

### Reading
- **Translation Reading Mode** — continuous, book-style translated text layout
- **Mushaf / Page View Mode** — traditional Mushaf layout resembling a physical Quran
- **Surah (Chapter) View** — reading organized by chapter
- **Tajweed Mushaf** — color-coded Tajweed rules on Arabic text
- **Word-by-Word Translation** — hover/tap individual Arabic words to see meaning
- **Word-by-Word Transliteration** — romanized pronunciation for each word
- **Multiple Arabic Script Options** — Uthmani, Uthmani Simple, IndoPak, IndoPak Nastaleeq, Imlaei, Tajweed
- **Font Size Controls** — adjustable for both Arabic and translation text

### Audio
- **Full Chapter Recitations** — listen to entire surahs from world-renowned Qaris
- **Verse-by-Verse Recitation** — individual ayah playback with text highlighting
- **Word-by-Word Recitation** — click individual words to hear pronunciation
- **Quran Radio** — non-stop recitation streaming
- **Multiple Reciters** — large library of reciters

### Translations & Tafsir
- **100+ Translations** — available in multiple languages
- **Multiple Translations Side-by-Side** — compare simultaneously
- **Tafsir (Exegesis)** — multiple classical and modern resources
- **Transliteration Toggle** — enable/disable romanized text

### Study & Engagement
- **Advanced Search** — find verses by keyword or topic
- **Bookmarks** — save specific verses
- **Collections** — organize bookmarks into custom collections
- **Personal Notes** — write notes on any verse
- **QuranReflect Integration** — engage with community reflections
- **Reading Goals & Streaks** — set daily goals, track progress
- **Quran Growth Journey** — personalized reading progress tracking
- **"Quran in a Year" Program** — structured schedule with reflection prompts

### Navigation
- Browse by **Surah** (114 chapters)
- Browse by **Juz** (30 parts)
- Browse by **Page** (Mushaf pages)
- Browse by **Hizb** / **Rub el Hizb** / **Manzil** / **Ruku**

### Settings & Themes
- Dark Mode / Light Mode / Night Mode
- Font Size adjustments
- Arabic Script/Font Selection
- Language Selection
- Translation & Transliteration Toggle

---

## 2. API Endpoints

### Base URLs
| Environment | Base URL |
|---|---|
| **Legacy (no auth needed)** | `https://api.quran.com/api/v4` |
| **New Production** | `https://apis.quran.foundation/content/api/v4` |
| **Audio CDN** | `https://audio.qurancdn.com/` |

### Chapters (Surahs)
| Endpoint | Description |
|---|---|
| `/chapters` | List all 114 chapters |
| `/chapters/{id}` | Get a specific chapter |
| `/chapters/{chapter_id}/info` | Get detailed info |

### Verses
| Endpoint | Description |
|---|---|
| `/verses/by_chapter/{chapter_number}` | Get verses for a chapter |
| `/verses/by_page/{page_number}` | Get verses by Mushaf page |
| `/verses/by_juz/{juz_number}` | Get verses by Juz |
| `/verses/by_hizb/{hizb_number}` | Get verses by Hizb |
| `/verses/by_key/{verse_key}` | Get specific verse (e.g. `1:1`) |
| `/verses/random` | Get a random verse |

**Query Parameters:** `translations`, `tafsirs`, `fields`, `words`, `word_fields`, `page`, `per_page`, `language`

### Audio / Recitations
| Endpoint | Description |
|---|---|
| `/chapter_recitations/{reciter_id}` | List all chapter audio for a reciter |
| `/chapter_recitations/{reciter_id}/{chapter_number}` | Get specific chapter audio |
| `/recitations/{recitation_id}/by_chapter/{chapter_number}` | Verse-by-verse audio |
| `/resources/recitations` | List available reciters |
| `/resources/chapter_reciters` | List chapter reciters |

### Tafsir
| Endpoint | Description |
|---|---|
| `/tafsirs/{tafsir_id}/by_chapter/{chapter_number}` | Tafsir for a chapter |
| `/tafsirs/{tafsir_id}/by_ayah/{verse_key}` | Tafsir for specific ayah |
| `/resources/tafsirs` | List all available tafsirs |

### Search
| Endpoint | Description |
|---|---|
| `/search?q={query}&language={lang}` | Search across Quran text and translations |

### Resources (Metadata)
| Endpoint | Description |
|---|---|
| `/resources/translations` | List all available translations |
| `/resources/tafsirs` | List all available tafsirs |
| `/resources/recitations` | List verse-by-verse reciters |
| `/resources/languages` | List available languages |

---

## 3. Data Models

### Verse Object
```json
{
  "id": 1,
  "verse_key": "1:1",
  "verse_number": 1,
  "chapter_id": 1,
  "text_uthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  "juz_number": 1,
  "hizb_number": 1,
  "page_number": 1,
  "words": [],
  "translations": []
}
```

### Word Object (when `words=true`)
```json
{
  "id": 1,
  "position": 1,
  "text_uthmani": "بِسْمِ",
  "translation": { "text": "In (the) name", "language_name": "english" },
  "transliteration": { "text": "bismi", "language_name": "english" },
  "location": "1:1:1",
  "audioUrl": "wbw/001_001_001.mp3"
}
```
> Audio full URL = `https://audio.qurancdn.com/` + `audioUrl`

### Chapter Object
```json
{
  "id": 1,
  "name_simple": "Al-Fatihah",
  "name_arabic": "الفاتحة",
  "revelation_place": "makkah",
  "revelation_order": 5,
  "verses_count": 7,
  "translated_name": { "name": "The Opener", "language_name": "english" }
}
```

---

## 4. Free Data & Licensing

### Access
- **Legacy API** (`api.quran.com/api/v4`) — **NO auth required**, all content endpoints work
- Audio CDN — **no auth** needed for playback
- Content caching allowed for **up to 1 week**

### Restrictions
- May NOT modify Quran text
- May NOT resell raw content
- May NOT train ML models without written consent
- Commercial use requires separate license

### Alternative Open APIs (No Auth)
- **fawazahmed0/quran-api** (GitHub) — open source
- **Al-Quran Cloud** — open source
- **The-Quran-Project/Quran-API** — MIT license

---

## 5. Integration Strategy for Our Platform

### Mushaf Reading
- `/verses/by_page/{page}` with `fields=text_uthmani_tajweed`
- `/chapters` for surah list navigation

### Audio
- `/resources/chapter_reciters` → reciter picker
- `/chapter_recitations/{reciter_id}/{chapter}` → full chapter audio
- Word audio via `words=true&word_fields=audio`

### Translations
- `/resources/translations` → translation picker
- `/verses/by_chapter/{chapter}?translations=20,131` → inline translations

### Tafsir
- `/resources/tafsirs` → tafsir picker
- `/tafsirs/{id}/by_ayah/{verse_key}` → verse-level tafsir

### Word-by-Word
- `/verses/by_chapter/{chapter}?words=true&word_fields=text_uthmani,translation,transliteration,audio`

### Search
- `/search?q={query}` → Quran text search
