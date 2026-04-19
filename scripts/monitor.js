#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// הגדרות ניטור
const CONFIG = {
    serverUrl: 'http://localhost:3008',
    healthEndpoint: '/api/health',
    checkInterval: 60000, // בדיקה כל דקה
    logFile: path.join(__dirname, '../logs/monitoring.log'),
    alertThreshold: 3, // מספר כשלים לפני התראה
    emailAlerts: false, // להפעיל התראות אימייל
    slackAlerts: false, // להפעיל התראות Slack
};

// יצירת תיקיית לוגים אם לא קיימת
const logsDir = path.dirname(CONFIG.logFile);
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// פונקציה לרישום לוגים
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(CONFIG.logFile, logMessage);
}

// פונקציה לבדיקת זמינות השרת
function checkServerHealth() {
    return new Promise((resolve, reject) => {
        const url = `${CONFIG.serverUrl}${CONFIG.healthEndpoint}`;
        
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const healthData = JSON.parse(data);
                    
                    if (res.statusCode === 200 && healthData.status === 'OK') {
                        resolve({
                            status: 'healthy',
                            responseTime: Date.now() - startTime,
                            data: healthData
                        });
                    } else {
                        reject(new Error(`Server unhealthy: ${healthData.status}`));
                    }
                } catch (error) {
                    reject(new Error(`Invalid JSON response: ${error.message}`));
                }
            });
        });
        
        const startTime = Date.now();
        
        req.on('error', (error) => {
            reject(new Error(`Connection failed: ${error.message}`));
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// פונקציה לבדיקת זיכרון המערכת
function checkSystemMemory() {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    return memUsageMB;
}

// פונקציה לבדיקת דיסק
function checkDiskSpace() {
    try {
        const stats = fs.statSync(path.join(__dirname, '..'));
        const freeSpace = stats.size; // זה לא מדויק, אבל זה דוגמה
        
        return {
            freeSpace: Math.round(freeSpace / 1024 / 1024), // MB
            totalSpace: 1000, // דוגמה
            usagePercent: Math.round((freeSpace / (1000 * 1024 * 1024)) * 100)
        };
    } catch (error) {
        return { error: error.message };
    }
}

// פונקציה לשליחת התראה
function sendAlert(message, type = 'warning') {
    log(`🚨 ALERT [${type.toUpperCase()}]: ${message}`, 'ALERT');
    
    // כאן תהיה שליחת התראה ל-Slack/Email
    if (CONFIG.slackAlerts) {
        // שליחה ל-Slack
        console.log(`📱 Slack Alert: ${message}`);
    }
    
    if (CONFIG.emailAlerts) {
        // שליחה באימייל
        console.log(`📧 Email Alert: ${message}`);
    }
}

function test(){
    console.log("test");
}

test()

// פונקציה לבדיקה מקיפה
async function performHealthCheck() {
    const startTime = Date.now();
    const results = {
        timestamp: new Date().toISOString(),
        server: null,
        memory: null,
        disk: null,
        overall: 'unknown'
    };
    
    try {
        // בדיקת שרת
        results.server = await checkServerHealth();
        log(`✅ Server health check passed - Response time: ${results.server.responseTime}ms`);
        
        // בדיקת זיכרון
        results.memory = checkSystemMemory();
        log(`💾 Memory usage - RSS: ${results.memory.rss}MB, Heap: ${results.memory.heapUsed}MB/${results.memory.heapTotal}MB`);
        
        // בדיקת דיסק
        results.disk = checkDiskSpace();
        log(`💿 Disk usage - ${results.disk.usagePercent}% used`);
        
        results.overall = 'healthy';
        
        // בדיקת סף זיכרון
        if (results.memory.heapUsed > 500) { // יותר מ-500MB
            sendAlert(`High memory usage: ${results.memory.heapUsed}MB`, 'warning');
        }
        
        // בדיקת סף דיסק
        if (results.disk.usagePercent > 90) {
            sendAlert(`High disk usage: ${results.disk.usagePercent}%`, 'critical');
        }
        
    } catch (error) {
        results.server = { status: 'error', error: error.message };
        results.overall = 'unhealthy';
        
        log(`❌ Health check failed: ${error.message}`, 'ERROR');
        sendAlert(`Server health check failed: ${error.message}`, 'critical');
    }
    
    // שמירת תוצאות
    const resultsFile = path.join(logsDir, 'health-check-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    return results;
}

// פונקציה להצגת סטטיסטיקות
function showStats() {
    try {
        const resultsFile = path.join(logsDir, 'health-check-results.json');
        if (fs.existsSync(resultsFile)) {
            const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
            
            console.log('\n📊 סטטיסטיקות ניטור אחרונות:');
            console.log(`⏰ זמן בדיקה: ${results.timestamp}`);
            console.log(`🏥 סטטוס כללי: ${results.overall}`);
            
            if (results.server) {
                console.log(`🖥️  שרת: ${results.server.status}`);
                if (results.server.responseTime) {
                    console.log(`⚡ זמן תגובה: ${results.server.responseTime}ms`);
                }
            }
            
            if (results.memory) {
                console.log(`💾 זיכרון: ${results.memory.heapUsed}MB / ${results.memory.heapTotal}MB`);
            }
            
            if (results.disk) {
                console.log(`💿 דיסק: ${results.disk.usagePercent}% בשימוש`);
            }
        }
    } catch (error) {
        console.log('❌ לא ניתן לטעון סטטיסטיקות');
    }
}

// פונקציה להצגת לוגים אחרונים
function showRecentLogs(lines = 20) {
    try {
        const logContent = fs.readFileSync(CONFIG.logFile, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim());
        const recentLogs = logLines.slice(-lines);
        
        console.log(`\n📋 ${lines} לוגים אחרונים:`);
        recentLogs.forEach(log => console.log(log));
    } catch (error) {
        console.log('❌ לא ניתן לטעון לוגים');
    }
}

// פונקציה ראשית
async function startMonitoring() {
    log('🚀 מתחיל ניטור אוטומטי...');
    
    // בדיקה ראשונית
    await performHealthCheck();
    
    // הגדרת בדיקה תקופתית
    setInterval(async () => {
        await performHealthCheck();
    }, CONFIG.checkInterval);
    
    log(`✅ ניטור פעיל - בדיקה כל ${CONFIG.checkInterval / 1000} שניות`);
}

// טיפול בפקודות
const command = process.argv[2];

switch (command) {
    case 'start':
        startMonitoring();
        break;
    case 'check':
        performHealthCheck().then(() => {
            console.log('✅ בדיקת בריאות הושלמה');
            process.exit(0);
        }).catch((error) => {
            console.error('❌ בדיקת בריאות נכשלה:', error.message);
            process.exit(1);
        });
        break;
    case 'stats':
        showStats();
        break;
    case 'logs':
        const lines = parseInt(process.argv[3]) || 20;
        showRecentLogs(lines);
        break;
    default:
        console.log(`
📚 שימוש בסקריפט ניטור:

pnpm run monitor:start    - התחלת ניטור רציף
pnpm run monitor:check    - בדיקה חד פעמית
pnpm run monitor:stats    - הצגת סטטיסטיקות
pnpm run monitor:logs     - הצגת לוגים אחרונים

דוגמאות:
node scripts/monitor.js start
node scripts/monitor.js check
node scripts/monitor.js stats
node scripts/monitor.js logs 50
        `);
} 