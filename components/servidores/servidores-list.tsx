'use client';

import React, { useState } from 'react';
import { useCollection } from '@/hooks/use-firestore';
import { Plus, Server, AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { ServidorForm } from './servidor-form';

export function ServidoresList() {
  const { data: servidores, loading, remove } = useCollection<any>('servidores');
  const { data: clientes } = useCollection<any>('clientes');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServidor, setSelectedServidor] = useState<any>(null);

  const openForm = (servidor: any = null) => {
    setSelectedServidor(servidor);
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setSelectedServidor(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Excluir servidor ${name}? Isso pode afetar os cálculos de ocupação.`)) {
      await remove(id);
    }
  };

  const getUsage = (serverId: string) => {
    const activeClients = clientes?.filter(c => c.servidor_id === serverId && c.status !== 'Cancelado').length || 0;
    const server = servidores?.find(s => s.id === serverId);
    if (!server || !server.capacidade_maxima) return 0;
    return (activeClients / server.capacidade_maxima) * 100;
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Servidores</h2>
        <button 
          onClick={() => openForm()}
          className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {servidores?.length === 0 ? (
          <div className="text-center py-12 bg-bg-card/30 border border-dashed border-border-subtle rounded-2xl">
            <p className="text-text-secondary text-sm">Nenhum servidor cadastrado.</p>
          </div>
        ) : (
          servidores?.map((server) => {
            const usage = getUsage(server.id);
            const activeCount = clientes?.filter(c => c.servidor_id === server.id && c.status !== 'Cancelado').length || 0;

            return (
              <div 
                key={server.id} 
                className="bg-bg-card border border-border-subtle rounded-2xl p-5 space-y-4 hover:border-brand-blue/30 transition-colors group cursor-pointer relative"
                onClick={() => openForm(server)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
                      <Server className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="font-bold">{server.nome}</h4>
                      <p className="text-xs text-text-secondary">{server.fornecedor || 'Fornecedor'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(server.custo_mensal)}
                    </span>
                    <p className="text-[10px] text-text-secondary">custo mensal</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(server.id, server.nome);
                      }}
                      className="mt-2 p-1.5 opacity-0 group-hover:opacity-100 text-status-danger hover:bg-status-danger/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Ocupação ({activeCount}/{server.capacidade_maxima})</span>
                    <span className={cn("font-bold", usage > 90 ? "text-status-danger" : usage > 70 ? "text-status-warning" : "text-brand-green")}>
                      {usage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden border border-border-subtle">
                    <div 
                      className={cn("h-full transition-all duration-500", 
                        usage > 90 ? "bg-status-danger" : usage > 70 ? "bg-status-warning" : "bg-brand-green"
                      )}
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                  {usage > 90 && (
                    <div className="flex items-center gap-1 text-[10px] text-status-danger font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Servidor quase cheio! Considere adicionar outro.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeForm}
        title={selectedServidor ? 'Editar Servidor' : 'Novo Servidor'}
      >
        <ServidorForm servidor={selectedServidor} onSuccess={closeForm} />
      </Modal>
    </div>
  );
}
