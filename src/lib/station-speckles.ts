import type { Station } from './radio-browser';

export interface StationSpeckle {
  id: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
  url: string;
  favicon: string;
}

/**
 * Convert stations to speckle points, filtering out those without coordinates
 * and using approximate position for those missing precise geo data.
 */
export function stationsToSpeckles(stations: Station[]): StationSpeckle[] {
  return stations
    .filter((s) => s.geo_lat !== null && s.geo_long !== null)
    .map((s) => ({
      id: s.stationuuid,
      name: s.name,
      countryCode: s.countrycode,
      lat: s.geo_lat as number,
      lng: s.geo_long as number,
      url: s.url_resolved,
      favicon: s.favicon,
    }));
}

/**
 * Generate scatter positions for stations missing exact coordinates.
 * Scatters them within the approximate country bounds with some randomness.
 */
export function generateScatterPosition(
  countryCode: string,
  seed: string,
  countryBounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): { lat: number; lng: number } {
  // Simple hash function to get consistent pseudo-random values from the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const pseudo = ((hash ^ (hash >> 16)) & 0x7fffffff) / 0x7fffffff;

  // If we have country bounds, scatter within them
  if (countryBounds) {
    const latRange = countryBounds.maxLat - countryBounds.minLat;
    const lngRange = countryBounds.maxLng - countryBounds.minLng;
    return {
      lat: countryBounds.minLat + latRange * pseudo,
      lng: countryBounds.minLng + lngRange * ((pseudo + 0.5) % 1),
    };
  }

  // Fallback: approximate worldwide scatter with slight weighting
  return {
    lat: -60 + 120 * pseudo,
    lng: -180 + 360 * ((pseudo + 0.5) % 1),
  };
}
