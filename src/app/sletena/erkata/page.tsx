'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SatisfactionSubmissionForm } from '@/components/sletena/SatisfactionSubmissionForm';
import { INITIAL_SATISFACTION_CATEGORIES } from '@/data/sletenaDirectives';
import { TrainingCategory, SatisfactionSubmission } from '@/types/sletena';
import Image from 'next/image';

function PublicSatisfactionFormContent() {
  const searchParams = useSearchParams();
  const catId = searchParams.get('cat');

  const [categories, setCategories] = useState<TrainingCategory[]>(INITIAL_SATISFACTION_CATEGORIES);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('icods_sletena_sat_categories_v6');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        } catch (e) {
          console.error('Failed to parse satisfaction categories:', e);
        }
      }
    }
  }, []);

  // Find requested satisfaction category or default to first
  const activeCategory = categories.find((c) => c.id === catId) || categories[0];

  const handleSubmitted = (submission: SatisfactionSubmission) => {
    console.log('[Public Satisfaction Form Submitted]:', submission);
  };

  return (
    <div className="min-h-screen bg-surface-secondary/30 py-8 px-4 font-sans text-text-primary">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Google Form-style Public Header Banner (Identical to Need Form) */}
        <div className="bg-gradient-to-r from-brand-blue via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 text-9xl font-black select-none">
            ICODS
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
              <h1 className="text-xl sm:text-2xl font-black leading-tight">
                የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት የድህረ-ስልጠና ዕርካታ መሙያ ቅጽ
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            ጊዜዎን ሰተው ስለሚሞሉ እናመሰግናለን
          </p>
        </div>

        {/* Public Satisfaction Submission Form */}
        <SatisfactionSubmissionForm
          category={activeCategory}
          onBack={() => {}}
          onSubmitSuccess={handleSubmitted}
        />

        {/* Clean Footer */}
        <footer className="text-center text-[11px] text-text-muted py-4 space-y-1">
          <p>© 2017 ICODiS</p>
          <p>የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</p>
        </footer>
      </div>
    </div>
  );
}

export default function PublicSatisfactionFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">የዕርካታ ቅጹ በመጫን ላይ ነው...</div>}>
      <PublicSatisfactionFormContent />
    </Suspense>
  );
}
