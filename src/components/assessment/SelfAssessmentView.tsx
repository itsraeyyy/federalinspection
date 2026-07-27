'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
      const currentUser: any = (await supabase.auth.getUser()).data?.user || (await supabase.auth.getSession()).data?.session?.user;
      if (!currentUser) throw new Error('ለማስቀመጥ እባክዎ መጀመሪያ ይግቡ (Not authenticated)');

      const payload = {
        period_id: periodId,
        user_id: currentUser.id,
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
      showToast(`ማስቀመጥ አልተሳካም: ${err.message || 'Unknown error'}`, 'error');
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
        <div className="mb-8 mt-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-brand-blue/10 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-heading text-text-primary tracking-tight mb-3">የራስ ግምገማ <span className="text-brand-blue text-2xl ml-2 font-sans font-medium">(Self Assessment)</span></h1>
          
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 max-w-2xl mx-auto mt-4 text-left">
            <h3 className="font-semibold text-brand-blue flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              መመሪያ (Instructions):
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              1. መስፈርቱን ያንብቡ (Read the criteria).<br/>
              2. ከ1 (በጣም ደካማ) እስከ 5 (በጣም ጥሩ) ያለውን ቁጥር ይምረጡ (Select a number from 1 to 5).
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6 mb-32">
          {SELF_ASSESSMENT_QUESTIONS.map((category) => {
            let catAnswered = 0;
            const catTotal = category.questions.length;
            category.questions.forEach(q => {
              if (responses[q.question_id] !== undefined) catAnswered++;
            });
            const catComplete = catAnswered === catTotal;

            return (
              <div key={category.category_id} className="premium-card overflow-hidden border border-border/60 shadow-sm bg-surface-primary rounded-xl">
                <div className="px-5 py-4 flex items-center justify-between bg-surface-secondary/30 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${catComplete ? 'bg-success/10 text-success' : 'bg-surface-secondary text-text-secondary'}`}>
                      {catComplete ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-sm">{category.category_id}</span>}
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-semibold text-text-primary">
                        {category.category_name}
                      </h2>
                    </div>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full ${catComplete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {catAnswered} / {catTotal}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <div className="hidden sm:flex bg-surface-secondary/20 border-b border-border/40 p-3">
                    <div className="w-1/2 pl-5 text-sm font-semibold text-text-secondary">መስፈርት (Criteria)</div>
                    <div className="w-1/2 flex justify-between">
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">1<br/><span className="text-[10px] font-normal text-text-muted">በጣም ዝቅተኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">2<br/><span className="text-[10px] font-normal text-text-muted">ዝቅተኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">3<br/><span className="text-[10px] font-normal text-text-muted">መካከለኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">4<br/><span className="text-[10px] font-normal text-text-muted">ከፍተኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">5<br/><span className="text-[10px] font-normal text-text-muted">በጣም ከፍተኛ</span></div>
                    </div>
                  </div>
                  
                  {category.questions.map((q) => (
                    <div key={q.question_id} className="flex flex-col sm:flex-row border-b border-border/20 hover:bg-surface-secondary/20 transition-colors p-4 sm:p-3 sm:pl-5">
                      <div className="w-full sm:w-1/2 mb-4 sm:mb-0 sm:pr-4 flex items-start">
                        <div className="flex gap-2 w-full">
                          <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded self-start mt-0.5 shrink-0">
                            {q.question_id.split('.')[1]}
                          </span>
                          <span className="text-[14px] sm:text-sm text-text-primary leading-snug">
                            {q.criteria}
                          </span>
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2 flex justify-between items-start bg-surface-secondary/30 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-border/40 sm:border-transparent">
                        {[1, 2, 3, 4, 5].map((score) => {
                          const isSelected = responses[q.question_id] === score;
                          const labels: Record<number, string> = {
                            1: 'በጣም ዝቅተኛ',
                            2: 'ዝቅተኛ',
                            3: 'መካከለኛ',
                            4: 'ከፍተኛ',
                            5: 'በጣም ከፍተኛ'
                          };
                          return (
                            <div key={score} className="flex-1 flex flex-col items-center justify-start" onClick={() => !readOnly && handleScoreChange(q.question_id, score)}>
                              <div className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base transition-all ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105'} ${isSelected ? 'bg-brand-blue text-white shadow-md scale-110' : 'bg-surface-primary sm:bg-surface-secondary text-text-secondary border border-border/60 hover:bg-border/80'}`}>
                                {score}
                              </div>
                              <span className={`sm:hidden text-[9px] text-center mt-1 leading-tight px-0.5 ${isSelected ? 'text-brand-blue font-semibold' : 'text-text-muted font-medium'}`}>
                                {labels[score]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
