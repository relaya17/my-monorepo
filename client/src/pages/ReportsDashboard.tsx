import React from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import NavigationBar from './SecondNavbar';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportsDashboard: React.FC = () => {
  // נתונים לדוגמה
  const stats = {
    totalApartments: 120,
    available: 30,
    rented: 60,
    sold: 30,
    totalPayments: 450,
    activeResidents: 110,
    overduePayments: 12,
    totalIncome: 320000,
  };

  const barData = {
    labels: ['פנוי', 'מושכר', 'נמכר'],
    datasets: [
      {
        label: 'מספר דירות',
        data: [stats.available, stats.rented, stats.sold],
        backgroundColor: ['#0d6efd', '#20c997', '#fd7e14'],
        borderColor: ['#0d6efd', '#20c997', '#fd7e14'],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['שולם', 'באיחור', 'ממתין'],
    datasets: [
      {
        label: 'סטטוס תשלומים',
        data: [420, stats.overduePayments, stats.totalPayments - 420 - stats.overduePayments],
        backgroundColor: ['#198754', '#dc3545', '#ffc107'],
        borderColor: ['#198754', '#dc3545', '#ffc107'],
        borderWidth: 2,
      },
    ],
  };

  const reports = [
    { id: 1, title: 'דו"ח תשלומים ינואר', date: '2024-02-01', status: 'הושלם', amount: 32000 },
    { id: 2, title: 'דו"ח דירות פנויות', date: '2024-01-28', status: 'הושלם', amount: 0 },
    { id: 3, title: 'דו"ח דיירים פעילים', date: '2024-01-20', status: 'הושלם', amount: 0 },
    { id: 4, title: 'דו"ח חובות', date: '2024-01-15', status: 'הושלם', amount: 8000 },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#007bff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <NavigationBar />
      <Container fluid className="mt-4 px-3">
        <Row>
          <Col>
            <h2 className="mb-4 text-center" style={{ color: '#ffffff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              <i className="fas fa-chart-bar me-2" aria-hidden="true"></i>
              דוחות וסטטיסטיקה
            </h2>
          </Col>
        </Row>
        
        {/* כרטיסי סטטיסטיקה */}
        <Row className="mb-4 g-3">
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <Card className="text-center border-0 shadow-sm h-100 stats-card">
              <Card.Body className="d-flex flex-column justify-content-center">
                <h4 className="text-primary mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {stats.totalApartments.toLocaleString()}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-building me-1" aria-hidden="true"></i>
                  סה"כ דירות
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <Card className="text-center border-0 shadow-sm h-100 stats-card">
              <Card.Body className="d-flex flex-column justify-content-center">
                <h4 className="text-success mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {stats.rented.toLocaleString()}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-home me-1" aria-hidden="true"></i>
                  דירות מושכרות
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <Card className="text-center border-0 shadow-sm h-100 stats-card">
              <Card.Body className="d-flex flex-column justify-content-center">
                <h4 className="text-warning mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {stats.available.toLocaleString()}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-door-open me-1" aria-hidden="true"></i>
                  דירות פנויות
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <Card className="text-center border-0 shadow-sm h-100 stats-card">
              <Card.Body className="d-flex flex-column justify-content-center">
                <h4 className="text-info mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {stats.sold.toLocaleString()}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-handshake me-1" aria-hidden="true"></i>
                  דירות שנמכרו
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <Card className="text-center border-0 shadow-sm h-100 stats-card">
              <Card.Body className="d-flex flex-column justify-content-center">
                <h4 className="text-secondary mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  {stats.activeResidents.toLocaleString()}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-users me-1" aria-hidden="true"></i>
                  דיירים פעילים
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4} sm={6} xs={12} className="mb-3">
            <Card className="text-center border-0 shadow-sm h-100 stats-card">
              <Card.Body className="d-flex flex-column justify-content-center">
                <h4 className="text-success mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                  ₪{stats.totalIncome.toLocaleString()}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                  <i className="fas fa-money-bill-wave me-1" aria-hidden="true"></i>
                  סה"כ הכנסות
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* גרפים */}
        <Row className="mb-4 g-3">
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm h-100 chart-card">
              <Card.Body>
                <h5 className="mb-3 text-center" style={{ color: '#ffffff', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
                  <i className="fas fa-chart-bar me-2" aria-hidden="true"></i>
                  התפלגות דירות
                </h5>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Bar 
                    data={barData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: { display: false }
                      }
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} md={12} className="mb-3">
            <Card className="shadow-sm h-100 chart-card">
              <Card.Body>
                <h5 className="mb-3 text-center" style={{ color: '#ffffff', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
                  <i className="fas fa-chart-pie me-2" aria-hidden="true"></i>
                  סטטוס תשלומים
                </h5>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Pie 
                    data={pieData} 
                    options={chartOptions} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* טבלת דוחות */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-center" style={{ color: '#ffffff', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
                  <i className="fas fa-file-alt me-2" aria-hidden="true"></i>
                  דוחות אחרונים
                </h5>
                <div className="table-responsive">
                  <Table responsive hover className="table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>שם הדו"ח</th>
                        <th scope="col" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>תאריך</th>
                        <th scope="col" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>סטטוס</th>
                        <th scope="col" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>סכום</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="table-row-hover">
                          <td style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                            <i className="fas fa-file-text me-2" aria-hidden="true"></i>
                            {report.title}
                          </td>
                          <td style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                            {new Date(report.date).toLocaleDateString('he-IL')}
                          </td>
                          <td>
                            <span className={`badge ${report.status === 'הושלם' ? 'bg-success' : 'bg-warning'}`}>
                              {report.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                            {report.amount ? `₪${report.amount.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* CSS מותאם אישית לנגישות ורספונסיביות */}
      <style>{`
        .stats-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          cursor: pointer;
        }
        
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .chart-card {
          transition: box-shadow 0.2s ease-in-out;
        }
        
        .chart-card:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .table-row-hover:hover {
          background-color: rgba(0, 123, 255, 0.1) !important;
        }
        
        @media (max-width: 768px) {
          .stats-card {
            margin-bottom: 1rem;
          }
          
          .chart-card {
            margin-bottom: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .table-responsive {
            font-size: 0.8rem;
          }
          
          .badge {
            font-size: 0.7rem;
          }
        }
        
        /* נגישות - מיקוד טוב יותר */
        .stats-card:focus,
        .chart-card:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }
        
        /* אנימציות חלקות */
        .stats-card,
        .chart-card {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ReportsDashboard; 