'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

export function LeadershipEvaluationView({ periodId, members, evaluations }: { periodId: string, members: any[], evaluations: any[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittedLocal, setIsSubmittedLocal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Determine if the form should be read-only based on whether any evaluations are locked
  const readOnly = isSubmittedLocal || (evaluations && evaluations.length > 0 && evaluations.some(e => e.is_locked));

  const [responses, setResponses] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    (evaluations || []).forEach(e => {
      initial[e.target_user_id] = e.responses || {};
    });
    return initial;
  });

  const handleScoreChange = (userId: string, qId: string, score: number) => {
    if (readOnly) return;
    setResponses(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [qId]: score
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < members.length - 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentMember = members[currentIndex];
  const isLast = currentIndex === members.length - 1;
  const currentResponses = currentMember ? (responses[currentMember.user_id] || {}) : {};

  // Compute total score for current member
  let currentTotalRawScore = 0;
  let currentTotalAnswered = 0;
  let totalQuestions = 0;

  LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(category => {
    category.questions.forEach(q => {
      totalQuestions++;
      if (currentResponses[q.question_id] !== undefined) {
        currentTotalAnswered++;
        currentTotalRawScore += q.weight * currentResponses[q.question_id];
      }
    });
  });

  const currentFinalScore20 = currentTotalRawScore / 5;
  const displayScore = currentFinalScore20.toFixed(2);
  const isCurrentComplete = currentTotalAnswered === totalQuestions;

  // Check if all members are fully evaluated
  const allMembersEvaluated = members.every(m => {
    const memResp = responses[m.user_id] || {};
    return Object.keys(memResp).length === totalQuestions;
  });

  const handleAttemptSubmit = () => {
    const incompleteMembers = members.filter(m => {
      const memResp = responses[m.user_id] || {};
      return Object.keys(memResp).length !== totalQuestions;
    });

    if (incompleteMembers.length > 0) {
      const names = incompleteMembers.map(m => m.users?.full_name).join('፣ ');
      showToast(`እባክዎን የነዚህን አባላት ግምገማ ያጠናቅቁ (Complete remaining): ${names}`, 'error');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleSubmitAll = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);

    try {
      const currentUser: any = (await supabase.auth.getUser()).data?.user || (await supabase.auth.getSession()).data?.session?.user;
      if (!currentUser) throw new Error('ለማስቀመጥ እባክዎ መጀመሪያ ይግቡ (Not authenticated)');

      const payload = members.map(m => {
        const memResp = responses[m.user_id] || {};
        let raw_score = 0;
        LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
          cat.questions.forEach(q => {
            if (memResp[q.question_id] !== undefined) {
              raw_score += q.weight * memResp[q.question_id];
            }
          });
        });
        const score_20 = raw_score / 5;

        return {
          period_id: periodId,
          evaluator_id: currentUser.id,
          target_user_id: m.user_id,
          score_20: parseFloat(score_20.toFixed(2)),
          responses: memResp,
          is_locked: true,
        };
      });

      const { error: upsertError } = await supabase
        .from('evaluations')
        .upsert(payload, { onConflict: 'period_id, evaluator_id, target_user_id' });

      if (upsertError) throw upsertError;

      setIsSubmittedLocal(true);
      showToast('ግምገማዎቹ በተሳካ ሁኔታ ተልከዋል! (Evaluations submitted successfully)', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'ግምገማዎችን መላክ አልተሳካም። (Failed to submit evaluations)');
      showToast('ማስቀመጥ አልተሳካም (Failed to submit)', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (members.length === 0) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
        <div className="premium-card max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-heading text-text-primary mb-2">ምንም አባል የለም (No Members)</h2>
          <p className="text-text-secondary text-sm">በዚህ ቡድን ውስጥ የሚገመገም ሌላ አባል የለም።</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background py-8 px-4 flex flex-col items-center relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-medium shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
      <div className="max-w-4xl w-full flex-grow flex flex-col">
        {/* NON-STICKY Title & Instructions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-heading text-text-primary">የአመራር ግምገማ (Leadership Evaluation)</h1>
            <span className="text-xs font-semibold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
              {currentIndex + 1} ከ {members.length} አባላት
            </span>
          </div>
          
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-4 text-left shadow-sm">
            <h3 className="font-semibold text-brand-blue flex items-center gap-2 mb-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              መመሪያ (Instructions):
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              1. ከታች ያሉትን አባላት በመምረጥ ለእያንዳንዱ አባል ከ1 እስከ 5 ውጤት ይስጡ (Select members below and score them 1 to 5).<br/>
              2. የሁሉንም አባላት ግምገማ ሲያጠናቅቁ "ሁሉንም ግምገማዎች ላክ" የሚለውን ይጫኑ (Click 'Submit All' when everyone is evaluated).
            </p>
          </div>
        </div>

        {/* COMPACT STICKY HEADER for Member Selection & Current Score */}
        <div className="sticky top-[76px] z-20 mb-6 bg-surface-primary/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-md transition-all">
          {/* Member Selection Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2.5 no-scrollbar snap-x border-b border-border/40 mb-2.5">
            {members.map((m, idx) => {
              const memResp = responses[m.user_id] || {};
              const isComplete = Object.keys(memResp).length === totalQuestions;
              const isActive = currentIndex === idx;
              
              return (
                <button
                  key={m.user_id}
                  onClick={() => {
                    setCurrentIndex(idx);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border snap-start shrink-0 text-xs ${
                    isActive
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md font-semibold'
                      : isComplete
                      ? 'bg-success/10 text-success border-success/30 hover:bg-success/20 font-medium'
                      : 'bg-surface-secondary text-text-secondary border-border/60 hover:bg-border/50 font-medium'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-white/20' : isComplete ? 'bg-success/20' : 'bg-black/10 dark:bg-white/10'
                  }`}>
                    {m.users?.full_name?.charAt(0) || '?'}
                  </div>
                  <span>{m.users?.full_name?.split(' ')[0]}</span>
                  {isComplete && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {readOnly && (
            <div className="mb-2 bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-lg text-xs font-medium border border-brand-blue/20 text-center flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> ይህ ግምገማ ተልኳል እና ተቆልፏል (This evaluation is submitted and locked)
            </div>
          )}

          {/* Active Member Details + Score */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-brand-blue/10 border border-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue text-sm font-bold uppercase shrink-0">
                {currentMember.users?.full_name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-text-primary truncate leading-tight">
                  {currentMember.users?.full_name}
                </h2>
                <p className="text-[11px] text-text-muted truncate">{currentMember.title || 'የቡድን አባል (Team Member)'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border/50 shrink-0">
              <span className="text-xs text-text-secondary hidden sm:inline">የአሁኑ ውጤት:</span>
              <span className="text-base font-heading font-extrabold text-brand-blue">{displayScore}</span>
              <span className="text-xs text-text-muted">/ 20</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-8">
          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((category) => {
            let catAnswered = 0;
            const catTotal = category.questions.length;
            category.questions.forEach(q => {
              if (currentResponses[q.question_id] !== undefined) catAnswered++;
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
                            {q.question_id}
                          </span>
                          <span className="text-[14px] sm:text-sm text-text-primary leading-snug">
                            {q.criteria}
                          </span>
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2 flex justify-between items-start bg-surface-secondary/30 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-border/40 sm:border-transparent">
                        {[1, 2, 3, 4, 5].map((score) => {
                          const isSelected = currentResponses[q.question_id] === score;
                          const labels: Record<number, string> = {
                            1: 'በጣም ዝቅተኛ',
                            2: 'ዝቅተኛ',
                            3: 'መካከለኛ',
                            4: 'ከፍተኛ',
                            5: 'በጣም ከፍተኛ'
                          };
                          return (
                            <div key={score} className="flex-1 flex flex-col items-center justify-start" onClick={() => !readOnly && handleScoreChange(currentMember.user_id, q.question_id, score)}>
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

        <div className="premium-card p-4 sticky bottom-4 shadow-xl border-border z-10 flex flex-row gap-3 bg-surface-primary/95 backdrop-blur-md">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 max-w-[48px] sm:max-w-[120px] py-3 flex items-center justify-center rounded-xl bg-surface-secondary text-text-primary disabled:opacity-50 hover:bg-border transition-colors border border-border"
          >
            <ChevronLeft className="w-5 h-5 sm:mr-1" />
            <span className="hidden sm:inline">ወደኋላ</span>
          </button>
          
          {readOnly ? (
            <div className="flex-[2] flex items-center justify-center rounded-xl bg-surface-secondary text-text-secondary font-medium border border-border">
              ተቆልፏል (Locked)
            </div>
          ) : (
            <button
              onClick={handleAttemptSubmit}
              className="flex-[2] flex items-center justify-center rounded-xl bg-brand-blue text-white font-medium hover:bg-brand-blue/90 transition-colors shadow-sm"
            >
              ሁሉንም ግምገማዎች ላክ (Submit All)
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentIndex === members.length - 1}
            className="flex-1 max-w-[48px] sm:max-w-[120px] py-3 flex items-center justify-center rounded-xl bg-surface-secondary text-text-primary disabled:opacity-50 hover:bg-border transition-colors border border-border"
          >
            <span className="hidden sm:inline">ቀጣይ</span>
            <ChevronRight className="w-5 h-5 sm:ml-1" />
          </button>
        </div>
        {!allMembersEvaluated && !readOnly && (
          <p className="text-xs text-danger text-center mt-2 mb-8 font-medium bg-danger/10 py-2 rounded-lg">
            ለመላክ የሁሉንም አባላት ግምገማ ማጠናቀቅ አለብዎት። (You must complete evaluating everyone before submitting).
          </p>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-primary max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 border border-border">
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-3">ማረጋገጫ (Confirmation)</h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              ሁሉንም ግምገማዎች መላክ እንደሚፈልጉ እርግጠኛ ነዎት? አንዴ ከተላከ በኋላ ውጤቶችን መቀየር አይቻልም።<br/><br/>
              (Are you sure you want to submit all evaluations? This cannot be undone.)
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-text-primary bg-surface-secondary hover:bg-border transition-colors border border-border"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                onClick={handleSubmitAll}
                disabled={loading}
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium text-white bg-brand-blue hover:bg-brand-blue/90 transition-colors shadow-md"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                አረጋግጥ (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
