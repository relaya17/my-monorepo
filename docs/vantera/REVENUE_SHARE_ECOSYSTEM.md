# Revenue Share Ecosystem – מנוע ייצור הכנסות (Marketplace)

**מודל:** Vantera OS היא לא הוצאה – היא הכנסה. חברת האחזקה הופכת ל-Marketplace של הבניין.

---

## 1. הקונספט

| שלב | תיאור |
|-----|--------|
| **Intent Detection** | V-One סורק כל הודעה ומוודא "כוונת נדל"ן" – מילות מפתח + Semantic |
| **Lead Flow** | הלידים החמים מועברים ישירות למחלקת הנדל"ן של חברת האחזקה |
| **Real-time Alert** | מייל אוטומטי: **"Hot Real Estate Lead Found"** למנהל הנכס |
| **Win-Win** | חברת האחזקה: עמלות גדולות. Vantera: $10 (US) / 10₪ (IL) עמלת תיווך טכנולוגי |

---

## 2. זיהוי כוונות (Intent Recognition Engine)

**שכבה שסורקת כל הודעה** – `voneChatRoutes.ts`

### 2.1 מילות מפתח ישירות (מכירה/השכרה)

| שפה | מכירה | השכרה |
|-----|-------|-------|
| עברית | מכור, למכור, מכירה, מחפש קונה | להשכיר, השכרה, חוזה שכירות |
| אנגלית | sell, for sale, looking for buyer | rent, for rent, lease contract |
| צרפתית | vendre, vente, cherche acheteur | louer, location, contrat de location |

### 2.2 High Value Lead – כוונות עקיפות

| ביטוי | משמעות | dealType |
|-------|--------|----------|
| הערכת שווי | מעוניין במכירה | sale |
| מעבר דירה | מעבר / השכרה | rent |
| חוזה שכירות | הקשר השכרה | rent |
| מתי מסתיים החוזה | סיום שכירות / חידוש | rent |
| מחפש קונה | מכירה | sale |
| property valuation | שווי נכס | sale |
| when does the lease end | סיום חוזה | rent |

**מיקום:** `apps/api/src/routes/voneChatRoutes.ts` – `SELL_RENT_KEYWORDS_*`, `inferDealType()`

---

## 3. זרימת הרווחים (The Profit Flow)

| גורם | מה הוא מקבל | איך זה קורה במערכת |
|------|-------------|---------------------|
| **הדייר** | שירות VIP מהיר למכירה/השכרה | ה-AI עונה: "אני מעביר אותך למנהל הנכס שיעזור לך לסגור עסקה מהר." |
| **חברת האחזקה** | הרווח הגדול – עמלת תיווך/מכירה | המערכת שולחת "ליד חם" לדשבורד + מייל עם כל פרטי הדירה והדייר |
| **Vantera** | עמלת תיווך טכנולוגי: $10 (US) / 10₪ (IL) | RealEstateLead נרשם; חיוב אוטומטי בסוף חודש (Stripe Metered – TODO) |

---

## 4. זרימת הליד (טכנית)

```
דייר כותב "הערכת שווי לדירה שלי" / "Looking to sell"
  → Intent Recognition מזהה כוונה
  → inferDealType() → sale | rent
  → createRealEstateLead(residentId, dealType, message, buildingId)
  → RealEstateLead נוצר (סטטוס: new)
  → notifyManagerOnLead:
      - אם committeeContact מכיל @ → sendRealEstateLeadAlert("Hot Real Estate Lead Found")
      - emitWebhookEvent('real_estate_lead')
  → recordLeadForBilling(+$10 / +10₪ – Stripe TODO)
  → תשובה: "מעולה! עדכנתי את מנהל הנכס..."
```

---

## 5. מודל הנתונים

**RealEstateLead** (`realEstateLeadModel.ts`):
- residentId, apartmentNumber, residentName, residentEmail, residentPhone?
- dealType: sale | rent
- status: new | in_progress | closed
- source: vone_ai

---

## 6. דשבורד מנכ"לית (Real Estate Opportunities)

**טאב** – `SuperAdminDashboard.tsx`:
- טבלה: דירה | דייר | סוג (מכירה/השכרה) | סטטוס (חדש/בטיפול/נסגר) | בניין | צור קשר
- כפתור מייל (`mailto`)
- כפתור WhatsApp (אם residentPhone קיים)
- ספירת לידים החודש

---

## 7. מערכת התראות (Notification System)

| תהליך | תיאור |
|-------|--------|
| **Email** | Subject: **"Hot Real Estate Lead Found"** – נשלח ל-`committeeContact` (אם אימייל) |
| **Webhook** | אירוע `real_estate_lead` – מנויים חיצוניים יכולים לקבל |
| **Dashboard** | הליד מופיע מיידית ב-Real Estate Opportunities |

**מיקום:** `emailService.sendRealEstateLeadAlert()`, `realEstateLeadService.notifyManagerOnLead()`

---

## 8. Billing (Stripe Metered)

**הנחיה:** על כל ליד – הוספת $10 (US) או 10₪ (IL) לחשבונית החודשית של חברת האחזקה.

**מיקום:** `realEstateLeadService.recordLeadForBilling()` – TODO: חיבור Stripe Billing API.

---

## 9. ההצעה למנכ"לים (The Pitch)

> "Vantera OS היא לא הוצאה, היא הכנסה. המערכת שלי הופכת כל דייר בבניין ללקוח פוטנציאלי של מחלקת הנדל"ן שלכם. אתם תרוויחו את העמלות הגדולות על המכירות וההשכרות, ואני אקח רק $10 דמי תיווך טכנולוגי על כל דייר שהמערכת מביאה לכם. אני השותפה השקטה שלכם לצמיחה."

**Lock-in:** חברת האחזקה לא תרצה להפסיק Vantera אם היא מביאה עסקאות נדל"ן על מגש של כסף.

---

*מסמך זה משלים את V_ONE_IP_DOCUMENTATION, LAUNCH_STRATEGY ו-VANTERA_2026_STRATEGY_AND_ROADMAP.*
