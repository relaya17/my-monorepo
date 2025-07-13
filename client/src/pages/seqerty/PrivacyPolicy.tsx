import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mt-5" dir="rtl">
      <div className="d-flex flex-column align-items-center"> {/* תוודא שהכל במרכז */}
      <h1 className="text-center mb-4">מדיניות פרטיות</h1>
        <div className="mb-4">
          <h4 className="text-center">מה אנחנו אוספים?</h4>
          <ul className="list-unstyled">
            <li>פרטי יצירת קשר כמו שם וטלפון.</li>
            <li>מידע על העגלה שלך.</li>
            <li>מידע על אמצעי תשלום.</li>
          </ul>
        </div>
        <div className="mb-4">
          <h4 className="text-center">איך אנחנו משתמשים במידע שלך?</h4>
          <p>המידע שלך משמש לשם עיבוד ההזמנה שלך ולשיפור השירותים שלנו.</p>
        </div>
        <div className="mb-4">
          <h4 className="text-center">האם אנו חולקים את המידע שלך?</h4>
          <p>אנו לא חולקים את המידע שלך עם צדדים שלישיים מלבד ספקי שירותים כמו ספקי תשלום.</p>
        </div>
        <div>
          <h4 className="text-center">שינויים במדיניות</h4>
          <p>הזכות לשנות מדיניות זו שמורה לנו בכל עת.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
