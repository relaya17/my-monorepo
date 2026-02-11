// Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleNavbar, closeNavbar } from '../redux/slice/navbarSlice';
import type { RootState } from '../redux/store';
import ROUTES from '../routs/routes';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.navbar.isOpen);

  const handleToggleNavbar = () => {
    dispatch(toggleNavbar());
  };

  const handleCloseNavbar = () => {
    dispatch(closeNavbar());
  };

  const handleNavClick = () => {
    handleCloseNavbar();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-glass">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={handleCloseNavbar} style={{ color: '#ffffff' }}>
          <span className="brand-stack">
            <span
              className="brand-name"
              style={{
                fontWeight: 700,
                fontSize: '1.7rem',
                color: '#ffffff',
                letterSpacing: '0.08em'
              }}
            >
              VANTERA
            </span>
            <span className="brand-slogan">Vantera – ניהול נכסים בסטנדרט אחר</span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={handleToggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* כפתור קיר הקהילה הוסר */}
            <li className="nav-item me-2">
              <Link className="nav-link btn btn-outline-light" to={ROUTES.USER_LOGIN} onClick={handleNavClick} style={{ 
                borderColor: '#ffffff', 
                color: '#ffffff',
                backgroundColor: 'transparent',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                borderWidth: '1px',
                borderStyle: 'solid',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}>
                <i className="fas fa-home me-1"></i>
                כניסת דייר
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link btn btn-outline-light" to={ROUTES.ADMIN_LOGIN} onClick={handleNavClick} style={{ 
                borderColor: '#ffffff', 
                color: '#ffffff',
                backgroundColor: 'transparent',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                borderWidth: '1px',
                borderStyle: 'solid',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}>
                <i className="fas fa-user-shield me-1"></i>
                אדמין
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
