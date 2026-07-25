'use client';

import { Music4, MapPin, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { GlobePoint } from './Globe';

export default function CountryTeaserCard({ point }: { point: GlobePoint | null }) {
  const t = useTranslations('globe');
  if (!point) return null;

  return (
    <Link
      href={`/country/${point.slug}`}
      className="absolute bottom-28 right-6 z-30 w-80 rounded-2xl border border-line bg-panel/95 p-4 shadow-2xl backdrop-blur transition hover:border-signal/50 sm:bottom-8"
    >
      <div className="flex items-center gap-2 text-white">
        <Radio size={16} className="text-signal" />
        <h3 className="truncate font-display text-base font-semibold">{point.name}</h3>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-mist">
        <MapPin size={13} />
        {point.region}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-mist">
        <Music4 size={13} />
        {t('stationCount', { count: point.stationcount })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-beacon">
        <span className="h-1.5 w-1.5 rounded-full bg-beacon" />
        {t('cta')}
      </div>
    </Link>
  );
}
