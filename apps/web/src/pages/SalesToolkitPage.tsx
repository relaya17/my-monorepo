import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import ROUTES from '../routs/routes';
import salesTemplates from '../content/marketing/sales-templates.json';
import './SalesToolkitPage.css';

const LEADS_STORAGE_KEY = 'vantera_sales_leads';

type Lead = { id: string; companyName: string; contactName: string; email: string; phone?: string; notes?: string; createdAt: string };

function getLeads(): Lead[] {
  try {
    const raw = safeGetItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Lead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLeads(leads: Lead[]) {
  safeSetItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
}

const SalesToolkitPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ companyName: '', contactName: '', email: '', phone: '', notes: '' });
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profit' | 'letter' | 'elevator' | 'onboarding' | 'punch' | 'leads' | 'model' | 'pitch'>('profit');

  useEffect(() => {
    const isLoggedIn = safeGetItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate(ROUTES.ADMIN_LOGIN);
      return;
    }
    setLeads(getLeads());
  }, [navigate]);

  const persistLeads = useCallback((updated: Lead[]) => {
    setLeads(updated);
    saveLeads(updated);
  }, []);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.companyName.trim() || !newLead.email.trim()) return;
    const lead: Lead = {
      id: `lead_${Date.now()}`,
      companyName: newLead.companyName.trim(),
      contactName: newLead.contactName.trim(),
      email: newLead.email.trim(),
      phone: newLead.phone.trim() || undefined,
      notes: newLead.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    persistLeads([lead, ...leads]);
    setNewLead({ companyName: '', contactName: '', email: '', phone: '', notes: '' });
    setShowAddLead(false);
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('למחוק את הליד?')) {
      persistLeads(leads.filter(l => l.id !== id));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const openMailto = (to: string, subject: string, body: string) => {
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const letter = salesTemplates.salesLetter as { subject: string; to: string; title: string; body: string };
  const elevator = salesTemplates.elevatorPitch as { goal: string; opening: string; valueProps: string; closing: string };
  const onboarding = salesTemplates.onboardingEmail as { subject: string; body: string; ctaPlaceholder: string };
  const punch = salesTemplates.punchLetter as { subject: string; body: string };
  const widget = salesTemplates.profitWidget as { title: string; total: string; adsLabel: string; adsValue: string; serviceLabel: string; serviceValue: string; withdrawCta: string };
  const revenue = salesTemplates.revenueModel as { title: string; rows: Array<{ actor: string; gives: string; gets: string }>; insight: string };
  const pitchDeck = salesTemplates.pitchDeck as Record<string, { title: string; imageHint: string }>;

  const fullLetterBody = `${letter.title}\n\n${letter.body}`;
  const fullLetterSubject = letter.subject;

  return (
    <div className="sales-toolkit-page" dir="rtl">
      <header className="sales-toolkit-header">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="sales-toolkit-back">
          <i className="fas fa-arrow-right me-2" aria-hidden /> חזרה ללוח הבקרה
        </Link>
        <h1><i className="fas fa-bullhorn me-2" aria-hidden /> כלי מכירה – Vantera</h1>
      </header>

      <nav className="sales-toolkit-tabs">
        {[
          { id: 'profit', label: 'הכנסות מצטברות', icon: 'fa-wallet' },
          { id: 'letter', label: 'מכתב מכירה', icon: 'fa-envelope' },
          { id: 'elevator', label: 'סקריפט שיחה', icon: 'fa-phone-alt' },
          { id: 'onboarding', label: 'מייל דיירים', icon: 'fa-users' },
          { id: 'punch', label: 'מכתב מחץ', icon: 'fa-bolt' },
          { id: 'leads', label: 'מאגר לידים', icon: 'fa-address-book' },
          { id: 'model', label: 'מודל רווח', icon: 'fa-chart-pie' },
          { id: 'pitch', label: 'מצגת', icon: 'fa-presentation' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            className={`sales-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >
            <i className={`fas ${t.icon} me-1`} aria-hidden /> {t.label}
          </button>
        ))}
      </nav>

      <main className="sales-toolkit-main">
        {activeTab === 'profit' && (
          <section className="sales-profit-widget">
            <div className="profit-widget-card">
              <h3>{widget.title}</h3>
              <div className="profit-total">{widget.total}</div>
              <div className="profit-breakdown">
                <div>
                  <span className="profit-label">{widget.adsLabel}</span>
                  <strong>{widget.adsValue}</strong>
                </div>
                <div>
                  <span className="profit-label">{widget.serviceLabel}</span>
                  <strong>{widget.serviceValue}</strong>
                </div>
              </div>
              <button type="button" className="profit-withdraw-btn">{widget.withdrawCta}</button>
            </div>
          </section>
        )}

        {activeTab === 'letter' && (
          <section className="sales-letter-section">
            <div className="sales-letter-card">
              <h3>{letter.title}</h3>
              <p className="sales-letter-meta">אל: {letter.to} | נושא: {letter.subject}</p>
              <pre className="sales-letter-body">{fullLetterBody}</pre>
              <div className="sales-letter-actions">
                <button type="button" className="btn btn-primary" onClick={() => copyToClipboard(fullLetterBody, 'letter')}>
                  <i className="fas fa-copy me-2" aria-hidden /> {copied === 'letter' ? 'הועתק!' : 'העתק מכתב'}
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => openMailto('', fullLetterSubject, fullLetterBody)}
                >
                  <i className="fas fa-paper-plane me-2" aria-hidden /> פתח דואל לשליחה
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'elevator' && (
          <section className="sales-letter-section">
            <div className="sales-letter-card">
              <h3><i className="fas fa-phone-alt me-2" aria-hidden /> Elevator Pitch – שיחה עם מנכ"ל</h3>
              <p className="sales-letter-meta">{elevator.goal}</p>
              <div className="sales-elevator-steps">
                <div className="sales-elevator-block">
                  <strong>הפתיחה:</strong>
                  <pre>{elevator.opening}</pre>
                </div>
                <div className="sales-elevator-block">
                  <strong>הערך המוסף:</strong>
                  <pre>{elevator.valueProps}</pre>
                </div>
                <div className="sales-elevator-block">
                  <strong>הסגירה:</strong>
                  <pre>{elevator.closing}</pre>
                </div>
              </div>
              <div className="sales-letter-actions">
                <button type="button" className="btn btn-primary" onClick={() => copyToClipboard(`${elevator.opening}\n\n${elevator.valueProps}\n\n${elevator.closing}`, 'elevator')}>
                  <i className="fas fa-copy me-2" aria-hidden /> {copied === 'elevator' ? 'הועתק!' : 'העתק סקריפט'}
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'onboarding' && (
          <section className="sales-letter-section">
            <div className="sales-letter-card">
              <h3><i className="fas fa-users me-2" aria-hidden /> מערכת הדיוור – מייל ברוכים הבאים לדיירים</h3>
              <p className="sales-letter-meta">נשלח אוטומטית ברגע שחברת הניהול מוסיפה רשימת דיירים לבניין</p>
              <p className="sales-letter-meta">נושא: {onboarding.subject}</p>
              <pre className="sales-letter-body">{onboarding.body}</pre>
              <p className="small text-muted">החלף את [Link] בקישור להורדת האפליקציה (לפי בניין)</p>
              <div className="sales-letter-actions">
                <button type="button" className="btn btn-primary" onClick={() => copyToClipboard(onboarding.body.replace(onboarding.ctaPlaceholder, 'https://vantera.io/app'), 'onboarding')}>
                  <i className="fas fa-copy me-2" aria-hidden /> {copied === 'onboarding' ? 'הועתק!' : 'העתק תוכן'}
                </button>
                <button type="button" className="btn btn-warning" onClick={() => openMailto('', onboarding.subject, onboarding.body.replace(onboarding.ctaPlaceholder, 'https://vantera.io/app'))}>
                  <i className="fas fa-paper-plane me-2" aria-hidden /> פתח דואל לשליחה
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'punch' && (
          <section className="sales-punch-section">
            <div className="sales-letter-card">
              <h3>מכתב מחץ – שורת פתיחה חזקה</h3>
              <p className="sales-letter-meta">נושא: {punch.subject}</p>
              <pre className="sales-letter-body">{punch.body}</pre>
              <div className="sales-letter-actions">
                <button type="button" className="btn btn-primary" onClick={() => copyToClipboard(punch.body, 'punch')}>
                  <i className="fas fa-copy me-2" aria-hidden /> {copied === 'punch' ? 'הועתק!' : 'העתק'}
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => openMailto('', punch.subject, punch.body)}
                >
                  <i className="fas fa-paper-plane me-2" aria-hidden /> פתח דואל
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'leads' && (
          <section className="sales-leads-section">
            <div className="sales-leads-header">
              <h3>מאגר לידים – חברות אחזקה</h3>
              <button type="button" className="btn btn-primary" onClick={() => setShowAddLead(true)}>
                <i className="fas fa-plus me-2" aria-hidden /> הוסף ליד
              </button>
            </div>

            {showAddLead && (
              <form className="sales-add-lead-form" onSubmit={handleAddLead}>
                <input
                  type="text"
                  placeholder="שם חברת האחזקה *"
                  value={newLead.companyName}
                  onChange={e => setNewLead(n => ({ ...n, companyName: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="שם איש קשר"
                  value={newLead.contactName}
                  onChange={e => setNewLead(n => ({ ...n, contactName: e.target.value }))}
                />
                <input
                  type="email"
                  placeholder="אימייל *"
                  value={newLead.email}
                  onChange={e => setNewLead(n => ({ ...n, email: e.target.value }))}
                  required
                />
                <input
                  type="tel"
                  placeholder="טלפון"
                  value={newLead.phone}
                  onChange={e => setNewLead(n => ({ ...n, phone: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="הערות"
                  value={newLead.notes}
                  onChange={e => setNewLead(n => ({ ...n, notes: e.target.value }))}
                />
                <div>
                  <button type="submit" className="btn btn-success">שמור ליד</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddLead(false)}>ביטול</button>
                </div>
              </form>
            )}

            <div className="sales-leads-list">
              {leads.length === 0 ? (
                <p className="text-muted">אין לידים עדיין. הוסף ליד כדי לשמור ולשלוח מייל.</p>
              ) : (
                leads.map(lead => (
                  <div key={lead.id} className="sales-lead-card">
                    <div className="sales-lead-info">
                      <strong>{lead.companyName}</strong>
                      {lead.contactName && <span> – {lead.contactName}</span>}
                      <br />
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      {lead.phone && <span className="me-2"> | {lead.phone}</span>}
                      {lead.notes && <p className="small text-muted mb-0">{lead.notes}</p>}
                    </div>
                    <div className="sales-lead-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-warning"
                        onClick={() => openMailto(lead.email, fullLetterSubject, fullLetterBody)}
                        title="שלח מכתב מכירה"
                      >
                        <i className="fas fa-paper-plane" aria-hidden />
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteLead(lead.id)} title="מחק">
                        <i className="fas fa-trash" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'model' && (
          <section className="sales-model-section">
            <h3>{revenue.title}</h3>
            <table className="table table-bordered sales-model-table">
              <thead>
                <tr>
                  <th>הגורם</th>
                  <th>מה הוא נותן?</th>
                  <th>מה הוא מקבל?</th>
                </tr>
              </thead>
              <tbody>
                {revenue.rows.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.actor}</strong></td>
                    <td>{r.gives}</td>
                    <td>{r.gets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sales-model-insight">
              <i className="fas fa-lightbulb me-2" aria-hidden />
              {revenue.insight}
            </div>
          </section>
        )}

        {activeTab === 'pitch' && (
          <section className="sales-pitch-section">
            <h3>מצגת משקיעים – Pitch Deck</h3>
            <div className="sales-pitch-slides">
              {['slide1', 'slide2', 'slide3'].map((key, i) => {
                const slide = pitchDeck[key];
                if (!slide) return null;
                return (
                  <div key={key} className="sales-pitch-slide">
                    <strong>שקף {i + 1}:</strong> {slide.title}
                    <span className="sales-pitch-hint">{slide.imageHint}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SalesToolkitPage;
