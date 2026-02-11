import { Request, Response, Router } from 'express';
import Building from '../models/buildingModel.js';
import Maintenance from '../models/maintenanceModel.js';
import { tenantContext } from '../middleware/tenantMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

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

/** GET /residents/dashboard – building-scoped dashboard for resident (auth + x-building-id). */
const getDashboard = async (_req: Request, res: Response) => {
    try {
        const store = tenantContext.getStore();
        const buildingId = store?.buildingId ?? 'default';

        const buildingDoc = await Building.findOne({ buildingId }).lean();
        const buildingName =
            (buildingDoc && (buildingDoc as { committeeName?: string }).committeeName) ||
            (buildingDoc && (buildingDoc as { address?: string }).address) ||
            buildingId;

        const pulse = {
            water: 'תקין',
            electricity: 'תקין',
            elevators: 'פעיל',
            cleaner: 'לובי נוקה לאחרונה',
            cameras: 'פעיל',
        };

        const maintenanceList = await Maintenance.find({ isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const feed = maintenanceList.map((m: { _id?: unknown; title?: string; description?: string; category?: string; createdAt?: Date }) => ({
            id: String((m as { _id?: { toString?: () => string } })._id?.toString?.() ?? (m as { _id?: unknown })._id),
            title: m.title ?? '',
            body: m.description,
            type: m.category ?? 'Other',
            createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
        }));

        const urgentOpen = await Maintenance.findOne({
            isDeleted: { $ne: true },
            status: { $in: ['Open', 'In_Progress'] },
            priority: 'Urgent',
            category: { $in: ['Plumbing', 'Electrical'] },
        }).lean();
        const emergencyDetected = !!urgentOpen;

        res.json({
            buildingId,
            buildingName,
            pulse,
            feed,
            emergencyDetected,
        });
    } catch (error) {
        console.error('Resident dashboard error:', error);
        res.status(500).json({ error: 'שגיאה בטעינת דאשבורד' });
    }
};

router.get('/dashboard', authMiddleware, getDashboard);
router.get('/', getResidents);
router.post('/', createResident);
router.put('/:id/status', updateResidentStatus);
router.delete('/:id', deleteResident);

export default router; 