import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-wrapper">
      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">אחזקת מבנים חכמה ומקצועית</h1>
          <p className="home-subtitle">שירות מתקדם לניהול, גבייה ותחזוקה של בניינים</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
