'use client';

import { Compass, Plus, Minus, Settings } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSettings?: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onSettings,
}: MapControlsProps) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
      {/* Compass */}
      <button
        onClick={onResetView}
        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-3 rounded-lg transition-colors duration-200 shadow-lg border border-slate-700"
        title="Reset view"
      >
        <Compass size={20} />
      </button>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-3 rounded-lg transition-colors duration-200 shadow-lg border border-slate-700"
        title="Zoom in"
      >
        <Plus size={20} />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-3 rounded-lg transition-colors duration-200 shadow-lg border border-slate-700"
        title="Zoom out"
      >
        <Minus size={20} />
      </button>

      {/* Settings */}
      {onSettings && (
        <button
          onClick={onSettings}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-3 rounded-lg transition-colors duration-200 shadow-lg border border-slate-700"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      )}
    </div>
  );
}
