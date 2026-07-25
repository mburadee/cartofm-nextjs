// Data layer for the Radio-Browser project (https://www.radio-browser.info),
// a free, open, community-maintained database of 50,000+ internet radio
// stations with country, language, tag, and geo metadata. This is what
// actually powers the "click a country, get its stations" experience —
// the linked m3u genre-playlist repo is folded in separately as a
// supplementary "genre stations" source (see genre-playlists.ts).
//
// Radio-Browser is a rotating pool of mirror servers behind a DNS round-robin
// at all.api.radio-browser.info. We pin to a couple of stable mirrors with a
// fallback so a single mirror outage doesn't take the whole site down.

const MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info'
];

const APP_USER_AGENT = 'GlobecastRadio/1.0 (+https://example.com)';

export interface Station {
  stationuuid: string;
  name: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  languagecodes: string;
  codec: string;
  bitrate: number;
  votes: number;
  clickcount: number;
  lastcheckok: number;
  geo_lat: number | null;
  geo_long: number | null;
}

export interface CountryStat {
  name: string;
  stationcount: number;
}

export interface TagStat {
  name: string;
  stationcount: number;
}

async function rbFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  let lastError: unknown;
  for (const base of MIRRORS) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { 'User-Agent': APP_USER_AGENT },
        next: { revalidate: revalidateSeconds }
      });
      if (!res.ok) throw new Error(`Radio-Browser ${res.status} on ${base}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      continue; // try next mirror
    }
  }
  throw lastError ?? new Error('All Radio-Browser mirrors failed');
}

/** Station counts per ISO country code — used to only render globe markers / generate pages for countries that actually have live stations. */
export async function getCountryStats(): Promise<CountryStat[]> {
  return rbFetch<CountryStat[]>('/json/countries', 60 * 60 * 12);
}

/** Stations for a given ISO 3166-1 alpha-2 country code, sorted by popularity. */
export async function getStationsByCountryCode(code: string, limit = 200): Promise<Station[]> {
  return rbFetch<Station[]>(
    `/json/stations/bycountrycodeexact/${encodeURIComponent(code)}?order=clickcount&reverse=true&limit=${limit}&hidebroken=true`,
    60 * 30
  );
}

/** A single station by its stable UUID — used for station detail pages. */
export async function getStationByUuid(uuid: string): Promise<Station | null> {
  const results = await rbFetch<Station[]>(`/json/stations/byuuid/${encodeURIComponent(uuid)}`, 60 * 30);
  return results[0] ?? null;
}

/** Top tags/genres across the whole network, for genre landing pages. */
export async function getTopTags(limit = 100): Promise<TagStat[]> {
  const tags = await rbFetch<TagStat[]>('/json/tags?order=stationcount&reverse=true', 60 * 60 * 12);
  return tags.filter((t) => t.name && t.name.length > 1).slice(0, limit);
}

export async function getStationsByTag(tag: string, limit = 100): Promise<Station[]> {
  return rbFetch<Station[]>(
    `/json/stations/bytagexact/${encodeURIComponent(tag)}?order=clickcount&reverse=true&limit=${limit}&hidebroken=true`,
    60 * 30
  );
}

export async function searchStations(query: string, limit = 40): Promise<Station[]> {
  return rbFetch<Station[]>(
    `/json/stations/search?name=${encodeURIComponent(query)}&order=clickcount&reverse=true&limit=${limit}&hidebroken=true`,
    60 * 10
  );
}

/** Fire-and-forget click registration, required by Radio-Browser's usage terms to keep the shared vote/click counters meaningful. */
export function registerClick(uuid: string) {
  const base = MIRRORS[0];
  fetch(`${base}/json/url/${encodeURIComponent(uuid)}`, { method: 'GET', keepalive: true }).catch(() => {});
}

export function stationSlug(station: Pick<Station, 'name' | 'stationuuid'>) {
  const namePart = station.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  // Double-hyphen separator is safe: UUIDs only ever contain single hyphens,
  // so we can always recover the exact UUID with a rightmost split.
  return `${namePart}--${station.stationuuid}`;
}

export function uuidFromStationSlug(slug: string): string | null {
  const idx = slug.lastIndexOf('--');
  if (idx === -1) return null;
  return slug.slice(idx + 2);
}
