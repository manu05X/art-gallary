// Minimal analytics wrapper around Plausible (cookieless, no personal data).
// Everything is a no-op unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number>; u?: string }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export const analyticsDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function trackPageview(url: string): void {
  if (analyticsDomain && typeof window !== 'undefined') {
    window.plausible?.('pageview', { u: url });
  }
}

// Conversion events: offer_submitted, order_created, payment_succeeded, signup.
export function trackEvent(name: string, props?: Record<string, string | number>): void {
  if (analyticsDomain && typeof window !== 'undefined') {
    window.plausible?.(name, props ? { props } : undefined);
  }
}
