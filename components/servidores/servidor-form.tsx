'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCollection } from '@/hooks/use-firestore';
import { Loader2, Save } from 'lucide-react';

const servidorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  fornecedor: z.string().min(2, 'Fornecedor é obrigatório'),
  custo_mensal: z.number().min(0, 'Custo deve ser maior ou igual a 0'),
  capacidade_maxima: z.number().min(1, 'Capacidade deve ser pelo menos 1'),
  status: z.enum(['Ativo', 'Inativo']),
  observacoes: z.string().optional(),
});

type ServidorFormValues = z.infer<typeof servidorSchema>;

interface ServidorFormProps {
  servidor?: any;
  onSuccess: () => void;
}

export function ServidorForm({ servidor, onSuccess }: ServidorFormProps) {
  const { add, update } = useCollection('servidores');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServidorFormValues>({
    resolver: zodResolver(servidorSchema),
    defaultValues: {
      nome: servidor?.nome || '',
      fornecedor: servidor?.fornecedor || '',
      custo_mensal: servidor?.custo_mensal || 0,
      capacidade_maxima: servidor?.capacidade_maxima || 50,
      status: servidor?.status || 'Ativo',
      observacoes: servidor?.observacoes || '',
    },
  });

  const onSubmit = async (values: ServidorFormValues) => {
    try {
      if (servidor?.id) {
        await update(servidor.id, values);
      } else {
        await add(values);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar servidor:", error);
      alert("Erro ao salvar.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nome do Servidor/Painel</label>
        <input
          {...register('nome')}
          placeholder="Ex: Servidor Gold"
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
        />
        {errors.nome && <p className="text-[10px] text-status-danger">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Fornecedor</label>
        <input
          {...register('fornecedor')}
          placeholder="Ex: Master IPTV"
          className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
        />
        {errors.fornecedor && <p className="text-[10px] text-status-danger">{errors.fornecedor.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Custo Mensal (BRL)</label>
          <input
            {...register('custo_mensal', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          />
          {errors.custo_mensal && <p className="text-[10px] text-status-danger">{errors.custo_mensal.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Capacidade (Clientes)</label>
          <input
            {...register('capacidade_maxima', { valueAsNumber: true })}
            type="number"
            className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-blue"
          />
          {errors.capacidade_maxima && <p className="text-[10px] text-status-danger">{errors.capacidade_maxima.message}</p>}
        </div>
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
        {servidor ? 'Salvar Alterações' : 'Cadastrar Servidor'}
      </button>
    </form>
  );
}
