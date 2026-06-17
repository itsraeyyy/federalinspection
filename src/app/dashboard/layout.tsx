'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Force webpack rebuild to pick up the .tsx extension
import { AdminProvider, useAdmin } from '@/lib/hooks/useAdmin';
import { supabase } from '@/lib/supabaseClient';

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAdmin();
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setAuthChecking(false);
      }
    });
  }, [router]);

  if (loading || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="animate-pulse text-slate-500">Loading Admin Portal...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="text-center p-8 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You do not have an active admin profile associated with this account.</p>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm border border-red-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </AdminProvider>
  );
}
