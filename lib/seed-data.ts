import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { addDays, subDays } from 'date-fns';

export async function seedTenantData(uid: string) {
  const path = `revendedores/${uid}`;
  
  // 1. Add Servers
  const s1 = await addDoc(collection(db, `${path}/servidores`), {
    nome: "Servidor Alpha Pro",
    fornecedor: "Master IPTV",
    custo_mensal: 150.00,
    capacidade_maxima: 50,
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  const s2 = await addDoc(collection(db, `${path}/servidores`), {
    nome: "Painel Global BR",
    fornecedor: "Streaming Host",
    custo_mensal: 80.00,
    capacidade_maxima: 30,
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  // 2. Add Packages
  const p1 = await addDoc(collection(db, `${path}/pacotes`), {
    nome: "Mensal Standard",
    periodo_dias: 30,
    valor_venda: 35.00,
    descricao: "Canais HD + Filmes",
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  const p2 = await addDoc(collection(db, `${path}/pacotes`), {
    nome: "Mensal Premium 4K",
    periodo_dias: 30,
    valor_venda: 50.00,
    descricao: "Todos os canais + 4K + Adultos",
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  const p3 = await addDoc(collection(db, `${path}/pacotes`), {
    nome: "Trimestral Econômico",
    periodo_dias: 90,
    valor_venda: 90.00,
    descricao: "3 meses de acesso completo",
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  // 3. Add Clients
  const now = new Date();

  // Active
  await addDoc(collection(db, `${path}/clientes`), {
    nome: "João Silva",
    whatsapp: "5511999998888",
    servidor_id: s1.id,
    pacote_id: p1.id,
    data_inicio: Timestamp.fromDate(subDays(now, 10)),
    data_vencimento: Timestamp.fromDate(addDays(now, 20)),
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  await addDoc(collection(db, `${path}/clientes`), {
    nome: "Maria Oliveira",
    whatsapp: "5511988887777",
    servidor_id: s1.id,
    pacote_id: p2.id,
    data_inicio: Timestamp.fromDate(subDays(now, 5)),
    data_vencimento: Timestamp.fromDate(addDays(now, 25)),
    status: "Ativo",
    criado_em: serverTimestamp()
  });

  // Vencendo (tomorrow)
  await addDoc(collection(db, `${path}/clientes`), {
    nome: "Carlos Santos",
    whatsapp: "5511977776666",
    servidor_id: s2.id,
    pacote_id: p1.id,
    data_inicio: Timestamp.fromDate(subDays(now, 29)),
    data_vencimento: Timestamp.fromDate(addDays(now, 1)),
    status: "Vencendo",
    criado_em: serverTimestamp()
  });

  // Vencendo (today)
  await addDoc(collection(db, `${path}/clientes`), {
    nome: "Ana Pereira",
    whatsapp: "5511966665555",
    servidor_id: s2.id,
    pacote_id: p1.id,
    data_inicio: Timestamp.fromDate(subDays(now, 30)),
    data_vencimento: Timestamp.fromDate(now),
    status: "Vencendo",
    criado_em: serverTimestamp()
  });

  // Inadimplente (late)
  await addDoc(collection(db, `${path}/clientes`), {
    nome: "Ricardo Souza",
    whatsapp: "5511955554444",
    servidor_id: s1.id,
    pacote_id: p2.id,
    data_inicio: Timestamp.fromDate(subDays(now, 45)),
    data_vencimento: Timestamp.fromDate(subDays(now, 15)),
    status: "Inadimplente",
    criado_em: serverTimestamp()
  });

  // 4. Add some payments
  await addDoc(collection(db, `${path}/pagamentos`), {
    cliente_id: "placeholder-id", // properly this would be one of the above
    valor_esperado: 35.0,
    valor_recebido: 35.0,
    data_pagamento: serverTimestamp(),
    metodo: "Pix",
    criado_em: serverTimestamp()
  });
}
