#!/usr/bin/env node

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// צבעים לקונסול
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${step} ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// פונקציה להרצת פקודה
function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        logStep('🔄', description);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                logError(`${description} נכשל: ${error.message}`);
                reject(error);
                return;
            }
            
            if (stderr) {
                logWarning(`אזהרה ב-${description}: ${stderr}`);
            }
            
            logSuccess(description);
            resolve(stdout);
        });
    });
}

// פונקציה לבדיקת קיום קבצים
function checkFiles() {
    const requiredFiles = [
        'package.json',
        'apps/web/package.json',
        'apps/api/package.json',
        '.github/workflows/ci.yml'
    ];
    
    logStep('🔍', 'בודק קיום קבצים נדרשים...');
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
        logError(`קבצים חסרים: ${missingFiles.join(', ')}`);
        return false;
    }
    
    logSuccess('כל הקבצים הנדרשים קיימים');
    return true;
}

// פונקציה להתקנת תלויות
async function installDependencies() {
    try {
        await runCommand('pnpm install', 'מתקין תלויות ראשיות');
        await runCommand('cd apps/web && pnpm install', 'מתקין תלויות Web');
        await runCommand('cd apps/api && pnpm install', 'מתקין תלויות API');
        return true;
    } catch (error) {
        logError('התקנת תלויות נכשלה');
        return false;
    }
}

// פונקציה להרצת בדיקות
async function runTests() {
    try {
        await runCommand('pnpm run lint', 'מריץ בדיקות lint');
        await runCommand('pnpm run test', 'מריץ בדיקות unit');
        return true;
    } catch (error) {
        logError('בדיקות נכשלו');
        return false;
    }
}

// פונקציה לבנייה
async function build() {
    try {
        await runCommand('pnpm run build', 'בונה את הפרויקט');
        return true;
    } catch (error) {
        logError('בנייה נכשלה');
        return false;
    }
}

// פונקציה לגיבוי
async function backup() {
    try {
        await runCommand('pnpm run backup:create', 'יוצר גיבוי');
        return true;
    } catch (error) {
        logWarning('גיבוי נכשל - ממשיך...');
        return true; // לא עוצר את התהליך אם גיבוי נכשל
    }
}

// פונקציה לבדיקת בריאות
async function healthCheck() {
    try {
        await runCommand('pnpm run monitor:check', 'בודק בריאות המערכת');
        return true;
    } catch (error) {
        logWarning('בדיקת בריאות נכשלה - ממשיך...');
        return true;
    }
}

// פונקציה לניקוי
async function cleanup() {
    try {
        await runCommand('pnpm run clean', 'מנקה קבצים זמניים');
        return true;
    } catch (error) {
        logWarning('ניקוי נכשל - ממשיך...');
        return true;
    }
}

// פונקציה להצגת סטטוס
function showStatus() {
    logStep('📊', 'סטטוס המערכת:');
    
    // בדיקת שרתים
    const services = [
        { name: 'API', port: 3008, url: 'http://localhost:3008/api/health' },
        { name: 'Web', port: 5174, url: 'http://localhost:5174' },
        { name: 'MongoDB', port: 27017 }
    ];
    
    services.forEach(service => {
        try {
            if (service.url) {
                execSync(`curl -s -o /dev/null -w "%{http_code}" ${service.url}`, { timeout: 5000 });
                logSuccess(`${service.name} (${service.port}) - פעיל`);
            } else {
                logSuccess(`${service.name} (${service.port}) - מוגדר`);
            }
        } catch (error) {
            logWarning(`${service.name} (${service.port}) - לא זמין`);
        }
    });
}

// פונקציה ראשית לאוטומציה מלאה
async function fullAutomation() {
    log('🚀 מתחיל אוטומציה מלאה...', 'bright');
    
    const steps = [
        { name: 'בדיקת קבצים', func: checkFiles },
        { name: 'התקנת תלויות', func: installDependencies },
        { name: 'הרצת בדיקות', func: runTests },
        { name: 'בנייה', func: build },
        { name: 'גיבוי', func: backup },
        { name: 'בדיקת בריאות', func: healthCheck }
    ];
    
    for (const step of steps) {
        const success = await step.func();
        if (!success) {
            logError(`אוטומציה נכשלה בשלב: ${step.name}`);
            process.exit(1);
        }
    }
    
    logSuccess('אוטומציה הושלמה בהצלחה!');
    showStatus();
}

// פונקציה לאוטומציה מהירה
async function quickAutomation() {
    log('⚡ מתחיל אוטומציה מהירה...', 'bright');
    
    const steps = [
        { name: 'בדיקת קבצים', func: checkFiles },
        { name: 'הרצת בדיקות', func: runTests },
        { name: 'בנייה', func: build },
        { name: 'בדיקת בריאות', func: healthCheck }
    ];
    
    for (const step of steps) {
        const success = await step.func();
        if (!success) {
            logError(`אוטומציה נכשלה בשלב: ${step.name}`);
            process.exit(1);
        }
    }
    
    logSuccess('אוטומציה מהירה הושלמה!');
}

// טיפול בפקודות
const command = process.argv[2];

switch (command) {
    case 'full':
        fullAutomation();
        break;
    case 'quick':
        quickAutomation();
        break;
    case 'install':
        installDependencies();
        break;
    case 'test':
        runTests();
        break;
    case 'build':
        build();
        break;
    case 'backup':
        backup();
        break;
    case 'health':
        healthCheck();
        break;
    case 'cleanup':
        cleanup();
        break;
    case 'status':
        showStatus();
        break;
    default:
        log(`
📚 שימוש בסקריפט אוטומציה:

pnpm run automation:full     - אוטומציה מלאה (כל התהליכים)
pnpm run automation:quick    - אוטומציה מהירה (בדיקות + בנייה)
pnpm run automation:install  - התקנת תלויות בלבד
pnpm run automation:test     - הרצת בדיקות בלבד
pnpm run automation:build    - בנייה בלבד
pnpm run automation:backup   - גיבוי בלבד
pnpm run automation:health   - בדיקת בריאות בלבד
pnpm run automation:cleanup  - ניקוי בלבד
pnpm run automation:status   - הצגת סטטוס בלבד

דוגמאות:
node scripts/automation.js full
node scripts/automation.js quick
node scripts/automation.js status
        `, 'cyan');
} 