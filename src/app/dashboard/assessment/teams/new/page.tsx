'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Calendar, LayoutTemplate, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createAssessmentPeriodAction } from '@/app/actions/assessment';

export default function CreatePeriodPage() {
  const router = useRouter();
  const [year, setYear] = useState('2019');
  const [periodHalf, setPeriodHalf] = useState('1st');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const periodName = `${year} ዓ.ም - ${periodHalf === '1st' ? '1ኛ መንፈቀ አመት' : '2ኛ መንፈቀ አመት'}`;

    const { success, data, error: submitError } = await createAssessmentPeriodAction(periodName, year, periodHalf);

    if (!success) {
      setError(submitError || 'የምዘና ጊዜ መፍጠር አልተሳካም። (Failed to create period)');
      setLoading(false);
      return;
    }

    router.push(`/dashboard/assessment/teams/${data.id}`);
  };

  return (
    <DashboardLayout>
      <div className="container-site max-w-4xl mx-auto py-8">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-center text-center">
          <Link 
            href="/dashboard/assessment" 
            className="inline-flex items-center text-sm font-medium text-text-muted hover:text-brand-blue transition-colors mb-6 bg-surface-secondary px-4 py-2 rounded-full border border-border/50 hover:border-brand-blue/30 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            ወደ ዳሽቦርድ ተመለስ (Back)
          </Link>
          
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-blue/20 to-brand-blue/5 rounded-2xl flex items-center justify-center mb-6 border border-brand-blue/10 shadow-inner">
            <LayoutTemplate className="w-8 h-8 text-brand-blue" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-heading font-bold text-text-primary mb-3 tracking-tight">
            አዲስ የምዘና ጊዜ ፍጠር
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium">
            ለግምገማ እና የውጤት አሰጣጥ አዲስ የምዘና ጊዜ ያዘጋጁ። ትክክለኛውን ዓ.ም እና መንፈቀ አመት ይምረጡ።
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-brand-blue/5 to-transparent rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
          
          <div className="relative bg-surface-primary/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue via-brand-blue/80 to-brand-blue/40"></div>
            
            <div className="p-8 md:p-10">
              {error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 text-red-600 dark:text-red-400 text-sm font-medium rounded-r-xl flex items-start animate-in fade-in slide-in-from-top-2">
                  <div className="mr-3 mt-0.5">•</div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-6">
                  {/* Year Input */}
                  <div className="space-y-3">
                    <label htmlFor="year" className="flex items-center text-sm font-semibold text-text-primary uppercase tracking-wider">
                      <Calendar className="w-4 h-4 mr-2 text-brand-blue" />
                      ዓ.ም (Year)
                    </label>
                    <div className="relative">
                      <input
                        id="year"
                        type="text"
                        required
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-5 py-4 bg-surface-secondary/50 border border-border/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all duration-300 font-medium text-lg hover:border-border"
                        placeholder="2019"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50 pointer-events-none font-medium">
                        ዓ.ም
                      </div>
                    </div>
                  </div>

                  {/* Period Half Selection */}
                  <div className="space-y-3">
                    <label htmlFor="periodHalf" className="flex items-center text-sm font-semibold text-text-primary uppercase tracking-wider">
                      <LayoutTemplate className="w-4 h-4 mr-2 text-brand-blue" />
                      መንፈቀ አመት (Period Half)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex items-center justify-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${periodHalf === '1st' ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-border/80 bg-surface-secondary/50 text-text-secondary hover:border-border hover:bg-surface-secondary'}`}>
                        <input 
                          type="radio" 
                          name="periodHalf" 
                          value="1st" 
                          checked={periodHalf === '1st'}
                          onChange={() => setPeriodHalf('1st')}
                          className="sr-only"
                        />
                        <span className="font-semibold text-center">
                          1ኛ መንፈቀ አመት
                          <span className="block text-xs font-normal opacity-70 mt-1">First Half</span>
                        </span>
                        {periodHalf === '1st' && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-blue"></div>
                        )}
                      </label>

                      <label className={`relative flex items-center justify-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${periodHalf === '2nd' ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-border/80 bg-surface-secondary/50 text-text-secondary hover:border-border hover:bg-surface-secondary'}`}>
                        <input 
                          type="radio" 
                          name="periodHalf" 
                          value="2nd" 
                          checked={periodHalf === '2nd'}
                          onChange={() => setPeriodHalf('2nd')}
                          className="sr-only"
                        />
                        <span className="font-semibold text-center">
                          2ኛ መንፈቀ አመት
                          <span className="block text-xs font-normal opacity-70 mt-1">Second Half</span>
                        </span>
                        {periodHalf === '2nd' && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-blue"></div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-text-muted font-medium flex-1 text-center sm:text-left">
                    ከፈጠሩ በኋላ <span className="text-brand-blue">ገምጋሚዎችን መመደብ</span> ይችላሉ።
                  </p>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/assessment')}
                      className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-medium text-text-secondary bg-surface-secondary hover:bg-border/50 hover:text-text-primary transition-all border border-transparent shadow-sm"
                    >
                      ሰርዝ
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !year}
                      className="flex-1 sm:flex-none flex items-center justify-center bg-brand-blue text-white px-8 py-3.5 rounded-2xl font-semibold transition-all hover:bg-brand-blue/90 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-brand-blue/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <PlusCircle className="w-5 h-5 mr-2" strokeWidth={2.5} />
                      )}
                      ፍጠር (Create)
                    </button>
                  </div>
                </div>
                
              </form>
            </div>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
