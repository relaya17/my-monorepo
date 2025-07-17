import express, { Request, Response } from 'express';
import Payment from '../models/paymentModel.js';
import User from '../models/userModel.js';

const router: express.Router = express.Router();

// ניתוח AI של הכנסות והוצאות
router.get('/financial-analysis', async (req: Request, res: Response) => {
    try {
        const payments = await Payment.find({});

        // ניתוח הכנסות לפי חודשים
        const monthlyIncome = payments.reduce((acc: any, payment) => {
            const month = new Date(payment.createdAt).getMonth();
            const year = new Date(payment.createdAt).getFullYear();
            const key = `${year}-${month + 1}`;

            if (!acc[key]) {
                acc[key] = { total: 0, count: 0, categories: {} };
            }

            acc[key].total += payment.amount || 0;
            acc[key].count += 1;

            const category = (payment as any).category || 'כללי';
            if (!acc[key].categories[category]) {
                acc[key].categories[category] = 0;
            }
            acc[key].categories[category] += payment.amount || 0;

            return acc;
        }, {});

        // חיזוי הכנסות עתידיות
        const futurePrediction = predictFutureIncome(monthlyIncome);

        // זיהוי אנומליות
        const anomalies = detectAnomalies(payments);

        //@ts-ignore
        (res as any).json({
            monthlyIncome,
            futurePrediction,
            anomalies,
            totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
            averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length : 0
        });
    } catch (error) {
        console.error('AI Financial Analysis Error:', error);
        //@ts-ignore
        (res as any).status(500).json({ message: 'שגיאה בניתוח הכספים' });
    }
});

// ניתוח AI של התנהגות משתמשים
router.get('/user-behavior-analysis', async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        const payments = await Payment.find({});

        // ניתוח פעילות משתמשים
        const userActivity = analyzeUserActivity(users, payments);

        // זיהוי משתמשים בסיכון
        const riskUsers = identifyRiskUsers(users, payments);

        //@ts-ignore
        (res as any).json({
            userActivity,
            riskUsers,
            totalUsers: users.length,
            activeUsers: userActivity.activeUsers,
            inactiveUsers: userActivity.inactiveUsers
        });
    } catch (error) {
        console.error('AI User Behavior Analysis Error:', error);
        //@ts-ignore
        (res as any).status(500).json({ message: 'שגיאה בניתוח התנהגות משתמשים' });
    }
});

// המלצות AI לניהול
router.get('/ai-recommendations', async (req: Request, res: Response) => {
    try {
        const payments = await Payment.find({});
        const users = await User.find({});

        const recommendations = generateRecommendations(payments, users);

        //@ts-ignore
        (res as any).json({
            recommendations,
            priority: recommendations.filter((r: any) => r.priority === 'high'),
            medium: recommendations.filter((r: any) => r.priority === 'medium'),
            low: recommendations.filter((r: any) => r.priority === 'low')
        });
    } catch (error) {
        console.error('AI Recommendations Error:', error);
        //@ts-ignore
        (res as any).status(500).json({ message: 'שגיאה ביצירת המלצות' });
    }
});

// פונקציות עזר AI
function predictFutureIncome(monthlyData: any) {
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

function detectAnomalies(payments: any[]) {
    const amounts = payments.map(p => p.amount || 0).filter(a => a > 0);
    if (amounts.length === 0) return [];

    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    return payments.filter(payment => {
        const amount = payment.amount || 0;
        return Math.abs(amount - mean) > 2 * stdDev; // אנומליה אם חורגת מ-2 סטיות תקן
    }).map(payment => ({
        id: payment._id,
        amount: payment.amount,
        date: payment.createdAt,
        type: 'unusual_payment'
    }));
}

function analyzeUserActivity(users: any[], payments: any[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter(user => {
        const userPayments = payments.filter(p => p.userId?.toString() === user._id?.toString());
        return userPayments.some(p => new Date(p.createdAt) > thirtyDaysAgo);
    });

    return {
        activeUsers: activeUsers.length,
        inactiveUsers: users.length - activeUsers.length,
        activityRate: users.length > 0 ? (activeUsers.length / users.length) * 100 : 0
    };
}

function identifyRiskUsers(users: any[], payments: any[]) {
    return users.filter(user => {
        const userPayments = payments.filter(p => p.userId?.toString() === user._id?.toString());
        const totalAmount = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // משתמש בסיכון אם יש לו תשלומים גבוהים או תשלומים מאוחרים
        return totalAmount > 10000 || userPayments.some(p => p.status === 'overdue');
    }).map(user => ({
        userId: user._id,
        username: user.username,
        riskLevel: 'high',
        reason: 'תשלומים גבוהים או מאוחרים'
    }));
}

function generateRecommendations(payments: any[], users: any[]) {
    const recommendations = [];

    // ניתוח הכנסות
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
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
        const userPayments = payments.filter(p => p.userId?.toString() === user._id?.toString());
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