'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { seedTenantData } from '@/lib/seed-data';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  tenantData: any | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const tenantRef = doc(db, 'revendedores', user.uid);
          const tenantSnap = await getDoc(tenantRef);
          
          if (!tenantSnap.exists()) {
            const newData = {
              nome: user.displayName || 'Revendedor',
              nome_negocio: 'TOPdigitalPLAY',
              email: user.email || '',
              criado_em: serverTimestamp(),
              configuracoes: {
                dias_vencimento_alerta: 3,
                templates_mensagem: {
                  boas_vindas: "Olá {nome}! Bem-vindo ao {nome_negocio}. Seu acesso foi ativado e vence em {vencimento}. Valor: R$ {valor}.",
                  aviso_vencimento: "Olá {nome}! Seu acesso no {nome_negocio} vence daqui a {dias_alerta} dias ({vencimento}). Garanta sua renovação!",
                  cobranca_inadimplencia: "Olá {nome}! Identificamos que seu acesso no {nome_negocio} venceu há {dias_atraso} dias. Deseja renovar?",
                  confirmacao_pagamento: "Pagamento confirmado, {nome}! Seu acesso foi renovado até {vencimento}. Obrigado!"
                }
              }
            };
            await setDoc(tenantRef, newData);
            setTenantData(newData);
            
            // Seed initial data if the subcollection is empty
            try {
              const serverCheck = await getDocs(query(collection(db, `revendedores/${user.uid}/servidores`), limit(1)));
              if (serverCheck.empty) {
                await seedTenantData(user.uid);
              }
            } catch (e) {
              console.warn("Seeding failed, probably rules not updated yet.", e);
            }
          } else {
            setTenantData(tenantSnap.data());
          }
        } else {
          setTenantData(null);
        }
      } catch (error) {
        console.error("Auth process error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, tenantData, loginWithGoogle, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
