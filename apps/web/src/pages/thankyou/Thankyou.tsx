import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { safeGetItem } from '../../utils/safeStorage';
import './Thankyou.css';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  // קבלת נתוני המשתמש מ-localStorage
  const userStr = safeGetItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  useEffect(() => {
    // ניתוב לדף הבית אחרי 5 שניות
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000); // המתן 5 שניות לפני הניווט

    // ניקוי ה-setTimeout במקרה של יציאה מהדף
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-5 text-center thankyou-card">
        <h1 className="mb-4 thankyou-title">
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
