import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, FastForward } from 'lucide-react';

interface WaveformAudioPlayerProps {
  src: string;
  className?: string;
}

export const WaveformAudioPlayer: React.FC<WaveformAudioPlayerProps> = ({ src, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Pseudo-random deterministic waveform heights based on src
  const waveformBars = useRef<number[]>(
    Array.from({ length: 32 }, (_, i) => {
      const charCode = src.charCodeAt(i % src.length) || 50;
      return 20 + (charCode % 65); // bar height percentage 20%-85%
    })
  ).current;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration || 999);
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec) || !isFinite(timeInSec)) return '0:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-gray-950/80 border border-gray-800 rounded-2xl p-2.5 max-w-sm w-full space-y-2 select-none shadow-md ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-2.5">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 transition-all shadow-md cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Waveform Visualizer & Seek Bar */}
        <div className="flex-1 cursor-pointer space-y-1" onClick={handleSeek}>
          <div className="h-7 flex items-center gap-[2px] w-full py-0.5">
            {waveformBars.map((heightPercent, index) => {
              const barProgressPercent = (index / waveformBars.length) * 100;
              const isPassed = barProgressPercent <= progressPercent;

              return (
                <div
                  key={index}
                  className="flex-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: isPassed ? '#10b981' : '#374151',
                    opacity: isPassed ? 1 : 0.6
                  }}
                />
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls: Skip -10s, +10s, Speed Toggle */}
        <div className="flex items-center gap-1 border-l border-gray-800 pl-2 shrink-0">
          <button
            type="button"
            onClick={() => skipSeconds(-10)}
            className="p-1 text-gray-400 hover:text-emerald-400 rounded transition-all cursor-pointer"
            title="Voltar 10s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => skipSeconds(10)}
            className="p-1 text-gray-400 hover:text-emerald-400 rounded transition-all cursor-pointer"
            title="Avançar 10s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={changeSpeed}
            className="bg-gray-800 hover:bg-gray-700 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-gray-700 transition-all cursor-pointer"
            title="Velocidade de reprodução"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
};
