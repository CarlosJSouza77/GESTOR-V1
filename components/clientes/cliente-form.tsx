'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection } from '@/hooks/use-firestore';
import { Timestamp } from 'firebase/firestore';
import { Loader2, Save } from 'lucide-react';
import { addDays } from 'date-fns';

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  whatsapp: z.string().min(10, 'WhatsApp inválido (ex: 5511999998888)'),
  servidor_id: z.string().min(1, 'Selecione um servidor'),
  pacote_id: z.string().min(1, 'Selecione um pacote'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  status: z.enum(['Ativo', 'Vencendo', 'Inadimplente', 'Cancelado']),
  observacoes: z.string().optional(),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: any;
  onSuccess: () => void;
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const { add, update } = useCollection('clientes');
  const { data: servidores } = useCollection<any>('servidores');
  const { data: pacotes } = useCollection<any>('pacotes');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome || '',
      whatsapp: cliente?.whatsapp || '',
      servidor_id: cliente?.servidor_id || '',
      pacote_id: cliente?.pacote_id || '',
      data_vencimento: cliente?.data_vencimento?.toDate 
        ? cliente.data_vencimento.toDate().toISOString().split('T')[0]
        : (cliente?.data_vencimento ? new Date(cliente.data_vencimento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      status: cliente?.status || 'Ativo',
      observacoes: cliente?.observacoes || '',
    },
  });

  const selectedPacoteId = watch('pacote_id');

  // Auto-calculate expiration date if creating and package changes
  useEffect(() => {
    if (!cliente && selectedPacoteId && pacotes) {
      const pacote = pacotes.find(p => p.id === selectedPacoteId);
      if (pacote) {
        const days = pacote.periodo_dias || 30;
        const newVenc = addDays(new Date(), days);
        setValue('data_vencimento', newVenc.toISOString().split('T')[0]);
      }
    }
  }, [selectedPacoteId, pacotes, cliente, setValue]);

  const onSubmit = async (values: ClienteFormValues) => {
    try {
      const data = {
        ...values,
        data_inicio: cliente?.data_inicio || Timestamp.now(),
        data_vencimento: Timestamp.fromDate(new Date(values.data_vencimento + 'T12:00:00')),
      };

      if (cliente?.id) {
        await update(cliente.id, data);
      } else {
        await add(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente. Verifique as permissões.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nome do Cliente</label>
        <input
          {...register('nome')}
          placeholder="Ex: João da Silva"
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
        />
        {errors.nome && <p className="text-[10px] text-status-danger">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">WhatsApp (com DDD)</label>
        <input
          {...register('whatsapp')}
          placeholder="Ex: 5511999998888"
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue font-mono"
        />
        {errors.whatsapp && <p className="text-[10px] text-status-danger">{errors.whatsapp.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Servidor</label>
          <select
            {...register('servidor_id')}
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          >
            <option value="">Selecione...</option>
            {servidores?.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
          {errors.servidor_id && <p className="text-[10px] text-status-danger">{errors.servidor_id.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Pacote/Plano</label>
          <select
            {...register('pacote_id')}
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          >
            <option value="">Selecione...</option>
            {pacotes?.map(p => (
              <option key={p.id} value={p.id}>{p.nome} - R$ {p.valor_venda}</option>
            ))}
          </select>
          {errors.pacote_id && <p className="text-[10px] text-status-danger">{errors.pacote_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Vencimento</label>
          <input
            {...register('data_vencimento')}
            type="date"
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          />
          {errors.data_vencimento && <p className="text-[10px] text-status-danger">{errors.data_vencimento.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select
            {...register('status')}
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          >
            <option value="Ativo">Ativo</option>
            <option value="Vencendo">Vencendo</option>
            <option value="Inadimplente">Inadimplente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Observações (Opcional)</label>
        <textarea
          {...register('observacoes')}
          rows={3}
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 bg-brand-blue text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95 transition-all outline-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5" />
            {cliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </>
        )}
      </button>
    </form>
  );
}
