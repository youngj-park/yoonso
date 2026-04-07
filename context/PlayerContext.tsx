'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type PlayerTrack = {
  id: string;
  prompt: string;
  file_url: string;
  duration: number | null;
};

type PlayerContextValue = {
  track: PlayerTrack | null;
  setTrack: (track: PlayerTrack) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  return (
    <PlayerContext.Provider value={{ track, setTrack }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
