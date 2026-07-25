// Single source of truth for supported locales.
// Add a locale here + a matching messages/<code>.json file to extend language coverage.
export const locales = [
  'en', // English
  'es', // Español
  'pt', // Português
  'fr', // Français
  'de', // Deutsch
  'ru', // Русский
  'ar', // العربية
  'hi', // हिन्दी
  'zh', // 中文
  'ja'  // 日本語
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  zh: '中文',
  ja: '日本語'
};

export const rtlLocales: Locale[] = ['ar'];

export function isRtl(locale: string) {
  return rtlLocales.includes(locale as Locale);
}
