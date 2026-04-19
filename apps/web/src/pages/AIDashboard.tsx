import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIDashboard.css';

interface MonthlyIncomeEntry {
  total: number;
  count: number;
  categories?: Record<string, number>;
}

interface Anomaly {
  id: string;
  amount: number;
  date: string;
  type: string;
}

interface FinancialAnalysis {
  monthlyIncome: Record<string, MonthlyIncomeEntry>;
  futurePrediction: {
    nextMonth: number;
    trend: string;
    confidence: number;
  };
  anomalies: Anomaly[];
  totalRevenue: number;
  averagePayment: number;
}

interface RiskUser {
  username: string;
  riskLevel: string;
  reason: string;
}

interface UserBehavior {
  userActivity: {
    activeUsers: number;
    inactiveUsers: number;
    activityRate: number;
  };
  riskUsers: RiskUser[];
  totalUsers: number;
}

interface AIRecommendation {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

const AIDashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialAnalysis | null>(null);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const monthlyIncome: Record<string, MonthlyIncomeEntry> = financialData?.monthlyIncome ?? {};

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      
      const [financialRes, behaviorRes, recommendationsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/ai-analytics/financial-analysis`),
        fetch(`${import.meta.env.VITE_API_URL}/ai-analytics/user-behavior-analysis`),
        fetch(`${import.meta.env.VITE_API_URL}/ai-analytics/ai-recommendations`)
      ]);

      if (financialRes.ok) {
        const financialData = await financialRes.json();
        setFinancialData(financialData);
      }

      if (behaviorRes.ok) {
        const behaviorData = await behaviorRes.json();
        setUserBehavior(behaviorData);
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json();
        setRecommendations(recommendationsData.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center ai-dashboard-loading">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-3">טוען נתוני AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid ai-dashboard-container">
      {/* כותרת ראשית */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-0">
                <i className="fas fa-brain text-primary me-2"></i>
                דשבורד AI חכם
              </h1>
              <p className="text-muted">ניתוח מתקדם וקבלת החלטות מבוססות נתונים</p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={fetchAIData}
            >
              <i className="fas fa-sync-alt me-2"></i>
              רענן נתונים
            </button>
          </div>
        </div>
      </div>

      {/* כרטיסי סטטיסטיקה מהירה */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">הכנסות כוללות</h4>
                  <h2>₪{financialData?.totalRevenue?.toLocaleString() || '0'}</h2>
                </div>
                <i className="fas fa-money-bill-wave fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">משתמשים פעילים</h4>
                  <h2>{userBehavior?.userActivity?.activeUsers || '0'}</h2>
                </div>
                <i className="fas fa-users fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">תשלום ממוצע</h4>
                  <h2>₪{Math.round(financialData?.averagePayment || 0)}</h2>
                </div>
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">המלצות AI</h4>
                  <h2>{recommendations.length}</h2>
                </div>
                <i className="fas fa-lightbulb fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ניווט בין לשוניות */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-pie me-2"></i>
                סקירה כללית
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`}
                onClick={() => setActiveTab('financial')}
              >
                <i className="fas fa-coins me-2"></i>
                ניתוח כספי
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-user-chart me-2"></i>
                התנהגות משתמשים
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommendations')}
              >
                <i className="fas fa-lightbulb me-2"></i>
                המלצות AI
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* תוכן לשוניות */}
      <div className="row">
        <div className="col-12">
          {activeTab === 'overview' && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5><i className="fas fa-chart-line me-2"></i>חיזוי הכנסות</h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center">
                      <h3 className="text-primary">
                        ₪{financialData?.futurePrediction?.nextMonth?.toLocaleString() || '0'}
                      </h3>
                      <p className="mb-2">חיזוי לחודש הבא</p>
                      <div className="d-flex justify-content-center align-items-center">
                        <span className="me-2">{getTrendIcon(financialData?.futurePrediction?.trend || 'stable')}</span>
                        <span className={`badge ${financialData?.futurePrediction?.trend === 'rising' ? 'bg-success' : 'bg-warning'}`}>
                          {financialData?.futurePrediction?.trend === 'rising' ? 'עלייה' : 'ירידה'}
                        </span>
                      </div>
                      <small className="text-muted">
                        רמת ביטחון: {Math.round((financialData?.futurePrediction?.confidence || 0) * 100)}%
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5><i className="fas fa-exclamation-triangle me-2"></i>אנומליות זוהו</h5>
                  </div>
                  <div className="card-body">
                    <div className="text-center">
                      <h3 className="text-warning">{financialData?.anomalies?.length || '0'}</h3>
                      <p>תשלומים חריגים</p>
                      {(financialData?.anomalies?.length || 0) > 0 && (
                        <button className="btn btn-sm btn-outline-warning">
                          צפה בפרטים
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="card">
              <div className="card-header">
                <h5><i className="fas fa-coins me-2"></i>ניתוח כספי מפורט</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>הכנסות לפי חודשים</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>חודש</th>
                            <th>סכום</th>
                            <th>כמות תשלומים</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(monthlyIncome).map(([month, data]) => (
                            <tr key={month}>
                              <td>{month}</td>
                              <td>₪{data.total?.toLocaleString()}</td>
                              <td>{data.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>סטטיסטיקות כלליות</h6>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>הכנסות כוללות:</span>
                        <strong>₪{financialData?.totalRevenue?.toLocaleString()}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>תשלום ממוצע:</span>
                        <strong>₪{Math.round(financialData?.averagePayment || 0)}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>כמות תשלומים:</span>
                        <strong>{Object.values(monthlyIncome).reduce((sum, data) => sum + data.count, 0)}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header">
                <h5><i className="fas fa-user-chart me-2"></i>ניתוח התנהגות משתמשים</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>סטטיסטיקות פעילות</h6>
                    <div className="row text-center">
                      <div className="col-6">
                        <div className="border rounded p-3">
                          <h4 className="text-success">{userBehavior?.userActivity?.activeUsers || '0'}</h4>
                          <small>משתמשים פעילים</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3">
                          <h4 className="text-muted">{userBehavior?.userActivity?.inactiveUsers || '0'}</h4>
                          <small>משתמשים לא פעילים</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="ai-dashboard-progress-wrapper">
                        <progress
                          className="ai-dashboard-progress"
                          value={Math.round(userBehavior?.userActivity?.activityRate || 0)}
                          max={100}
                          title="אחוז פעילות משתמשים"
                          aria-label="אחוז פעילות משתמשים"
                        >
                          {Math.round(userBehavior?.userActivity?.activityRate || 0)}
                        </progress>
                        <span className="ai-dashboard-progress-value">
                          {Math.round(userBehavior?.userActivity?.activityRate || 0)}%
                        </span>
                      </div>
                      <small className="text-muted">אחוז פעילות</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>משתמשים בסיכון</h6>
                    {(userBehavior?.riskUsers?.length || 0) > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>משתמש</th>
                              <th>רמת סיכון</th>
                              <th>סיבה</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userBehavior?.riskUsers?.map((user, index) => (
                              <tr key={index}>
                                <td>{user.username}</td>
                                <td><span className="badge bg-danger">{user.riskLevel}</span></td>
                                <td>{user.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-success">אין משתמשים בסיכון</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="card">
              <div className="card-header">
                <h5><i className="fas fa-lightbulb me-2"></i>המלצות AI</h5>
              </div>
              <div className="card-body">
                {recommendations.length > 0 ? (
                  <div className="row">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="card border-start border-3 border-primary">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="card-title">{rec.title}</h6>
                                <p className="card-text text-muted">{rec.description}</p>
                                <span className={`badge ${getPriorityColor(rec.priority)}`}>
                                  {rec.priority === 'high' ? 'גבוה' : rec.priority === 'medium' ? 'בינוני' : 'נמוך'}
                                </span>
                              </div>
                              <button className="btn btn-sm btn-outline-primary" title="הפעל המלצה" aria-label="הפעל המלצה">
                                <i className="fas fa-play" aria-hidden="true"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
                    <h5>אין המלצות חדשות</h5>
                    <p className="text-muted">המערכת פועלת בצורה אופטימלית</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* כפתורי ניווט */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/admin-dashboard')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            חזרה לדשבורד אדמין
          </button>
          <button 
            className="btn btn-primary"
            onClick={fetchAIData}
          >
            <i className="fas fa-sync-alt me-2"></i>
            רענן נתונים
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard; 