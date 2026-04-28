'use client';

import React, { useMemo } from 'react';
import { useCollection } from '@/hooks/use-firestore';
import { Wallet, ArrowDownCircle, ArrowUpCircle, PieChart, Info } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function Financeiro() {
  const { data: pagamentos, loading: loadingPag } = useCollection<any>('pagamentos');
  const { data: servidores } = useCollection<any>('servidores');
  const { data: clientes } = useCollection<any>('clientes');
  const { data: pacotes } = useCollection<any>('pacotes');

  const stats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const receitaRecebida = pagamentos?.reduce((acc, p) => {
      const date = p.data_pagamento?.toDate ? p.data_pagamento.toDate() : new Date(p.data_pagamento);
      if (isAfter(date, start) && isBefore(date, end)) {
        return acc + (p.valor_recebido || 0);
      }
      return acc;
    }, 0) || 0;

    const custosServidores = servidores?.reduce((acc, s) => {
      if (s.status === 'Inativo') return acc;
      return acc + (s.custo_mensal || 0);
    }, 0) || 0;

    const receitaPrevista = clientes?.reduce((acc, c) => {
      if (c.status === 'Cancelado') return acc;
      const pac = pacotes?.find(p => p.id === c.pacote_id);
      return acc + (pac?.valor_venda || 0);
    }, 0) || 0;

    const lucroEstimado = receitaRecebida - custosServidores;

    return { receitaRecebida, custosServidores, receitaPrevista, lucroEstimado };
  }, [pagamentos, servidores, clientes, pacotes]);

  if (loadingPag) return null;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
        <p className="text-text-secondary text-sm">Saúde financeira do seu negócio em {format(new Date(), 'MMMM yyyy', { locale: ptBR })}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receita Card */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-brand-green/10 text-brand-green">
                 <ArrowUpCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase text-text-secondary tracking-widest text-right">Confirmado</span>
           </div>
           <div>
              <p className="text-3xl font-bold text-brand-green">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.receitaRecebida)}
              </p>
              <p className="text-xs text-text-secondary mt-1">Total recebido no mês atual</p>
           </div>
           <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[10px] text-text-secondary">Previsto</span>
              <span className="text-sm font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.receitaPrevista)}</span>
           </div>
        </div>

        {/* Custos Card */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-status-danger/10 text-status-danger">
                 <ArrowDownCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase text-text-secondary tracking-widest text-right">Custos Fixos</span>
           </div>
           <div>
              <p className="text-3xl font-bold text-status-danger">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.custosServidores)}
              </p>
              <p className="text-xs text-text-secondary mt-1">Custo total de painéis/servidores</p>
           </div>
           <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[10px] text-text-secondary">Lucro Estimado</span>
              <span className={cn("text-sm font-bold", stats.lucroEstimado > 0 ? "text-brand-green" : "text-status-danger")}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.lucroEstimado)}
              </span>
           </div>
        </div>
      </div>

      {/* Margem por Servidor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand-blue" />
          Margem por Servidor
        </h3>
        <div className="space-y-3">
          {servidores?.filter(s => s.status === 'Ativo').map(server => {
             const serverClients = clientes?.filter(c => c.servidor_id === server.id && c.status !== 'Cancelado') || [];
             const serverRevenue = serverClients.reduce((acc, c) => {
                const pac = pacotes?.find(p => p.id === c.pacote_id);
                return acc + (pac?.valor_venda || 0);
             }, 0);
             const margin = serverRevenue - server.custo_mensal;
             const marginPct = serverRevenue > 0 ? (margin / serverRevenue) * 100 : 0;

             return (
               <div key={server.id} className="bg-bg-card/50 border border-border-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm">{server.nome}</h4>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", marginPct > 50 ? "bg-brand-green/10 text-brand-green" : "bg-status-warning/10 text-status-warning")}>
                      {marginPct.toFixed(0)}% margem
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[10px] text-text-secondary block">Receita</span>
                        <span className="text-sm font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(serverRevenue)}</span>
                     </div>
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] text-text-secondary block">Créditos/Custo</span>
                        <span className="text-sm font-semibold text-status-danger">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(server.custo_mensal)}</span>
                     </div>
                  </div>
               </div>
             );
          })}
          {servidores?.filter(s => s.status === 'Ativo').length === 0 && (
             <div className="p-8 text-center text-text-secondary text-sm italic">
                Cadastre servidores para ver a análise de margem.
             </div>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex gap-3 items-start">
         <Info className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
         <p className="text-[11px] text-text-secondary leading-relaxed">
            As métricas financeiras são baseadas nos pagamentos registrados manualmente e nos pacotes vinculados aos seus clientes ativos. Mantenha os pagamentos atualizados para precisão total.
         </p>
      </div>
    </div>
  );
}
