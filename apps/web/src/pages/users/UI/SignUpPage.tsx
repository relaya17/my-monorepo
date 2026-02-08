import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser } from '../../../redux/slice/signUpSlice';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../redux/store';
import ROUTES from '../../../routs/routes';
import { safeSetItem } from '../../../utils/safeStorage';

const SignUpPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, user, error } = useSelector((state: RootState) => state.signUp);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const apartmentRef = useRef<HTMLInputElement>(null);
  const familyMembersRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ 
    buildingAddress: '',
    buildingNumber: '',
    apartment: '',
    committeeName: '',
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
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
    
    dispatch(signUpUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      buildingAddress: formData.buildingAddress,
      buildingNumber: formData.buildingNumber,
      apartmentNumber: formData.apartment,
      committeeName: formData.committeeName || undefined
    }));
  };

  const handleBackToLogin = () => {
    navigate(ROUTES.USER_LOGIN);
  };

  useEffect(() => {
    if (status === 'success' && user) {
      const u = user as { id: string; name: string; email: string; buildingId?: string };
      safeSetItem('isUserLoggedIn', 'true');
      safeSetItem('userEmail', u.email);
      safeSetItem('userName', u.name);
      safeSetItem('userId', String(u.id));
      safeSetItem('user', JSON.stringify(u));
      if (u.buildingId) safeSetItem('buildingId', u.buildingId);
      navigate(ROUTES.RESIDENT_HOME, { replace: true });
    }
  }, [status, user, navigate]);

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
            <div className="border-bottom pb-3 mb-3">
              <h6 className="text-muted mb-3"><i className="fas fa-building me-2"></i>פרטי בניין</h6>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>כתובת הבניין</Form.Label>
                    <Form.Control
                      type="text"
                      name="buildingAddress"
                      value={formData.buildingAddress}
                      onChange={handleChange}
                      placeholder="רחוב הרצל 10"
                      required
                      style={{ textAlign: 'right' }}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>מספר בניין</Form.Label>
                    <Form.Control
                      type="text"
                      name="buildingNumber"
                      value={formData.buildingNumber}
                      onChange={handleChange}
                      placeholder="1"
                      required
                      style={{ textAlign: 'right' }}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>מספר דירה</Form.Label>
                    <Form.Control
                      ref={apartmentRef}
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="15"
                      required
                      style={{ textAlign: 'right' }}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>שם וועד/נציגות (אופציונלי)</Form.Label>
                    <Form.Control
                      type="text"
                      name="committeeName"
                      value={formData.committeeName}
                      onChange={handleChange}
                      placeholder="ועד הבית"
                      style={{ textAlign: 'right' }}
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
            <h6 className="text-muted mb-3"><i className="fas fa-user me-2"></i>פרטי דייר</h6>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        emailRef.current?.focus();
                      }
                    }}
                    placeholder="הכנס את שמך המלא"
                    required
                    autoComplete="name"
                    enterKeyHint="next"
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
                    ref={emailRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        phoneRef.current?.focus();
                      }
                    }}
                    placeholder="הכנס את האימייל שלך"
                    required
                    autoComplete="email"
                    enterKeyHint="next"
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
                    ref={phoneRef}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        familyMembersRef.current?.focus();
                      }
                    }}
                    placeholder="050-1234567"
                    required
                    autoComplete="tel"
                    enterKeyHint="next"
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
                    ref={familyMembersRef}
                    type="number"
                    name="familyMembers"
                    value={formData.familyMembers}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        passwordRef.current?.focus();
                      }
                    }}
                    placeholder="4"
                    min="1"
                    max="10"
                    required
                    enterKeyHint="next"
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
                  <InputGroup>
                    <Form.Control
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          confirmPasswordRef.current?.focus();
                        }
                      }}
                      placeholder="הכנס סיסמה (לפחות 6 תווים)"
                      required
                      autoComplete="new-password"
                      enterKeyHint="next"
                      style={{ textAlign: 'right' }}
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                      title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="fas fa-check ms-2"></i>
                    אישור סיסמה
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="הכנס שוב את הסיסמה"
                      required
                      autoComplete="new-password"
                      enterKeyHint="done"
                      style={{ textAlign: 'right' }}
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                      title={showConfirmPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                    </Button>
                  </InputGroup>
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
