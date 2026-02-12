/**
 * V-One Chat – חיבור ל-OpenAI Assistants (Function Calling)
 * דורש OPENAI_API_KEY ב-env
 * Context: Building.country → buildVOneSystemContext (HOA, Fahrenheit, USD)
 */
import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Building from '../models/buildingModel.js';
import { buildVOneSystemContext } from '../utils/voneContext.js';

const router = express.Router();

const REPORT_KEYWORDS_HE = /\bתקלה|נזיל|נזילה|חשמל|מעלית|דווח|תקון\b/;
const REPORT_KEYWORDS_EN = /\bfault|leak|electrical|elevator|report|repair|dishwasher|garbage\s*disposal\b/;

/** POST /api/vone/chat – שליחת הודעה ל-V-One, תשובה חכמה */
router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { sub: string; type: string; buildingId?: string } }).auth;
  if (!auth || auth.type !== 'user') {
    return res.status(403).json({ message: 'גישה לדיירים בלבד' });
  }
  const body = req.body as { message?: string; lang?: string };
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return res.status(400).json({ message: 'נא לשלוח message' });

  const buildingId = (auth.buildingId ?? req.headers['x-building-id'])?.toString().trim() || 'default';
  const building = await Building.findOne({ buildingId }).select('country timezone').lean();
  const country = (building as { country?: string } | null)?.country ?? 'IL';
  const timezone = (building as { timezone?: string } | null)?.timezone ?? 'Asia/Jerusalem';

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    const lower = message.toLowerCase();
    const isReport = REPORT_KEYWORDS_HE.test(message) || REPORT_KEYWORDS_EN.test(lower);

    if (isReport) {
      const reply =
        country === 'US'
          ? 'I understand you have a fault. I opened the report page – fill in the details and we will send a technician promptly.'
          : 'הבנתי שיש לך תקלה. פתחתי עבורך את דף הדיווח – מלא את הפרטים ונשלח טכנאי בהקדם.';
      return res.json({ reply, action: 'report' });
    }
    if (/\bחשבון|תשלום|כסף\b|\baccount|payment|balance\b/.test(message) || /\baccount|payment|balance\b/.test(lower)) {
      const reply =
        country === 'US'
          ? 'To view your account balance, go to the Payments page.'
          : 'כדי לראות את מצב החשבון שלך, עבור לדף התשלומים.';
      return res.json({ reply, action: 'account' });
    }
    const reply =
      country === 'US'
        ? "I'm V-One, your personal assistant. How can I help? You can use the buttons below or report a fault."
        : 'אני V-One, העוזר האישי שלך. איך אוכל לעזור? תוכל לבחור בכפתורים למטה או לדווח על תקלה.';
    return res.json({ reply, action: null });
  }

  // systemContext ready for OpenAI system message when Assistants API is wired
  void buildVOneSystemContext({ country, timezone, lang: body.lang });

  try {
    // TODO: חיבור OpenAI Assistants API – להעביר systemContext כ-system message
    res.json({
      reply:
        country === 'US'
          ? 'OpenAI Assistants will be enabled with OPENAI_API_KEY. I currently work in basic mode.'
          : 'החיבור ל-OpenAI Assistants יופעל עם הגדרת OPENAI_API_KEY. כרגע אני עובד במצב בסיסי.',
      action: null,
    });
  } catch (err) {
    console.error('V-One chat error:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

export default router;
