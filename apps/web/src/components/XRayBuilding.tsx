/**
 * אפקט X-Ray – בניין שחור-לבן, ב-Hover נחשפת שכבת "דיגיטלית" טורקיז עם נקודות דופקות.
 * מסר: "אנחנו רואים את מה שעין אנושית מפספסת".
 */
import React, { useState } from 'react';

const NODES = [
  { left: '18%', top: '35%', label: 'Pipes' },
  { left: '48%', top: '25%', label: 'Elevator' },
  { left: '78%', top: '20%', label: 'Roof' },
  { left: '25%', top: '60%', label: 'Pump room' },
  { left: '65%', top: '55%', label: 'Electrical' },
];

const XRayBuilding: React.FC = () => {
  const [hover, setHover] = useState(false);
  return (
    <section className="xray-section">
      <h2 className="xray-heading">We see what the human eye misses</h2>
      <div
        className="xray-wrap"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="xray-base" />
        <div className={`xray-overlay ${hover ? 'xray-overlay-visible' : ''}`} aria-hidden>
          <svg className="xray-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="20" y1="40" x2="50" y2="28" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
            <line x1="50" y1="28" x2="80" y2="22" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
            <line x1="28" y1="62" x2="50" y2="55" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
            <line x1="68" y1="58" x2="50" y2="55" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
          </svg>
          {NODES.map((node, i) => (
            <div
              key={i}
              className="xray-node"
              style={{ left: node.left, top: node.top }}
              title={node.label}
            >
              <span className="xray-node-pulse" />
              <span className="xray-node-dot" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default XRayBuilding;
