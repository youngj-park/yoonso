'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import WorkspaceNavbar from '@/components/workspace/WorkspaceNavbar';
import { PromptInputBox } from '@/components/workspace/PromptInputBox';
import type { MusicGenOptions } from '@/components/workspace/PromptInputBox';
import MusicList, { type Music } from '@/components/workspace/MusicList';
import MusicLibraryPanel from '@/components/workspace/MusicLibraryPanel';
import MusicPlayer from '@/components/workspace/MusicPlayer';

function GeneratingIndicator() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex space-x-2">
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full"
            style={{ background: 'rgba(255,255,255,0.7)' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity, delay }}
          />
        ))}
      </div>
    </div>
  );
}

function ErrorIndicator({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3 max-w-sm text-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,80,80,0.7)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{message}</p>
      </div>
    </div>
  );
}

function WorkspaceContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [musics, setMusics] = useState<Music[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [user, loading, router]);

  async function handleSend(prompt: string, options: MusicGenOptions) {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setGenError(null);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration: options.duration, outputFormat: options.outputFormat }),
      });
      const json = await res.json();
      if (!res.ok || !json.music) throw new Error(json.detail ?? json.error ?? 'Generation failed');

      setMusics((prev) => [json.music as Music, ...prev]);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Music generation failed');
    } finally {
      setGenerating(false);
    }
  }

  if (loading || !user) {
    return <main className="flex min-h-screen w-full" style={{ backgroundColor: '#171717' }} />;
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden" style={{ backgroundColor: '#171717' }}>
      <WorkspaceNavbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 왼쪽 사이드바 탭 */}
        <div
          className="flex flex-col flex-shrink-0 items-center py-4 gap-2"
          style={{ width: '44px', borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            type="button"
            onClick={() => setLibraryOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 transition-colors"
            style={{
              background: libraryOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: libraryOpen ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
            }}
            title="Library"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span style={{ fontSize: '9px', letterSpacing: '0.05em', fontWeight: 600 }}>LIST</span>
          </button>
        </div>

        {/* 라이브러리 패널 */}
        <MusicLibraryPanel open={libraryOpen} />

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6 min-h-0">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
              {generating ? (
                <GeneratingIndicator />
              ) : genError ? (
                <ErrorIndicator message={genError} />
              ) : (
                <MusicList musics={musics} />
              )}
            </div>
          </div>

          <div className="w-full flex-shrink-0 px-6 pb-6 pt-2">
            <div className="mx-auto max-w-3xl">
              <PromptInputBox
                placeholder="Describe the music you want to create..."
                isLoading={generating}
                onSend={handleSend}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 뮤직 플레이어 */}
      <MusicPlayer />
    </main>
  );
}

export default function WorkspacePage() {
  return (
    <PlayerProvider>
      <WorkspaceContent />
    </PlayerProvider>
  );
}
