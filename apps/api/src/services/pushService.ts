/**
 * Push Notifications Service – "הספק בלובי"
 *
 * מפרט: docs/vantera/PUSH_NOTIFICATIONS_SPEC.md
 *
 * TODO: הטמעה מלאה
 * - FCM (Firebase Cloud Messaging) / OneSignal / Web Push API
 * - שמירת device tokens (מכשירי דיירים)
 * - שליחת התראה כש־קבלן מגיע ללובי: "הספק [שם] נמצא בלובי. לאפשר כניסה?"
 * - אינטגרציה עם technicianAccessService
 */

export interface PushPayload {
  /** מזהי דייר (למשל דירה או buildingId+apartmentNumber) */
  residentIds: string[];
  /** כותרת ההודעה */
  title: string;
  /** גוף ההודעה */
  body: string;
  /** נתונים נוספים (למשל technicianId, requestId) */
  data?: Record<string, string>;
}

/**
 * שולח Push לדיירים.
 * כרגע stub – מחזיר success בלי לשלוח בפועל.
 */
export async function sendPushToResidents(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  // TODO: חיבור ל־FCM/OneSignal – שליפת device tokens ממודל ResidentDevice,
  //       שליחת הבקשה, החזרת ספירת success/failure
  void payload;
  return { sent: 0, failed: 0 };
}

/**
 * בונה הודעת "הספק בלובי" לפי מפרט.
 */
export function buildTechnicianInLobbyMessage(technicianName: string, buildingName?: string): PushPayload['title'] {
  return buildingName
    ? `הספק ${technicianName} נמצא בלובי ב־${buildingName}. לאפשר כניסה?`
    : `הספק ${technicianName} נמצא בלובי. לאפשר כניסה?`;
}
