import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ROUTES from '../routs/routes';
import SeoHead from '../components/SeoHead';
import { SEO } from '../content/seo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getApiUrl } from '../api';
import landingContent from '../content/landing-pages.json';
import type { RootState } from '../redux/store';
import { RTL_LANGS } from '../i18n/translations';
import './EnterpriseRegisterPage.css';

type LangKey = 'he' | 'en';

type EnterpriseContent = {
  title: string;
  subtitle: string;
  formTitle: string;
  formDesc: string;
  companyNameLabel: string;
  companyNamePlaceholder: string;
  buildingCountLabel: string;
  buildingCountPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  sendingLabel: string;
  profitBoxTitle: string;
  profitBoxAmount: string;
  profitBoxNote: string;
  submitCta: string;
  quickStartTitle: string;
  quickStartSubtitle: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  step3Title: string;
  step3Body: string;
  step4Title: string;
  step4Body: string;
  securityTitle: string;
  securityBody: string;
  successMessage: string;
  errorMessage: string;
  backToLanding: string;
};

const rawContent = landingContent as Record<LangKey, { enterpriseRegister: EnterpriseContent }>;

/**
 * דף רישום B2B – חברות אחזקה.
 * Fintech-style: נקי, מאובטח, מרשים.
 * כולל: טופס חכם, מדריך קבלנים, Time-Boxing.
 */
const EnterpriseRegisterPage: React.FC = () => {
  const appLang = useSelector((state: RootState) => state.settings.language);
  const lang: LangKey = RTL_LANGS.includes(appLang as 'he' | 'ar') || appLang === 'he' ? 'he' : 'en';
  const content = useMemo(() => rawContent[lang]?.enterpriseRegister ?? rawContent.he.enterpriseRegister, [lang]);
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({ companyName: '', buildingCount: 1, phone: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('sending');
    try {
      const res = await fetch(getApiUrl('public/demo-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: form.companyName.trim(),
          companyName: form.companyName.trim(),
          buildingCount: Math.max(1, form.buildingCount),
          phone: form.phone.trim() || undefined,
          source: 'enterprise_register',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success !== false || data.message)) {
        setSubmitStatus('success');
        setForm({ companyName: '', buildingCount: 1, phone: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const steps = [
    { title: content.step1Title, body: content.step1Body },
    { title: content.step2Title, body: content.step2Body },
    { title: content.step3Title, body: content.step3Body },
    { title: content.step4Title, body: content.step4Body },
  ];

  return (
    <div className="enterprise-register-page" dir={dir} lang={lang === 'he' ? 'he' : 'en'}>
      <SeoHead title={SEO.b2b.title} description={SEO.b2b.description} />
      <header className="enterprise-register-header">
        <Link to={ROUTES.LANDING} className="enterprise-back-link">
          {content.backToLanding}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="enterprise-register-main">
        <section className="enterprise-hero">
          <h1>{content.title}</h1>
          <p className="enterprise-subtitle">{content.subtitle}</p>
        </section>

        <div className="enterprise-layout">
          <section className="enterprise-form-section">
            <div className="enterprise-form-card">
              <h3>{content.formTitle}</h3>
              <p className="enterprise-form-desc">{content.formDesc}</p>

              {submitStatus === 'success' ? (
                <p className="enterprise-success">{content.successMessage}</p>
              ) : (
                <form onSubmit={handleSubmit} className="enterprise-form">
                  <div className="enterprise-field">
                    <label htmlFor="companyName">{content.companyNameLabel}</label>
                    <input
                      id="companyName"
                      type="text"
                      placeholder={content.companyNamePlaceholder}
                      value={form.companyName}
                      onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="enterprise-field">
                    <label htmlFor="buildingCount">{content.buildingCountLabel}</label>
                    <input
                      id="buildingCount"
                      type="number"
                      min={1}
                      placeholder={content.buildingCountPlaceholder}
                      value={form.buildingCount || ''}
                      onChange={e => setForm(f => ({ ...f, buildingCount: Number(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                  <div className="enterprise-field">
                    <label htmlFor="phone">{content.phoneLabel}</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder={content.phonePlaceholder}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>

                  <div className="enterprise-profit-box">
                    <p className="enterprise-profit-title">⚡ <b>{content.profitBoxTitle}</b></p>
                    <p className="enterprise-profit-amount">{content.profitBoxAmount}</p>
                    <small>{content.profitBoxNote}</small>
                  </div>

                  {submitStatus === 'error' && (
                    <p className="enterprise-error">{content.errorMessage}</p>
                  )}

                  <button type="submit" className="enterprise-submit-btn" disabled={submitStatus === 'sending'}>
                    {submitStatus === 'sending' ? content.sendingLabel : content.submitCta}
                  </button>
                </form>
              )}
            </div>
          </section>

          <aside className="enterprise-sidebar">
            <section className="enterprise-quick-start">
              <h4>{content.quickStartTitle}</h4>
              <p className="enterprise-quick-start-sub">{content.quickStartSubtitle}</p>
              <ol className="enterprise-steps">
                {steps.map((s, i) => (
                  <li key={i}>
                    <strong>{s.title}</strong>
                    <span>{s.body}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="enterprise-security">
              <h4>{content.securityTitle}</h4>
              <p>{content.securityBody}</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default EnterpriseRegisterPage;
