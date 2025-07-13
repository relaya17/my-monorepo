#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// הגדרות
const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_NAME = 'payments_db';
const MAX_BACKUPS = 10; // מספר מקסימלי של גיבויים לשמירה

// יצירת תיקיית גיבויים אם לא קיימת
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// פונקציה ליצירת גיבוי
function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    console.log(`🔄 מתחיל גיבוי מסד הנתונים...`);
    
    const command = `mongodump --db ${DB_NAME} --out "${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ שגיאה בגיבוי: ${error.message}`);
            process.exit(1);
        }
        
        if (stderr) {
            console.warn(`⚠️  אזהרה: ${stderr}`);
        }
        
        console.log(`✅ גיבוי הושלם בהצלחה: ${backupPath}`);
        
        // יצירת קישור סימבולי לגיבוי האחרון
        const latestLink = path.join(BACKUP_DIR, 'latest');
        if (fs.existsSync(latestLink)) {
            fs.unlinkSync(latestLink);
        }
        fs.symlinkSync(backupPath, latestLink);
        
        // ניקוי גיבויים ישנים
        cleanupOldBackups();
        
        console.log(`📊 גיבוי נשמר ב: ${backupPath}`);
    });
}

// פונקציה לניקוי גיבויים ישנים
function cleanupOldBackups() {
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('backup-'))
        .map(file => ({
            name: file,
            path: path.join(BACKUP_DIR, file),
            time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
    
    if (backups.length > MAX_BACKUPS) {
        const toDelete = backups.slice(MAX_BACKUPS);
        toDelete.forEach(backup => {
            console.log(`🗑️  מוחק גיבוי ישן: ${backup.name}`);
            fs.rmSync(backup.path, { recursive: true, force: true });
        });
    }
}

// פונקציה לשחזור גיבוי
function restoreBackup(backupPath) {
    if (!backupPath) {
        backupPath = path.join(BACKUP_DIR, 'latest');
    }
    
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ קובץ גיבוי לא נמצא: ${backupPath}`);
        process.exit(1);
    }
    
    console.log(`🔄 מתחיל שחזור מסד הנתונים...`);
    
    const command = `mongorestore --db ${DB_NAME} --drop "${backupPath}/${DB_NAME}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ שגיאה בשחזור: ${error.message}`);
            process.exit(1);
        }
        
        if (stderr) {
            console.warn(`⚠️  אזהרה: ${stderr}`);
        }
        
        console.log(`✅ שחזור הושלם בהצלחה`);
    });
}

// פונקציה להצגת רשימת גיבויים
function listBackups() {
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('backup-'))
        .map(file => {
            const stats = fs.statSync(path.join(BACKUP_DIR, file));
            return {
                name: file,
                size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
                date: stats.mtime.toLocaleString('he-IL')
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`📋 רשימת גיבויים (${backups.length} גיבויים):`);
    backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name} - ${backup.size} - ${backup.date}`);
    });
}

// טיפול בפקודות
const command = process.argv[2];

switch (command) {
    case 'create':
    case undefined:
        createBackup();
        break;
    case 'restore':
        const backupPath = process.argv[3];
        restoreBackup(backupPath);
        break;
    case 'list':
        listBackups();
        break;
    case 'cleanup':
        cleanupOldBackups();
        break;
    default:
        console.log(`
📚 שימוש בסקריפט גיבוי:

pnpm run backup:create    - יצירת גיבוי חדש
pnpm run backup:restore   - שחזור הגיבוי האחרון
pnpm run backup:list      - הצגת רשימת גיבויים
pnpm run backup:cleanup   - ניקוי גיבויים ישנים

דוגמאות:
node scripts/backup.js create
node scripts/backup.js restore
node scripts/backup.js restore /path/to/backup
node scripts/backup.js list
        `);
} 