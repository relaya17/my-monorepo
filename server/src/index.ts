import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import fs from 'fs';
import path from 'path';
import Admin from './models/adminModel.js';
import bcrypt from 'bcryptjs';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
dotenv.config();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = Number(process.env.PORT) || 3008;
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// יצירת תיקיית uploads אם לא קיימת
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// שרת קבצים סטטי
app.use('/uploads', express.static(uploadsDir));

// שרת קבצים סטטי ל-React app
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

// לאפשר בקשות מ-CORS
app.use(cors());

app.use(express.json());

// נתיב ראשי לבדיקת חיבור
app.get('/', (req: any, res: any) => {
    res.json({ message: 'Server is running successfully!' });
});

// API routes
app.use('/api', routes);

// Fallback route - serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});


mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        // יצירת אדמין ברירת מחדל אם אין
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await Admin.create({ username: 'admin', password: hash });
            console.log('Admin ברירת מחדל נוצר: admin / admin123');
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`[Server Started]\tServer is running on http://localhost:${port}`);
});
