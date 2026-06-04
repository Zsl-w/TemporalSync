import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, loginAnonymouslyFirebase } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

export interface MockUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  isMock: boolean;
  role?: string;
}

export type AuthUser = (User & { isMock?: boolean }) | MockUser;

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginAsMock: (name: string, email: string, role: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  loginWithGoogle: async () => {},
  loginAnonymously: async () => {},
  loginAsMock: () => {},
  signOut: async () => {} 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('ts-mock-user');
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLoginWithGoogle = async () => {
    localStorage.removeItem('ts-mock-user');
    try {
      const fbUser = await signInWithGoogle();
      setUser(fbUser);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const handleLoginAnonymously = async () => {
    localStorage.removeItem('ts-mock-user');
    try {
      const fbUser = await loginAnonymouslyFirebase();
      setUser(fbUser);
    } catch (error) {
      console.error('Anonymous login failed:', error);
      throw error;
    }
  };

  const handleLoginAsMock = (name: string, email: string, role: string) => {
    const mockUser: MockUser = {
      uid: `mock_${Date.now()}`,
      displayName: name || 'Mock User',
      email: email || 'mock@example.com',
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'mock')}`,
      isAnonymous: false,
      isMock: true,
      role: role
    };
    localStorage.setItem('ts-mock-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  useEffect(() => {
    // 1. Check if mock user exists in local storage
    const savedMock = localStorage.getItem('ts-mock-user');
    if (savedMock) {
      try {
        const parsed = JSON.parse(savedMock);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (_) {}
    }

    // 2. Fallback to Firebase listener
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      // Only update if no mock user is set
      if (!localStorage.getItem('ts-mock-user')) {
        setUser(fbUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);



  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle: handleLoginWithGoogle,
      loginAnonymously: handleLoginAnonymously,
      loginAsMock: handleLoginAsMock,
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
