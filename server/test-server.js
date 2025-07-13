const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3008;

// מערך זמני לאחסון משתמשים (במקום מסד נתונים)
const users = [];

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Test server is running!' });
});

app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Signup request received:', req.body);
    
    try {
        // בדיקה אם המשתמש כבר קיים
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'משתמש כבר קיים' });
        }
        
        // הצפנת הסיסמא
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // שמירת המשתמש
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };
        users.push(newUser);
        
        console.log('User created:', { id: newUser.id, name: newUser.name, email: newUser.email });
        res.json({ message: 'משתמש נוצר בהצלחה' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'שגיאה ביצירת משתמש' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password: '***' });
    
    try {
        // חיפוש המשתמש
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: 'משתמש לא נמצא' });
        }
        
        // בדיקת הסיסמא
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'סיסמא שגויה' });
        }
        
        console.log('User logged in:', { id: user.id, name: user.name, email: user.email });
        res.json({ 
            message: 'התחברות מוצלחת',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'שגיאה בהתחברות' });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Admin login request received:', { username, password: '***' });
    
    try {
        // בדיקה פשוטה לאדמין (בפועל זה יהיה במסד נתונים)
        if (username === 'admin' && password === 'admin123') {
            console.log('Admin logged in:', { username });
            res.json({ 
                message: 'התחברות מוצלחת',
                admin: {
                    username: 'admin',
                    role: 'admin'
                }
            });
        } else {
            res.status(400).json({ message: 'שם משתמש או סיסמה שגויים' });
        }
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'שגיאה בהתחברות' });
    }
});

app.listen(port, () => {
    console.log(`Test server is running on http://localhost:${port}`);
}); 