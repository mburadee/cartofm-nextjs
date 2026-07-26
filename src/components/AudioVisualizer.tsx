'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  barCount?: number;
  height?: number;
}

export function AudioVisualizer({
  audioRef,
  isPlaying,
  barCount = 32,
  height = 24,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audio = audioRef.current;
    const canvas = canvasRef.current;

    // Create audio context on first interaction
    const setupAudioContext = () => {
      if (analyserRef.current) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = barCount * 8;
        analyser.smoothingTimeConstant = 0.8;

        const source = (audioContext as any).createMediaElementAudioSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (error) {
        console.error('Audio context setup failed:', error);
      }
    };

    // Setup on first play
    const handlePlay = () => {
      setupAudioContext();
    };

    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
    };
  }, [audioRef, barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!analyserRef.current || !dataArrayRef.current) {
        // Show idle state - small animated bars
        const idleBars = 8;
        const barWidth = canvas.width / idleBars;
        const time = Date.now() / 1000;

        for (let i = 0; i < idleBars; i++) {
          const hue = (i * 45 + time * 60) % 360;
          const baseHeight = 4;
          const wave = Math.sin(time * 2 + i * 0.5) * 2 + 3;
          const barHeight = baseHeight + wave;

          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.fillRect(i * barWidth + 2, canvas.height - barHeight, barWidth - 4, barHeight);
        }

        animationIdRef.current = requestAnimationFrame(draw);
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
      const data = dataArrayRef.current;

      // Draw frequency bars
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const value = data[i * Math.floor(data.length / barCount)];
        const percent = value / 255;
        const barHeight = percent * (canvas.height - 2);

        // Gradient color from cyan to lime green
        const hue = 150 + percent * 60;
        const saturation = 80 + percent * 20;
        const lightness = 50 + percent * 10;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(i * barWidth + 1, canvas.height - barHeight, barWidth - 2, barHeight);
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying || analyserRef.current) {
      animationIdRef.current = requestAnimationFrame(draw);
    } else {
      // Idle animation
      animationIdRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={height}
      className="w-full rounded"
      style={{ background: 'rgb(15, 23, 42)' }}
    />
  );
}
