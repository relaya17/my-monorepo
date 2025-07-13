import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';

const Home: React.FC = () => {
  return (
    <div
      className="container-fluid d-flex flex-column justify-content-center align-items-center"
      style={{
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff',
        flex: 1,
        padding: '20px',
        color: '#374151',
        fontSize: '1.25rem',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* Overlay כהה יותר כדי שהתמונה תהיה בולטת יותר */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 1
      }}></div>
      <h1 className="text-center p-4 rounded-lg mb-4" style={{ 
        color: '#1f2937', 
        textShadow: '1px 1px 2px rgba(255,255,255,0.8)', 
        position: 'relative', 
        zIndex: 10, 
        backgroundColor: 'rgba(255,255,255,0.9)',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        border: '2px solid rgba(107, 114, 128, 0.3)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        margin: '20px 0'
      }}>
        ברוכים הבאים למתחם מצפה נוף
      </h1>

      <div className="d-flex justify-content-center gap-3 mb-4" style={{ position: 'relative', zIndex: 10 }}>
        <Link
          to={ROUTES.FOR_RENT}
          className="btn btn-lg"
          style={{
            backgroundColor: 'rgba(107, 114, 128, 0.9)',
            color: '#fff',
            fontWeight: 'bold',
            border: '2px solid rgba(107, 114, 128, 0.5)',
            transition: 'all 0.3s ease',
            padding: '10px 20px',
            borderRadius: '50px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.95)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.9)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
          }}
        >
          <i className="fas fa-key me-2"></i>
          דירות להשכרה
        </Link>

        <Link
          to={ROUTES.FOR_SALE}
          className="btn btn-lg"
          style={{
            backgroundColor: 'rgba(107, 114, 128, 0.9)',
            color: '#fff',
            fontWeight: 'bold',
            border: '2px solid rgba(107, 114, 128, 0.5)',
            transition: 'all 0.3s ease',
            padding: '10px 20px',
            borderRadius: '50px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.95)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.9)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
          }}
        >
          <i className="fas fa-home me-2"></i>
          דירות למכירה
        </Link>
      </div>
    </div>
  );
};

export default Home;
