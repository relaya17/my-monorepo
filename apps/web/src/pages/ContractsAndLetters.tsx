import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Card, Button } from 'react-bootstrap';
import ROUTES from '../routs/routes';
import { safeGetItem } from '../utils/safeStorage';

const TEMPLATE_TYPES = [
  { id: 'contract', label: 'חוזים תואמים לוועד הבית', icon: 'fa-file-contract', placeholder: 'הדבק או ערוך כאן את נוסח החוזה התואם לוועד הבית...' },
  { id: 'damage', label: 'מכתב נזק לפני נקיטת תהליכים', icon: 'fa-exclamation-triangle', placeholder: 'הדבק או ערוך כאן את מכתב הנזק לפני נקיטת צעדים משפטיים...' },
  { id: 'payment_delay', label: 'פיגורי תשלום', icon: 'fa-clock', placeholder: 'הדבק או ערוך כאן את המכתב בנושא פיגורי תשלום...' },
  { id: 'other', label: 'מחדל אחר', icon: 'fa-list', placeholder: 'הדבק או ערוך כאן את תוכן המכתב (מחדל אחר)...' },
] as const;

const DEFAULTS: Record<string, string> = {
  contract: 'לכבוד ועד הבית,\n\nלהלן נוסח חוזה מוצע לתיאום עם נהלי הבניין.\n\n[הוסף כאן את סעיפי החוזה]\n\nבכבוד רב,\nועד הבית',
  damage: 'לכבוד הדייר/ת,\n\nבהתייחס לנזק שדווח: [תאר את הנזק].\n\nאנו מודיעים כי לפני נקיטת כל תהליך נוסף, נדרש [השלמת תיקון/הגשת מסמכים/וכו\'].\n\nבכבוד רב,\nועד הבית',
  payment_delay: 'לכבוד הדייר/ת,\n\nבהתייחס לפיגור בתשלום דמי ועד הבית: אנו מבקשים להסדיר את החוב בהקדם.\n\nפרטי החוב: [סכום, תאריך]\n\nבכבוד רב,\nועד הבית',
  other: 'לכבוד הדייר/ת,\n\nבהתייחס ל-[תיאור המחדל].\n\n[הוסף כאן את פרטי הדרישה או ההתראה]\n\nבכבוד רב,\nועד הבית',
};

const ContractsAndLetters: React.FC = () => {
  const navigate = useNavigate();
  const [templateType, setTemplateType] = useState<string>(TEMPLATE_TYPES[0].id);
  const [content, setContent] = useState<string>(DEFAULTS.contract);
  const [customNote, setCustomNote] = useState<string>('');

  useEffect(() => {
    const isLoggedIn = safeGetItem('isAdminLoggedIn');
    const username = safeGetItem('adminUsername');
    if (!isLoggedIn || !username) {
      navigate(ROUTES.ADMIN_LOGIN);
      return;
    }
  }, [navigate]);

  useEffect(() => {
    setContent(DEFAULTS[templateType] ?? '');
  }, [templateType]);

  const currentTemplate = TEMPLATE_TYPES.find((t) => t.id === templateType);
  const placeholder = currentTemplate?.placeholder ?? '';

  return (
    <div className="container-fluid py-4" style={{ direction: 'rtl', maxWidth: '900px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ color: '#374151' }}>
          <i className="fas fa-file-contract me-2" aria-hidden="true" />
          חוזים ומכתבים
        </h2>
        <Link to={ROUTES.ADMIN_DASHBOARD} className="btn btn-outline-secondary">
          <i className="fas fa-arrow-right me-1" aria-hidden="true" />
          חזרה ללוח הבקרה
        </Link>
      </div>

      <p className="text-muted mb-4">
        בחר סוג תבנית והזן או ערוך את התוכן. תבניות תואמות לוועד הבית, מכתב נזק לפני תהליכים, פיגורי תשלום ומחדלים אחרים.
      </p>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">סוג תבנית</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {TEMPLATE_TYPES.map((t) => (
                <Button
                  key={t.id}
                  variant={templateType === t.id ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setTemplateType(t.id)}
                  className="d-flex align-items-center gap-1"
                >
                  <i className={`fas ${t.icon}`} aria-hidden="true" />
                  {t.label}
                </Button>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">מה המכתב/חוזה אומר?</Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              style={{ textAlign: 'right', fontFamily: 'inherit' }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>הערה / תוספת (אופציונלי)</Form.Label>
            <Form.Control
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="הוסף הערה או כותרת למסמך"
              style={{ textAlign: 'right' }}
            />
          </Form.Group>

          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="primary"
              onClick={() => {
                const text = customNote ? `${customNote}\n\n${content}` : content;
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `מסמך-${templateType}-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <i className="fas fa-download me-2" aria-hidden="true" />
              הורד כקובץ
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => {
                const text = customNote ? `${customNote}\n\n${content}` : content;
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(text);
                }
              }}
            >
              <i className="fas fa-copy me-2" aria-hidden="true" />
              העתק ללוח
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ContractsAndLetters;
