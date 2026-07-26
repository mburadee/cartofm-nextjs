import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import MixTrackRow from '@/components/MixTrackRow';
import { Link } from '@/i18n/navigation';
import { CURATED_MIXES, getCuratedMix } from '@/lib/genre-playlists';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';
import { locales } from '@/i18n/config';

export const revalidate = 86400;

interface Props {
  params: { locale: string; genre: string };
}

export function generateStaticParams() {
  return locales.flatMap((locale) => CURATED_MIXES.map((genre) => ({ locale, genre })));
}

export async function generateMetadata({ params: { locale, genre } }: Props): Promise<Metadata> {
  setRequestLocale(locale);
  if (!CURATED_MIXES.includes(genre as any)) return {};
  const t = await getTranslations({ locale, namespace: 'mix' });
  const label = genre.replace(/_/g, ' ');
  const title = t('metaTitle', { genre: label });
  const description = t('metaDescription', { genre: label });
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/mix/${genre}`]));

  return { title, description, alternates: { canonical: `/${locale}/mix/${genre}`, languages } };
}

export default async function MixPage({ params: { locale, genre } }: Props) {
  setRequestLocale(locale);
  if (!CURATED_MIXES.includes(genre as any)) notFound();

  const [t, tracks] = await Promise.all([
    getTranslations({ locale, namespace: 'mix' }),
    getCuratedMix(genre)
  ]);
  if (tracks.length === 0) notFound();

  const label = genre.replace(/_/g, ' ');
  const url = `${SITE_URL}/${locale}/mix/${genre}`;

  return (
    <main className="min-h-screen bg-void pb-28 pt-16">
      <Header liveListeners={tracks.length} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: t('breadcrumbHome'), url: `${SITE_URL}/${locale}` },
              { name: label, url }
            ])
          )
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <nav className="mb-4 text-xs text-mist">
          <Link href="/" className="hover:text-white">{t('breadcrumbHome')}</Link>
          <span className="mx-1.5">/</span>
          <span className="capitalize text-white">{label}</span>
        </nav>
        <h1 className="font-display text-3xl font-bold capitalize text-white">{t('heading', { genre: label })}</h1>
        <p className="mt-2 text-sm text-mist">{t('subheading', { count: tracks.length })}</p>
        <p className="mt-1 text-xs text-fog">{t('source')}</p>
        <div className="mt-6 space-y-1">
          {tracks.map((entry, i) => (
            <MixTrackRow key={`${entry.url}-${i}`} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
