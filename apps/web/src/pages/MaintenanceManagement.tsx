import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import NavigationBar from './SecondNavbar';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
}

const MaintenanceManagement: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'open' as 'open' | 'in_progress' | 'done' | 'cancelled',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  // נתונים לדוגמה
  const mockTasks: MaintenanceTask[] = [
    {
      id: '1',
      title: 'תיקון דלת כניסה',
      description: 'הדלת הראשית לא נסגרת טוב',
      status: 'open',
      createdAt: '2024-06-01',
      updatedAt: '2024-06-01',
      assignedTo: 'יוסי',
      priority: 'high',
    },
    {
      id: '2',
      title: 'נזילה בחדר מדרגות',
      description: 'מים מטפטפים מהתקרה',
      status: 'in_progress',
      createdAt: '2024-06-02',
      updatedAt: '2024-06-03',
      assignedTo: 'שרה',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'החלפת נורה',
      description: 'נורה שרופה בקומה 3',
      status: 'done',
      createdAt: '2024-06-01',
      updatedAt: '2024-06-04',
      assignedTo: 'דוד',
      priority: 'low',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.includes(searchTerm) ||
        task.description.includes(searchTerm) ||
        task.assignedTo.includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge bg="warning" text="dark">פתוח</Badge>;
      case 'in_progress':
        return <Badge bg="info">בטיפול</Badge>;
      case 'done':
        return <Badge bg="success">הושלם</Badge>;
      case 'cancelled':
        return <Badge bg="secondary">בוטל</Badge>;
      default:
        return <Badge bg="light" text="dark">לא ידוע</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">גבוהה</Badge>;
      case 'medium':
        return <Badge bg="primary">בינונית</Badge>;
      case 'low':
        return <Badge bg="secondary">נמוכה</Badge>;
      default:
        return <Badge bg="light" text="dark">לא ידוע</Badge>;
    }
  };

  const handleOpenModal = (task?: MaintenanceTask) => {
    if (task) {
      setEditMode(true);
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
      });
    } else {
      setEditMode(false);
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        status: 'open',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleSave = () => {
    if (!formData.title) return;
    if (editMode && selectedTask) {
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id
          ? { ...task, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : task
      );
      setTasks(updatedTasks);
      setAlertMessage('המשימה עודכנה בהצלחה');
      setAlertVariant('success');
    } else {
      const newTask: MaintenanceTask = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setTasks([...tasks, newTask]);
      setAlertMessage('המשימה נוספה בהצלחה');
      setAlertVariant('success');
    }
    setShowAlert(true);
    setShowModal(false);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDelete = (task: MaintenanceTask) => {
    setTasks(tasks.filter(t => t.id !== task.id));
    setAlertMessage('המשימה נמחקה בהצלחה');
    setAlertVariant('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // סטטיסטיקות
  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
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
            <p className="mt-2">טוען נתוני תחזוקה...</p>
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
            <h2 className="mb-4 text-center" style={{ color: '#374151' }}>
              <i className="fas fa-tools me-2"></i>
              ניהול ותחזוקה
            </h2>
          </Col>
        </Row>
        {/* התראות */}
        {showAlert && (
          <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}
        {/* סטטיסטיקות */}
        <Row className="mb-4">
          <Col md={2}><Card className="text-center border-0 shadow-sm"><Card.Body><h4 className="text-primary">{stats.total}</h4><p className="text-muted mb-0">סה"כ משימות</p></Card.Body></Card></Col>
          <Col md={2}><Card className="text-center border-0 shadow-sm"><Card.Body><h4 className="text-warning">{stats.open}</h4><p className="text-muted mb-0">פתוחות</p></Card.Body></Card></Col>
          <Col md={2}><Card className="text-center border-0 shadow-sm"><Card.Body><h4 className="text-info">{stats.inProgress}</h4><p className="text-muted mb-0">בטיפול</p></Card.Body></Card></Col>
          <Col md={2}><Card className="text-center border-0 shadow-sm"><Card.Body><h4 className="text-success">{stats.done}</h4><p className="text-muted mb-0">הושלמו</p></Card.Body></Card></Col>
          <Col md={2}><Card className="text-center border-0 shadow-sm"><Card.Body><h4 className="text-secondary">{stats.cancelled}</h4><p className="text-muted mb-0">בוטלו</p></Card.Body></Card></Col>
          <Col md={2}><Button variant="primary" className="w-100" onClick={() => handleOpenModal()}>הוסף משימה</Button></Col>
        </Row>
        {/* פילטרים */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="חיפוש לפי כותרת, תיאור או אחראי..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">כל הסטטוסים</option>
              <option value="open">פתוח</option>
              <option value="in_progress">בטיפול</option>
              <option value="done">הושלם</option>
              <option value="cancelled">בוטל</option>
            </Form.Select>
          </Col>
        </Row>
        {/* טבלת משימות */}
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>כותרת</th>
                  <th>תיאור</th>
                  <th>סטטוס</th>
                  <th>עדכון אחרון</th>
                  <th>אחראי</th>
                  <th>עדיפות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td><strong>{task.title}</strong></td>
                    <td>{task.description}</td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td>{task.updatedAt}</td>
                    <td>{task.assignedTo}</td>
                    <td>{getPriorityBadge(task.priority)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Button size="sm" variant="outline-primary" onClick={() => handleOpenModal(task)} title="ערוך"><i className="fas fa-edit"></i></Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(task)} title="מחק"><i className="fas fa-trash"></i></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        {/* מודל הוספה/עריכה */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editMode ? 'עריכת משימה' : 'הוספת משימה'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>כותרת</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="הכנס כותרת למשימה"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>אחראי</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.assignedTo}
                      onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                      placeholder="שם אחראי"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>תיאור</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="פרט את המשימה"
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>עדיפות</Form.Label>
                    <Form.Select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    >
                      <option value="high">גבוהה</option>
                      <option value="medium">בינונית</option>
                      <option value="low">נמוכה</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>סטטוס</Form.Label>
                    <Form.Select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as 'open' | 'in_progress' | 'done' | 'cancelled' })}
                    >
                      <option value="open">פתוח</option>
                      <option value="in_progress">בטיפול</option>
                      <option value="done">הושלם</option>
                      <option value="cancelled">בוטל</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>ביטול</Button>
            <Button variant="primary" onClick={handleSave}>{editMode ? 'שמור שינויים' : 'הוסף משימה'}</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MaintenanceManagement; 