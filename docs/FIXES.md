# הוראות תיקון מיידי – Monorepo

## 1. Clean Install (אם יש שגיאות Invalid Hook Call / כפילות React)

```bash
# מחיקת node_modules מכל הפרויקטים
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\api\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages\shared\node_modules -ErrorAction SilentlyContinue

# מחיקת cache
Remove-Item -Recurse -Force apps\web\node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force pnpm-lock.yaml -ErrorAction SilentlyContinue

# התקנה מחדש
pnpm install
```

## 2. בדיקת כפילות React

```bash
pnpm ls react
pnpm ls react-dom
```

React צריך להיות בגרסה אחת בלבד (^18.2.0). אם מופיעות גרסאות מרובות – ה-overrides ב-package.json אמורים לאחד.

## 3. הפעלת Dev Server

```bash
pnpm dev
```

## 4. Vite HMR – גישה מ-LAN (192.168.x.x)

אם נכנסים מהמחשב לכתובת `http://192.168.0.100:5174`, ה-HMR משתמש ב-`localhost`. כשמשתמשים במכשיר אחר ברשת – יש להריץ עם:

```bash
# ב-vite.config.ts ה-hmr מוגדר ל-localhost. אם צריך HMR ממכשיר אחר:
# שנה ל-hmr: { host: '192.168.0.100', clientPort: 5174 }
# (החלף 192.168.0.100 ב-IP של המכונה שמריצה את Vite)
```
