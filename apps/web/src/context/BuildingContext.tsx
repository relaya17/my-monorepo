import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequestJson } from '../api';

export type BuildingPulse = {
  water?: string;
  electricity?: string;
  elevators?: string;
  cleaner?: string;
  cameras?: string;
};

export type BuildingFeedItem = {
  id: string;
  title: string;
  body?: string;
  type: string;
  createdAt?: string;
};

export type BuildingContextValue = {
  buildingId: string;
  buildingName: string;
  pulse: BuildingPulse | null;
  feed: BuildingFeedItem[];
  emergencyDetected: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const defaultPulse: BuildingPulse = {
  water: 'תקין',
  electricity: 'תקין',
  elevators: 'פעיל',
  cleaner: '—',
};

const BuildingContext = createContext<BuildingContextValue | null>(null);

type DashboardResponse = {
  buildingId?: string;
  buildingName?: string;
  pulse?: BuildingPulse;
  feed?: BuildingFeedItem[];
  emergencyDetected?: boolean;
};

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const { isUserLoggedIn, buildingId: authBuildingId } = useAuth();
  const [buildingName, setBuildingName] = useState('');
  const [pulse, setPulse] = useState<BuildingPulse | null>(null);
  const [feed, setFeed] = useState<BuildingFeedItem[]>([]);
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildingId = (authBuildingId ?? '').trim() || 'default';
  const shouldFetch = isUserLoggedIn && buildingId && buildingId !== 'default';

  const fetchDashboard = useCallback(async () => {
    if (!shouldFetch) {
      setBuildingName('');
      setPulse(null);
      setFeed([]);
      setEmergencyDetected(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { response, data } = await apiRequestJson<DashboardResponse>('residents/dashboard');
      if (!response.ok) {
        setError('שגיאה בטעינת נתוני הבניין');
        setBuildingName(buildingId);
        setPulse(defaultPulse);
        setFeed([]);
        setEmergencyDetected(false);
        return;
      }
      setBuildingName(data?.buildingName ?? buildingId);
      setPulse(data?.pulse ?? defaultPulse);
      setFeed(Array.isArray(data?.feed) ? data.feed : []);
      setEmergencyDetected(Boolean(data?.emergencyDetected));
    } catch {
      setError('שגיאה בחיבור לשרת');
      setBuildingName(buildingId);
      setPulse(defaultPulse);
      setFeed([]);
      setEmergencyDetected(false);
    } finally {
      setLoading(false);
    }
  }, [shouldFetch, buildingId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const value = useMemo<BuildingContextValue>(
    () => ({
      buildingId,
      buildingName: buildingName || buildingId,
      pulse,
      feed,
      emergencyDetected,
      loading,
      error,
      refresh: fetchDashboard,
    }),
    [buildingId, buildingName, pulse, feed, emergencyDetected, loading, error, fetchDashboard]
  );

  return <BuildingContext.Provider value={value}>{children}</BuildingContext.Provider>;
}

export function useBuilding(): BuildingContextValue {
  const ctx = useContext(BuildingContext);
  const auth = useAuth();
  const buildingId = (auth.buildingId ?? '').trim() || 'default';
  if (!ctx) {
    return {
      buildingId,
      buildingName: buildingId,
      pulse: null,
      feed: [],
      emergencyDetected: false,
      loading: false,
      error: null,
      refresh: () => {},
    };
  }
  return ctx;
}
