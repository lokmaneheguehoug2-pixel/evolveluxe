'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type User = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: 'user' | 'admin';
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  hydrated: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hydrate: () => void;
};

async function fetchUserProfile(fbUser: FirebaseUser): Promise<User> {
  try {
    const ref = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: fbUser.uid,
        email: fbUser.email || '',
        fullName: data.full_name || '',
        phone: data.phone,
        role: data.role === 'admin' ? 'admin' : 'user',
      };
    }
    // No profile yet — create a default one
    const defaultProfile = {
      full_name: fbUser.displayName || '',
      role: 'user',
      email: fbUser.email || '',
      created_at: new Date().toISOString(),
    };
    await setDoc(ref, defaultProfile);
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      fullName: defaultProfile.full_name,
      role: 'user',
    };
  } catch {
    // If Firestore fails, still return a basic user from auth
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      role: 'user',
    };
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      hydrated: false,
      signUp: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          // Create Firestore user profile
          await setDoc(doc(db, 'users', cred.user.uid), {
            full_name: fullName,
            email,
            role: 'user',
            created_at: new Date().toISOString(),
          });
          set({
            user: {
              id: cred.user.uid,
              email,
              fullName,
              role: 'user',
            },
          });
          return { error: null };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unable to create account';
          return { error: msg };
        } finally {
          set({ isLoading: false });
        }
      },
      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const profile = await fetchUserProfile(cred.user);
          set({ user: profile });
          return { error: null };
        } catch (err) {
          let msg = err instanceof Error ? err.message : 'Unable to sign in';
          // Friendlier Firebase error messages
          if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
            msg = 'Invalid email or password';
          }
          return { error: msg };
        } finally {
          set({ isLoading: false });
        }
      },
      signOut: async () => {
        try {
          await fbSignOut(auth);
        } catch {
          // ignore
        }
        set({ user: null });
      },
      hydrate: () => {
        set({ hydrated: true });
        if (!auth.onAuthStateChanged) return;
        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const profile = await fetchUserProfile(fbUser);
            set({ user: profile });
          } else {
            set({ user: null });
          }
        });
      },
    }),
    {
      name: 'evolve-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
