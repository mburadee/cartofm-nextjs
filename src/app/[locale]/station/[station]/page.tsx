import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Radio, Globe as GlobeIcon, Languages } from 'lucide-react';
import Header from '@/components/Header';
import StationHeroPlay from '@/components/StationHeroPlay';
import { Link } from '@/i18n/navigation';
import { getStationByUuid, uuidFromStationSlug } from '@/lib/radio-browser';
import { COUNTRY_BY_CODE } from '@/data/countries';
import { SITE_URL, stationJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const revalidate = 3600;

interface Props {
  params: { locale: string; station: string };
}

export async function generateMetadata({ params: { locale, station } }: Props): Promise<Metadata> {
  setRequestLocale(locale);
  const uuid = uuidFromStationSlug(station);
  if (!uuid) return {};
  const data = await getStationByUuid(uuid).catch(() => null);
  if (!data) return {};

  const t = await getTranslations({ locale, namespace: 'stationPage' });
  const title = t('metaTitle', { station: data.name, country: data.country });
  const description = t('metaDescription', { station: data.name, country: data.country, genre: data.tags || data.language || '' });
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/station/${station}`]));

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/station/${station}`, languages },
    openGraph: { title, description, images: data.favicon ? [data.favicon] : undefined }
  };
}

export default async function StationPage({ params: { locale, station } }: Props) {
  setRequestLocale(locale);
  const uuid = uuidFromStationSlug(station);
  if (!uuid) notFound();

  const [t, data] = await Promise.all([
    getTranslations({ locale, namespace: 'stationPage' }),
    getStationByUuid(uuid).catch(() => null)
  ]);
  if (!data) notFound();

  const countryMeta = COUNTRY_BY_CODE[data.countrycode];
  const url = `${SITE_URL}/${locale}/station/${station}`;
  const tags = data.tags ? data.tags.split(',').filter(Boolean) : [];

  return (
    <main className="min-h-screen bg-void pb-28 pt-16">
      <Header liveListeners={data.clickcount} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            stationJsonLd(data, locale, url),
            breadcrumbJsonLd([
              { name: t('breadcrumbHome'), url: `${SITE_URL}/${locale}` },
              ...(countryMeta ? [{ name: countryMeta.name, url: `${SITE_URL}/${locale}/country/${countryMeta.slug}` }] : []),
              { name: data.name, url }
            ])
          ])
        }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-8">
        <nav className="mb-6 text-xs text-mist">
          <Link href="/" className="hover:text-white">{t('breadcrumbHome')}</Link>
          {countryMeta && (
            <>
              <span className="mx-1.5">/</span>
              <Link href={`/country/${countryMeta.slug}`} className="hover:text-white">{countryMeta.name}</Link>
            </>
          )}
          <span className="mx-1.5">/</span>
          <span className="text-white">{data.name}</span>
        </nav>

        <div className="flex items-start gap-5 rounded-2xl border border-line bg-panel p-6">
          {data.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.favicon} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-panel-2 object-cover" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-panel-2 text-fog">
              <Radio size={28} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold text-white">{data.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mist">
              {countryMeta && (
                <span className="flex items-center gap-1.5">
                  <GlobeIcon size={14} /> {countryMeta.name}
                </span>
              )}
              {data.language && (
                <span className="flex items-center gap-1.5">
                  <Languages size={14} /> {data.language}
                </span>
              )}
              {data.codec && <span>{data.codec} · {data.bitrate}kbps</span>}
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.slice(0, 6).map((tag) => (
                  <Link
                    key={tag}
                    href={`/genre/${encodeURIComponent(tag.trim())}`}
                    className="rounded-full border border-line px-2.5 py-1 text-xs text-mist hover:border-signal hover:text-signal"
                  >
                    {tag.trim()}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <StationHeroPlay station={data} />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-mist">
          {t('description', { station: data.name, country: data.country || t('unknownLocation') })}
        </p>

        {data.homepage && (
          <a
            href={data.homepage}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-4 inline-block text-sm text-signal hover:underline"
          >
            {t('visitHomepage')}
          </a>
        )}
      </div>
    </main>
  );
}
