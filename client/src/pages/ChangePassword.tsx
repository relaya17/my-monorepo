import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקה אם המשתמש מחובר כאדמין
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // בדיקות תקינות
    if (newPassword.length < 6) {
      setError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('הסיסמה החדשה והאישור אינם תואמים');
      setIsLoading(false);
      return;
    }

    // בדיקה שהסיסמה הנוכחית נכונה (בפועל זה יהיה מול השרת)
    if (currentPassword !== 'admin123') {
      setError('הסיסמה הנוכחית שגויה');
      setIsLoading(false);
      return;
    }

    // כאן בפועל תהיה קריאה לשרת לשינוי הסיסמה
    // כרגע נשמור ב-localStorage לדוגמה
    localStorage.setItem('adminPassword', newPassword);
    
    setSuccess('הסיסמה שונתה בהצלחה!');
    setIsLoading(false);
    
    // ניקוי השדות
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleBack = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" 
         style={{ 
           minHeight: '100vh', 
           background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
           direction: 'rtl'
         }}>
      <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5" style={{ textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-key fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="card-title" style={{ color: '#2c3e50' }}>
              שינוי סיסמה
            </h2>
            <p className="text-muted">הזן את הסיסמה הנוכחית והסיסמה החדשה</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                <i className="fas fa-lock ms-2"></i>
                סיסמה נוכחית
              </label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="הזן סיסמה נוכחית"
                required
                style={{ textAlign: 'right' }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                <i className="fas fa-key ms-2"></i>
                סיסמה חדשה
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הזן סיסמה חדשה (לפחות 6 תווים)"
                required
                style={{ textAlign: 'right' }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="fas fa-check ms-2"></i>
                אישור סיסמה חדשה
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן שוב את הסיסמה החדשה"
                required
                style={{ textAlign: 'right' }}
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle ms-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                <i className="fas fa-check-circle ms-2"></i>
                {success}
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm ms-2" role="status"></span>
                    משנה סיסמה...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save ms-2"></i>
                    שמור סיסמה חדשה
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleBack}
              >
                <i className="fas fa-arrow-right ms-2"></i>
                חזרה ללוח הבקרה
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-info-circle ms-1"></i>
              הסיסמה חייבת להכיל לפחות 6 תווים
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword; 