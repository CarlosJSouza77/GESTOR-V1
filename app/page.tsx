'use client';

import { useAuth } from '@/components/providers/firebase-provider';
import { LoginScreen } from '@/components/auth/login-screen';
import { AppShell } from '@/components/app-shell';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
          <p className="text-sm font-medium text-text-secondary animate-pulse">IPTVManager está carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppShell />;
}
