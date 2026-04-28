'use client';

import React, { useState } from 'react';
import { useCollection } from '@/hooks/use-firestore';
import { Plus, Search, Filter, MessageSquare, MoreVertical, CreditCard, Trash2, XCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { ClienteForm } from './cliente-form';

export function ClientesList() {
  const { data: clientes, loading, remove } = useCollection<any>('clientes');
  const { data: pacotes } = useCollection<any>('pacotes');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  const openForm = (cliente: any = null) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setSelectedCliente(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      await remove(id);
    }
  };

  const filteredClientes = clientes?.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.whatsapp.includes(searchTerm);
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-status-active/10 text-status-active border-status-active/20';
      case 'Vencendo': return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      case 'Inadimplente': return 'bg-status-danger/10 text-status-danger border-status-danger/20';
      case 'Cancelado': return 'bg-status-neutral/10 text-status-neutral border-status-neutral/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-card border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-brand-blue outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {['Ativo', 'Vencendo', 'Inadimplente', 'Cancelado'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                  statusFilter === status 
                    ? getStatusColor(status)
                    : "bg-bg-card border-border-subtle text-text-secondary"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredClientes?.length === 0 ? (
          <div className="text-center py-12 bg-bg-card/30 border border-dashed border-border-subtle rounded-2xl">
            <p className="text-text-secondary text-sm">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          filteredClientes?.map((cliente) => (
            <div 
              key={cliente.id} 
              onClick={() => openForm(cliente)}
              className="bg-bg-card border border-border-subtle rounded-2xl p-4 flex items-center justify-between hover:border-brand-blue/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-2 h-2 rounded-full", 
                  cliente.status === 'Ativo' ? "bg-status-active shadow-[0_0_8px_rgba(0,230,118,0.5)]" :
                  cliente.status === 'Vencendo' ? "bg-status-warning shadow-[0_0_8px_rgba(255,179,0,0.5)]" :
                  cliente.status === 'Inadimplente' ? "bg-status-danger shadow-[0_0_8px_rgba(255,61,87,0.5)]" :
                  "bg-status-neutral"
                )} />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold truncate">{cliente.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize", getStatusColor(cliente.status))}>
                      {cliente.status}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono tracking-tighter">
                      {cliente.whatsapp}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right mr-3">
                   <p className="text-xs font-bold text-text-primary">
                     {pacotes?.find((p: any) => p.id === cliente.pacote_id)?.nome || 'Plano'}
                   </p>
                   <p className="text-[10px] text-text-secondary">
                     Vence {cliente.data_vencimento?.toDate ? format(cliente.data_vencimento.toDate(), 'dd/MM/yyyy') : (cliente.data_vencimento ? format(new Date(cliente.data_vencimento), 'dd/MM/yyyy') : '--/--')}
                   </p>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-brand-blue hover:bg-brand-blue/10 transition-all">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cliente.id)}
                    className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-status-danger hover:bg-status-danger/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => openForm()}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-blue/30 active:scale-90 transition-transform z-10"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeForm}
        title={selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <ClienteForm 
          cliente={selectedCliente} 
          onSuccess={closeForm} 
        />
      </Modal>
    </div>
  );
}
