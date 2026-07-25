import type { Station } from './radio-browser';
import type { CountryMeta } from '@/data/countries';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://globecast.example.com';

export function stationJsonLd(station: Station, locale: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: station.name,
    url,
    broadcastAffiliateOf: station.country,
    inLanguage: station.language || undefined,
    image: station.favicon || undefined,
    areaServed: station.country || undefined,
    potentialAction: {
      '@type': 'ListenAction',
      target: station.url_resolved
    }
  };
}

export function countryJsonLd(country: CountryMeta, stationCount: number, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Radio stations in ${country.name}`,
    url,
    about: {
      '@type': 'Country',
      name: country.name
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stationCount
    }
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}
