import React, { useState } from 'react';

const PaymentForm: React.FC = () => {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // ודא שכל השדות מלאים
    if (!payer || amount <= 0) {
      setError('נא למלא את כל השדות');
      return;
    }

    // יצירת אובייקט התשלום
    const payment = {
      payer,
      amount,
    };

    try {
      // שליחת הבקשה ל-API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        throw new Error('שגיאה בהוספת התשלום');
      }

      // קבלת PDF מהשרת
      const blob = await response.blob();
      
      // יצירת אובייקט URL מ-PDF
      const pdfUrl = URL.createObjectURL(blob);
      
      // אפשר לפתוח את ה-PDF או להוריד אותו
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'receipt.pdf'; // הגדרת שם הקובץ
      link.click(); // מתחילים את הורדת ה-PDF

    } catch (error) {
      // שגיאה בשליחת הבקשה
      setError('שגיאה בשליחת הבקשה');
    }
  };

  return (
    <div>
      <h2>הוספת תשלום</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>שם הלקוח:</label>
          <input
            type="text"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            required
          />
        </div>
        <div>
          <label>סכום:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">שלח תשלום</button>
      </form>
    </div>
  );
};

export default PaymentForm;
