'use client';

import { Music4, MapPin, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { StationSpeckle } from '@/lib/station-speckles';

export default function StationTeaserCard({ station }: { station: StationSpeckle | null }) {
  const t = useTranslations('globe');
  if (!station) return null;

  return (
    <div className="absolute bottom-28 right-6 z-30 w-80 rounded-2xl border border-cyan-500 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-2 text-white">
        <Radio size={16} className="text-cyan-400" />
        <h3 className="truncate font-display text-base font-semibold">{station.name}</h3>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <MapPin size={13} />
        {station.countryCode}
      </div>
      {station.favicon && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={station.favicon} alt="" className="h-8 w-8 rounded bg-slate-800" />
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-lime-400">
        <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
        Now playing
      </div>
    </div>
  );
}
