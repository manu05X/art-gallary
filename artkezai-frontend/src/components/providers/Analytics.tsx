'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { analyticsDomain, trackPageview } from '@/lib/analytics';

// Loads Plausible only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is configured and
// records a pageview on every client-side route change.
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackPageview(window.location.origin + pathname);
  }, [pathname]);

  if (!analyticsDomain) return null;
  return (
    <>
      <Script
        id="plausible-queue"
        strategy="afterInteractive"
      >{`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}</Script>
      <Script
        src="https://plausible.io/js/script.manual.js"
        data-domain={analyticsDomain}
        strategy="afterInteractive"
      />
    </>
  );
}
