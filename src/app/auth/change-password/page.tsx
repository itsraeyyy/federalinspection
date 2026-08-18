'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, KeyRound, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { changePasswordSelfAction } from '@/app/actions/auth';

export default function AdminChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const checkPasswordStrength = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
    };
  };

  const strength = checkPasswordStrength(password);
  const isStrong = Object.values(strength).every(Boolean);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const needsPasswordChange = 
        session.user?.user_metadata?.force_password_change || 
        session.user?.user_metadata?.requires_password_change;

      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('requires_password_change, role')
        .eq('id', session.user.id)
        .maybeSingle();

      const profileNeedsChange = profile?.requires_password_change;

      if (!needsPasswordChange && !profileNeedsChange) {
        if (profile?.role === 'committee_leader') {
          router.push('/complaint/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('የይለፍ ቃል አይመሳሰልም (Passwords do not match)');
      return;
    }
    
    if (!isStrong) {
      setErrorMsg('የይለፍ ቃሉ የደህንነት መስፈርቶችን አያሟላም (Password does not meet security requirements)');
      return;
    }

    setLoading(true);

    try {
      // Determine destination route based on admin role
      const { data: { user } } = await supabase.auth.getUser();
      let targetUrl = '/dashboard';
      if (user) {
        const { data: profile } = await supabase
          .from('admin_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role === 'committee_leader') {
          targetUrl = '/complaint/dashboard';
        }
      }

      // 1. Try server action first for maximum reliability
      const res = await changePasswordSelfAction(password);

      if (res?.success) {
        setSuccessMsg('የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል። ወደ ዳሽቦርድ በመግባት ላይ... (Password updated successfully! Redirecting...)');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1200);
        return;
      }

      // 2. Fallback to client-side auth update
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { force_password_change: false, requires_password_change: false }
      });

      if (updateError) {
        if (updateError.message.includes('Auth session missing')) {
          throw new Error('የመለያ ክፍለ ጊዜ አልተገኘም። እባክዎ ከገጹ ወጥተው እንደገና ይግቡ (Session expired. Please sign in again)');
        }
        throw updateError;
      }

      // 3. Update admin_profiles table
      if (user) {
        await supabase
          .from('admin_profiles')
          .update({ requires_password_change: false })
          .eq('id', user.id);
      }

      setSuccessMsg('የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል። ወደ ዳሽቦርድ በመግባት ላይ... (Password updated successfully! Redirecting...)');

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1200);

    } catch (error: any) {
      console.error('Error updating password:', error);
      setErrorMsg(error.message || 'የይለፍ ቃል መቀየር አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] p-4 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-[28px] shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 rounded-2xl mb-5 flex items-center justify-center shadow-sm">
              <KeyRound className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
              የይለፍ ቃል ይቀይሩ
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              ለደህንነትዎ ሲባል መጀመሪያ ሲገቡ የይለፍ ቃልዎን መቀየር አለብዎት<br />
              <span className="text-xs opacity-75">(You must change your password on your first login)</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300" htmlFor="newPassword">
                  አዲስ የይለፍ ቃል (New Password)
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                  የይለፍ ቃል ያረጋግጡ (Confirm Password)
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Strength Indicators */}
            {password.length > 0 && (
              <div className="p-3.5 bg-slate-50 dark:bg-[#18181b] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs space-y-1.5">
                <div className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  የይለፍ ቃል መስፈርቶች (Security Requirements):
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 dark:text-slate-400">
                  <div className={`flex items-center gap-1.5 ${strength.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                    {strength.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    ቢያንስ 8 ፊደላት (Min 8 chars)
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                    {strength.uppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    ትልቅ ፊደል (Uppercase)
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.lowercase ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                    {strength.lowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    ትንሽ ፊደል (Lowercase)
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.number ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                    {strength.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    ቁጥር (Number 0-9)
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.special ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                    {strength.special ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    ልዩ ምልክት (Special char)
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isStrong}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              ቀይር እና ግባ (Change & Sign In)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
