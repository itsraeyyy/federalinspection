'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SatisfactionSubmissionForm } from '@/components/sletena/SatisfactionSubmissionForm';
import { INITIAL_SATISFACTION_CATEGORIES } from '@/data/sletenaDirectives';
import { TrainingCategory, SatisfactionSubmission } from '@/types/sletena';

function PublicSatisfactionFormContent() {
  const searchParams = useSearchParams();
  const catId = searchParams.get('cat');

  const [categories] = useState<TrainingCategory[]>(INITIAL_SATISFACTION_CATEGORIES);

  // Find requested satisfaction category or default to first
  const activeCategory = categories.find((c) => c.id === catId) || categories[0];

  const handleSubmitted = (submission: SatisfactionSubmission) => {
    console.log('[Public Satisfaction Form Submitted]:', submission);
  };

  return (
    <div className="min-h-screen bg-surface-secondary/30 py-8 px-4 font-sans text-text-primary">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Google Form-style Public Header Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 text-9xl font-black select-none">
            ⭐
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                ድህረ-ስልጠና የዕርካታ ምዘና (Public Evaluation Form)
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-1">የስልጠና ዕርካታ መሙያ ቅጽ</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-2xl">
            በቅርቡ በወሰዱት ስልጠና ላይ ያሎትን ዕርካታ፣ የአሰልጣኞች ብቃት እና የመስተንግዶ ሁኔታ ይገምግሙ። ቅጹን ለመሙላት መግባት (Login) አያስፈልግም።
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
          <p>© 2026 Federal Inspection Authority - Post-Training Evaluation Portal</p>
          <p>የፌደራል ፍተሻ ባለስልጣን - የድህረ-ስልጠና ዕርካታ ምዘና</p>
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
