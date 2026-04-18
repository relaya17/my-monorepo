# מפרט Push התראות – "הספק בלובי"

**מקור:** LAUNCH_STRATEGY §3

## תרחיש

> קבלן בלובי, דייר לא בבית → "הספק נמצא בלובי, האם לאפשר כניסה מרחוק?"

## זרימה

1. **קבלן** מזמין גישה (Magic Link / Tech flow) ומגיע ללובי.
2. **מערכת** מזהה שהקבלן במיקום הבניין (GPS).
3. **דייר** אינו בבית – המערכת שולחת התראה (Push / In-App).
4. **דייר** מאשר או דוחה – "האם לאפשר כניסה?".

## דרישות טכניות

| רכיב | סטטוס | הערות |
|------|--------|-------|
| **GPS/Proximity** | קיים | technicianAccessService, Magic Link |
| **דייר לא בבית** | להטמעה | זיהוי: דייר לא פתח אפליקציה X דקות / סטטוס "לא בבית" |
| **שירות Push** | להטמעה | FCM (Firebase), OneSignal, או Web Push API |
| **הודעה לדייר** | להטמעה | "הספק [שם] נמצא בלובי. לאפשר כניסה?" |
| **תגובה** | להטמעה | כפתור "אשר" / "דחה" – מפעיל/מבטל Digital Key |

## מיקום בקוד

| רכיב | קובץ | סטטוס |
|------|------|--------|
| שליחת Push | `apps/api/src/services/pushService.ts` | Stub – `sendPushToResidents`, `buildTechnicianInLobbyMessage` |
| לוגיקת קבלן הגיע | `apps/api/src/services/technicianAccessService.ts` | להוסיף קריאה ל־pushService |
| קבלת Push (לקוח) | `apps/web` – Service Worker / PWA | להטמיע Web Push או FCM SDK |

## הערות

- Web Push דורש Service Worker ו־VAPID keys.
- FCM/OneSignal מתאימים לאפליקציות React Native / PWA.
- נדרש מודל או flag ל־"דייר לא בבית" (אופציונלי – Manual או אוטומטי לפי חוסר פעילות).
