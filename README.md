# Globecast — global radio, on a globe

A Next.js 14 (App Router) app for browsing and streaming internet radio by
country on an interactive 3D globe, in the spirit of radio.garden. Built for
SEO scale: dynamic per-country / per-station / per-genre pages, 10-language
i18n, structured data, and a sitemap system designed to clear 100k+ indexed
URLs.

## Before you run it — read this

This was written in a sandbox with **no package registry access**, so
nothing here has been `npm install`'d or build-tested. Treat it as a
carefully-written first draft: the architecture and logic are sound, but
expect to fix a handful of small compile errors (mismatched types between
`react-globe.gl`'s loose typings and strict TS, an import path, etc.) on
your first `npm run build`. That's normal for a project this size.

## Quick start

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL to your real domain
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/en` (or your browser's
preferred supported locale).

## What's actually wired up vs. what's a foundation

**Fully wired, using live data:**
- Globe → country pages → station pages, backed by the [Radio-Browser
  API](https://www.radio-browser.info) (~50,000 real stations, free, no key
  needed, mirrored across multiple servers with fallback)
- Persistent bottom audio player (real `<audio>` element, not a mock)
- 10-language UI (next-intl), RTL support for Arabic, hreflang tags
- SEO metadata, JSON-LD (`RadioStation`, `CollectionPage`, `BreadcrumbList`),
  canonical URLs, Open Graph
- Chunked `sitemap.xml` + `robots.txt`
- Curated "mix" pages sourced directly from the m3u playlist repo you linked

**Foundation you'll want to build out before launch:**
- The country centroid list in `src/data/countries.ts` covers ~150 countries
  with hand-set coordinates. Radio-Browser itself covers more; cross-check
  and fill in any gaps (a full ISO-3166 centroid dataset is a 10-minute
  addition).
- Only the top 30 countries × 10 locales are pre-rendered at build time
  (`generateStaticParams` in the country page). Everything else renders
  on-demand via ISR (`revalidate`) — correct for scale, but you should
  benchmark real build times and tune the pre-render list to your traffic.
- No analytics, no error monitoring, no CDN/image-optimization config beyond
  Next's defaults — add what your hosting stack needs.
- No automated tests.

## Why Radio-Browser instead of the linked m3u repo

The `m3u-radio-music-playlists` repo you linked is organized **by genre**
(jazz.m3u, trance.m3u, 80s.m3u, ...), not by country, and its entries don't
carry geo-coordinates. That makes it a great fit for the "curated mixes"
feature (`/mix/[genre]`, see `src/lib/genre-playlists.ts` and
`src/lib/m3u.ts`, which fetch and parse the raw `.m3u` files directly from
your linked repo) — but it can't drive a "click a country marker" globe by
itself, since there's no per-station country/lat-lng data in that format.

Radio-Browser is the standard open dataset for exactly this use case: every
station has `country`, `countrycode`, `geo_lat`/`geo_long`, `language`,
`tags`, bitrate, and a stable UUID. It's what most radio.garden-style
clones and apps (VLC's internet radio directory, many car head units, etc.)
build on. `src/lib/radio-browser.ts` is the single place all of that data
flows through — swap it out or add sources there if you want to blend in
your own scraped stations later.

## Architecture

```
src/
  app/[locale]/
    page.tsx                 → home page, 3D globe
    country/[country]/       → SEO page per country, station list
    station/[station]/       → SEO page per station, player + metadata
    genre/[tag]/              → SEO page per Radio-Browser tag
    mix/[genre]/              → curated playlist pages from the m3u repo
  app/sitemap.ts              → chunked sitemap generation (see below)
  app/robots.ts
  components/                 → Globe, PlayerBar, Header, station rows, etc.
  data/countries.ts           → country name/ISO-code/lat-lng/slug table
  lib/radio-browser.ts        → Radio-Browser API client (the data spine)
  lib/m3u.ts, genre-playlists.ts → your linked m3u repo, parsed
  lib/seo.ts                  → JSON-LD builders, SITE_URL constant
  i18n/                       → next-intl config, locale list, navigation
  store/player-store.ts       → Zustand store shared by every page
messages/<locale>.json        → UI strings, one file per language
```

## How this scales to 100k+ indexed pages

Rough math with what's already wired:
- ~150–190 countries × 10 locales = ~1,500–1,900 country pages
- Radio-Browser has 50,000+ stations; even a conservative subset (say the
  top 200 per country across ~190 countries, deduped) × 10 locales pushes
  well past 100,000 station-page URLs
- Plus genre pages (`/genre/[tag]`) and curated mix pages (`/mix/[genre]`),
  each × 10 locales

You do **not** statically build all of that. The pattern here is:
1. Pre-render only the highest-traffic pages (`generateStaticParams`
   returns a curated subset — currently top 30 countries × all locales).
2. Everything else is rendered on first request and cached via ISR
   (`export const revalidate = ...` on each page).
3. `app/sitemap.ts` uses Next's `generateSitemaps()` to split the URL set
   into many sitemap files (one per country, capped at 40k URLs each) so
   you clear Google/Bing's 50k-URL-per-file limit without a single giant
   sitemap.

To actually reach and hold 100k+ **daily organic** visits, the codebase is
necessary but not sufficient — you'll also need: real backlinks, submitting
sitemaps in Search Console/Bing Webmaster Tools, monitoring which pages get
indexed vs. skipped (thin/duplicate station pages often get deprioritized —
consider enriching descriptions per station rather than relying purely on
templated copy), and probably 3–6 months of organic ramp-up. That part is
ongoing SEO/content work, not something any single build can guarantee.

## Extending language coverage

Add a locale in two places:
1. `src/i18n/config.ts` — add the code to `locales` and a display name to
   `localeNames`
2. `messages/<code>.json` — copy `messages/en.json` and translate

## Deployment

Any Next.js host works (Vercel is the path of least resistance for ISR +
image optimization + edge middleware for locale routing out of the box).
Set `NEXT_PUBLIC_SITE_URL` to your real domain before building, since it
feeds canonical URLs, hreflang tags, and the sitemap.
