# מדריך אבטחה - הפרויקט

## משתני סביבה חשובים

צור קובץ `.env` בתיקיית `apps/api` עם המשתנים הבאים:

```env
# משתני סביבה ל-API
NODE_ENV=development
PORT=3008

# מסד נתונים
MONGO_URI=mongodb://localhost:27017/payments_db

# JWT Secret (חשוב לאבטחה)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
COOKIE_SECRET=your-super-secret-cookie-key-change-this-in-production

# Admin Default
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/server.log
```

## אמצעי אבטחה שהוטמעו

### 1. Rate Limiting
- הגבלת בקשות: 100 בקשות ל-15 דקות לכל IP
- הגבלת התחברות: 5 ניסיונות ל-15 דקות לכל IP

### 2. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer Policy: strict-origin-when-cross-origin

### 3. Input Validation
- ניקוי קלט מפני XSS
- הסרת תווים מסוכנים
- אימות סוגי נתונים

### 4. Authentication & Authorization
- בדיקת JWT tokens
- הרשאות אדמין
- הגנה על נתיבים רגישים

### 5. CORS Configuration
- הגבלת מקורות מורשים
- הגדרת credentials
- הגדרת methods מורשים

## קבצים חסרים שצריך ליצור

### 1. קובץ .env
צור קובץ `.env` בתיקיית `apps/api` עם המשתנים למעלה.

### 2. תיקיית logs
```bash
mkdir -p apps/api/logs
```

### 3. קובץ .gitignore
וודא שקובץ `.gitignore` כולל:
```
.env
logs/
uploads/
node_modules/
*.log
```

## הוראות אבטחה נוספות

### 1. שינוי סיסמות ברירת מחדל
- שנה את סיסמת האדמין מ-`admin123`
- שנה את כל ה-JWT secrets

### 2. הגדרת HTTPS בפרודקשן
- השתמש ב-SSL/TLS
- הגדר HSTS headers

### 3. גיבוי מסד נתונים
- הגדר גיבויים אוטומטיים
- בדוק את תקינות הגיבויים

### 4. ניטור ובקרה
- הגדר logging מתקדם
- עקוב אחר ניסיונות התחברות כושלים
- הגדר התראות על פעילות חשודה

## בדיקות אבטחה

### 1. בדיקת Rate Limiting
```bash
# בדוק שהגבלת בקשות עובדת
curl -X GET http://localhost:3008/api/test
```

### 2. בדיקת Security Headers
```bash
# בדוק שה-headers מוגדרים נכון
curl -I http://localhost:3008/
```

### 3. בדיקת Input Validation
```bash
# בדוק שניקוי קלט עובד
curl -X POST http://localhost:3008/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<script>alert(1)</script>","password":"test"}'
```

## עדכונים עתידיים

- [ ] הוספת Two-Factor Authentication
- [ ] הוספת Audit Logging
- [ ] הוספת Data Encryption
- [ ] הוספת API Rate Limiting מתקדם
- [ ] הוספת Security Scanning 