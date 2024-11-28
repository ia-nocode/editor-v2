import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '../types/user';

export function useEditorAuth(firebaseUser: FirebaseUser | null | undefined) {
  const [isEditor, setIsEditor] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkEditorStatus = async () => {
      setLoading(true);
      setIsEditor(false);

      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '==', firebaseUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data() as User;
          setIsEditor(userData.role === 'editor');
        }
      } catch (err) {
        console.error('Error checking editor status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkEditorStatus();
  }, [firebaseUser]);

  return { isEditor, loading };
}