'use client';

import { useRef, useState } from 'react';

type Music = {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_url: string | null;
  duration: number | null;
  created_at: string;
  error_message: string | null;
};

export default function MusicCard({ music }: { music: Music }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio * 100);
  }

  const isGenerating = music.status === 'generating' || music.status === 'pending';
  const isFailed = music.status === 'failed';

  return (
    <div
      className="w-full rounded-2xl px-5 py-4 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Prompt */}
      <p
        className="text-sm leading-relaxed line-clamp-2"
        style={{ color: 'rgba(255,255,255,0.75)' }}
      >
        {music.prompt}
      </p>

      {/* State: generating */}
      {isGenerating && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-0.5 rounded-full"
                style={{
                  height: '16px',
                  background: 'rgba(255,255,255,0.35)',
                  animation: `musicPulse 1s ease-in-out ${i * 0.12}s infinite alternate`,
                }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Generating...
          </span>
        </div>
      )}

      {/* State: failed */}
      {isFailed && (
        <p className="text-xs" style={{ color: '#ff6b6b' }}>
          {music.error_message ?? 'Generation failed. Please try again.'}
        </p>
      )}

      {/* State: completed */}
      {music.status === 'completed' && music.file_url && (
        <>
          <audio
            ref={audioRef}
            src={music.file_url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
          <div className="flex items-center gap-3">
            {/* Play/Pause button */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70"
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

            {/* Progress bar */}
            <div
              className="relative flex-1 cursor-pointer rounded-full"
              style={{ height: '3px', background: 'rgba(255,255,255,0.12)' }}
              onClick={handleSeek}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: '#ffffff',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            {/* Duration */}
            {music.duration && (
              <span className="text-xs tabular-nums flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {music.duration}s
              </span>
            )}
          </div>
        </>
      )}

      {/* Timestamp */}
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px' }}>
        {new Date(music.created_at).toLocaleString()}
      </p>

      <style>{`
        @keyframes musicPulse {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
