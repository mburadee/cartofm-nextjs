'use client';

import { Play, Pause, Radio } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { Link } from '@/i18n/navigation';
import { stationSlug, type Station } from '@/lib/radio-browser';
import { useTranslations } from 'next-intl';

export default function StationRow({ station }: { station: Station }) {
  const t = useTranslations('station');
  const current = usePlayerStore((s) => s.station);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);

  const isCurrent = current?.stationuuid === station.stationuuid;

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 hover:border-line hover:bg-panel">
      <button
        onClick={() => (isCurrent ? toggle() : play(station))}
        aria-label={isCurrent && isPlaying ? t('pause') : t('play')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel-2 text-signal transition group-hover:bg-signal group-hover:text-void"
      >
        {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      {station.favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={station.favicon} alt="" className="h-9 w-9 shrink-0 rounded-md bg-panel-2 object-cover" />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-panel-2 text-fog">
          <Radio size={16} />
        </div>
      )}

      <Link href={`/station/${stationSlug(station)}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{station.name}</p>
        <p className="truncate text-xs text-mist">{station.tags?.split(',').slice(0, 3).join(' · ') || station.language || ' '}</p>
      </Link>

      <span className="hidden shrink-0 text-xs text-fog sm:block">{station.bitrate ? `${station.bitrate}kbps` : ''}</span>
    </div>
  );
}
