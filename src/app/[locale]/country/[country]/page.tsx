import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import StationRow from '@/components/StationRow';
import { Link } from '@/i18n/navigation';
import { COUNTRIES, COUNTRY_BY_SLUG } from '@/data/countries';
import { getStationsByCountryCode } from '@/lib/radio-browser';
import { SITE_URL, countryJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const revalidate = 1800; // 30 min — station lists update relatively often

interface Props {
  params: { locale: string; country: string };
}

// Pre-render the highest-traffic countries at build time; every other
// country/locale combination is generated on first request and cached
// (ISR), which is how this scales toward 100k+ indexed pages without a
// 100k-page build.
export function generateStaticParams() {
  const topCountries = COUNTRIES.slice(0, 30).map((c) => c.slug);
  return locales.flatMap((locale) => topCountries.map((country) => ({ locale, country })));
}

export async function generateMetadata({ params: { locale, country } }: Props): Promise<Metadata> {
  setRequestLocale(locale);
  const meta = COUNTRY_BY_SLUG[country];
  if (!meta) return {};
  const t = await getTranslations({ locale, namespace: 'country' });
  const title = t('metaTitle', { country: meta.name });
  const description = t('metaDescription', { country: meta.name });
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/country/${country}`]));

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/country/${country}`, languages },
    openGraph: { title, description }
  };
}

export default async function CountryPage({ params: { locale, country } }: Props) {
  setRequestLocale(locale);
  const meta = COUNTRY_BY_SLUG[country];
  if (!meta) notFound();

  const [t, stations] = await Promise.all([
    getTranslations({ locale, namespace: 'country' }),
    getStationsByCountryCode(meta.code).catch(() => [])
  ]);

  if (stations.length === 0) notFound();

  const url = `${SITE_URL}/${locale}/country/${country}`;

  return (
    <main className="min-h-screen bg-void pb-28 pt-16">
      <Header liveListeners={stations.length} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            countryJsonLd(meta, stations.length, url),
            breadcrumbJsonLd([
              { name: t('breadcrumbHome'), url: `${SITE_URL}/${locale}` },
              { name: meta.name, url }
            ])
          ])
        }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-8">
        <nav className="mb-4 text-xs text-mist">
          <Link href="/" className="hover:text-white">{t('breadcrumbHome')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-white">{meta.name}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-white">{t('heading', { country: meta.name })}</h1>
        <p className="mt-2 text-sm text-mist">{t('subheading', { count: stations.length })}</p>

        <div className="mt-6 space-y-1">
          {stations.map((s) => (
            <StationRow key={s.stationuuid} station={s} />
          ))}
        </div>
      </div>
    </main>
  );
}
