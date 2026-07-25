import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import StationRow from '@/components/StationRow';
import { Link } from '@/i18n/navigation';
import { getStationsByTag, getTopTags } from '@/lib/radio-browser';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const revalidate = 3600;

interface Props {
  params: { locale: string; tag: string };
}

export async function generateStaticParams() {
  const tags = await getTopTags(20).catch(() => []);
  return locales.flatMap((locale) => tags.map((t) => ({ locale, tag: t.name })));
}

export async function generateMetadata({ params: { locale, tag } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'genre' });
  const decoded = decodeURIComponent(tag);
  const title = t('metaTitle', { genre: decoded });
  const description = t('metaDescription', { genre: decoded });
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/genre/${tag}`]));

  return { title, description, alternates: { canonical: `/${locale}/genre/${tag}`, languages } };
}

export default async function GenrePage({ params: { locale, tag } }: Props) {
  const decoded = decodeURIComponent(tag);
  const [t, stations] = await Promise.all([
    getTranslations({ locale, namespace: 'genre' }),
    getStationsByTag(decoded, 100).catch(() => [])
  ]);
  if (stations.length === 0) notFound();

  const url = `${SITE_URL}/${locale}/genre/${tag}`;

  return (
    <main className="min-h-screen bg-void pb-28 pt-16">
      <Header liveListeners={stations.length} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: t('breadcrumbHome'), url: `${SITE_URL}/${locale}` },
              { name: decoded, url }
            ])
          )
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <nav className="mb-4 text-xs text-mist">
          <Link href="/" className="hover:text-white">{t('breadcrumbHome')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-white capitalize">{decoded}</span>
        </nav>
        <h1 className="font-display text-3xl font-bold capitalize text-white">{t('heading', { genre: decoded })}</h1>
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
