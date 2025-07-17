import { Router } from 'express';
import Payment from '../models/paymentModel.js';
import { generateReceipt } from '../utils/pdfUtils.js';

const router = Router();

interface PaymentBody {
    payer: string;
    amount: number;
}

interface ReceiptBody {
    payer: string;
    amount: number;
    chairmanName: string;
}

// יצירת תשלום
const createPayment = async (req: any, res: any) => {
    const { payer, amount } = req.body;

    if (!payer || !amount) {
        res.status(400).json({ error: 'נא למלא את כל השדות' });
        return;
    }

    try {
        const newPayment = new Payment({ payer, amount });
        await newPayment.save();
        res.status(201).json(newPayment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

// קבלת כל התשלומים
const getPayments = async (_req: any, res: any) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

// מחיקת תשלום לפי ID
const deletePayment = async (req: any, res: any) => {
    try {
        const deleted = await Payment.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: 'תשלום לא נמצא' });
            return;
        }
        res.json({ message: 'תשלום נמחק' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

// יצירת קבלה PDF
const generateReceiptHandler = async (req: any, res: any) => {
    const { payer, amount, chairmanName } = req.body;

    if (!payer || !amount || !chairmanName) {
        res.status(400).json({ error: 'נא למלא את כל השדות' });
        return;
    }

    try {
        const pdfBuffer = await generateReceipt(payer, amount, chairmanName);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${payer}-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({ error: 'שגיאה ביצירת הקבלה' });
    }
};

router.post('/', createPayment);
router.get('/', getPayments);
router.delete('/:id', deletePayment);
router.post('/generate-receipt', generateReceiptHandler);

export default router;
// my-monorepo-app/server/src/routes/paymentsRouter.ts