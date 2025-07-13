import React, { useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
  dob?: string;
}

const UsersPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // טוען את המידע שנשמר ב-LocalStorage
    }
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 mt-5 mb-5">
      {user ? (
        <div className="w-100 text-center">
          {/* כותרת */}
          <h2 className="mb-4">ברוך הבא, {user.name}!</h2>

          {/* כרטיס */}
          <div
            className="card p-4 mx-auto"
            style={{
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px', // מגביל את גודל הכרטיס במסך רחב
            }}
          >
            <h4>שם: {user.name}</h4>
            <p>דואר אלקטרוני: {user.email}</p>
            <p>תאריך לידה: {user.dob}</p> {/* הוספתי את תאריך הלידה */}
          </div>
        </div>
      ) : (
        <p>לא נמצאו משתמשים</p>
      )}
    </div>
  );
};

export default UsersPage;
