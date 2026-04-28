'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/firebase-provider';
import { LogIn, Tv, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginScreen() {
  const { loginWithGoogle, loading, authError } = useAuth();
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Check iframe status after mount to avoid server/client mismatch
    const checkIframe = () => {
      setIsIframe(window.self !== window.top);
    };
    checkIframe();
  }, []);

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 bg-bg-base text-text-primary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
            <Tv className="w-12 h-12 text-brand-blue" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">
            <span className="text-brand-blue">Top</span>
            <span className="text-white font-black italic mx-1">Play</span>
            <span className="text-brand-blue">Digital</span>
          </h1>
          <p className="text-text-secondary">O CRM definitivo para revendedores de IPTV</p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Bem-vindo de volta</h2>
            <p className="text-sm text-text-secondary font-light">
              Acesse sua conta para gerenciar seus clientes e cobranças.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm">
              <p>{authError}</p>
              {isIframe && (
                <button 
                  onClick={openInNewTab}
                  className="mt-2 flex items-center gap-1 mx-auto font-bold underline"
                >
                  <ExternalLink className="w-3 h-3" /> Abrir em nova aba
                </button>
              )}
            </div>
          )}

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-orange-900/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar com Google
              </>
            )}
          </motion.button>

          {isIframe && !authError && (
            <p className="text-xs text-text-secondary/60">
              Se o login não abrir, tente <button onClick={openInNewTab} className="underline hover:text-brand-blue">abrir em uma nova aba</button>.
            </p>
          )}

          <p className="text-xs text-text-secondary/50 font-light italic">
            Ao entrar, você concorda com nossos termos de uso.
          </p>
        </div>
        
        <div className="pt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border-subtle bg-bg-card/50">
            <span className="block text-2xl font-bold text-brand-green">100%</span>
            <span className="text-xs text-text-secondary">Seguro & Isolado</span>
          </div>
          <div className="p-4 rounded-xl border border-border-subtle bg-bg-card/50">
            <span className="block text-2xl font-bold text-brand-blue">Zap</span>
            <span className="text-xs text-text-secondary">Cobrança Rápida</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
