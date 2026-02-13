import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const registerJovem = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'jovem',
      createdAt: new Date(),
      name: email.split('@')[0],
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginAdm = async (email: string, password: string) => {
  const admEmail = process.env.NEXT_PUBLIC_ADM_EMAIL;
  const admPassword = process.env.NEXT_PUBLIC_ADM_PASSWORD;

  if (email === admEmail && password === admPassword) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { ...userCredential.user, role: 'adm' };
    } catch {
      // Se usuário não existe no Firebase, criar
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'adm',
        createdAt: new Date(),
        name: 'Administrador',
      });

      return { ...user, role: 'adm' };
    }
  } else {
    throw new Error('Credenciais de ADM inválidas');
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getUserRole = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};