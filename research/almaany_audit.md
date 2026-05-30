# Al-Maany Quran Feature Audit

Audit date: 2026-05-29

Evidence note: Almaany's live Quran URLs returned 403 to automated fetches during this audit, so the Quran section below combines official Almaany URL patterns, the public app-store descriptions for Almaany's Quran app, indexed page text, and accessible Almaany dictionary/terms pages. Claims marked as "observed" come from accessible pages or public listings; claims marked as "inferred" are based on URL structure, indexed snippets, or repeated third-party citations of Almaany pages.

Primary sources reviewed:

- [Almaany Arabic-English dictionary result page](https://www.almaany.com/ar/dict/ar-en/translation/)
- [Almaany Quran word search entry point](https://www.almaany.com/quran-b/)
- [Example Almaany Quran word-analysis URL](https://www.almaany.com/quran/78/17/5/)
- [Google Play: معاني كلمات القرآن الكريم](https://play.google.com/store/apps/details?id=com.almaany.quran&hl=en_US)
- [Google Play Arabic listing](https://play.google.com/store/apps/details?id=com.almaany.quran&hl=ar)
- [Apple App Store: معاني كلمات القران الكريم](https://apps.apple.com/us/app/%D9%85%D8%B9%D8%A7%D9%86%D9%8A-%D9%83%D9%84%D9%85%D8%A7%D8%AA-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85/id1217114923)
- [Almaany terms of use](https://www.almaany.com/terms.php?language=english)
- [Almaany privacy policy](https://www.almaany.com/privacy.php?language=arabic)

## 1. Feature Inventory

### Dictionary

- Arabic-Arabic dictionary hub with multiple selectable sources/categories:
  - "المعاني الجامع"
  - "الكل"
  - Quran-specific dictionary category
  - Mukhtar al-Sihah
  - Al-Mu'jam al-Waseet
  - Contemporary Arabic dictionary
  - General Arabic
  - Fiqh terms
  - Al-Ghani
  - Herbs
  - Sound/phonetics dictionary
  - Al-Qamus al-Muhit
  - Al-Ra'id
  - Common expressions
  - Lisan al-Arab
- Arabic to foreign-language dictionaries:
  - Arabic-English
  - Arabic-French
  - Arabic-Portuguese
  - Arabic-Spanish
  - Arabic-Turkish
  - Arabic-Persian and Persian-Arabic
  - Arabic-Indonesian
  - Arabic-German
  - Arabic-Urdu and Urdu-Arabic
  - Arabic-Russian
- English bilingual dictionaries separate from the Arabic hub:
  - English-Dutch
  - English-Korean
  - English-French
  - English-German
  - English-Italian
  - English-Chinese
  - English-Hindi
- Search result features:
  - Primary headword definition
  - Terms table with source text and meaning
  - Domain tags such as general, medical, military, legal, media, computing, biology, chemistry, finance, etc.
  - Domain filters with result counts
  - Pagination for high-volume result sets
  - Related words and nearby words
  - Contextual examples in translated text
  - Word-of-the-day and recent-search panels
  - "Report an error", "suggest an edit", and "suggest a new word/meaning" modals
- User/community features:
  - Login
  - Account creation
  - "Add meaning"
  - Q&A / "سين جيم"
  - Contact/privacy/terms links
- Input features:
  - Search box
  - Virtual keyboard
  - Language/direction selector
  - Field/domain selector

### Quran Section

- Quran search/browse entry point at `https://www.almaany.com/quran-b/`.
- Search by Quranic word; public citations and indexed snippets describe pages titled "آيات ورد فيها [word]".
- Search result pages list verses containing the queried word.
- Verse words are clickable; indexed page text says users can click any word in the verse to display linguistic analysis, word meaning, and tafsir.
- Granular word-analysis URL structure appears to be:
  - `/quran/{surah_number}/{ayah_number}/{word_index}/`
  - Example: `/quran/78/17/5/` for the fifth word in Qur'an 78:17.
- Browse flow from the official app listing:
  - Select surah.
  - Select ayah number.
  - Click the target word.
  - Land on the analysis page.
  - Return to the initial page from the analysis page.
- Search flow from the official app listing:
  - Place cursor in search box.
  - Type a word letter by letter.
  - Autocomplete/expected words appear during entry.
  - Choose a predicted word.
  - Results show verses containing the word or similar forms with the same root.
  - Click a word to open analysis.
- Tafsir integration:
  - Al-Muyassar tafsir.
  - Tafsir al-Jalalayn.
  - Tafsir is positioned as concise support for learners, not a full tafsir library.
- Offline/mobile companion:
  - Android and iOS apps are presented as complete offline copies of the Quran word-meaning page.
  - App adds favorites, history, and deletion of favorite/history items.

### Morphological Analysis

- Site-wide tools:
  - "تحليل الكلمات" / word analysis.
  - "تصريف الأفعال" / verb conjugation.
- Quran-specific word analysis:
  - Extracts stem/trunk and root after stripping prefixes and suffixes.
  - Shows meaning of the analyzed stem and root.
  - Shows Arabic meanings and English meanings for non-Arabic learners of Qur'an.
  - Lists all Quranic words with the same root.
  - Links analysis from individual words inside verses.
- Evidence does not show a full syntactic i'rab parser for Quranic sentences. The Quran tool appears primarily lexical/morphological: segmentation, stem/root, meanings, same-root forms, and tafsir.
- Evidence does not show Quranic sarf paradigms per word inside the Quran section. Sarf/conjugation exists as a separate site-wide tool.

### Search Capabilities

- Dictionary search:
  - Single word and phrase lookup.
  - Cross-language dictionary direction switching.
  - Domain filtering.
  - Related words.
  - Context examples.
  - Nearby words.
  - Pagination.
- Quran search:
  - Exact word lookup.
  - Diacritized and undiacritized URL examples exist in public references, suggesting normalized matching or at least acceptance of both styles.
  - Root-based expansion: official app text says selected results include words containing the entered word or similar ones with the same root.
  - Autocomplete/predicted Quranic words.
  - Phrase-style URLs are visible in public references, using hyphen-separated Quranic phrases.
- Semantic search:
  - No direct evidence of semantic, topic, embedding, or concept search.
  - "Similar" in the Quran app appears root/morphology-based rather than semantic.

### Navigation & Filtering

- Global language switcher across Arabic, English, Spanish, Portuguese, French, Turkish, Persian, Indonesian, German, Urdu, and Russian.
- Mega-menu style navigation across dictionaries, Quran words, contextual translation, synonyms/antonyms, analysis/conjugation, names, linguistic benefits, quotes, and Q&A.
- Dictionary filters by:
  - Language pair
  - Source dictionary
  - Domain/field
  - Result type tabs such as examples, terms, and related words
- Quran filters/navigation:
  - Surah selector.
  - Ayah selector.
  - Word click-through.
  - Quran word search.
  - Same-root result expansion.
  - More results / continuation behavior.
- App-only navigation:
  - History.
  - Favorites.
  - Clear search.
  - Delete history/favorites by swiping.

### Unique / Less Common Features

- A Quranic word-analysis system embedded inside a general-purpose Arabic dictionary platform.
- Word-level Quran URLs with surah, ayah, and word index, making deep links stable and granular.
- Root and stem extraction focused on Quranic orthography and morphology.
- Same-root Quran occurrence lists tied directly to verse results.
- Combined Arabic and English explanations for Quran words, aimed at Arabic learners and non-Arab Qur'an students.
- Direct bridge from dictionary categories to Quran-specific lexical entries.
- User contribution loop: add meaning, suggest edit, report errors.
- Broad domain-tagged terminology across many specialist fields, useful for translators beyond Quran use.

## 2. Arabic Language Tools

### Root Extraction

Almaany's Quran tool explicitly says it analyzes a Quranic word by stripping prefixes and suffixes, then extracting the stem/trunk and root. The public app description gives the method as decomposition of a word into attached particles/pronouns plus core form, then deriving the root from that core.

Product implication: the root extraction is rule-based or lexicon-backed morphology, not merely a string search. It supports a learner workflow: "What is this Quranic surface form, what is its base, what is its root, and where else does that root appear?"

### Morphological Data Shown

Observed or strongly evidenced data:

- Surface Quranic word.
- Segmentation into prefixes/core/suffixes.
- Stem/trunk.
- Root.
- Meaning of the stem/core.
- Meaning of the root.
- Arabic meanings.
- English meanings.
- Other Quranic words sharing the same root.
- Verse context.
- Tafsir al-Muyassar and al-Jalalayn for the verse.

Not found:

- Full i'rab tree.
- Dependency/syntax visualization.
- POS-tag table comparable to Quranic Arabic Corpus.
- Qira'at variants.
- Morphological feature bundle such as person, number, gender, case, mood, voice for every token.
- Full sarf paradigm for the selected Quranic word.

### Word-by-Word Breakdown

Yes, but with limits.

The Quran section is word-addressable: search results list verses, and each word in the verse can be clicked for analysis. That is a word-by-word interaction model.

However, it does not appear to show a full interlinear table for the whole ayah by default. Users enter through a specific word, then inspect that word's analysis. User reviews of the mobile app complain that users must select surah and ayah rather than browsing a full surah page, which suggests the word-by-word experience is analysis-first, not mushaf-reader-first.

### Diacritics in Search

The evidence is mixed:

- Public URL examples include fully diacritized words such as `يُوسُفَ`.
- Other public references use undiacritized words such as `السمع`, `يعقلون`, and `الناس`.
- The official app says the user types letter by letter and receives predicted Quranic words.
- The app also says search results can include same-root/similar words.

Likely behavior: Almaany normalizes at least some forms and can handle both vocalized Quranic forms and plain unvocalized Arabic input. I did not find an explicit UI option for "ignore diacritics", exact-vocalized search, or orthographic normalization controls.

### Integrated Dictionaries

Arabic dictionary sources/categories visible in Almaany navigation:

- Almaany جامع.
- All dictionaries.
- Quran.
- Mukhtar al-Sihah.
- Al-Mu'jam al-Waseet.
- Contemporary Arabic.
- General Arabic.
- Fiqh terms.
- Al-Ghani.
- Herbs.
- Sound dictionary.
- Al-Qamus al-Muhit.
- Al-Ra'id.
- Common expressions.
- Lisan al-Arab.

Bilingual dictionaries:

- Arabic-English.
- Arabic-French.
- Arabic-Portuguese.
- Arabic-Spanish.
- Arabic-Turkish.
- Arabic-Persian / Persian-Arabic.
- Arabic-Indonesian.
- Arabic-German.
- Arabic-Urdu / Urdu-Arabic.
- Arabic-Russian.

Other lexical tools:

- Contextual translation.
- Synonyms and antonyms.
- Word analysis.
- Verb conjugation.
- Name meanings.
- Linguistic benefits.
- Proverbs/quotes.
- Q&A.

## 3. UI/UX Patterns

### Quran Page Layout

Observed/inferred flow:

- A search page at `quran-b`.
- Query-specific pages titled like "آيات ورد فيها [word]".
- Results display multiple verses containing the searched word.
- Each ayah is presented as clickable Arabic text.
- Instructional text tells users to click any Quranic word to see linguistic analysis, word meaning, and tafsir.
- Word click opens a dedicated analysis page.
- The analysis page is probably centered on the selected Quranic token and its verse context.

Mobile/app flow:

- First screen supports two paths: browse by surah/ayah or search by word.
- Browse path is hierarchical: surah -> ayah number -> word.
- Search path uses autocomplete while typing.
- Analysis page is a separate destination.
- History and favorites live in the main menu.

UX read: the Quran product is optimized for "look up this word" rather than "read/study this surah continuously."

### Search Results Page

Dictionary search results use a dense, table-based information architecture:

- Search controls at top.
- Language pair and domain controls near the search box.
- Virtual keyboard.
- Result-type tabs:
  - Contextual examples.
  - Terms.
  - Related words.
- Main definition block.
- Table of source text and meaning.
- Domain labels inline with results.
- Faceted field counts.
- Pagination.
- Related and nearby terms.
- Additional content modules: word of the day, recent searches, linguistic benefit, quote of the day.

Quran results appear simpler:

- Query title.
- Verse list.
- Clickable words.
- "More results" continuation.
- Direct links into word analysis pages.

### Morphological Info Display

The product likely displays morphology as a textual analysis block rather than an interactive grammar visualization.

Expected sequence based on public listings:

1. Selected Quranic word.
2. Decomposition into prefixes/suffixes and core.
3. Stem/trunk.
4. Root.
5. Arabic meaning.
6. English meaning.
7. Same-root Quranic words.
8. Tafsir for the verse.

There is no evidence of color-coded morphemes, dependency diagrams, expandable grammatical tags, or root-family graphs.

### Arabic Typography

The accessible page text suggests a conventional web typography stack:

- Arabic-first RTL layout.
- Dense text.
- Quranic text likely larger than surrounding UI text.
- Dictionary results use standard headings and table text rather than a specialized reading font.
- The UI appears built around functional HTML content, not a highly polished typographic reading experience.

The app screenshots were not directly inspectable in this environment, but public listings show many screenshots and users describe the app as usable. The main recurring UX complaint is navigation between ayahs/surahs, not legibility.

### Color Scheme and Design Language

Visual details could not be fully verified because live rendering was blocked. From accessible page structure and public listings:

- Design language is utilitarian and legacy-web rather than modern app-like.
- Content density is high.
- Navigation is menu-heavy.
- Results are table-heavy.
- Utility modules and footer links create a busy page.
- The brand reads as a practical dictionary/reference site, not an immersive Quran study product.

Competitive implication: users likely tolerate the UI because the lexical data is useful, not because the interface is delightful.

## 4. Data & API

### Public APIs

No public Almaany API documentation was found.

The site exposes predictable web URL patterns:

- Dictionary:
  - `/ar/dict/ar-en/{term}/`
  - `/ar/dict/ar-ar/{term}/`
- Quran search:
  - `/quran-b/{word-or-phrase}/`
- Quran word analysis:
  - `/quran/{surah}/{ayah}/{word_index}/`

These are web pages, not documented APIs. Almaany's terms prohibit accessing resources through automated, unethical, or unconventional means, so scraping should be treated as legally and operationally risky unless permission is obtained.

### Data Sources

Dictionary data:

- Almaany aggregates multiple Arabic dictionaries and specialist terminology categories visible in its own navigation.
- Classical/modern dictionary sources exposed by the UI include Lisan al-Arab, Al-Qamus al-Muhit, Mukhtar al-Sihah, Al-Mu'jam al-Waseet, Al-Ghani, Al-Ra'id, and Contemporary Arabic.
- The bilingual dictionary includes domain-specific terminology and contextual translated examples, including highly specialized fields such as UN, legal, medical, technical, finance, computing, and media.

Quran data:

- Quran text is token-addressable by surah, ayah, and word index.
- Quran word dictionary is based on Quranic word analysis, root extraction, and same-root occurrences.
- Tafsir sources: Al-Muyassar and Al-Jalalayn.
- English meanings are included for non-Arab learners.
- Offline apps ship a local copy of the Quran word-meaning data.

### Quran Text Structure

The URL structure strongly suggests a normalized Quran corpus table with at least:

- Surah number.
- Ayah number.
- Word index within ayah.
- Surface word.
- Root.
- Stem/core.
- Affix segmentation.
- Arabic meaning.
- English meaning.
- Root-family occurrence list.
- Tafsir keyed by ayah.

The `quran-b` search pages likely query either:

- Exact surface forms.
- Normalized forms.
- Roots/stems for expansion.
- Hyphen-separated phrase strings for multi-word lookup.

The product exposes data as rendered pages, not JSON. This is SEO-friendly and deep-linkable, but not developer-friendly.

## 5. Gaps & Opportunities

### What's Missing

- Full mushaf-style Quran reader integrated with word analysis.
- Full-surah view with every word clickable.
- Seamless next/previous ayah navigation.
- Copy/share selected ayah or multiple ayahs from search results.
- Direct jump from search result to the ayah's place in a mushaf.
- User-selectable sorting of Quran results by mushaf order, frequency, root, or relevance.
- Explicit diacritic/normalization controls.
- Semantic or concept search.
- Topic exploration.
- Full i'rab and syntax trees.
- POS/morphological feature tags for every word.
- Sarf paradigms connected to Quranic tokens.
- Qira'at variants.
- Audio recitation tied to selected word/ayah.
- Memorization workflow.
- Spaced repetition for roots and Quran vocabulary.
- Export/citation tools for researchers.
- Public API or licensed data access.
- Modern accessibility details: font scaling, keyboard navigation, screen-reader-friendly Quran word tokens, contrast controls.

### What's Clunky or Poorly Designed

- Quran browsing is too stepwise: select surah, select ayah, click word. Reviews explicitly ask for full-surah display because ayah-by-ayah navigation is slow.
- Quran search seems lookup-oriented rather than study-session-oriented.
- The main dictionary UI is dense and cluttered with menus, side modules, recent searches, linguistic trivia, and footer lists.
- Domain filters are powerful but visually overwhelming.
- The morphology output appears text-heavy and linear.
- Same-root discovery is useful, but likely not visualized.
- No obvious differentiation between exact match, normalized match, and root-expanded match.
- The site has a practical but dated design language.
- App-store English copy appears machine-translated or awkward, which weakens trust for non-Arab learners.
- No clear developer/data-access story despite having valuable structured lexical data.

### What We Could Do Better

- Build the Quran study experience around a full readable surah/page first, then let every word become inspectable.
- Provide one-click toggles:
  - Meaning.
  - Root.
  - Morphology.
  - I'rab.
  - Tafsir.
  - Translation.
  - Same-root occurrences.
- Make diacritics explicit:
  - Exact with harakat.
  - Ignore harakat.
  - Uthmani vs simple orthography.
  - Hamza/alif normalization.
  - Root/stem expansion.
- Add a transparent search mode selector:
  - Exact word.
  - Lemma/stem.
  - Root.
  - Phrase.
  - Semantic/concept.
- Show root families visually:
  - Occurrence count.
  - Distribution by surah.
  - Derived forms.
  - Thematic clusters.
  - Timeline/order of revelation if desired.
- Add full grammar:
  - POS tags.
  - Case/mood/voice/person/number/gender.
  - I'rab explanation in learner-friendly Arabic and English.
  - Dependency/syntax tree for each ayah.
- Improve tafsir:
  - Multiple tafsir choices.
  - Short vs detailed modes.
  - Word meaning vs tafsir distinction.
  - Source citations.
- Design a calmer UI:
  - Less clutter.
  - Stronger Arabic typography.
  - Better spacing for Quran text.
  - Clear left/right or top/bottom study panels.
  - Mobile-first word popovers instead of page jumps.
- Support learner workflows:
  - Save roots/words.
  - Spaced repetition.
  - Personal notes.
  - "Words I have seen before."
  - Vocabulary by juz/surah.
- Support research workflows:
  - Export CSV.
  - Copy citation.
  - Stable share links.
  - Public documented API or paid licensed endpoint.
- Integrate audio:
  - Ayah recitation.
  - Word-level playback.
  - Repeat selected segment.
- Add side-by-side modes:
  - Quran text + word-by-word translation.
  - Quran text + morphology.
  - Quran text + tafsir.
  - Quran text + root concordance.

Strategic summary: Almaany's moat is lexical breadth and a practical Quranic root/meaning lookup. Its weakness is that it feels like a dictionary database with Quran pages attached. A competitor can win by keeping the same fast lookup utility while making the Quran study session continuous, visual, explainable, and learner-friendly.
