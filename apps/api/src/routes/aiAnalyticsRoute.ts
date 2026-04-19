import express, { Request, Response } from 'express';
import Payment from '../models/paymentModel.js';
import User from '../models/userModel.js';
import AiInsight from '../models/aiInsightModel.js';
import { generateBuildingInsights } from '../services/aiInsightsService.js';
import { logger } from '../utils/logger.js';

const router: express.Router = express.Router();

// Stored insights from pipeline (TECHNICAL_SPECIFICATION §11.3)
router.get('/insights/:buildingId', async (req: Request, res: Response) => {
    try {
        const { buildingId } = req.params;
        if (!buildingId) return res.status(400).json({ message: 'Missing buildingId' });
        const insights = await AiInsight.find({ buildingId }).sort({ createdAt: -1 }).limit(50).lean();
        return res.json({ buildingId, insights });
    } catch (err) {
        logger.error('AI insights error', { error: (err as Error).message });
        return res.status(500).json({ message: 'שגיאה בטעינת תובנות' });
    }
});

type PaymentRecord = {
    _id?: { toString(): string } | string;
    amount?: number;
    createdAt?: Date;
    category?: string;
    userId?: { toString(): string } | string;
    status?: string;
};

type UserRecord = {
    _id?: { toString(): string } | string;
    username?: string;
};

type MonthlyIncomeEntry = {
    total: number;
    count: number;
    categories: Record<string, number>;
};

type MonthlyIncomeMap = Record<string, MonthlyIncomeEntry>;

type Recommendation = {
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    action: string;
};

// ניתוח AI של הכנסות והוצאות
router.get('/financial-analysis', async (req: Request, res: Response) => {
    try {
        const payments = (await Payment.find({})) as PaymentRecord[];

        // ניתוח הכנסות לפי חודשים
        const monthlyIncome = payments.reduce<MonthlyIncomeMap>((acc, payment) => {
            const createdAt = payment.createdAt ?? new Date();
            const month = new Date(createdAt).getMonth();
            const year = new Date(createdAt).getFullYear();
            const key = `${year}-${month + 1}`;

            if (!acc[key]) {
                acc[key] = { total: 0, count: 0, categories: {} };
            }

            acc[key].total += payment.amount ?? 0;
            acc[key].count += 1;

            const category = payment.category || 'כללי';
            if (!acc[key].categories[category]) {
                acc[key].categories[category] = 0;
            }
            acc[key].categories[category] += payment.amount ?? 0;

            return acc;
        }, {});

        // חיזוי הכנסות עתידיות
        const futurePrediction = predictFutureIncome(monthlyIncome);

        // זיהוי אנומליות
        const anomalies = detectAnomalies(payments);

        res.json({
            monthlyIncome,
            futurePrediction,
            anomalies,
            totalRevenue: payments.reduce((sum, p) => sum + (p.amount ?? 0), 0),
            averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + (p.amount ?? 0), 0) / payments.length : 0
        });
    } catch (error) {
        console.error('AI Financial Analysis Error:', error);
        res.status(500).json({ message: 'שגיאה בניתוח הכספים' });
    }
});

// תובנות AI עבור בניין ספציפי
router.get('/building-insights/:buildingId', async (req: Request, res: Response) => {
    try {
        const { buildingId } = req.params;
        const lookbackDays = Number(req.query.lookbackDays ?? 30);

        if (!buildingId) {
            res.status(400).json({ message: 'Missing buildingId' });
            return;
        }

        if (!Number.isFinite(lookbackDays) || lookbackDays <= 0) {
            res.status(400).json({ message: 'Invalid lookbackDays' });
            return;
        }

        const insights = await generateBuildingInsights(buildingId, lookbackDays);
        res.json({ buildingId, lookbackDays, insights });
    } catch (error) {
        console.error('AI Building Insights Error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת תובנות AI' });
    }
});

// ניתוח AI של התנהגות משתמשים
router.get('/user-behavior-analysis', async (req: Request, res: Response) => {
    try {
        const users = (await User.find({})) as UserRecord[];
        const payments = (await Payment.find({})) as PaymentRecord[];

        // ניתוח פעילות משתמשים
        const userActivity = analyzeUserActivity(users, payments);

        // זיהוי משתמשים בסיכון
        const riskUsers = identifyRiskUsers(users, payments);

        res.json({
            userActivity,
            riskUsers,
            totalUsers: users.length,
            activeUsers: userActivity.activeUsers,
            inactiveUsers: userActivity.inactiveUsers
        });
    } catch (error) {
        console.error('AI User Behavior Analysis Error:', error);
        res.status(500).json({ message: 'שגיאה בניתוח התנהגות משתמשים' });
    }
});

// המלצות AI לניהול
router.get('/ai-recommendations', async (req: Request, res: Response) => {
    try {
        const payments = (await Payment.find({})) as PaymentRecord[];
        const users = (await User.find({})) as UserRecord[];

        const recommendations = generateRecommendations(payments, users);

        res.json({
            recommendations,
            priority: recommendations.filter(r => r.priority === 'high'),
            medium: recommendations.filter(r => r.priority === 'medium'),
            low: recommendations.filter(r => r.priority === 'low')
        });
    } catch (error) {
        console.error('AI Recommendations Error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת המלצות' });
    }
});

// פונקציות עזר AI
function predictFutureIncome(monthlyData: MonthlyIncomeMap) {
    const months = Object.keys(monthlyData).sort();
    const values = months.map(month => monthlyData[month].total);

    if (values.length < 2) {
        return { nextMonth: values[0] || 0, trend: 'stable' };
    }

    // חישוב מגמה פשוט
    const recentValues = values.slice(-3);
    const average = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const trend = recentValues[recentValues.length - 1] > average ? 'rising' : 'falling';

    return {
        nextMonth: Math.round(average * 1.05), // חיזוי עם עלייה של 5%
        trend,
        confidence: 0.85
    };
}

function detectAnomalies(payments: PaymentRecord[]) {
    const amounts = payments.map(p => p.amount ?? 0).filter(a => a > 0);
    if (amounts.length === 0) return [];

    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    return payments.filter(payment => {
        const amount = payment.amount ?? 0;
        return Math.abs(amount - mean) > 2 * stdDev; // אנומליה אם חורגת מ-2 סטיות תקן
    }).map(payment => ({
        id: payment._id?.toString() ?? 'unknown',
        amount: payment.amount ?? 0,
        date: payment.createdAt?.toISOString() ?? new Date().toISOString(),
        type: 'unusual_payment'
    }));
}

function analyzeUserActivity(users: UserRecord[], payments: PaymentRecord[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter(user => {
        const userId = user._id?.toString();
        const userPayments = payments.filter(p => p.userId?.toString() === userId);
        return userPayments.some(p => new Date(p.createdAt ?? new Date()) > thirtyDaysAgo);
    });

    return {
        activeUsers: activeUsers.length,
        inactiveUsers: users.length - activeUsers.length,
        activityRate: users.length > 0 ? (activeUsers.length / users.length) * 100 : 0
    };
}

function identifyRiskUsers(users: UserRecord[], payments: PaymentRecord[]) {
    return users.filter(user => {
        const userId = user._id?.toString();
        const userPayments = payments.filter(p => p.userId?.toString() === userId);
        const totalAmount = userPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

        // משתמש בסיכון אם יש לו תשלומים גבוהים או תשלומים מאוחרים
        return totalAmount > 10000 || userPayments.some(p => p.status === 'overdue');
    }).map(user => ({
        userId: user._id,
        username: user.username,
        riskLevel: 'high' as const,
        reason: 'תשלומים גבוהים או מאוחרים'
    }));
}

function generateRecommendations(payments: PaymentRecord[], users: UserRecord[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // ניתוח הכנסות
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    if (totalRevenue < 50000) {
        recommendations.push({
            type: 'revenue',
            title: 'הגדלת הכנסות',
            description: 'ההכנסות נמוכות מהצפוי. מומלץ לבדוק אסטרטגיות שיווק חדשות',
            priority: 'high',
            action: 'review_marketing_strategy'
        });
    }

    // ניתוח משתמשים לא פעילים
    const inactiveUsers = users.filter(user => {
        const userId = user._id?.toString();
        const userPayments = payments.filter(p => p.userId?.toString() === userId);
        return userPayments.length === 0;
    });

    if (inactiveUsers.length > users.length * 0.3) {
        recommendations.push({
            type: 'engagement',
            title: 'שיפור מעורבות משתמשים',
            description: `יותר מ-30% מהמשתמשים לא פעילים. מומלץ לשלוח קמפיין הפעלה`,
            priority: 'medium',
            action: 'send_activation_campaign'
        });
    }

    // ניתוח תשלומים מאוחרים
    const overduePayments = payments.filter(p => p.status === 'overdue');
    if (overduePayments.length > 0) {
        recommendations.push({
            type: 'collections',
            title: 'טיפול בתשלומים מאוחרים',
            description: `יש ${overduePayments.length} תשלומים מאוחרים שדורשים טיפול`,
            priority: 'high',
            action: 'handle_overdue_payments'
        });
    }

    return recommendations;
}

export default router; 