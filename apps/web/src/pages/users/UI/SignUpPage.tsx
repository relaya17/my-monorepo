import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser } from '../../../redux/slice/signUpSlice';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../redux/store';
import ROUTES from '../../../routs/routes';

const SignUpPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, user, error } = useSelector((state: RootState) => state.signUp);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    apartment: '',
    familyMembers: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // בדיקות תקינות
    if (formData.password !== formData.confirmPassword) {
      alert('הסיסמה והאישור אינם תואמים');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    
    // שליחה ל-redux
    dispatch(signUpUser({
      name: formData.name,
      email: formData.email,
      password: formData.password
    }));
  };

  const handleBackToLogin = () => {
    navigate(ROUTES.USER_LOGIN);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" 
         style={{ 
           minHeight: '100vh', 
           background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
           direction: 'rtl'
         }}>
      <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-body p-5" style={{ textAlign: 'right' }}>
          <div className="text-center mb-4">
            <i className="fas fa-user-plus fa-3x mb-3" style={{ color: '#6b7280' }}></i>
            <h2 className="card-title" style={{ color: '#2c3e50' }}>
              הרשמה למערכת
            </h2>
            <p className="text-muted">הצטרף לקהילת הדיירים שלנו</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-user ms-2"></i>
                    שם מלא
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="הכנס את שמך המלא"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-envelope ms-2"></i>
                    כתובת אימייל
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="הכנס את האימייל שלך"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-phone ms-2"></i>
                    מספר טלפון
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="050-1234567"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-home ms-2"></i>
                    מספר דירה
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    placeholder="דירה 15, בניין א'"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-users ms-2"></i>
                    מספר בני משפחה
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="familyMembers"
                    value={formData.familyMembers}
                    onChange={handleChange}
                    placeholder="4"
                    min="1"
                    max="10"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-lock ms-2"></i>
                    סיסמה
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="הכנס סיסמה (לפחות 6 תווים)"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="fas fa-check ms-2"></i>
                    אישור סיסמה
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="הכנס שוב את הסיסמה"
                    required
                    style={{ textAlign: 'right' }}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="d-grid gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <span className="spinner-border spinner-border-sm ms-2" role="status"></span>
                    ממתין...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus ms-2"></i>
                    הירשם לאתר
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline-secondary"
                onClick={handleBackToLogin}
              >
                <i className="fas fa-arrow-right ms-2"></i>
                חזרה לכניסה
              </Button>
            </div>
          </Form>

          {status === 'error' && (
            <Alert variant="danger" className="mt-3">
              <i className="fas fa-exclamation-triangle ms-2"></i>
              {error}
            </Alert>
          )}
          
          {status === 'success' && user && (
            <Alert variant="success" className="mt-3">
              <i className="fas fa-check-circle ms-2"></i>
              ברוך הבא, {user.name}! ההרשמה הושלמה בהצלחה
            </Alert>
          )}

          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="fas fa-info-circle ms-1"></i>
              על ידי ההרשמה אתה מסכים לתנאי השימוש ומדיניות הפרטיות
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
