/**
 * ChainAuditor — CEO dashboard component to verify VisionLog hash-chain integrity.
 *
 * Calls GET /api/super-admin/verify-ledger and displays:
 * - Scanning animation while running
 * - Green "verified" card if chain is intact
 * - Red "compromised" alert with tampered entry details if broken
 */
import { useState } from 'react';
import axios from 'axios';
import './ChainAuditor.css';

interface LedgerResult {
  valid: boolean;
  checkedCount: number;
  brokenAt: { id: string; index: number; hash: string } | null;
  verifiedAt: string;
  message: string;
}

type AuditState = 'idle' | 'scanning' | 'secure' | 'compromised';

const API = import.meta.env.VITE_API_URL ?? '';

export default function ChainAuditor() {
  const [state, setState] = useState<AuditState>('idle');
  const [result, setResult] = useState<LedgerResult | null>(null);
  const [error, setError] = useState('');

  async function runAudit() {
    setState('scanning');
    setResult(null);
    setError('');
    try {
      const res = await axios.get<LedgerResult>(`${API}/api/super-admin/verify-ledger`);
      setResult(res.data);
      setState(res.data.valid ? 'secure' : 'compromised');
    } catch {
      setError('שגיאה בהרצת בדיקת השרשרת');
      setState('idle');
    }
  }

  const scanningContent = (
    <div className="d-flex align-items-center gap-3 py-2">
      <div className="spinner-border spinner-border-sm text-info" />
      <span className="text-secondary">סורק את יומן הראיות... אנא המתן</span>
    </div>
  );

  const secureContent = result && (
    <div className="alert alert-success mb-0 py-2">
      <div className="d-flex align-items-center gap-2 mb-1">
        <span>🔒</span>
        <strong>שרשרת תקינה — לא זוהה שיבוש</strong>
      </div>
      <small className="text-muted">
        נבדקו {result.checkedCount.toLocaleString()} רשומות ·{' '}
        {new Date(result.verifiedAt).toLocaleTimeString('he-IL')}
      </small>
    </div>
  );

  const compromisedContent = result && (
    <div className="alert alert-danger mb-0 py-2">
      <div className="d-flex align-items-center gap-2 mb-1">
        <span>⚠️</span>
        <strong>CRITICAL: זוהה שיבוש בנתונים!</strong>
      </div>
      <p className="mb-1 small">{result.message}</p>
      {result.brokenAt && (
        <code className="d-block small chain-auditor-break-all">
          רשומה #{result.brokenAt.index} · ID: {result.brokenAt.id}
        </code>
      )}
    </div>
  );

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span>⛓️</span>
          <span>בדיקת תקינות יומן ראיות (Hash-Chain)</span>
        </div>
        <button
          className={`btn btn-sm ${state === 'compromised' ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => void runAudit()}
          disabled={state === 'scanning'}
        >
          {state === 'scanning' ? (
            <><span className="spinner-border spinner-border-sm me-1" />סורק...</>
          ) : (
            'הרץ בדיקת תקינות'
          )}
        </button>
      </div>

      <div className="card-body">
        {state === 'idle' && (
          <p className="text-secondary small mb-0">
            בדיקה זו מאמתת שאף אחד לא שינה רשומות ב-VisionLog — כל רשומה קשורה לקודמתה באמצעות SHA-256.
          </p>
        )}
        {state === 'scanning' && scanningContent}
        {state === 'secure' && secureContent}
        {state === 'compromised' && compromisedContent}
        {error && <div className="alert alert-warning mb-0 mt-2 py-2 small">{error}</div>}
      </div>
    </div>
  );
}
