import { existsSync, readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';

/*
 * Enriches the hand-maintained BOOKS array with metadata from Open Library, then
 * writes src/content/books.yaml for the site to consume. Safe to re-run at any
 * time — responses are cached in .openlibrary-cache.json by URL.
 *
 * Pipeline:
 *   1. Fetch  — query Open Library for each book (see search modes below).
 *   2. Match  — for title searches, prefer an exact title match before docs[0].
 *   3. Extract — ISBN (prefers 13-digit), cover URL, up to 3 genres (noise-
 *               filtered), first author name, series name/position.
 *   4. Override — book.series and book.seriesPosition win over API values.
 *   5. Group  — books with a resolved series are collected into a Map; the rest
 *               are standalone.
 *   6. Assemble — series entries get cover/genres/author from their first book
 *               in BOOKS order and yearRead = max(yearRead) across all books.
 *               Standalone books get all fields directly.
 *   7. Sort & write — entries sorted by yearRead desc (no date → end), undefined
 *               fields stripped, written to books.yaml from scratch.
 *
 * Output shape (books.yaml entries):
 *   id, title, author, type (book|series), yearRead?, inProgress?, isbn?,
 *   cover?, genres?[], books[]  ← series only: [{title, isbn?, inProgress?}]
 *
 * Search modes (buildOLUrl):
 *   isbn provided   → ?isbn=<isbn>&limit=1
 *   author provided → ?title=<t>&author_name=<a>&limit=5
 *   title only      → ?title=<t>&limit=5
 *
 * Special conditions:
 *   - Series cover/genres come from the first book listed in BOOKS, not book #1.
 *   - Books without a seriesPosition sort to the end of their series list.
 *   - Genre noise (e.g. "fiction", "in library", overdrive tags, strings >40
 *     chars) is stripped by SUBJECT_BLOCKLIST before capping at 3 genres.
 */

const BOOKS_PATH = new URL('../src/content/books.yaml', import.meta.url).pathname;
const CACHE_PATH = new URL('.openlibrary-cache.json', import.meta.url).pathname;

// ── Book list ──────────────────────────────────────────────────────────────────
// title is required; all other fields are optional.
// series/seriesPosition override what Open Library returns.
// isbn, when provided, is used as the search key instead of the title.

type InputBook = {
  title: string;
  author?: string;
  yearRead?: number;
  inProgress?: boolean;
  isbn?: string;
  series?: string;
  seriesPosition?: number;
};

const BOOKS: InputBook[] = [
  // Dune
  { title: 'Dune', yearRead: 2022 },
  { title: 'Dune Messiah', yearRead: 2022 },
  { title: 'Children of Dune', yearRead: 2022 },
  { title: 'God Emperor of Dune', yearRead: 2022 },
  { title: 'Heretics of Dune', yearRead: 2022, series: 'Dune', seriesPosition: 5 },
  { title: 'Chapterhouse Dune', yearRead: 2022, series: 'Dune', seriesPosition: 6 },

  // The Expanse
  { title: 'Leviathan Wakes', yearRead: 2025 },
  { title: "Caliban's War", yearRead: 2025 },
  { title: "Abaddon's Gate", yearRead: 2025, series: 'The Expanse', seriesPosition: 3 },
  { title: 'Cibola Burn', yearRead: 2025 },
  { title: 'Nemesis Games', yearRead: 2025 },
  { title: "Babylon's Ashes", yearRead: 2025 },
  { title: 'Persepolis Rising', yearRead: 2025 },
  { title: "Tiamat's Wrath", yearRead: 2025 },
  { title: 'Leviathan Falls', yearRead: 2025 },

  // The Hitchhiker's Guide to the Galaxy
  { title: "The Hitchhiker's Guide to the Galaxy", series: "Hitchhiker's Guide to the Galaxy" },
  { title: 'The Restaurant at the End of the Universe', series: "Hitchhiker's Guide to the Galaxy" },
  { title: 'Life, the Universe and Everything', series: "Hitchhiker's Guide to the Galaxy" },
  { title: 'So Long, and Thanks for All the Fish', series: "Hitchhiker's Guide to the Galaxy" },
  { title: 'Mostly Harmless', series: "Hitchhiker's Guide to the Galaxy" },

  // Ready Player One
  { title: 'Ready Player One' },
  { title: 'Ready Player Two' },

  // The Years of Lyndon Johnson
  { title: 'The Path to Power', yearRead: 2025, series: 'The Years of Lyndon Johnson', seriesPosition: 1 },
  { title: 'Means of Ascent', yearRead: 2025, series: 'The Years of Lyndon Johnson', seriesPosition: 2 },
  { title: 'Master of the Senate', yearRead: 2026, inProgress: true, series: 'The Years of Lyndon Johnson', seriesPosition: 3 },

  // Malcolm Gladwell
  { title: 'Revenge of the Tipping Point' },
  { title: 'The Bomber Mafia' },
  { title: 'Talking to Strangers' },
  { title: 'Outliers' },
  { title: 'Blink' },
  { title: 'The Tipping Point' },

  // Jack Reacher
  { title: 'Killing Floor', series: 'Jack Reacher' },
  { title: 'Die Trying', series: 'Jack Reacher' },
  { title: 'Tripwire', series: 'Jack Reacher' },
  { title: 'Running Blind', series: 'Jack Reacher' },
  { title: 'The Enemy', series: 'Jack Reacher' },
  { title: 'One Shot', series: 'Jack Reacher' },
  { title: 'Nothing to Lose', isbn: '9780385340564', series: 'Jack Reacher' },

  // Fiction — Standalone
  { title: 'The Martian' },
  { title: 'Artemis' },
  { title: 'Project Hail Mary' },

  // Non-Fiction
  { title: 'The Power Broker: Robert Moses and the Fall of New York', yearRead: 2025 },
  { title: 'The Wager', isbn: '9781471183676', yearRead: 2025 },
  { title: 'The Wide Wide Sea', isbn: '9780385544764', yearRead: 2025 },
  { title: 'The Fabric of Civilization', yearRead: 2026 },
  { title: 'Blood and Thunder', yearRead: 2026 },
  { title: 'How Big Things Get Done', isbn: '9781035018949', yearRead: 2025 },
  { title: 'Designing Data-Intensive Applications' },
  { title: 'The Fellowship of the Ring', isbn: '9780007770120' },
  { title: 'The Two Towers', isbn: '9780007770113' },
  { title: 'The Return of the King', isbn: '9780345253453' }
];

// ── Types ──────────────────────────────────────────────────────────────────────

type OLResult = {
  title?: string;
  isbn?: string;
  cover?: string;
  genres?: string[];
  author?: string;
  series?: string;
  seriesPosition?: number;
};

type FetchedBook = InputBook & {
  cover?: string;
  genres?: string[];
  resolvedSeries?: string;
};

type SeriesBook = { title: string; isbn?: string; inProgress?: boolean };

type BookEntry = {
  id: string;
  title: string;
  author?: string;
  type: 'book' | 'series';
  yearRead?: number;
  inProgress?: boolean;
  isbn?: string;
  cover?: string;
  genres?: string[];
  books?: SeriesBook[];
};

// ── Cache ──────────────────────────────────────────────────────────────────────

type Cache = Record<string, unknown>;

const cache: Cache = (() => {
  try {
    return existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) : {};
  } catch {
    return {};
  }
})();

function saveCache() {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function cachedFetch(url: string): Promise<unknown> {
  if (url in cache) return cache[url];
  console.log(`    fetching "${url}"`);
  const res = await fetch(url, { headers: { 'User-Agent': 'oneb-blog/1.0 (personal project)' } });
  if (!res.ok) return null;
  const data = await res.json();
  cache[url] = data;
  saveCache();
  return data;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SUBJECT_BLOCKLIST = new Set([
  'fiction', 'science fiction', 'science-fiction', 'nonfiction', 'non-fiction', 'english language', 'literature',
  'accessible book', 'protected daisy', 'in library', 'overdrive', 'large type books',
  'open library staff picks', 'new york times bestseller', 'sci-fi',
]);

function cleanSubjects(subjects: string[]): string[] {
  return subjects
    .map((s) => s.toLowerCase())
    .filter((s) => !SUBJECT_BLOCKLIST.has(s) && s.length < 40)
    .slice(0, 3)
    .map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()));
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripUndefined(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    );
  }
  return obj;
}

// Sorts numbers ascending with nulls/undefineds last; pass desc=true to reverse.
function nullLast(a: number | undefined, b: number | undefined, desc = false): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return desc ? b - a : a - b;
}

// ── Open Library ───────────────────────────────────────────────────────────────

const OL_FIELDS = 'title,isbn,cover_i,subject,author_name,series_name,series_position';

function buildOLUrl(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) q.set(k, v);
  }
  return `https://openlibrary.org/search.json?${q}`;
}

async function fetchOpenLibrary(title: string, isbn?: string, authorQuery?: string): Promise<OLResult> {
  const url = isbn
    ? buildOLUrl({ isbn, language: 'eng', fields: OL_FIELDS, limit: '1' })
    : buildOLUrl({ title, author_name: authorQuery, language: 'eng', fields: OL_FIELDS, limit: '5' });

  const data = await cachedFetch(url) as any;
  if (!data) return {};

  const docs = (data.docs ?? []) as any[];
  const doc = isbn
    ? docs[0]
    : docs.find((d) => (d.title as string | undefined)?.toLowerCase() === title.toLowerCase()) ?? docs[0];
  if (!doc) return {};

  const isbn13 = (doc.isbn as string[] | undefined)?.find((i) => i.length === 13)
    ?? (doc.isbn as string[] | undefined)?.[0];
  const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined;
  const genres = doc.subject ? cleanSubjects(doc.subject as string[]) : undefined;
  const author = (doc.author_name as string[] | undefined)?.[0];
  const series = (doc.series_name as string[] | undefined)?.[0];
  const rawPos = (doc.series_position as string[] | undefined)?.[0];
  const seriesPosition = rawPos != null ? parseFloat(rawPos) : undefined;

  return { title: doc.title, isbn: isbn13, cover, genres, author, series, seriesPosition };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`Processing ${BOOKS.length} books.\n`);

  const fetched: FetchedBook[] = [];
  for (const book of BOOKS) {
    console.log(`  fetch "${book.title}"…`);
    const meta = await fetchOpenLibrary(book.title, book.isbn, book.author);
    const resolvedSeries = book.series ?? meta.series;
    const seriesPosition = book.seriesPosition ?? meta.seriesPosition;
    fetched.push({ ...book, ...meta, resolvedSeries, seriesPosition });
    console.log(`    author=${meta.author ?? '?'}  series=${resolvedSeries ?? 'none'}  isbn=${meta.isbn ?? 'none'}`);
  }

  const seriesMap = new Map<string, FetchedBook[]>();
  const standalone: FetchedBook[] = [];

  for (const book of fetched) {
    if (book.resolvedSeries) {
      if (!seriesMap.has(book.resolvedSeries)) seriesMap.set(book.resolvedSeries, []);
      seriesMap.get(book.resolvedSeries)!.push(book);
    } else {
      standalone.push(book);
    }
  }

  const entries: BookEntry[] = [];

  for (const [seriesName, books] of seriesMap) {
    const first = books[0];
    const years = books.map((b) => b.yearRead).filter((y): y is number => y != null);
    entries.push({
      id: slugify(seriesName),
      title: seriesName,
      author: first.author,
      type: 'series',
      yearRead: years.length ? Math.max(...years) : undefined,
      cover: first.cover,
      genres: first.genres,
      books: [...books]
        .sort((a, b) => nullLast(a.seriesPosition, b.seriesPosition))
        .map((b) => ({ title: b.title, isbn: b.isbn, inProgress: b.inProgress })),
    });
  }

  for (const book of standalone) {
    entries.push({
      id: slugify(book.title),
      title: book.title,
      author: book.author,
      type: 'book',
      yearRead: book.yearRead,
      inProgress: book.inProgress,
      isbn: book.isbn,
      cover: book.cover,
      genres: book.genres,
    });
  }

  entries.sort((a, b) => nullLast(a.yearRead, b.yearRead, true));

  writeFileSync(BOOKS_PATH, yaml.dump(entries.map(stripUndefined), { lineWidth: 120, quotingType: '"' }));
  console.log(`\nDone — wrote ${entries.length} entries to books.yaml.`);
}

run().catch(console.error);