'use client';

import { useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Heart, SlidersHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { registerClick } from '@/lib/radio-browser';
import { useTranslations } from 'next-intl';
import { AudioVisualizer } from './AudioVisualizer';

export default function PlayerBar() {
  const t = useTranslations('player');
  const { station, isPlaying, volume, status, toggle, stop, setVolume, setStatus } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUuid = useRef<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !station) return;

    if (lastUuid.current !== station.stationuuid) {
      lastUuid.current = station.stationuuid;
      audio.src = station.url_resolved;
      audio.load();
      registerClick(station.stationuuid);
    }

    if (isPlaying) {
      audio
        .play()
        .then(() => setStatus('playing'))
        .catch(() => setStatus('error'));
    } else {
      audio.pause();
    }
  }, [station, isPlaying, setStatus]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!station) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-panel/95 backdrop-blur">
      <audio
        ref={audioRef}
        onWaiting={() => setStatus('loading')}
        onPlaying={() => setStatus('playing')}
        onError={() => setStatus('error')}
      />
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4">
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center text-mist hover:text-white"
          aria-label={t('settings')}
        >
          <SlidersHorizontal size={18} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none sm:w-64">
          {station.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={station.favicon} alt="" className="h-9 w-9 shrink-0 rounded-md bg-panel-2 object-cover" />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-md bg-panel-2" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{station.name}</p>
            <p className="truncate text-xs text-mist">{station.country}</p>
          </div>
        </div>

        <button
          onClick={toggle}
          aria-label={isPlaying ? t('pause') : t('play')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-beacon text-void transition hover:brightness-110"
        >
          {status === 'loading' ? (
            <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-void border-t-transparent" />
          ) : isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        {/* Audio Visualizer */}
        <div className="hidden flex-1 max-w-xs lg:block">
          <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} barCount={32} height={32} />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {volume === 0 ? <VolumeX size={16} className="text-mist" /> : <Volume2 size={16} className="text-mist" />}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-28 cursor-pointer accent-signal"
            aria-label={t('volume')}
          />
        </div>

        <button className="hidden h-9 w-9 items-center justify-center text-mist hover:text-beacon sm:flex" aria-label={t('favorite')}>
          <Heart size={18} />
        </button>

        <button onClick={stop} className="flex h-9 w-9 shrink-0 items-center justify-center text-mist hover:text-white" aria-label={t('close')}>
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
