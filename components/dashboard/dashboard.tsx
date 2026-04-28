'use client';

import React, { useMemo } from 'react';
import { useCollection } from '@/hooks/use-firestore';
import { useAuth } from '@/components/providers/firebase-provider';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { format, isToday, isAfter, isBefore, addDays, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

interface DashboardProps {
  switchTab: (tab: any) => void;
}

export function Dashboard({ switchTab }: DashboardProps) {
  const { tenantData } = useAuth();
  const { data: clientes, loading: loadingClientes } = useCollection<any>('clientes');
  const { data: servidores } = useCollection<any>('servidores');
  const { data: pagamentos } = useCollection<any>('pagamentos');
  const { data: pacotes } = useCollection<any>('pacotes');

  const stats = useMemo(() => {
    if (!clientes) return { total: 0, ativos: 0, vencendo: 0, inadimplentes: 0, hoje: 0 };
    
    const now = new Date();
    const threshold = addDays(now, tenantData?.configuracoes?.dias_vencimento_alerta || 3);

    return clientes.reduce((acc: any, c: any) => {
      const venc = c.data_vencimento?.toDate ? c.data_vencimento.toDate() : (c.data_vencimento ? new Date(c.data_vencimento) : null);
      if (!venc) return acc;

      acc.total++;
      
      if (c.status === 'Cancelado') return acc;

      if (isBefore(venc, now) && !isToday(venc)) {
        acc.inadimplentes++;
      } else if (isToday(venc)) {
        acc.hoje++;
        acc.vencendo++;
      } else if (isBefore(venc, threshold)) {
        acc.vencendo++;
      } else {
        acc.ativos++;
      }
      
      return acc;
    }, { total: 0, ativos: 0, vencendo: 0, inadimplentes: 0, hoje: 0 });
  }, [clientes, tenantData]);

  const financeStats = useMemo(() => {
    if (!clientes || !pacotes || !pagamentos) return { prevista: 0, confirmada: 0, emAberto: 0 };

    const confirmada = pagamentos.reduce((acc: number, p: any) => {
      const date = p.data_pagamento?.toDate ? p.data_pagamento.toDate() : new Date(p.data_pagamento);
      if (isAfter(date, startOfMonth(new Date()))) {
        return acc + (p.valor_recebido || 0);
      }
      return acc;
    }, 0);

    const prevYAb = clientes.reduce((acc: any, c: any) => {
      if (c.status === 'Cancelado') return acc;
      
      const pac = pacotes.find((p: any) => p.id === c.pacote_id);
      const valor = pac?.valor_venda || 0;
      
      acc.prevista += valor;
      
      const venc = c.data_vencimento?.toDate ? c.data_vencimento.toDate() : new Date(c.data_vencimento);
      if (isBefore(venc, new Date())) {
        acc.emAberto += valor;
      }
      
      return acc;
    }, { prevista: 0, emAberto: 0 });

    return { ...prevYAb, confirmada };
  }, [clientes, pacotes, pagamentos]);

  if (loadingClientes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Fala, {tenantData?.nome?.split(' ')[0]}!</h2>
        <p className="text-text-secondary text-sm">Resumo da sua operação hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}.</p>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          label="Ativos" 
          value={stats.ativos} 
          icon={CheckCircle2} 
          color="text-status-active" 
          bg="bg-status-active/10" 
        />
        <StatusCard 
          label="Vencendo" 
          value={stats.vencendo} 
          icon={Clock} 
          color="text-status-warning" 
          bg="bg-status-warning/10" 
          onClick={() => switchTab('clientes')}
        />
        <StatusCard 
          label="Inadimplentes" 
          value={stats.inadimplentes} 
          icon={AlertCircle} 
          color="text-status-danger" 
          bg="bg-status-danger/10" 
          onClick={() => switchTab('clientes')}
        />
        <StatusCard 
          label="Hoje" 
          value={stats.hoje} 
          icon={TrendingUp} 
          color="text-brand-blue" 
          bg="bg-brand-blue/10" 
        />
      </div>

      {/* Financial Overview */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <DollarSign className="w-32 h-32 text-brand-blue" />
         </div>
         <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">Financeiro do Mês</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-text-secondary font-light">Receita Prevista</span>
              <p className="text-2xl font-bold text-text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeStats.prevista)}
              </p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-light">Confirmado (Pago)</span>
              <p className="text-2xl font-bold text-brand-green">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeStats.confirmada)}
              </p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-light">Em Aberto</span>
              <p className="text-2xl font-bold text-status-danger">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeStats.emAberto)}
              </p>
            </div>
         </div>
      </div>

      {/* Priority Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ações Prioritárias</h3>
          <button onClick={() => switchTab('clientes')} className="text-xs font-medium text-brand-blue flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="space-y-3">
          {clientes?.filter((c: any) => c.status !== 'Ativo' && c.status !== 'Cancelado').slice(0, 5).map((cliente: any) => (
            <PriorityItem 
              key={cliente.id} 
              cliente={cliente} 
              pacote={pacotes?.find((p: any) => p.id === cliente.pacote_id)}
            />
          ))}
          {clientes?.filter((c: any) => c.status !== 'Ativo' && c.status !== 'Cancelado').length === 0 && (
            <div className="p-8 text-center bg-bg-card/50 border border-dashed border-border-subtle rounded-xl">
              <p className="text-text-secondary text-sm">Tudo em ordem! Nenhum cliente exige atenção imediata.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, icon: Icon, color, bg, onClick }: any) {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-2xl border border-border-subtle bg-bg-card transition-all text-left ${onClick ? 'cursor-pointer hover:border-text-secondary/30' : 'cursor-default'}`}
    >
      <div className={`p-2 rounded-lg ${bg} mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-text-secondary font-medium">{label}</span>
    </motion.button>
  );
}

function PriorityItem({ cliente, pacote }: any) {
  const vencString = cliente.data_vencimento?.toDate 
    ? format(cliente.data_vencimento.toDate(), 'dd/MM') 
    : (cliente.data_vencimento ? format(new Date(cliente.data_vencimento), 'dd/MM') : '--/--');

  const now = new Date();
  const venc = cliente.data_vencimento?.toDate ? cliente.data_vencimento.toDate() : new Date(cliente.data_vencimento);
  const diffDays = Math.ceil((venc.getTime() - now.getTime()) / (1000 * 3600 * 24));

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-card/50 hover:bg-bg-card transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${cliente.status === 'Inadimplente' ? 'bg-status-danger' : 'bg-status-warning'}`} />
        <div>
          <h4 className="text-sm font-semibold truncate max-w-[120px]">{cliente.nome}</h4>
          <p className="text-[10px] text-text-secondary">
             {cliente.status === 'Inadimplente' ? `${Math.abs(diffDays)} dias atrasado` : `Vence em ${diffDays} dias`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right mr-2">
          <span className="block text-xs font-bold text-text-primary">R$ {pacote?.valor_venda || '0,00'}</span>
          <span className="text-[10px] text-text-secondary italic">{vencString}</span>
        </div>
        <button className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
