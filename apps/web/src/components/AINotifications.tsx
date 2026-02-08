import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  color: string;
  action: string;
  timestamp: string | Date;
  data: Record<string, unknown> | null;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  icon: string;
  color: string;
  timestamp: string | Date;
  data: Record<string, unknown> | null;
}

const AINotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchAlerts();
    
    // רענון אוטומטי כל 5 דקות
    const interval = setInterval(() => {
      fetchNotifications();
      fetchAlerts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-notifications/smart-notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-notifications/realtime-alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} דקות`;
    if (hours < 24) return `${hours} שעות`;
    return `${days} ימים`;
  };

  const handleAction = (action: string, data: Record<string, unknown> | null) => {
    console.log('Executing action:', action, data);
    // כאן אפשר להוסיף לוגיקה לביצוע פעולות
    switch (action) {
      case 'review_overdue_payments':
        // ניווט לדף תשלומים מאוחרים
        break;
      case 'review_revenue_strategy':
        // ניווט לדף אסטרטגיה
        break;
      case 'send_activation_campaign':
        // שליחת קמפיין הפעלה
        break;
      case 'review_anomalies':
        // ניווט לדף אנומליות
        break;
      default:
        break;
    }
  };

  const totalNotifications = notifications.length;
  const totalAlerts = alerts.length;

  return (
    <div className="ai-notifications-container">
      {/* כפתור התראות עם מונה */}
      <div className="position-relative d-inline-flex flex-wrap gap-2">
        <button
          className="btn btn-outline-primary btn-sm position-relative admin-action-btn"
          onClick={() => setShowNotifications(!showNotifications)}
          disabled={loading}
          aria-label="התראות AI"
          title="התראות AI"
        >
          <i className="fas fa-bell me-0 me-sm-2" aria-hidden="true"></i>
          <span className="admin-action-label d-none d-sm-inline">התראות AI</span>
          {totalNotifications > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {totalNotifications}
            </span>
          )}
        </button>

        {/* כפתור התראות בזמן אמת */}
        <button
          className="btn btn-outline-warning btn-sm position-relative admin-action-btn"
          onClick={() => setShowAlerts(!showAlerts)}
          disabled={loading}
          aria-label="התראות בזמן אמת"
          title="התראות בזמן אמת"
        >
          <i className="fas fa-exclamation-triangle me-0 me-sm-2" aria-hidden="true"></i>
          <span className="admin-action-label d-none d-sm-inline">התראות בזמן אמת</span>
          {totalAlerts > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
              {totalAlerts}
            </span>
          )}
        </button>
      </div>

      {/* דרופדאון התראות AI */}
      {showNotifications && (
        <div className="position-absolute top-100 end-0 mt-2 z-1000">
          <div className="card shadow-lg" style={{ width: 'min(92vw, 520px)' }}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="fas fa-brain me-2"></i>
                התראות AI חכמות
              </h6>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setShowNotifications(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center p-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">טוען...</span>
                  </div>
                  <span className="ms-2">טוען התראות...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-4">
                  <i className="fas fa-check-circle text-success fa-2x mb-2"></i>
                  <p className="text-muted mb-0">אין התראות חדשות</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-bottom p-3 notification-item ${notification.priority === 'high' ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex align-items-start">
                      <div className={`text-${getPriorityColor(notification.priority)} me-3`}>
                        <i className={`${notification.icon} fa-lg`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1">{notification.title}</h6>
                          <span className={`badge bg-${getPriorityColor(notification.priority)}`}>
                            {notification.priority === 'high' ? 'גבוה' : 
                             notification.priority === 'medium' ? 'בינוני' : 'נמוך'}
                          </span>
                        </div>
                        <p className="text-muted mb-2 small">{notification.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            לפני {formatTime(notification.timestamp)}
                          </small>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAction(notification.action, notification.data)}
                          >
                            <i className="fas fa-play me-1"></i>
                            פעולה
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="card-footer text-center">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={fetchNotifications}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  רענן
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* דרופדאון התראות בזמן אמת */}
      {showAlerts && (
        <div className="position-absolute top-100 end-0 mt-2 z-1000">
          <div className="card shadow-lg" style={{ width: 'min(92vw, 520px)' }}>
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                התראות בזמן אמת
              </h6>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={() => setShowAlerts(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <div className="text-center p-4">
                  <i className="fas fa-check-circle text-success fa-2x mb-2"></i>
                  <p className="text-muted mb-0">אין התראות בזמן אמת</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-bottom p-3 alert-item ${alert.severity === 'critical' ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex align-items-start">
                      <div className={`text-${getSeverityColor(alert.severity)} me-3`}>
                        <i className={`${alert.icon} fa-lg`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1">{alert.title}</h6>
                          <span className={`badge bg-${getSeverityColor(alert.severity)}`}>
                            {alert.severity === 'critical' ? 'קריטי' : 
                             alert.severity === 'warning' ? 'אזהרה' : 'מידע'}
                          </span>
                        </div>
                        <p className="text-muted mb-2 small">{alert.message}</p>
                        <small className="text-muted">
                          לפני {formatTime(alert.timestamp)}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {alerts.length > 0 && (
              <div className="card-footer text-center">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={fetchAlerts}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  רענן
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* סגירת דרופדאונים בלחיצה מחוץ להם */}
      {(showNotifications || showAlerts) && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => {
            setShowNotifications(false);
            setShowAlerts(false);
          }}
        />
      )}
    </div>
  );
};

export default AINotifications; 