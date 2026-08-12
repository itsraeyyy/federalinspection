'use client';

import { AdminProvider } from '@/lib/hooks/useAdmin';

export default function ComplaintLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
