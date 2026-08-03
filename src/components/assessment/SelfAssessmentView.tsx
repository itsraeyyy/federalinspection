'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SELF_ASSESSMENT_QUESTIONS } from '@/lib/assessment-data';

export function SelfAssessmentView({
  periodId,
  existingData,
  readOnly = false,
  onLocked
}: {
  periodId: string,
  existingData: any,
  readOnly?: boolean,
  onLocked?: (savedData: any) => void
}) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>(existingData?.responses || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isLockedLocally, setIsLockedLocally] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isReadOnly = readOnly || isLockedLocally || !!existingData?.is_locked;

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
  const displayScore = finalScore10.toFixed(1);
  const allAnswered = totalAnswered === totalQuestions;

  const handleScoreChange = (qId: string, score: number) => {
    if (isReadOnly) return;
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
        setIsLockedLocally(true);
        setShowSuccessModal(true);
        onLocked?.(payload);
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
    <div className="flex-1 bg-background flex flex-col items-center pt-2 pb-6 px-3 sm:px-6 relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-medium shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl w-full">
        {/* Side-by-Side Header & Detailed Instructions */}
        <div className="mb-4 mt-1 bg-surface-secondary/40 border border-border/60 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-blue/10 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-heading text-text-primary tracking-tight">
                የራስ ምዘና <span className="text-brand-blue text-xs sm:text-sm font-normal font-sans ml-1">(Self Assessment)</span>
              </h1>
              <p className="text-[11px] text-text-muted mt-0.5">ቅፅ-1: የ 10% የራስ አፈጻጸም ምዘና ቅጽ</p>
            </div>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-2.5 sm:p-3 text-xs text-text-secondary max-w-md w-full md:w-auto shrink-0">
            <div className="font-semibold text-brand-blue flex items-center gap-1.5 mb-1 text-xs">
              <Info className="w-3.5 h-3.5" />
              መመሪያ (Instructions):
            </div>
            <ul className="space-y-1 text-[11px] text-text-secondary leading-snug">
              <li>• እያንዳንዱን መስፈርት በጥንቃቄ በማንበብ ከ<b>1 እስከ 5</b> ውጤት ይምረጡ።</li>
              <li className="text-[10px] text-brand-blue font-medium flex flex-wrap gap-1 mt-1">
                <span className="bg-brand-blue/10 px-1.5 py-0.5 rounded">1 = በጣም ዝቅተኛ</span>
                <span className="bg-brand-blue/10 px-1.5 py-0.5 rounded">2 = ዝቅተኛ</span>
                <span className="bg-brand-blue/10 px-1.5 py-0.5 rounded">3 = መካከለኛ</span>
                <span className="bg-brand-blue/10 px-1.5 py-0.5 rounded">4 = ከፍተኛ</span>
                <span className="bg-brand-blue/10 px-1.5 py-0.5 rounded">5 = በጣም ከፍተኛ</span>
              </li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6 mb-48 lg:mb-16">
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
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">1<br /><span className="text-[10px] font-normal text-text-muted">በጣም ዝቅተኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">2<br /><span className="text-[10px] font-normal text-text-muted">ዝቅተኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">3<br /><span className="text-[10px] font-normal text-text-muted">መካከለኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">4<br /><span className="text-[10px] font-normal text-text-muted">ከፍተኛ</span></div>
                      <div className="flex-1 text-center text-xs font-semibold text-text-secondary">5<br /><span className="text-[10px] font-normal text-text-muted">በጣም ከፍተኛ</span></div>
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
                            <div key={score} className="flex-1 flex flex-col items-center justify-start" onClick={() => !isReadOnly && handleScoreChange(q.question_id, score)}>
                              <div className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105'} ${isSelected ? 'bg-brand-blue text-white shadow-md scale-110' : 'bg-surface-primary sm:bg-surface-secondary text-text-secondary border border-border/60 hover:bg-border/80'}`}>
                                {score}
                              </div>
                              <span className={`text-[9px] text-center mt-1 leading-tight px-0.5 ${isSelected ? 'text-brand-blue font-bold' : 'text-text-muted font-medium'}`}>
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

        <div className="fixed bottom-[58px] left-0 right-0 p-3 sm:p-4 bg-surface-primary/95 backdrop-blur-xl border-t border-border/80 z-30 shadow-2xl lg:sticky lg:bottom-4 lg:bg-surface-primary lg:rounded-2xl lg:border lg:p-6">
          <div className="flex items-center justify-between gap-3 mb-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20 shrink-0">
                <span className="text-brand-yellow font-bold text-sm sm:text-lg">★</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-text-secondary leading-tight">አጠቃላይ ውጤት (Total Score)</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-3xl font-heading font-bold text-text-primary">{displayScore}</span>
                  <span className="text-xs sm:text-lg font-medium text-text-muted">/ 10</span>
                </div>
              </div>
            </div>

            <div>
              {!allAnswered ? (
                <div className="bg-warning/10 text-warning px-3 py-1.5 rounded-lg text-xs font-medium text-center border border-warning/20">
                  {totalQuestions - totalAnswered} ይቀራሉ
                </div>
              ) : (
                <div className="bg-success/10 text-success px-3 py-1.5 rounded-lg text-xs font-medium text-center border border-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ተመልሷል
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2.5 sm:gap-4 max-w-3xl mx-auto">
            {isReadOnly ? (
              <div className="flex-1 py-2.5 sm:py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-text-secondary bg-surface-secondary border border-border flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                ይህ ምዘና ተቆልፏል (This assessment is locked)
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex-1 py-2.5 sm:py-3.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-text-primary bg-surface-secondary hover:bg-border transition-colors disabled:opacity-50 border border-border flex items-center justify-center"
                >
                  አስቀምጥ (Draft)
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={loading || !allAnswered}
                  className="flex-[2] flex items-center justify-center py-2.5 sm:py-3.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-brand-blue disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:bg-brand-blue/90"
                >
                  {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-1.5" /> : null}
                  ቆልፍ እና ላክ (Submit)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative w-full max-w-md bg-surface-primary rounded-3xl p-6 sm:p-8 shadow-2xl border border-border flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-2">
              ምዘናው በተሳካ ሁኔታ ተቆልፎ ተልኳል!
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
              የራስ ምዘናዎ በተሳካ ሁኔታ ተመዝግቧል። ከዚያ በኋላ ማስተካከል አይቻልም።
            </p>

            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex flex-col items-center">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                የተመዘገበ የ 10% የራስ ውጤት
              </span>
              <div className="flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="text-3xl font-extrabold font-heading">{displayScore}</span>
                <span className="text-sm font-semibold">/ 10</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm shadow-md transition-all active:scale-98"
            >
              እሺ (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
