'use client';

import React, { useState } from 'react';
import { useCollection } from '@/hooks/use-firestore';
import { Plus, Package, Calendar, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { PacoteForm } from './pacote-form';

export function PacotesList() {
  const { data: pacotes, loading, remove } = useCollection<any>('pacotes');
  const { data: clientes } = useCollection<any>('clientes');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPacote, setSelectedPacote] = useState<any>(null);

  const openForm = (pacote: any = null) => {
    setSelectedPacote(pacote);
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setSelectedPacote(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Excluir pacote ${name}?`)) {
      await remove(id);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Pacotes</h2>
        <button 
          onClick={() => openForm()}
          className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pacotes?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-bg-card/30 border border-dashed border-border-subtle rounded-2xl">
            <p className="text-text-secondary text-sm">Nenhum pacote cadastrado.</p>
          </div>
        ) : (
          pacotes?.map((pacote) => {
            const clientCount = clientes?.filter(c => c.pacote_id === pacote.id && c.status !== 'Cancelado').length || 0;

            return (
              <div 
                key={pacote.id} 
                onClick={() => openForm(pacote)}
                className="bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col justify-between group hover:border-brand-blue/30 transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                   <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/20">
                      <Package className="w-6 h-6 text-brand-green" />
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-bold text-text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pacote.valor_venda)}
                       </p>
                       <div className="flex items-center gap-1 justify-end text-[10px] text-text-secondary">
                          <Calendar className="w-3 h-3" />
                          <span>{pacote.periodo_dias} dias</span>
                       </div>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(pacote.id, pacote.nome);
                         }}
                         className="mt-2 p-1.5 opacity-0 group-hover:opacity-100 text-status-danger hover:bg-status-danger/10 rounded-lg transition-all ml-auto block"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                </div>

                <div>
                   <h4 className="font-bold text-lg mb-1">{pacote.nome}</h4>
                   <p className="text-xs text-text-secondary mb-4 line-clamp-2">{pacote.descricao || 'Sem descrição'}</p>
                   
                   <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Clientes Ativos</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-text-primary text-xs font-bold">{clientCount}</span>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeForm}
        title={selectedPacote ? 'Editar Pacote' : 'Novo Pacote'}
      >
        <PacoteForm pacote={selectedPacote} onSuccess={closeForm} />
      </Modal>
    </div>
  );
}
