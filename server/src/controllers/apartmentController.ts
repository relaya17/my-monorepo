import { Router, Request, Response } from 'express';

const router: Router = Router();

interface Apartment {
    id: number;
    address: string;
    price: number;
    description: string;
    image: string;
}

let apartmentsForSale: Apartment[] = [
    {
        id: 1,
        address: 'רחוב דוגמה 1, תל אביב',
        price: 1500000,
        description: 'דירה 3 חדרים, קרובה למרכז העיר',
        image: 'apartment1.jpg',
    },
    {
        id: 2,
        address: 'רחוב דוגמה 2, ירושלים',
        price: 2000000,
        description: 'דירה 4 חדרים, עם נוף לים',
        image: 'apartment2.jpg',
    },
];

let apartmentsForRent: Apartment[] = [
    {
        id: 1,
        address: 'רחוב דוגמה 1, תל אביב',
        price: 5000,
        description: 'דירה 2 חדרים, קרובה לחוף הים',
        image: 'apartment1.jpg',
    },
    {
        id: 2,
        address: 'רחוב דוגמה 2, ירושלים',
        price: 7000,
        description: 'דירה 3 חדרים, מרכז העיר',
        image: 'apartment2.jpg',
    },
];

// קבלת דירות למכירה
router.get('/for-sale', (req: Request, res: Response) => {
    res.json(apartmentsForSale);
});

// הוספת דירה למכירה
router.post('/for-sale', (req: Request, res: Response) => {
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

// קבלת דירות להשכרה
router.get('/for-rent', (req: Request, res: Response) => {
    res.json(apartmentsForRent);
});

// הוספת דירה להשכרה
router.post('/for-rent', (req: Request, res: Response) => {
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
