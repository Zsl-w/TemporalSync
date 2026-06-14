import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  auth,
  signInWithGoogle,
  signInAnonymously,
  signUpWithEmail,
  signInWithEmail,
  signOut as cloudbaseSignOut,
  onAuthStateChanged,
  getCurrentUser,
  handleOAuthCallback,
} from '../lib/cloudbase';

// --- Types ---
export interface MockUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  isMock: boolean;
  role?: string;
}

export interface CloudbaseUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  isAnonymous: boolean;
  loginType?: string;
  isMock?: boolean;
  // CloudBase specific fields
  openid?: string;
  unionid?: string;
  nickName?: string;
  avatarUrl?: string;
}

export type AuthUser = CloudbaseUser | MockUser;

/**
 * Check if the current user has admin privileges.
 * - Mock users: role === 'Developer'
 * - Real CloudBase users: email === 'wangzouszz@gmail.com'
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  // Mock user check
  if ('isMock' in user && user.isMock) {
    return (user as MockUser).role === 'Developer';
  }
  // Real CloudBase user check
  return user.email === 'wangzouszz@gmail.com';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginAsMock: (name: string, email: string, role: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  loginAnonymously: async () => {},
  loginWithEmail: async () => {},
  signUpWithEmailPassword: async () => {},
  loginAsMock: () => {},
  signOut: async () => {},
});

/**
 * Normalize a CloudBase user object to our AuthUser shape.
 */
function normalizeUser(raw: any): CloudbaseUser | null {
  if (!raw) return null;
  return {
    uid: raw.uid || raw._id || raw.openid || '',
    displayName: raw.displayName || raw.nickName || raw.username || raw.email || 'Anonymous',
    email: raw.email || null,
    photoURL: raw.photoURL || raw.avatarUrl || null,
    isAnonymous: raw.loginType === 'ANONYMOUS' || raw.isAnonymous || false,
    loginType: raw.loginType || null,
    openid: raw.openid,
    unionid: raw.unionid,
    nickName: raw.nickName,
    avatarUrl: raw.avatarUrl,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Login methods ---
  const handleLoginWithGoogle = useCallback(async () => {
    localStorage.removeItem('ts-mock-user');
    const rawUser = await signInWithGoogle();
    const normalized = normalizeUser(rawUser);
    if (normalized) setUser(normalized);
  }, []);

  const handleLoginAnonymously = useCallback(async () => {
    localStorage.removeItem('ts-mock-user');
    const rawUser = await signInAnonymously();
    const normalized = normalizeUser(rawUser);
    if (normalized) setUser(normalized);
  }, []);

  const handleLoginWithEmail = useCallback(async (email: string, password: string) => {
    localStorage.removeItem('ts-mock-user');
    const rawUser = await signInWithEmail(email, password);
    const normalized = normalizeUser(rawUser);
    if (normalized) setUser(normalized);
  }, []);

  const handleSignUpWithEmail = useCallback(async (email: string, password: string) => {
    localStorage.removeItem('ts-mock-user');
    const rawUser = await signUpWithEmail(email, password);
    const normalized = normalizeUser(rawUser);
    if (normalized) setUser(normalized);
  }, []);

  const handleLoginAsMock = useCallback((name: string, email: string, role: string) => {
    const mockUser: MockUser = {
      uid: `mock_${Date.now()}`,
      displayName: name || 'Mock User',
      email: email || 'mock@example.com',
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'mock')}`,
      isAnonymous: false,
      isMock: true,
      role: role,
    };
    localStorage.setItem('ts-mock-user', JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      localStorage.removeItem('ts-mock-user');
      await cloudbaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clear local state even if remote signOut fails
      setUser(null);
    }
  }, []);

  // --- Auth state listener ---
  useEffect(() => {
    // 1. Check if mock user exists in local storage
    const savedMock = localStorage.getItem('ts-mock-user');
    if (savedMock) {
      try {
        const parsed = JSON.parse(savedMock);
        setUser(parsed);
        setLoading(false);
        return;
      } catch {
        // Corrupted data, fall through
      }
    }

    // 2. Check for OAuth callback first (URL has ?code= parameter)
    let cancelled = false;

    const initAuth = async () => {
      try {
        // If returning from OAuth redirect, verify the callback
        const oauthUser = await handleOAuthCallback();
        if (!cancelled && oauthUser) {
          const normalized = normalizeUser(oauthUser);
          if (normalized) {
            setUser(normalized);
          }
          setLoading(false);
          return;
        }

        // Otherwise, try to restore existing CloudBase session
        const currentUser = await getCurrentUser();
        if (!cancelled) {
          const normalized = normalizeUser(currentUser);
          if (normalized) {
            setUser(normalized);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // 3. Listen for auth state changes
    const unsubscribe = onAuthStateChanged((rawUser) => {
      if (cancelled) return;
      // Don't override mock user
      if (localStorage.getItem('ts-mock-user')) return;
      const normalized = normalizeUser(rawUser);
      setUser(normalized);
      if (loading) setLoading(false);
    });

    return () => {
      cancelled = true;
      // CloudBase onLoginStateChanged may not support unsubscribe;
      // the cancelled flag above prevents stale callbacks from updating state.
      try {
        unsubscribe();
      } catch {
        // Safely ignore - cancelled flag handles cleanup
      }
    };
  }, []);

  const adminCheck = useMemo(() => isAdmin(user), [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: adminCheck,
        loginWithGoogle: handleLoginWithGoogle,
        loginAnonymously: handleLoginAnonymously,
        loginWithEmail: handleLoginWithEmail,
        signUpWithEmailPassword: handleSignUpWithEmail,
        loginAsMock: handleLoginAsMock,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
