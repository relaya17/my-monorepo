import React, { useEffect } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

const TermsAndConditions: React.FC = () => {
  const { t, dir } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center container mt-5 py-4"
      style={{ minHeight: '70vh', maxWidth: '800px' }}
      dir={dir}
    >
      <h1 className="mb-4 text-center">{t('terms_title')}</h1>
      <p className="text-center mb-4">{t('terms_intro')}</p>

      <section className="w-100 mb-4">
        <h4>{t('terms_use')}</h4>
        <p>{t('terms_use_text')}</p>
      </section>
      <section className="w-100 mb-4">
        <h4>{t('terms_copyright')}</h4>
        <p>{t('terms_copyright_text')}</p>
      </section>
      <section className="w-100 mb-4">
        <h4>{t('terms_liability')}</h4>
        <p>{t('terms_liability_text')}</p>
      </section>
      <section className="w-100 mb-4">
        <h4>{t('terms_privacy_ref')}</h4>
        <p>{t('terms_privacy_ref_text')}</p>
      </section>
      <section className="w-100 mb-4">
        <h4>{t('terms_changes')}</h4>
        <p>{t('terms_changes_text')}</p>
      </section>
      <section className="w-100">
        <h4>{t('terms_contact')}</h4>
        <p>{t('terms_contact_text')}</p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
