# Multi-Tenant Security – איך דייר בבניין א' לא יראה אף פעם תקלה מבניין ב'

**השאלה:** איך אתה מוודא שדייר בבניין א' לא יוכל בטעות לראות את התקלה של דייר בבניין ב'?

**תשובה חובבנית (מסוכנת):** "אני אשים לב בסינון של ה-Database."

**תשובה מקצועית (איך זה בנוי ב-HSLL):**  
Middleware גלובלי שמוסיף אוטומטית `buildingId` לכל בקשה, ו-**Data Access Layer** (plugin ב-Mongoose) שמונע גישה חוצת-דייר **ברמת התשתית** – כך שזה בלתי אפשרי "לשכוח" לסנן.

---

## 1. Global Middleware – כל בקשה מקבלת הקשר דייר

**קובץ:** `apps/api/src/middleware/tenantMiddleware.ts`

- **כל** הבקשות ל-`/api/*` (מלבד webhooks ו-public) עוברות דרך `tenantMiddleware` לפני ה-routes.
- ה-middleware קורא את `x-building-id` מה-header ומריץ את שאר ה-request בתוך **AsyncLocalStorage** עם ה-`buildingId` הזה.
- אם יש JWT – בודקים ש-`buildingId` ב-token תואם ל-header (מניעת **Tenant Hopping**). אי-התאמה → 403 + רישום ב-AuditLog.

```ts
// index.ts – כל ה-API תחת tenant
app.use('/api', tenantMiddleware, routes);
```

כלומר: אין route שמגיע ל-DB בלי הקשר דייר מוגדר.

---

## 2. Data Access Layer – אי אפשר "לשכוח" לסנן

**קובץ:** `apps/api/src/utils/multiTenancy.ts` (Mongoose plugin)

- המודלים הרלוונטיים (User, Payment, Maintenance, Transaction וכו') משתמשים ב-`multiTenancyPlugin`.
- ה-plugin מוסיף **pre-hooks** ל:
  - `find`, `findOne`, `findOneAndUpdate`, `updateMany`, `countDocuments`, `distinct`, `deleteOne`, `deleteMany`, `updateOne`, `findOneAndDelete`
  - `aggregate` (הוספת `$match: { buildingId }` בתחילת ה-pipeline)
  - `save` (הזרקת `buildingId` ל-document אם חסר)

בכל שאילתה ה-`buildingId` נלקח מ-**tenantContext.getStore()** (ה-AsyncLocalStorage שהגדיר ה-middleware).  
כלומר: גם אם מפתח "שכח" לכתוב `.where({ buildingId })`, ה-DB layer מוסיף את הסינון אוטומטית. דייר בבניין א' **פיזית לא יכול** לקבל רשומות מבניין ב'.

---

## 3. סיכום – למה "סינון ב-DB" לבד לא מספיק

| גישה | סיכון |
|------|--------|
| "אני אסנן ב-query" | שכחה ב-endpoint אחד, קוד חדש בלי סינון, או שינוי לוגיקה – דליפת נתונים. |
| **Middleware + Plugin (HSLL)** | הקשר דייר חובה על כל request; כל גישת DB עוברת דרך שכבת ה-plugin – בידוד ברמת התשתית. |

רלוונטי ל-**Job Description:**  
*"Build a secure, multi-tenant API that ensures 100% data isolation between buildings"* – המימוש הנוכחי עונה על זה באמצעות Global Middleware ו-Row-Level–style logic ב-Data Access Layer (Mongoose plugin), בלי להסתמך על "לזכור לסנן" בכל מקום.
