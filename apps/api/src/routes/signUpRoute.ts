import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Building from '../models/buildingModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { validateEmail, validatePassword, validateName } from '../utils/validation.js';

const router: express.Router = express.Router();

const toSlug = (s: string) => (s || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-\u0590-\u05FF]/g, '');

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as {
    name: string;
    email: string;
    password: string;
    buildingAddress?: string;
    buildingNumber?: string;
    apartmentNumber?: string;
    committeeName?: string;
    securityQuestions?: { question: string; answer: string }[];
  };
  const { name, email, password, buildingAddress, buildingNumber, apartmentNumber, committeeName, securityQuestions: sqInput } = body;

  try {
    // ולידציה לשם
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        message: nameValidation.message,
        field: 'name'
      });
    }

    // ולידציה לאימייל
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: 'אנא הזן כתובת אימייל תקינה',
        field: 'email'
      });
    }

    // ולידציה לסיסמה
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
        field: 'password'
      });
    }

    const addr = (buildingAddress || '').trim() || 'כתובת';
    const num = (buildingNumber || '').trim() || '1';
    const buildingId = toSlug(addr) + '-' + toSlug(num) || 'default';

    // יצירה/עדכון בניין
    await Building.findOneAndUpdate(
      { buildingId },
      {
        buildingId,
        address: addr,
        buildingNumber: num,
        ...(committeeName ? { committeeName: (committeeName || '').trim() } : {})
      },
      { upsert: true, new: true }
    );

    // הרצת יצירת המשתמש בתוך tenant context של הבניין החדש
    let newUser;
    try {
      newUser = await tenantContext.run({ buildingId }, async () => {
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) throw new Error('EMAIL_EXISTS');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const securityQuestions: { question: string; answerHash: string }[] = [];
        if (Array.isArray(sqInput) && sqInput.length >= 2) {
          for (const sq of sqInput.slice(0, 3)) {
            if (sq?.question && sq?.answer) {
              const answerHash = await bcrypt.hash(String(sq.answer).trim(), 10);
              securityQuestions.push({ question: String(sq.question).trim(), answerHash });
            }
          }
        }
        const u = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          apartmentNumber: (apartmentNumber || '').trim() || undefined,
          ...(securityQuestions.length >= 2 ? { securityQuestions } : {})
        });
        await u.save();
        return u;
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'EMAIL_EXISTS') {
        return res.status(400).json({
          message: 'משתמש עם אימייל זה כבר קיים בבניין זה',
          field: 'email'
        });
      }
      throw e;
    }

    return res.status(201).json({
      message: 'משתמש נוצר בהצלחה',
      user: {
        id: (newUser._id as { toString?: () => string })?.toString?.() ?? String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        buildingId,
        apartmentNumber: newUser.apartmentNumber ?? undefined
      }
    });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      message: 'שגיאה ביצירת משתמש, אנא נסה שוב',
      field: 'general'
    });
  }
});

export default router;
