// pages/PaymentPage.tsx
import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';

const PaymentPage: React.FC = () => {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!payer || !amount || !cardNumber || !expiryDate || !cvv) {
      setError('יש למלא את כל השדות');
      return;
    }
    // שליחת נתוני התשלום לשרת
    const payment = { payer, amount, cardNumber, expiryDate, cvv };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      if (!response.ok) {
        throw new Error('שגיאה בביצוע התשלום');
      }
      // קבלת קבלה PDF
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'receipt.pdf';
      link.click();
      setSuccess('התשלום בוצע בהצלחה! קבלה הופקה להורדה.');
      setPayer(''); setAmount(0); setCardNumber(''); setExpiryDate(''); setCvv('');
    } catch (err) {
      setError('שגיאה בביצוע התשלום');
    }
  };

  return (
    <div className="container payment-form mt-5" style={{ direction: 'rtl', paddingTop: 64 }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ padding: 0 }}>
          <div className="card shadow-sm p-4" style={{ background: '#f9fafb', border: '2px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 600, margin: '0 auto' }}>
            <div className="d-flex align-items-center mb-4" style={{ justifyContent: 'right' }}>
              <span style={{ fontSize: 32, color: '#1976d2', marginLeft: 12 }}>
                <i className="fas fa-credit-card"></i>
              </span>
              <h2 className="mb-0" style={{ textAlign: 'right', color: '#2c3e50', fontWeight: 'bold' }}>ביצוע תשלום</h2>
            </div>
            <Form onSubmit={handleSubmit} style={{ textAlign: 'right' }}>
              <Form.Group className="mb-2">
                <Form.Label>שם הלקוח</Form.Label>
                <Form.Control
                  type="text"
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>סכום</Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>מספר כרטיס אשראי</Form.Label>
                <Form.Control
                  type="password"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>תוקף</Form.Label>
                <Form.Control
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">שלח תשלום</Button>
              </div>
            </Form>
            {error && <Alert variant="danger" className="mt-3" style={{ textAlign: 'right' }}>{error}</Alert>}
            {success && <Alert variant="success" className="mt-3" style={{ textAlign: 'right' }}>{success}</Alert>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
