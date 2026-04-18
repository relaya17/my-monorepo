# Stripe Connect & Webhooks – Payment Flow מאובטח

**מטרה:** קבלת תשלומים מדיירים לידי הוועד (Connect), גביית עמלה לפלטפורמה, ועדכון Dashboard בזמן אמת דרך Webhooks.

---

## 1. משתני סביבה (API)

| משתנה | חובה | תיאור |
|--------|------|--------|
| `STRIPE_SECRET_KEY` | כן ( production) | מפתח סודי מ-Stripe Dashboard (למשל `sk_live_...` או `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | כן (לעדכונים) | סוד חתימת Webhook – מתקבל ב-Stripe Dashboard → Developers → Webhooks |
| `STRIPE_PLATFORM_FEE_BPS` | לא (ברירת מחדל 100) | עמלה בפלטפורמה ב-basis points (100 = 1%) |
| `CLIENT_URL` | כן (ל-checkout) | כתובת ה-Frontend (למשל `https://app.vantera.io` או `http://localhost:5174`) |

---

## 2. Stripe Connect – זרימת Onboarding

כדי שבניין יוכל **לקבל תשלומים** (ודרך הוועד לשלם לספקים בעתיד), הוועד מגדיר חשבון Stripe Connect (Express).

### 2.1 יצירת קישור Onboarding

**POST** `/api/stripe/connect/onboard`

**Body (JSON):**
```json
{
  "buildingId": "default",
  "returnUrl": "https://yourapp.com/settings?stripe=return",
  "refreshUrl": "https://yourapp.com/settings?stripe=refresh"
}
```

**תגובה:**
```json
{
  "url": "https://connect.stripe.com/express/...",
  "accountId": "acct_xxx"
}
```

- הלקוח מפנה את המשתמש ל-`url` (חלון או redirect).
- אחרי שהמשתמש מסיים ב-Stripe (בנק, פרטים), הוא חוזר ל-`returnUrl`.
- חשבון ה-Connect נשמר ב-`Building.stripeAccountId`; Webhook `account.updated` מעדכן `stripeOnboardingComplete`.

### 2.2 כניסה ל-Dashboard של Stripe (Express)

**POST** `/api/stripe/connect/login`

**Body:** `{ "buildingId": "default" }`

**תגובה:** `{ "url": "https://connect.stripe.com/express/..." }` – קישור חד-פעמי לכניסה ל-Stripe Express.

### 2.3 סטטוס Connect

**GET** `/api/stripe/connect/status?buildingId=default`

**תגובה:**
```json
{
  "accountId": "acct_xxx",
  "chargesEnabled": true,
  "detailsSubmitted": true
}
```

- אם `accountId` null – יש לפתוח Onboarding.
- אם `detailsSubmitted` false – Onboarding לא הושלם.
- `chargesEnabled: true` – אפשר לקבל תשלומים.

---

## 3. Checkout (תשלום דייר)

**POST** `/api/stripe/checkout-session`

**Body (JSON):**
```json
{
  "amount": 150,
  "payer": "שם הדייר",
  "tenantId": "optional",
  "buildingId": "default",
  "buildingStripeAccountId": "acct_xxx"
}
```

- `buildingStripeAccountId` – מחזירים מ-`/api/buildings` (שדה `stripeAccountId`) או מ-`/api/stripe/connect/status`.
- התשלום מתבצע ב-Stripe Checkout; אחרי תשלום מוצלח:
  - רוב הסכום מועבר ל-Connect account של הבניין.
  - עמלה (לפי `STRIPE_PLATFORM_FEE_BPS`) נשמרת לפלטפורמה.

**תגובה:** `{ "id": "cs_xxx", "paymentId": "..." }` – ה-Frontend מפנה ל-`https://checkout.stripe.com/...` עם ה-session `id` (או משתמש ב-Stripe.js).

---

## 4. Webhooks – עדכון בזמן אמת

**Endpoint:** `POST /api/webhooks/stripe`

- **חשוב:** ה-route הזה **לא** עובר דרך `express.json()` – גוף הבקשה נשאר raw (Buffer) כדי ש-Stripe יוכל לאמת חתימה.
- ב-Stripe Dashboard: **Developers → Webhooks → Add endpoint** → URL: `https://your-api.com/api/webhooks/stripe`.
- אירועים מומלצים:
  - `checkout.session.completed` – עדכון תשלום ל-paid ויצירת תנועה (Transaction).
  - `payment_intent.succeeded` – גיבוי לעדכון תשלום אם אין metadata ב-session.
  - `account.updated` – עדכון `Building.stripeOnboardingComplete` כשהחשבון הושלם.

### 4.1 מה קורה באירועים

| אירוע | פעולה |
|--------|--------|
| `checkout.session.completed` | עדכון `Payment` ל-`status: 'paid'`, יצירת `Transaction` (income) לבניין. |
| `payment_intent.succeeded` | אם יש `Payment` עם `stripePaymentIntentId` שעדיין לא paid – מעדכן ויוצר Transaction. |
| `account.updated` | אם `account.details_submitted === true` – מעדכן `Building.stripeOnboardingComplete`. |

---

## 5. מודל Building (רלוונטי ל-Connect)

- `stripeAccountId` – מזהה חשבון Stripe Connect (Express).
- `stripeOnboardingComplete` – עודכן דרך Webhook `account.updated`.

שדות אלה מוחזרים ב-**GET** `/api/buildings` כדי שה-Frontend יידע אם להציג "התחבר ל-Stripe" או "הגדר תשלומים".

---

## 6. הצעד הבא (Pay Supplier)

כדי לאפשר **לוועד לשלם לספקים** (גננים, מנקים) ישירות מהאפליקציה:

- **ספקים כ-Connect accounts:** הרשמת ספק כ-Stripe Connect (Express), ואז העברת כסף מחשבון הבניין לחשבון הספק (Transfers / Payment Intents עם `transfer_data`).
- או: **Payouts** – הוועד מושך מהאפליקציה ל-bank account (כבר נתמך ב-Stripe Express).

המימוש של "Pay Supplier" יוגדר בשלב Fintech הבא (ראו `docs/vantera/STRATEGY_X_FACTOR_AND_ENGINEERING_ROADMAP.md`).
