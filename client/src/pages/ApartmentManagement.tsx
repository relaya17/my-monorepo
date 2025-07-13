import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, Alert, Tabs, Tab, Image } from 'react-bootstrap';
import NavigationBar from './SecondNavbar';

interface Apartment {
  id: string;
  address: string;
  rooms: number;
  floor: number;
  size: number;
  price: number;
  type: 'sale' | 'rent';
  status: 'available' | 'sold' | 'rented' | 'maintenance';
  description: string;
  features: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const ApartmentManagement: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [activeTab, setActiveTab] = useState('sale');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  // טופס חדש
  const [formData, setFormData] = useState({
    address: '',
    rooms: 1,
    floor: 1,
    size: 0,
    price: 0,
    type: 'sale' as 'sale' | 'rent',
    description: '',
    features: [] as string[],
    status: 'available' as 'available' | 'sold' | 'rented' | 'maintenance',
    images: [] as string[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // פונקציות להעלאת תמונות
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // נתונים לדוגמה
  const mockApartments: Apartment[] = [
    {
      id: '1',
      address: 'רחוב הרצל 15, תל אביב',
      rooms: 3,
      floor: 2,
      size: 85,
      price: 2500000,
      type: 'sale',
      status: 'available',
      description: 'דירה מרווחת עם מרפסת גדולה ונוף לים',
      features: ['מרפסת', 'חניה', 'מעלית', 'מזגן'],
      images: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      address: 'רחוב ויצמן 8, חיפה',
      rooms: 2,
      floor: 5,
      size: 65,
      price: 4500,
      type: 'rent',
      status: 'available',
      description: 'דירה נעימה עם נוף להר הכרמל',
      features: ['מרפסת', 'מזגן', 'מטבח מאובזר'],
      images: [],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    },
    {
      id: '3',
      address: 'רחוב בן גוריון 22, ירושלים',
      rooms: 4,
      floor: 1,
      size: 120,
      price: 3200000,
      type: 'sale',
      status: 'sold',
      description: 'דירה יוקרתית עם גינה פרטית',
      features: ['גינה פרטית', 'חניה', 'מעלית', 'מזגן', 'מחסן'],
      images: [],
      createdAt: '2024-01-03',
      updatedAt: '2024-01-15'
    },
    {
      id: '4',
      address: 'רחוב רוטשילד 45, תל אביב',
      rooms: 1,
      floor: 3,
      size: 45,
      price: 3800,
      type: 'rent',
      status: 'rented',
      description: 'סטודיו מעוצב במרכז העיר',
      features: ['מזגן', 'מטבח מאובזר', 'אינטרנט'],
      images: [],
      createdAt: '2024-01-04',
      updatedAt: '2024-01-10'
    }
  ];

  useEffect(() => {
    // סימולציה של טעינת נתונים
    setTimeout(() => {
      setApartments(mockApartments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge bg="success">זמין</Badge>;
      case 'sold':
        return <Badge bg="primary">נמכר</Badge>;
      case 'rented':
        return <Badge bg="info">מושכר</Badge>;
      case 'maintenance':
        return <Badge bg="warning" text="dark">בתחזוקה</Badge>;
      default:
        return <Badge bg="light" text="dark">לא ידוע</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'sale' ? 
      <Badge bg="danger">למכירה</Badge> : 
      <Badge bg="warning" text="dark">להשכרה</Badge>;
  };

  const handleAddApartment = () => {
    const newApartment: Apartment = {
      id: Date.now().toString(),
      ...formData,
      images: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setApartments([...apartments, newApartment]);
    setShowAlert(true);
    setAlertMessage('הדירה נוספה בהצלחה');
    setAlertVariant('success');
    setShowAddModal(false);
    resetForm();

    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleEditApartment = () => {
    if (!selectedApartment) return;

    const updatedApartments = apartments.map(apartment => {
      if (apartment.id === selectedApartment.id) {
        return {
          ...apartment,
          ...formData,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return apartment;
    });

    setApartments(updatedApartments);
    setShowAlert(true);
    setAlertMessage('הדירה עודכנה בהצלחה');
    setAlertVariant('success');
    setShowEditModal(false);
    resetForm();

    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDeleteApartment = () => {
    if (!selectedApartment) return;

    const updatedApartments = apartments.filter(apartment => apartment.id !== selectedApartment.id);
    setApartments(updatedApartments);
    setShowAlert(true);
    setAlertMessage('הדירה נמחקה בהצלחה');
    setAlertVariant('success');
    setShowDeleteModal(false);

    setTimeout(() => setShowAlert(false), 3000);
  };

  const resetForm = () => {
    setFormData({
      address: '',
      rooms: 1,
      floor: 1,
      size: 0,
      price: 0,
      type: 'sale',
      description: '',
      features: [],
      status: 'available',
      images: []
    });
  };

  const openEditModal = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setFormData({
      address: apartment.address,
      rooms: apartment.rooms,
      floor: apartment.floor,
      size: apartment.size,
      price: apartment.price,
      type: apartment.type,
      description: apartment.description,
      features: apartment.features,
      status: apartment.status,
      images: apartment.images
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setShowDeleteModal(true);
  };

  const filteredApartments = apartments.filter(apartment => apartment.type === activeTab);

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <NavigationBar />
        <Container className="mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">טוען...</span>
            </div>
            <p className="mt-2">טוען נתוני דירות...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px' }}>
      <style>{`
        .custom-tabs .nav-link {
          color: #222 !important;
          background: #fff !important;
          border: none !important;
        }
        .custom-tabs .nav-link.active {
          color: #0d6efd !important;
          background: #fff !important;
          border-bottom: 3px solid #0d6efd !important;
          font-weight: bold;
        }
      `}</style>
      <NavigationBar />
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <h2 className="mb-4 text-center" style={{ color: '#ffffff' }}>
              <i className="fas fa-home me-2"></i>
              ניהול דירות
            </h2>
          </Col>
        </Row>

        {/* התראות */}
        {showAlert && (
          <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        )}

        {/* כפתור הוספה */}
        <Row className="mb-4">
          <Col>
            <Button 
              variant="primary" 
              onClick={() => setShowAddModal(true)}
              className="float-end"
            >
              <i className="fas fa-plus me-2"></i>
              הוסף דירה חדשה
            </Button>
          </Col>
        </Row>

        {/* טאבים */}
        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab(k || 'sale')}
          className="mb-4 custom-tabs"
        >
          <Tab eventKey="sale" title="דירות למכירה">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>תמונות</th>
                      <th>כתובת</th>
                      <th>חדרים</th>
                      <th>קומה</th>
                      <th>גודל (מ"ר)</th>
                      <th>מחיר</th>
                      <th>סטטוס</th>
                      <th>תיאור</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApartments.map((apartment) => (
                      <tr key={apartment.id}>
                        <td>
                          {apartment.images.length > 0 ? (
                            <div className="d-flex">
                              {apartment.images.slice(0, 2).map((image, index) => (
                                <Image
                                  key={index}
                                  src={image}
                                  alt={`תמונה ${index + 1}`}
                                  width={40}
                                  height={40}
                                  className="rounded me-1"
                                  style={{ objectFit: 'cover' }}
                                />
                              ))}
                              {apartment.images.length > 2 && (
                                <div className="d-flex align-items-center justify-content-center bg-light rounded ms-1" 
                                     style={{ width: 40, height: 40 }}>
                                  <small className="text-muted">+{apartment.images.length - 2}</small>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center bg-light rounded" 
                                 style={{ width: 40, height: 40 }}>
                              <i className="fas fa-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{apartment.address}</strong>
                        </td>
                        <td>{apartment.rooms}</td>
                        <td>{apartment.floor}</td>
                        <td>{apartment.size}</td>
                        <td className="fw-bold">₪{apartment.price.toLocaleString()}</td>
                        <td>{getStatusBadge(apartment.status)}</td>
                        <td className="text-muted">
                          {apartment.description.length > 50 
                            ? apartment.description.substring(0, 50) + '...' 
                            : apartment.description}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openEditModal(apartment)}
                              title="ערוך"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => openDeleteModal(apartment)}
                              title="מחק"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="rent" title="דירות להשכרה">
            <Card className="shadow-sm">
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>כתובת</th>
                      <th>חדרים</th>
                      <th>קומה</th>
                      <th>גודל (מ"ר)</th>
                      <th>מחיר חודשי</th>
                      <th>סטטוס</th>
                      <th>תיאור</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApartments.map((apartment) => (
                      <tr key={apartment.id}>
                        <td>
                          <strong>{apartment.address}</strong>
                        </td>
                        <td>{apartment.rooms}</td>
                        <td>{apartment.floor}</td>
                        <td>{apartment.size}</td>
                        <td className="fw-bold">₪{apartment.price.toLocaleString()}</td>
                        <td>{getStatusBadge(apartment.status)}</td>
                        <td className="text-muted">
                          {apartment.description.length > 50 
                            ? apartment.description.substring(0, 50) + '...' 
                            : apartment.description}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openEditModal(apartment)}
                              title="ערוך"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => openDeleteModal(apartment)}
                              title="מחק"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* מודל הוספת דירה */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>הוסף דירה חדשה</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>כתובת</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="הכנס כתובת מלאה"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סוג</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'sale' | 'rent'})}
                  >
                    <option value="sale">למכירה</option>
                    <option value="rent">להשכרה</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>מספר חדרים</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({...formData, rooms: parseInt(e.target.value)})}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>קומה</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>גודל (מ"ר)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>מחיר</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סטטוס</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="available">זמין</option>
                    <option value="sold">נמכר</option>
                    <option value="rented">מושכר</option>
                    <option value="maintenance">בתחזוקה</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>תיאור</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="תיאור מפורט של הדירה"
              />
            </Form.Group>

            {/* העלאת תמונות */}
            <Form.Group className="mb-3">
              <Form.Label>תמונות דירה</Form.Label>
              <div className="mb-3">
                <Button 
                  variant="primary" 
                  onClick={triggerFileInput}
                  className="w-100"
                >
                  <i className="fas fa-upload me-2"></i>
                  העלה תמונות
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* תצוגת תמונות */}
              {formData.images.length > 0 && (
                <div className="row">
                  {formData.images.map((image, index) => (
                    <Col key={index} md={4} className="mb-2">
                      <div className="position-relative">
                        <Image 
                          src={image} 
                          alt={`תמונה ${index + 1}`}
                          fluid 
                          className="rounded"
                          style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          className="position-absolute top-0 end-0 m-1"
                          onClick={() => removeImage(index)}
                          title="מחק תמונה"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </Col>
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleAddApartment}>
            הוסף דירה
          </Button>
        </Modal.Footer>
      </Modal>

      {/* מודל עריכת דירה */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>ערוך דירה</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>כתובת</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סוג</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'sale' | 'rent'})}
                  >
                    <option value="sale">למכירה</option>
                    <option value="rent">להשכרה</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>מספר חדרים</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({...formData, rooms: parseInt(e.target.value)})}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>קומה</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>גודל (מ"ר)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>מחיר</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>סטטוס</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="available">זמין</option>
                    <option value="sold">נמכר</option>
                    <option value="rented">מושכר</option>
                    <option value="maintenance">בתחזוקה</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>תיאור</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>

            {/* העלאת תמונות */}
            <Form.Group className="mb-3">
              <Form.Label>תמונות דירה</Form.Label>
              <div className="mb-3">
                <Button 
                  variant="primary" 
                  onClick={triggerFileInput}
                  className="w-100"
                >
                  <i className="fas fa-upload me-2"></i>
                  העלה תמונות
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* תצוגת תמונות */}
              {formData.images.length > 0 && (
                <div className="row">
                  {formData.images.map((image, index) => (
                    <Col key={index} md={4} className="mb-2">
                      <div className="position-relative">
                        <Image 
                          src={image} 
                          alt={`תמונה ${index + 1}`}
                          fluid 
                          className="rounded"
                          style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          className="position-absolute top-0 end-0 m-1"
                          onClick={() => removeImage(index)}
                          title="מחק תמונה"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </Col>
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            ביטול
          </Button>
          <Button variant="primary" onClick={handleEditApartment}>
            שמור שינויים
          </Button>
        </Modal.Footer>
      </Modal>

      {/* מודל מחיקת דירה */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>מחק דירה</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApartment && (
            <div>
              <p>האם אתה בטוח שברצונך למחוק את הדירה הבאה?</p>
              <p><strong>כתובת:</strong> {selectedApartment.address}</p>
              <p><strong>חדרים:</strong> {selectedApartment.rooms}</p>
              <p><strong>מחיר:</strong> ₪{selectedApartment.price.toLocaleString()}</p>
              <p className="text-danger">פעולה זו אינה הפיכה!</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            ביטול
          </Button>
          <Button variant="danger" onClick={handleDeleteApartment}>
            מחק דירה
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApartmentManagement; 