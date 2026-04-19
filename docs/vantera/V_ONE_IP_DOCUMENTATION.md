# V-One IP Documentation – הקניין הרוחני של ה-AI

**מסמך למשקיעים ולמבצעי Due Diligence:** איך המערכת מנתחת תקלות, מבצעת Triage ומשתמשת ב-Prompt Engineering ייחודי.

---

## 1. סקירה כללית

V-One הוא לא "צינור" ל-OpenAI. הוא מנוע AI ייעודי לניהול בניינים, שמשלב:

- **Context-Aware Chat** – מותאם לאזור גיאוגרפי, שפה ומטבע
- **AI Peacekeeper** – מניעת כרטיסים כפולים (Triage)
- **Predictive Maintenance AI** – חיזוי תקלות מבוסס דפוסים
- **Keywords & Escalation Logic** – ללא תלות ב-API חיצוני כגיבוי

---

## 2. ניתוח תקלות (Fault Analysis)

### 2.1 מקורות התקלות

| Source | תיאור |
|--------|-------|
| `RESIDENT` | דיווח ידני של דייר |
| `AI_VISION` | זיהוי מצלמות – FLOOD_DETECTION, OBSTRUCTION, UNAUTHORIZED_ENTRY |
| `SATELLITE` | ניטור גגות ותשתיות לוויין |
| `IOT_SENSOR` | חיישנים (מתוכנן) |

### 2.2 שדות ניתוח AI

במודל `Maintenance`:

```ts
aiAnalysis: {
  similarityHash: string,   // For Peacekeeper – deduplication
  urgencyScore?: number,    // 1–10
  detectedAnomaly?: string  // תיאור החריגה שמצא ה-AI
}
```

- **similarityHash:** hash סמנטי של התיאור – לשימוש במנוע הדדופליקציה (Peacekeeper)
- **urgencyScore:** רמת דחיפות (עתיד – כרגע לא ממומש)
- **detectedAnomaly:** אם התקלה הגיעה מ-AI Vision – מה זוהה

---

## 3. Triage – מנוע Peacekeeper (מניעת כפילויות)

**מיקום:** `apps/api/src/routes/maintenanceRoutes.ts`

### 3.1 אלגוריתם

1. **נורמליזציה:** המרת התיאור ל־lowercase, הסרת רווחים מיותרים
2. **Hash:** `SHA256(normalized).slice(0, 24)` – `similarityHash`
3. **בדיקה:** חפש בתקלות **פתוחות** ב־30 הימים האחרונים:
   - תואם `similarityHash` → **409 Conflict** + `existingId`
   - אם אין התאמה – חפש תקלה **באותה קטגוריה** באותו חלון זמן
4. **תגובה:** אם נמצא דופליקציה – `recordDuplicatePrevented()` ל־stats, והחזרת 409 ללקוח

### 3.2 ערך עסקי

- מניעת ~95% מכרטיסי תחזוקה כפולים (לפי Pitch Deck)
- הפחתת עומס על קבלנים וצוות ניהול
- חיסכון בזמן ובכסף

---

## 4. Prompt Engineering ייחודי

### 4.1 System Context (buildVOneSystemContext)

**מיקום:** `apps/api/src/utils/voneContext.ts`

| פרמטר | ארה"ב | ישראל |
|-------|-------|-------|
| טרמינולוגיה | HOA | ועד בית |
| מטבע | USD | ILS |
| טמפרטורה | Fahrenheit | Celsius |
| לחץ מים | PSI | bar |
| כתובות | Zip 12345 / 12345-6789 | — |
| רב־לשוניות | Spanish (Miami) | — |

המערכת בונה system prompt לפי:
- `country`, `timezone`, `lang`
- `extended` (VOneExtendedContext): openTicketsCount, emergencyDetected, recentVisionAlerts, moneySaved – מוזרם מ־userStatus ו־voneChat
- הכללים מוזרקים כ-system message כשיש חיבור OpenAI Assistants (מתוכנן)

### 4.2 Keywords Fallback (ללא OpenAI)

**מיקום:** `apps/api/src/routes/voneChatRoutes.ts`

כש־`OPENAI_API_KEY` חסר, המערכת מגיבה לפי מילות מפתח:

- **דיווח תקלה:** `תקלה|נזיל|נזילה|חשמל|מעלית|דווח` (עברית)  
  `fault|leak|electrical|elevator|report|repair` (אנגלית)
- **חשבון/תשלום:** `חשבון|תשלום|כסף` / `account|payment|balance`
- **מידע כללי:** "אני V-One, העוזר האישי שלך..."

### 4.3 Web Speech API (קול)

- **קלט:** Speech-to-Text – מילות מפתח נבדקות על תמליל הקול
- **פלט:** Text-to-Speech להקראת תשובות V-One
- ראה: `VOneWidget.tsx` – `voiceTranscript`, `handleQuickReply`

---

## 5. Predictive Maintenance AI

**מיקום:** `apps/api/src/services/maintenanceAiService.ts`

### 5.1 ניתוח דפוסים (analyzeMaintenancePatterns)

- סריקת תקלות סגורות (`status: Closed`)
- ספירת קטגוריות
- אם קטגוריה מופיעה >3 פעמים → **PatternInsight** עם חיזוי: "ה-AI חוזה השבתה מלאה תוך 30 יום"

### 5.2 חיזוי (runPredictiveMaintenanceAI)

- תקלות ב־3 החודשים האחרונים
- חישוב `count` ו־`totalCost` לפי קטגוריה
- אם `count > 3` → **PredictiveWarning** עם:
  - "סיכוי של 85% לכשל מערכתי בחודש הקרוב"
  - המלצה: "החלפת תשתית במקום תיקון קוסמטי"

---

## 6. סיכום – מה הופך את V-One ל-Core IP

| רכיב | תיאור |
|------|-------|
| **Context per Region** | HOA vs ועד, Fahrenheit vs Celsius, USD vs ILS |
| **Keywords Escalation** | עבודה גם בלי OpenAI – fallback חכם |
| **Peacekeeper** | similarityHash + duplicate detection → חיסכון משמעותי |
| **Predictive AI** | דפוסים + cost analysis → חיזוי כשלים |
| **Voice** | Speech-to-Text + Text-to-Speech מלאים |
| **Future** | OpenAI Assistants + Function Calling (getUserContext, getBuildingStatus, createMaintenanceTicket) |

**הערך:** הפרדה ברורה מכל בוט Chat Genric – לוגיקה ייעודית לניהול בניינים, תחזוקה וטריאז'.
