# תיעוד הפרויקט (Docs Index)

## מפרטים טכניים

| קובץ | תיאור |
|------|--------|
| **[TECHNICAL_SPECIFICATION.md](TECHNICAL_SPECIFICATION.md)** | מפרט טכני מלא בעברית – מבנה הפרויקט, ארכיטקטורה, API, אבטחה. המסמך המרכזי להנדסה. |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | **תיעוד API מלא** – כל ה-endpoints לפי דומיין. Due Diligence – הקוד מסודר כמו ספר. |
| **[HSLL_SPEC.md](HSLL_SPEC.md)** | מפרט ורודמאפ באנגלית (מאוחד) – ארכיטקטורה, Backend, AI, תחזוקה, CEO Dashboard, צ'קליסט לפני השקה, מפת קבצים. |
| **[MASTER_TECHNICAL_BLUEPRINT.md](MASTER_TECHNICAL_BLUEPRINT.md)** | **הפרומפט הטכני המרכזי לבינה** – Multi-tenant, AI Peacekeeper, Vision/Satellite, Magic Link + Voice, CEO Dashboard. כולל מצב Monorepo נוכחי והנחיה לשלב הבא. |
| **[DATABASE_SCHEMA_APPROVAL.md](DATABASE_SCHEMA_APPROVAL.md)** | אישור מבנה DB – טבלאות קיימות, טבלת HSLL_Event, שדות אופציונליים. לחתימה לפני יישום. |
| **[HSLL_DATABASE_SCHEMA.md](HSLL_DATABASE_SCHEMA.md)** | **סכמת DB מרכזית** – Building, Ticket (Maintenance), VisionLog, Ledger. הערות CTO (multi-tenant, compound indexes, AI Peacekeeper 30 days). |
| **[CEO_VERIFICATION_CHECKLIST.md](CEO_VERIFICATION_CHECKLIST.md)** | **צ'קליסט אימות מנכ"לית** – Peacekeeper, CEO View (Pulse/Anomaly/Ledger), Technician Evidence, Vision Snapshot; צ'קליסט לפני עלייה (SSL, פרטיות, מהירות). |
| **[FIRST_WEEK_SPRINT.md](FIRST_WEEK_SPRINT.md)** | משימות שבוע ראשון – תשתית, AI Peacekeeper, דאשבורד מנכ"לית, אימות. סטטוס משימות וקישור לקבצים. |
| **[TECHNICIAN_SYNC_REPORT.md](TECHNICIAN_SYNC_REPORT.md)** | דוח סנכרון טכנאי – קונפיגורציה, מודלים, API, תיעוד, פונקציות שנבדקו; מה נשאר לספינט. |
| **[INVESTOR_STRATEGIC_SUMMARY.md](INVESTOR_STRATEGIC_SUMMARY.md)** | **Investor One-Pager** – Vantera, החזון, הבעיה (Visibility Gap), היתרון הטכנולוגי (AI Vision, Peacekeeper, V2I, AAA Ledger), שוק ומודל עסקי. EN + HE. |
| **[INVESTOR_EXECUTIVE_SUMMARY.md](INVESTOR_EXECUTIVE_SUMMARY.md)** | **The $3 Disruptor** – Executive Summary למשקיעים: Efficiency Gap, מודל $3/חודש, Moat טכני, Data Play, טבלת השוואה, ROI. EN + HE. |
| **[VANTERA_2026_STRATEGY_AND_ROADMAP.md](VANTERA_2026_STRATEGY_AND_ROADMAP.md)** | **2026: From Pilot to Powerhouse** – Vantera Certified, Service Marketplace, Smart City; Roadmap רבעוני Q1–Q4; סיכום מנכ"לית ו-CTO. |
| **[TECHNICAL_NEXT_TASKS.md](TECHNICAL_NEXT_TASKS.md)** | **משימות טכניות הבאות** – Webhooks Gateway (API Economy), Onboarding &lt;60s; הנחיה למתכנת. |
| **[TECHNICAL_FACT_SHEET.md](TECHNICAL_FACT_SHEET.md)** | **Technical Fact Sheet** – שורת המסר למשקיע ("ביטוח אקטיבי", $3 לנכס דיגיטלי), נתוני מפתח, ייצוא ל-PDF. |
| **[TECH_STACK_OVERVIEW.md](TECH_STACK_OVERVIEW.md)** | **תקציר תשתית טכנולוגית** – Monorepo, Next.js/NestJS, MongoDB, AI (Rekognition, Earth Engine, Whisper), AWS, Twilio/SendGrid. "למה הסטאק מנצח". |
| **[TRUST_PRIVACY_STATEMENT.md](TRUST_PRIVACY_STATEMENT.md)** | **אמון ופרטיות** – Privacy by Design, טשטוש (Anonymization), AES-256, שקיפות (AAA Ledger), GDPR/CCPA. נוסח להצגה ללקוחות ולוועדים. |
| **[ONBOARDING_CHECKLIST.md](ONBOARDING_CHECKLIST.md)** | **צ'ק-ליסט הצטרפות** – Vision Setup (CCTV, מפת בניין, Assets), User Management, Financial, Kick-off. בסיס לטופס דיגיטלי עם Progress Bar. |
| **[MULTI_TENANT_SECURITY.md](MULTI_TENANT_SECURITY.md)** | בידוד רב-דייר – Middleware גלובלי + Data Access Layer (Mongoose plugin). למה "סינון ב-DB" לבד מסוכן ואיך HSLL מונע דליפה. |
| **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** | צ'קליסט אימות – קישור בין תשובות מקצועיות (תיעוד/JD) למימוש בקוד. קישורים לקוד ולמסמכי Compliance. |
| **[DUE_DILIGENCE_KIT.md](DUE_DILIGENCE_KIT.md)** | הנחיה לטכנאי – Core IP, White-Label, Data Sovereignty, Compliance. רשימת קבצים לבדיקה. |
| **[COMPLIANCE_CHECKLIST.md](COMPLIANCE_CHECKLIST.md)** | GDPR, SOC2, Pen Test – טבלת סטטוס והנחיות לטכנאי. |
| **[TECHNICAL_EXECUTIVE_SUMMARY.md](TECHNICAL_EXECUTIVE_SUMMARY.md)** | סיכום טכני מקצועי (שפת M&A). |
| **[CEO_EXECUTIVE_BRIEFING_GUIDANCE.md](CEO_EXECUTIVE_BRIEFING_GUIDANCE.md)** | הנחיה למנכ"לית – דגשים לפי קהל (צרפת, ארה"ב, טכנאי). |
| **[DATA_SEPARATION.md](DATA_SEPARATION.md)** | הפרדת נתונים – Public (דף נחיתה) מול Private (אפליקציה). רשימת endpoints ציבוריים ומקור הנתונים. |
| **[VISION_SATELLITE_SPEC.md](VISION_SATELLITE_SPEC.md)** | מפרט Vision & Satellite – CCTV AI (RTSP, anomaly detection), לווין (Change Detection), לוגיקת התראות ל־CEO. |

## מדיניות וסטנדרטים

| קובץ | תיאור |
|------|--------|
| [SECURITY.md](SECURITY.md) | אבטחה, משתני סביבה, סודות. |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | נגישות (ARIA, ניגודיות). |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | קוד התנהגות. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | הנחיות לתרומה. |

## פריסה ופתרון בעיות

| קובץ | תיאור |
|------|--------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | פריסה (Render, Netlify, env). |
| [FIXES.md](FIXES.md) | תיקונים מהירים – clean install, כפילות React, הפעלת Dev. |

## פיצ'רים ותיעוד נוסף

| קובץ | תיאור |
|------|--------|
| [COMMUNITY_WALL.md](COMMUNITY_WALL.md) | תיעוד פיצ'ר קיר הקהילה. |
| [AUDIT_REPORT.md](AUDIT_REPORT.md) | דוח ביקורת. |
| [CHANGELOG.md](CHANGELOG.md) | יומן שינויים. |
