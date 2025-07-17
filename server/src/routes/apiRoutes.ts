import express, { Router } from 'express';
import { addPayment, deletePayment, getPayments } from '../controllers/paymentController.js';
import fs from 'fs';
import path from 'path';

const router = Router();

// Payment routes
router.get('/payments', getPayments);
router.post('/payments', addPayment);
router.delete('/payments/:id', deletePayment);

// Vote route
router.post('/vote', (req: any, res: any) => {
    const { questionId, optionIndex } = req.body as { questionId: string; optionIndex: number };
    console.log('Vote received:', { questionId, optionIndex });
    res.json({ message: 'ההצבעה נרשמה בהצלחה' });
});

// File routes
router.get('/files', (req: any, res: any) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'שגיאה בקריאת קבצים' });
        }
        const fileList = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            return {
                id: filename,
                name: filename,
                url: `/uploads/${filename}`,
                uploadedAt: stats.ctime
            };
        });
        res.json(fileList);
    });
});

router.post('/files/upload', (req: any, res: any) => {
    const { filename } = req.body as { filename: string };
    res.json({ message: 'הקובץ הועלה בהצלחה', filename });
});

// Employee routes
router.get('/employees', (req: any, res: any) => {
    res.json({ message: 'רשימת עובדים' });
});

router.post('/employees', (req: any, res: any) => {
    const { name, position, phone } = req.body as { name: string; position: string; phone: string };
    res.json({ message: 'עובד נוסף בהצלחה', name, position, phone });
});

// Apartment routes for sale
router.get('/apartments/for-sale', (req: any, res: any) => {
    res.json({ message: 'רשימת דירות למכירה' });
});

router.post('/apartments/for-sale', (req: any, res: any) => {
    const { address, price, description, image } = req.body as {
        address: string;
        price: number;
        description: string;
        image: string;
    };
    res.json({ message: 'דירה נוספה למכירה', address, price, description, image });
});

// Apartment routes for rent
router.get('/apartments/for-rent', (req: any, res: any) => {
    res.json({ message: 'רשימת דירות להשכרה' });
});

router.post('/apartments/for-rent', (req: any, res: any) => {
    const { address, price, description, image } = req.body as {
        address: string;
        price: number;
        description: string;
        image: string;
    };
    res.json({ message: 'דירה נוספה להשכרה', address, price, description, image });
});

// Blog routes
router.get('/blog/posts', (req: any, res: any) => {
    res.json({ message: 'רשימת פוסטים' });
});

router.post('/blog/posts', (req: any, res: any) => {
    const { content, author } = req.body as { content: string; author: string };
    res.json({ message: 'פוסט נוסף בהצלחה', content, author });
});

// User routes (placeholder for future implementation)
router.get('/users', (req: any, res: any) => {
    res.json({ message: 'רשימת משתמשים' });
});

router.get('/residents', (req: any, res: any) => {
    res.json({ message: 'רשימת דיירים' });
});

// Health check route
router.get('/health', (req: any, res: any) => {
    res.json({ status: 'OK', message: 'השרת פועל כשורה' });
});

export default router; 