import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  // קבלת נתוני המשתמש מ-localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // ניתוב לדף OrderPage אחרי 5 שניות
    const timer = setTimeout(() => {
      navigate('/orderPage');
    }, 5000); // המתן 5 שניות לפני הניווט

    // ניקוי ה-setTimeout במקרה של יציאה מהדף
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-5 text-center"
        style={{
          maxWidth: '500px',
          borderRadius: '15px',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 className="mb-4" style={{ color: '#4CAF50' }}>
          הרשמה בוצעה בהצלחה
        </h1>
        <p className="lead">
          תודה {user.name}, ההרשמה שלך הושלמה בהצלחה.
        </p>
      </div>
    </div>
  );
};

export default ThankYouPage;
