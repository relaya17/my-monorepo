import React, { useEffect } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import './LegalPolicyPages.css';

const Accessibility: React.FC = () => {
  const { t, dir } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);

  return (
    <div className="legal-policy-page">
      <div className="container mt-5 py-4" dir={dir} style={{ maxWidth: '800px' }}>
      <div className="d-flex flex-column align-items-center">
        <h1 className="text-center mb-4">{t('accessibility_title')}</h1>
        <div className="w-100 mb-4">
          <p className="text-center">{t('accessibility_intro')}</p>
        </div>
        <div className="w-100 mb-4">
          <h4 className="text-center">{t('accessibility_main')}</h4>
          <p className="text-center">{t('accessibility_list')}</p>
        </div>
        <div className="w-100">
          <h4 className="text-center">{t('accessibility_contact')}</h4>
          <p className="text-center">{t('accessibility_contact_text')}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Accessibility;
