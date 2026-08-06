'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { maskSupabaseError } from '@/lib/errorMasking';
import Link from 'next/link';
import { Loader2, ShieldCheck, FileText } from 'lucide-react';
import { verifyLoginAttempt, resolveLoginEmail } from '@/app/actions/auth';

export default function ComplaintLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Force Reset State
  const [requiresReset, setRequiresReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'unauthorized') {
        setErrorMsg("አካውንትዎ የአድሚን ወይም የኮሚቴ ሰብሳቢ ፈቃድ የለውም ወይም ገቢር (Active) አይደለም።");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Check rate limit first
      const rateLimitCheck = await verifyLoginAttempt();
      if (!rateLimitCheck.success) {
        setErrorMsg(rateLimitCheck.error || "Too many login attempts. Please try again later.");
        setLoading(false);
        return;
      }

      const { email: authEmail } = await resolveLoginEmail(email);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });
      
      if (error) throw error;
      
      if (authData.user) {
        const { data: profile } = await supabase
          .from('admin_profiles')
          .select('requires_password_change, role')
          .eq('id', authData.user.id)
          .single();
          
        if (profile?.requires_password_change) {
          window.location.href = '/auth/change-password';
          return;
        }

        if (profile?.role !== 'committee_leader') {
          await supabase.auth.signOut();
          setErrorMsg("ይህ መግቢያ ለኮሚቴ ሰብሳቢ (Committee Leader) ብቻ የተዘጋጀ ነው። እባክዎ የአስተዳዳሪ መግቢያን ይጠቀሙ።");
          setLoading(false);
          return;
        }

        window.location.href = '/dashboard/committee-leader';
      }
    } catch (error: any) {
      setErrorMsg(maskSupabaseError(error));
      setLoading(false);
    }
  };

  const handleForceReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("የይለፍ ቃሎቹ አይመሳሰሉም።");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("የይለፍ ቃሉ ቢያንስ 8 ቁምፊዎች መሆን አለበት።");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      const { data: { user } } = await supabase.auth.getUser();
      let targetUrl = '/dashboard/complaints';
      if (user) {
        const { data: profile } = await supabase
          .from('admin_profiles')
          .select('requires_password_change, role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'committee_leader') {
          targetUrl = '/dashboard/committee-leader';
        }
        await supabase
          .from('admin_profiles')
          .update({ requires_password_change: false })
          .eq('id', user.id);
      }

      setSuccessMsg("የይለፍ ቃሉ በተሳካ ሁኔታ ተቀይሯል። በማዘዋወር ላይ...");
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1000);
      
    } catch (error: any) {
      setErrorMsg(maskSupabaseError(error));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-4 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-slate-800/80 rounded-[28px] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        <div className="mb-8 text-center">
          <div className="mx-auto w-14 h-14 bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-5 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight font-serif">
            {requiresReset ? 'አዲስ የይለፍ ቃል ያስገቡ' : 'የጥቆማ እና አቤቱታ መግቢያ'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {requiresReset ? 'ለደህንነትዎ ሲባል እባክዎን አዲስ የይለፍ ቃል ይፍጠሩ።' : 'የኮሚቴ ሰብሳቢዎችና አስተዳዳሪዎች ልዩ የስራ መግቢያ'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
            <div className="h-1 w-3 bg-amber-500 rounded-full"></div>
          </div>
        </div>

        {!requiresReset ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                  ስልክ ቁጥር ወይም ኢሜይል
                </label>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="0911000000 ወይም leader@commission.gov"
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    የይለፍ ቃል
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    የይለፍ ቃል ረስተዋል?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2.5">
                <span className="flex-shrink-0 font-bold">!</span>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              ወደ ስርዓቱ ይግቡ
            </button>
          </form>
        ) : (
          <form onSubmit={handleForceReset} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="newPassword">
                  አዲስ የይለፍ ቃል
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                  የይለፍ ቃል ያረጋግጡ
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50/80 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2.5">
                <span className="flex-shrink-0 font-bold">!</span>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2.5">
                <span>✓</span>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              የይለፍ ቃል ያዘጋጁ እና ይቀጥሉ
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
