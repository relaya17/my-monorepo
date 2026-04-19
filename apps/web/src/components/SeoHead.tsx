/**
 * SeoHead – מטה-תגים דינמיים ל-SEO לכל עמוד.
 * מעדכן title, meta description, Open Graph ו-Twitter.
 */
import React, { useEffect } from 'react';

export type SeoHeadProps = {
  title: string;
  description: string;
  /** Schema.org JSON-LD – לדוגמה SoftwareApplication */
  schemaJson?: object;
  /** noindex,nofollow – לדפים משפטיים (Mentions Légales, CGU, etc.) */
  noIndex?: boolean;
};

const SeoHead: React.FC<SeoHeadProps> = ({ title, description, schemaJson, noIndex }) => {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);

    let robots = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots && robots.getAttribute('content') === 'noindex, nofollow') {
      robots.remove();
    }
  }, [title, description, noIndex]);

  // Schema.org JSON-LD
  useEffect(() => {
    if (!schemaJson) return;
    const existing = document.getElementById('vantera-schema-jsonld');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'vantera-schema-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaJson);
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('vantera-schema-jsonld');
      if (el) el.remove();
    };
  }, [schemaJson]);

  return null;
};

export default SeoHead;
