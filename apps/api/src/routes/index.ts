import { Router } from 'express';
import { loginRateLimiter, rateLimiter, validateInput } from '../middleware/securityMiddleware.js';

// ייבוא כל הנתיבים
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
import aiAnalyticsRoute from './aiAnalyticsRoute.js';
import aiNotificationsRoute from './aiNotificationsRoute.js';

const router = Router();

// חיבור הנתיבים לראוטר הראשי
router.use(validateInput);
router.use(rateLimiter);

router.use('/payments', paymentRoutes);
router.use('/vote', voteRoutes);
router.use('/health', healthRoute);
router.use('/users', userRoutes);
router.use('/residents', residentRoutes);
router.use('/blog', blogRoutes);
router.use('/files', fileRoutes);
router.use('/apartments', apartmentRoutes);

// Tight rate-limit on auth endpoints
router.use('/signup', loginRateLimiter, signUpRoute);
router.use('/login', loginRateLimiter, loginRoute);
router.use('/admin', adminLoginRoute);
router.use('/ai-analytics', aiAnalyticsRoute);
router.use('/ai-notifications', aiNotificationsRoute);

export default router;
