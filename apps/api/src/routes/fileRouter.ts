import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// NOTE: In some pnpm/CI layouts, Express types can be duplicated which causes
// TS2769 ("No overload matches this call") when passing Multer middleware.
// Casting here keeps runtime behavior identical while avoiding type conflicts.
const uploadSingle: any = upload.single('file');

router.post('/upload', uploadSingle, (req: Request, res: Response) => {
    // multer מוסיף את הfile לreq - לצורך TypeScript אפשר להתעלם מהטעות עם //@ts-ignore
    // או להוסיף טיפוס מותאם
    //@ts-ignore
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'לא נבחר קובץ' }); // כאן השימוש ב status כ-callable תקין
    }

    res.status(200).json({
        message: 'הקובץ הועלה בהצלחה',
        filename: file.filename,
        originalname: file.originalname
    });
});

router.get('/files', (req: Request, res: Response) => {
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
        res.status(200).json(fileList);
    });
});

export default router;
