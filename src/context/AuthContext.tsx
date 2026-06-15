import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Simple admin password (change this to your own)
const ADMIN_PASSWORD = 'tsync2026';

interface AuthContextType {
  isAdmin: boolean;
  toggleAdmin: (password?: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  toggleAdmin: () => false,
  loading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('ts-admin') === 'true';
    } catch {
      return false;
    }
  });

  const toggleAdmin = useCallback((password?: string): boolean => {
    if (isAdmin) {
      // Logout admin
      setIsAdmin(false);
      localStorage.removeItem('ts-admin');
      return true;
    }
    // Verify password
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('ts-admin', 'true');
      return true;
    }
    return false;
  }, [isAdmin]);

  const adminCheck = useMemo(() => isAdmin, [isAdmin]);

  return (
    <AuthContext.Provider
      value={{
        isAdmin: adminCheck,
        toggleAdmin,
        loading: false, // No async auth needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);