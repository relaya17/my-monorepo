# רשימת משימות פריסה – vantera.io

**מטרה:** הפעלת האתר בדומיין vantera.io בצעדים מסודרים.

---

## שלב 1: Netlify Site

1. התחברות ל-[Netlify](https://app.netlify.com).
2. **Add new site** → **Import an existing project** → GitHub.
3. בחר את ה-repository (my-monorepo-main).
4. **Build settings:**
   - Build command: `pnpm install && pnpm run build`
   - Publish directory: `apps/web/dist`
   - Base directory: (ריק)
5. **Environment variables** (Site settings → Environment variables):
   - `VITE_API_URL` = כתובת ה-API (למשל `https://your-api.onrender.com` – בלי `/api` בסוף).
   - `VITE_DEMO_VIDEO_URL` (אופציונלי) = קישור לווידאו Demo (YouTube/Vimeo/Cloudinary).
6. Deploy.
7. העתק את **Site ID** (Site settings → General → Site information).

---

## שלב 2: Custom Domain – vantera.io

1. **Domain management** (Netlify) → **Add custom domain**.
2. הזן `vantera.io` ו-`www.vantera.io`.
3. **DNS** (אצל רשם הדומיין, למשל Namecheap/Cloudflare):
   - **דומיין שורש (vantera.io):**
     - A record: `75.2.60.5` (Netlify Load Balancer) – או השתמש ב-DNS של Netlify.
     - או: ALIAS/CNAME לפי המלצת Netlify.
   - **www:** CNAME `www` → `your-site-name.netlify.app`.
4. המתן לאימות (עד 24 שעות).
5. **SSL:** Netlify מנפיק אוטומטית – וודא שהתעודה פעילה.

---

## שלב 3: GitHub Secrets (ל-CI/CD)

1. GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**.
2. הוספת Secrets:
   - `NETLIFY_AUTH_TOKEN` – מ-Netlify: User settings → Applications → Personal access tokens → New access token.
   - `NETLIFY_SITE_ID` – מזהה האתר מ-Netlify (Site settings).

---

## שלב 4: API (Render / שרת אחר)

1. וודא ש-API רץ ב-production (למשל Render).
2. הגדר ב-API:
   - `CORS_ORIGIN` כולל את `https://vantera.io` ו-`https://www.vantera.io`.
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL` (למשל `https://vantera.io`).
3. **Webhook Stripe:** הוסף endpoint `https://your-api.onrender.com/api/webhooks/stripe` ב-Stripe Dashboard.

---

## שלב 5: אימות

| בדיקה | צפוי |
|--------|------|
| `https://vantera.io` נטען | דף נחיתה / Home |
| `https://vantera.io/landing` | דף Landing מלא |
| כפתור "Watch the Demo" | מפנה לווידאו או לדף טכנאי |
| כפתור "Get an Enterprise Demo" | פותח טופס |
| התחברות משתמש/אדמין | עובד מול ה-API |

---

## משתני סביבה – סיכום

| משתנה | היכן | חובה |
|--------|------|------|
| `VITE_API_URL` | Netlify (Frontend) | כן |
| `VITE_DEMO_VIDEO_URL` | Netlify (Frontend) | לא – fallback לדף טכנאי |
| `NETLIFY_AUTH_TOKEN` | GitHub Secrets | כן (ל-CI deploy) |
| `NETLIFY_SITE_ID` | GitHub Secrets | כן (ל-CI deploy) |
| `CORS_ORIGIN` | API (Render) | כן – לכלול vantera.io |
| `CLIENT_URL` | API | כן – `https://vantera.io` |
