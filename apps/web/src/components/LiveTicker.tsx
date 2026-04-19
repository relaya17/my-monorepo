/**
 * Live ticker – "Savings Live". Events the system is managing in real time.
 */
import React from 'react';
import { motion } from 'framer-motion';

const LIVE_EVENTS = [
  'Flood prevented at Rothschild Tower 10 (estimated savings: ₪14,200)',
  'Voltage anomaly detected in elevator, Park Bavli Building – technician dispatched',
  'Satellite analysis complete: 12 buildings updated to normal status',
  'Transparency report generated for City Towers board',
  '4 min ago: Flood prevented at Nahalat Binyamin Building (estimated savings: ₪12,500)',
  '12 min ago: Voltage anomaly in Building Y elevator (outage avoided)',
];

const LiveTicker: React.FC = () => {
  return (
    <div className="live-ticker">
      <motion.div
        className="live-ticker-track"
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{ repeat: Infinity, duration: 75, ease: 'linear' }}
      >
        {[...LIVE_EVENTS, ...LIVE_EVENTS].map((event, i) => (
          <span key={i} className="live-ticker-item">
            <span className="live-ticker-bullet" />
            {event}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default LiveTicker;
