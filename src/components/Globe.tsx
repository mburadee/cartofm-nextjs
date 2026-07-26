'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { GlobeMethods } from 'react-globe.gl';
import { useRouter } from '@/i18n/navigation';
import type { StationSpeckle } from '@/lib/station-speckles';
import { MapControls } from './MapControls';

// react-globe.gl touches `window` at import time, so it must never be
// bundled into SSR output — load it purely on the client.
const ReactGlobe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobeProps {
  speckles: StationSpeckle[];
  focusedStationId?: string;
}

export default function Globe({ speckles, focusedStationId }: GlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 800 });
  const [hovered, setHovered] = useState<StationSpeckle | null>(null);
  const [ready, setReady] = useState(false);
  const [focusedSpeckle, setFocusedSpeckle] = useState<StationSpeckle | null>(null);

  // Find focused station from prop
  useEffect(() => {
    if (focusedStationId) {
      const found = speckles.find((s) => s.id === focusedStationId);
      if (found) setFocusedSpeckle(found);
    }
  }, [focusedStationId, speckles]);

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
    controls.enablePan = true;
    globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
    setReady(true);
  }, [ready]);

  const handleClick = useCallback(
    (speckle: object) => {
      const s = speckle as StationSpeckle;
      setFocusedSpeckle(s);
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = false;
      globeRef.current?.pointOfView({ lat: s.lat, lng: s.lng, altitude: 1.0 }, 1000);
      
      // Trigger autoplay
      if (typeof window !== 'undefined') {
        const playEvent = new CustomEvent('station-selected', { 
          detail: { station: s } 
        });
        window.dispatchEvent(playEvent);
      }
    },
    []
  );

  const handleZoomIn = () => {
    const pov = globeRef.current?.pointOfView();
    if (pov) {
      globeRef.current?.pointOfView({ ...pov, altitude: pov.altitude * 0.7 }, 500);
    }
  };

  const handleZoomOut = () => {
    const pov = globeRef.current?.pointOfView();
    if (pov) {
      globeRef.current?.pointOfView({ ...pov, altitude: pov.altitude * 1.3 }, 500);
    }
  };

  const handleResetView = () => {
    const controls = globeRef.current?.controls();
    if (controls) controls.autoRotate = true;
    setFocusedSpeckle(null);
    globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 800);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      <ReactGlobe
        ref={globeRef as any}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,1)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#22D3C8"
        atmosphereAltitude={0.18}
        pointsData={speckles}
        pointLat={(d: any) => (d as StationSpeckle).lat}
        pointLng={(d: any) => (d as StationSpeckle).lng}
        pointColor={(d: any) => {
          const speckle = d as StationSpeckle;
          if (focusedSpeckle?.id === speckle.id) return '#00FF00';
          if (hovered?.id === speckle.id) return '#00FF88';
          return '#00FF22';
        }}
        pointAltitude={() => 0.008}
        pointRadius={() => 0.35}
        pointLabel={(d: any) => {
          const s = d as StationSpeckle;
          return `<div style="font-family:sans-serif;background:#0D1420;border:2px solid #22D3C8;padding:8px 12px;border-radius:8px;color:#00FF22;font-size:13px;font-weight:500">
            <strong>${s.name}</strong><br/><span style="color:#8CA0B8;font-size:11px">${s.countryCode}</span>
          </div>`;
        }}
        onPointClick={handleClick}
        onPointHover={(d: any) => setHovered((d as StationSpeckle) ?? null)}
        ringsData={focusedSpeckle ? [focusedSpeckle] : []}
        ringLat={(d: any) => (d as StationSpeckle).lat}
        ringLng={(d: any) => (d as StationSpeckle).lng}
        ringColor={() => 'rgba(0, 255, 34, 0.4)'}
        ringMaxRadius={1.5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1500}
      />

      {/* Focusing circle - shows when a station is selected */}
      {focusedSpeckle && (
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
          >
            <defs>
              <style>{`
                @keyframes pulse-ring {
                  0% { r: 20px; opacity: 0.6; }
                  100% { r: 60px; opacity: 0; }
                }
                @keyframes rotate {
                  0% { transform: rotate(0deg); }
                  360% { transform: rotate(360deg); }
                }
              `}</style>
            </defs>
            {/* This would need to be calculated based on viewport projection, for now show indicator */}
          </svg>
        </div>
      )}

      {/* Focused station indicator */}
      {focusedSpeckle && (
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-cyan-500 rounded-lg p-3 z-50 max-w-xs">
          <div className="text-cyan-400 font-semibold text-sm">{focusedSpeckle.name}</div>
          <div className="text-slate-400 text-xs mt-1">{focusedSpeckle.countryCode}</div>
        </div>
      )}

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />
    </div>
  );
}
