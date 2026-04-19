# 📋 רשימת בקשות שטרם יושמו — Consolidated

**מסמך מאוחד של כל הבקשות מהמפרטים הטכניים. עודכן: פברואר 2026**

---

## 🚨 דחוף (First Week Sprint)

| # | משימה | מקור | מיקום |
|---|--------|------|--------|
| 1 | **Anomaly Feed UI** – הצגת רשימת VisionLog עם thumbnail בדאשבורד המנכ"לית | FIRST_WEEK_SPRINT | ✅ SuperAdminDashboard |
| 2 | **Global Ledger** – דוח תנועות כסף לכל בניין (Transaction/Ledger) | FIRST_WEEK_SPRINT | ✅ super-admin routes + UI |
| 3 | **CEO Verification Checklist** – ריצה על CEO_VERIFICATION_CHECKLIST (4 מוקדים) | FIRST_WEEK_SPRINT | ✅ כרטיס בדאשבורד |
| 4 | **צ'קליסט לפני עלייה** – SSL, טשטוש פנים, נחיתה < 2s | FIRST_WEEK_SPRINT | ✅ כרטיס CEO |
| 5 | **עדכון VERIFICATION_CHECKLIST** – קישורים למסמכים החדשים | FIRST_WEEK_SPRINT | ✅ |

---

## 🔌 API & תשתית (Technical Next Tasks)

| # | משימה | מקור | תיאור |
|---|--------|------|--------|
| 6 | **Webhooks Gateway** | TECHNICAL_NEXT_TASKS | ✅ תשתית: WebhookSubscription, subscribe/list, webhookService, emitWebhookEvent |
| 7 | **Onboarding <60 שניות** | TECHNICAL_NEXT_TASKS | טופס מינימלי → Stripe $3 → גישה מיידית לפיד. מדידת זמן start→feed |

---

## 🤖 V-One & Quality (V_ONE_AND_QUALITY_ROADMAP)

| # | משימה | סטטוס | תיאור |
|---|--------|--------|--------|
| 8 | **ElevenLabs** | ⏳ מתוכנן | קולות מציאותיים (אופציונלי) |
| 9 | **ניתוח רגשות על קול** | ⏳ מתוכנן | Sentiment analysis על הודעת קול |
| 10 | **Transparency Ledger ל-Dashboard** | ✅ | חיבור ציון קבלן לדאשבורד – vendor-alerts |
| 11 | **OpenAI Assistants** | ⏳ מתוכנן | Function Calling + getUserContext, getBuildingStatus, createMaintenanceTicket |

---

## 📹 Vision & Satellite (VISION_SATELLITE_SPEC)

| # | משימה | סטטוס | תיאור |
|---|--------|--------|--------|
| 12 | **Vision Pipeline** | ✅ Stub | visionService.ts – processFrame, startStreamListener (TODO: CV provider) |
| 13 | **Satellite Hook** | 🔲 Roadmap | Mapbox/Google Satellite, quarterly roof condition tracking |
| 14 | **Alert → AI Peacekeeper** | ✅ | visionService.saveAnomalyToVisionLog – VisionLog + Peacekeeper (30d) + ticket source: AI_VISION |
| 15 | **Landing Visual Evidence** | ✅ | Mockup: מצלמה יבשה vs AI מסמן נזילה בריבוע אדום |

---

## 🛡️ פעולות נדרשות (README)

| # | משימה | עדיפות | תיאור |
|---|--------|--------|--------|
| 16 | **קובץ .env** | דחוף | ✅ .env.example מסונכרן + הפניה ל-SECURITY |
| 17 | **תלויות חסרות** | דחוף | ✅ express-rate-limit, helmet בפרויקט |
| 18 | **תיקיית logs** | דחוף | ✅ apps/api/logs/.gitkeep |
| 19 | **סיסמות ברירת מחדל** | חשוב | שינוי כל הסיסמות |
| 20 | **HTTPS בפרודקשן** | חשוב | הגדרת SSL |
| 21 | **גיבויים אוטומטיים** | חשוב | הגדרת schedule |
| 22 | **2FA** | מומלץ | Two-Factor Authentication |
| 23 | **Automated Testing** | ✅ התחלה | vitest ב-API, voneContext.test.ts (4 tests) |
| 24 | **CI/CD Pipeline** | מומלץ | GitHub Actions מלא |
| 25 | **Performance Monitoring** | מומלץ | ניטור ביצועים מתקדם |

---

## 📲 Push Notifications (PUSH_NOTIFICATIONS_SPEC)

| # | משימה | תיאור |
|---|--------|--------|
| 26 | **"דייר לא בבית"** | ✅ User.notAtHome, User.awayUntil |

---

---

## 💎 Due Diligence Kit (פברואר 2026)

| # | משימה | סטטוס | מיקום |
|---|--------|--------|--------|
| 27 | **DUE_DILIGENCE_KIT.md** | ✅ | הנחיה לטכנאי – 4 עמודים: Core IP, White-Label, Data Sovereignty, Compliance |
| 28 | **V_ONE_IP_DOCUMENTATION.md** | ✅ | תיעוד V-One: Fault Analysis, Triage, Peacekeeper, Prompt Engineering |
| 29 | **COMPLIANCE_CHECKLIST.md** | ✅ | GDPR, SOC2, Pen Test – טבלת סטטוס |
| 30 | **Technical One-Pager** | ✅ | סקשן בדף Insights – 4 pillars + 3 acquisition options |
| 31 | **Theme Engine** | ✅ | Building.branding, GET /api/buildings/branding, ThemeProvider, CSS vars |
| 32 | **README + API Documentation** | ✅ | README מעודכן (ארכיטקטורה, הרצה, env). docs/vantera/API_DOCUMENTATION.md – תיעוד מלא לכל endpoints. |

---

## 📊 סיכום לפי עדיפות

| קטגוריה | כמות |
|----------|-------|
| First Week Sprint | 5 |
| Technical Next Tasks | 2 |
| V-One & Quality | 4 |
| Vision & Satellite | 4 |
| README פעולות | 10 |
| Push Notifications | 1 |
| **סה״כ** | **26** |

---

*מסמך זה נוצר מאיחוד docs/FIRST_WEEK_SPRINT, TECHNICAL_NEXT_TASKS, V_ONE_AND_QUALITY_ROADMAP, VISION_SATELLITE_SPEC, README.md*
