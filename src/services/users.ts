import { collection, query, where, getDocs, runTransaction, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '../types/user';

const COUNTER_DOC_ID = 'user_counter';

async function getNextUserId() {
  const counterRef = doc(db, 'counters', COUNTER_DOC_ID);
  
  return await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const nextId = counterDoc.exists() ? counterDoc.data().value + 1 : 1;
    
    transaction.set(counterRef, { value: nextId }, { merge: true });
    
    return nextId;
  });
}

export async function createUser(userData: Omit<User, 'id'>) {
  const nextId = await getNextUserId();
  const userRef = doc(db, 'users', nextId.toString());
  
  await setDoc(userRef, {
    ...userData,
    numericId: nextId,
    createdAt: new Date(),
    lastUpdated: new Date()
  });
  
  return {
    id: nextId.toString(),
    ...userData,
    numericId: nextId
  };
}

export async function searchUsers(searchTerm: string) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', 'user'));
  const snapshot = await getDocs(q);
  
  const searchTermLower = searchTerm.toLowerCase();
  return snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as User)
    .filter(user => 
      user.email.toLowerCase().includes(searchTermLower) ||
      user.firstName.toLowerCase().includes(searchTermLower) ||
      user.lastName.toLowerCase().includes(searchTermLower)
    );
}

export async function getUserById(id: string) {
  const userRef = doc(db, 'users', id);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  return {
    id: userDoc.id,
    ...userDoc.data()
  } as User;
}