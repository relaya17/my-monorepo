/**
 * Vision Alert Slice — v3.0
 * Manages real-time security alerts received via polling / Socket.io.
 * Mirrors SecurityLevel enum from the backend model (no any, fully typed).
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type VisionAlertType = 'child' | 'resident' | 'stranger' | 'flood' | 'obstruction' | 'loitering' | 'package';
export type VisionSecurityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface VisionAlert {
  id: string;
  /** Mongo _id of the VisionLog document */
  visionLogId: string;
  floor: number;
  floorLabel?: string;
  type: VisionAlertType;
  securityLevel: VisionSecurityLevel;
  cameraId: string;
  buildingId: string;
  reason: string;
  timestamp: string;
  thumbnailUrl?: string;
  resolved: boolean;
}

interface VisionState {
  /** All active (unresolved) alerts for this session */
  activeAlerts: VisionAlert[];
  /** Most recent alert — drives the popup widget */
  lastAlert: VisionAlert | null;
  /** Total count of incoming alerts this session (for badge) */
  sessionCount: number;
}

const initialState: VisionState = {
  activeAlerts: [],
  lastAlert: null,
  sessionCount: 0,
};

const visionSlice = createSlice({
  name: 'vision',
  initialState,
  reducers: {
    /** Push a new alert from the server to the top of the queue */
    addAlert(state, action: PayloadAction<VisionAlert>) {
      state.activeAlerts.unshift(action.payload);
      state.lastAlert = action.payload;
      state.sessionCount += 1;
    },
    /** Mark an alert as resolved — removes from active list */
    resolveAlert(state, action: PayloadAction<string>) {
      state.activeAlerts = state.activeAlerts.filter((a) => a.id !== action.payload);
      if (state.lastAlert?.id === action.payload) {
        state.lastAlert = state.activeAlerts[0] ?? null;
      }
    },
    /** Dismiss the popup without resolving the underlying alert */
    dismissLastAlert(state) {
      state.lastAlert = null;
    },
    /** Bulk-load active alerts from server (initial fetch) */
    setAlerts(state, action: PayloadAction<VisionAlert[]>) {
      state.activeAlerts = action.payload;
      state.lastAlert = action.payload[0] ?? null;
    },
    /** Reset session counter (e.g. on logout) */
    resetSession(state) {
      state.activeAlerts = [];
      state.lastAlert = null;
      state.sessionCount = 0;
    },
  },
});

export const { addAlert, resolveAlert, dismissLastAlert, setAlerts, resetSession } = visionSlice.actions;
export default visionSlice.reducer;
