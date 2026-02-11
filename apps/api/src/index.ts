import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import techRoutes from './routes/techRoutes.js';
import publicRoutes, { getGlobalImpact } from './routes/publicRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import stripeWebhookRoute from './routes/stripeWebhookRoute.js';
import Admin from './models/adminModel.js';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';
import { tenantContext } from './middleware/tenantMiddleware.js';
import { tenantMiddleware } from './middleware/tenantMiddleware.js';
import { sanitizationMiddleware } from './middleware/sanitizationMiddleware.js';
import { requestIdMiddleware } from './middleware/requestIdMiddleware.js';
import { errorAlertMiddleware } from './middleware/errorAlertMiddleware.js';
import { logger } from './utils/logger.js';
import cron from 'node-cron';
import { runPipeline } from './services/aiPipelineService.js';
import { config } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = config.port;

function parseCorsOrigins(v?: string): string[] {
  return v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];
}

app.set('trust proxy', 1);
app.use(requestIdMiddleware);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
}));

const allowedOrigins =
  config.nodeEnv === 'production'
    ? parseCorsOrigins([config.corsOrigin, config.landingPageOrigin].filter(Boolean).join(','))
    : true;
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-building-id', 'x-refresh-token'],
}));

app.use('/api/webhooks/stripe', stripeWebhookRoute);
app.use(express.json({ limit: '15kb' }));
app.use(sanitizationMiddleware);
app.get('/api/public-stats', getGlobalImpact);
app.use('/api/public', publicRoutes);

const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const clientPath = path.join(__dirname, '../../web/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(clientPath, 'index.html'))) {
  app.use(express.static(clientPath));
}

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is running successfully!' });
});

app.use('/api/tech', techRoutes);
app.use('/api', tenantMiddleware, routes);
app.use('/api/stripe', stripeRoutes);

if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(clientPath, 'index.html'))) {
  app.get('*', (_req, res) => res.sendFile(path.join(clientPath, 'index.html')));
}

app.use(errorAlertMiddleware);
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`[Fatal Error] ${err.message}`, { stack: err.stack, path: req.path, traceId: req.id });
  res.status(err.status ?? 500).json({
    error: 'Internal Service Error',
    traceId: req.id,
  });
});


mongoose.connect(config.mongoUri)
    .then(async () => {
        logger.info('Connected to MongoDB');

        // Migration: מסמכים ישנים בלי buildingId או עם ערך ריק – עדכון ל־default (עוקף plugin)
        const adminMigrated = await Admin.collection.updateMany(
            { $or: [{ buildingId: { $exists: false } }, { buildingId: null }, { buildingId: '' }] },
            { $set: { buildingId: 'default' } }
        );
        if (adminMigrated.modifiedCount > 0) {
            logger.info(`[Migration] עדכון ${adminMigrated.modifiedCount} אדמין עם buildingId: default`);
        }
        const userMigrated = await User.collection.updateMany(
            { $or: [{ buildingId: { $exists: false } }, { buildingId: null }, { buildingId: '' }] },
            { $set: { buildingId: 'default' } }
        );
        if (userMigrated.modifiedCount > 0) {
            logger.info(`[Migration] עדכון ${userMigrated.modifiedCount} משתמש עם buildingId: default`);
        }

        // אדמין ברירת מחדל – בתוך tenant context של default, לפני תחילת קבלת בקשות
        const defaultAdminPassword = 'admin123';
        await tenantContext.run({ buildingId: 'default' }, async () => {
            const adminCount = await Admin.countDocuments();
            if (adminCount === 0) {
                try {
                    const hash = await bcrypt.hash(defaultAdminPassword, 10);
                    await Admin.create({ username: 'admin', password: hash });
                    logger.info('[Admin] אדמין ברירת מחדל נוצר: admin / admin123');
                } catch (err: unknown) {
                    const e = err as { code?: number | string; message?: string };
                    const isDuplicate = e?.code === 11000 || e?.code === '11000' || (typeof e?.message === 'string' && e.message.includes('E11000'));
                    if (isDuplicate) {
                        const hash = await bcrypt.hash(defaultAdminPassword, 10);
                        await Admin.collection.updateOne(
                            { username: 'admin' },
                            { $set: { password: hash, buildingId: 'default' } }
                        );
                        logger.info('[Admin] אדמין קיים – סיסמה אופסה ל־admin123');
                    } else {
                        throw err;
                    }
                }
            }
        });

        // דייר לדוגמה רק בסביבת פיתוח
        const shouldSeedResident = process.env.SEED_DEFAULT_USERS === 'true' && process.env.NODE_ENV !== 'production';
        if (shouldSeedResident) {
            await tenantContext.run({ buildingId: 'default' }, async () => {
                const defaultResidentEmail = 'resident@example.com';
                const existingResident = await User.findOne({ email: defaultResidentEmail });
                if (!existingResident) {
                    const hash = await bcrypt.hash('123456', 10);
                    await User.create({ name: 'דייר לדוגמה', email: defaultResidentEmail, password: hash });
                    logger.info('דייר ברירת מחדל נוצר: resident@example.com / 123456');
                }
            });
        }

        // AI pipeline cron – daily at 02:00 (TECHNICAL_SPECIFICATION §11.2)
        if (process.env.AI_CRON_ENABLED !== 'false') {
            cron.schedule('0 2 * * *', () => runPipeline(), { timezone: 'Asia/Jerusalem' });
            logger.info('AI pipeline cron scheduled (daily 02:00)');
        }

        app.listen(port, () => {
            logger.info(`[Server Started] Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => logger.error('MongoDB connection error', { message: (err as Error).message }));
