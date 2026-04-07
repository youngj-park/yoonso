'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function WorkspaceNavbar() {
  const { user } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openPopover() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPopoverOpen(true);
  }

  function closePopover() {
    closeTimer.current = setTimeout(() => setPopoverOpen(false), 120);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name ?? user?.email ?? '') as string;

  return (
    <header
      className="relative z-50 flex w-full items-center justify-between px-8 py-4"
      style={{ background: 'transparent' }}
    >
      {/* Logo */}
      <span
        className="text-xl font-black tracking-widest select-none"
        style={{ color: '#ffffff' }}
      >
        uMusic
      </span>

      {/* Search — liquid glass */}
      <div
        className="relative flex items-center"
        style={{ width: '480px' }}
      >
        <div
          className="pointer-events-none absolute left-3.5 flex items-center"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-2xl pl-9 pr-4 py-2 text-xs outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#ffffff',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.2)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)';
          }}
        />
      </div>

      {/* Profile popover */}
      <div
        className="relative"
        onMouseEnter={openPopover}
        onMouseLeave={closePopover}
      >
        {/* Avatar trigger */}
        <button
          type="button"
          className="flex items-center justify-center rounded-full overflow-hidden transition-opacity hover:opacity-80"
          style={{
            width: '32px',
            height: '32px',
            border: '1.5px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
          }}
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="text-xs font-semibold"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </button>

        {/* Popover */}
        <div
          className="absolute right-0 top-full pt-2"
          style={{
            pointerEvents: popoverOpen ? 'auto' : 'none',
            opacity: popoverOpen ? 1 : 0,
            transform: popoverOpen ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={openPopover}
          onMouseLeave={closePopover}
        >
          <div
            className="min-w-[160px] rounded-2xl p-1 overflow-hidden"
            style={{
              background: 'rgba(30,30,30,0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            {/* User info */}
            <div
              className="flex items-center gap-2.5 px-3 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: '#ffffff' }}
                >
                  {displayName}
                </p>
                <p
                  className="text-xs truncate mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}
                >
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
