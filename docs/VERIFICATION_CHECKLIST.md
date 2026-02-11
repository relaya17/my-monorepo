# צ'קליסט אימות – הטכנאי מוודא שהכל מגובש

מסמך זה מקשר בין **התשובות המקצועיות** (תיעוד, JD) ל**מימוש בקוד**. כל שורה = טענה אחת + איפה לבדוק.

---

## 1. רב-דייר (Multi-Tenant) – בידוד ברמת תשתית

| טענה | איפה בודקים | סטטוס |
|------|-------------|--------|
| "Middleware גלובלי מוסיף buildingId לכל בקשה" | `apps/api/src/index.ts` שורה 91: `app.use('/api', tenantMiddleware, routes)` | ✅ |
| "קריאת x-building-id + AsyncLocalStorage" | `apps/api/src/middleware/tenantMiddleware.ts` – header, `tenantContext.run({ buildingId }, …)` | ✅ |
| "JWT מול header – מניעת Tenant Hopping, 403 + AuditLog" | `tenantMiddleware.ts` – השוואת `auth.buildingId` ל-header, `logActivity(…, 'UNAUTHORIZED_ACCESS_ATTEMPT')` | ✅ |
| "כל שאילתה מסוננת אוטומטית לפי buildingId" | `apps/api/src/utils/multiTenancy.ts` – pre-hooks על find/findOne/aggregate/save | ✅ |
| "מודלים עם plugin (אי אפשר לשכוח לסנן)" | `apps/api/src/models/*.ts` – User, Payment, Maintenance, Transaction, Voting, AuditReport, Inventory, Admin, VisionLog – כולם `.plugin(multiTenancyPlugin)` | ✅ |

**חריגים (מכוון):** בקשות ל-`/api/public/*`, `/api/webhooks/stripe`, `/api/tech/*` לא עוברות ב-tenant (public / webhook / magic link).

---

## 2. אבטחה ו-Data Layer

| טענה | איפה בודקים | סטטוס |
|------|-------------|--------|
| "Config מאומת (Zod) לפני עלייה" | `apps/api/src/config/env.ts` – `envSchema.safeParse`, throw אם חסר | ✅ |
| "NoSQL injection – סינון $, ., __proto__" | `apps/api/src/middleware/sanitizationMiddleware.ts` | ✅ |
| "Rate limiting גלובלי + לוגין" | `apps/api/src/middleware/rateLimiter.ts` – globalLimiter, loginLimiter, tenantLimiter | ✅ |
| "Soft delete – No-Delete Policy, CEO audit" | `apps/api/src/utils/softDeletePlugin.ts` – Maintenance, Transaction עם plugin | ✅ |

---

## 3. תיעוד ↔ קוד

| מסמך | מה הוא מתאר | התאמה לקוד |
|------|-------------|-------------|
| `MULTI_TENANT_SECURITY.md` | Middleware + Plugin, למה "סינון ב-DB" לבד מסוכן | תואם ל-`tenantMiddleware.ts` + `multiTenancy.ts` + רשימת המודלים עם plugin |
| `HSLL_SPEC.md` | ארכיטקטורה, רשימת דרישות, מפת קבצים | תואם – Tenant Context, Config, Maintenance, CEO, וכו' |
| `docs/README.md` | אינדקס תיעוד | מפנה ל-MULTI_TENANT_SECURITY, HSLL_SPEC, ושאר המסמכים |

---

## 4. פרונט – הקשר דייר

| טענה | איפה בודקים | סטטוס |
|------|-------------|--------|
| "כל בקשת API עם x-building-id" | `apps/web/src/api.ts` – `getBuildingId()`, `headers.set('x-building-id', buildingId)` | ✅ |
| "בחירת בניין אחת (buildingLabel משותף)" | `apps/web/src/api.ts` – `buildingLabel`, `getBuildingId`, `setBuildingId`; דפים מייבאים מכאן | ✅ |

---

## 5. איכות קוד (ללא כפילויות, ללא any)

| טענה | איפה בודקים | סטטוס |
|------|-------------|--------|
| "ולידציה (אימייל, סיסמה, שם) במקום אחד" | `apps/api/src/utils/validation.ts` – login/signup/forgot-password מייבאים | ✅ |
| "אין שימוש ב-any ב-plugins" | `multiTenancy.ts`, `softDeletePlugin.ts` – ממשקים מפורשים (TenantQueryContext וכו') | ✅ |

---

## 6. מסמכי Blueprint ואימות מנכ"לית

| מסמך | שימוש לטכנאי |
|------|----------------|
| `MASTER_TECHNICAL_BLUEPRINT.md` | פרומפט מרכזי לבינה; מצב Monorepo נוכחי (Express, Vite). |
| `HSLL_DATABASE_SCHEMA.md` | סכמת Building, Ticket, VisionLog, Ledger; הערות CTO (buildingId, compound indexes, Peacekeeper 30d). |
| `DATABASE_SCHEMA_APPROVAL.md` | אישור מבנה DB לפני שינויים. |
| `CEO_VERIFICATION_CHECKLIST.md` | ארבעת מוקדי אימות + צ'קליסט לפני עלייה (SSL, פרטיות, נחיתה < 2s). |
| `FIRST_WEEK_SPRINT.md` | משימות שבוע ראשון – סטטוס והפנייה לקבצים. |

מודלים חדשים (למשל VisionLog) – לוודא `multiTenancyPlugin` ו-`buildingId` באינדקס. הודעת כפילות תקלה: "נמצאה תקלה דומה. האם תרצי להתחבר אליה או לפתוח חדשה?" – ממומשת ב-`maintenanceRoutes.ts` (409 + existingId).

---

## סיכום לטכנאי

- **תשובה ל"איך אתה מוודא שדייר א' לא יראה תקלה של ב'?"** – מתועדת ב-`MULTI_TENANT_SECURITY.md` ומתממשת ב-`tenantMiddleware` + `multiTenancyPlugin` על כל המודלים הרלוונטיים.
- **הכל מגובש:** קוד, תיעוד ו-JD מצביעים על אותו עיקרון – בידוד ברמת Middleware + Data Access Layer, לא רק "לזכור לסנן".

אם משהו משתנה (למשל מודל חדש או route חדש) – לעדכן את הרשימה כאן ואת MULTI_TENANT_SECURITY אם צריך.
