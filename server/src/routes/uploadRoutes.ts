import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// טיפוס מותאם ל-Multer
interface MulterRequest extends Request {
    file: Express.Multer.File;
}

// הגדרת multer לשמירת קבצים
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// הוספת קובץ
const uploadHandler = (req: MulterRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'לא נבחר קובץ' });
    }

    return res.status(200).json({
        message: 'הקובץ הועלה בהצלחה',
        filename: req.file.filename,
        originalname: req.file.originalname
    });
};

router.post('/upload', upload.single('file'), uploadHandler);

// קבלת רשימת קבצים
router.get('/', (req: Request, res: Response) => {
    const uploadsDir = path.join(__dirname, '../../../uploads');
    fs.readdir(uploadsDir, (err: NodeJS.ErrnoException | null, files: string[]) => {
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


        return res.status(200).json(fileList);
    });
});

export default router;
