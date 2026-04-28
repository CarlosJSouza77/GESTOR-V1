'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/firebase-provider';
import { LayoutDashboard, Users, Server, HandCoins, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// Pages
import { Dashboard } from '@/components/dashboard/dashboard';
import { ClientesList } from '@/components/clientes/clientes-list';
import { ServidoresList } from '@/components/servidores/servidores-list';
import { PacotesList } from '@/components/pacotes/pacotes-list';
import { Financeiro } from '@/components/financeiro/financeiro';
import { SettingsPage } from '@/components/settings/settings-page';

type Tab = 'dashboard' | 'clientes' | 'servidores' | 'pacotes' | 'financeiro' | 'settings';

export function AppShell() {
  const { user, logout, tenantData } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'financeiro', label: 'Grana', icon: HandCoins },
    { id: 'servidores', label: 'Servers', icon: Server },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard switchTab={setActiveTab} />;
      case 'clientes': return <ClientesList />;
      case 'servidores': return <ServidoresList />;
      case 'pacotes': return <PacotesList />;
      case 'financeiro': return <Financeiro />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard switchTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-bg-base text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center font-bold text-white shadow-lg shadow-brand-blue/20">
            I
          </div>
          <h1 className="font-bold text-lg tracking-tight truncate max-w-[150px]">
            {tenantData?.nome_negocio === 'TOPdigitalPLAY' || !tenantData?.nome_negocio ? (
              <span className="flex items-center">
                <span className="text-brand-blue">Top</span>
                <span className="text-white font-black italic mx-1">Play</span>
                <span className="text-brand-blue font-bold">Digital</span>
              </span>
            ) : (
              tenantData.nome_negocio
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary hidden min-[400px]:inline-block">
            {user?.displayName || 'Revendedor'}
          </span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-status-danger transition-all border border-border-subtle"
          >
            <span className="text-xs font-medium hidden min-[500px]:inline">Desconectar</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-4 py-6 max-w-4xl min-h-full">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-lg border-t border-border-subtle px-2 py-2 sm:py-3">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 outline-none",
                activeTab === item.id 
                  ? "text-brand-blue shadow-inner" 
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 transition-transform sm:w-5 sm:h-5",
                activeTab === item.id && "scale-110 active:scale-95"
              )} />
              <span className="text-[10px] font-medium sm:text-xs">
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="w-1 h-1 rounded-full bg-brand-blue" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
