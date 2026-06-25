'use client';

import { supabase } from '@/lib/supabaseClient';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export function AssessmentHeader() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push('/assessment/login');
    router.refresh();
  };

  if (!session) return null;

  return (
    <div className="w-full bg-surface-primary border-b border-border shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center border border-brand-blue/20">
          <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-heading font-semibold text-text-primary text-lg">የግምገማ ስርዓት</span>
      </div>
      
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-danger bg-surface-secondary hover:bg-danger/10 px-4 py-2 rounded-xl transition-all border border-border/50 hover:border-danger/20 active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">ውጣ</span>
      </button>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="ከሲስተም መውጣት"
        message="እርግጠኛ ነዎት መውጣት ይፈልጋሉ?"
        isDanger={true}
        confirmText="ውጣ"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
