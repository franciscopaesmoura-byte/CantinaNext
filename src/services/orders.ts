import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { updateProduct } from './products';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id?: string;
  listId: string;
  clientName: string;
  clientPhone?: string;
  items: OrderItem[];
  totalValue: number;
  createdAt: Date;
  createdBy: string;
}

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    // Remove campos undefined antes de salvar
    const cleanData = {
      listId: order.listId,
      clientName: order.clientName,
      clientPhone: order.clientPhone || '', // Se vazio, salva string vazia ao invés de undefined
      items: order.items,
      totalValue: order.totalValue,
      createdBy: order.createdBy,
      createdAt: new Date(),
    };

    // Cria o pedido
    const docRef = await addDoc(collection(db, 'orders'), cleanData);

    // Atualiza o estoque de cada produto
    for (const item of order.items) {
      try {
        // Busca o produto atual
        const productDoc = await getDoc(doc(db, 'products', item.productId));
        if (productDoc.exists()) {
          const currentProduct = productDoc.data();
          const newQuantity = Math.max(0, currentProduct.currentQuantity - item.quantity);

          // Atualiza a quantidade atual
          await updateProduct(item.productId, {
            currentQuantity: newQuantity,
          });
        }
      } catch (error) {
        console.error(`Erro ao atualizar estoque do produto ${item.productId}:`, error);
      }
    }

    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getOrdersByList = async (listId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('listId', '==', listId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Order[];
  } catch (error) {
    throw error;
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      } as Order;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, updates);
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Order[];
  } catch (error) {
    throw error;
  }
};