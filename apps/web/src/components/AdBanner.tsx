/**
 * באנר פרסומי חכם – ספקי שירות מורשים.
 * מופיע בפיד הדייר: סטטוס בניין → הודעות ועד → באנר.
 * לחיצה על "הזמן עכשיו" פותחת קריאת שירות.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface AdBannerProps {
  title?: string;
  subtitle?: string;
  discount?: string;
  supplierName?: string;
  ctaLabel?: string;
  isEmergency?: boolean;
  /** תגית "בחסות" – בסגנון Mockup */
  showSponsoredBadge?: boolean;
  /** Trusted Badge – סימן וי ירוק: "ספק נבדק על ידי מערכת האבטחה" */
  showTrustedBadge?: boolean;
}

const DEFAULT_AD = {
  title: 'צריך חשמלאי?',
  subtitle: 'מומחה לבניין שלכם',
  discount: '10% הנחה לדיירי האפליקציה',
  supplierName: 'משה כהן',
  ctaLabel: 'הזמן עכשיו',
};

const ResidentFeedAdBanner: React.FC<AdBannerProps> = ({
  title = DEFAULT_AD.title,
  subtitle = DEFAULT_AD.subtitle,
  discount = DEFAULT_AD.discount,
  supplierName = DEFAULT_AD.supplierName,
  ctaLabel = DEFAULT_AD.ctaLabel,
  isEmergency = false,
  showSponsoredBadge = true,
  showTrustedBadge = true,
}) => {
  const navigate = useNavigate();

  const handleCta = () => {
    navigate('/repair-tracking');
  };

  return (
    <div
      className={`ad-banner ${isEmergency ? 'ad-banner-emergency' : ''}`}
      role="banner"
      aria-label={isEmergency ? 'באנר חירום – זוהתה תקלה במבנה' : `פרסומת – ${supplierName}`}
    >
      <div className="ad-banner-content">
        <div className="ad-banner-text">
          {showSponsoredBadge && <span className="ad-banner-badge">בחסות</span>}
          <strong>{title}</strong>
          <span className="ad-banner-supplier">{supplierName}</span>
          {subtitle && <span className="ad-banner-subtitle"> – {subtitle}</span>}
          {discount && <span className="ad-banner-discount">. {discount}</span>}
        </div>
        {showTrustedBadge && (
          <span className="ad-banner-trusted" title="ספק נבדק על ידי מערכת האבטחה של The Shield">
            <span className="ad-banner-trusted-check" aria-hidden>✓</span>
          </span>
        )}
        <button
          type="button"
          className="ad-banner-cta"
          onClick={handleCta}
          aria-label={ctaLabel}
        >
          {isEmergency ? 'הזמן טכנאי חירום' : ctaLabel}
        </button>
      </div>
    </div>
  );
};

export default ResidentFeedAdBanner;
