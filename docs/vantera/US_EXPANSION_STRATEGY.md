# US Expansion Strategy – הנחיות טכניות ל-CTO ולטכנאי

תיעוד אסטרטגיית המעבר לשוק האמריקאי: Internationalization (i18n), Multi-currency, Feature Flags, Data Residency ו-ADA Compliance.

---

## 1. עקרון הליבה: Core גלובלי + שכבות התאמה מקומית

> **"אנחנו נשארים ב-Monorepo, אבל מטמיעים תשתית של i18n ותמיכה ב-Multi-currency כבר עכשיו, כדי שה-Core יהיה מוכן ל-Global Scale."**

- הקוד משותף; ההתנהגות משתנה לפי `country_code` / `locale`.
- Environment Variables & Context מגדירים: Currency, Units, Date Format, Feature Flags.

---

## 2. Internationalization (i18n) – יותר מסתם "שפה"

### 2.1 תשתית קיימת (apps/web/src/i18n/)

| קובץ | תפקיד |
|------|-------|
| `locale.ts` | CountryCode (IL/US/GB), LocaleConfig: currency, dateFormat, pressureUnit, tempUnit |
| `formatters.ts` | formatDate, formatCurrency, formatPressure, formatTemp |
| `useLocale.ts` | Hook: locale, setCountry, formatDate/Currency/Pressure/Temp, isUS, isIL, flags |
| `featureFlags.ts` | useStripe, useBit, twilioSms, americanAppliances, adaCompliance |

### 2.2 התנהגות לפי אזור

| אמצעי | IL | US |
|-------|----|-----|
| תאריך | DD/MM/YYYY | MM/DD/YYYY |
| מטבע | ₪ (ILS) | $ (USD) |
| לחץ מים (AI Vision) | bar | PSI |
| טמפרטורת דוד | °C | °F |
| תקלות מיוחדות | — | Dishwasher, Garbage Disposal |

### 2.3 זיהוי אזור

- **`VITE_REGION`** – משתנה סביבה (US/IL/GB)
- **localStorage** – `app_locale_country` (עקיפה ידנית)
- **Timezone heuristic** – `America/*` → US; `Europe/London` → GB

---

## 3. V-One האמריקאי – ADA כנשק שיווקי

- הבוט הקולי: **ADA Compliant by Design**
- חובה טכנית:
  - תמיכה ב-**Screen Readers** (ARIA, roles, labels)
  - **תמלול חי (Live Captions)** באווטאר
- Multi-Lingual: מעבר אנגלית↔ספרדית (מיאמי) בלי לאבד הקשר

---

## 4. The Insurance Play – Building Health Report

- דו"ח בריאות בניין חודשי (Building Health Report)
- חברות ניהול מגישות לחברת הביטוח → הוכחת Time to Resolution
- Dashboard ייעודי ל-Underwriters: גרף "צמצום סיכונים"

---

## 5. התשתית הטכנית (The American Stack)

| רכיב | IL | US |
|------|----|-----|
| תשלומים | Bit / מסב | **Stripe Connect** (Split payments) |
| SMS | — | **Twilio** – הודעות לנייד |
| Data Residency | — | **AWS/GCP us-east-1** – נתונים אמריקאים בשרתים בארה"ב |
| פרטיות | — | SOC2, שאלות "איפה המידע?" |

---

## 6. Feature Flags

```ts
// VITE_STRIPE_ENABLED, VITE_BIT_ENABLED, VITE_TWILIO_ENABLED
flags.useStripe   // US
flags.useBit      // IL
flags.twilioSms   // US
flags.americanAppliances  // US: Dishwasher, Garbage Disposal
flags.adaCompliance       // US
```

---

## 7. Data Residency – הפרדת נתונים

- **קוד**: משותף (Monorepo)
- **נתונים**: מופרדים פיזית
  - US → `us-east-1` (AWS/GCP)
  - IL → `eu-west-1` או equivalent
- Edge Computing (Vercel / AWS): ניתוב לפי מיקום המשתמש

---

## 8. Database Schema – Building (Prisma/MongoDB)

עדכון מודל Building כדי לתמוך באזורים שונים:

```ts
// buildingModel.ts – שדות חדשים
interface IBuilding {
  buildingId: string;
  address: string;
  buildingNumber: string;
  committeeName?: string;
  country?: string;      // "IL" | "US" – קריטי ל-AI ו-UI
  currency?: string;     // "ILS" | "USD" – @default לפי country
  timezone?: string;     // "Asia/Jerusalem" | "America/New_York" – לתיאום טכנאים
  units?: string;        // "METRIC" | "IMPERIAL"
  // כתובות US: State, Zip Code, County (לא רק עיר+רחוב)
  state?: string;
  zipCode?: string;
  county?: string;
}
```

**חובה**: כל תאריך/שעה ב-DB נשמר ב-**UTC בלבד** (MongoDB `Date` כבר ב-UTC). המרה ל-Time Zone מקומי (`building.timezone` או משתמש) נעשית **רק ב-UI**.

---

## 9. Red Flags – נורות אדומות (לבדיקה מול הטכנאי)

### 🚩 1. Timezones (אזורי זמן)

| טעות | סיכון | פתרון |
|------|--------|--------|
| שמירת זמן לפי שעון ישראל | דייר במיאמי מדווח נזילה ב-10:00, המערכת רושמת 17:00 → אוטומציה שבורה | **כל תאריך ב-DB ב-UTC**. המרה ל-locale רק ב-UI |

### 🚩 2. Hardcoded Text (טקסט תקוע)

| טעות | סיכון | פתרון |
|------|--------|--------|
| `alert("תקלה נרשמה")` בקוד | אלפי שורות לחפור בעת מעבר לארה"ב | **אין מילה בעברית/אנגלית ב-Components**. הכל דרך קבצי i18n JSON |

### 🚩 3. Address Validation (אימות כתובות)

| טעות | סיכון | פתרון |
|------|--------|--------|
| שדה כתובת ישראלי (עיר, רחוב, מספר) | בארה"ב: State, Zip Code, County – ללא Zip תקין תשלומים/ביטוח לא יעבדו | **Google Places API** – אימות כתובות, פורמט לפי מדינה (Country-specific address forms) |

### 🚩 4. Stripe API – Sales Tax (מס קנייה)

| טעות | סיכון | פתרון |
|------|--------|--------|
| גבייה בארה"ב בלי חישוב מס | Sales Tax שונה לכל State – גבייה בלי מס = עבירה פלילית | **Stripe Tax** – חישוב אוטומטי לפי כתובת הבניין |

---

## 10. שאלות לאימות (בפגישה עם הטכנאי)

1. **"איך המערכת תדע להציג Fahrenheit לדייר בניו יורק ו-Celsius לדייר בירושלים באותו רכיב?"**
   - תשובה נכונה: Global State או Context (useLocale).

2. **"איפה אנחנו שומרים את הנתונים של המשתמשים האמריקאים?"**
   - תשובה נכונה: Region נפרד בארה"ב (us-east-1) מטעמי Privacy.

3. **"האם ה-V-One יודע לזהות Zip Code אמריקאי של 5 או 9 ספרות?"**
   - חובה: תמיכה בפורמט US (12345 או 12345-6789).

---

## 11. מבנה Monorepo – target structure

### packages/config (הגדרות גלובליות)

```
packages/config/
  locales.ts    – שפות: he-IL, en-US, es-US
  currencies.ts – ILS vs USD, פורמט הצגה
  units.ts      – Metric vs Imperial
```

### packages/i18n (שפה ותרגום)

- כל טקסט דרך מפתחות – **לא** hardcoded ב-Components.
- קבצים: `he.json`, `en.json` – לדוגמה: `"leak_detected": "זוהתה נזילה בבניין"`.

### packages/ui/components (רכיבים לפי Region)

| רכיב | התנהגות |
|------|---------|
| `PriceDisplay.tsx` | $5 או ₪11 אוטומטית לפי מיקום |
| `DateSelector.tsx` | לוח שנה אמריקאי (ראשון) או ישראלי |

---

## 12. V-One – Context Header ל-OpenAI

הוספת "Context Header" לכל פנייה ל-OpenAI:

```ts
const systemContext = `When user comes from country: ${building.country || 'IL'},
- Use professional HOA terms if US.
- Use Fahrenheit for temperatures, dollars for prices (US only).
- Ensure prices are stated in dollars only when country is US.
- Support Spanish in-context for Miami residents.`;
```

ה-AI וה-UI יודעים איזה "סט חוקים" להפעיל לפי `building.country` / `region`.

---

## 13. קבצים ותיקיות חדשים (מימוש)

### packages/config
- `locales.ts` – he-IL, en-US, es-US
- `currencies.ts` – ILS, USD, GBP
- `units.ts` – METRIC, IMPERIAL

### packages/i18n
- `locales/he.json`, `locales/en.json`, `locales/es.json` – מפתחות לתרגום (leak_detected, fault_reported, וכו')

### apps/web
- `components/PriceDisplay.tsx` – $ או ₪ לפי locale
- `components/DateSelector.tsx` – תאריך לפי DMY/MDY
- `i18n/locale.ts`, `formatters.ts`, `useLocale.ts`, `featureFlags.ts`

### apps/api
- `models/buildingModel.ts` – country, currency, timezone, units, state, zipCode, county
- `models/maintenanceModel.ts` – Dishwasher, GarbageDisposal ב-category
- `utils/voneContext.ts` – buildVOneSystemContext
- `routes/voneChatRoutes.ts` – Building country, מילות מפתח באנגלית

### API Client (apps/web)
- `api.ts` – Header `x-country-code` ב-getApiHeaders
- `ReportFaultPage.tsx` – שילוב `useLocale` + קטגוריות אמריקאיות (Dishwasher, Garbage Disposal)

---

## 14. שלבים מומלצים להמשך

1. הוספת `country_code` ל-API requests (Header / Context)
2. Backend: routing לפי region, Data Residency
3. Stripe Connect + **Stripe Tax** + Twilio – אינטגרציה
4. ADA: Captions + Screen Reader audit ב-V-One
5. Building Health Report + Underwriters Dashboard
6. **Google Places API** – אימות כתובות לפי מדינה
7. העברת כל Hardcoded strings לקבצי i18n JSON (next-intl / react-i18next)
