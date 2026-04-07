'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';

type LibraryMusic = {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_url: string | null;
  duration: number | null;
  created_at: string;
  error_message: string | null;
};

function LibraryTrack({ music }: { music: LibraryMusic }) {
  const { track, setTrack } = usePlayer();
  const isCurrentTrack = track?.id === music.id;
  const isDone = music.status === 'completed' && !!music.file_url;
  const isGenerating = music.status === 'pending' || music.status === 'generating';

  function handlePlay() {
    if (!music.file_url) return;
    setTrack({ id: music.id, prompt: music.prompt, file_url: music.file_url, duration: music.duration });
  }

  function fmt(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <div
      className="flex flex-col gap-2 w-full rounded-xl px-3 py-3"
      style={{
        background: isCurrentTrack ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isCurrentTrack ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <p
        className="text-xs leading-snug line-clamp-2"
        style={{ color: 'rgba(255,255,255,0.75)' }}
      >
        {music.prompt}
      </p>

      <div className="flex items-center justify-between gap-2">
        {isDone && (
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: '#ffffff' }}
          >
            <svg width="8" height="10" viewBox="0 0 10 12" fill="#171717">
              <path d="M0 0L10 6L0 12V0Z" />
            </svg>
          </button>
        )}

        {isGenerating && (
          <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>Generating…</p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {isDone && music.duration && (
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
              {fmt(music.duration)}
            </span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
            {new Date(music.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MusicLibraryPanelProps {
  open: boolean;
}

export default function MusicLibraryPanel({ open }: MusicLibraryPanelProps) {
  const [musics, setMusics] = useState<LibraryMusic[]>([]);
  const [fetching, setFetching] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setFetching(true);
    const supabase = createClient();
    supabase
      .from('musics')
      .select('*')
      .neq('status', 'failed')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMusics(data as LibraryMusic[]);
        setFetching(false);
      });
  }, [open]);

  return (
    <div
      className="flex flex-col overflow-hidden flex-shrink-0"
      style={{
        width: open ? '280px' : '0px',
        transition: 'width 0.25s ease',
        borderRight: open ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ width: '280px', opacity: open ? 1 : 0, transition: 'opacity 0.2s ease' }}
      >
        <div className="flex-shrink-0 px-4 py-4">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Library
          </p>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto px-3 pb-4 gap-2">
          {fetching ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-end gap-[3px] h-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{
                      background: 'rgba(167,139,250,0.5)',
                      animation: `waveBar 0.9s ease-in-out ${i * 0.1}s infinite alternate`,
                      height: '100%',
                    }}
                  />
                ))}
              </div>
            </div>
          ) : musics.length === 0 ? (
            <p className="text-xs px-1 pt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              No music yet
            </p>
          ) : (
            musics.map((m) => <LibraryTrack key={m.id} music={m} />)
          )}
        </div>
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
