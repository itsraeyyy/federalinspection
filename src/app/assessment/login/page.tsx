'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { verifyLoginAttempt } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AssessmentLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // Check rate limit
      await verifyLoginAttempt();

      const cleanPhone = phone.trim();
      const cleanPassword = password.trim();

      // Format phone to E.164
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;
      // Strip '+' from phone for the synthetic email to match how users are created
      const syntheticEmail = `${formattedPhone.replace(/\s+/g, '').replace('+', '')}@federal.local`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: cleanPassword,
      });
      
      if (error) {
        throw new Error(error.message === 'Invalid login credentials' ? 'የተሳሳተ ስልክ ቁጥር ወይም የይለፍ ቃል (Invalid credentials)' : error.message);
      }
      
      // Force change password on first login
      const needsPasswordChange = data.user?.user_metadata?.force_password_change || data.user?.user_metadata?.requires_password_change;
      if (needsPasswordChange) {
        router.push('/assessment/change-password');
      } else {
        router.push('/assessment');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="premium-card max-w-md w-full p-8 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-surface-secondary border border-border rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-8 h-8 text-brand-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                <path d="M7 21h10"/>
                <path d="M12 3v18"/>
                <path d="M3 7h18"/>
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-semibold text-text-primary mb-2">
              ወደ ምዘና ይግቡ
            </h1>
            <p className="text-sm text-text-secondary">
              (Login to Assessment)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
                ስልክ ቁጥር (Phone Number)
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
                placeholder="0911223344"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                  የይለፍ ቃል (Password)
                </label>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-brand-blue hover:underline">
                  {showPassword ? 'ደብቅ (Hide)' : 'አሳይ (Show)'}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone || !password}
              className="w-full flex items-center justify-center bg-brand-blue text-white px-4 py-3 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'ግባ (Sign In)'}
            </button>

            <div className="text-center mt-6">
              <Link href="/assessment/reset-password" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">
                የይለፍ ቃል ረሱ? (Forgot Password?)
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
