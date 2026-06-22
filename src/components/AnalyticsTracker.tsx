'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Exclude admin dashboard activity from analytics
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return;
    }

    // We only want to track once the page is fully loaded
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Fire and forget
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: url,
        referrer: document.referrer || '',
      }),
    }).catch((err) => {
      // Silently catch tracking errors so they don't pollute the console
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
