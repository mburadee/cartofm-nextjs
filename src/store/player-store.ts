'use client';

import { create } from 'zustand';
import type { Station } from '@/lib/radio-browser';

interface PlayerState {
  station: Station | null;
  isPlaying: boolean;
  volume: number;
  status: 'idle' | 'loading' | 'playing' | 'error';
  play: (station: Station) => void;
  toggle: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  setStatus: (s: PlayerState['status']) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  station: null,
  isPlaying: false,
  volume: 0.8,
  status: 'idle',
  play: (station) => set({ station, isPlaying: true, status: 'loading' }),
  toggle: () => set({ isPlaying: !get().isPlaying }),
  stop: () => set({ isPlaying: false, status: 'idle' }),
  setVolume: (v) => set({ volume: v }),
  setStatus: (status) => set({ status })
}));
