import React, { useEffect } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import './LegalPolicyPages.css';

const PrivacyPolicy: React.FC = () => {
  const { t, dir } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);

  const intro = t('privacy_intro');
  const rightsTitle = t('privacy_rights');
  const rightsText = t('privacy_rights_text');

  return (
    <div className="legal-policy-page">
      <div className="container mt-5 py-4" dir={dir} style={{ maxWidth: '800px' }}>
        <div className="d-flex flex-column align-items-center">
        <h1 className="text-center mb-4">{t('privacy_title')}</h1>
        {intro && (
          <div className="w-100 mb-4">
            <p className="text-center">{intro}</p>
          </div>
        )}
        <div className="w-100 mb-4">
          <h4 className="text-center">{t('privacy_what')}</h4>
          <p className="text-center">{t('privacy_what_list')}</p>
        </div>
        <div className="w-100 mb-4">
          <h4 className="text-center">{t('privacy_how')}</h4>
          <p className="text-center">{t('privacy_how_text')}</p>
        </div>
        <div className="w-100 mb-4">
          <h4 className="text-center">{t('privacy_share')}</h4>
          <p className="text-center">{t('privacy_share_text')}</p>
        </div>
        {rightsTitle && rightsText && (
          <div className="w-100 mb-4">
            <h4 className="text-center">{rightsTitle}</h4>
            <p className="text-center">{rightsText}</p>
          </div>
        )}
        <div className="w-100">
          <h4 className="text-center">{t('privacy_changes')}</h4>
          <p className="text-center">{t('privacy_changes_text')}</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PrivacyPolicy;
