'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import WorkspaceNavbar from '@/components/workspace/WorkspaceNavbar';
import { PromptInputBox } from '@/components/workspace/PromptInputBox';

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main
        className="flex min-h-screen w-full"
        style={{ backgroundColor: '#171717' }}
      />
    );
  }

  return (
    <main
      className="flex min-h-screen w-full flex-col"
      style={{ backgroundColor: '#171717' }}
    >
      <WorkspaceNavbar />

      {/* Content area */}
      <div className="flex flex-1 items-center justify-center">
        <p
          className="text-sm"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Your workspace
        </p>
      </div>

      {/* Fixed bottom prompt */}
      <div className="sticky bottom-0 w-full px-6 pb-6 pt-2">
        <div className="mx-auto max-w-3xl">
          <PromptInputBox placeholder="Describe the music you want to create..." />
        </div>
      </div>
    </main>
  );
}
