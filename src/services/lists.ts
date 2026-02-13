import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface List {
  id?: string;
  name: string;
  date: string;
  createdAt: Date;
  createdBy: string;
  totalValue: number;
}

export const createList = async (list: Omit<List, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'lists'), {
      ...list,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getLists = async (): Promise<List[]> => {
  try {
    const q = query(collection(db, 'lists'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as List[];
  } catch (error) {
    throw error;
  }
};

export const getList = async (listId: string): Promise<List | null> => {
  try {
    const docRef = doc(db, 'lists', listId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      } as List;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateList = async (listId: string, updates: Partial<List>) => {
  try {
    const docRef = doc(db, 'lists', listId);
    await updateDoc(docRef, updates);
  } catch (error) {
    throw error;
  }
};

export const deleteList = async (listId: string) => {
  try {
    await deleteDoc(doc(db, 'lists', listId));
  } catch (error) {
    throw error;
  }
};