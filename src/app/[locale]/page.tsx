import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Globe from '@/components/Globe';
import { COUNTRIES } from '@/data/countries';
import { getCountryStats, getStationsByCountryCode } from '@/lib/radio-browser';
import { stationsToSpeckles, type StationSpeckle } from '@/lib/station-speckles';

export const revalidate = 43200; // 12h — country station counts change slowly

export default async function HomePage() {
  const t = await getTranslations('globe');
  const stats = await getCountryStats().catch(() => []);
  const countByName = new Map(stats.map((s) => [s.name.toLowerCase(), s.stationcount]));

  const points = COUNTRIES.map((c) => ({
    ...c,
    stationcount: countByName.get(c.name.toLowerCase()) ?? 0
  })).filter((p) => p.stationcount > 0);

  // Fetch stations for each country and convert to speckles
  const speckles: StationSpeckle[] = [];
  
  for (const country of points.slice(0, 50)) { // Limit to 50 countries for build time
    try {
      const stations = await getStationsByCountryCode(country.code, 100).catch(() => []);
      const countrySpeckles = stationsToSpeckles(stations);
      speckles.push(...countrySpeckles);
    } catch (err) {
      console.error(`Failed to fetch stations for ${country.code}:`, err);
    }
  }

  const totalListeners = points.reduce((sum, p) => sum + p.stationcount, 0);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void bg-radial-glow">
      <Header liveListeners={totalListeners} />

      <div className="absolute inset-0 pt-16 pb-20">
        <Globe speckles={speckles} />
      </div>

      <div className="pointer-events-none absolute left-6 top-24 z-20 max-w-sm">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{t('heroTitle')}</h1>
        <p className="mt-2 text-sm text-mist">{t('heroSubtitle', { countries: points.length })}</p>
      </div>
    </main>
  );
}
