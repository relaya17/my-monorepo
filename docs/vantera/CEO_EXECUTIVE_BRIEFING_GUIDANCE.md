# הנחיה למנכ"לית – איך להשתמש ב-Technical Executive Summary

**מסמך זה מיועד לצוות הניהול.** איך להציג את Vantera כמנהל/משקיעים שונים – בלי כפילות, עם מסרים ממוקדים.

---

## איך להשתמש בדף

את הדף (**Technical Executive Summary**) שולחים כקובץ **PDF מעוצב** – על הרקע הכהה והיוקרתי של Vantera.  
זהו מסמך **יחיד** – אין צורך בעותקים שונים. במקום זה, **תדגישי** סעיפים שונים לפי קהל היעד.

---

## דגשים לסגירה לפי קהל

### למנכ"ל בצרפת

**תדגישי:** סעיף 3 – **Key Strategic Assets**, במיוחד **Loi Élan**.

> "Vantera fully compliant with Loi Élan (France) – we understand your market. Regulatory-ready from day one."

זה מה שגורם להם להבין שאת מבינה את השוק שלהם – לא רק טכנולוגיה גנרית, אלא התאמה למסגרת הרגולטורית הצרפתית.

---

### לקרן בארה"ב

**תדגישי:** סעיף 1 – **Vision & Core Value Proposition**, במיוחד **NOI (Net Operating Income)**.

> "Up to 60% reduction in operational overhead. Direct impact on NOI – the metric that matters."

זה המדד היחיד שמעניין קרנות נדל"ן אמריקאיות. אל תדברי על "טכנולוגיה" – תדברי על **רווח לכל דלת**.

---

### לטכנאי (הנחיה פנימית)

**תגידי לו:**

> "תתחיל לארגן את ה-README של הקוד ואת ה-API Documentation. אם מישהו בא לקנות אותנו מחר, הוא צריך לראות שהקוד מסודר כמו בספר."

**משימות מוגדרות:** ראה `PENDING_REQUESTS_CONSOLIDATED.md` משימה #32.

- README מרכזי – ארכיטקטורה, הרצה, משתני סביבה
- API Documentation – Swagger/OpenAPI או דוקומנטציה לכל endpoint
- מבנה קוד ברור – תגיות, סדר קבצים, הערות במקומות קריטיים

---

## ללא כפילות

כל 3 דפי הנחיתה (כללי, ארה"ב, צרפת) משתפים את **אותו Technical One-Pager** – אין צורך בעותקים נפרדים.  
התוכן ממוקם ב-`landing-pages.json` לפי שפה (he/en/fr), והמסמך המקור לסגירה הוא `TECHNICAL_EXECUTIVE_SUMMARY.md`.
