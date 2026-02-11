# Vantera Technical Stack Overview

**כרטיס טכני למשקיעים:** "איך זה עובד מתחת למכסה המנוע?" – מערכת סקיילבילית, מודרנית ומאובטחת.

---

## Architecture Strategy

**Monorepo** – תיאום מלא בין דף הנחיתה, אפליקציית הדיירים/מנכ"לית ומנוע ה-API. מקור אמת יחיד (`packages/shared`) לטייפים ולוגיקה משותפת.

---

## 1. The Core (Current Implementation)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + Vite | טעינה מהירה, חוויית פיתוח מעולה, build קל. |
| **UI** | React Router, Bootstrap, Framer Motion | ניווט, עיצוב רספונסיבי, אנימציות (Landing, count-up, parallax). |
| **Backend** | Node.js + Express | API מודולרי, multi-tenant, JWT, rate limiting, sanitization. |
| **Database** | MongoDB + Mongoose | סכמות גמישות לבניינים, תחזוקה, תשלומים, לידים. |
| **State** | Redux (App), React Context (Auth, Building) | ניהול state גלובלי והקשר דייר/בניין. |

---

## 2. Security & Scale (In Production)

| Area | Implementation |
|------|----------------|
| **Multi-Tenancy** | `tenantMiddleware` + `multiTenancyPlugin` – כל שאילתה מסוננת לפי `buildingId`; JWT מאמת התאמה ל-header. |
| **Auth** | JWT (access + refresh), bcrypt, RBAC (Resident, Committee, SuperAdmin). |
| **Protection** | Helmet, CORS, express-rate-limit (global + login + per-tenant), NoSQL sanitization. |
| **Secrets** | `.env` – MongoDB, Stripe, OpenAI; אין מפתחות בקוד. |

---

## 3. Intelligence Layer (AI & Vision)

| Component | Status / Technology |
|-----------|---------------------|
| **AI Peacekeeper** | זיהוי כפילויות בתקלות (similarity hash, 30 יום); החזרת 409 עם לינק לתקלה קיימת. |
| **Voice / NLP** | OpenAI – אינטגרציה לניתוח טקסט/קול (מסלול Voice-to-Insight roadmap). |
| **Vision / Satellite** | מודלים ו־routes ל־Vision Log; חיבור CCTV/לוויין – במפרט ו־roadmap. |

---

## 4. Infrastructure & DevOps

| Area | Choice |
|------|--------|
| **Hosting** | Render / Vercel / AWS – פריסה סטנדרטית; Docker support בפרויקט. |
| **Storage** | Cloudinary (תמונות/קבצים), MongoDB Atlas. |
| **Payments** | Stripe – תשלומים וקבלות. |
| **Logging** | Winston – לוגים ממוקדים; Audit Log לפעולות קריטיות. |

---

## למה הסטאק הזה מנצח? (הסבר למנכ"לית)

- **מהירות:** Vite + React – טעינה ופיתוח מהירים; דף נחיתה עם וידאו, מדדים חיים ואנימציות.
- **חיסכון:** שימוש ב-Express ו־MongoDB במקום להמציא תשתית – Time to Market טוב; הרחבה ל-Next.js/AWS כשנגדיל.
- **אמינות:** Multi-tenant ברמת Middleware ו-DB – דייר בבניין א' לא רואה נתונים של בניין ב'.
- **שקיפות:** API ציבורי למדדי השפעה (דף נחיתה); שאר ה-API מאובטח ו-scoped לבניין.

---

## Roadmap (Scale & InsurTech)

- **Frontend:** מעבר אפשרי ל-Next.js (SSR, SEO) לדף נחיתהנהלת.
- **Backend:** הרחבה ל-NestJS או מיקרו-סרוויסים כשיעמסו.
- **AI/Vision:** אינטגרציה מלאה ל-CCTV (Rekognition/OpenCV) ולוויין (Google Earth Engine).
- **Vantera Shield:** ציון סיכון לבניין – נתונים לחברות ביטוח (InsurTech).

---

*מסמך זה משמש את המנכ"לית בתשובות למשקיעים על התשתית הטכנולוגית.*
