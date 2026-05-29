import { existsSync, readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';

/*
 * Fills in the `image` field for media.yaml entries that have a URL but no
 * image. Existing `image` values are never overwritten, so manual overrides
 * are preserved. Safe to re-run at any time.
 *
 * Image sources by type:
 *   podcast + Apple Podcasts URL  → iTunes lookup API (artworkUrl600)
 *   everything else               → Google favicon service
 *
 * iTunes responses are cached in .media-cache.json to avoid redundant calls.
 *
 * Run with:
 *   bun run media
 *
 * To force-refresh all images, delete the `image` fields first.
 */

const MEDIA_PATH = new URL('../src/content/media.yaml', import.meta.url).pathname;
const CACHE_PATH = new URL('.media-cache.json', import.meta.url).pathname;

type MediaEntry = Record<string, unknown> & { type?: string; url?: string; image?: string };
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
  console.log(`  fetching "${url}"`);
  const res = await fetch(url, { headers: { 'User-Agent': 'oneb-blog/1.0 (personal project)' } });
  if (!res.ok) return null;
  const data = await res.json();
  cache[url] = data;
  saveCache();
  return data;
}

function faviconUrl(url: string): string {
  const { hostname } = new URL(url);
  return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
}

async function podcastImage(url: string): Promise<string | undefined> {
  const appleId = url.match(/\/id(\d+)/)?.[1];
  if (!appleId) return undefined;
  const data = await cachedFetch(`https://itunes.apple.com/lookup?id=${appleId}&entity=podcast`) as any;
  return data?.results?.[0]?.artworkUrl600 ?? undefined;
}

const entries = yaml.load(readFileSync(MEDIA_PATH, 'utf-8')) as MediaEntry[];
let changed = 0;

for (const entry of entries) {
  if (!entry.url || entry.image) continue;
  const image = entry.type === 'podcast'
    ? (await podcastImage(entry.url) ?? faviconUrl(entry.url))
    : faviconUrl(entry.url);
  entry.image = image;
  changed++;
}

writeFileSync(MEDIA_PATH, yaml.dump(entries, { lineWidth: 120, quotingType: '"' }));
console.log(`Done — updated ${changed} of ${entries.length} entries in media.yaml.`);