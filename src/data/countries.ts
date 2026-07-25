// Country metadata: approximate geographic centroid (for globe marker placement),
// ISO 3166-1 alpha-2 code (matches Radio-Browser's `countrycode` field), and a
// URL-safe slug used for /country/[slug] routes.
//
// This is the join table between geography (the globe) and the Radio-Browser
// station database, which is keyed by ISO country code.

export interface CountryMeta {
  code: string; // ISO 3166-1 alpha-2, uppercase
  name: string;
  slug: string;
  lat: number;
  lng: number;
  region: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const RAW: [string, string, number, number, string][] = [
  ['US', 'United States', 39.8, -98.5, 'Americas'],
  ['CA', 'Canada', 56.1, -106.3, 'Americas'],
  ['MX', 'Mexico', 23.6, -102.5, 'Americas'],
  ['BR', 'Brazil', -14.2, -51.9, 'Americas'],
  ['AR', 'Argentina', -38.4, -63.6, 'Americas'],
  ['CL', 'Chile', -35.7, -71.5, 'Americas'],
  ['CO', 'Colombia', 4.6, -74.3, 'Americas'],
  ['PE', 'Peru', -9.2, -75.0, 'Americas'],
  ['VE', 'Venezuela', 6.4, -66.6, 'Americas'],
  ['EC', 'Ecuador', -1.8, -78.2, 'Americas'],
  ['BO', 'Bolivia', -16.3, -63.6, 'Americas'],
  ['UY', 'Uruguay', -32.5, -55.8, 'Americas'],
  ['PY', 'Paraguay', -23.4, -58.4, 'Americas'],
  ['CU', 'Cuba', 21.5, -77.8, 'Americas'],
  ['DO', 'Dominican Republic', 18.7, -70.2, 'Americas'],
  ['GT', 'Guatemala', 15.8, -90.2, 'Americas'],
  ['HN', 'Honduras', 15.2, -86.2, 'Americas'],
  ['SV', 'El Salvador', 13.8, -88.9, 'Americas'],
  ['NI', 'Nicaragua', 12.9, -85.2, 'Americas'],
  ['CR', 'Costa Rica', 9.7, -84.0, 'Americas'],
  ['PA', 'Panama', 8.5, -80.8, 'Americas'],
  ['JM', 'Jamaica', 18.1, -77.3, 'Americas'],
  ['HT', 'Haiti', 18.9, -72.3, 'Americas'],
  ['PR', 'Puerto Rico', 18.2, -66.6, 'Americas'],
  ['GB', 'United Kingdom', 55.4, -3.4, 'Europe'],
  ['IE', 'Ireland', 53.4, -8.2, 'Europe'],
  ['FR', 'France', 46.6, 2.2, 'Europe'],
  ['DE', 'Germany', 51.2, 10.4, 'Europe'],
  ['ES', 'Spain', 40.5, -3.7, 'Europe'],
  ['PT', 'Portugal', 39.4, -8.2, 'Europe'],
  ['IT', 'Italy', 42.8, 12.6, 'Europe'],
  ['NL', 'Netherlands', 52.1, 5.3, 'Europe'],
  ['BE', 'Belgium', 50.5, 4.5, 'Europe'],
  ['CH', 'Switzerland', 46.8, 8.2, 'Europe'],
  ['AT', 'Austria', 47.5, 14.6, 'Europe'],
  ['SE', 'Sweden', 60.1, 18.6, 'Europe'],
  ['NO', 'Norway', 60.5, 8.5, 'Europe'],
  ['DK', 'Denmark', 56.3, 9.5, 'Europe'],
  ['FI', 'Finland', 61.9, 25.7, 'Europe'],
  ['IS', 'Iceland', 64.9, -19.0, 'Europe'],
  ['PL', 'Poland', 51.9, 19.1, 'Europe'],
  ['CZ', 'Czechia', 49.8, 15.5, 'Europe'],
  ['SK', 'Slovakia', 48.7, 19.7, 'Europe'],
  ['HU', 'Hungary', 47.2, 19.5, 'Europe'],
  ['RO', 'Romania', 45.9, 24.9, 'Europe'],
  ['BG', 'Bulgaria', 42.7, 25.5, 'Europe'],
  ['GR', 'Greece', 39.1, 21.8, 'Europe'],
  ['UA', 'Ukraine', 48.4, 31.2, 'Europe'],
  ['RU', 'Russia', 61.5, 105.3, 'Europe'],
  ['BY', 'Belarus', 53.7, 27.9, 'Europe'],
  ['LT', 'Lithuania', 55.2, 23.9, 'Europe'],
  ['LV', 'Latvia', 56.9, 24.6, 'Europe'],
  ['EE', 'Estonia', 58.6, 25.0, 'Europe'],
  ['HR', 'Croatia', 45.1, 15.2, 'Europe'],
  ['SI', 'Slovenia', 46.2, 15.0, 'Europe'],
  ['RS', 'Serbia', 44.0, 21.0, 'Europe'],
  ['BA', 'Bosnia and Herzegovina', 43.9, 17.7, 'Europe'],
  ['AL', 'Albania', 41.2, 20.2, 'Europe'],
  ['MK', 'North Macedonia', 41.6, 21.7, 'Europe'],
  ['ME', 'Montenegro', 42.7, 19.4, 'Europe'],
  ['MD', 'Moldova', 47.4, 28.4, 'Europe'],
  ['LU', 'Luxembourg', 49.8, 6.1, 'Europe'],
  ['MT', 'Malta', 35.9, 14.4, 'Europe'],
  ['CY', 'Cyprus', 35.1, 33.4, 'Europe'],
  ['TR', 'Turkey', 38.9, 35.2, 'Europe'],
  ['GE', 'Georgia', 42.3, 43.4, 'Europe'],
  ['AM', 'Armenia', 40.1, 45.0, 'Europe'],
  ['AZ', 'Azerbaijan', 40.1, 47.6, 'Europe'],
  ['CN', 'China', 35.9, 104.2, 'Asia'],
  ['JP', 'Japan', 36.2, 138.3, 'Asia'],
  ['KR', 'South Korea', 35.9, 127.8, 'Asia'],
  ['IN', 'India', 20.6, 79.0, 'Asia'],
  ['ID', 'Indonesia', -0.8, 113.9, 'Asia'],
  ['PK', 'Pakistan', 30.4, 69.3, 'Asia'],
  ['BD', 'Bangladesh', 23.7, 90.4, 'Asia'],
  ['VN', 'Vietnam', 14.1, 108.3, 'Asia'],
  ['TH', 'Thailand', 15.9, 101.0, 'Asia'],
  ['PH', 'Philippines', 12.9, 121.8, 'Asia'],
  ['MY', 'Malaysia', 4.2, 101.9, 'Asia'],
  ['SG', 'Singapore', 1.35, 103.8, 'Asia'],
  ['MM', 'Myanmar', 21.9, 95.9, 'Asia'],
  ['KH', 'Cambodia', 12.6, 105.0, 'Asia'],
  ['LA', 'Laos', 19.9, 102.5, 'Asia'],
  ['NP', 'Nepal', 28.4, 84.1, 'Asia'],
  ['LK', 'Sri Lanka', 7.9, 80.7, 'Asia'],
  ['MN', 'Mongolia', 46.9, 103.8, 'Asia'],
  ['KZ', 'Kazakhstan', 48.0, 66.9, 'Asia'],
  ['UZ', 'Uzbekistan', 41.4, 64.6, 'Asia'],
  ['TW', 'Taiwan', 23.7, 121.0, 'Asia'],
  ['HK', 'Hong Kong', 22.3, 114.2, 'Asia'],
  ['IL', 'Israel', 31.0, 34.9, 'Asia'],
  ['SA', 'Saudi Arabia', 23.9, 45.1, 'Asia'],
  ['AE', 'United Arab Emirates', 23.4, 53.8, 'Asia'],
  ['QA', 'Qatar', 25.4, 51.2, 'Asia'],
  ['KW', 'Kuwait', 29.3, 47.5, 'Asia'],
  ['BH', 'Bahrain', 26.1, 50.6, 'Asia'],
  ['OM', 'Oman', 21.5, 55.9, 'Asia'],
  ['JO', 'Jordan', 30.6, 36.2, 'Asia'],
  ['LB', 'Lebanon', 33.9, 35.9, 'Asia'],
  ['IQ', 'Iraq', 33.2, 43.7, 'Asia'],
  ['IR', 'Iran', 32.4, 53.7, 'Asia'],
  ['AF', 'Afghanistan', 33.9, 67.7, 'Asia'],
  ['YE', 'Yemen', 15.6, 48.0, 'Asia'],
  ['SY', 'Syria', 34.8, 39.0, 'Asia'],
  ['PS', 'Palestine', 31.9, 35.2, 'Asia'],
  ['EG', 'Egypt', 26.8, 30.8, 'Africa'],
  ['ZA', 'South Africa', -30.6, 22.9, 'Africa'],
  ['NG', 'Nigeria', 9.1, 8.7, 'Africa'],
  ['KE', 'Kenya', -0.02, 37.9, 'Africa'],
  ['ET', 'Ethiopia', 9.1, 40.5, 'Africa'],
  ['GH', 'Ghana', 7.9, -1.0, 'Africa'],
  ['TZ', 'Tanzania', -6.4, 34.9, 'Africa'],
  ['UG', 'Uganda', 1.4, 32.3, 'Africa'],
  ['DZ', 'Algeria', 28.0, 1.7, 'Africa'],
  ['MA', 'Morocco', 31.8, -7.1, 'Africa'],
  ['TN', 'Tunisia', 33.9, 9.5, 'Africa'],
  ['LY', 'Libya', 26.3, 17.2, 'Africa'],
  ['SD', 'Sudan', 12.9, 30.2, 'Africa'],
  ['SN', 'Senegal', 14.5, -14.5, 'Africa'],
  ['CI', "Cote d'Ivoire", 7.5, -5.5, 'Africa'],
  ['CM', 'Cameroon', 7.4, 12.4, 'Africa'],
  ['ZM', 'Zambia', -13.1, 27.8, 'Africa'],
  ['ZW', 'Zimbabwe', -19.0, 29.2, 'Africa'],
  ['MZ', 'Mozambique', -18.7, 35.5, 'Africa'],
  ['AO', 'Angola', -11.2, 17.9, 'Africa'],
  ['NA', 'Namibia', -22.9, 18.5, 'Africa'],
  ['BW', 'Botswana', -22.3, 24.7, 'Africa'],
  ['RW', 'Rwanda', -1.9, 29.9, 'Africa'],
  ['ML', 'Mali', 17.6, -4.0, 'Africa'],
  ['NE', 'Niger', 17.6, 8.1, 'Africa'],
  ['BF', 'Burkina Faso', 12.2, -1.6, 'Africa'],
  ['MG', 'Madagascar', -18.8, 46.9, 'Africa'],
  ['CD', 'DR Congo', -4.0, 21.8, 'Africa'],
  ['CG', 'Congo', -0.2, 15.8, 'Africa'],
  ['SO', 'Somalia', 5.2, 46.2, 'Africa'],
  ['AU', 'Australia', -25.3, 133.8, 'Oceania'],
  ['NZ', 'New Zealand', -41.0, 174.9, 'Oceania'],
  ['FJ', 'Fiji', -17.7, 178.1, 'Oceania'],
  ['PG', 'Papua New Guinea', -6.3, 143.9, 'Oceania']
];

export const COUNTRIES: CountryMeta[] = RAW.map(([code, name, lat, lng, region]) => ({
  code,
  name,
  slug: slugify(name),
  lat,
  lng,
  region
}));

export const COUNTRY_BY_SLUG: Record<string, CountryMeta> = Object.fromEntries(
  COUNTRIES.map((c) => [c.slug, c])
);

export const COUNTRY_BY_CODE: Record<string, CountryMeta> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);
