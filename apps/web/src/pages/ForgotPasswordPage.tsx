import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import ROUTES from '../routs/routes';
import { apiRequestJson, getBuildingId, setBuildingId } from '../api';

type Step = 'email' | 'questions' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [buildings, setBuildings] = useState<{ buildingId: string; address: string; buildingNumber: string }[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const currentBuildingId = getBuildingId();

  const loadBuildings = useCallback(async () => {
    setBuildingsLoading(true);
    try {
      const { response, data } = await apiRequestJson<{ buildings?: { buildingId: string; address: string; buildingNumber: string }[] }>('buildings');
      if (response.ok && Array.isArray(data?.buildings) && data.buildings.length > 0) {
        setBuildings(data.buildings);
      } else {
        setBuildings([{ buildingId: 'default', address: 'בניין ברירת מחדל', buildingNumber: '' }]);
      }
    } catch {
      setBuildings([{ buildingId: 'default', address: 'בניין ברירת מחדל', buildingNumber: '' }]);
    } finally {
      setBuildingsLoading(false);
    }
  }, []);

  useEffect(() => { loadBuildings(); }, [loadBuildings]);

  const handleSelectBuilding = (buildingId: string) => {
    setBuildingId(buildingId);
  };

  const handleRequestQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { response, data } = await apiRequestJson<{ questions?: string[]; message?: string }>('forgot-password/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      if (response.ok && Array.isArray(data?.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(''));
        setStep('questions');
      } else {
        setError(data?.message || 'לא נמצאו שאלות אבטחה עבור חשבון זה');
      }
    } catch {
      setError('שגיאה בשרת');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('הסיסמה והאישור אינם תואמים');
      return;
    }
    setIsLoading(true);
    try {
      const { response, data } = await apiRequestJson<{ message?: string }>('forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          answers,
          newPassword
        })
      });
      if (response.ok) {
        setStep('success');
      } else {
        setError(data?.message || 'שגיאה באיפוס הסיסמה');
      }
    } catch {
      setError('שגיאה בשרת');
    }
    setIsLoading(false);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center"
         style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
      <div className="card shadow-lg" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="card-body p-5" style={{ direction: 'rtl', textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-key fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="card-title" style={{ color: '#374151' }}>שכחתי סיסמה</h2>
            <p className="text-muted">שחזור סיסמה באמצעות שאלות אבטחה</p>
          </div>

          {step === 'email' && (
            <>
              <p className="text-muted small mb-3">בחר את הבניין שבו נרשמת והזן את כתובת האימייל</p>
              {buildingsLoading ? (
                <div className="text-center py-3"><div className="spinner-border text-primary" role="status" /></div>
              ) : (
                <div className="mb-3">
                  <label className="form-label">בניין</label>
                  <div className="d-flex flex-wrap gap-2">
                    {buildings.map((b) => (
                      <button
                        key={b.buildingId}
                        type="button"
                        className={`btn btn-sm ${currentBuildingId === b.buildingId ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleSelectBuilding(b.buildingId)}
                      >
                        {b.address} {b.buildingNumber ? `מס׳ ${b.buildingNumber}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Form onSubmit={handleRequestQuestions}>
                <Form.Group className="mb-3">
                  <Form.Label><i className="fas fa-envelope ms-2"></i> כתובת אימייל</Form.Label>
                  <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="הזן אימייל" required style={{ textAlign: 'right' }} />
                </Form.Group>
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                <Button type="submit" className="w-100" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm me-2" />ממשיך...</> : <>המשך</>}
                </Button>
              </Form>
            </>
          )}

          {step === 'questions' && (
            <Form onSubmit={handleResetPassword}>
              <p className="text-muted small mb-3">ענה על שאלות האבטחה והגדר סיסמה חדשה</p>
              {questions.map((q, i) => (
                <Form.Group key={i} className="mb-3">
                  <Form.Label>{q}</Form.Label>
                  <Form.Control
                    type="text"
                    value={answers[i] ?? ''}
                    onChange={(e) => {
                      const next = [...answers];
                      next[i] = e.target.value;
                      setAnswers(next);
                    }}
                    placeholder="הכנס תשובה"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              ))}
              <Form.Group className="mb-3">
                <Form.Label><i className="fas fa-lock ms-2"></i> סיסמה חדשה</Form.Label>
                <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="לפחות 6 תווים" required minLength={6} style={{ textAlign: 'right' }} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>אישור סיסמה</Form.Label>
                <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="הכנס שוב את הסיסמה" required minLength={6} style={{ textAlign: 'right' }} />
              </Form.Group>
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}
              <Button type="submit" className="w-100" disabled={isLoading}>
                {isLoading ? <><span className="spinner-border spinner-border-sm me-2" />משנה סיסמה...</> : <>שנה סיסמה</>}
              </Button>
            </Form>
          )}

          {step === 'success' && (
            <div>
              <Alert variant="success">
                <i className="fas fa-check-circle me-2"></i>
                הסיסמה שונתה בהצלחה. ניתן להתחבר עם הסיסמה החדשה.
              </Alert>
              <Button variant="primary" className="w-100" onClick={() => navigate(ROUTES.USER_LOGIN)}>
                <i className="fas fa-sign-in-alt me-2"></i>מעבר להתחברות
              </Button>
            </div>
          )}

          <div className="text-center mt-4">
            <button type="button" className="btn btn-link text-decoration-none" onClick={() => navigate(ROUTES.USER_LOGIN)}>
              <i className="fas fa-arrow-left ms-1"></i> חזרה להתחברות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
