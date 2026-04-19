/**
 * NotificationService — proactive resident notifications.
 *
 * Current: broadcasts via Socket.io to building/floor rooms (non-fatal if io not ready).
 * Roadmap: push notifications (FCM/APNs), SMS, in-app inbox.
 */

export interface INotificationPayload {
  buildingId: string;
  floor: number;
  message: { he: string; en: string };
  type: 'security' | 'maintenance' | 'community' | 'emergency';
  /** Optional: restrict to a specific floor — omit to broadcast to all floors */
  targetFloor?: number;
}

type IoInstance = {
  to: (room: string) => { emit: (event: string, data: unknown) => void };
};

function getIo(): IoInstance | null {
  return (globalThis as { __io?: IoInstance }).__io ?? null;
}

/**
 * Notify all residents on a specific floor (and building-wide room).
 * Emits 'vone_update' event — VOneVisionWidget listens on the frontend.
 */
export function notifyFloorResidents(payload: INotificationPayload): void {
  try {
    const io = getIo();
    if (!io) return;

    const data = {
      text: payload.message.he,
      textEn: payload.message.en,
      type: payload.type,
      floor: payload.floor,
      timestamp: new Date().toISOString(),
    };

    // Emit to specific floor room
    io.to(`building_${payload.buildingId}_floor_${payload.floor}`).emit('vone_update', data);
    // Emit to building-wide room (managers, super-admin listeners)
    io.to(`building_${payload.buildingId}`).emit('vone_update', data);
  } catch {
    /* non-fatal — notification failure must never break the main flow */
  }
}

/**
 * Notify all residents in a building (no floor filter).
 */
export function notifyBuilding(
  buildingId: string,
  message: { he: string; en: string },
  type: INotificationPayload['type'] = 'community'
): void {
  try {
    const io = getIo();
    if (!io) return;

    io.to(`building_${buildingId}`).emit('vone_update', {
      text: message.he,
      textEn: message.en,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}
