import { create } from 'zustand';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user from Firestore or create if doesn't exist
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          set({ user: userSnap.data() as User, loading: false });
        } else {
          // Create new user in Firestore
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
          };
          
          await setDoc(userRef, newUser);
          set({ user: newUser, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      await signInWithPopup(auth, googleProvider);
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error('Error signing in with Google:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ error: (error as Error).message, loading: false });
    }
  },
}));