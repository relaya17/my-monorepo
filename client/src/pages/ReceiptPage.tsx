import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ROUTES from '../routs/routes';

interface PaymentInfo {
  payer: string;
  amount: number;
}

const ReceiptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [chairmanName, setChairmanName] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const paymentData = location.state?.paymentInfo;
    if (paymentData) {
      setPaymentInfo(paymentData);
    } else {
      // אם אין מידע, חזרה לדף הבית
      navigate('/');
    }

    setChairmanName('יושב ראש אגודת מצפה נוף');
  }, [location, navigate]);

  const handleDownloadReceipt = async () => {
    if (!paymentInfo) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/generate-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payer: paymentInfo.payer,
          amount: paymentInfo.amount,
          chairmanName: chairmanName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentInfo.payer}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Error downloading receipt
      alert('שגיאה בהורדת הקבלה');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!paymentInfo) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" 
           style={{ 
             minHeight: '100vh', 
             background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
             direction: 'rtl'
           }}>
        <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body p-5 text-center">
            <i className="fas fa-exclamation-triangle fa-3x mb-3" style={{ color: '#f59e0b' }}></i>
            <h3>אין מידע על תשלום</h3>
            <p className="text-muted">חזור לדף הבית ונסה שוב</p>
            <button 
              onClick={handleBackToHome}
              className="btn btn-primary"
            >
              <i className="fas fa-home ms-2"></i>
              חזרה לדף הבית
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" 
         style={{ 
           background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
           direction: 'rtl'
         }}>
      <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body p-5" style={{ textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-receipt fa-3x text-success mb-3"></i>
            <h2 className="card-title" style={{ color: '#2c3e50' }}>
              קבלה לתשלום
            </h2>
            <p className="text-muted">תודה על התשלום שלך</p>
          </div>

          <div className="receipt-details mb-4">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-user ms-2"></i>
                    שם הלקוח
                  </label>
                  <p className="text-muted">{paymentInfo.payer}</p>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-money-bill ms-2"></i>
                    סכום התשלום
                  </label>
                  <p className="text-success fw-bold fs-4">{paymentInfo.amount} ₪</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-calendar ms-2"></i>
                    תאריך התשלום
                  </label>
                  <p className="text-muted">{new Date().toLocaleDateString('he-IL')}</p>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-clock ms-2"></i>
                    שעת התשלום
                  </label>
                  <p className="text-muted">{new Date().toLocaleTimeString('he-IL')}</p>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">
                <i className="fas fa-user-tie ms-2"></i>
                יושב ראש אגודת מצפה נוף
              </label>
              <p className="text-muted">{chairmanName}</p>
            </div>
          </div>

          <div className="alert alert-success text-center" role="alert">
            <i className="fas fa-check-circle ms-2"></i>
            <strong>תשלום התקבל בהצלחה!</strong>
            <br />
            <small>ההזמנה שלך הושלמה ותקבל אישור במייל</small>
          </div>

          <div className="d-grid gap-2">
            <button
              onClick={handleDownloadReceipt}
              className="btn btn-primary"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="spinner-border spinner-border-sm ms-2" role="status"></span>
                  מוריד קבלה...
                </>
              ) : (
                <>
                  <i className="fas fa-download ms-2"></i>
                  הורד קבלה (PDF)
                </>
              )}
            </button>
            
            <button
              onClick={handleBackToHome}
              className="btn btn-outline-secondary"
            >
              <i className="fas fa-home ms-2"></i>
              חזרה לדף הבית
            </button>
          </div>

          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-info-circle ms-1"></i>
              הקבלה נשמרת במערכת וניתן להוריד אותה בכל עת
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
