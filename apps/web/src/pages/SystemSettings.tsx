import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import NavigationBar from './SecondNavbar';

interface SystemSetting {
  id: string;
  name: string;
  value: string;
  description: string;
  category: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  // נתונים לדוגמה
  const mockSettings: SystemSetting[] = [
    {
      id: '1',
      name: 'שם המערכת',
      value: 'ניהול אחזקות מצפה נוף',
      description: 'שם המערכת שיוצג בכותרת',
      category: 'general',
      type: 'text'
    },
    {
      id: '2',
      name: 'שפה ברירת מחדל',
      value: 'he',
      description: 'שפת המערכת',
      category: 'general',
      type: 'select',
      options: ['he', 'en', 'ar']
    },
    {
      id: '3',
      name: 'זמן פג תוקן סשן',
      value: '30',
      description: 'זמן במינוטים עד פג תוקן הסשן',
      category: 'security',
      type: 'number'
    },
    {
      id: '4',
      name: 'אפשר הרשמה',
      value: 'true',
      description: 'האם לאפשר הרשמת משתמשים חדשים',
      category: 'security',
      type: 'boolean'
    },
    {
      id: '5',
      name: 'גודל מקסימלי לקובץ',
      value: '5',
      description: 'גודל מקסימלי לקובץ בהעלאה (MB)',
      category: 'files',
      type: 'number'
    },
    {
      id: '6',
      name: 'סוגי קבצים מותרים',
      value: 'jpg,png,pdf,doc',
      description: 'סוגי קבצים מותרים להעלאה',
      category: 'files',
      type: 'text'
    },
    {
      id: '7',
      name: 'התראות אימייל',
      value: 'true',
      description: 'האם לשלוח התראות באימייל',
      category: 'notifications',
      type: 'boolean'
    },
    {
      id: '8',
      name: 'גיבוי אוטומטי',
      value: 'true',
      description: 'האם לבצע גיבוי אוטומטי',
      category: 'backup',
      type: 'boolean'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSettingChange = (id: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  const handleSaveSettings = () => {
    // כאן יהיה קוד לשמירת ההגדרות לשרת
    setAlertMessage('ההגדרות נשמרו בהצלחה');
    setAlertVariant('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleResetSettings = () => {
    setSettings(mockSettings);
    setAlertMessage('ההגדרות אופסו לברירת מחדל');
    setAlertVariant('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'text':
        return (
          <Form.Control
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Form.Control
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      case 'boolean':
        return (
          <Form.Check
            type="switch"
            checked={setting.value === 'true'}
            onChange={(e) => handleSettingChange(setting.id, e.target.checked.toString())}
          />
        );
      case 'select':
        return (
          <Form.Select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option === 'he' ? 'עברית' : option === 'en' ? 'English' : 'العربية'}
              </option>
            ))}
          </Form.Select>
        );
      default:
        return <Form.Control type="text" value={setting.value} readOnly />;
    }
  };

  const getCategorySettings = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <NavigationBar />
        <Container className="mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">טוען...</span>
            </div>
            <p className="mt-2">טוען הגדרות מערכת...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <NavigationBar />
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <h2 className="mb-4 text-center" style={{ color: '#ffffff' }}>
              <i className="fas fa-cogs me-2"></i>
              הגדרות מערכת
            </h2>
          </Col>
        </Row>

        {/* התראות */}
        {showAlert && (
          <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}

        {/* כפתורי פעולה */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleResetSettings}>
                <i className="fas fa-undo me-2"></i>
                אופס לברירת מחדל
              </Button>
              <Button variant="primary" onClick={handleSaveSettings}>
                <i className="fas fa-save me-2"></i>
                שמור הגדרות
              </Button>
            </div>
          </Col>
        </Row>

        {/* טאבים */}
        <Tabs defaultActiveKey="general" className="mb-4">
          <Tab eventKey="general" title="הגדרות כלליות">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>הגדרה</th>
                      <th>ערך</th>
                      <th>תיאור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategorySettings('general').map(setting => (
                      <tr key={setting.id}>
                        <td><strong>{setting.name}</strong></td>
                        <td style={{ width: '200px' }}>{renderSettingInput(setting)}</td>
                        <td className="text-muted">{setting.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="security" title="אבטחה">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>הגדרה</th>
                      <th>ערך</th>
                      <th>תיאור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategorySettings('security').map(setting => (
                      <tr key={setting.id}>
                        <td><strong>{setting.name}</strong></td>
                        <td style={{ width: '200px' }}>{renderSettingInput(setting)}</td>
                        <td className="text-muted">{setting.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="files" title="קבצים">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>הגדרה</th>
                      <th>ערך</th>
                      <th>תיאור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategorySettings('files').map(setting => (
                      <tr key={setting.id}>
                        <td><strong>{setting.name}</strong></td>
                        <td style={{ width: '200px' }}>{renderSettingInput(setting)}</td>
                        <td className="text-muted">{setting.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="notifications" title="התראות">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>הגדרה</th>
                      <th>ערך</th>
                      <th>תיאור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategorySettings('notifications').map(setting => (
                      <tr key={setting.id}>
                        <td><strong>{setting.name}</strong></td>
                        <td style={{ width: '200px' }}>{renderSettingInput(setting)}</td>
                        <td className="text-muted">{setting.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="backup" title="גיבוי">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>הגדרה</th>
                      <th>ערך</th>
                      <th>תיאור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategorySettings('backup').map(setting => (
                      <tr key={setting.id}>
                        <td><strong>{setting.name}</strong></td>
                        <td style={{ width: '200px' }}>{renderSettingInput(setting)}</td>
                        <td className="text-muted">{setting.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default SystemSettings; 