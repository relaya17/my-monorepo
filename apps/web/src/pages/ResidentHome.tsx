import React from 'react';
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer';
import ResidentFeed from '../components/ResidentFeed';
import { useBuilding } from '../context/BuildingContext';
import './ResidentHome.css';

const ResidentHome: React.FC = () => {
  const navigate = useNavigate();
  const { buildingName } = useBuilding();

  const isLoggedIn = localStorage.getItem('authToken') || localStorage.getItem('userToken') || localStorage.getItem('adminToken');

  const pageTitle = buildingName && buildingName !== 'default' ? `Vantera | ${buildingName}` : 'ברוכים הבאים לדף הבית של הדיירים';
  const pageSubtitle = buildingName && buildingName !== 'default' ? `ברוכים הבאים – ${buildingName}` : 'מערכת ניהול דיירים למבנים';

  return (
    <div className="resident-home-container">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <a href="#navigation" className="skip-link">דלג לניווט</a>
      <a href="#quick-actions" className="skip-link">דלג לפעולות מהירות</a>

      <div className="container py-4" id="main-content">
        <div className="text-center mb-5">
          <h1 className="display-4 mb-3 resident-home-title">
            <i className="fas fa-home me-3" aria-hidden="true"></i>
            {pageTitle}
          </h1>
          <p className="lead resident-home-subtitle">{pageSubtitle}</p>
        </div>

        {/* כפתורי ניווט מהירים */}
        <div className="row justify-content-center mb-5" id="quick-actions">
          <div className="col-12">
            <div className="card shadow-lg border-0">
              <div className="card-header text-center resident-home-quick-header">
                <h4 className="mb-0">
                  <i className="fas fa-bolt me-2" aria-hidden="true"></i>
                  גישה מהירה לשירותים
                </h4>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <button 
                    className="btn btn-lg resident-home-btn-payment"
                    onClick={() => navigate('/payment-page')}
                    aria-label="עבור לדף תשלום"
                  >
                    <i className="fas fa-credit-card me-2" aria-hidden="true"></i>
                    דף תשלום
                  </button>
                  <button 
                    className="btn btn-lg resident-home-btn-approval"
                    onClick={() => navigate('/new-resident-approval')}
                    aria-label="עבור לאישור דיירים חדשים"
                  >
                    <i className="fas fa-user-plus me-2" aria-hidden="true"></i>
                    אישור דיירים חדשים
                  </button>

                  <button 
                    className="btn btn-lg resident-home-btn-sale"
                    onClick={() => navigate('/for-sale')}
                    aria-label="עבור לדירות למכירה"
                  >
                    <i className="fas fa-home me-2" aria-hidden="true"></i>
                    דירות למכירה
                  </button>
                  <button 
                    className="btn btn-lg resident-home-btn-rent"
                    onClick={() => navigate('/for-rent')}
                    aria-label="עבור לדירות להשכרה"
                  >
                    <i className="fas fa-key me-2" aria-hidden="true"></i>
                    דירות להשכרה
                  </button>
                  <button 
                    className="btn btn-lg resident-home-btn-services"
                    onClick={() => navigate('/employee-management')}
                    aria-label="עבור לשירותים מקצועיים"
                  >
                    <i className="fas fa-tools me-2" aria-hidden="true"></i>
                    לשירותים מקצועיים
                  </button>
                  {isLoggedIn && (
                    <>
                      <button 
                        className="btn btn-lg resident-home-btn-community"
                        onClick={() => navigate('/community-wall')}
                        aria-label="עבור לקיר הקהילה"
                      >
                        <i className="fas fa-users me-2" aria-hidden="true"></i>
                        קיר הקהילה
                      </button>
                      <button 
                        className="btn btn-lg resident-home-btn-safezone"
                        onClick={() => navigate('/safe-zone')}
                        aria-label="Safe-Zone – ליווי מצלמות"
                      >
                        <i className="fas fa-shield-alt me-2" aria-hidden="true"></i>
                        Safe-Zone
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* כרטיסי מידע */}
        <div className="row g-4 mb-5">
          {/* אזור ידיעות – פיד מותאם לבניין */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 h-100">
              <ResidentFeed />
            </div>
          </div>
          
          {/* אזור סקרים */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-header resident-home-polls-header">
                <h5 className="mb-0">
                  <i className="fas fa-poll me-2" aria-hidden="true"></i>
                  סקרים והצבעות
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <i className="fas fa-vote-yea me-2 resident-home-icon-polls" aria-hidden="true"></i>
                  <span>הצבעה: רכישת מתקני כושר לגינה</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="fas fa-clock me-2 resident-home-icon-clock" aria-hidden="true"></i>
                  <span>סקר: זמני פתיחת הגינה בקיץ</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-calendar me-2 resident-home-icon-calendar" aria-hidden="true"></i>
                  <span>הצבעה: תאריך מסיבת חגיגת השנה החדשה</span>
                </div>
                <button 
                  onClick={() => navigate('/voting')}
                  className="btn w-100 mt-3 resident-home-btn-vote"
                  aria-label="עבור להצבעה"
                >
                  <i className="fas fa-vote-yea me-2" aria-hidden="true"></i>
                  להצבעה
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* שירותים נוספים */}
        <div className="row g-4">
          {/* יד 2 */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-header resident-home-yad2-header">
                <h6 className="mb-0">
                  <i className="fas fa-store me-2" aria-hidden="true"></i>
                  יד 2
                </h6>
              </div>
              <div className="card-body d-flex flex-column">
                <p className="flex-grow-1">פרסום וצפייה במודעות יד שניה בין הדיירים.</p>
                <button 
                  disabled
                  className="btn w-100 resident-home-btn-yad2"
                  aria-label="שירות יד 2 - בקרוב"
                >
                  <i className="fas fa-clock me-2" aria-hidden="true"></i>
                  בקרוב
                </button>
              </div>
            </div>
          </div>
          
          {/* דירות למכירה */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-header resident-home-sale-header">
                <h6 className="mb-0">
                  <i className="fas fa-home me-2" aria-hidden="true"></i>
                  דירות למכירה
                </h6>
              </div>
              <div className="card-body d-flex flex-column">
                <p className="flex-grow-1">צפייה ופרסום דירות למכירה בבניין.</p>
                <button 
                  onClick={() => navigate('/for-sale')}
                  className="btn w-100 resident-home-btn-sale-card"
                  aria-label="עבור למודעות מכירה"
                >
                  <i className="fas fa-search me-2" aria-hidden="true"></i>
                  למודעות מכירה
                </button>
              </div>
            </div>
          </div>
          
          {/* דירות להשכרה */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-header resident-home-rent-header">
                <h6 className="mb-0">
                  <i className="fas fa-key me-2" aria-hidden="true"></i>
                  דירות להשכרה
                </h6>
              </div>
              <div className="card-body d-flex flex-column">
                <p className="flex-grow-1">צפייה ופרסום דירות להשכרה בבניין.</p>
                <button 
                  onClick={() => navigate('/for-rent')}
                  className="btn w-100 resident-home-btn-rent-card"
                  aria-label="עבור למודעות השכרה"
                >
                  <i className="fas fa-search me-2" aria-hidden="true"></i>
                  למודעות השכרה
                </button>
              </div>
            </div>
          </div>
          
          {/* שירותי מקצוע */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-header resident-home-polls-header">
                <h6 className="mb-0">
                  <i className="fas fa-tools me-2" aria-hidden="true"></i>
                  שירותי מקצוע
                </h6>
              </div>
              <div className="card-body d-flex flex-column">
                <p className="flex-grow-1">פרסום וצפייה בשירותים מקצועיים של דיירים.</p>
                <button 
                  onClick={() => navigate('/employee-management')}
                  className="btn w-100 resident-home-btn-services"
                  aria-label="עבור לשירותים מקצועיים"
                >
                  <i className="fas fa-tools me-2" aria-hidden="true"></i>
                  לשירותים מקצועיים
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="resident-home-subtitle">
            <i className="fas fa-heart me-1" aria-hidden="true"></i>
            מערכת ניהול דיירים מתקדמת למבנים
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResidentHome; 