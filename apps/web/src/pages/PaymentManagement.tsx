import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import NavigationBar from './SecondNavbar';

interface Payment {
  id: string;
  residentName: string;
  apartmentNumber: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod: string;
  description: string;
  receiptNumber?: string;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  // נתונים לדוגמה
  const mockPayments: Payment[] = [
    {
      id: '1',
      residentName: 'יוסי כהן',
      apartmentNumber: 'א-101',
      amount: 2500,
      paymentDate: '2024-01-15',
      dueDate: '2024-01-10',
      status: 'paid',
      paymentMethod: 'כרטיס אשראי',
      description: 'תשלום דמי ועד בית',
      receiptNumber: 'RCP-001'
    },
    {
      id: '2',
      residentName: 'שרה לוי',
      apartmentNumber: 'ב-203',
      amount: 1800,
      paymentDate: '',
      dueDate: '2024-01-15',
      status: 'overdue',
      paymentMethod: '',
      description: 'תשלום דמי ועד בית'
    },
    {
      id: '3',
      residentName: 'דוד רוזן',
      apartmentNumber: 'ג-305',
      amount: 2200,
      paymentDate: '2024-01-12',
      dueDate: '2024-01-10',
      status: 'paid',
      paymentMethod: 'העברה בנקאית',
      description: 'תשלום דמי ועד בית',
      receiptNumber: 'RCP-002'
    },
    {
      id: '4',
      residentName: 'מיכל גולדברג',
      apartmentNumber: 'ד-407',
      amount: 1900,
      paymentDate: '',
      dueDate: '2024-01-20',
      status: 'pending',
      paymentMethod: '',
      description: 'תשלום דמי ועד בית'
    },
    {
      id: '5',
      residentName: 'אברהם שפירא',
      apartmentNumber: 'ה-509',
      amount: 2100,
      paymentDate: '2024-01-08',
      dueDate: '2024-01-05',
      status: 'paid',
      paymentMethod: 'צ\'ק',
      description: 'תשלום דמי ועד בית',
      receiptNumber: 'RCP-003'
    }
  ];

  useEffect(() => {
    // סימולציה של טעינת נתונים
    setTimeout(() => {
      setPayments(mockPayments);
      setFilteredPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // פילטור התשלומים
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.residentName.includes(searchTerm) ||
        payment.apartmentNumber.includes(searchTerm) ||
        payment.description.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">שולם</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">ממתין</Badge>;
      case 'overdue':
        return <Badge bg="danger">באיחור</Badge>;
      case 'cancelled':
        return <Badge bg="secondary">בוטל</Badge>;
      default:
        return <Badge bg="light" text="dark">לא ידוע</Badge>;
    }
  };

  const handlePaymentAction = (payment: Payment, _action: string) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  const handlePaymentUpdate = (action: string) => {
    if (!selectedPayment) return;

    const updatedPayments = payments.map(payment => {
      if (payment.id === selectedPayment.id) {
        switch (action) {
          case 'markPaid':
            return {
              ...payment,
              status: 'paid' as const,
              paymentDate: new Date().toISOString().split('T')[0],
              paymentMethod: 'מזומן',
              receiptNumber: `RCP-${Date.now()}`
            };
          case 'markCancelled':
            return { ...payment, status: 'cancelled' as const };
          default:
            return payment;
        }
      }
      return payment;
    });

    setPayments(updatedPayments);
    setAlertMessage(`התשלום ${action === 'markPaid' ? 'סומן כשולם' : 'בוטל'} בהצלחה`);
    setAlertVariant('success');
    setShowAlert(true);
    handleModalClose();

    setTimeout(() => setShowAlert(false), 3000);
  };

  const calculateStats = () => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, paid, pending, overdue, totalAmount, paidAmount };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <NavigationBar />
        <Container className="mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">טוען...</span>
            </div>
            <p className="mt-2">טוען נתוני תשלומים...</p>
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
              <i className="fas fa-credit-card me-2"></i>
              מעקב וניהול תשלומים
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
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-primary">{stats.total}</h4>
                <p className="text-muted mb-0">סה"כ תשלומים</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-success">{stats.paid}</h4>
                <p className="text-muted mb-0">שולמו</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-warning">{stats.pending}</h4>
                <p className="text-muted mb-0">ממתינים</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-danger">{stats.overdue}</h4>
                <p className="text-muted mb-0">באיחור</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-info">₪{stats.totalAmount.toLocaleString()}</h4>
                <p className="text-muted mb-0">סה"כ סכום</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm">
              <Card.Body>
                <h4 className="text-success">₪{stats.paidAmount.toLocaleString()}</h4>
                <p className="text-muted mb-0">סכום שולם</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* פילטרים */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="חיפוש לפי שם דייר, מספר דירה או תיאור..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">כל הסטטוסים</option>
              <option value="paid">שולם</option>
              <option value="pending">ממתין</option>
              <option value="overdue">באיחור</option>
              <option value="cancelled">בוטל</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button variant="primary" className="w-100">
              <i className="fas fa-plus me-2"></i>
              הוסף תשלום חדש
            </Button>
          </Col>
        </Row>

        {/* טבלת תשלומים */}
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>דייר</th>
                  <th>מספר דירה</th>
                  <th>סכום</th>
                  <th>תאריך תשלום</th>
                  <th>תאריך יעד</th>
                  <th>סטטוס</th>
                  <th>אמצעי תשלום</th>
                  <th>תיאור</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>{payment.residentName}</strong>
                    </td>
                    <td>{payment.apartmentNumber}</td>
                    <td className="fw-bold">₪{payment.amount.toLocaleString()}</td>
                    <td className={payment.paymentDate ? 'text-success' : 'text-muted'}>
                      {payment.paymentDate || 'לא שולם'}
                    </td>
                    <td className={payment.status === 'overdue' ? 'text-danger' : ''}>
                      {payment.dueDate}
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td className="text-muted">
                      {payment.paymentMethod || '-'}
                    </td>
                    <td>{payment.description}</td>
                    <td>
                      <div className="btn-group" role="group">
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handlePaymentAction(payment, 'markPaid')}
                            title="סמן כשולם"
                          >
                            <i className="fas fa-check"></i>
                          </Button>
                        )}
                        {payment.status === 'overdue' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handlePaymentAction(payment, 'markPaid')}
                            title="סמן כשולם"
                          >
                            <i className="fas fa-check"></i>
                          </Button>
                        )}
                        {(payment.status === 'pending' || payment.status === 'overdue') && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handlePaymentAction(payment, 'markCancelled')}
                            title="בטל תשלום"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-primary"
                          title="ערוך"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-info"
                          title="הדפס קבלה"
                          disabled={!payment.receiptNumber}
                        >
                          <i className="fas fa-print"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* מודל פעולות תשלום */}
      <Modal show={showPaymentModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>פעולת תשלום</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <p><strong>דייר:</strong> {selectedPayment.residentName}</p>
              <p><strong>מספר דירה:</strong> {selectedPayment.apartmentNumber}</p>
              <p><strong>סכום:</strong> ₪{selectedPayment.amount.toLocaleString()}</p>
              <p><strong>תיאור:</strong> {selectedPayment.description}</p>
              <p><strong>סטטוס נוכחי:</strong> {getStatusBadge(selectedPayment.status)}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedPayment && (selectedPayment.status === 'pending' || selectedPayment.status === 'overdue') && (
            <>
              <Button variant="success" onClick={() => handlePaymentUpdate('markPaid')}>
                <i className="fas fa-check me-2"></i>
                סמן כשולם
              </Button>
              <Button variant="danger" onClick={() => handlePaymentUpdate('markCancelled')}>
                <i className="fas fa-times me-2"></i>
                בטל תשלום
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleModalClose}>
            סגור
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentManagement; 