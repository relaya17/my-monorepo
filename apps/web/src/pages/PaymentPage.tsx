// pages/PaymentPage.tsx
import React, { useEffect, useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { apiRequestJson } from '../api';
import { useBuilding } from '../context/BuildingContext';
import PriceDisplay from '../components/PriceDisplay';

const PaymentPage: React.FC = () => {
  const { buildingId, buildingName } = useBuilding();
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!buildingId || buildingId === 'default') return;
    apiRequestJson<{ accountId: string | null }>(`stripe/connect/status?buildingId=${encodeURIComponent(buildingId)}`)
      .then(({ data }) => setStripeAccountId(data?.accountId ?? null))
      .catch(() => setStripeAccountId(null));
  }, [buildingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!payer || !amount || amount <= 0) {
      setError('יש למלא שם ולהזין סכום חיובי');
      return;
    }
    if (!stripeAccountId) {
      setError('הבניין טרם הוגדר לקבלת תשלומים. פנה למנהל.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiRequestJson<{ url: string }>('stripe/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          payer,
          amount,
          buildingId,
          buildingStripeAccountId: stripeAccountId,
        }),
      });
      // Redirect to Stripe Checkout – card data stays on Stripe (PCI-compliant)
      if (data?.url) window.location.href = data.url;
    } catch {
      setError('שגיאה ביצירת עמוד תשלום. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container payment-form mt-5 payment-page-wrapper">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 p-0">
          <div className="card shadow-sm p-4 payment-page-card">
            <div className="d-flex align-items-center mb-4 payment-page-header">
              <span className="payment-page-icon">
                <i className="fas fa-credit-card"></i>
              </span>
              <div>
                <h2 className="mb-0 payment-page-title">ביצוע תשלום</h2>
                {buildingName && buildingName !== 'default' && (
                  <p className="mb-0 small text-muted payment-page-subtitle">בניין: {buildingName}</p>
                )}
              </div>
            </div>
            <Form onSubmit={handleSubmit} className="text-end">
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
                <Form.Label>סכום {amount > 0 && <PriceDisplay amount={amount} className="text-muted" />}</Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'מעביר לעמוד תשלום...' : 'המשך לתשלום מאובטח'}
                </Button>
              </div>
            </Form>
            {error && <Alert variant="danger" className="mt-3 text-end">{error}</Alert>}
            <p className="text-muted small mt-3 text-center">
              <i className="fas fa-lock me-1"></i>
              התשלום מתבצע דרך Stripe בסביבה מאובטחת. פרטי הכרטיס לא עוברים דרך השרת שלנו.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
