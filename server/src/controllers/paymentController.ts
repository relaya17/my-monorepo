import { Router, Request, Response } from 'express';
import Payment from '../models/paymentModel.js';
import { generateReceipt } from '../receipt.js';

const router: Router = Router();

interface PaymentRequestBody {
  payer: string;
  amount: number;
}

// הוספת תשלום עם יצירת קבלה
export const addPayment = async (req: Request, res: Response) => {
  try {
    const { payer, amount } = req.body as PaymentRequestBody;

    if (!payer || !amount) {
      return res.status(400).json({ error: 'נא למלא את כל השדות' });
    }

    const newPayment = new Payment({ payer, amount });
    await newPayment.save();

    const chairmanName = "יושב ראש אגודת מצפה נוף";
    const pdfBytes = await generateReceipt(payer, amount, chairmanName);

    if (Buffer.isBuffer(pdfBytes)) {
      res.status(201)
        .setHeader('Content-Type', 'application/pdf')
        .send(pdfBytes);
    } else {
      throw new Error('קבלה לא נוצרה בצורה תקינה');
    }
  } catch (error) {
    console.error('שגיאה בהוספת תשלום:', error);
    res.status(500).json({ error: 'שגיאה בשרת, נסה שוב מאוחר יותר' });
  }
};

// שליפת כל התשלומים
export const getPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('שגיאה בשליפת תשלומים:', error);
    res.status(500).json({ error: 'שגיאה בשרת, נסה שוב מאוחר יותר' });
  }
};

// מחיקת תשלום
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Payment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'תשלום לא נמצא' });
    }

    res.json({ message: 'תשלום נמחק בהצלחה' });
  } catch (error) {
    console.error('שגיאה במחיקת תשלום:', error);
    res.status(500).json({ error: 'שגיאה בשרת, נסה שוב מאוחר יותר' });
  }
};

export default router;
