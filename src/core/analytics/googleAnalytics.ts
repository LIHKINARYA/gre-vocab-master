/**
 * Google Analytics 4 (GA4) Integration Helper
 * 
 * Safely initializes Google Analytics if VITE_GA_MEASUREMENT_ID is provided
 * in the environment variables (e.g. in Vercel or local .env).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initGoogleAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId || typeof window === 'undefined') {
    return;
  }

  // Avoid injecting script multiple times
  if (document.getElementById('ga-script')) {
    return;
  }

  // Inject Google Tag Manager script
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });
}

/**
 * Custom event tracking helper for vocabulary activities (optional)
 */
export function trackGAEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
