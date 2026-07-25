'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { GlobeMethods } from 'react-globe.gl';
import { useRouter } from '@/i18n/navigation';
import type { CountryMeta } from '@/data/countries';

// react-globe.gl touches `window` at import time, so it must never be
// bundled into SSR output — load it purely on the client.
const ReactGlobe = dynamic(() => import('react-globe.gl'), { ssr: false });

export interface GlobePoint extends CountryMeta {
  stationcount: number;
}

export default function Globe({ points }: { points: GlobePoint[] }) {
  const router = useRouter();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 800 });
  const [hovered, setHovered] = useState<GlobePoint | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current || ready) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = true;
    globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
    setReady(true);
  }, [ready]);

  const maxCount = Math.max(1, ...points.map((p) => p.stationcount));

  const handleClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint;
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = false;
      globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.4 }, 800);
      router.push(`/country/${p.slug}`);
    },
    [router]
  );

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <ReactGlobe
        ref={globeRef as any}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#22D3C8"
        atmosphereAltitude={0.18}
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => (hovered && (d as GlobePoint).code === hovered.code ? '#F5A623' : '#22D3C8')}
        pointAltitude={(d: any) => 0.02 + 0.05 * ((d as GlobePoint).stationcount / maxCount)}
        pointRadius={(d: any) => 0.35 + 0.55 * ((d as GlobePoint).stationcount / maxCount)}
        pointLabel={(d: any) => {
          const p = d as GlobePoint;
          return `<div style="font-family:sans-serif;background:#0D1420;border:1px solid #1D293D;padding:6px 10px;border-radius:8px;color:white;font-size:12px">
            <strong>${p.name}</strong><br/><span style="color:#8CA0B8">${p.stationcount.toLocaleString()} stations</span>
          </div>`;
        }}
        onPointClick={handleClick}
        onPointHover={(d: any) => setHovered((d as GlobePoint) ?? null)}
        ringsData={points.filter((p) => p.stationcount > maxCount * 0.4)}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={() => 'rgba(245,166,35,0.35)'}
        ringMaxRadius={3}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={2200}
      />
    </div>
  );
}
