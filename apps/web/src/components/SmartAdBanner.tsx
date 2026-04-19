/**
 * SmartAdBanner — fetches a live CPC/CPA ad from the API and renders AdBanner.
 * Falls back to the default static ad if the API returns nothing.
 * Tracks CPC click when user taps "הזמן עכשיו".
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getApiHeaders } from '../api';

interface AdData {
  _id: string;
  title: string;
  subtitle?: string;
  discount?: string;
  supplierName: string;
  supplierPhone?: string;
  isEmergency: boolean;
}

const DEFAULT_AD: AdData = {
  _id: '',
  title: 'צריך חשמלאי?',
  subtitle: 'מומחה לבניין שלכם',
  discount: '10% הנחה לדיירי האפליקציה',
  supplierName: 'משה כהן',
  isEmergency: false,
};

interface SmartAdBannerProps {
  specialty?: string;
  showSponsoredBadge?: boolean;
  showTrustedBadge?: boolean;
}

const SmartAdBanner: React.FC<SmartAdBannerProps> = ({
  specialty,
  showSponsoredBadge = true,
  showTrustedBadge = true,
}) => {
  const [ad, setAd] = useState<AdData>(DEFAULT_AD);
  const navigate = useNavigate();

  useEffect(() => {
    const sp = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
    fetch(getApiUrl(`ads${sp}`), { headers: getApiHeaders() })
      .then((res) => (res.ok ? (res.json() as Promise<AdData | null>) : null))
      .then((data) => { if (data) setAd(data); })
      .catch(() => { /* keep default */ });
  }, [specialty]);

  const handleCta = () => {
    // Record CPC click (fire-and-forget)
    if (ad._id) {
      fetch(getApiUrl(`ads/${ad._id}/click`), {
        method: 'POST',
        headers: getApiHeaders(),
      }).catch(() => { /* silent */ });
    }
    navigate('/repair-tracking');
  };

  return (
    <div
      className={`ad-banner ${ad.isEmergency ? 'ad-banner-emergency' : ''}`}
      role="banner"
      aria-label={ad.isEmergency ? 'באנר חירום – זוהתה תקלה במבנה' : `פרסומת – ${ad.supplierName}`}
    >
      <div className="ad-banner-content">
        <div className="ad-banner-text">
          {showSponsoredBadge && <span className="ad-banner-badge">בחסות</span>}
          <strong>{ad.title}</strong>
          <span className="ad-banner-supplier">{ad.supplierName}</span>
          {ad.subtitle && <span className="ad-banner-subtitle"> – {ad.subtitle}</span>}
          {ad.discount && <span className="ad-banner-discount">. {ad.discount}</span>}
        </div>
        {showTrustedBadge && (
          <span className="ad-banner-trusted" title="ספק נבדק על ידי מערכת האבטחה של The Shield">
            <span className="ad-banner-trusted-check" aria-hidden="true">✓</span>
          </span>
        )}
        <button
          type="button"
          className="ad-banner-cta"
          onClick={handleCta}
          aria-label={ad.isEmergency ? 'הזמן טכנאי חירום' : 'הזמן עכשיו'}
        >
          {ad.isEmergency ? 'הזמן טכנאי חירום' : 'הזמן עכשיו'}
        </button>
      </div>
    </div>
  );
};

export default SmartAdBanner;
