# מפרט טכני – מערכת ניהול דיירים ותשלומים

**גרסה:** 2.0 (Enterprise-Grade)  
**תאריך:** פברואר 2025  
**סוג:** אפיון טכני מפורט (Technical Specification) – הנדסי חסין

---

## 1. סקירה כללית

### 1.1 מטרת המערכת
מערכת לניהול דיירים, תשלומים וניהול קהילה בבניינים משותפים. כוללת ממשק אדמין, ממשק דייר, רב-דיירות (Multi-Tenancy) לפי בניין, תשלומים (כולל Stripe), ניהול דירות, תחזוקה, הצבעות, קיר קהילה ו־AI Analytics.

### 1.2 ארכיטקטורה כללית
- **Monorepo** עם **pnpm workspaces** ו-**Turbo**.
- **Frontend:** אפליקציית React (SPA) – Vite, TypeScript, Redux Toolkit, React Router.
- **Backend:** שרת Node.js (Express) עם TypeScript.
- **מסד נתונים:** MongoDB (Mongoose).
- **אירוח:** Frontend – Netlify; Backend – Render (או שרת אחר). CI/CD – GitHub Actions.

---

## 2. מבנה הפרויקט (Monorepo)

```
my-monorepo-main/
├── apps/
│   ├── api/          # שרת Express (Backend)
│   ├── web/          # אפליקציית React (Frontend)
│   └── native/       # placeholder לאפליקציה נייטיבית
├── packages/
│   └── shared/       # טיפוסים וקוד משותף
├── docs/             # תיעוד (כולל מפרט זה)
├── scripts/          # סקריפטים (בדיקות, אוטומציה)
├── .github/workflows # CI/CD
├── package.json      # שורש – workspaces, סקריפטים גלובליים
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── netlify.toml      # הגדרות פריסת Web ל-Netlify
```

### 2.1 Workspaces
- `apps/*` – אפליקציות (api, web, native).
- `packages/*` – חבילות משותפות (shared).

### 2.2 סקריפטים ברמת השורש
| סקריפט | תיאור |
|--------|--------|
| `pnpm install` | התקנת תלויות לכל ה-workspaces |
| `pnpm dev` | הפעלת Web בלבד |
| `pnpm dev:full` | הפעלת כל האפליקציות במקביל (Turbo) |
| `pnpm dev:web` | הפעלת Web |
| `pnpm dev:api` | הפעלת API |
| `pnpm build` | בנייה לכל הפרויקטים |
| `pnpm start` | הפעלת API (לאחר build) |
| `pnpm lint` | הרצת lint בכל הפרויקטים |
| `pnpm type-check` | בדיקת טיפוסים |

---

## 3. Backend (API) – `apps/api`

### 3.1 טכנולוגיות
- **Runtime:** Node.js  
- **Framework:** Express  
- **שפה:** TypeScript (ESM – `"type": "module"`)  
- **מסד נתונים:** MongoDB + Mongoose  
- **אבטחה:** Helmet, CORS, express-rate-limit, JWT (טוקנים נשמרים בצד הלקוח), bcryptjs  
- **תשלומים:** Stripe (כולל webhook)  
- **קבצים:** Multer, גישה ל-`/uploads`  
- **ניטור:** morgan, performance middleware, health routes  

### 3.2 מבנה תיקיות `apps/api/src`

| תיקייה/קובץ | תיאור |
|-------------|--------|
| `index.ts` | כניסת האפליקציה – Express, CORS, חיבור MongoDB, הרשמת routes, seed אדמין/משתמש |
| `controllers/` | לוגיקה עסקית (למשל apartmentController) |
| `models/` | מודלי Mongoose (User, Admin, Payment, Building) |
| `routes/` | נתיבי API – כל router מחובר ב-`routes/index.ts` |
| `middleware/` | auth, tenant, security, paymentSecurity, performance |
| `services/` | שירותים (Stripe, AI Insights) |
| `utils/` | multiTenancy (plugin), monitoring, pdf |
| `templates/` | תבניות (למשל קבלה – receiptTemplate.html) |
| `types/` | הגדרות TypeScript ל-API |

### 3.3 מודלי נתונים (Mongoose)

#### User (`userModel.ts`)
- `name`, `email`, `password` (חובה)
- `apartmentNumber`
- `securityQuestions`: מערך של `{ question, answerHash }`
- **Multi-tenancy:** `buildingId` (ברירת מחדל `'default'`) – אינדקס ייחודי `(buildingId, email)`

#### Admin (`adminModel.ts`)
- `username` (ייחודי), `password`, `role` (ברירת מחדל `'admin'`)
- **Multi-tenancy:** `buildingId`

#### Payment (`paymentModel.ts`)
- `payer`, `amount`, `createdAt`, `category`, `status` (pending | paid | overdue | failed)
- `userId`, `dueDate`, `buildingId`, `tenantId`
- שדות Stripe: `stripeAccountId`, `stripeSessionId`, `stripePaymentIntentId`
- **Multi-tenancy:** `buildingId`

#### Building (`buildingModel.ts`)
- `buildingId` (ייחודי), `address`, `buildingNumber`
- `committeeName`, `committeeContact`
- **לא** משתמש ב-multiTenancy plugin – זה המודל שמגדיר את הבניינים.

### 3.4 Multi-Tenancy
- **Header:** `x-building-id` – נקבע ב-`tenantMiddleware.ts`, ברירת מחדל `'default'`.
- **Plugin:** `multiTenancy.ts` – מוסיף `buildingId` למודלים, מסנן אוטומטית כל find/update/delete/aggregate לפי `tenantContext`.
- **Context:** `AsyncLocalStorage` ב-`tenantMiddleware` – כל בקשה רצה בהקשר של `buildingId` אחד.

### 3.5 נתיבי API (מבוסס על `routes/index.ts`)

כל הנתיבים מתחת ל-`/api` (מלבד Stripe webhook).  
Middleware גלובלי: `validateInput`, `rateLimiter`; בנתיבי auth: `loginRateLimiter`.

| Prefix | Router | תיאור כללי |
|--------|--------|-------------|
| `/api/payments` | paymentRoutes | תשלומים |
| `/api/vote` | voteRoutes | הצבעות |
| `/api/health` | healthRoute | בריאות שרת |
| `/api/users` | userRoutes | משתמשים |
| `/api/residents` | residentRoutes | דיירים |
| `/api/blog` | blogRoutes | בלוג |
| `/api/files` | fileRoutes | קבצים |
| `/api/apartments` | apartmentRoutes | דירות |
| `/api/signup` | signUpRoute | הרשמת משתמש |
| `/api/login` | loginRoute | התחברות משתמש |
| `/api/admin` | adminLoginRoute | התחברות/רישום אדמין |
| `/api/forgot-password` | forgotPasswordRoute | שכחת סיסמה |
| `/api/ai-analytics` | aiAnalyticsRoute | אנליטיקת AI (כולל GET `/api/ai-analytics/insights/:buildingId` – תובנות שמורות) |
| `/api/ai-notifications` | aiNotificationsRoute | התראות AI |
| `/api/auth/refresh` | authRefreshRoute | רענון JWT (POST עם refreshToken) |
| `/api/buildings` | buildingsRoute | בניינים |
| `/api/stripe` | stripeRoutes | Stripe (לא דרך index הראשי – רשום ב-index.ts של האפליקציה) |
| `/api/webhooks/stripe` | stripeWebhookRoute | Webhook של Stripe (גוף raw, לפני express.json) |

### 3.6 משתני סביבה (API)
- `MONGO_URI` – חובה.
- `PORT` – ברירת מחדל 3008.
- `NODE_ENV` – development | production.
- `CORS_ORIGIN` – רשימת origins מופרדת בפסיקים.
- (אופציונלי) `SEED_DEFAULT_USERS` – ליצירת דייר לדוגמה בפיתוח.
- (לפי README) JWT, RATE_LIMIT, וכו' – ראו README ו-SECURITY.md.

---

## 4. Frontend (Web) – `apps/web`

### 4.1 טכנולוגיות
- **Build:** Vite  
- **שפה:** TypeScript  
- **UI:** React 18, React-Bootstrap, Bootstrap 5, Font Awesome  
- **ניווט:** React Router v6  
- **State:** Redux Toolkit (store ב-`redux/store.ts`)  
- **תרגום:** i18n מותאם (translations, useTranslation)  
- **נגישות:** AccessibilityPanel  
- **Auth:** AuthContext (משתמש + אדמין) + token ב-localStorage  

### 4.2 מבנה תיקיות `apps/web/src`

| תיקייה/קובץ | תיאור |
|-------------|--------|
| `main.tsx` | כניסה – Provider Redux, AuthProvider, Router, App |
| `App.tsx` | Navbar, AppRoutes, Footer, AccessibilityPanel |
| `api.ts` | לקוח API – base URL, `x-building-id`, Authorization, apiRequestJson |
| `routs/` | `routes.ts` (קבועי נתיבים), `AppRoutes.tsx` (Route components עם lazy loading) |
| `pages/` | דפי האפליקציה (Home, Admin, User, תשלומים, דיירים, וכו') |
| `pages/users/UI/` | SignUp, UsersList, UserDetails, UserManagement, CreateAdminPassword, ChangeAdminPassword |
| `pages/seqerty/` | PrivacyPolicy, TermsAndConditions, Accessibility, SecurityPolicy |
| `components/` | Navbar, Footer, Blog, Voting, AINotifications, LanguageSwitcher, וכו' |
| `context/` | AuthContext – מצב התחברות משתמש/אדמין |
| `redux/` | store, slices (blog, community, payments, users, וכו'), hooks |
| `i18n/` | תרגומים ו-useTranslation |
| `utils/` | safeStorage (גישה ל-localStorage) |
| `assets/` | תמונות סטטיות |

### 4.3 ניתוב (Routes)
הנתיבים מוגדרים ב-`routs/routes.ts` ומשומשים ב-`AppRoutes.tsx`. דפים נטענים ב-lazy. דוגמאות:

- `/` – Home  
- `/resident-home` – ResidentHome  
- `/resident-form`, `/new-resident-approval` – דיירים  
- `/repair-tracking`, `/gardening` – תחזוקה  
- `/for-rent`, `/for-sale` – דירות  
- `/employee-management` – עובדים  
- `/sign-up`, `/users-list`, `/user-details/:id`, `/user-management`, `/create-admin-password`, `/change-admin-password` – משתמשים  
- `/check-out`, `/payment-page` – תשלום  
- `/admin-login`, `/select-building`, `/admin-dashboard`, `/change-password` – אדמין  
- `/user-login`, `/forgot-password`, `/user-dashboard` – משתמש  
- `/receipt` – קבלה  
- `/voting` – הצבעות  
- `/community-wall` – קיר קהילה  
- `/ai-dashboard` – AI Dashboard  
- `/payment-management`, `/apartments` – ניהול תשלומים ודירות  
- `/reports-dashboard`, `/maintenance`, `/settings`, `/contracts-letters` – דוחות, תחזוקה, הגדרות, חוזים  
- `/privacy-policy`, `/terms-and-conditions`, `/accessibility`, `/security-policy` – מדיניות  
- `/thank-you` – תודה  
- `*` – Error404Page  

### 4.4 לקוח API (`api.ts`)
- **Base URL:** מ-`VITE_API_URL` או fallback ל-`/api`; בפרודקשן (לא localhost) – גם ל-Render (`https://my-monorepo-1.onrender.com/api`).
- **Header `x-building-id`:** נשלח בכל בקשה (ערך מ-localStorage, ברירת מחדל `'default'`).
- **Authorization:** `Bearer <token>` מ-localStorage, מלבד בנתיבי login/signup/admin.
- **פונקציה עיקרית:** `apiRequestJson<T>(path, init)` – מחזירה `{ response, data, usedBase }`.

### 4.5 Auth (AuthContext)
- **משתמש:** `isUserLoggedIn`, `user` (id, name, email) – נשמר ב-localStorage (כולל userId, userName, userEmail, isUserLoggedIn).
- **אדמין:** `isAdminLoggedIn`, `admin` (username, role) – נשמר adminUsername, adminRole, isAdminLoggedIn.
- **buildingId** – נשמר ונקרא מ-localStorage.
- **פונקציות:** `refreshAuth`, `logoutUser`, `logoutAdmin`.

### 4.6 Redux
- **Store:** `redux/store.ts` – כולל slices רבים (blog, community, employees, payments, residents, users, settings, voting, וכו').
- **Hooks:** `redux/hooks.ts` – שימוש ב-`useDispatch`, `useSelector` עם טיפוסים.

---

## 5. חבילה משותפת – `packages/shared`

- **תפקיד:** טיפוסים ומבני נתונים משותפים (בפרט ל-Backend/נכסים).
- **תוכן עיקרי:** `src/types/domain.ts` – Building, User, UserRole, MaintenanceTicket, MaintenancePriority, MaintenanceStatus.
- **שימוש:** ייבוא מ-`packages/shared` ב-apps (לפי צורך).

---

## 6. תשתית ופריסה

### 6.1 בנייה (Turbo)
- `turbo.json`: tasks – build (outputs: dist/build), dev (persistent), lint, type-check, format, clean.
- Build עם תלויות בין חבילות (`dependsOn: ["^build"]`).

### 6.2 פריסה
- **Frontend:** Netlify – `publish: apps/web/dist`, build: `pnpm install && pnpm run build`. Redirect SPA ל-`/index.html`.
- **Backend:** Render (לפי README ו-`render.yaml` ב-api) – Node, MongoDB חיצוני.
- **CI/CD:** GitHub Actions – על push/PR ל-main/develop: lint, type-check, build; על main – deploy ל-Netlify (עם NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID). שירות MongoDB ב-CI ל-test-and-build.

### 6.3 אבטחה (סיכום)
- Rate limiting (כללי + login).
- Helmet (CSP וכו').
- CORS מוגדר (localhost, LAN, Netlify, Render).
- Validation קלט, הגנת תשלומים (middleware ייעודי).
- JWT ו-bcrypt בסיסי; AuthContext וטוקן ב-localStorage בצד הלקוח.

---

## 7. סיכום טבלאי – רכיבים עיקריים

| רכיב | טכנולוגיה / מיקום |
|------|-------------------|
| Monorepo | pnpm workspaces, Turbo |
| Backend | Express, TypeScript, MongoDB/Mongoose |
| Frontend | React 18, Vite, TypeScript, Redux Toolkit, React Router |
| Auth | JWT (token ב-storage), AuthContext, admin/user מודלים |
| Multi-Tenancy | x-building-id, tenantMiddleware, multiTenancyPlugin |
| תשלומים | Stripe (routes + webhook), Payment model |
| פריסה | Netlify (web), Render (api), GitHub Actions CI/CD |

---

## 8. Data Layer & Scalability (Enterprise)

### 8.1 Caching Strategy (Redis)
- **מטרה:** הפחתת עומס על MongoDB ב-queries חוזרים (הערכה: 60%+ ב-endpoints של רשימות לבניין).
- **שימושים:**
  - **Sessions / Refresh Tokens:** אחסון refresh token – key pattern `session:{buildingId}:{userId}` (או `refresh:{tokenId}`) עם TTL (למשל 7 ימים).
  - **Cache קריא-בעיקר:** רשימת דירות לבניין, רשימת בניינים, הגדרות בניין – key pattern `building:{buildingId}:apartments`, TTL 5–15 דקות.
- **Invalidation:** בעדכון/מחיקה ב-DB – מחיקה או עדכון של המפתח הרלוונטי ב-Redis; או TTL קצר בלבד.
- **מימוש:** חיבור ב-`apps/api/src/config/redis.ts`; פונקציות get/set/del עם prefix; helper `getBuildingApartments(buildingId)` – cache-first, on miss שאילתה ל-MongoDB ו-set ב-Redis.

### 8.2 Database Indexing
- **דרישה:** כל query שמסנן לפי `buildingId` + שדה נוסף יהיה מכוסה באינדקס (או מתועד יוצא מן הכלל).

| Model   | Index (fields)                | Purpose / Query pattern              |
|---------|-------------------------------|--------------------------------------|
| User    | `(buildingId, email)` unique  | כבר קיים – לוגין וייחודיות per building |
| Payment | `(buildingId, createdAt)`     | רשימות תשלומים לפי זמן, דוחות       |
| Payment | `(buildingId, status)`        | סינון לפי סטטוס                       |
| Payment | `(buildingId, userId)`        | תשלומים לפי דייר                     |
| Admin   | `(buildingId, username)`      | ייחודיות אדמין per building (אופציונלי) |

---

## 9. Security & Compliance (Enterprise)

### 9.1 Rate Limiting
- **גלובלי (per IP):** 100 בקשות ל-15 דקות – כפי שמוגדר ב-`securityMiddleware`.
- **Login:** 5 ניסיונות ל-15 דקות per IP.
- **Per-tenant (per building):** לימיט לפי `x-building-id` (למשל 200 req/15min per building) כדי למנוע DoS על בניין בודד. מימוש: `buildingRateLimiter` עם `keyGenerator: (req) => req.headers['x-building-id'] || req.ip`; store ב-Redis (`ratelimit:building:{buildingId}`) או memory.

### 9.2 JWT & Refresh Tokens
- **Access Token:** חיים קצרים (למשל 15 דקות), חתום ב-JWT (מפתח סודי ב-`JWT_SECRET`).
- **Refresh Token:** חיים ארוכים (למשל 7 ימים), נשמר ב-DB או Redis, משויך ל-user/admin ו-buildingId.
- **זרימה:** לוגין מחזיר `accessToken` + `refreshToken`; הלקוח שולח `Authorization: Bearer <accessToken>`; כשפג תוקף – POST ל-`/api/auth/refresh` עם refreshToken, מקבל accessToken חדש.
- **רוטציה:** בהנפקת access חדש מ-refresh – ניתן להאריך או להחליף refresh לפי מדיניות.

### 9.3 Input Sanitization (NoSQL Injection)
- **Middleware חובה** לפני גישה ל-DB על כל הערכים מ-`req.body`, `req.query`, `req.params`.
- **כללים:** הסרת אופרטורים מסוכנים של MongoDB – מפתחות שמכילים `$` או שמתחילים ב-`.` (החלפה/הסרה); הגבלת עומק אובייקטים ומערכים; escape ל-regex כשמשתמשים ב-RegExp מקלט.
- **מימוש:** `apps/api/src/middleware/sanitizationMiddleware.ts` – פונקציה רקורסיבית + middleware שמפעיל על body/query/params; רישום ב-`routes/index.ts` אחרי `express.json()`.

---

## 10. DevOps & Reliability (Enterprise)

### 10.1 Structured Logging
- **ספרייה:** Winston (או Pino). פורמט JSON, רמות: error, warn, info, debug.
- **שדות:** timestamp, level, message, reqId, buildingId, path, statusCode.
- **מימוש:** `apps/api/src/utils/logger.ts` – transport לקונסול ו(אופציונלי) לקובץ; שילוב עם request logging ב-`index.ts`.

### 10.2 Alerting
- **על שגיאות 5xx:** שליחה ל-Slack או Discord webhook. משתנה סביבה: `SLACK_WEBHOOK_URL` או `DISCORD_WEBHOOK_URL`.
- **פורמט הודעה:** טקסט קצר עם timestamp, path, statusCode, message (ללא פרטי משתמש רגישים).

### 10.3 Docker
- **Dockerfile:** `apps/api/Dockerfile` – multi-stage: build TypeScript, production image עם Node, הרצת `node dist/index.js`.
- **docker-compose:** שירותים `api`, `mongodb`, `redis`; רשת משותפת; volumes ל-MongoDB; משתני סביבה מ-`.env` (העתקה מ-`.env.example`).
- **מטרה:** הרצה מקומית זהה לפרודקשן; מוכנות ל-AWS ECS / Kubernetes.

---

## 11. AI Analytics Pipeline (Enterprise)

### 11.1 Ingestion
- איסוף נתונים **אנונימיים/מצומצמים** מתשלומים ותקלות (maintenance) – ללא PII.
- שמירה ב-collection ייעודי (למשל `AiAggregation`) – שדות: buildingId, period (תאריך/חודש), metrics (סכומים, כמות, קטגוריות).

### 11.2 Processing
- **Cron Job** (למשל יומי) – קורא נתונים גולמיים/אגרגציות, מריץ חישובי מגמות (עלייה/ירידה באחוזים), מזהה חריגות, ושומר תוצאות ב-collection `AiInsight`.
- שדות insight: buildingId, type, title, description, priority, createdAt.

### 11.3 Insights API
- API שמחזיר לאדמין תובנות מוכנות (למשל GET `/api/ai-analytics/insights/:buildingId`).
- דוגמאות: "עלייה של 20% בצריכת X ב-3 החודשים – מומלץ לבדוק Y"; מגמות מתשלומים/קטגוריות. בעתיד – נתוני צריכה (למשל מים) באותו pipeline.

---

**סוף המפרט הטכני.**  
לפרטי אבטחה מלאים – `docs/vantera/SECURITY.md`.  
להתקנה והפעלה – `README.md` ברמת הפרויקט.
