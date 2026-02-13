import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ProductCost {
  productId: string;
  productName: string;
  costPrice: number;
  salePrice: number;
  margin: number;
}

export const setProductCost = async (productId: string, costPrice: number, salePrice: number) => {
  try {
    const margin = ((salePrice - costPrice) / salePrice) * 100;

    await setDoc(doc(db, 'productCosts', productId), {
      productId,
      costPrice,
      salePrice,
      margin,
      updatedAt: new Date(),
    });

    return { productId, costPrice, salePrice, margin };
  } catch (error) {
    throw error;
  }
};

export const getProductCost = async (productId: string): Promise<ProductCost | null> => {
  try {
    const docRef = doc(db, 'productCosts', productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ProductCost;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getAllProductCosts = async (): Promise<ProductCost[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'productCosts'));
    return querySnapshot.docs.map((doc) => doc.data() as ProductCost);
  } catch (error) {
    throw error;
  }
};