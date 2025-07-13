// pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { setPaymentDetails, clearPaymentDetails } from '../redux/slice/PaymentSlice';
import 'bootstrap/dist/css/bootstrap.min.css';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const payment = useSelector((state: RootState) => state.payment);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerName = localStorage.getItem('customerName');
  const customerPhone = localStorage.getItem('customerPhone');

  useEffect(() => {
    if (!customerName || !customerPhone) {
      navigate('/CheckoutPage');
    }
  }, [navigate, customerName, customerPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment.cardNumber || !payment.expiryDate || !payment.cvv) {
      setError('כל השדות של כרטיס האשראי חייבים להיות מלאים');
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentInfo = {
        payer: customerName || '',
        amount: payment.amount,
        date: new Date().toLocaleDateString(),
      };
      localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo));

      alert('ההזמנה הושלמה בהצלחה!');
      dispatch(clearPaymentDetails());
      navigate('/receipt');
    } catch (error) {
      setError('אירעה שגיאה בתהליך התשלום, אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="row w-100">
        <div className="col-12 col-md-10 col-lg-8 mx-auto">
          <div className="card shadow-lg p-4">
            <h2 className="text-center mb-4 font-weight-bold" style={{ fontSize: '2rem', color: '#374151' }}>
              דף תשלום בכרטיס אשראי
            </h2>

            {error && <p className="alert alert-danger">{error}</p>}

            {customerName && customerPhone && (
              <div className="alert alert-info mb-4">
                <h4>פרטי הלקוח:</h4>
                <p><strong>שם:</strong> {customerName}</p>
                <p><strong>טלפון:</strong> {customerPhone}</p>
              </div>
            )}

         <form onSubmit={handleSubmit}>
  <div className="form-group">
    <label htmlFor="cardNumber" className="font-weight-bold">מספר כרטיס אשראי</label>
    <input
      type="text"
      className="form-control form-control-lg"
      id="cardNumber"
      placeholder="הכנס את מספר כרטיס האשראי"
      value={payment.cardNumber}
      onChange={(e) => dispatch(setPaymentDetails({ cardNumber: e.target.value }))}
      required
      maxLength={19}
    />
  </div>

  <div className="form-group mt-3">
    <label htmlFor="expiryDate" className="font-weight-bold">תוקף (MM/YY)</label>
    <input
      type="text"
      className="form-control form-control-lg"
      id="expiryDate"
      placeholder="MM/YY"
      value={payment.expiryDate}
      onChange={(e) => dispatch(setPaymentDetails({ expiryDate: e.target.value }))}
      required
      pattern="\d{2}/\d{2}"
    />
  </div>

  <div className="form-group mt-3">
    <label htmlFor="cvv" className="font-weight-bold">CVV</label>
    <input
      type="text"
      className="form-control form-control-lg"
      id="cvv"
      placeholder="3 ספרות בגב הכרטיס"
      value={payment.cvv}
      onChange={(e) => dispatch(setPaymentDetails({ cvv: e.target.value }))}
      required
      maxLength={4}
      pattern="\d{3,4}"
    />
  </div>

  <button type="submit" className="btn btn-success mt-4 w-100" disabled={isSubmitting}>
    {isSubmitting ? 'בבקשה המתן...' : 'השלם הזמנה'}
  </button>
</form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
