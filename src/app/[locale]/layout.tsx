import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { locales, isRtl, type Locale } from '@/i18n/config';
import PlayerBar from '@/components/PlayerBar';
import { SITE_URL } from '@/lib/seo';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'site' });

  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}`]));

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s · ${t('brand')}` },
    description: t('description'),
    alternates: { canonical: `/${locale}`, languages },
    openGraph: {
      type: 'website',
      siteName: t('brand'),
      title: t('title'),
      description: t('description'),
      locale
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description') },
    robots: { index: true, follow: true }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-void font-body text-white antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <PlayerBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
