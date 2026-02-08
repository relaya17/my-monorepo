import { Request, Response, Router } from 'express';

const router = Router();

// נתונים לדוגמה
let blogPosts = [
    {
        id: 1,
        title: 'ברוכים הבאים למצפה נוף',
        content: 'זהו הפוסט הראשון בבלוג שלנו',
        author: 'מנהל האתר',
        date: new Date().toISOString()
    }
];

// קבלת כל הפוסטים
router.get('/', (req: Request, res: Response) => {
    res.json(blogPosts);
});

// יצירת פוסט חדש
router.post('/', (req: Request, res: Response) => {
    const { content, author } = req.body as { content: string; author: string };

    if (!content || !author) {
        return res.status(400).json({ error: 'נא למלא את כל השדות' });
    }

    const newPost = {
        id: blogPosts.length + 1,
        title: content.substring(0, 50) + '...',
        content,
        author,
        date: new Date().toISOString()
    };

    blogPosts.push(newPost);
    res.status(201).json(newPost);
});

// עדכון פוסט
router.put('/:id', (req: Request, res: Response) => {
    const postId = req.params.id;
    const { text, author } = req.body as { text: string; author: string };

    const postIndex = blogPosts.findIndex(post => post.id === parseInt(postId));

    if (postIndex === -1) {
        return res.status(404).json({ error: 'פוסט לא נמצא' });
    }

    blogPosts[postIndex] = {
        ...blogPosts[postIndex],
        content: text,
        author
    };

    res.json(blogPosts[postIndex]);
});

// הוספת תגובה
router.post('/:id/comments', (req: Request, res: Response) => {
    const { text, author } = req.body as { text: string; author: string };

    const newComment = {
        id: Date.now(),
        text,
        author,
        date: new Date().toISOString()
    };

    res.status(201).json(newComment);
});

export default router;
