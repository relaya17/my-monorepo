# First Week Sprint – רשימת משימות לשבוע הראשון

**מטרה:** ליישם את ה-Master Blueprint במצב הקוד הנוכחי (Express, Vite/React) – בלי מיגרציה ל-NestJS/Next.js עד לאישור.

---

## יום 1–2: תשתית ונתונים

| # | משימה | מקום | סטטוס |
|---|--------|------|--------|
| 1 | וידוא שכל משתני env מתועדים ב-.env.example ותואמים ל-env.ts | apps/api/.env.example | ✅ מסונכרן |
| 2 | וידוא ש-BuildingStats ו-publicRoutes תואמים (שמות שדות) | publicRoutes.ts, buildingStatsModel | ✅ |
| 3 | מודל VisionLog קיים; תמיכה ב-Maintenance (source, aiAnalysis, evidence, technicianReport) | visionLogModel, maintenanceModel | ✅ שדות אופציונליים נוספו |
| 4 | הודעת כפילות תקלה: "נמצאה תקלה דומה. האם תרצי להתחבר אליה או לפתוח חדשה?" | maintenanceRoutes.ts | ✅ |
| 5 | פרונט: טיפול ב-409 + existingId – הצגת קישור "התחבר לתקלה קיימת" | MaintenanceManagement – Alert + קישור לרשימה + מזהה תקלה | ✅ |

---

## יום 3: AI Peacekeeper (דמיון סמנטי)

| # | משימה | מקום | סטטוס |
|---|--------|------|--------|
| 6 | לפני שמירת ticket: חישוב similarity (hash או OpenAI embeddings) מול תקלות Open ב-30 ימים | maintenance service / route | ✅ hash + 30 יום |
| 7 | אם דמיון > 0.85 – 409 + existingId (כבר קיים במבנה) | maintenanceRoutes | ✅ |
| 8 | שמירת similarityHash ב-ticket חדש (לשימוש עתידי) | maintenanceModel.aiAnalysis | ✅ בעת יצירת ticket |

---

## יום 4: דאשבורד מנכ"לית

| # | משימה | מקום | סטטוס |
|---|--------|------|--------|
| 9 | Pulse: קאונטר "כסף שנחסך" חי – נתונים מ-BuildingStats/aggregate | GET /api/super-admin/global-stats (totalMoneySaved, preventedFailures) | ✅ endpoint מוכן |
| 10 | Anomaly Feed: רשימת VisionLog עם thumbnail | GET /api/super-admin/vision-logs | ✅ endpoint מוכן; UI בדאשבורד 🔲 |
| 11 | Global Ledger: דוח תנועות כסף לכל בניין (Transaction/Ledger) | super-admin routes + UI | 🔲 |

---

## יום 5: אימות וסגירה

| # | משימה | מקום | סטטוס |
|---|--------|------|--------|
| 12 | ריצה על CEO_VERIFICATION_CHECKLIST (ארבעת המוקדים) | docs/CEO_VERIFICATION_CHECKLIST.md | 🔲 |
| 13 | צ'קליסט לפני עלייה: SSL, טשטוש פנים, נחיתה < 2s | CEO_VERIFICATION_CHECKLIST | 🔲 |
| 14 | עדכון VERIFICATION_CHECKLIST (טכנאי) עם קישורים למסמכים החדשים | VERIFICATION_CHECKLIST.md | 🔲 |

---

## קבצים מרכזיים

| תפקיד | קובץ |
|--------|------|
| קונפיגורציה API | apps/api/src/config/env.ts, .env.example |
| תקלות + כפילויות | apps/api/src/routes/maintenanceRoutes.ts, maintenanceModel.ts |
| מדדים ציבוריים | apps/api/src/routes/publicRoutes.ts, buildingStatsModel.ts |
| Vision | apps/api/src/models/visionLogModel.ts, services/vision.ts |
| פרונט API | apps/web/src/api.ts |
| נתיבים | apps/web/src/routs/routes.ts, AppRoutes.tsx |
| סכמת DB | docs/HSLL_DATABASE_SCHEMA.md |
| אימות מנכ"לית | docs/CEO_VERIFICATION_CHECKLIST.md |

---

*מסמך זה משלים את MASTER_TECHNICAL_BLUEPRINT ו-DATABASE_SCHEMA_APPROVAL. עדכון סטטוס מדי סיום משימה.*
