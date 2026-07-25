'use client';

import { Play, Pause } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useTranslations } from 'next-intl';
import type { Station } from '@/lib/radio-browser';

export default function StationHeroPlay({ station }: { station: Station }) {
  const t = useTranslations('station');
  const current = usePlayerStore((s) => s.station);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);
  const isCurrent = current?.stationuuid === station.stationuuid;

  return (
    <button
      onClick={() => (isCurrent ? toggle() : play(station))}
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-beacon text-void shadow-lg shadow-beacon/20 transition hover:brightness-110"
      aria-label={isCurrent && isPlaying ? t('pause') : t('play')}
    >
      {isCurrent && isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
    </button>
  );
}
