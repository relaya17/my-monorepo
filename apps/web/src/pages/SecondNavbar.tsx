import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu } from '../redux/slice/SecondNavbar';
import type { AppDispatch, RootState } from '../redux/store';

// Define NavItem locally instead of importing from server
interface NavItem {
  label: string;
  path: string;
}

const NavigationBar: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const activeMenu = useSelector((state: RootState) => state.secondNavbar.activeMenu);
  const [expanded, setExpanded] = useState(false);

  const receiptsMenu: NavItem[] = [
    { label: 'מעקב וניהול תשלומים', path: '/payment-management' },
    { label: 'קבלות נכנסות', path: '/receipts/incoming' },
    { label: 'תשלומים יוצאים', path: '/receipts/outgoing' },
    { label: 'חובות', path: '/receipts/debts' }
  ];

  const residentsMenu: NavItem[] = [
    { label: 'רשימת דיירים', path: '/residents/list' },
    { label: 'חובות דיירים', path: '/residents/debts' },
    { label: 'שאלות נפוצות', path: '/residents/faq' },
    { label: 'ניהול דירות', path: '/apartments' }
  ];

  const financesMenu: NavItem[] = [
    { label: 'קופה קטנה', path: '/finances/petty-cash' },
    { label: 'דו"חות כספיים', path: '/finances/reports' }
  ];

  const handleToggle = (menu: string) => {
    dispatch(setActiveMenu(activeMenu === menu ? null : menu));
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  return (
    <Navbar 
      bg="light" 
      variant="light" 
      expand="lg" 
      dir="rtl"
      id="navigation"
      className="navbar-responsive"
      expanded={expanded}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        minHeight: '60px',
        display: 'flex',
        width: '100%'
      }}
    >
      <Container fluid className="px-3" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <Navbar.Brand href="/" className="fw-bold d-flex align-items-center">
          <i className="fas fa-building me-2" aria-hidden="true" style={{ color: '#6b7280' }}></i>
          <span 
            className="brand-text"
            style={{ 
              background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
            }}
          >
            ניהול אחזקות מבנים
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          aria-label="פרוס תפריט ניווט"
          className="border-0 navbar-toggler"
          style={{ 
            border: 'none', 
            padding: '0.25rem 0.5rem',
            display: 'block',
            background: 'transparent'
          }}
          onClick={() => setExpanded(!expanded)}
        />
        
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
          <Nav className="me-auto flex-wrap">
            <NavLink 
              to="/" 
              className="nav-link d-flex align-items-center" 
              aria-label="דף הבית" 
              style={{ color: '#6b7280', padding: '0.5rem 1rem' }}
              onClick={() => setExpanded(false)}
            >
              <i className="fas fa-home me-1" aria-hidden="true"></i>
              <span className="nav-text">דף הבית</span>
            </NavLink>

            <NavDropdown 
              title={
                <span style={{ color: '#6b7280' }} className="d-flex align-items-center">
                  <i className="fas fa-receipt me-1" aria-hidden="true"></i>
                  <span className="nav-text">קבלות ותשלומים</span>
                </span>
              } 
              id="receipts-dropdown" 
              show={activeMenu === 'receipts'} 
              onClick={() => handleToggle('receipts')}
              aria-label="תפריט קבלות ותשלומים"
              className="nav-dropdown-responsive"
            >
              {receiptsMenu.map((item) => (
                <NavDropdown.Item as="span" key={item.path} className="dropdown-item-responsive">
                  <NavLink 
                    to={item.path} 
                    className="dropdown-item d-block w-100" 
                    aria-label={item.label}
                    style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}
                    onClick={() => setExpanded(false)}
                  >
                    {item.label}
                  </NavLink>
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <NavDropdown 
              title={
                <span style={{ color: '#6b7280' }} className="d-flex align-items-center">
                  <i className="fas fa-users me-1" aria-hidden="true"></i>
                  <span className="nav-text">ניהול דיירים</span>
                </span>
              } 
              id="residents-dropdown" 
              show={activeMenu === 'residents'} 
              onClick={() => handleToggle('residents')}
              aria-label="תפריט ניהול דיירים"
              className="nav-dropdown-responsive"
            >
              {residentsMenu.map((item) => (
                <NavDropdown.Item as="span" key={item.path} className="dropdown-item-responsive">
                  <NavLink 
                    to={item.path} 
                    className="dropdown-item d-block w-100" 
                    aria-label={item.label}
                    style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}
                    onClick={() => setExpanded(false)}
                  >
                    {item.label}
                  </NavLink>
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <NavDropdown 
              title={
                <span style={{ color: '#6b7280' }} className="d-flex align-items-center">
                  <i className="fas fa-money-bill-wave me-1" aria-hidden="true"></i>
                  <span className="nav-text">ניהול כספים</span>
                </span>
              } 
              id="finances-dropdown" 
              show={activeMenu === 'finances'} 
              onClick={() => handleToggle('finances')}
              aria-label="תפריט ניהול כספים"
              className="nav-dropdown-responsive"
            >
              {financesMenu.map((item) => (
                <NavDropdown.Item as="span" key={item.path} className="dropdown-item-responsive">
                  <NavLink 
                    to={item.path} 
                    className="dropdown-item d-block w-100" 
                    aria-label={item.label}
                    style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}
                    onClick={() => setExpanded(false)}
                  >
                    {item.label}
                  </NavLink>
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <NavLink 
              to="/board" 
              className="nav-link d-flex align-items-center" 
              aria-label="לוח מודעות" 
              style={{ color: '#6b7280', padding: '0.5rem 1rem' }}
              onClick={() => setExpanded(false)}
            >
              <i className="fas fa-clipboard me-1" aria-hidden="true"></i>
              <span className="nav-text">לוח מודעות</span>
            </NavLink>
            
            <NavLink 
              to="/voting" 
              className="nav-link d-flex align-items-center" 
              aria-label="הצבעות דיירים" 
              style={{ color: '#6b7280', padding: '0.5rem 1rem' }}
              onClick={() => setExpanded(false)}
            >
              <i className="fas fa-vote-yea me-1" aria-hidden="true"></i>
              <span className="nav-text">הצבעות דיירים</span>
            </NavLink>
            
            <NavLink 
              to="/admin" 
              className="nav-link d-flex align-items-center" 
              aria-label="הגדרות מנהל" 
              style={{ color: '#6b7280', padding: '0.5rem 1rem' }}
              onClick={() => setExpanded(false)}
            >
              <i className="fas fa-cog me-1" aria-hidden="true"></i>
              <span className="nav-text">הגדרות מנהל</span>
            </NavLink>
          </Nav>
          
          {/* כפתור יציאה */}
          <Nav>
            <button 
              onClick={handleLogout}
              className="btn btn-link nav-link text-warning d-flex align-items-center border-0 bg-transparent" 
              aria-label="יציאה מהמערכת" 
              style={{ color: '#f59e0b', padding: '0.5rem 1rem', textDecoration: 'none' }}
            >
              <i className="fas fa-sign-out-alt me-1" aria-hidden="true"></i>
              <span className="nav-text">יציאה</span>
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
      
      {/* CSS מותאם אישית לנגישות ורספונסיביות */}
      <style>{`
        /* הבטחת תצוגת הנאבבר בכל המסכים */
        .navbar-responsive {
          display: flex !important;
          width: 100% !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 1000 !important;
          background-color: #f9fafb !important;
        }
        
        .navbar-responsive .container {
          display: flex !important;
          width: 100% !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        
        @media (max-width: 768px) {
          .navbar-responsive .navbar-collapse,
          .navbar-responsive .navbar-collapse.show {
            max-height: 80vh !important;
            overflow-y: auto !important;
            min-height: unset !important;
            height: auto !important;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background: #f9fafb !important;
            z-index: 1001 !important;
          }
          
          .brand-text {
            font-size: 1rem !important;
          }
          
          .nav-text {
            font-size: 0.9rem;
          }
          
          .nav-dropdown-responsive .dropdown-menu {
            position: static !important;
            float: none;
            width: 100%;
            margin-top: 0;
            border: none;
            box-shadow: none;
            background-color: #f8f9fa;
          }
          
          .dropdown-item-responsive {
            padding: 0;
          }
          
          .dropdown-item-responsive .dropdown-item {
            border-bottom: 1px solid #e9ecef;
            padding: 0.75rem 1rem !important;
          }
          
          .dropdown-item-responsive .dropdown-item:hover {
            background-color: #e9ecef;
          }
        }
        
        @media (max-width: 576px) {
          .navbar-responsive {
            padding: 0.25rem 0;
            display: flex !important;
            flex-direction: row;
          }
          
          .navbar-responsive .container {
            flex-direction: row !important;
            justify-content: space-between !important;
            padding: 0 0.5rem;
          }
          
          .brand-text {
            font-size: 0.9rem !important;
          }
          
          .nav-text {
            font-size: 0.8rem;
          }
          
          .nav-link {
            padding: 0.5rem 0.75rem !important;
          }
          
          /* הבטחת תצוגת כפתור ההמבורגר */
          .navbar-toggler {
            display: block !important;
            border: none !important;
            padding: 0.25rem 0.5rem !important;
            background-color: transparent !important;
            margin-right: auto;
          }
          
          .navbar-toggler:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
          }
          
          /* הבטחת תצוגת הברנד */
          .navbar-brand {
            margin-right: 0 !important;
            margin-left: auto !important;
          }
        }
        
        /* נגישות - מיקוד טוב יותר */
        .nav-link:focus,
        .dropdown-item:focus,
        .btn:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        /* אנימציות חלקות */
        .nav-link,
        .dropdown-item {
          transition: all 0.2s ease-in-out;
        }
        
        .nav-link:hover,
        .dropdown-item:hover {
          background-color: rgba(0, 123, 255, 0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </Navbar>
  );
};

export default NavigationBar;
