'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { registerUserAction } from '@/app/actions/auth';

function JoinPeriodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodId = searchParams.get('period_id');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!periodId) {
      setError('Invalid signup link. Period ID is missing.');
    }
  }, [periodId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodId || !fullName || !phone || !password) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('periodId', periodId);
      formData.append('fullName', fullName);
      formData.append('phone', phone);
      formData.append('password', password);

      const result = await registerUserAction(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Registration successful, now log them in
      const { supabase } = await import('@/lib/supabaseClient');
      const formattedPhone = phone.startsWith('+') ? phone : `+251${phone.replace(/^0+/, '').replace(/\s+/g, '')}`;
      const syntheticEmail = `${formattedPhone}@federal.local`;
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: password
      });

      if (signInError) {
        throw new Error('Registration successful but login failed. Please go to login page.');
      }

      router.push('/assessment');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!periodId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="premium-card max-w-md w-full p-8 text-center text-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="premium-card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-semibold text-text-primary mb-2">ምዝገባ (Registration)</h1>
          <p className="text-sm text-text-secondary">
            ለመመዝገብ የሚከተለውን ፎርም ይሙሉ (Fill the form to register)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">ሙሉ ስም (Full Name)</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
              placeholder="አበበ ከበደ (Abebe Kebede)"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">ስልክ ቁጥር (Phone Number)</label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
              placeholder="0911223344"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">የይለፍ ቃል (Password)</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-brand-blue hover:underline">
                {showPassword ? 'ደብቅ (Hide)' : 'አሳይ (Show)'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
              placeholder="ቢያንስ 6 ፊደላት/ቁጥሮች"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !fullName || !phone || password.length < 6}
            className="w-full flex items-center justify-center bg-brand-blue text-white px-4 py-2.5 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'ተመዝገብ (Register)'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinPeriodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    }>
      <JoinPeriodContent />
    </Suspense>
  );
}
