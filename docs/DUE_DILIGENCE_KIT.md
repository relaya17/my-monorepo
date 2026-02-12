# Due Diligence Kit – רשימת הנכסים הטכנולוגיים

**מטרה:** מסמך הנחיה לטכנאי – מה להכין כדי שהקונה יבין שיש "זהב" טכנולוגי ב-Vantera.

---

## 1. Core IP – הקניין הרוחני של ה-AI

**הקונה רוצה לדעת:** שה-AI הוא שלכם ולא רק "צינור" ל-OpenAI.

### הנחיות לטכנאי

1. **תיעוד V-One Logic**
   - איך המערכת מנתחת תקלות (Fault Analysis)
   - איך מתבצע תיעוד/טריאז' (Triage)
   - מפרט ה-Prompt Engineering הייחודי

2. **מסמכים קיימים**
   - `docs/V_ONE_IP_DOCUMENTATION.md` – תיעוד מלא
   - `apps/api/src/utils/voneContext.ts` – System Context per region
   - `apps/api/src/routes/voneChatRoutes.ts` – Chat logic + keywords
   - `apps/api/src/services/maintenanceAiService.ts` – Predictive AI

3. **ערך לנציג**
   - זה מה שמפריד בינכם לבין מתכנת צעיר שבונה בוט. V-One כולל: keywords, context לפי מדינה, escalation logic, ושילוב עם Maintenance AI.

---

## 2. ארכיטקטורת White-Label (התאמה למותג הקונה)

**היכולת:** למכור את המערכת כך שתיראה כאילו הקונה פיתח אותה.

### הנחיות לטכנאי

1. **מערכת Multi-Tenant קיימת**
   - `tenantMiddleware` – כל request עם `x-building-id`
   - `multiTenancyPlugin` – סינון אוטומטי בבסיס הנתונים
   - ראה: `docs/MULTI_TENANT_SECURITY.md`

2. **Theme Engine** ✅ (מיושם)
   - `Building.branding`: { logoUrl, primaryColor, secondaryColor, customDomain }
   - `GET /api/buildings/branding?buildingId=xxx` – מחזיר הגדרות Theme
   - `ThemeProvider` + `applyBranding()` – מפעיל CSS variables: `--brand-primary`, `--brand-secondary`, `--brand-logo`
   - קובץ: `apps/web/src/config/themeEngine.ts`, `apps/web/src/context/ThemeContext.tsx`

3. **ערך לנציג**
   - הופך את Vantera למוצר שחברות ניהול ענקיות יכולות למכור תחת השם שלהן (Private Label).

---

## 3. בסיס הנתונים ובעלות על המידע (Data Sovereignty)

**הנכס:** המידע שהמערכת אוספת על הבניינים.

### הנחיות לטכנאי

1. **נתונים מובנים (Structured Data)**
   - ראה: `docs/HSLL_DATABASE_SCHEMA.md`
   - `docs/DATABASE_SCHEMA_APPROVAL.md` (אם קיים)

2. **מפרט DB Schema**
   - היסטוריית תקלות: `Maintenance` עם `aiAnalysis`, `source`, `evidence`, `technicianReport`
   - צריכת אנרגיה: אם יש מודל – לתעד; אחרת להגדיר כ"ממתין ליישום"
   - VisionLog, Ledger, Building stats – Big Data Ready (indexed, queryable, exportable)

3. **תיעוד Big Data Ready**
   - Compound indexes: `(buildingId, createdAt)`, `(buildingId, status)`
   - פורמט נתונים שניתן לייצא ל-CSV/Parquet לניתוח חיצוני
   - שווי: מידע כזה שווה הון לחברות ביטוח ויזמי נדל"ן.

---

## 4. חבילת Compliance (התאמה לשווקים)

**בלי זה:** חברה בצרפת או בארה"ב לא תיגע במוצר.

### הנחיות לטכנאי

1. **GDPR (אירופה)**
   - ראה: `apps/web/src/pages/seqerty/PolitiqueConfidentialiteFR.tsx` – מדיניות פרטיות
   - Cookie Banner: `apps/web/src/components/CookieBanner.tsx` – תואם CNIL
   - Legal Hub: `apps/web/src/pages/LegalHubPage.tsx` – FR/IL/US/GB

2. **SOC2 (ארה"ב – אבטחת מידע)**
   - תיעוד: `docs/TRUST_PRIVACY_STATEMENT.md`
   - AES-256, Audit logs, Data isolation per tenant

3. **Penetration Test**
   - להריץ בדיקת חדירות בסיסית (OWASP ZAP או שירות חיצוני)
   - לתעד תוצאות ב-`docs/COMPLIANCE_CHECKLIST.md`

---

## אפשרויות רכישה (להצגה למשקיע)

במקום טבלת מחירים חודשית – שלוש אפשרויות רכישה:

| אפשרות | תיאור |
|--------|-------|
| **Exclusive Buyout** | רכישה מלאה של הטכנולוגיה והעברת Source Code לקונה |
| **Strategic Licensing** | רישיון לשימוש בלתי מוגבל בפורטפוליו של הקונה (ללא בעלות על הקוד) |
| **Regional Exclusive** | מכירת הזכויות הבלעדיות לשימוש ב-Vantera בטריטוריה מסוימת (למשל: "הבלעדיות על כל צרפת") |

---

## הצעד הבא: Technical Executive Summary

**מסמך מקור:** `docs/TECHNICAL_EXECUTIVE_SUMMARY.md` – התוכן המקצועי המלא (שפת M&A).  
**הנחיה למנכ"לית:** `docs/CEO_EXECUTIVE_BRIEFING_GUIDANCE.md` – איך להדגיש לפי קהל (צרפת→Loi Élan, ארה"ב→NOI, טכנאי→README).

**בדף הנחיתה/Insights** – סקשן `technicalOnePagerSection` ב-`landing-pages.json` (he/en/fr).

---

## סיכום – רשימת קבצים לבדיקה

| מסמך/קובץ | תיאור |
|-----------|-------|
| `V_ONE_IP_DOCUMENTATION.md` | תיעוד Core IP |
| `MULTI_TENANT_SECURITY.md` | ארכיטקטורת Multi-Tenant |
| `HSLL_DATABASE_SCHEMA.md` | מפרט DB Schema |
| `TRUST_PRIVACY_STATEMENT.md` | אמון, פרטיות, GDPR |
| `themeEngine.ts` + `ThemeContext.tsx` | White-Label – לוגו, צבעים, דומיין (מיושם) |
| `COMPLIANCE_CHECKLIST.md` | GDPR, SOC2, Pen Test |
| `TECHNICAL_EXECUTIVE_SUMMARY.md` | סיכום טכני מקצועי (M&A) |
| `CEO_EXECUTIVE_BRIEFING_GUIDANCE.md` | הנחיה למנכ"לית – דגשים לפי קהל |
