import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  FirebaseError,
} from 'firebase/auth';
import { auth } from '../utils/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'investor' | 'startup';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: 'investor' | 'startup') => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'investor' | 'startup') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Firebase error codes to friendly messages
function firebaseErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error — check your internet connection.';
      case 'auth/operation-not-allowed':
        return 'Email/password login is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.';
      default:
        return err.message || 'Authentication failed.';
    }
  }
  return 'An unexpected error occurred.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until Firebase restores session
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Restore role from displayName metadata (we encode it as "Name|role")
        const parts = (firebaseUser.displayName ?? '').split('|');
        const name = parts[0] || firebaseUser.email?.split('@')[0] || 'User';
        const role = (parts[1] as 'investor' | 'startup') || 'investor';

        setUser((prevUser) => {
          // Prevent race condition: if we just signed up, displayName might be null until updateProfile finishes
          if (prevUser && prevUser.id === firebaseUser.uid && parts.length === 1) {
            return prevUser;
          }
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name,
            role,
            createdAt: firebaseUser.metadata.creationTime ?? new Date().toISOString(),
          };
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe; // cleanup listener on unmount
  }, []);

  const login = async (email: string, password: string, role: 'investor' | 'startup') => {
    setIsLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = credential.user;

      // Parse stored name/role from displayName
      const parts = (firebaseUser.displayName ?? '').split('|');
      const name = parts[0] || email.split('@')[0];
      const storedRole = (parts[1] as 'investor' | 'startup') || 'investor';

      // Ensure user logs into correctly typed layout
      if (storedRole !== role) {
        await signOut(auth);
        throw new Error(`Account type mismatch. Please log in as ${storedRole.toUpperCase()}`);
      }

      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email ?? email,
        name,
        role: storedRole,
        createdAt: firebaseUser.metadata.creationTime ?? new Date().toISOString(),
      });
    } catch (err) {
      let msg = firebaseErrorMessage(err);
      if (err instanceof Error && err.message.includes('Account type mismatch')) {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'investor' | 'startup'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const firebaseUser = credential.user;

      // Store name and role in displayName as "Name|role"
      await updateProfile(firebaseUser, {
        displayName: `${name.trim()}|${role}`,
      });

      const newUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email ?? email,
        name: name.trim(),
        role,
        createdAt: new Date().toISOString(),
      };

      // Set state locally
      setUser(newUser);

      // Tell our Express API to sync to Mongo Atlas
      try {
        await fetch('http://localhost:5000/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      } catch (e) {
        console.warn("Failed to sync to MongoDB, but Firebase account was created.");
      }
    } catch (err) {
      const msg = firebaseErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    await signOut(auth);
    // onAuthStateChanged will fire and set user to null automatically
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
