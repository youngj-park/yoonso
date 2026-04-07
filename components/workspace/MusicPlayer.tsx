'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';

export default function MusicPlayer() {
  const { track } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // 트랙 변경 시 자동 재생
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    a.src = track.file_url;
    a.volume = volume;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    setCurrentTime(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = volume;
  }, [volume]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  }

  function handleTimeUpdate() {
    const a = audioRef.current;
    if (!a) return;
    setCurrentTime(a.currentTime);
    if (a.duration && !isNaN(a.duration)) setDuration(a.duration);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  function fmt(sec: number) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (!track) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="flex w-full flex-shrink-0 items-center gap-4 px-6"
      style={{
        height: '72px',
        background: 'rgba(15,15,15,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a && a.duration) setDuration(a.duration);
        }}
      />

      {/* 트랙 정보 */}
      <div className="flex min-w-0 items-center gap-3" style={{ width: '220px' }}>
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'rgba(139,92,246,0.18)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" stroke="#a78bfa" strokeWidth="1.8" />
            <circle cx="18" cy="16" r="3" stroke="#a78bfa" strokeWidth="1.8" />
          </svg>
        </div>
        <p className="truncate text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {track.prompt}
        </p>
      </div>

      {/* 컨트롤 + 프로그레스 */}
      <div className="flex flex-1 flex-col items-center gap-2">
        {/* 재생 버튼 */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{ background: '#ffffff' }}
        >
          {playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="#171717">
              <rect x="0" y="0" width="3.5" height="12" rx="1" />
              <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="#171717">
              <path d="M0 0L10 6L0 12V0Z" />
            </svg>
          )}
        </button>

        {/* 프로그레스 바 */}
        <div className="flex w-full max-w-lg items-center gap-2">
          <span className="w-8 text-right tabular-nums" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
            {fmt(currentTime)}
          </span>
          <div
            className="relative flex-1 cursor-pointer rounded-full"
            style={{ height: '3px', background: 'rgba(255,255,255,0.12)' }}
            onClick={handleSeek}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${progress}%`, background: '#ffffff', transition: 'width 0.1s linear' }}
            />
          </div>
          <span className="w-8 tabular-nums" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* 볼륨 */}
      <div className="flex items-center gap-2" style={{ width: '120px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 cursor-pointer accent-white"
          style={{ height: '3px' }}
        />
      </div>
    </div>
  );
}
