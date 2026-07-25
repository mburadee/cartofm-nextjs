'use client';

import { Radio, Heart, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { usePlayerStore } from '@/store/player-store';

export default function Header({ liveListeners }: { liveListeners: number }) {
  const t = useTranslations('nav');
  const station = usePlayerStore((s) => s.station);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-line bg-void/90 px-4 backdrop-blur">
      <div className="flex items-center gap-6 min-w-0">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
          <Radio className="text-signal" size={22} />
          Globe<span className="text-signal">cast</span>
        </Link>

        {station && (
          <div className="hidden min-w-0 items-center gap-3 rounded-full border border-line bg-panel px-3 py-1.5 md:flex">
            <span
              className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-beacon animate-pulse-slow' : 'bg-fog'}`}
              aria-hidden
            />
            <span className="truncate text-sm text-white">{station.name}</span>
            <span className="hidden text-xs uppercase tracking-wide text-beacon lg:inline">{t('live')}</span>
            <span className="hidden text-xs text-mist lg:inline">{station.country}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-1.5 text-xs text-mist sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          {liveListeners.toLocaleString()}
        </span>
        <LanguageSwitcher />
        <button aria-label={t('favorites')} className="text-mist hover:text-beacon">
          <Heart size={18} />
        </button>
        <button aria-label={t('about')} className="text-mist hover:text-white">
          <Info size={18} />
        </button>
      </div>
    </header>
  );
}
