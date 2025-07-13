import React, { useState } from 'react';

const ChangeAdminPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      alert('הסיסמאות אינן תואמות');
      return;
    }

    // פה תבצע את הבקשה לשרת לשנות את הסיסמה בבסיס הנתונים
    // לדוגמה, לשלוח את הסיסמה החדשה ל-API

    // נניח שהסיסמה שונתה בהצלחה:
    setPasswordUpdated(true);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">שנה סיסמת מנהל</h2>
          {!passwordUpdated ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="oldPassword">סיסמה ישנה</label>
                <input
                  type="password"
                  className="form-control"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="newPassword">סיסמה חדשה</label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="confirmNewPassword">אשר סיסמה חדשה</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                שנה סיסמה
              </button>
            </form>
          ) : (
            <p className="text-success text-center mt-4">הסיסמה שונתה בהצלחה!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeAdminPassword;
