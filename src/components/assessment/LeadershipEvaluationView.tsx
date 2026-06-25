'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

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
          evaluator_id: session.user.id,
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
        <div className="mb-8 sticky top-0 bg-background/95 backdrop-blur-md py-4 z-20 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-heading text-text-primary">የአመራር ግምገማ (Leadership Evaluation)</h1>
            <span className="text-sm font-medium text-text-muted">
              {currentIndex + 1} / {members.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar snap-x">
            {members.map((m, idx) => {
              const memResp = responses[m.user_id] || {};
              const isComplete = Object.keys(memResp).length === totalQuestions;
              const isActive = currentIndex === idx;
              
              return (
                <button
                  key={m.user_id}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentIndex(idx);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all border snap-start shrink-0 ${
                    isActive
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                      : isComplete
                      ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                      : 'bg-surface-secondary text-text-secondary border-border hover:bg-border/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive ? 'bg-white/20' : isComplete ? 'bg-success/20' : 'bg-black/10 dark:bg-white/10'
                  }`}>
                    {m.users?.full_name?.charAt(0) || '?'}
                  </div>
                  <span className="font-medium text-sm">{m.users?.full_name?.split(' ')[0]}</span>
                  {isComplete && <CheckCircle2 className="w-4 h-4 ml-1 shrink-0" />}
                </button>
              );
            })}
          </div>

          {readOnly && (
            <div className="mb-4 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-lg text-sm font-medium border border-brand-blue/20 text-center flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 mr-2" /> ይህ ግምገማ ተልኳል እና ተቆልፏል (This evaluation is submitted and locked)
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center bg-surface-primary border border-border p-4 rounded-xl shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue text-lg font-heading uppercase shrink-0">
                {currentMember.users?.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  {currentMember.users?.full_name}
                </h2>
                <p className="text-xs text-text-secondary">{currentMember.title || 'የቡድን አባል (Team Member)'}</p>
              </div>
            </div>
            <div className="sm:ml-auto text-left sm:text-right bg-surface-secondary sm:bg-transparent p-3 sm:p-0 rounded-lg">
              <span className="text-sm text-text-secondary block sm:inline sm:mr-2">የአሁኑ ውጤት (Current Score):</span>
              <span className="text-2xl font-heading font-bold text-brand-blue">{displayScore}</span>
              <span className="text-sm text-text-muted ml-1">/ 20</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-8 mb-8">
          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((category) => (
            <div key={category.category_id} className="premium-card overflow-hidden border border-border shadow-sm">
              <div className="bg-surface-secondary px-6 py-4 border-b border-border">
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  {category.category_id}. {category.category_name}
                </h2>
                <p className="text-sm text-text-secondary mt-1">ክብደት (Weight): {category.total_weight}</p>
              </div>
              <div className="divide-y divide-border/50">
                {category.questions.map((q) => (
                  <div key={q.question_id} className="p-4 sm:p-6 hover:bg-surface-secondary/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2 sm:gap-4">
                      <p className="text-sm font-medium text-text-primary leading-relaxed flex-1">
                        <span className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded text-xs mr-2">{q.question_id}</span>
                        {q.criteria}
                      </p>
                      <span className="text-xs font-medium text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md shrink-0 self-start">
                        ክብደት: {q.weight}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const isSelected = currentResponses[q.question_id] === score;
                        return (
                          <button
                            key={score}
                            onClick={() => handleScoreChange(currentMember.user_id, q.question_id, score)}
                            className={`flex-1 min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-brand-blue text-white shadow-md'
                                : 'bg-surface-secondary text-text-secondary border border-border/50'
                            } ${!readOnly && !isSelected ? 'hover:bg-border' : ''} ${readOnly ? 'cursor-default' : ''}`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
