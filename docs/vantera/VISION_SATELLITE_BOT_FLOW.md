# זרימת לווין, Vision ובוט – שיפורי מהירות ומידע לבוט

**מסמך לאימות:** מה קיים, מה חסר, ואילו שיפורים נדרשים. פברואר 2026.

---

## 1. שיפורי מהירות

### 1.1 API
| פריט | סטטוס | המלצה |
|------|--------|--------|
| Parallel fetching ב-SuperAdmin | ✅ | `Promise.all` כבר משמש – 6 קריאות במקביל |
| Caching ל-Building (country, timezone) | ✅ | `getOrSetCache` ב-voneChatRoutes – 5 דקות (Redis או memory) |
| Vision pipeline – frame interval | 🔲 | כשמיושם – פריים כל 10–15 שניות (לא כל שנייה) |
| Index על VisionLog | ✅ | `(buildingId, timestamp)`, `(buildingId, resolved)` |

### 1.2 פרונט
| פריט | סטטוס | המלצה |
|------|--------|--------|
| Lazy loading (React.lazy) | ✅ | דפים נטענים לפי דרישה |
| V-One Widget – fetch רק כשפתוח | ✅ | `fetchStatus` רץ רק כש-`isOpen === true` (useEffect dependency) |
| Typing animation 25ms | ✅ | מהיר מספיק |

---

## 2. התנהלות לווין (Satellite)

### 2.1 מה קיים
| רכיב | מיקום | סטטוס |
|------|--------|--------|
| מפרט | VISION_SATELLITE_SPEC.md | ✅ |
| Building קואורדינטות | buildingModel.ts | ✅ – `lat`, `lng` קיימים |
| Satellite Hook | — | 🔲 Roadmap – Mapbox/Google Satellite API |
| Roof condition tracking | — | 🔲 Roadmap – Change Detection רבעוני |
| VisionLog schema | visionLogModel.ts | ✅ – eventType, confidence, thumbnailUrl |

### 2.2 מה חסר ללווין
- **RoofCondition** – מודל או שדה ל-VisionLog: `source: 'SATELLITE'`, `eventType: 'ROOF_DEGRADATION'`
- **Cron/Job** – רבעוני לשליפת תמונות ולהשוואה

---

## 3. מידע שצריך למסור לבוט (V-One)

### 3.1 מה הבוט מקבל כיום
| מקור | נתונים |
|------|--------|
| Building | `country`, `timezone` (cached 5 דקות) |
| voneContext | `buildVOneSystemContext({ country, timezone, lang, extended })` – הנחיות HOA/ILS, Fahrenheit/Celsius + extended context |
| User | דרך auth – `buildingId`, `sub` (userId) |
| User status | `GET /api/user/status` → `firstName`, `buildingName`, `pendingFeedbacks`, **openTicketsCount**, **emergencyDetected**, **recentVisionAlerts**, **moneySaved** |
| vone/chat extended | `openTicketsCount`, `emergencyDetected`, `recentVisionAlerts`, `moneySaved` – הופכים לתגובות contextual |
| VOneWidget | הצגת hints בפתיחה: חירום, כרטיסים פתוחים, התראות Vision, חסכון |

### 3.2 מה הבוט כבר מקבל (מיושם) + נשאר ל-Roadmap
| נתון | שימוש | סטטוס |
|------|--------|--------|
| **Open tickets count** | "יש לך 2 תקלות פתוחות" | ✅ userStatus + voneChat + VOneWidget |
| **Recent Vision anomalies** | "מצלמות ה-AI זיהו אירועים – פתחנו כרטיסים" | ✅ userStatus + voneChat + VOneWidget |
| **Building stats (moneySaved)** | "הבניין חסך X ש"ח" | ✅ userStatus + VOneWidget |
| **Emergency detected** | "קיים אירוע חירום בבניין" | ✅ userStatus + voneChat + VOneWidget |
| **Roof/Satellite status** | "הלווין מצא שינוי בגג" | 🔲 Roadmap – Satellite Hook |

### 3.3 Function Calling מתוכנן (V_ONE_IP_DOCUMENTATION)
- `getUserContext` – שם, בניין, notAtHome, awayUntil
- `getBuildingStatus` – Pulse, פתוח/סגור, Vision alerts
- `createMaintenanceTicket` – יצירת כרטיס מ-Vision anomaly

---

## 4. חיבור Vision → בוט

### 4.1 זרימה נוכחית
```
Vision AI מזהה אנומליה → saveAnomalyToVisionLog(anomaly) → VisionLog + Peacekeeper + ticket
```
- **visionService.processFrame** – Stub – מחכה ל-CV provider (YOLO/Rekognition)
- **visionService.saveAnomalyToVisionLog** – ✅ שמירה ל-VisionLog + Peacekeeper (30 יום) + יצירת ticket source: AI_VISION
- **הבוט מקבל** – userStatus, voneChat, VOneWidget מציגים recentVisionAlerts

### 4.2 זרימה (VISION_SATELLITE_SPEC Task 3) – מיושמת
```
Vision AI מזהה אנומליה
  → שמירה ל-VisionLog
  → AI Peacekeeper מחפש ticket קיים (building + location)
  → אם אין – יצירת ticket "System Generated" + badge "Visual Evidence"
  → הבוט יכול לדווח: "מצלמת החניה זיהתה נזילה – פתחנו כרטיס אוטומטי"
```

### 4.3 מידע לבוט – OpenAI Assistants (עתידי)
- **System message מורחב:** ✅ `buildVOneSystemContext` מקבל `extended` – openTicketsCount, emergencyDetected, recentVisionAlerts, moneySaved
- **Function `getBuildingVisionStatus`:** כשנחבר Assistants – systemContext כבר כולל את הנתונים
- **Function `getSatelliteStatus`:** Roadmap – roof condition (Satellite Hook)

---

## 5. סיכום פעולות

### הושלם
1. **Building** – `lat`, `lng` קיימים במודל
2. **visionService.saveAnomalyToVisionLog** – שמירה ל-VisionLog + Peacekeeper + ticket
3. **Alert → Ticket** – מיושם ב-saveAnomalyToVisionLog
4. **voneContext** – הרחבה עם `VOneExtendedContext` (openTickets, emergency, vision, moneySaved)
5. **V-One Widget** – fetchStatus רק כש-`isOpen === true` + הצגת hints בפתיחה
6. **Building cache** – getOrSetCache 5 דקות ב-voneChatRoutes
7. **userStatusRoute** – openTicketsCount, emergencyDetected, recentVisionAlerts, moneySaved
8. **voneChatRoutes** – extended context בתגובות fallback

### Roadmap
7. **visionService.processFrame** – חיבור ל-CV provider (YOLO/AWS Rekognition)
8. **Satellite Hook** – Mapbox/Google API + קואורדינטות
9. **OpenAI Assistants** – Function Calling עם getUserContext, getBuildingStatus, createMaintenanceTicket

---

*מסמך זה משלים את VISION_SATELLITE_SPEC, V_ONE_IP_DOCUMENTATION ו-IMPLEMENTATION_STATUS.*
