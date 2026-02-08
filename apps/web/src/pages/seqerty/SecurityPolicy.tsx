import React from 'react';

const SecurityPolicy: React.FC = () => {
  return (
    <div className="container mt-5" dir="rtl">
      <div className="d-flex flex-column align-items-center">
        <h1 className="text-center mb-4">מדיניות אבטחה</h1>
        <div className="mb-4">
          <p>
            אבטחת המידע חשובה לנו. אנו משתמשים באמצעי אבטחה סטנדרטיים להגנה על מידע,
            לרבות אימות, הגבלת קצב בקשות, אימות קלט, והקשחת כותרות אבטחה.
          </p>
        </div>
        <div className="mb-4">
          <h4 className="text-center">עקרונות מרכזיים</h4>
          <ul className="list-unstyled">
            <li>הצפנת מידע רגיש וציות לנהלי אבטחה.</li>
            <li>ניטור אירועי אבטחה וזיהוי חריגות.</li>
            <li>בקרת גישה לפי הרשאות.</li>
            <li>עדכון רכיבים ותלויות באופן שוטף.</li>
          </ul>
        </div>
        <div>
          <h4 className="text-center">דיווח פגיעות</h4>
          <p>
            במידה ומצאת פגיעות, אנא פנה אלינו דרך פרטי הקשר המופיעים ב-SECURITY.md.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
