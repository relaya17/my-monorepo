import { Request, Response, Router } from 'express';
import { buildingApartmentsKey, cacheDel, cacheGet, cacheSet } from '../config/redis.js';

const router = Router();

interface Apartment {
    id: number;
    address: string;
    price: number;
    description: string;
    image: string;
}

// דוגמת נתונים לזמן פיתוח
let apartmentsForSale = [
    {
        id: 1,
        address: 'רחוב דוגמה 1, תל אביב',
        price: 1500000,
        description: 'דירה 3 חדרים, קרובה למרכז העיר',
        image: 'aparment.png',
    },
    {
        id: 2,
        address: 'רחוב דוגמה 2, ירושלים',
        price: 2000000,
        description: 'דירה 4 חדרים, עם נוף לים',
        image: 'aparment.png',
    },
];

let apartmentsForRent = [
    {
        id: 1,
        address: 'רחוב דוגמה 1, תל אביב',
        price: 5000,
        description: 'דירה 2 חדרים, קרובה לחוף הים',
        image: 'aparment.png',
    },
    {
        id: 2,
        address: 'רחוב דוגמה 2, ירושלים',
        price: 7000,
        description: 'דירה 3 חדרים, מרכז העיר',
        image: 'aparment.png',
    },
];

// נתיב לקבלת דירות למכירה (with optional Redis cache – TECHNICAL_SPECIFICATION §8.1)
router.get('/for-sale', async (req: Request, res: Response) => {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const cached = await cacheGet<typeof apartmentsForSale>(buildingApartmentsKey(buildingId, 'for-sale'));
    if (cached != null) return res.json(cached);
    await cacheSet(buildingApartmentsKey(buildingId, 'for-sale'), apartmentsForSale);
    res.json(apartmentsForSale);
});

// נתיב להוספת דירה למכירה
router.post('/for-sale', async (req: Request, res: Response) => {
    const { address, price, description, image } = req.body as {
        address: string;
        price: number;
        description: string;
        image: string;
    };

    if (!address || !price || !description) {
        return res.status(400).json({ error: 'נא למלא את כל השדות' });
    }

    const newApartment = {
        id: apartmentsForSale.length + 1,
        address,
        price,
        description,
        image: image || 'default.jpg'
    };

    apartmentsForSale.push(newApartment);
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    await cacheDel(buildingApartmentsKey(buildingId, 'for-sale'));
    res.status(201).json(newApartment);
});

// נתיב לקבלת דירות להשכרה (with optional Redis cache – TECHNICAL_SPECIFICATION §8.1)
router.get('/for-rent', async (req: Request, res: Response) => {
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    const cached = await cacheGet<typeof apartmentsForRent>(buildingApartmentsKey(buildingId, 'for-rent'));
    if (cached != null) return res.json(cached);
    await cacheSet(buildingApartmentsKey(buildingId, 'for-rent'), apartmentsForRent);
    res.json(apartmentsForRent);
});

// נתיב להוספת דירה להשכרה
router.post('/for-rent', async (req: Request, res: Response) => {
    const { address, price, description, image } = req.body as {
        address: string;
        price: number;
        description: string;
        image: string;
    };

    if (!address || !price || !description) {
        return res.status(400).json({ error: 'נא למלא את כל השדות' });
    }

    const newApartment = {
        id: apartmentsForRent.length + 1,
        address,
        price,
        description,
        image: image || 'default.jpg'
    };

    apartmentsForRent.push(newApartment);
    const buildingId = (req.headers['x-building-id'] as string)?.trim() || 'default';
    await cacheDel(buildingApartmentsKey(buildingId, 'for-rent'));
    res.status(201).json(newApartment);
});

export default router;
