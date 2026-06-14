import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  auth,
  signInWithGoogle,
  signInAnonymously,
  signInWithEmail,
  verifyAndSignIn,
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
  // CloudBase v2+ User fields (id, user_metadata)
  openid?: string;
  unionid?: string;
  nickName?: string;
  avatarUrl?: string;
}

export type AuthUser = CloudbaseUser | MockUser;

/**
 * Check if the current user has admin privileges.
 */
const ADMIN_EMAILS = ['wangzouszz@gmail.com', 'wjunli1007@qq.com'];

export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  // Mock user check
  if ('isMock' in user && user.isMock) {
    return (user as MockUser).role === 'Developer';
  }
  // Real CloudBase user check
  return !!user.email && ADMIN_EMAILS.includes(user.email);
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ needsVerification?: boolean } | void>;
  verifyEmailAndLogin: (email: string, code: string, password: string) => Promise<void>;
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
  verifyEmailAndLogin: async () => {},
  loginAsMock: () => {},
  signOut: async () => {},
});

/**
 * Normalize a CloudBase user object to our AuthUser shape.
 *
 * Handles both v2 (uid, loginType) and v3 (id, is_anonymous, user_metadata) formats.
 */
function normalizeUser(raw: any): CloudbaseUser | null {
  if (!raw) return null;

  // v3 User type uses `id` and `is_anonymous`
  const uid = raw.uid || raw.id || raw._id || raw.openid || '';
  const isAnonymous = raw.is_anonymous === true
    || raw.loginType === 'ANONYMOUS'
    || raw.isAnonymous === true
    || false;

  // v3 user_metadata contains nickName, avatarUrl
  const meta = raw.user_metadata || {};
  const nickName = raw.nickName || meta.nickName || meta.name || raw.username || '';
  const avatarUrl = raw.avatarUrl || meta.avatarUrl || meta.picture || raw.photoURL || null;

  return {
    uid,
    displayName: nickName || raw.displayName || raw.email || 'Anonymous',
    email: raw.email || null,
    photoURL: avatarUrl,
    isAnonymous,
    loginType: raw.loginType || (isAnonymous ? 'ANONYMOUS' : 'EMAIL'),
    openid: raw.openid,
    unionid: raw.unionid,
    nickName: nickName || undefined,
    avatarUrl: avatarUrl || undefined,
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
    const result = await signInWithEmail(email, password);
    // If verification is needed, return the state to caller (LoginModal)
    if (result && typeof result === 'object' && 'needsVerification' in result) {
      return result;
    }
    const normalized = normalizeUser(result);
    if (normalized) setUser(normalized);
  }, []);

  const handleVerifyEmailAndLogin = useCallback(async (email: string, code: string, password: string) => {
    localStorage.removeItem('ts-mock-user');
    const rawUser = await verifyAndSignIn(email, code, password);
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
      setUser(null);
    }
  }, []);

  // --- Auth state listener & initialization ---
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

        // Otherwise, try to restore existing CloudBase session via getSession()
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
      try {
        unsubscribe();
      } catch {
        // cancelled flag handles cleanup
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
        verifyEmailAndLogin: handleVerifyEmailAndLogin,
        loginAsMock: handleLoginAsMock,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
