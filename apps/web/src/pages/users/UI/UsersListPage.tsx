import React, { useState, useEffect } from "react";
import { Container, ListGroup, Badge, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from '../../../routs/routes';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      name: "יוסי כהן", 
      email: "yossi@example.com",
      role: "דייר",
      status: "active",
      joinDate: "2024-01-15"
    },
    { 
      id: 2, 
      name: "שרה לוי", 
      email: "sara@example.com",
      role: "דייר",
      status: "active",
      joinDate: "2024-02-20"
    },
    { 
      id: 3, 
      name: "דוד ישראלי", 
      email: "david@example.com",
      role: "מנהל",
      status: "active",
      joinDate: "2023-12-01"
    },
    { 
      id: 4, 
      name: "מיכל רוזן", 
      email: "michal@example.com",
      role: "דייר",
      status: "inactive",
      joinDate: "2024-03-10"
    },
  ]);

  useEffect(() => {
    // בדיקה אם המשתמש מחובר כאדמין
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/admin-login');
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge bg="success">פעיל</Badge> : 
      <Badge bg="secondary">לא פעיל</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return role === 'מנהל' ? 
      <Badge bg="danger">מנהל</Badge> : 
      <Badge bg="primary">דייר</Badge>;
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', direction: 'rtl' }}>
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mb-5">
          <div></div>
                      <h1 className="text-center" style={{ color: '#ffffff', fontWeight: 'bold', margin: 0 }}>
            <i className="fas fa-list ms-2"></i>
            רשימת משתמשים
          </h1>
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-primary"
              size="sm"
              className="ms-2"
              onClick={() => navigate(ROUTES.SIGN_UP)}
            >
              <i className="fas fa-plus ms-1"></i>
              הוסף משתמש
            </Button>
            <Button 
              variant="outline-danger"
              size="sm"
              className="ms-2"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt ms-1"></i>
              התנתק
            </Button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-users ms-2"></i>
                משתמשים במערכת ({users.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <ListGroup variant="flush">
                {users.map((user) => (
                  <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center">
                      <div className="ms-3">
                        <h6 className="mb-1" style={{ color: '#2c3e50' }}>
                          {user.name}
                        </h6>
                        <small className="text-muted">
                          <i className="fas fa-envelope ms-1"></i>
                          {user.email}
                        </small>
                        <br />
                        <small className="text-muted">
                          <i className="fas fa-calendar ms-1"></i>
                          הצטרף: {new Date(user.joinDate).toLocaleDateString('he-IL')}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      {getRoleBadge(user.role)}
                      <span className="ms-2"></span>
                      {getStatusBadge(user.status)}
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="ms-2"
                        onClick={() => navigate(`/user-details/${user.id}`)}
                      >
                        <i className="fas fa-eye ms-1"></i>
                        פרטים
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
        >
          <i className="fas fa-arrow-right ms-2"></i>
          חזרה ללוח הבקרה
        </Button>
      </div>
    </div>
  );
};

export default UsersListPage;
