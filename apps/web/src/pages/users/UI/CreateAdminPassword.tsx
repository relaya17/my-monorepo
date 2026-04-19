import React, { useState } from 'react';

const CreateAdminPassword: React.FC = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordCreated, setPasswordCreated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (adminPassword !== confirmPassword) {
      alert('הסיסמאות אינן תואמות');
      return;
    }

    // כאן תוכל לשמור את הסיסמה בבסיס נתונים או להשתמש בה
    // נניח שהסיסמה נוצרה בהצלחה:
    setPasswordCreated(true);
  };

  return (
    <div className="container">
      <h2 className="text-center">הגדר סיסמת מנהל</h2>
      {!passwordCreated ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="adminPassword">סיסמה חדשה</label>
            <input
              type="password"
              className="form-control"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="confirmPassword">אשר סיסמה חדשה</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">הגדר סיסמה</button>
        </form>
      ) : (
        <p className="text-success">הסיסמה הוגדרה בהצלחה!</p>
      )}
    </div>
  );
};

export default CreateAdminPassword;
