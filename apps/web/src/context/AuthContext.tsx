import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api';
import { safeGetItem, safeRemoveItem } from '../utils/safeStorage';

export type AuthUser = { id: string; name: string; email: string };
export type AuthAdmin = { username: string; role: string };

type AuthContextValue = {
  isUserLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  user: AuthUser | null;
  admin: AuthAdmin | null;
  buildingId: string;
  refreshAuth: () => void;
  logoutUser: () => void;
  logoutAdmin: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readAuthFromStorage(): {
  isUserLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  user: AuthUser | null;
  admin: AuthAdmin | null;
  buildingId: string;
} {
  if (typeof window === 'undefined') {
    return {
      isUserLoggedIn: false,
      isAdminLoggedIn: false,
      user: null,
      admin: null,
      buildingId: 'default'
    };
  }
  const userStr = safeGetItem('user');
  const adminUsername = safeGetItem('adminUsername');
  const adminRole = safeGetItem('adminRole');
  const userId = safeGetItem('userId');
  const userName = safeGetItem('userName');
  const userEmail = safeGetItem('userEmail');
  const buildingId = safeGetItem('buildingId')?.trim() || 'default';

  let user: AuthUser | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr) as AuthUser;
    } catch {
      if (userId && userName && userEmail) {
        user = { id: userId, name: userName, email: userEmail };
      }
    }
  }

  const admin: AuthAdmin | null =
    adminUsername && adminRole ? { username: adminUsername, role: adminRole } : null;

  return {
    isUserLoggedIn: safeGetItem('isUserLoggedIn') === 'true' && !!user,
    isAdminLoggedIn: safeGetItem('isAdminLoggedIn') === 'true' && !!admin,
    user,
    admin,
    buildingId
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState(readAuthFromStorage);

  const refreshAuth = useCallback(() => {
    setAuth(readAuthFromStorage);
  }, []);

  const logoutUser = useCallback(() => {
    safeRemoveItem('isUserLoggedIn');
    safeRemoveItem('userEmail');
    safeRemoveItem('userName');
    safeRemoveItem('userId');
    safeRemoveItem('user');
    safeRemoveItem('buildingId');
    safeRemoveItem(AUTH_TOKEN_KEY);
    safeRemoveItem(REFRESH_TOKEN_KEY);
    refreshAuth();
  }, [refreshAuth]);

  const logoutAdmin = useCallback(() => {
    safeRemoveItem('isAdminLoggedIn');
    safeRemoveItem('adminUsername');
    safeRemoveItem('adminRole');
    safeRemoveItem(AUTH_TOKEN_KEY);
    safeRemoveItem(REFRESH_TOKEN_KEY);
    refreshAuth();
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...auth,
      refreshAuth,
      logoutUser,
      logoutAdmin
    }),
    [auth, refreshAuth, logoutUser, logoutAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    const fallback = readAuthFromStorage();
    return {
      ...fallback,
      refreshAuth: () => {},
      logoutUser: () => {},
      logoutAdmin: () => {}
    };
  }
  return ctx;
}
