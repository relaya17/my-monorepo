/**
 * Analytics Provider – Google Analytics 4 + Microsoft Clarity.
 * נטען רק כאשר ה-ID מתאימים מוגדרים ב-.env
 *
 * .env:
 *   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *   VITE_CLARITY_PROJECT_ID=xxxxxxxxxx
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined;

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Google Analytics 4 – page_view
  useEffect(() => {
    if (typeof window !== 'undefined' && GA_ID && (window as Window & { gtag?: (...a: unknown[]) => void }).gtag) {
      (window as Window & { gtag: (...a: unknown[]) => void }).gtag('config', GA_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location.pathname, location.search]);

  return <>{children}</>;
}

/** טעינת סקריפטי Analytics ב-index או ב-useEffect. קורא פעם אחת בעליית האפליקציה. */
export function useAnalyticsScripts() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Google Analytics 4
    if (GA_ID) {
      const s1 = document.createElement('script');
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA_ID}');`;
      document.head.appendChild(s2);
    }

    // Microsoft Clarity (חינם, Heatmaps + Session Recordings)
    if (CLARITY_ID) {
      const c = document.createElement('script');
      c.type = 'text/javascript';
      c.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`;
      document.head.appendChild(c);
    }
  }, []);
}
