# Deploy API on Render.com

## שגיאה: JWT_SECRET must be set

כשה-API נופל ב-Render עם:
```
Error: In production JWT_SECRET must be set and at least 32 characters
```

### פתרון

1. **Render Dashboard** → בחר את ה-Web Service של ה-API
2. **Environment** → **Add Environment Variable**
3. הוסף:
   - **Key:** `JWT_SECRET`
   - **Value:** מחרוזת אקראית של **לפחות 32 תווים**

### יצירת ערך בטוח (ממחשב מקומי):
```bash
openssl rand -base64 32
```

להעתקה ישירות ל-Render.

---

## משתני סביבה נדרשים ל-Render (Production)

| משתנה | חובה | תיאור |
|-------|------|-------|
| `MONGO_URI` | ✓ | כתובת MongoDB (Render MongoDB / Atlas / וכו') |
| `JWT_SECRET` | ✓ | מינימום 32 תווים – ליצירה: `openssl rand -base64 32` |
| `NODE_ENV` | | `production` (ברירת מחדל אם לא מוגדר) |
| `PORT` | | Render מעביר אוטומטית – ברירת מחדל 3008 |

## משתנים אופציונליים

- `CORS_ORIGIN` – דומיין ה-Frontend (למשל `https://my-monorepo.netlify.app`)
- `FRONTEND_URL` – כתובת האפליקציה
- `RESEND_API_KEY` – לשליחת מיילים (Real Estate Lead alerts)
- `OPENAI_API_KEY` – ל-V-One ChatGPT
