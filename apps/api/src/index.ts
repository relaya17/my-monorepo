import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import stripeRoutes from './routes/stripeRoutes.js';
import stripeWebhookRoute from './routes/stripeWebhookRoute.js';
import fs from 'fs';
import path from 'path';
import Admin from './models/adminModel.js';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';
import { tenantContext } from './middleware/tenantMiddleware.js';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { tenantMiddleware } from './middleware/tenantMiddleware.js';
dotenv.config();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = Number(process.env.PORT) || 3008;

// Render / reverse proxies
app.set('trust proxy', 1);

// CORS – מותר: CORS_ORIGIN, localhost, 192.168.x.x, Netlify, Render
const parseCorsOrigins = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5173',
  'http://192.168.0.100:5174',
  'http://192.168.0.100:5173',
];

const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (corsOrigins.length > 0) return cb(null, corsOrigins.includes(origin));

      // localhost + LAN (פיתוח מקומי כלפי Render API)
      const isLocalOrLan =
        defaultDevOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.');
      if (isLocalOrLan) return cb(null, true);

      if (origin.endsWith('.netlify.app') || origin.endsWith('.onrender.com')) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-building-id'],
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// CSP: SPA uses only same-origin scripts/styles (no CDN). Allow 'self' so bundled assets load.
app.use(
  helmet({
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
  })
);
app.use(compression());

// יצירת תיקיית uploads אם לא קיימת
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// שרת קבצים סטטי
app.use('/uploads', express.static(uploadsDir));

// Serve React build only in production (avoid "old design" in dev)
const clientPath = path.join(__dirname, '../../web/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(clientPath, 'index.html'))) {
  app.use(express.static(clientPath));
}

// Stripe webhook חייב גוף raw
app.use('/api/webhooks/stripe', stripeWebhookRoute);

app.use(express.json({ limit: '1mb' }));

// נתיב ראשי לבדיקת חיבור
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server is running successfully!' });
});

// API routes
app.use('/api', tenantMiddleware, routes);
app.use('/api/stripe', stripeRoutes);

// Fallback route - serve React app for all other routes (production only)
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(clientPath, 'index.html'))) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}


const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('Missing MONGO_URI environment variable');
}

mongoose.connect(mongoUri)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Migration: מסמכים ישנים בלי buildingId או עם ערך ריק – עדכון ל־default (עוקף plugin)
        const adminMigrated = await Admin.collection.updateMany(
            { $or: [{ buildingId: { $exists: false } }, { buildingId: null }, { buildingId: '' }] },
            { $set: { buildingId: 'default' } }
        );
        if (adminMigrated.modifiedCount > 0) {
            console.log(`[Migration] עדכון ${adminMigrated.modifiedCount} אדמין עם buildingId: default`);
        }
        const userMigrated = await User.collection.updateMany(
            { $or: [{ buildingId: { $exists: false } }, { buildingId: null }, { buildingId: '' }] },
            { $set: { buildingId: 'default' } }
        );
        if (userMigrated.modifiedCount > 0) {
            console.log(`[Migration] עדכון ${userMigrated.modifiedCount} משתמש עם buildingId: default`);
        }

        // אדמין ברירת מחדל – בתוך tenant context של default, לפני תחילת קבלת בקשות
        const defaultAdminPassword = 'admin123';
        await tenantContext.run({ buildingId: 'default' }, async () => {
            const adminCount = await Admin.countDocuments();
            if (adminCount === 0) {
                try {
                    const hash = await bcrypt.hash(defaultAdminPassword, 10);
                    await Admin.create({ username: 'admin', password: hash });
                    console.log('[Admin] אדמין ברירת מחדל נוצר: admin / admin123');
                } catch (err: unknown) {
                    const e = err as { code?: number | string; message?: string };
                    const isDuplicate = e?.code === 11000 || e?.code === '11000' || (typeof e?.message === 'string' && e.message.includes('E11000'));
                    if (isDuplicate) {
                        const hash = await bcrypt.hash(defaultAdminPassword, 10);
                        await Admin.collection.updateOne(
                            { username: 'admin' },
                            { $set: { password: hash, buildingId: 'default' } }
                        );
                        console.log('[Admin] אדמין קיים – סיסמה אופסה ל־admin123');
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
                    console.log('דייר ברירת מחדל נוצר: resident@example.com / 123456');
                }
            });
        }

        // השרת מתחיל לקבל בקשות רק אחרי שה-seed הושלם
        app.listen(port, () => {
            console.log(`[Server Started]\tServer is running on http://localhost:${port}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
