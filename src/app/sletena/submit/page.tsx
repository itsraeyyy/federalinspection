'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubmissionForm } from '@/components/sletena/SubmissionForm';
import { INITIAL_TRAINING_CATEGORIES } from '@/data/sletenaDirectives';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import Image from 'next/image';

import { sletenaService } from '@/services/sletena';
import { IconLock, IconAlertTriangle } from '@tabler/icons-react';

function PublicNeedFormContent() {
  const searchParams = useSearchParams();
  const catId = searchParams.get('cat');

  const [categories, setCategories] = useState<TrainingCategory[]>(INITIAL_TRAINING_CATEGORIES);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const fetched = await sletenaService.getNeedCategories();
        if (fetched && fetched.length > 0) {
          setCategories(fetched);
        }
      } catch (e) {
        console.error('Failed to load sletena need categories:', e);
      }
    }
    loadCategories();
  }, []);

  // Find requested category or default to first
  const activeCategory = categories.find((c) => c.id === catId) || categories[0];

  const handleSubmitted = (submission: SletenaSubmission) => {
    console.log('[Public Need Form Submitted]:', submission);
  };

  // If form is closed/inactive, show official end notice
  if (activeCategory && !activeCategory.isActive) {
    return (
      <div className="min-h-screen bg-surface-secondary/30 py-12 px-4 font-sans text-text-primary flex items-center justify-center">
        <div className="max-w-md w-full bg-surface-primary border border-border/60 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-sm">
            <IconLock size={32} />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full text-[11px] font-black uppercase tracking-wider">
              ተዘግቷል (OFF / INACTIVE)
            </span>
            <h2 className="text-xl font-black text-text-primary pt-2">
              የቅጽ መሙያ ጊዜው ተጠናቋል
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              ይህ የስልጠና ፍላጎት መሙያ ቅጽ (<strong>{activeCategory.title}</strong>) በአሁኑ ወቅት የተዘጋ (Inactive) በመሆኑ አዲስ ምላሽ መቀበል አቁሟል።
            </p>
          </div>
          <footer className="text-[11px] text-text-muted pt-2 border-t border-border/30">
            © 2018 ICODiS — የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary/30 py-8 px-4 font-sans text-text-primary">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Google Form-style Public Header Banner */}
        <div className="bg-gradient-to-r from-brand-blue via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 text-9xl font-black select-none">
            ICODiS
          </div>
          <div className="flex items-center gap-3.5">
            <Image
              src="/logo.jpg"
              alt="Commission Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-white/40 shadow-sm"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black leading-tight">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት የስልጠና ፍላጎት ማሰበሰቢያ ቅጽ</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            ጊዜዎን ሰተው ስለሚሞሉ እናመሰግናለን
          </p>
        </div>

        {/* Public Submission Form */}
        <SubmissionForm
          category={activeCategory}
          onBack={() => { window.location.href = '/'; }}
          onSubmitSuccess={handleSubmitted}
        />

        {/* Clean Footer */}
        <footer className="text-center text-[11px] text-text-muted py-4 space-y-1">
          <p>© 2018 ICODiS</p>
          <p>የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</p>
        </footer>
      </div>
    </div>
  );
}

export default function PublicNeedFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">ቅጹ በመጫን ላይ ነው...</div>}>
      <PublicNeedFormContent />
    </Suspense>
  );
}
