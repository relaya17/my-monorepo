import { Router } from 'express';

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

// נתיב לקבלת דירות למכירה
router.get('/for-sale', (req: any, res: any) => {
    res.json(apartmentsForSale);
});

// נתיב להוספת דירה למכירה
router.post('/for-sale', (req: any, res: any) => {
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
    res.status(201).json(newApartment);
});

// נתיב לקבלת דירות להשכרה
router.get('/for-rent', (req: any, res: any) => {
    console.log("[FOR RENT] sending apartments for rent")
    res.json(apartmentsForRent);
});

// נתיב להוספת דירה להשכרה
router.post('/for-rent', (req: any, res: any) => {
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
    res.status(201).json(newApartment);
});

export default router;
