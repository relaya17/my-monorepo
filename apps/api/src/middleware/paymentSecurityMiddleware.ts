import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiting מיוחד לתשלומים
export const paymentRateLimiter = rateLimit({
    windowMs: 60 * 1000, // דקה אחת
    max: 3, // מקסימום 3 תשלומים לדקה
    message: {
        error: 'יותר מדי ניסיונות תשלום, נסה שוב מאוחר יותר',
        hebrew: 'יותר מדי ניסיונות תשלום, נסה שוב מאוחר יותר'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// בדיקת תקינות פרטי תשלום
export const validatePaymentData = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as Record<string, unknown>;
    const amount = body.amount as number | undefined;
    const currency = body.currency as string | undefined;
    const paymentMethod = body.paymentMethod as string | undefined;
    const cardNumber = body.cardNumber as string | undefined;
    const expiryDate = body.expiryDate as string | undefined;
    const cvv = body.cvv as string | undefined;

    // בדיקת סכום
    if (!amount || amount <= 0 || amount > 100000) {
        return res.status(400).json({
            error: 'סכום לא תקין',
            hebrew: 'סכום התשלום חייב להיות בין 1 ל-100,000 ₪'
        });
    }

    // בדיקת מטבע
    if (!currency || !['ILS', 'USD', 'EUR'].includes(currency)) {
        return res.status(400).json({
            error: 'מטבע לא נתמך',
            hebrew: 'המטבע חייב להיות ILS, USD או EUR'
        });
    }

    // בדיקת שיטת תשלום
    if (!paymentMethod || !['credit_card', 'bank_transfer', 'paypal'].includes(paymentMethod)) {
        return res.status(400).json({
            error: 'שיטת תשלום לא נתמכת',
            hebrew: 'שיטת התשלום לא נתמכת במערכת'
        });
    }

    // בדיקת מספר כרטיס (אם רלוונטי)
    if (paymentMethod === 'credit_card') {
        if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
            return res.status(400).json({
                error: 'מספר כרטיס לא תקין',
                hebrew: 'מספר הכרטיס חייב להיות בין 13 ל-19 ספרות'
            });
        }

        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
            return res.status(400).json({
                error: 'תאריך תפוגה לא תקין',
                hebrew: 'תאריך התפוגה חייב להיות בפורמט MM/YY'
            });
        }

        if (!cvv || cvv.length < 3 || cvv.length > 4) {
            return res.status(400).json({
                error: 'קוד אבטחה לא תקין',
                hebrew: 'קוד האבטחה חייב להיות 3 או 4 ספרות'
            });
        }

        // בדיקת תאריך תפוגה
        const [month, year] = expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();

        if (expiry < now) {
            return res.status(400).json({
                error: 'כרטיס פג תוקף',
                hebrew: 'כרטיס האשראי פג תוקף'
            });
        }
    }

    next();
};

// בדיקת IP חשוד
export const checkSuspiciousIP = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    // רשימת IPs חשודים (לדוגמה בלבד)
    const suspiciousIPs = [
        '192.168.1.100', // לדוגמה
        '10.0.0.50'      // לדוגמה
    ];

    if (clientIP && suspiciousIPs.includes(clientIP)) {
        console.warn(`Suspicious IP detected: ${clientIP}`);
        return res.status(403).json({
            error: 'גישה נחסמה',
            hebrew: 'הגישה נחסמה מטעמי אבטחה'
        });
    }

    next();
};

// בדיקת תדירות תשלומים
export const checkPaymentFrequency = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const body = req.body as Record<string, unknown>;
    const userId = body.userId as string | undefined;

    // כאן תהיה בדיקה מול מסד נתונים של תדירות תשלומים
    // לדוגמה: בדיקה אם המשתמש ביצע יותר מדי תשלומים בזמן קצר

    // TODO: להוסיף בדיקה מול מסד נתונים
    console.log(`Payment attempt from IP: ${clientIP}, User: ${userId}`);

    next();
};

// הצפנת נתונים רגישים
export const encryptSensitiveData = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as Record<string, unknown>;
    const cardNumber = body.cardNumber as string | undefined;
    const cvv = body.cvv as string | undefined;

    if (cardNumber) {
        // הצפנת מספר כרטיס (רק 4 ספרות אחרונות גלויות)
        const maskedCard = cardNumber.replace(/\d(?=\d{4})/g, '*');
        body.cardNumber = maskedCard;
    }

    if (cvv) {
        // מחיקת CVV מהלוגים
        delete body.cvv;
    }

    next();
};

// בדיקת סכום חריג
export const checkUnusualAmount = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as Record<string, unknown>;
    const amount = body.amount as number | undefined;
    const userId = body.userId as string | undefined;

    // סכומים חריגים (לדוגמה)
    const unusualThresholds = {
        small: 10,      // פחות מ-10 ₪
        large: 50000    // יותר מ-50,000 ₪
    };

    if (typeof amount === 'number' && amount < unusualThresholds.small) {
        console.warn(`Unusually small payment: ${amount} from user ${userId}`);
    }

    if (typeof amount === 'number' && amount > unusualThresholds.large) {
        console.warn(`Unusually large payment: ${amount} from user ${userId}`);
        // אפשר להוסיף התראה או חסימה
    }

    next();
};

// לוג תשלומים מפורט
export const paymentLogger = (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const body = req.body as Record<string, unknown>;
    const amount = body.amount as number | undefined;
    const currency = body.currency as string | undefined;
    const paymentMethod = body.paymentMethod as string | undefined;
    const userId = body.userId as string | undefined;

    const logEntry = {
        timestamp,
        method,
        url,
        ip,
        userAgent,
        amount,
        currency,
        paymentMethod,
        userId,
        status: 'attempt'
    };

    console.log('Payment attempt:', JSON.stringify(logEntry, null, 2));

    // שמירה ללוג קובץ
    // TODO: להוסיף שמירה לקובץ לוג

    next();
}; 