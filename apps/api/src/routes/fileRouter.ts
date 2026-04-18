import { Router, Request } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { uploadBuffer, isCloudinaryConfigured } from '../services/cloudinaryUploadService.js';

const router = Router();

type JsonResponse = {
    status: (code: number) => JsonResponse;
    json: (body: unknown) => unknown;
};

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const uploadSingle = upload.single('file') as unknown as RequestHandler;

router.post('/upload', uploadSingle, async (req: Request, res: JsonResponse) => {
    const file = (req as Request & { file?: { buffer: Buffer; originalname: string; mimetype: string } }).file;
    if (!file) return res.status(400).json({ error: 'לא נבחר קובץ' });
    if (!isCloudinaryConfigured()) return res.status(501).json({ error: 'העלאת קבצים לא מוגדרת (Cloudinary)' });
    try {
        const result = await uploadBuffer(file.buffer, { mimeType: file.mimetype });
        return res.status(200).json({
            message: 'הקובץ הועלה בהצלחה',
            url: result.url,
            secureUrl: result.secureUrl,
            publicId: result.publicId,
            originalname: file.originalname,
        });
    } catch (err) {
        return res.status(500).json({ error: 'שגיאה בהעלאה ל-Cloudinary' });
    }
});

router.get('/files', (_req: Request, res: JsonResponse) => {
    if (!isCloudinaryConfigured()) return res.status(501).json({ error: 'העלאת קבצים ל-Cloudinary לא מוגדרת' });
    return res.status(200).json({ files: [], message: 'רשימת קבצים מתקבלת מ-Cloudinary בלבד' });
});

export default router;
