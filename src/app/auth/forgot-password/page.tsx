'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { maskSupabaseError } from '@/lib/errorMasking';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { sendOtpAction, verifyOtpAction, resetPasswordWithOtpAction } from '@/app/actions/auth';

type Step = 'contact' | 'otp' | 'new_password' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('contact');
  
  // Form states
  const [contact, setContact] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const isPhone = /^\+?[0-9]{9,15}$/.test(contact.trim());
      
      if (isPhone) {
        const result = await sendOtpAction(contact);
        if (result.error) throw new Error(result.error);
        if (result.phone) setFormattedPhone(result.phone);
        
        setSuccessMsg('የማረጋገጫ ኮድ በስልክዎ ተልኳል (OTP sent).');
        setStep('otp');
      } else {
        // Email Flow
        let authEmail = contact;
        if (!authEmail.includes('@')) {
          authEmail = `${authEmail}@federal.local`;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        
        if (error) throw error;
        setSuccessMsg('Check your email for the password reset link.');
        setStep('success');
      }
    } catch (error: any) {
      setErrorMsg(error.message || maskSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await verifyOtpAction(formattedPhone, otp);
      if (result.error) throw new Error(result.error);
      
      setSuccessMsg('ኮዱ ትክክል ነው (OTP Verified). አዲስ የይለፍ ቃል ያስገቡ.');
      setStep('new_password');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMsg("የይለፍ ቃል አይመሳሰልም (Passwords do not match)");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await resetPasswordWithOtpAction(formattedPhone, otp, newPassword);
      if (result.error) throw new Error(result.error);
      
      setSuccessMsg('የይለፍ ቃልዎ ተቀይሯል (Password reset successfully).');
      setStep('success');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] p-4 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#121212] border border-slate-200/60 dark:border-slate-800/60 rounded-[24px] shadow-sm dark:shadow-none transition-all">
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900 dark:text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {step === 'contact' && "Enter your username, email, or phone number to reset your password."}
            {step === 'otp' && "Enter the 6-digit code sent to your phone."}
            {step === 'new_password' && "Create a new password for your account."}
            {step === 'success' && "Password reset process complete."}
          </p>
        </div>

        {step === 'contact' && (
          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="contact">
                Username, Email, or Phone
              </label>
              <input
                id="contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Admin, m@example.com, or 0911..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-900 dark:focus:border-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            
            <ErrorMessage msg={errorMsg} />

            <button
              type="submit"
              disabled={loading || !contact}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-xl text-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Link / Code
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="otp">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-900 dark:focus:border-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-widest text-center text-lg"
              />
            </div>
            
            <SuccessMessage msg={successMsg} />
            <ErrorMessage msg={errorMsg} />

            <button
              type="submit"
              disabled={loading || otp.length < 5}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-xl text-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('contact');
                setOtp('');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </form>
        )}

        {step === 'new_password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-900 dark:focus:border-slate-100"
              />
            </div>
            
            <SuccessMessage msg={successMsg} />
            <ErrorMessage msg={errorMsg} />

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-xl text-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Set New Password
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6">
            <SuccessMessage msg={successMsg} />
            <Link 
              href="/auth/login" 
              className="inline-flex w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-xl text-sm transition-all items-center justify-center shadow-sm"
            >
              Return to Login
            </Link>
          </div>
        )}

        {step !== 'success' && (
          <div className="mt-8 text-center text-sm">
            <Link href="/auth/login" className="font-medium hover:underline text-slate-900 dark:text-slate-100 transition-colors">
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorMessage({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      {msg}
    </div>
  );
}

function SuccessMessage({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 text-left">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
      {msg}
    </div>
  );
}
