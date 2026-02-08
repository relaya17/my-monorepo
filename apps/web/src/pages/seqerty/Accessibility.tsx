import React from 'react';

const Accessibility: React.FC = () => {
  return (
    <div className="container mt-5" dir="rtl">
      <div className="d-flex flex-column align-items-center">
        <h1 className="text-center mb-4">מדיניות נגישות</h1>
        <div className="mb-4">
          <p>
            אנו מחויבים להנגיש את האתר לכלל המשתמשים. בוצעו התאמות הכוללות
            ניגודיות צבעים, אפשרות שינוי גודל טקסט, ניווט מלא באמצעות מקלדת,
            ותמיכה בקוראי מסך.
          </p>
        </div>
        <div className="mb-4">
          <h4 className="text-center">התאמות עיקריות</h4>
          <ul className="list-unstyled">
            <li>תמיכה בניווט באמצעות מקלדת.</li>
            <li>מבנה סמנטי ותיוג ARIA רכיבים קריטיים.</li>
            <li>התאמות לניגודיות גבוהה והקטנת אנימציות.</li>
            <li>תצוגה רספונסיבית במובייל ובדסקטופ.</li>
          </ul>
        </div>
        <div>
          <h4 className="text-center">יצירת קשר</h4>
          <p>
            אם נתקלת בקושי נגישות, ניתן לפנות אלינו דרך עמוד יצירת הקשר באתר.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
