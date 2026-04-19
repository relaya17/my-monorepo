# Database Schema Approval – אישור מבנה בסיס הנתונים

**מטרה:** מסמך זה מוגש לאישור המנכ"לית לפני שהבינה/צוות מתחילים ליישם שינויים ב-DB.  
**מצב:** MongoDB. כל טבלה רגישה (tenant) כוללת `buildingId` עם אינדקס. איסור מחיקה קשיחה – שימוש ב-soft delete היכן שנדרש.  
**סכמה מלאה (Building, Ticket, VisionLog, Ledger + הערות CTO):** [HSLL_DATABASE_SCHEMA.md](HSLL_DATABASE_SCHEMA.md).

---

## 1. טבלאות קיימות (לא לשנות ללא אישור)

| Collection | Purpose | Key indexes |
|------------|---------|-------------|
| **users** | דיירים, ועד, טכנאים. | `buildingId`, `email` (unique per building) |
| **admins** | התחברות מנכ"לית (Super Admin). | `email` (unique) |
| **buildings** | מבני מגורים. | `_id`, address |
| **maintenance** | כרטיסי תקלה. | `buildingId`, status, createdAt |
| **payments** | תשלומי דיירים. | `buildingId`, userId |
| **transactions** | הכנסות/הוצאות לרישום כספי. | `buildingId`, type, createdAt |
| **buildingstats** | מדדי השפעה (חיסכון, תקלות נמנעו) – **ללא tenant scope** באגרגציה. | `buildingId` (unique) |
| **auditlogs** | רישום פעולות לשינוי נתונים. | `buildingId`, timestamp |
| **inventory** | מלאי per building. | `buildingId` |
| **technician tokens** | Magic link לטכנאים. | token (unique), expiry |
| **visionlogs** | לוגי AI Vision (FLOOD_DETECTION, OBSTRUCTION, UNAUTHORIZED_ENTRY). | `buildingId`, `(buildingId, timestamp)` |

---

## 2. טבלה חדשה מאושרת: אירועים מאוחדים (HSLL_Event)

**ייעוד:** ה"מוח" המרכזי – כל אירוע (מצלמה, לוויין, דיווח דייר, חיישן) עובר כאן לפני הפיכה לתקלה. תואם ל-`HSLL_Event` ב-`packages/shared`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✓ | מזהה |
| `buildingId` | string | ✓ | **חובה.** אינדקס. |
| `type` | enum | ✓ | `AI_VISION` \| `SATELLITE` \| `RESIDENT_REPORT` \| `IOT_SENSOR` |
| `severity` | number | ✓ | 1–5 (חושב על ידי AI) |
| `evidence` | object | ✓ | `{ imageUrl?, voiceNoteUrl?, description }` |
| `financialImpact` | object | ✓ | `{ potentialLoss, moneySaved }` (מספרים) |
| `status` | enum | ✓ | `Detected` \| `Verified` \| `In_Repair` \| `Resolved` |
| `maintenanceId` | ObjectId ref | | קישור לתקלה (אם נוצרה) |
| `createdAt` | Date | ✓ | |
| `updatedAt` | Date | ✓ | |

**Indexes:** `buildingId`, `(buildingId, status)`, `(buildingId, type)`, `createdAt`.

---

## 3. שדות מוצעים לתוספת (אופציונלי – באישור)

| Collection | שדה מוצע | תיאור |
|------------|-----------|--------|
| **maintenance** | `eventId` | קישור ל-HSLL_Event אם התקלה נוצרה מאירוע (מצלמה/לוויין). |
| **maintenance** | `voiceSummaryJson` | JSON שמופק מ-Whisper (status, partsUsed, followUpNeeded, ceoAlert). |
| **buildingstats** | כבר תומך ב-`moneySavedByAI`, `preventedFailuresCount`, `residentHappinessScore` – ללא שינוי. |

---

## 4. כללי אבטחה (לא לשנות)

- כל שאילתה על אוספים עם `buildingId` עוברת דרך **tenant middleware** ו-**multiTenancy plugin** – סינון אוטומטי לפי `buildingId` מההקשר.
- אוספים **ציבוריים** (רק אגרגציה ללא PII): נתונים נמשכים מ-**BuildingStats** בלבד ל-API הציבורי.

---

## 5. אישור

- [ ] **מאשר/ת** את מבנה הטבלאות הקיים והשימוש ב-`buildingId` בכל אוסף tenant.
- [ ] **מאשר/ת** הוספת אוסף **HSLL_Event** (ומודל/ממשק בתוך API + shared) כמתואר בסעיף 2.
- [ ] **מאשר/ת** (או דוחה) תוספת השדות האופציונליים בסעיף 3.

**חתימה / תאריך:** ________________  

לאחר אישור – מסמך זה משמש את הבינה/מתכנת כרפרנס ליצירת המודלים והאינדקסים.
