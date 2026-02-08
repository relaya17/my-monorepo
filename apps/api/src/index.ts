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

// CORS
const parseCorsOrigins = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server calls / curl
      if (!origin) return cb(null, true);

      // explicit allowlist (recommended for production)
      if (corsOrigins.length > 0) return cb(null, corsOrigins.includes(origin));

      // dev-friendly defaults
      if (process.env.NODE_ENV !== 'production') {
        const isLocal =
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('http://192.168.') ||
          origin.startsWith('http://10.');
        return cb(null, isLocal);
      }

      // production with no allowlist: deny by default
      return cb(null, false);
    },
    credentials: true,
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
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'"],
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

        // Seed default credentials ONLY when explicitly enabled.
        // This prevents insecure default admin credentials in production.
        const shouldSeed = process.env.SEED_DEFAULT_USERS === 'true' && process.env.NODE_ENV !== 'production';
        if (shouldSeed) {
            // יצירת אדמין ברירת מחדל אם אין
            const adminCount = await Admin.countDocuments();
            if (adminCount === 0) {
                const hash = await bcrypt.hash('admin123', 10);
                await Admin.create({ username: 'admin', password: hash });
                console.log('Admin ברירת מחדל נוצר: admin / admin123');
            }

            // יצירת דייר ברירת מחדל (לצורכי פיתוח) אם אין
            const defaultResidentEmail = 'resident@example.com';
            const existingResident = await User.findOne({ email: defaultResidentEmail });
            if (!existingResident) {
                const hash = await bcrypt.hash('123456', 10);
                await User.create({ name: 'דייר לדוגמה', email: defaultResidentEmail, password: hash });
                console.log('דייר ברירת מחדל נוצר: resident@example.com / 123456');
            }
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`[Server Started]\tServer is running on http://localhost:${port}`);
});
