# מדריך התקנה – Vantera

## דרישות מקדימות

- **Node.js** 18+ (מומלץ 20 LTS)
- **pnpm** – `npm install -g pnpm`
- **MongoDB** – מקומי או Atlas
- **Redis** (אופציונלי) – לקאש

---

## התקנה מהירה

```bash
# שכפול הפרויקט
git clone <repo-url>
cd my-monorepo-main

# התקנת תלויות
pnpm install

# בניית כל החבילות
pnpm run build
```

---

## משתני סביבה

### 1. API (`apps/api/.env`)

העתק מ־`apps/api/.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```

**חובה:**
| משתנה | תיאור |
|-------|--------|
| `MONGO_URI` | חיבור MongoDB (למשל `mongodb://localhost:27017/vantera`) |
| `JWT_SECRET` | מפתח סודי ל־JWT (לפחות 32 תווים) |
| `PORT` | פורט השרת (ברירת מחדל 3008) |

**אופציונלי – פונקציונליות:**
| משתנה | תיאור |
|-------|--------|
| `RESEND_API_KEY` | מפתח Resend – שליחת מייל onboarding לדיירים |
| `EMAIL_FROM` | כתובת השולח (למשל `Vantera <onboarding@vantera.co.il>`) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 – ניתוח תנועה |
| `VITE_CLARITY_PROJECT_ID` | Microsoft Clarity – Heatmaps |

**אופציונלי – Stripe, Cloudinary, AI, Redis:**  
ראה `apps/api/.env.example` לפירוט מלא.

### 2. Web (`apps/web/.env`)

העתק מ־`apps/web/.env.example`:

```bash
cp apps/web/.env.example apps/web/.env
```

**חובה:**
| משתנה | תיאור |
|-------|--------|
| `VITE_API_URL` | כתובת ה־API (פיתוח: `/api`, פרודקשן: כתובת מלאה) |

**אופציונלי:**
| משתנה | תיאור |
|-------|--------|
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `VITE_CLARITY_PROJECT_ID` | Microsoft Clarity |
| `VITE_HOME_VIDEO_URL` | וידאו רקע בדף הבית |
| `VITE_LANDING_VIDEO_URL` | וידאו רקע בדף הנחיתה |

---

## הפעלה

**פיתוח:**
```bash
pnpm run dev
```
מפעיל את ה־API וה־Web במקביל (API על 3008, Web על 5173).

**פרודקשן:**
```bash
pnpm run build
# להפעיל את apps/api (למשל דרך Node/Render/Netlify Functions)
```

---

## Super-Admin (לוח CEO)

1. התחברות כאדמין (`/admin-login`)
2. עדכון ה־role ב־MongoDB ל־`super-admin`:
   ```javascript
   db.admins.updateOne(
     { username: "admin" },
     { $set: { role: "super-admin" } }
   )
   ```
3. כניסה ל־`/ceo` – לוח CEO מאוחד

---

## הפניות

- **SEO:** `docs/vantera/SEO_CHECKLIST.md`
- **Launch:** `docs/vantera/LAUNCH_STRATEGY.md`
- **Push:** `docs/vantera/PUSH_NOTIFICATIONS_SPEC.md`
