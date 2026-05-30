# Qur'an Internal Study Platform — Vision Document

> **This file is the single source of truth for this project.**
> Any AI (Claude Code, Codex, ChatGPT, or other) MUST read this file before making changes.
> All architecture decisions are made in the **Antigravity conversation** (project leader).

---

## Philosophy

This is **NOT** another Quran reader app. This is a **structural analysis platform** that lets the Qur'an explain itself through its own internal patterns.

**Core principles:**
- No external tafsir opinions driving interpretation — the text speaks for itself
- Arabic-first, full RTL support throughout
- Inductive discovery — patterns emerge from data, not from pre-existing commentary
- World-class design — premium, contemplative, immersive

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              ANTIGRAVITY (Project Leader)        │
│  Architecture · Decisions · Integration · Build  │
└────────────────────┬────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
 Claude Code      Codex           ChatGPT
 (bug fixes)    (research)      (research)
```

### Rules for Other AIs
1. **Read this file first** before any code changes
2. **Do NOT change the tech stack** without Antigravity approval
3. **Do NOT restructure folders** without Antigravity approval
4. **Do NOT add new npm packages** without Antigravity approval
5. **Research tasks are welcome** — produce markdown reports, not code
6. **Bug fixes are welcome** — but match existing code style

---

## Tech Stack (Locked)

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR + API routes + static pages |
| Language | TypeScript | Type safety across full stack |
| Search Engine | `quran-search-engine` (npm) | Root/lemma/morphological search, 145MB dataset |
| Qur'an Data | Quran.com API (free) | Translations, audio, tafsir, word-by-word |
| Styling | Tailwind CSS v4 | Rapid RTL-first responsive design |
| Fonts | Amiri Quran + Cairo | Authentic script + clean UI |
| Hosting | Vercel | Auto-deploy from GitHub |
| Database | TBD (Phase 3) | User accounts, bookmarks, notes |

---

## What's Built (Current State)

### ✅ Working
- Root Pattern Explorer — functional search UI + backend API
- Search engine — 11 queries verified (حمار, ر ح م, ن و ر, etc.)
- API route at `/api/search` with diacritics normalization + ال-variant merging
- Turquoise/Teal branding applied
- GitHub repo: github.com/cetabocontact-code/quran-study-platform

### 🔲 UI Shell Only (Not Connected)
- Self-Reference Engine page
- Discovery Mode page
- Sidebar navigation

### ⬜ Not Started
- Mushaf reader
- Audio recitation
- Translations
- Tafsir
- Bookmarks/notes
- Athkar & duas

---

## The 3 Unique Engines (Our Competitive Edge)

### 1. Root Pattern Explorer
**What it does:** Search any Arabic word or root → see every Qur'anic occurrence, cluster meanings by context, detect literal vs metaphorical usage.

**Status:** ✅ Functional — search works, UI renders results with surah/ayah info.

**What no other app does:** Shows the _pattern_ across all occurrences, not just a list.

### 2. Qur'an Self-Reference Engine
**What it does:** Build a semantic graph of verses that echo, define, contrast, or complete each other. Click a verse → see all related verses across the entire Qur'an.

**Status:** ⬜ Not started.

**Technical approach TBD:** Likely needs pre-computed verse similarity scores using shared roots/themes.

### 3. Discovery Mode
**What it does:** AI-guided exploration. Instead of searching, the system surfaces non-obvious patterns. "Across 73 occurrences, this root consistently appears near themes of protection, growth, and guidance."

**Status:** ⬜ Not started.

**Technical approach TBD:** Likely needs topic modeling or co-occurrence analysis.

---

## Baseline Features (Model from Quran.com + Al-Maany)

### From Quran.com
- Full mushaf reader (surah/page/juz)
- Audio recitation (100+ reciters)
- Translations (50+ languages)
- Tafsir (multiple books)
- Word-by-word breakdown
- Bookmarks & notes
- Search

### From Al-Maany (What We Do Better)
- Root extraction with visual family trees (Al-Maany = plain text)
- Full POS/i'rab analysis (Al-Maany = limited)
- Same-root occurrence distribution charts (Al-Maany = flat list)
- Explicit search modes: exact / lemma / root / phrase / semantic
- Diacritics controls: with harakat / ignore / Uthmani vs Imlaei
- Full surah continuous reading (Al-Maany = awkward ayah-by-ayah only)

---

## Project Structure

```
quran-study-platform/
├── src/
│   ├── app/
│   │   ├── api/search/route.ts    ← Search API endpoint
│   │   ├── root-explorer/page.tsx ← Root Pattern Explorer
│   │   ├── self-reference/page.tsx← Self-Reference Engine (shell)
│   │   ├── discovery/page.tsx     ← Discovery Mode (shell)
│   │   ├── layout.tsx             ← RTL layout + fonts
│   │   ├── page.tsx               ← Landing page
│   │   └── globals.css            ← Design system
│   └── components/
│       └── Sidebar.tsx            ← Navigation
├── next.config.ts
├── package.json
└── test-search.mjs               ← Search verification script
```

---

## Design Language

- **Palette:** Turquoise / Teal (primary), deep zinc (dark mode background)
- **Typography:** Amiri Quran (Qur'anic text), Cairo (UI text)
- **Style:** Premium, contemplative, glassmorphism accents
- **Layout:** RTL-first, sidebar navigation, spacious reading panels
- **Interactions:** Micro-animations, smooth transitions, hover effects

---

## Research Assets

| Document | Source | Status |
|----------|--------|--------|
| Al-Maany Feature Audit | Codex | ✅ Complete |
| Quran.com API Audit | Antigravity subagent | 🔄 In progress |

---

## How to Onboard a New AI

Paste this at the start of any new AI conversation:

```
Read this Vision Document before doing anything:
[paste this entire file]

Your role is [research / bug fix / feature implementation].
Do NOT change architecture or add packages without approval.
Produce your output as a markdown report.
```
