/**
 * CEO / Super-Admin Slice — v3.0
 * Global security statistics and recent critical events across all buildings.
 * Populated via GET /api/super-admin/global-security-pulse.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GlobalSecurityStats {
  totalEvents: number;
  unrecognizedStrangers: number;
  childrenArrivals: number;
  criticalAlerts: number;
}

export interface CriticalEvent {
  id: string;
  buildingName: string;
  buildingId: string;
  floor: number;
  floorLabel?: string;
  type: string;
  securityLevel: string;
  cameraId: string;
  timestamp: string;
  resolved: boolean;
}

interface CeoState {
  stats: GlobalSecurityStats;
  recentCriticalEvents: CriticalEvent[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

const initialState: CeoState = {
  stats: {
    totalEvents: 0,
    unrecognizedStrangers: 0,
    childrenArrivals: 0,
    criticalAlerts: 0,
  },
  recentCriticalEvents: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
};

const ceoSlice = createSlice({
  name: 'ceo',
  initialState,
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setGlobalStats(state, action: PayloadAction<GlobalSecurityStats>) {
      state.stats = action.payload;
      state.loading = false;
      state.lastFetchedAt = new Date().toISOString();
    },
    addCriticalEvent(state, action: PayloadAction<CriticalEvent>) {
      state.recentCriticalEvents.unshift(action.payload);
      // Keep at most 100 events in memory
      if (state.recentCriticalEvents.length > 100) {
        state.recentCriticalEvents.pop();
      }
      state.stats.criticalAlerts += 1;
      state.stats.totalEvents += 1;
    },
    setCriticalEvents(state, action: PayloadAction<CriticalEvent[]>) {
      state.recentCriticalEvents = action.payload;
    },
  },
});

export const { fetchStart, fetchError, setGlobalStats, addCriticalEvent, setCriticalEvents } = ceoSlice.actions;
export default ceoSlice.reducer;
