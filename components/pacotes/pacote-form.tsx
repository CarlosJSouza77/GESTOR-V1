'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection } from '@/hooks/use-firestore';
import { Loader2, Save } from 'lucide-react';

const pacoteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  periodo_dias: z.number().min(1, 'Período deve ser pelo menos 1 dia'),
  valor_venda: z.number().min(0, 'Valor deve ser positivo'),
  descricao: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo']),
});

type PacoteFormValues = z.infer<typeof pacoteSchema>;

interface PacoteFormProps {
  pacote?: any;
  onSuccess: () => void;
}

export function PacoteForm({ pacote, onSuccess }: PacoteFormProps) {
  const { add, update } = useCollection('pacotes');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PacoteFormValues>({
    resolver: zodResolver(pacoteSchema),
    defaultValues: {
      nome: pacote?.nome || '',
      periodo_dias: pacote?.periodo_dias || 30,
      valor_venda: pacote?.valor_venda || 35,
      descricao: pacote?.descricao || '',
      status: pacote?.status || 'Ativo',
    },
  });

  const onSubmit = async (values: PacoteFormValues) => {
    try {
      if (pacote?.id) {
        await update(pacote.id, values);
      } else {
        await add(values);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar pacote:", error);
      alert("Erro ao salvar.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nome do Pacote</label>
        <input
          {...register('nome')}
          placeholder="Ex: Mensal HD"
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
        />
        {errors.nome && <p className="text-[10px] text-status-danger">{errors.nome.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Valor de Venda (BRL)</label>
          <input
            {...register('valor_venda', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          />
          {errors.valor_venda && <p className="text-[10px] text-status-danger">{errors.valor_venda.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Período (Dias)</label>
          <input
            {...register('periodo_dias', { valueAsNumber: true })}
            type="number"
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          />
          {errors.periodo_dias && <p className="text-[10px] text-status-danger">{errors.periodo_dias.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Descrição</label>
        <textarea
          {...register('descricao')}
          rows={3}
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Status</label>
        <select
          {...register('status')}
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
        >
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 bg-brand-blue text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 active:scale-95 transition-all outline-none disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {pacote ? 'Salvar Alterações' : 'Criar Pacote'}
      </button>
    </form>
  );
}
