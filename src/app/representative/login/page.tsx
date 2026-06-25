"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconForms, IconLoader2, IconPhone, IconLock } from "@tabler/icons-react";
import { createBrowserClient } from "@supabase/ssr";
import { resolveLoginEmail, verifyLoginAttempt } from "@/app/actions/auth";

export default function FormsLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await verifyLoginAttempt();
      const { email: authEmail } = await resolveLoginEmail(phone);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (signInError) throw signInError;

      // Check if they are actually a representative
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('system_role')
        .eq('user_id', data.user.id)
        .single();

      if (profile?.system_role !== 'representative') {
        await supabase.auth.signOut();
        throw new Error("Access Denied: You are not a registered representative.");
      }

      router.push("/representative/dashboard"); // They will be redirected here or where appropriate
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-yellow/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="premium-card p-8 sm:p-10 relative overflow-hidden shadow-2xl border border-border-light rounded-[24px]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-brand-blue/20">
              <IconForms size={32} className="text-brand-blue" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2 text-center">
              ተወካይ መግቢያ (Rep Login)
            </h1>
            <p className="text-text-secondary text-center text-sm">
              Please enter your phone number and SMS password to login.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3.5 bg-status-error/10 text-status-error text-sm rounded-xl border border-status-error/20 flex items-start gap-2.5 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-status-error mt-1.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1" htmlFor="phone">
                  ስልክ ቁጥር (Phone Number)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IconPhone size={18} className="text-text-muted" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1" htmlFor="password">
                  የይለፍ ቃል (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IconLock size={18} className="text-text-muted" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? <IconLoader2 size={20} className="animate-spin" /> : "ይግቡ (Sign In)"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-brand-blue transition-colors font-medium"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
