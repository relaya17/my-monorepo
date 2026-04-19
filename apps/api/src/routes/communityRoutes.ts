/**
 * Community Wall posts — CRUD with moderation and likes.
 * GET  /api/community          – list approved posts (public per building)
 * POST /api/community          – create post (auth required)
 * PATCH /api/community/:id/status – moderate post admin only
 * POST /api/community/:id/like    – toggle like (auth)
 * POST /api/community/:id/comments – add comment (auth)
 */
import { Request, Response, Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import CommunityPost from '../models/communityPostModel.js';
import mongoose from 'mongoose';

const router = Router();

function getBuildingId(req: Request): string {
  return (req.headers['x-building-id'] as string)?.trim() || 'default';
}

/** List posts — approved only for non-admins, all for admins. */
router.get('/', async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const status = (req.query.status as string) ?? 'approved';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);

    const posts = await tenantContext.run({ buildingId }, async () =>
      CommunityPost.find({ status })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    );
    res.json(posts);
  } catch {
    res.status(500).json({ error: 'שגיאה בטעינת הפוסטים' });
  }
});

/** Create post (auth required). */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { content, authorName, imageUrl } = req.body as {
      content?: string;
      authorName?: string;
      imageUrl?: string;
    };
    if (!content?.trim()) return res.status(400).json({ error: 'תוכן הפוסט חובה' });
    if (!authorName?.trim()) return res.status(400).json({ error: 'שם המחבר חובה' });
    if (content.length > 2000) return res.status(400).json({ error: 'הפוסט ארוך מדי (מקסימום 2000 תווים)' });

    const authorId = req.auth?.sub ?? 'unknown';
    const post = await tenantContext.run({ buildingId }, async () =>
      CommunityPost.create({
        authorId,
        authorName: authorName.trim(),
        content: content.trim(),
        imageUrl,
        status: 'pending',
      })
    );
    res.status(201).json(post);
  } catch {
    res.status(500).json({ error: 'שגיאה ביצירת הפוסט' });
  }
});

/** Moderate post status (admin only). */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.type !== 'admin') return res.status(403).json({ error: 'גישה לאדמינים בלבד' });

    const { status } = req.body as { status?: string };
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'סטטוס לא תקין' });
    }

    const buildingId = getBuildingId(req);
    const post = await tenantContext.run({ buildingId }, async () =>
      CommunityPost.findByIdAndUpdate(req.params.id, { status }, { new: true })
    );
    if (!post) return res.status(404).json({ error: 'פוסט לא נמצא' });
    res.json(post);
  } catch {
    res.status(500).json({ error: 'שגיאה בעדכון הסטטוס' });
  }
});

/** Toggle like on post (auth required). */
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const userId = req.auth?.sub ?? '';
    if (!userId) return res.status(401).json({ error: 'אין הרשאה' });

    const post = await tenantContext.run({ buildingId }, async () =>
      CommunityPost.findById(req.params.id)
    );
    if (!post) return res.status(404).json({ error: 'פוסט לא נמצא' });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch {
    res.status(500).json({ error: 'שגיאה בלייק' });
  }
});

/** Add comment to post (auth required). */
router.post('/:id/comments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const buildingId = getBuildingId(req);
    const { content, authorName } = req.body as { content?: string; authorName?: string };
    if (!content?.trim()) return res.status(400).json({ error: 'תוכן התגובה חובה' });
    if (!authorName?.trim()) return res.status(400).json({ error: 'שם המחבר חובה' });
    if (content.length > 500) return res.status(400).json({ error: 'התגובה ארוכה מדי' });

    const authorId = req.auth?.sub ?? 'unknown';
    const post = await tenantContext.run({ buildingId }, async () =>
      CommunityPost.findById(req.params.id)
    );
    if (!post) return res.status(404).json({ error: 'פוסט לא נמצא' });
    if (post.status !== 'approved') return res.status(400).json({ error: 'לא ניתן להגיב על פוסט שלא אושר' });

    post.comments.push({
      _id: new mongoose.Types.ObjectId(),
      authorId,
      authorName: authorName.trim(),
      content: content.trim(),
      createdAt: new Date(),
    });
    await post.save();
    res.status(201).json(post.comments.at(-1));
  } catch {
    res.status(500).json({ error: 'שגיאה בהוספת תגובה' });
  }
});

export default router;
