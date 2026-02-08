import { Router, Request } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Minimal response typing to avoid Express type-resolution issues in some setups.
type JsonResponse = {
    status: (code: number) => JsonResponse;
    json: (body: unknown) => unknown;
};

// טיפוס מותאם ל-Multer
interface MulterRequest extends Request {
    file?: Express.Multer.File;
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

// See note in fileRouter.ts about TS2769 with duplicated Express type packages.
const uploadSingle = upload.single('file') as unknown as RequestHandler;

// הוספת קובץ
const uploadHandler = (req: Request, res: JsonResponse) => {
    const file = (req as MulterRequest).file;
    if (!file) {
        return res.status(400).json({ error: 'לא נבחר קובץ' });
    }

    return res.status(200).json({
        message: 'הקובץ הועלה בהצלחה',
        filename: file.filename,
        originalname: file.originalname
    });
};

router.post('/upload', uploadSingle, uploadHandler);

// קבלת רשימת קבצים
router.get('/', (req: Request, res: JsonResponse) => {
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
