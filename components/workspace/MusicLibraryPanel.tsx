'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePlayer } from '@/context/PlayerContext';

type LibraryMusic = {
  id: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_url: string | null;
  file_path: string | null;
  duration: number | null;
  created_at: string;
  error_message: string | null;
};

// 아이콘
const IconPlay = () => (
  <svg width="8" height="10" viewBox="0 0 10 12" fill="#171717"><path d="M0 0L10 6L0 12V0Z" /></svg>
);
const IconDots = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

function LibraryTrack({
  music,
  onRename,
  onDelete,
}: {
  music: LibraryMusic;
  onRename: (id: string, newPrompt: string) => void;
  onDelete: (id: string) => void;
}) {
  const { track, setTrack } = usePlayer();
  const isCurrentTrack = track?.id === music.id;
  const isDone = music.status === 'completed' && !!music.file_url;
  const isGenerating = music.status === 'pending' || music.status === 'generating';

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(music.prompt);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메뉴 외부 클릭 닫기
  useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  // 편집 모드 진입 시 포커스
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handlePlay() {
    if (!music.file_url) return;
    setTrack({ id: music.id, prompt: music.prompt, file_url: music.file_url, duration: music.duration });
  }

  async function handleRename() {
    if (!editValue.trim() || editValue === music.prompt) { setEditing(false); return; }
    setSaving(true);
    const supabase = createClient();
    await supabase.from('musics').update({ prompt: editValue.trim() }).eq('id', music.id);
    onRename(music.id, editValue.trim());
    setSaving(false);
    setEditing(false);
  }

  async function handleDownload() {
    if (!music.file_url) return;
    setMenuOpen(false);
    const res = await fetch(music.file_url);
    const blob = await res.blob();
    const ext = music.file_path?.split('.').pop() ?? 'mp3';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${music.prompt.slice(0, 40).replace(/[^a-zA-Z0-9가-힣 ]/g, '')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setMenuOpen(false);
    setDeleting(true);
    await fetch('/api/delete-music', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: music.id }),
    });
    onDelete(music.id);
  }

  function fmt(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (deleting) return null;

  return (
    <div
      className="group flex flex-col gap-2 w-full rounded-xl px-3 py-3 relative"
      style={{
        background: isCurrentTrack ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isCurrentTrack ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      {/* 제목 / 편집 */}
      {editing ? (
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setEditing(false); setEditValue(music.prompt); }
            }}
            className="flex-1 rounded-md bg-transparent text-xs outline-none border-b"
            style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(139,92,246,0.5)', paddingBottom: '2px' }}
            disabled={saving}
          />
          <button
            type="button"
            onClick={handleRename}
            disabled={saving}
            className="text-xs px-2 py-0.5 rounded-md transition-colors"
            style={{ background: 'rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.8)' }}
          >
            {saving ? '…' : '저장'}
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1">
          <p
            className="text-xs leading-snug line-clamp-2 flex-1"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            {music.prompt}
          </p>

          {/* 3-dot 메뉴 버튼 */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              className="flex h-5 w-5 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <IconDots />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden py-1"
                style={{
                  width: '140px',
                  background: 'rgba(28,28,32,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setEditing(true); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-white/8"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <IconEdit /> 제목 변경
                </button>
                {isDone && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-white/8"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <IconDownload /> 다운로드
                  </button>
                )}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '2px 0' }} />
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-red-500/10"
                  style={{ color: '#f87171' }}
                >
                  <IconTrash /> 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {isDone && (
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ background: '#ffffff' }}
          >
            <IconPlay />
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

  function handleRename(id: string, newPrompt: string) {
    setMusics((prev) => prev.map((m) => m.id === id ? { ...m, prompt: newPrompt } : m));
  }

  function handleDelete(id: string) {
    setMusics((prev) => prev.filter((m) => m.id !== id));
  }

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
            musics.map((m) => (
              <LibraryTrack
                key={m.id}
                music={m}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.25); }
          to   { transform: scaleY(1); }
        }
        .hover\\:bg-white\\/8:hover {
          background: rgba(255,255,255,0.08);
        }
      `}</style>
    </div>
  );
}
