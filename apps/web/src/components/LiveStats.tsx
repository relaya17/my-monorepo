/**
 * מדדי Vantera – API או Seed Data. אנימציית count-upסקשן נכנס ל-view.
 */
import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { getApiUrl } from '../api';
import type { GlobalImpactResponse } from 'shared';

/** Seed data כשהמערכת לא מחוברת – אין "טוען מדדים" או "לא זמין". */
const SEED = {
  moneySaved: 242500,
  preventedFailures: 142,
  activeAssets: 84,
};

function useLiveStats() {
  const [data, setData] = useState<GlobalImpactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(getApiUrl('public/impact-metrics'))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((json: GlobalImpactResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError('seed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

/** Counter רץ – מתחיל כש-inView. */
function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  inView,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  inView: boolean;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const step = Math.max(1, Math.ceil(value / 40));
    let current = 0;
    const id = setInterval(() => {
      current += step;
      setDisplay(Math.min(current, value));
      if (current >= value) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [value, inView]);
  return (
    <span>
      {prefix}
      {display.toLocaleString('en')}
      {suffix}
    </span>
  );
}

const LiveStats: React.FC = () => {
  const { data } = useLiveStats();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const moneySaved = data?.totalMoneySaved ?? SEED.moneySaved;
  const preventedFailures = data?.totalPreventedFailures ?? SEED.preventedFailures;
  const activeAssets = SEED.activeAssets;

  return (
    <div className="live-stats py-4" ref={ref}>
      <div className="row g-4 justify-content-center">
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Money Saved</h6>
              <h3 className="mb-0 text-primary">
                <AnimatedCounter value={moneySaved} prefix="₪" suffix="+" inView={inView} />
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Prevented Failures</h6>
              <h3 className="mb-0 text-success">
                <AnimatedCounter value={preventedFailures} inView={inView} />
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Active Assets</h6>
              <h3 className="mb-0 text-info">
                <AnimatedCounter value={activeAssets} suffix=" Buildings" inView={inView} />
              </h3>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveStats;
