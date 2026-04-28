'use client';

import React from 'react';
import { useAuth } from '@/components/providers/firebase-provider';
import { LogIn, Tv } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginScreen() {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-bg-base text-text-primary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
            <Tv className="w-12 h-12 text-brand-blue" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">IPTVManager</h1>
          <p className="text-text-secondary">O CRM definitivo para revendedores de IPTV</p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Bem-vindo de volta</h2>
            <p className="text-sm text-text-secondary font-light">
              Acesse sua conta para gerenciar seus clientes e cobranças.
            </p>
          </div>

          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-blue/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar com Google
              </>
            )}
          </button>

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
