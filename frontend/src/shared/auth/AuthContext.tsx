import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getAuthToken, clearAuthToken } from '../api';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization: Organization;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateOrganization: (org: Organization) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5137/api';

    fetch(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          clearAuthToken();
          return null;
        }
        return response.json() as Promise<User>;
      })
      .then((data) => {
        if (data) {
          setUser(data);
        }
      })
      .catch(() => {
        clearAuthToken();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateOrganization = useCallback((org: Organization) => {
    setUser((prev) => prev ? { ...prev, organization: org } : null);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        updateOrganization,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
