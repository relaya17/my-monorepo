import React from 'react';
import { useBuilding } from '../context/BuildingContext';
import ResidentFeedAdBanner from './AdBanner';
import './ResidentFeed.css';

const ResidentFeed: React.FC = () => {
  const { buildingName, pulse, feed, emergencyDetected, loading, error } = useBuilding();

  const title = buildingName ? `עדכונים מ${buildingName}` : 'עדכונים מהבניין';

  if (loading) {
    return (
      <div className="card-body">
        <h5 className="mb-0">
          <i className="fas fa-bullhorn me-2" aria-hidden="true" />
          {title}
        </h5>
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" aria-label="טוען">
            <span className="visually-hidden">טוען...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-body">
        <h5 className="mb-0">
          <i className="fas fa-bullhorn me-2" aria-hidden="true" />
          {title}
        </h5>
        <p className="text-warning mb-0 mt-3">{error}</p>
      </div>
    );
  }

  return (
    <div className="card-body">
      <h5 className="mb-0">
        <i className="fas fa-bullhorn me-2" aria-hidden="true" />
        {title}
      </h5>

      {pulse && (
        <div className="d-flex flex-wrap gap-3 mt-3 p-3 rounded resident-feed-pulse">
          <div><span className="me-1" aria-hidden>💧</span> מים: {pulse.water ?? '—'}</div>
          <div><span className="me-1" aria-hidden>⚡</span> חשמל: {pulse.electricity ?? '—'}</div>
          <div><span className="me-1" aria-hidden>🛗</span> מעליות: {pulse.elevators ?? '—'}</div>
          <div><span className="me-1" aria-hidden>🧹</span> ניקיון: {pulse.cleaner ?? '—'}</div>
          <div><span className="me-1" aria-hidden>📹</span> מצלמות/אבטחה: {pulse.cameras ?? 'פעיל'}</div>
        </div>
      )}

      <div className="mt-3">
        {feed.length === 0 ? (
          <p className="text-muted mb-0">אין תקלות או הודעות פעילות כרגע.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {feed.map((item) => (
              <li key={item.id} className="d-flex align-items-start mb-3">
                <i className="fas fa-info-circle me-2 mt-1 resident-feed-icon" aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  {item.body && <p className="mb-0 small text-muted">{item.body}</p>}
                  {item.createdAt && (
                    <span className="small text-muted">{new Date(item.createdAt).toLocaleDateString('he-IL')}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3">
        <ResidentFeedAdBanner isEmergency={emergencyDetected} />
      </div>
    </div>
  );
};

export default ResidentFeed;
