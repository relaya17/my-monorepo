import express, { Request, Response } from 'express';
import Payment from '../models/paymentModel.js';
import User from '../models/userModel.js';

const router: express.Router = express.Router();

type ObjectIdLike = { toString(): string; getTimestamp?: () => Date };

type PaymentRecord = {
    _id?: ObjectIdLike | string;
    amount?: number;
    createdAt?: Date;
    dueDate?: Date;
    status?: string;
    userId?: ObjectIdLike | string;
};

type UserRecord = {
    _id?: ObjectIdLike | string;
    username?: string;
    createdAt?: Date;
};

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    color: string;
    action: string;
    timestamp: Date;
    data: Record<string, unknown>;
};

type Alert = {
    id: string;
    type: string;
    title: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    icon: string;
    color: string;
    timestamp: Date;
    data: Record<string, unknown>;
};

// התראות AI חכמות
router.get('/smart-notifications', async (req: Request, res: Response) => {
    try {
        const payments = (await Payment.find({})) as PaymentRecord[];
        const users = (await User.find({})) as UserRecord[];

        const notifications = generateSmartNotifications(payments, users);

        res.json({
            notifications,
            total: notifications.length,
            highPriority: notifications.filter(n => n.priority === 'high').length,
            mediumPriority: notifications.filter(n => n.priority === 'medium').length,
            lowPriority: notifications.filter(n => n.priority === 'low').length
        });
    } catch (error) {
        console.error('AI Notifications Error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת התראות' });
    }
});

// התראות בזמן אמת
router.get('/realtime-alerts', async (req: Request, res: Response) => {
    try {
        const payments = (await Payment.find({})) as PaymentRecord[];
        const users = (await User.find({})) as UserRecord[];

        const alerts = generateRealtimeAlerts(payments, users);

        res.json({
            alerts,
            critical: alerts.filter(a => a.severity === 'critical'),
            warning: alerts.filter(a => a.severity === 'warning'),
            info: alerts.filter(a => a.severity === 'info')
        });
    } catch (error) {
        console.error('Realtime Alerts Error:', error);
        res.status(500).json({ message: 'שגיאה ביצירת התראות בזמן אמת' });
    }
});

// פונקציות עזר
function generateSmartNotifications(payments: PaymentRecord[], users: UserRecord[]): Notification[] {
    const notifications: Notification[] = [];
    const now = new Date();

    // בדיקת תשלומים מאוחרים
    const overduePayments = payments.filter(p => {
        const dueDate = new Date(p.dueDate ?? p.createdAt ?? now);
        return dueDate < now && p.status !== 'paid';
    });

    if (overduePayments.length > 0) {
        notifications.push({
            id: 'overdue_payments',
            type: 'payment',
            title: 'תשלומים מאוחרים',
            message: `יש ${overduePayments.length} תשלומים מאוחרים שדורשים טיפול מיידי`,
            priority: 'high',
            icon: 'fas fa-exclamation-triangle',
            color: 'danger',
            action: 'review_overdue_payments',
            timestamp: now,
            data: {
                count: overduePayments.length,
                totalAmount: overduePayments.reduce((sum, p) => sum + (p.amount ?? 0), 0)
            }
        });
    }

    // בדיקת הכנסות נמוכות
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyPayments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt ?? now);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const averageMonthlyRevenue = 50000; // סכום יעד

    if (monthlyRevenue < averageMonthlyRevenue * 0.8) {
        notifications.push({
            id: 'low_revenue',
            type: 'financial',
            title: 'הכנסות נמוכות',
            message: `ההכנסות החודשיות נמוכות ב-${Math.round(((averageMonthlyRevenue - monthlyRevenue) / averageMonthlyRevenue) * 100)}% מהממוצע`,
            priority: 'medium',
            icon: 'fas fa-chart-line',
            color: 'warning',
            action: 'review_revenue_strategy',
            timestamp: now,
            data: {
                currentRevenue: monthlyRevenue,
                targetRevenue: averageMonthlyRevenue,
                percentage: Math.round((monthlyRevenue / averageMonthlyRevenue) * 100)
            }
        });
    }

    // בדיקת משתמשים לא פעילים
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const inactiveUsers = users.filter(user => {
        const userId = user._id?.toString();
        const userPayments = payments.filter(p => p.userId?.toString() === userId);
        return userPayments.length === 0 || !userPayments.some(p => new Date(p.createdAt ?? now) > thirtyDaysAgo);
    });

    if (inactiveUsers.length > users.length * 0.3) {
        notifications.push({
            id: 'inactive_users',
            type: 'engagement',
            title: 'משתמשים לא פעילים',
            message: `${inactiveUsers.length} משתמשים לא פעילים (${Math.round((inactiveUsers.length / users.length) * 100)}%)`,
            priority: 'medium',
            icon: 'fas fa-user-clock',
            color: 'info',
            action: 'send_activation_campaign',
            timestamp: now,
            data: {
                inactiveCount: inactiveUsers.length,
                totalUsers: users.length,
                percentage: Math.round((inactiveUsers.length / users.length) * 100)
            }
        });
    }

    // בדיקת אנומליות בתשלומים
    const amounts = payments.map(p => p.amount ?? 0).filter(a => a > 0);
    if (amounts.length > 0) {
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        const anomalies = payments.filter(payment => {
            const amount = payment.amount ?? 0;
            return Math.abs(amount - mean) > 3 * stdDev; // אנומליה קיצונית
        });

        if (anomalies.length > 0) {
            notifications.push({
                id: 'payment_anomalies',
                type: 'security',
                title: 'תשלומים חריגים',
                message: `זוהו ${anomalies.length} תשלומים חריגים שדורשים בדיקה`,
                priority: 'high',
                icon: 'fas fa-shield-alt',
                color: 'danger',
                action: 'review_anomalies',
                timestamp: now,
                data: {
                    anomalyCount: anomalies.length,
                    averageAmount: mean,
                    threshold: mean + 3 * stdDev
                }
            });
        }
    }

    return notifications.sort((a, b) => {
        const priorityOrder: Record<Notification['priority'], number> = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}

function generateRealtimeAlerts(payments: PaymentRecord[], users: UserRecord[]): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date();

    // התראות קריטיות
    const criticalPayments = payments.filter(p => {
        const amount = p.amount ?? 0;
        return amount > 50000; // תשלומים גבוהים מאוד
    });

    if (criticalPayments.length > 0) {
        alerts.push({
            id: 'critical_payments',
            type: 'financial',
            title: 'תשלומים קריטיים',
            message: `זוהו ${criticalPayments.length} תשלומים גבוהים מאוד`,
            severity: 'critical',
            icon: 'fas fa-exclamation-circle',
            color: 'danger',
            timestamp: now,
            data: { payments: criticalPayments }
        });
    }

    // התראות אזהרה
    const recentPayments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt ?? now);
        const hoursDiff = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24; // תשלומים מה-24 שעות האחרונות
    });

    if (recentPayments.length > 10) {
        alerts.push({
            id: 'high_activity',
            type: 'activity',
            title: 'פעילות גבוהה',
            message: `${recentPayments.length} תשלומים ב-24 שעות האחרונות`,
            severity: 'warning',
            icon: 'fas fa-chart-bar',
            color: 'warning',
            timestamp: now,
            data: {
                count: recentPayments.length,
                totalAmount: recentPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0)
            }
        });
    }

    // התראות מידע
    const newUsers = users.filter(user => {
        const idTimestamp = typeof user._id === 'object' && user._id?.getTimestamp ? user._id.getTimestamp() : now;
        const userDate = user.createdAt ?? idTimestamp;
        const daysDiff = (now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff < 7; // משתמשים חדשים מהשבוע האחרון
    });

    if (newUsers.length > 0) {
        alerts.push({
            id: 'new_users',
            type: 'user',
            title: 'משתמשים חדשים',
            message: `${newUsers.length} משתמשים חדשים נרשמו השבוע`,
            severity: 'info',
            icon: 'fas fa-user-plus',
            color: 'info',
            timestamp: now,
            data: {
                count: newUsers.length,
                users: newUsers.map(u => ({ id: u._id?.toString() ?? 'unknown', username: u.username }))
            }
        });
    }

    return alerts;
}

export default router; 