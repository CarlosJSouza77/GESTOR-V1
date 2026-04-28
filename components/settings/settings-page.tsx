'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/firebase-provider';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save, Info, MessageSquare, ShieldCheck } from 'lucide-react';

export function SettingsPage() {
  const { tenantData, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_negocio: tenantData?.nome_negocio || '',
    dias_vencimento_alerta: tenantData?.configuracoes?.dias_vencimento_alerta || 3,
    boas_vindas: tenantData?.configuracoes?.templates_mensagem?.boas_vindas || '',
    aviso_vencimento: tenantData?.configuracoes?.templates_mensagem?.aviso_vencimento || '',
    cobranca_inadimplencia: tenantData?.configuracoes?.templates_mensagem?.cobranca_inadimplencia || '',
    confirmacao_pagamento: tenantData?.configuracoes?.templates_mensagem?.confirmacao_pagamento || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const tenantRef = doc(db, 'revendedores', user.uid);
      await updateDoc(tenantRef, {
        nome_negocio: formData.nome_negocio,
        'configuracoes.dias_vencimento_alerta': Number(formData.dias_vencimento_alerta),
        'configuracoes.templates_mensagem.boas_vindas': formData.boas_vindas,
        'configuracoes.templates_mensagem.aviso_vencimento': formData.aviso_vencimento,
        'configuracoes.templates_mensagem.cobranca_inadimplencia': formData.cobranca_inadimplencia,
        'configuracoes.templates_mensagem.confirmacao_pagamento': formData.confirmacao_pagamento,
      });
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-text-secondary text-sm">Personalize o seu negócio e as mensagens enviadas.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Config */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            Dados do Negócio
          </h3>
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome do Negócio</label>
              <input 
                type="text" 
                value={formData.nome_negocio}
                onChange={e => setFormData({...formData, nome_negocio: e.target.value})}
                className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Janela de Alerta (dias)</label>
              <input 
                type="number" 
                value={formData.dias_vencimento_alerta}
                onChange={e => setFormData({...formData, dias_vencimento_alerta: Number(e.target.value)})}
                className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
              />
              <p className="text-[10px] text-text-secondary font-light">Clientes mudam para status &quot;Vencendo&quot; N dias antes da data real.</p>
            </div>
          </div>
        </section>

        {/* Message Templates */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-blue" />
            Templates de Mensagem (Zap)
          </h3>
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-6">
             <div className="space-y-1.5">
                <label className="text-sm font-medium block">Boas-vindas</label>
                <textarea 
                  rows={3}
                  value={formData.boas_vindas}
                  onChange={e => setFormData({...formData, boas_vindas: e.target.value})}
                  className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-sm font-medium block">Aviso de Vencimento</label>
                <textarea 
                  rows={3}
                  value={formData.aviso_vencimento}
                  onChange={e => setFormData({...formData, aviso_vencimento: e.target.value})}
                  className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-sm font-medium block">Cobrança de Inadimplência</label>
                <textarea 
                  rows={3}
                  value={formData.cobranca_inadimplencia}
                  onChange={e => setFormData({...formData, cobranca_inadimplencia: e.target.value})}
                  className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-sm font-medium block">Confirmação de Pagamento</label>
                <textarea 
                  rows={3}
                  value={formData.confirmacao_pagamento}
                  onChange={e => setFormData({...formData, confirmacao_pagamento: e.target.value})}
                  className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue resize-none"
                />
             </div>

             <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex gap-3 text-[10px] text-text-secondary leading-relaxed">
                <Info className="w-4 h-4 text-brand-blue shrink-0" />
                <p>Variáveis disponíveis: {'{nome}'}, {'{vencimento}'}, {'{valor}'}, {'{dias_atraso}'}, {'{nome_negocio}'}</p>
             </div>
          </div>
        </section>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-brand-blue text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95 transition-all outline-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Alterações
            </>
          )}
        </button>
      </form>
    </div>
  );
}
