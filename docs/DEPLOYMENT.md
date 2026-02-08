# מדריך פריסה - פרויקט ניהול דיירים ותשלומים

מדריך מפורט לפריסת הפרויקט בסביבת פרודקשן עם אבטחה מתקדמת.

## 🚀 אפשרויות פריסה

### 1. פריסה ידנית

#### דרישות שרת
- Ubuntu 20.04+ או CentOS 8+
- Node.js 18+
- MongoDB 6+
- Nginx
- PM2 (לניהול תהליכים)

#### התקנה ידנית
```bash
# עדכון המערכת
sudo apt update && sudo apt upgrade -y

# התקנת Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# התקנת MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# התקנת Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# התקנת PM2
sudo npm install -g pm2
```

#### הגדרת הפרויקט
```bash
# שכפול הפרויקט
git clone https://github.com/your-username/my-monorepo-app.git
cd my-monorepo-app

# התקנת תלויות
pnpm install:all

# הגדרת משתני סביבה
cp env.example apps/api/.env
nano apps/api/.env

# בנייה
pnpm run build

# יצירת תיקיות נדרשות
mkdir -p apps/api/logs
mkdir -p backups
mkdir -p uploads
```

#### הגדרת PM2
```bash
# יצירת קובץ ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'payments-app',
    script: 'apps/api/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3008
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10
  }]
};
EOF

# הפעלה עם PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. פריסה בענן (AWS/GCP/Azure)

#### AWS EC2
```bash
# התחברות לשרת
ssh -i your-key.pem ubuntu@your-server-ip

# התקנה אוטומטית
curl -fsSL https://raw.githubusercontent.com/your-username/my-monorepo-app/main/scripts/install.sh | bash

# או התקנה ידנית
git clone https://github.com/your-username/my-monorepo-app.git
cd my-monorepo-app
./scripts/deploy.sh
```

## 🔐 הגדרות אבטחה

### SSL/HTTPS
```bash
# התקנת Certbot
sudo apt install certbot python3-certbot-nginx -y

# יצירת תעודה SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# אוטומציה של חידוש
sudo crontab -e
# הוסף: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall
```bash
# הגדרת UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3008
sudo ufw enable
```

### Security Headers
```nginx
# /etc/nginx/sites-available/payments-app
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    location / {
        proxy_pass http://localhost:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate Limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    location /api/admin/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3008;
    }
}
```

## 📊 ניטור ובקרה

### ניטור עם PM2
```bash
# צפייה בסטטוס
pm2 status
pm2 monit

# צפייה בלוגים
pm2 logs payments-app
pm2 logs payments-app --err
pm2 logs payments-app --out

# איפוס לוגים
pm2 flush
```

### ניטור מערכת
```bash
# התקנת כלי ניטור
sudo apt install htop iotop nethogs -y

# צפייה בשימוש משאבים
htop
iotop
nethogs

# בדיקת דיסק
df -h
du -sh /var/log/*
```

## 🔄 גיבויים

### גיבוי מסד נתונים
```bash
# גיבוי ידני
mongodump --db payments_db --out ./backups/$(date +%Y%m%d_%H%M%S)

# גיבוי אוטומטי
crontab -e
# הוסף: 0 2 * * * /usr/bin/mongodump --db payments_db --out /path/to/backups/$(date +\%Y\%m\%d_\%H\%M\%S)

# שחזור
mongorestore --db payments_db ./backups/20241219_020000/payments_db/
```

### גיבוי קבצים
```bash
# גיבוי קבצים שהועלו
tar -czf backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# גיבוי לוגים
tar -czf backups/logs_$(date +%Y%m%d_%H%M%S).tar.gz apps/api/logs/

# סקריפט גיבוי אוטומטי
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# גיבוי מסד נתונים
mongodump --db payments_db --out $BACKUP_DIR/db_$DATE

# גיבוי קבצים
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz apps/api/logs/

# מחיקת גיבויים ישנים (יותר מ-30 ימים)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "db_*" -mtime +30 -exec rm -rf {} \;

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh
```

## 🚨 פתרון בעיות

### בעיות נפוצות

#### פורט תפוס
```bash
# מציאת תהליכים
sudo netstat -tulpn | grep :3008
sudo lsof -i :3008

# הריגת תהליך
sudo kill -9 <PID>
```

#### בעיות זיכרון
```bash
# בדיקת שימוש זיכרון
free -h
ps aux --sort=-%mem | head -10

# ניקוי זיכרון
sudo sync && sudo sysctl -w vm.drop_caches=3
```

#### בעיות מסד נתונים
```bash
# בדיקת סטטוס MongoDB
sudo systemctl status mongod
sudo journalctl -u mongod -f

# איפוס MongoDB
sudo systemctl restart mongod
```

#### בעיות Nginx
```bash
# בדיקת קונפיגורציה
sudo nginx -t

# ריסטרט
sudo systemctl restart nginx

# צפייה בלוגים
sudo tail -f /var/log/nginx/error.log
```

### לוגים חשובים
```bash
# לוגי אפליקציה
tail -f apps/api/logs/server.log

# לוגי Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# לוגי MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# לוגי מערכת
sudo journalctl -f
```

## 📈 ביצועים

### אופטימיזציה
```bash
# הגדרת Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# הגדרת MongoDB
sudo nano /etc/mongod.conf
# הוסף:
# operationProfiling:
#   mode: slowOp
#   slowOpThresholdMs: 100

# הגדרת Nginx
sudo nano /etc/nginx/nginx.conf
# הוסף:
# worker_processes auto;
# worker_connections 1024;
```

### בדיקת ביצועים
```bash
# בדיקת זמני תגובה
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3008/api/health"

# בדיקת עומס
ab -n 1000 -c 10 http://localhost:3008/api/health

# ניטור בזמן אמת
watch -n 1 'curl -s http://localhost:3008/api/health/detailed | jq'
```

## 🔄 עדכונים

### עדכון אוטומטי
```bash
# סקריפט עדכון
cat > update.sh << 'EOF'
#!/bin/bash
cd /path/to/my-monorepo-app

# גיבוי לפני עדכון
./backup.sh

# עדכון קוד
git pull origin main

# התקנת תלויות חדשות
pnpm install:all

# בנייה מחדש
pnpm run build

# ריסטרט שירותים
pm2 restart all

echo "Update completed successfully"
EOF

chmod +x update.sh
```

### עדכון ידני
```bash
# עצירת שירותים
pm2 stop all

# עדכון קוד
git pull origin main
pnpm install:all
pnpm run build

# הפעלה מחדש
pm2 start all
```

---

**נכתב על ידי:** AI Assistant  
**תאריך עדכון:** 2024-12-19  
**גרסה:** 2.0.0 