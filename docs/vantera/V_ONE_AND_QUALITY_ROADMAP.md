# V-One & Quality Control – Roadmap למען לא תשכח

**מסמך מעקב לפיצ'רים שטרם הוטמעו**

---

## 1. 🎤 דיבור (Voice)

| פריט | תיאור | סטטוס |
|------|-------|-------|
| **Web Speech API** | קלט דיבור (Speech-to-Text) – לחיצה על מיקרופון והקלטה | ✅ הוטמע |
| **SpeechSynthesis** | Text-to-Speech – כפתור "השמע" להקראת הודעות V-One | ✅ הוטמע |
| **ElevenLabs** | קולות מציאותיים (אופציונלי) | ⏳ מתוכנן |

---

## 2. 📊 Sentiment Analysis (ניתוח רגשות)

| פריט | תיאור | סטטוס |
|------|-------|-------|
| **טקסט** | ניתוח רגשות על טקסט המשוב (מילות מפתח) – sentimentScore ב-MaintenanceFeedback | ✅ הוטמע |
| **קול** | ניתוח רגשות על הודעת קול | ⏳ מתוכנן |

---

## 3. 📉 Vendor Score (ציון קבלן)

| פריט | תיאור | סטטוס |
|------|-------|-------|
| **ציון צבור** | GET /api/vendors/scores – ציון ממוצע לכל קבלן | ✅ הוטמע |
| **התראה** | GET /api/vendors/alerts – קבלנים מתחת ל-4.2 | ✅ הוטמע |
| **Transparency Ledger** | חיבור ל-Dashboard | ⏳ מתוכנן |

---

## 4. 🤖 OpenAI Assistants (צ'אט חכם)

| פריט | תיאור | סטטוס |
|------|-------|-------|
| **מבנה צ'אט** | POST /api/vone/chat – קלט הודעה, תשובה מבוססת מילות מפתח (ללא OpenAI) | ✅ הוטמע |
| **Function Calling** | חיבור OpenAI Assistants עם OPENAI_API_KEY | ⏳ מתוכנן |
| **Functions** | getUserContext, getBuildingStatus, createMaintenanceTicket | ⏳ מתוכנן |

---

## 5. 📝 דף דיווח תקלה (Fault Report)

| פריט | תיאור | סטטוס |
|------|-------|-------|
| **טופס ייעודי** | /report-fault – קטגוריה, תיאור, דחיפות, שליחה ל-maintenance | ✅ הוטמע |
| **חיבור V-One** | Quick Reply "דווח על תקלה חדשה" → /report-fault | ✅ הוטמע |

---

*מסמך זה מתעדכן בעת התקדמות.*
