# תיקון תצוגת קישור ב-WhatsApp – אין תמונה

## הבעיה
כששולחים `https://my-monorepo.netlify.app` ב-WhatsApp, מופיעים כותרת ותיאור **ללא תמונה**.

## הפתרון – ניקוי Cache של WhatsApp/Facebook

WhatsApp (Meta) שומר cache לתצוגות קישורים. כשהאתר היה בלי `og:image`, השתמרה התצוגה הישנה.

### שלב 1: לוודא שהתמונה נגישה
פתחי בדפדפן: https://my-monorepo.netlify.app/images/og-image.png  
אם מופיעה תמונה – המצב תקין.

### שלב 2: רענון Cache ב-Meta (Facebook/WhatsApp)
1. היכנסי ל: https://developers.facebook.com/tools/debug/
2. הזיני: `https://my-monorepo.netlify.app/`
3. לחצי **Debug**
4. לחצי **Scrape Again** (מרענן את ה-cache)

### שלב 3: שליחה מחדש ב-WhatsApp
- שלחי את הקישור **מחדש** (לאחר ה-Scrape Again)
- או שלחי עם פרמטר: `https://my-monorepo.netlify.app/?v=1` – זה מעודד שליפה מחדש
