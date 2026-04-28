'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  where,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/providers/firebase-provider';

export function useCollection<T>(path: string, constraints: QueryConstraint[] = []) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fullPath = `revendedores/${user.uid}/${path}`;
    const q = query(collection(db, fullPath), ...constraints);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${path}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, path, JSON.stringify(constraints)]);

  const add = async (item: any) => {
    if (!user) return;
    const fullPath = `revendedores/${user.uid}/${path}`;
    return await addDoc(collection(db, fullPath), {
      ...item,
      criado_em: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  };

  const update = async (id: string, item: any) => {
    if (!user) return;
    const itemRef = doc(db, `revendedores/${user.uid}/${path}`, id);
    return await updateDoc(itemRef, {
      ...item,
      updated_at: serverTimestamp(),
    });
  };

  const remove = async (id: string) => {
    if (!user) return;
    const itemRef = doc(db, `revendedores/${user.uid}/${path}`, id);
    return await deleteDoc(itemRef);
  };

  return { data, loading, error, add, update, remove };
}
