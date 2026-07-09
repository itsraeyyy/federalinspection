'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { IconLoader2, IconKey } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const checkPasswordStrength = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
      notGeneric: !/^(password|12345678|123456789|qwerty|admin|password123)$/i.test(pass),
    };
  };

  const strength = checkPasswordStrength(password);
  const isStrong = Object.values(strength).every(Boolean);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/representative/login');
      } else if (!session.user.user_metadata?.requires_password_change) {
        router.push('/representative/dashboard');
      }
    }
    checkAuth();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('የይለፍ ቃል አይመሳሰልም (Passwords do not match)');
      return;
    }
    
    if (!isStrong) {
      setErrorMsg('የይለፍ ቃሉ ደካማ ነው (Password does not meet security requirements)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { requires_password_change: false }
      });

      if (error) throw error;
      
      // Successfully updated password, navigate to dashboard
      router.push('/representative/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center p-4">
      <div className="bg-surface-primary border border-border-light max-w-md w-full p-8 relative overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-surface-secondary border border-border-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <IconKey className="w-8 h-8 text-brand-blue" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
              የይለፍ ቃል ይቀይሩ
            </h1>
            <p className="text-sm text-text-secondary">
              ለደህንነትዎ ሲባል መጀመሪያ ሲገቡ የይለፍ ቃልዎን መቀየር አለብዎት (You must change your password on your first login)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                አዲስ የይለፍ ቃል (New Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-secondary border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all"
                placeholder="••••••••"
              />
            </div>
            
            {password && (
              <div className="bg-surface-secondary p-3 rounded-lg border border-border-light text-xs space-y-1.5">
                <p className="font-medium text-text-secondary mb-2">የይለፍ ቃል መስፈርቶች (Requirements):</p>
                <div className={`flex items-center gap-2 ${strength.length ? 'text-status-success' : 'text-text-muted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${strength.length ? 'bg-status-success' : 'bg-text-muted'}`} /> ቢያንስ 8 ፊደላት (Min 8 characters)
                </div>
                <div className={`flex items-center gap-2 ${strength.uppercase ? 'text-status-success' : 'text-text-muted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${strength.uppercase ? 'bg-status-success' : 'bg-text-muted'}`} /> ትልቅ ፊደል (Uppercase letter)
                </div>
                <div className={`flex items-center gap-2 ${strength.lowercase ? 'text-status-success' : 'text-text-muted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${strength.lowercase ? 'bg-status-success' : 'bg-text-muted'}`} /> ትንሽ ፊደል (Lowercase letter)
                </div>
                <div className={`flex items-center gap-2 ${strength.number ? 'text-status-success' : 'text-text-muted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${strength.number ? 'bg-status-success' : 'bg-text-muted'}`} /> ቁጥር (Number)
                </div>
                <div className={`flex items-center gap-2 ${strength.special ? 'text-status-success' : 'text-text-muted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${strength.special ? 'bg-status-success' : 'bg-text-muted'}`} /> ልዩ ምልክት (Special character)
                </div>
                {!strength.notGeneric && password.length > 0 && (
                  <div className="flex items-center gap-2 text-status-error mt-2 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-status-error" /> በጣም ቀላል የይለፍ ቃል (Password is too common)
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                የይለፍ ቃል ያረጋግጡ (Confirm Password)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-secondary border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-status-error/10 border border-status-error/20 text-status-error text-sm font-medium rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || !isStrong}
              className="w-full flex items-center justify-center bg-brand-blue text-white px-4 py-3 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-sm"
            >
              {loading ? <IconLoader2 className="w-5 h-5 animate-spin mr-2" /> : 'ቀይር እና ግባ (Change & Sign In)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
