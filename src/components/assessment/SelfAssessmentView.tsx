'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SELF_ASSESSMENT_QUESTIONS } from '@/lib/assessment-data';

export function SelfAssessmentView({ periodId, existingData, readOnly = false }: { periodId: string, existingData: any, readOnly?: boolean }) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>(existingData?.responses || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Compute total score
  let totalRawScore = 0;
  let totalAnswered = 0;
  let totalQuestions = 0;

  SELF_ASSESSMENT_QUESTIONS.forEach(category => {
    category.questions.forEach(q => {
      totalQuestions++;
      if (responses[q.question_id] !== undefined) {
        totalAnswered++;
        // Score (C) = A × B
        totalRawScore += q.weight * responses[q.question_id];
      }
    });
  });

  // For Form 1 (ቅፅ-1) - Out of 10: The raw score is simply converted into a 10% scale by dividing the total raw score by 10.
  const finalScore10 = totalRawScore / 10;
  const displayScore = finalScore10.toFixed(2);
  const allAnswered = totalAnswered === totalQuestions;

  const handleScoreChange = (qId: string, score: number) => {
    if (readOnly) return;
    setResponses(prev => ({ ...prev, [qId]: score }));
  };

  const handleSave = async (lock: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload = {
        period_id: periodId,
        user_id: session.user.id,
        responses,
        score_10: parseFloat(displayScore),
        is_locked: lock
      };

      const { error: upsertError } = await supabase
        .from('self_assessments')
        .upsert(payload, { onConflict: 'period_id, user_id' });

      if (upsertError) throw upsertError;

      if (lock) {
        window.location.reload();
      } else {
        showToast('በተሳካ ሁኔታ ተቀምጧል (Draft saved successfully)', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save assessment');
      showToast('ማስቀመጥ አልተሳካም (Failed to save)', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col items-center p-4 sm:p-6 lg:p-12 relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-medium shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl w-full">
        <div className="mb-10 mt-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-brand-blue/10 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-heading text-text-primary tracking-tight mb-3">የራስ ግምገማ <span className="text-brand-blue text-2xl ml-2 font-sans font-medium">(Self Assessment)</span></h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            {readOnly ? 'ይህ ያቀረቡት የራስዎ ግምገማ ነው። (This is your submitted self assessment.)' : 'እባክዎን ከታች ያሉትን መስፈርቶች መሰረት በማድረግ እራስዎን ይገምግሙ።'}
            <span className="block mt-2 font-medium bg-surface-secondary inline-block px-4 py-1.5 rounded-full text-sm">
              <span className="text-danger mr-1">1 = በጣም ደካማ</span> | <span className="text-success ml-1">5 = በጣም ጥሩ</span>
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8 mb-24">
          {SELF_ASSESSMENT_QUESTIONS.map((category) => (
            <div key={category.category_id} className="premium-card overflow-hidden border border-border/60 shadow-md hover:shadow-lg transition-shadow bg-surface-primary">
              <div className="bg-gradient-to-r from-surface-secondary to-background px-6 py-5 border-b border-border/60 flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-text-primary">
                  {category.category_id}. {category.category_name}
                </h2>
                <span className="text-sm font-medium bg-surface-primary px-3 py-1 rounded-full text-text-secondary shadow-sm border border-border/50">
                  ክብደት: {category.total_weight}
                </span>
              </div>
              <div className="divide-y divide-border/40">
                {category.questions.map((q) => (
                  <div key={q.question_id} className="p-6 transition-colors hover:bg-surface-secondary/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                      <p className="text-[15px] font-medium text-text-primary leading-relaxed flex-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue text-xs mr-3 shrink-0">
                          {q.question_id.split('.')[1]}
                        </span>
                        {q.criteria}
                      </p>
                      <span className="text-xs font-semibold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-md shrink-0 border border-brand-blue/20">
                        ክብደት: {q.weight}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex justify-between w-full px-2 mb-2 text-xs text-text-muted font-medium">
                        <span>1 (ደካማ)</span>
                        <span>5 (ጥሩ)</span>
                      </div>
                      <div className="flex gap-2 sm:gap-3">
                        {[1, 2, 3, 4, 5].map((score) => {
                          const isSelected = responses[q.question_id] === score;
                          return (
                            <button
                              key={score}
                              onClick={() => handleScoreChange(q.question_id, score)}
                              className={`flex-1 relative h-12 rounded-xl text-base font-semibold transition-all duration-200 transform ${
                                isSelected
                                  ? 'bg-brand-blue text-white shadow-lg scale-105 ring-2 ring-brand-blue ring-offset-2 ring-offset-background'
                                  : 'bg-surface-secondary text-text-secondary border border-border/60'
                              } ${!readOnly && !isSelected ? 'hover:bg-border/80 hover:text-text-primary' : ''} ${readOnly ? 'cursor-default' : ''}`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40 sm:sticky sm:bottom-4 sm:bg-surface-primary sm:rounded-2xl sm:border sm:shadow-2xl sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20">
                <span className="text-brand-yellow font-bold text-lg">★</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">አጠቃላይ ውጤት (Total Score)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-heading font-bold text-text-primary">{displayScore}</span>
                  <span className="text-lg font-medium text-text-muted">/ 10</span>
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-auto">
              {!allAnswered ? (
                <div className="bg-warning/10 text-warning px-4 py-2 rounded-lg text-sm font-medium text-center border border-warning/20">
                  {totalQuestions - totalAnswered} ጥያቄዎች ይቀራሉ (Remaining)
                </div>
              ) : (
                <div className="bg-success/10 text-success px-4 py-2 rounded-lg text-sm font-medium text-center border border-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> ሁሉም ተመልሷል (Complete)
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 sm:gap-4 max-w-3xl mx-auto">
            {readOnly ? (
              <div className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-text-secondary bg-surface-secondary border border-border flex items-center justify-center">
                ይህ ግምገማ ተቆልፏል (This assessment is locked)
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-text-primary bg-surface-secondary hover:bg-border transition-colors disabled:opacity-50 border border-border flex items-center justify-center"
                >
                  አስቀምጥ (Save Draft)
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading || !allAnswered}
                  className="flex-[2] flex items-center justify-center py-3.5 px-4 rounded-xl font-semibold text-white bg-brand-blue disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:bg-brand-blue/90"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  ቆልፍ እና ላክ (Lock & Submit)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
