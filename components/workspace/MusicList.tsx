'use client';

import { usePlayer } from '@/context/PlayerContext';

export type Music = {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_url: string | null;
  duration: number | null;
  created_at: string;
  error_message: string | null;
};

function MusicTrack({ music }: { music: Music }) {
  const { track, setTrack } = usePlayer();
  const isCurrentTrack = track?.id === music.id;
  const isGenerating = music.status === 'pending' || music.status === 'generating';
  const isFailed = music.status === 'failed';
  const isDone = music.status === 'completed' && !!music.file_url;

  function handlePlay() {
    if (!music.file_url) return;
    setTrack({ id: music.id, prompt: music.prompt, file_url: music.file_url, duration: music.duration });
  }

  return (
    <div
      className="flex items-center gap-4 w-full rounded-2xl px-5 py-4 transition-colors"
      style={{
        background: isCurrentTrack ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isCurrentTrack ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* 버튼 */}
      <div className="flex-shrink-0">
        {isGenerating ? (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <div className="flex items-end gap-[2px] h-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-[2.5px] rounded-full"
                  style={{
                    background: '#a78bfa',
                    animation: `waveBar 0.9s ease-in-out ${i * 0.1}s infinite alternate`,
                    height: '100%',
                  }}
                />
              ))}
            </div>
          </div>
        ) : isFailed ? (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: '#ffffff' }}
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill="#171717">
              <path d="M0 0L10 6L0 12V0Z" />
            </svg>
          </button>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug truncate"
          style={{ color: isFailed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)' }}
        >
          {music.prompt}
        </p>
        {isGenerating && (
          <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>Generating…</p>
        )}
        {isFailed && (
          <p className="text-xs truncate" style={{ color: '#f87171' }}>
            {music.error_message ?? 'Generation failed'}
          </p>
        )}
      </div>

      {/* 시간 */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        {isDone && music.duration && (
          <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {music.duration}s
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
          {new Date(music.created_at).toLocaleString()}
        </span>
      </div>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.25); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

interface MusicListProps {
  musics: Music[];
  isLoading?: boolean;
}

export default function MusicList({ musics, isLoading }: MusicListProps) {
  if (isLoading) return <div className="flex flex-1 flex-col" />;

  if (musics.length === 0) return <div className="flex flex-1" />;

  return (
    <div className="flex flex-col gap-2 w-full">
      {musics.map((music) => (
        <MusicTrack key={music.id} music={music} />
      ))}
    </div>
  );
}
