/**
 * System Status – נורה מהבהבת + AI CORE / SATELLITE. מראה "מערכת חיה".
 */
import React from 'react';

const SystemStatus: React.FC = () => {
  return (
    <div className="system-status" aria-label="System status">
      <span className="system-status-dot">
        <span className="system-status-ping" />
        <span className="system-status-dot-inner" />
      </span>
      <span className="system-status-text">AI CORE: ACTIVE | SATELLITE: SYNCED</span>
    </div>
  );
};

export default SystemStatus;
