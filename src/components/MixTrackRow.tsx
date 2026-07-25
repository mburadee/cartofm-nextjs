'use client';

import { Play, Pause, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useTranslations } from 'next-intl';
import { m3uEntryToStation, type M3uEntry } from '@/lib/m3u';

export default function MixTrackRow({ entry }: { entry: M3uEntry }) {
  const t = useTranslations('station');
  const current = usePlayerStore((s) => s.station);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);

  const station = m3uEntryToStation(entry);
  const isCurrent = current?.stationuuid === station.stationuuid;

  return (
    <button
      onClick={() => (isCurrent ? toggle() : play(station))}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left hover:border-line hover:bg-panel"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel-2 text-signal transition group-hover:bg-signal group-hover:text-void">
        {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-panel-2 text-fog">
        <Music2 size={16} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{entry.name}</span>
      <span className="sr-only">{isCurrent && isPlaying ? t('pause') : t('play')}</span>
    </button>
  );
}
