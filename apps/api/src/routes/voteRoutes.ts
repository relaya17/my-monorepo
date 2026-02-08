import { Request, Response, Router } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    const { questionId, optionIndex } = req.body as { questionId: string; optionIndex: number };

    // כאן תהיה הלוגיקה של ההצבעה
    console.log('Vote received:', { questionId, optionIndex });

    res.status(200).json({ message: 'ההצבעה נרשמה בהצלחה' });
});

export default router;
