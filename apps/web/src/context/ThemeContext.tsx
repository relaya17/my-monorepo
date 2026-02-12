/**
 * ThemeContext – applies White-Label branding from Building.branding.
 * When buildingId changes, fetches branding and applies CSS variables.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBuildingId } from '../api';
import { useAuth } from './AuthContext';
import { applyBranding, type TenantBranding } from '../config/themeEngine';
import { apiRequestJson } from '../api';

type ThemeState = {
  branding: TenantBranding | null;
  loading: boolean;
};

const ThemeContext = createContext<ThemeState>({ branding: null, loading: false });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>({ branding: null, loading: false });
  const auth = useAuth();
  const buildingId = auth?.buildingId ?? getBuildingId();

  useEffect(() => {
    if (!buildingId || buildingId === 'default') {
      applyBranding(null);
      setState({ branding: null, loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    apiRequestJson<{ branding?: TenantBranding }>(`buildings/branding?buildingId=${encodeURIComponent(buildingId)}`)
      .then(({ data }) => {
        const branding = data?.branding ?? null;
        applyBranding(branding);
        setState({ branding, loading: false });
      })
      .catch(() => {
        applyBranding(null);
        setState({ branding: null, loading: false });
      });
  }, [buildingId]);

  return <ThemeContext.Provider value={state}>{children}</ThemeContext.Provider>;
}
