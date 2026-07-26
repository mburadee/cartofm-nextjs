'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Globe from '@/components/Globe';
import { COUNTRIES } from '@/data/countries';
import { getCountryStats, getStationsByCountryCode } from '@/lib/radio-browser';
import { stationsToSpeckles, type StationSpeckle } from '@/lib/station-speckles';

export default function HomePage() {
  const t = useTranslations('globe');
  const [speckles, setSpeckles] = useState<StationSpeckle[]>([]);
  const [totalListeners, setTotalListeners] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setIsLoading(true);
        
        // Get country stats
        const stats = await getCountryStats().catch(() => []);
        const countByName = new Map(stats.map((s) => [s.name.toLowerCase(), s.stationcount]));
        
        const points = COUNTRIES.map((c) => ({
          ...c,
          stationcount: countByName.get(c.name.toLowerCase()) ?? 0
        })).filter((p) => p.stationcount > 0);

        // Fetch stations for top 30 countries only
        const allSpeckles: StationSpeckle[] = [];
        const topCountries = points.slice(0, 30).sort((a, b) => b.stationcount - a.stationcount);
        
        for (const country of topCountries) {
          try {
            const stations = await getStationsByCountryCode(country.code, 50).catch(() => []);
            const countrySpeckles = stationsToSpeckles(stations);
            allSpeckles.push(...countrySpeckles);
          } catch (err) {
            // Silently fail for individual countries
          }
        }

        setSpeckles(allSpeckles);
        setTotalListeners(points.reduce((sum, p) => sum + p.stationcount, 0));
      } catch (err) {
        console.error('Failed to load stations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void bg-radial-glow">
      <Header liveListeners={totalListeners} />

      <div className="absolute inset-0 pt-16 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-lime-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-cyan-400 text-sm">Loading stations...</p>
            </div>
          </div>
        ) : (
          <Globe speckles={speckles} />
        )}
      </div>

      <div className="pointer-events-none absolute left-6 top-24 z-20 max-w-sm">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{t('heroTitle')}</h1>
        <p className="mt-2 text-sm text-mist">{t('heroSubtitle', { countries: COUNTRIES.length })}</p>
      </div>
    </main>
  );
}
