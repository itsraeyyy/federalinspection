'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubmissionForm } from '@/components/sletena/SubmissionForm';
import { INITIAL_TRAINING_CATEGORIES } from '@/data/sletenaDirectives';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import Image from 'next/image';

function PublicNeedFormContent() {
  const searchParams = useSearchParams();
  const catId = searchParams.get('cat');

  const [categories] = useState<TrainingCategory[]>(INITIAL_TRAINING_CATEGORIES);

  // Find requested category or default to first
  const activeCategory = categories.find((c) => c.id === catId) || categories[0];

  const handleSubmitted = (submission: SletenaSubmission) => {
    console.log('[Public Need Form Submitted]:', submission);
  };

  return (
    <div className="min-h-screen bg-surface-secondary/30 py-8 px-4 font-sans text-text-primary">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Google Form-style Public Header Banner */}
        <div className="bg-gradient-to-r from-brand-blue via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 text-9xl font-black select-none">
            ICODS
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📝</span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                ብሔራዊ የፌደራል ፍተሻ ፖርታል (Public Form)
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-1">የስልጠና ፍላጎት ማሰበሰቢያ ቅጽ</h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            እባክዎን ከዚህ በታች ያሉትን የስልጠና አርዕስቶች ይመልከቱ እና ለአካባቢዎ/ለስራ ክፍልዎ አስፈላጊ የሆኑትን የስልጠና ፍላጎቶች ይሙሉ። ቅጹን ለመሙላት መግባት (Login) አያስፈልግም።
          </p>
        </div>

        {/* Public Submission Form */}
        <SubmissionForm
          category={activeCategory}
          onSubmitSuccess={handleSubmitted}
        />

        {/* Clean Footer */}
        <footer className="text-center text-[11px] text-text-muted py-4 space-y-1">
          <p>© 2026 Federal Inspection Authority - ICODS Training Portal</p>
          <p>የፌደራል ፍተሻ ባለስልጣን - የስልጠና ፍላጎቶች ማሰበሰቢያ</p>
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
