import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container-fluid text-center">
        <div className="mb-2">
          <Link to="/" className="text-light me-3">דף הבית</Link>
          <Link to="/privacy-policy" className="text-light me-3">מדיניות פרטיות</Link>
          <Link to="/terms-and-conditions" className="text-light">תנאי שימוש</Link>
        </div>
        
        <div>
          <small>© {new Date().getFullYear()} כל הזכויות שמורות טלי לופטנהוס</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
