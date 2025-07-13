import { Router } from 'express';

// ייבוא כל הנתיבים
import paymentRoutes from './paymentsRouter';
import voteRoutes from './voteRoutes';
import healthRoute from './healthRoute';
import userRoutes from './userRoutes';
import residentRoutes from './residentRoutes';
import blogRoutes from './blogRouter';
import fileRoutes from './fileRouter';
import apartmentRoutes from './apartmentsRouter';
import signUpRoute from './signUpRoute';
import loginRoute from './loginRoute';
import adminLoginRoute from './adminLoginRoute';
import aiAnalyticsRoute from './aiAnalyticsRoute';
import aiNotificationsRoute from './aiNotificationsRoute';

const router = Router();

// חיבור הנתיבים לראוטר הראשי
router.use('/payments', paymentRoutes);
router.use('/vote', voteRoutes);
router.use('/health', healthRoute);
router.use('/users', userRoutes);
router.use('/residents', residentRoutes);
router.use('/blog', blogRoutes);
router.use('/files', fileRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/signup', signUpRoute);
router.use('/login', loginRoute);
router.use('/admin', adminLoginRoute);
router.use('/ai-analytics', aiAnalyticsRoute);
router.use('/ai-notifications', aiNotificationsRoute);

export default router;
