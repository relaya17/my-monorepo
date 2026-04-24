import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'shared';
import { getMe, login, logout, type LoginPayload } from '../services/auth';
import { getAccessToken } from '../services/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (payload: LoginPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await getMe();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    getAccessToken().then((token) => {
      if (token) {
        refreshUser();
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });
  }, [refreshUser]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    setState((s) => ({ ...s, isLoading: true }));
    await login(payload);
    await refreshUser();
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    await logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
