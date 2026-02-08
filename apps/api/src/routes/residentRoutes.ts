import { Request, Response, Router } from 'express';

const router = Router();

interface Resident {
    id: string;
    name: string;
    apartment: string;
    phone: string;
    email: string;
    status: 'active' | 'pending' | 'inactive';
}

// דוגמת נתונים לזמן פיתוח
let residents: Resident[] = [
    {
        id: '1',
        name: 'יוסי כהן',
        apartment: 'A1',
        phone: '050-1234567',
        email: 'yossi@example.com',
        status: 'active'
    },
    {
        id: '2',
        name: 'שרה לוי',
        apartment: 'B3',
        phone: '052-9876543',
        email: 'sara@example.com',
        status: 'pending'
    }
];

// קבלת כל התושבים
const getResidents = async (_req: Request, res: Response) => {
    try {
        res.json(residents);
    } catch (error) {
        console.error('Error fetching residents:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

// הוספת תושב חדש
const createResident = async (req: Request, res: Response) => {
    try {
        const { name, apartment, phone, email } = req.body as {
            name: string;
            apartment: string;
            phone: string;
            email: string;
        };

        if (!name || !apartment || !phone || !email) {
            return res.status(400).json({ error: 'נא למלא את כל השדות' });
        }

        const newResident: Resident = {
            id: Date.now().toString(),
            name,
            apartment,
            phone,
            email,
            status: 'pending'
        };

        residents.push(newResident);
        res.status(201).json(newResident);
    } catch (error) {
        console.error('Error creating resident:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

// עדכון סטטוס תושב
const updateResidentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body as { status: string };

        if (!status || !['active', 'pending', 'inactive'].includes(status as 'active' | 'pending' | 'inactive')) {
            return res.status(400).json({ error: 'סטטוס לא תקין' });
        }

        const residentIndex = residents.findIndex(r => r.id === id);

        if (residentIndex === -1) {
            return res.status(404).json({ error: 'תושב לא נמצא' });
        }

        residents[residentIndex].status = status as 'active' | 'pending' | 'inactive';
        res.json(residents[residentIndex]);
    } catch (error) {
        console.error('Error updating resident status:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

// מחיקת תושב
const deleteResident = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const residentIndex = residents.findIndex(r => r.id === id);

        if (residentIndex === -1) {
            return res.status(404).json({ error: 'תושב לא נמצא' });
        }

        residents.splice(residentIndex, 1);
        res.json({ message: 'תושב נמחק בהצלחה' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};

router.get('/', getResidents);
router.post('/', createResident);
router.put('/:id/status', updateResidentStatus);
router.delete('/:id', deleteResident);

export default router; 