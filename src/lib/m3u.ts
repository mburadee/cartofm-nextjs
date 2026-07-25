export interface M3uEntry {
  name: string;
  url: string;
}

/**
 * m3u playlist entries don't carry the rich metadata Radio-Browser stations
 * do (no stable UUID, favicon, country, bitrate, etc). This adapter fakes a
 * minimal, stable, deterministic "station" shape from the entry so the same
 * PlayerBar / StationRow components can play both sources interchangeably.
 */
export function m3uEntryToStation(entry: M3uEntry) {
  // Deterministic pseudo-UUID from the stream URL so the same track always
  // maps to the same id across requests (no crypto needed, just stability).
  let hash = 0;
  for (let i = 0; i < entry.url.length; i++) {
    hash = (hash * 31 + entry.url.charCodeAt(i)) >>> 0;
  }
  const pseudoUuid = `mix-${hash.toString(16).padStart(8, '0')}`;

  return {
    stationuuid: pseudoUuid,
    name: entry.name,
    url_resolved: entry.url,
    homepage: '',
    favicon: '',
    tags: '',
    country: '',
    countrycode: '',
    state: '',
    language: '',
    languagecodes: '',
    codec: '',
    bitrate: 0,
    votes: 0,
    clickcount: 0,
    lastcheckok: 1,
    geo_lat: null,
    geo_long: null
  };
}

/**
 * Parses standard #EXTM3U playlist text into {name, url} entries.
 * Format:
 *   #EXTM3U
 *   #EXTINF:-1,Station Name
 *   http://stream.example.com/stream
 */
export function parseM3u(text: string): M3uEntry[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const entries: M3uEntry[] = [];
  let pendingName: string | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('#EXTM3U')) continue;

    if (line.startsWith('#EXTINF')) {
      const commaIdx = line.indexOf(',');
      pendingName = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : null;
      continue;
    }

    if (line.startsWith('#')) continue; // other metadata/comment lines

    // A non-comment line is a stream URL
    entries.push({
      name: pendingName || new URL(line, 'http://placeholder').pathname.split('/').pop() || line,
      url: line
    });
    pendingName = null;
  }

  return entries;
}
