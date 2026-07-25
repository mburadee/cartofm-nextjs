import type { MetadataRoute } from 'next';
import { COUNTRIES } from '@/data/countries';
import { locales } from '@/i18n/config';
import { getCountryStats, getStationsByCountryCode, stationSlug } from '@/lib/radio-browser';
import { SITE_URL } from '@/lib/seo';

// Google/Bing cap a single sitemap file at 50,000 URLs. With ~190 countries
// x ~200 stations x 10 locales you comfortably clear 100k URLs, so we split
// into an `id`-indexed set of sitemap files plus an auto-generated sitemap
// index at /sitemap.xml — this is Next.js's built-in mechanism for that.
const URLS_PER_SITEMAP = 40000;

export async function generateSitemaps() {
  // One "id" per country keeps each sitemap file's fetch cost small and
  // independently cacheable; Next.js stitches them into a sitemap index.
  return COUNTRIES.map((_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const country = COUNTRIES[id];
  if (!country) return [];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${SITE_URL}/${locale}/country/${country.slug}`,
      changeFrequency: 'daily',
      priority: 0.8,
      lastModified: new Date()
    });
  }

  const stations = await getStationsByCountryCode(country.code, 200).catch(() => []);
  for (const station of stations) {
    const slug = stationSlug(station);
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}/station/${slug}`,
        changeFrequency: 'weekly',
        priority: 0.6,
        lastModified: new Date()
      });
    }
  }

  return entries.slice(0, URLS_PER_SITEMAP);
}
