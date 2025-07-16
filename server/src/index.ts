import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes';
import fs from 'fs';
import path from 'path';
import Admin from './models/adminModel';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3008;
app.use(cors());

dotenv.config();

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
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));

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

console.log('Starting server...');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payments_db')
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

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log('Server started successfully!');
});
