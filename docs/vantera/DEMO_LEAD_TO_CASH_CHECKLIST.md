# צ'ק-ליסט טכני – דמו "מליד למזומן"

## תרחיש הדמו: "מליד למזומן" (From Lead to Cash)

### הכנה מראש
- פתיחת **שני מסכים**: מסך 1 = אפליקציית הדייר (צ'אט V-One), מסך 2 = דשבורד CEO (Super Admin).

---

## צ'ק-ליסט טכני לפני הדמו

### 1. זמן תגובה (< 3 שניות)
- [ ] בדיקה: שליחת הודעה בצ'אט → תגובת AI חוזרת **תוך פחות מ-3 שניות**.
- [ ] אם יש עיכוב: לבדוק רשת, OPENAI_API_KEY (אם מוגדר), ואין תקלות בשרת.

### 2. Push Notification / התראה בולטת
- [ ] כשנוצר ליד חדש → **התראה אדומה מהבהבת** בדשבורד: `NEW REAL ESTATE OPPORTUNITY - UNIT 502`.
- [ ] **צליל קצר** מושמע אוטומטית בעת זיהוי ליד חדש.
- [ ] **Toast ירוק** מופיע בראש הדף: "ליד חדש – דירה 502 (מכירה)" ומתפוגג אחרי ~6 שניות.

### 3. Mobile Friendly
- [ ] הדשבורד נראה מעולה **במובייל** – padding מותאם, כרטיסים ניתנים לגלילה.
- [ ] בדיקה: פתיחת `/super-admin` בסמארטפון – הכול קריא ונוח.

---

## שלבי הדמו

### שלב 1: הזיהוי
מקלידים בצ'אט (כדייר):

> "היי, אני גר בדירה 502. רציתי לדעת אם יש לכם הערכת שווי עדכנית לנכס? אני שוקל לעבור לדירה גדולה יותר בקיץ."

### שלב 2: תגובת AI (Professional Filter)
ה-AI עונה מיד:

> "שלום דייר יקר. אני מעדכן את מחלקת הנדל"ן שלנו מיד. מנהל המכירות יחזור אליך תוך שעה עם הערכת שווי מדויקת וסקירת שוק. האם תרצה שנתאם פגישה?"

### שלב 3: רגע ה-WOW בדשבורד
מסובבים למנכ"ל:

- **התראה אדומה מהבהבת**: `NEW REAL ESTATE OPPORTUNITY - UNIT 502`
- **ההסבר**: "המערכת זיהתה כוונת מכירה, תייגה ליד חם, ושלחה הודעה. הסוכן יכול לסגור עסקת מכירה של 2 מיליון דולר בגלל שאלה קטנה בצ'אט."

### שלב 4: השורה התחתונה (Partner Commission)
מראים את הפינה "Partner Commission":

- **כרטיס Partner Commission** בשורת הסטטיסטיקות: `₪10` × לידים החודש.
- **ההסבר**: "הרווחת עמלת תיווך של $50,000. המערכת גבתה ממך אוטומטית $10 על הליד. Win-Win הכי גדול."

---

## דרישות טכניות

| רכיב              | צ'ק |
|-------------------|-----|
| דייר רשום עם `apartmentNumber: "502"` או הודעה含 "דירה 502" | ✓ |
| `committeeContact` בבניין מכיל אימייל (לשליחת התראה)       | ✓ |
| Polling כל 30 שניות – הדשבורד מתעדכן אוטומטית             | ✓ |
| מילות מפתח: הערכת שווי, שוקל לעבור, מכירה/השכרה            | ✓ |

---

## Netlify – וידוא עדכון אוטומטי

| צ'ק | תיאור |
|-----|--------|
| ☐ | Netlify מחובר ל-GitHub על `main` – Deploy מתבצע בכל push |
| ☐ | Build: `corepack enable pnpm && pnpm install && pnpm turbo run build --filter=web` |
| ☐ | Publish: `apps/web/dist` |
| ☐ | אם הדף לא מתעדכן: Site settings → Build & deploy → **Clear cache and deploy site** |

### Netlify לא רואה שינויים – צעדים:
1. **Netlify Dashboard** → בחר את האתר → **Deploys**
2. בדוק אם יש Deploy כושל (Failed) – אם כן, לחץ עליו וראה את הלוג
3. **Trigger deploy** → **Clear cache and deploy site** – זה מנקה cache ועושה build מחדש
4. וודא **Production branch** = `main` (Site settings → Build & deploy → Continuous deployment)
5. אם מחובר ל-repo אחר או branch אחר – תקן ב-Site configuration

---

## קבצים רלוונטיים

- `apps/api/src/routes/voneChatRoutes.ts` – זיהוי כוונה + תגובת AI
- `apps/api/src/services/realEstateLeadService.ts` – יצירת ליד, חילוץ דירה מהודעה
- `apps/web/src/pages/SuperAdminDashboard.tsx` – התראה אדומה, Partner Commission, Polling, צליל, Toast
