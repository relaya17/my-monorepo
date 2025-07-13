# 🤖 מערכת אוטומציה מלאה - פרויקט ניהול תשלומים

## 📋 תוכן עניינים
- [סקירה כללית](#סקירה-כללית)
- [התקנה מהירה](#התקנה-מהירה)
- [אוטומציות זמינות](#אוטומציות-זמינות)
- [CI/CD Pipeline](#cicd-pipeline)
- [ניטור והתראות](#ניטור-והתראות)
- [גיבויים אוטומטיים](#גיבויים-אוטומטיים)
- [Docker & DevOps](#docker--devops)
- [פקודות שימושיות](#פקודות-שימושיות)
- [פתרון בעיות](#פתרון-בעיות)

---

## 🎯 סקירה כללית

פרויקט זה כולל מערכת אוטומציה מלאה עם:
- ✅ **CI/CD Pipeline** עם GitHub Actions
- ✅ **ניטור אוטומטי** עם Prometheus + Grafana
- ✅ **גיבויים אוטומטיים** של מסד הנתונים
- ✅ **בדיקות אוטומטיות** (lint, test, build)
- ✅ **התראות חכמות** על שגיאות ובעיות
- ✅ **Docker Compose** להרצה מלאה
- ✅ **סקריפטים אוטומטיים** לכל התהליכים

---

## ⚡ התקנה מהירה

### אוטומציה מלאה (מומלץ)
```bash
# הרצת אוטומציה מלאה - מתקין הכל ומפעיל הכל
pnpm run automation:full
```

### אוטומציה מהירה
```bash
# בדיקות + בנייה בלבד
pnpm run automation:quick
```

### התקנה ידנית
```bash
# התקנת תלויות
pnpm install

# הרצת שרתים
pnpm run dev

# בדיקת בריאות
pnpm run monitor:check
```

---

## 🔧 אוטומציות זמינות

### 📦 ניהול תלויות
```bash
pnpm run automation:install    # התקנת כל התלויות
pnpm run clean                # ניקוי קבצים זמניים
pnpm run clean:all            # ניקוי מלא + node_modules
```

### 🧪 בדיקות אוטומטיות
```bash
pnpm run automation:test      # הרצת כל הבדיקות
pnpm run lint                 # בדיקת קוד
pnpm run test                 # בדיקות unit
pnpm run type-check           # בדיקת טיפוסים
```

### 🏗️ בנייה ופריסה
```bash
pnpm run automation:build     # בנייה מלאה
pnpm run build                # בנייה ידנית
pnpm run automation:deploy    # הכנה לפריסה
```

### 💾 גיבויים אוטומטיים
```bash
pnpm run automation:backup    # יצירת גיבוי
pnpm run backup:create        # גיבוי חדש
pnpm run backup:list          # רשימת גיבויים
pnpm run backup:restore       # שחזור גיבוי
pnpm run backup:cleanup       # ניקוי גיבויים ישנים
```

### 🏥 ניטור בריאות
```bash
pnpm run automation:health    # בדיקת בריאות
pnpm run monitor:start        # ניטור רציף
pnpm run monitor:check        # בדיקה חד פעמית
pnpm run monitor:stats        # סטטיסטיקות
pnpm run monitor:logs         # לוגים אחרונים
```

### 🐳 Docker & DevOps
```bash
pnpm run automation:docker    # הפעלת Docker
pnpm run docker:build         # בניית images
pnpm run docker:up            # הפעלת שירותים
pnpm run docker:down          # עצירת שירותים
pnpm run docker:logs          # צפייה בלוגים
```

### 📊 סטטוס וניטור
```bash
pnpm run automation:status    # סטטוס כל השירותים
pnpm run health:check         # בדיקת זמינות
pnpm run logs:view            # צפייה בלוגים
pnpm run logs:clear           # ניקוי לוגים
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
המערכת כוללת pipeline אוטומטי שמריץ על כל push/PR:

1. **בדיקות אוטומטיות**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests (Jest)
   - Security audit (pnpm audit)

2. **בנייה אוטומטית**
   - Build client (React)
   - Build server (Node.js)
   - Upload artifacts

3. **בדיקות אבטחה**
   - Dependency vulnerabilities
   - Security best practices

4. **פריסה אוטומטית** (על main branch)
   - Deploy to production
   - Health checks
   - Notifications

### קובץ CI: `.github/workflows/ci.yml`

---

## 📈 ניטור והתראות

### Prometheus + Grafana
- **Prometheus**: איסוף metrics
- **Grafana**: דשבורד ניטור
- **Node Exporter**: ניטור מערכת

### גישה לדשבורדים:
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090

### התראות אוטומטיות:
- 🔴 שגיאות קריטיות
- 🟡 אזהרות ביצועים
- 🟢 סטטוס תקין

---

## 💾 גיבויים אוטומטיים

### תכונות הגיבוי:
- ✅ **גיבוי יומי אוטומטי** של MongoDB
- ✅ **שמירת 10 גיבויים אחרונים**
- ✅ **ניקוי אוטומטי** של גיבויים ישנים
- ✅ **שחזור קל** עם פקודה אחת
- ✅ **לוגים מפורטים** של כל פעולה

### פקודות גיבוי:
```bash
# יצירת גיבוי
pnpm run backup:create

# רשימת גיבויים
pnpm run backup:list

# שחזור גיבוי אחרון
pnpm run backup:restore

# שחזור גיבוי ספציפי
node scripts/backup.js restore /path/to/backup

# ניקוי גיבויים ישנים
pnpm run backup:cleanup
```

---

## 🐳 Docker & DevOps

### שירותים זמינים:
- **MongoDB**: מסד נתונים
- **Node.js Server**: שרת API
- **React Client**: ממשק משתמש
- **Nginx**: Reverse proxy
- **Redis**: מטמון
- **Prometheus**: ניטור
- **Grafana**: דשבורד
- **Node Exporter**: metrics מערכת

### הרצה עם Docker:
```bash
# הפעלת כל השירותים
docker-compose up -d

# צפייה בלוגים
docker-compose logs -f

# עצירת שירותים
docker-compose down

# בנייה מחדש
docker-compose build
```

---

## 🚀 פקודות שימושיות

### אוטומציה מלאה (מומלץ)
```bash
# הכל בפקודה אחת
pnpm run automation:full
```

### פיתוח יומי
```bash
# התחלת פיתוח
pnpm run dev

# בדיקות מהירות
pnpm run automation:quick

# בדיקת סטטוס
pnpm run automation:status
```

### פריסה
```bash
# הכנה לפריסה
pnpm run automation:deploy

# גיבוי לפני פריסה
pnpm run backup:create

# בדיקת בריאות
pnpm run monitor:check
```

### תחזוקה
```bash
# ניקוי מערכת
pnpm run automation:cleanup

# עדכון תלויות
pnpm run security:fix

# בדיקת אבטחה
pnpm run security:audit
```

---

## 🔧 פתרון בעיות

### בעיות נפוצות:

#### 1. פורט תפוס
```bash
# בדיקת פורטים בשימוש
netstat -ano | findstr :3008

# סיום תהליך
taskkill /PID <PID> /F
```

#### 2. שגיאות MongoDB
```bash
# בדיקת חיבור
pnpm run health:check

# שחזור גיבוי
pnpm run backup:restore
```

#### 3. שגיאות Docker
```bash
# ניקוי Docker
docker system prune -a

# בנייה מחדש
docker-compose build --no-cache
```

#### 4. שגיאות תלויות
```bash
# ניקוי והתקנה מחדש
pnpm run clean:all
pnpm run automation:install
```

### לוגים וניטור:
```bash
# צפייה בלוגים
pnpm run logs:view

# ניטור בזמן אמת
pnpm run monitor:start

# סטטיסטיקות
pnpm run monitor:stats
```

---

## 📞 תמיכה

### פקודות עזרה:
```bash
# עזרה כללית
node scripts/automation.js

# עזרת גיבוי
node scripts/backup.js

# עזרת ניטור
node scripts/monitor.js
```

### קבצי הגדרה חשובים:
- `.github/workflows/ci.yml` - CI/CD Pipeline
- `docker-compose.yml` - הגדרות Docker
- `prometheus.yml` - הגדרות ניטור
- `scripts/` - סקריפטים אוטומטיים

---

## 🎉 סיכום

המערכת כוללת אוטומציה מלאה עם:
- ✅ **CI/CD Pipeline** אוטומטי
- ✅ **ניטור מתקדם** עם התראות
- ✅ **גיבויים חכמים** עם שחזור
- ✅ **בדיקות אוטומטיות** בכל שלב
- ✅ **Docker Compose** להרצה מלאה
- ✅ **סקריפטים ידידותיים** לכל הצרכים

**הכל מוכן לשימוש - פשוט הרץ `pnpm run automation:full` ותיהנה! 🚀** 