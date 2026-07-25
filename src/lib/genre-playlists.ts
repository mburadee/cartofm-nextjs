import { parseM3u, type M3uEntry } from './m3u';

// Raw files live at the repo root, one per genre/decade/language mix, e.g.
// https://raw.githubusercontent.com/jimboprojects-jpg/m3u-radio-music-playlists/main/jazz.m3u
const REPO_RAW_BASE =
  'https://raw.githubusercontent.com/jimboprojects-jpg/m3u-radio-music-playlists/main';

// A hand-picked subset of the repo's ~90 playlist files to surface as
// "curated mixes" (distinct from the live Radio-Browser tag pages at
// /genre/[tag]). Extend this list to add more of the repo's files —
// see the full file index at the repo's GitHub page.
export const CURATED_MIXES = [
  'jazz',
  'rock',
  'classical',
  'chillout',
  'trance',
  'hip_hop',
  'reggae',
  'metal',
  'lounge',
  'blues',
  'salsa',
  'gospel',
  'punk',
  'ambient',
  '80s',
  '90s',
  'arabic',
  'african',
  'anime',
  'christian'
] as const;

export type CuratedMixSlug = (typeof CURATED_MIXES)[number];

export async function getCuratedMix(slug: string): Promise<M3uEntry[]> {
  if (!CURATED_MIXES.includes(slug as CuratedMixSlug)) return [];
  const res = await fetch(`${REPO_RAW_BASE}/${slug}.m3u`, {
    next: { revalidate: 60 * 60 * 24 } // repo updates infrequently
  });
  if (!res.ok) return [];
  const text = await res.text();
  return parseM3u(text).slice(0, 150); // cap for page weight; these files can be very long
}
