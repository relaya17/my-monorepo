import { Router } from 'express';
import { globalLimiter, loginLimiter, tenantLimiter } from '../middleware/rateLimiter.js';
import { validateInput } from '../middleware/securityMiddleware.js';

import superAdminRoutes from './superAdminRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import paymentRoutes from './paymentsRouter.js';
import voteRoutes from './voteRoutes.js';
import healthRoute from './healthRoute.js';
import userRoutes from './userRoutes.js';
import residentRoutes from './residentRoutes.js';
import blogRoutes from './blogRouter.js';
import fileRoutes from './fileRouter.js';
import apartmentRoutes from './apartmentsRouter.js';
import signUpRoute from './signUpRoute.js';
import loginRoute from './loginRoute.js';
import adminLoginRoute from './adminLoginRoute.js';
import authRefreshRoute from './authRefreshRoute.js';
import forgotPasswordRoute from './forgotPasswordRoute.js';
import aiAnalyticsRoute from './aiAnalyticsRoute.js';
import aiNotificationsRoute from './aiNotificationsRoute.js';
import buildingsRoute from './buildingsRoute.js';
import auditReportRoutes from './auditReportRoutes.js';
import userStatusRoute from './userStatusRoute.js';
import feedbackRoutes from './feedbackRoutes.js';
import vendorScoreRoutes from './vendorScoreRoutes.js';
import voneChatRoutes from './voneChatRoutes.js';

const router = Router();

router.use(globalLimiter);
router.use(tenantLimiter);
router.use(validateInput);

router.use('/super-admin', superAdminRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);
router.use('/vote', voteRoutes);
router.use('/health', healthRoute);
router.use('/users', userRoutes);
router.use('/residents', residentRoutes);
router.use('/blog', blogRoutes);
router.use('/files', fileRoutes);
router.use('/apartments', apartmentRoutes);

router.use('/signup', loginLimiter, signUpRoute);
router.use('/login', loginLimiter, loginRoute);
router.use('/admin', loginLimiter, adminLoginRoute);
router.use('/auth/refresh', authRefreshRoute);
router.use('/forgot-password', forgotPasswordRoute);
router.use('/ai-analytics', aiAnalyticsRoute);
router.use('/ai-notifications', aiNotificationsRoute);
router.use('/buildings', buildingsRoute);
router.use('/audit-reports', auditReportRoutes);
router.use('/user', userStatusRoute);
router.use('/feedback', feedbackRoutes);
router.use('/vendors', vendorScoreRoutes);
router.use('/vone', voneChatRoutes);

export default router;
