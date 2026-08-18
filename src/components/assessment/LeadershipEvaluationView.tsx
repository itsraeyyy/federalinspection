'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Info, User, MessageSquare, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';
import { CumulativePeerReportPDF } from './CumulativePeerReportPDF';
import { downloadPDFDocument } from '@/lib/exportToPDF';

export function LeadershipEvaluationView({ periodId, members, evaluations }: { periodId: string, members: any[], evaluations: any[] }) {
  const router = useRouter();
  const draftEvalKey = `draft_eval_${periodId}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittedLocal, setIsSubmittedLocal] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [lockedMemberIds, setLockedMemberIds] = useState<string[]>(() => {
    return (evaluations || [])
      .filter(e => e.is_locked)
      .map(e => e.target_user_id);
  });

  // Determine if all members in the group are locked
  const readOnly = isSubmittedLocal || (members.length > 0 && members.every(m => lockedMemberIds.includes(m.user_id)));

  // Scores State: userId -> { qId -> score }
  const [responses, setResponses] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    (evaluations || []).forEach(e => {
      const uId = e.target_user_id;
      const resp = e.responses || {};
      initial[uId] = {};
      Object.keys(resp).forEach(k => {
        if (!k.endsWith('_comment')) {
          if (typeof resp[k] === 'number') {
            initial[uId][k] = resp[k];
          } else if (typeof resp[k] === 'object' && resp[k]?.score !== undefined) {
            initial[uId][k] = Number(resp[k].score);
          }
        }
      });
    });
    if (typeof window !== 'undefined' && periodId) {
      try {
        const savedResp = localStorage.getItem(`${draftEvalKey}_resp`);
        if (savedResp) {
          const parsed = JSON.parse(savedResp);
          return { ...parsed, ...initial };
        }
      } catch (e) {}
    }
    return initial;
  });

  // Comments State: userId -> { qId -> comment }
  const [comments, setComments] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    (evaluations || []).forEach(e => {
      const uId = e.target_user_id;
      const resp = e.responses || {};
      initial[uId] = {};
      Object.keys(resp).forEach(k => {
        if (k.endsWith('_comment')) {
          const qId = k.replace('_comment', '');
          initial[uId][qId] = String(resp[k] || '');
        } else if (typeof resp[k] === 'object' && resp[k]?.comment !== undefined) {
          initial[uId][k] = String(resp[k].comment || '');
        }
      });
    });
    if (typeof window !== 'undefined' && periodId) {
      try {
        const savedComm = localStorage.getItem(`${draftEvalKey}_comm`);
        if (savedComm) {
          const parsed = JSON.parse(savedComm);
          return { ...parsed, ...initial };
        }
      } catch (e) {}
    }
    return initial;
  });

  // Auto-save local draft
  useEffect(() => {
    if (typeof window !== 'undefined' && periodId && !readOnly && Object.keys(responses).length > 0) {
      try {
        localStorage.setItem(`${draftEvalKey}_resp`, JSON.stringify(responses));
        localStorage.setItem(`${draftEvalKey}_comm`, JSON.stringify(comments));
      } catch (e) {
        console.error('Failed to save local eval draft:', e);
      }
    }
  }, [responses, comments, periodId, readOnly, draftEvalKey]);

  const handleScoreChange = (userId: string, qId: string, score: number) => {
    if (readOnly || lockedMemberIds.includes(userId)) return;
    setResponses(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [qId]: score
      }
    }));
  };

  const handleCommentChange = (userId: string, qId: string, comment: string) => {
    if (readOnly || lockedMemberIds.includes(userId)) return;
    setComments(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [qId]: comment
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
  const isCurrentMemberLocked = currentMember ? lockedMemberIds.includes(currentMember.user_id) : false;
  const isLast = currentIndex === members.length - 1;
  const currentResponses = currentMember ? (responses[currentMember.user_id] || {}) : {};
  const currentComments = currentMember ? (comments[currentMember.user_id] || {}) : {};

  // Compute total score and complete questions for current member
  let currentTotalRawScore = 0;
  let currentTotalAnswered = 0;
  let totalQuestions = 0;

  LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(category => {
    category.questions.forEach(q => {
      totalQuestions++;
      const score = currentResponses[q.question_id];
      const comment = (currentComments[q.question_id] || '').trim();
      if (score !== undefined && comment !== '') {
        currentTotalAnswered++;
      }
      if (score !== undefined) {
        currentTotalRawScore += q.weight * score;
      }
    });
  });

  const currentFinalScore20 = currentTotalRawScore / 5;
  const displayScore = currentFinalScore20.toFixed(1);
  const isCurrentComplete = currentTotalAnswered === totalQuestions;

  // Helper to build full payload for Supabase
  const buildPayloadResponses = (userId: string) => {
    const memResp = responses[userId] || {};
    const memComm = comments[userId] || {};
    const payloadResp: Record<string, any> = {};
    LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
      cat.questions.forEach(q => {
        const score = memResp[q.question_id];
        const comm = (memComm[q.question_id] || '').trim();
        if (score !== undefined) {
          payloadResp[q.question_id] = score;
        }
        if (comm) {
          payloadResp[`${q.question_id}_comment`] = comm;
        }
      });
    });
    return payloadResp;
  };

  // Submit single member's 20% evaluation
  const handleSubmitSingleMember = async (targetMember: any) => {
    if (!targetMember) return;
    const targetUserId = targetMember.user_id;
    const memResp = responses[targetUserId] || {};
    const memComm = comments[targetUserId] || {};

    let totalAns = 0;
    let rawScore = 0;
    LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
      cat.questions.forEach(q => {
        const score = memResp[q.question_id];
        const comm = (memComm[q.question_id] || '').trim();
        if (score !== undefined && comm !== '') {
          totalAns++;
        }
        if (score !== undefined) {
          rawScore += q.weight * score;
        }
      });
    });

    if (totalAns !== totalQuestions) {
      showToast(`እባክዎን ለ ${targetMember.users?.full_name} የሁሉም ጥያቄዎች (1.1, 1.2...) ውጤት እና ሂስ ይሙሉ (${totalAns}/${totalQuestions} ተሞልቷል)`, 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUser: any = (await supabase.auth.getUser()).data?.user || (await supabase.auth.getSession()).data?.session?.user;
      if (!currentUser) throw new Error('ለማስቀመጥ እባክዎ መጀመሪያ ይግቡ (Not authenticated)');

      const score_20 = rawScore / 5;
      const payloadResponses = buildPayloadResponses(targetUserId);

      const payload = {
        period_id: periodId,
        evaluator_id: currentUser.id,
        target_user_id: targetUserId,
        score_20: parseFloat(score_20.toFixed(1)),
        responses: payloadResponses,
        is_locked: true,
      };

      const { error: upsertError } = await supabase
        .from('evaluations')
        .upsert([payload], { onConflict: 'period_id, evaluator_id, target_user_id' });

      if (upsertError) throw upsertError;

      setLockedMemberIds(prev => [...prev, targetUserId]);
      showToast(`የ ${targetMember.users?.full_name} ምዘና በተሳካ ሁኔታ ተልኳል!`, 'success');

      // Auto advance to next un-submitted member if any
      const nextUnlockedIdx = members.findIndex((m, idx) => idx > currentIndex && !lockedMemberIds.includes(m.user_id) && m.user_id !== targetUserId);
      if (nextUnlockedIdx !== -1) {
        setCurrentIndex(nextUnlockedIdx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'ምዘና መላክ አልተሳካም።');
      showToast('ማስቀመጥ አልተሳካም', 'error');
    } finally {
      setLoading(false);
    }
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
        const payloadResponses = buildPayloadResponses(m.user_id);

        return {
          period_id: periodId,
          evaluator_id: currentUser.id,
          target_user_id: m.user_id,
          score_20: parseFloat(score_20.toFixed(1)),
          responses: payloadResponses,
          is_locked: true,
        };
      });

      const { error: upsertError } = await supabase
        .from('evaluations')
        .upsert(payload, { onConflict: 'period_id, evaluator_id, target_user_id' });

      if (upsertError) throw upsertError;

      const allIds = members.map(m => m.user_id);
      setLockedMemberIds(allIds);
      setIsSubmittedLocal(true);
      showToast('ምዘናዎቹ በተሳካ ሁኔታ ተልከዋል! (Evaluations submitted successfully)', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'ምዘናዎችን መላክ አልተሳካም። (Failed to submit evaluations)');
      showToast('ማስቀመጥ አልተሳካም (Failed to submit)', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload20PercentPDF = async (targetMember: any) => {
    if (!targetMember) return;
    setDownloadingPDF(true);
    try {
      const targetUserId = targetMember.user_id;

      // 1. Fetch user & profile info & period info & evaluations
      const [uRes, pRes, perRes, evalsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', targetUserId).maybeSingle(),
        supabase.from('user_profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
        periodId ? supabase.from('assessment_periods').select('*').eq('id', periodId).maybeSingle() : Promise.resolve({ data: null }),
        periodId ? supabase.from('evaluations').select('*').eq('period_id', periodId).eq('target_user_id', targetUserId) : Promise.resolve({ data: [] })
      ]);

      const uData = uRes.data || targetMember.users;
      const pData = pRes.data || targetMember.user_profiles?.[0];
      const periodData = perRes.data;
      const allTargetEvals = evalsRes.data && evalsRes.data.length > 0 ? evalsRes.data : (evaluations || []).filter(e => e.target_user_id === targetUserId);

      // Build questionData by aggregating scores and comments from all evaluators
      const qData: Record<string, { avgScore: number; comments: string[] }> = {};
      let totalRaw = 0;

      LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
        cat.questions.forEach(q => {
          let sumScore = 0;
          let countScore = 0;
          const distinctComments: string[] = [];

          if (allTargetEvals.length > 0) {
            allTargetEvals.forEach((ev: any) => {
              const resp = ev.responses || {};
              const s = resp[q.question_id];
              const c = (resp[`${q.question_id}_comment`] || (typeof resp[q.question_id] === 'object' ? resp[q.question_id]?.comment : '') || '').trim();

              if (typeof s === 'number') {
                sumScore += s;
                countScore++;
              }
              if (c && !distinctComments.includes(c)) {
                distinctComments.push(c);
              }
            });
          }

          // If local responses exist and not in target evals yet, include them
          const localScore = responses[targetUserId]?.[q.question_id];
          const localComm = (comments[targetUserId]?.[q.question_id] || '').trim();
          if (countScore === 0 && localScore !== undefined) {
            sumScore = localScore;
            countScore = 1;
          }
          if (localComm && !distinctComments.includes(localComm)) {
            distinctComments.push(localComm);
          }

          const avg = countScore > 0 ? sumScore / countScore : 0;
          totalRaw += q.weight * avg;
          qData[q.question_id] = {
            avgScore: avg,
            comments: distinctComments
          };
        });
      });

      const calcScore20 = totalRaw / 5;
      const fileName = `${uData?.full_name?.replace(/\s+/g, '_') || 'Member'}_20Percent_Peer_Report.pdf`;

      const docElement = (
        <CumulativePeerReportPDF
          user={uData}
          profile={pData}
          period={periodData}
          evaluatorsCount={allTargetEvals.length || 1}
          questionData={qData}
          score20={parseFloat(calcScore20.toFixed(1))}
        />
      );

      await downloadPDFDocument(docElement, fileName);
      showToast('የ 20% ምዘና ሪፖርት በተሳካ ሁኔታ ወርዷል', 'success');
    } catch (err: any) {
      console.error('Error downloading 20% PDF:', err);
      showToast('PDF ለማውረድ አልተቻለም', 'error');
    } finally {
      setDownloadingPDF(false);
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
    <div className="flex-1 bg-background pt-2 pb-6 px-3 sm:px-4 flex flex-col items-center relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-medium shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
      <div className="max-w-4xl w-full flex-grow flex flex-col">
        {/* Side-by-Side Title & Detailed Instructions */}
        <div className="mb-3 mt-1 bg-surface-secondary/40 border border-border/60 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-blue/10 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-heading text-text-primary">
                  የአመራር ምዘና <span className="text-brand-blue text-xs sm:text-sm font-normal font-sans ml-1">(Leadership Evaluation)</span>
                </h1>
                <span className="text-[10px] font-semibold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                  {currentIndex + 1} ከ {members.length} አባላት
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">ቅፅ-2: የ 20% የአቻ ምዘና ቅጽ (ለእያንዳንዱ ጥያቄ ሂስ መጻፍ ግዴታ ነው)</p>
            </div>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-2.5 sm:p-3 text-xs text-text-secondary max-w-md w-full md:w-auto shrink-0">
            <div className="font-semibold text-brand-blue flex items-center gap-1.5 mb-1 text-xs">
              <Info className="w-3.5 h-3.5" />
              መመሪያ (Instructions):
            </div>
            <ul className="space-y-1 text-[11px] text-text-secondary leading-snug">
              <li>• ለእያንዳንዱ መስፈርት ከ<b>1 እስከ 5</b> ውጤት ይስጡ እና <b>ሂስ</b> ይጻፉ።</li>
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

        {/* COMPACT STICKY HEADER for Member Selection & Current Score */}
        <div className="sticky top-[76px] z-20 mb-6 bg-surface-primary/95 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-md transition-all">
          {/* Member Selection Pills with Live Scores */}
          <div className="flex gap-2 overflow-x-auto pb-2.5 no-scrollbar snap-x border-b border-border/40 mb-2.5">
            {members.map((m, idx) => {
              const memResp = responses[m.user_id] || {};
              const memComm = comments[m.user_id] || {};
              let memAnsCount = 0;
              LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
                cat.questions.forEach(q => {
                  if (memResp[q.question_id] !== undefined && (memComm[q.question_id] || '').trim() !== '') {
                    memAnsCount++;
                  }
                });
              });
              const isComplete = memAnsCount === totalQuestions;
              const isActive = currentIndex === idx;

              // Calculate live score out of 20 for this member
              let mRaw = 0;
              LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
                cat.questions.forEach(q => {
                  if (memResp[q.question_id] !== undefined) {
                    mRaw += q.weight * memResp[q.question_id];
                  }
                });
              });
              const mScore20 = (mRaw / 5).toFixed(1);

              return (
                <button
                  key={m.user_id}
                  onClick={() => {
                    setCurrentIndex(idx);
                  }}
                  className={`snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs whitespace-nowrap shrink-0 transition-all ${isActive
                      ? 'bg-brand-blue text-white shadow-md'
                      : isComplete
                        ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                        : 'bg-surface-secondary text-text-secondary border border-border/60 hover:bg-border/60'
                    }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{m.users?.full_name || 'Member'}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-brand-blue/10 text-brand-blue'}`}>
                    {mScore20}/20
                  </span>
                  {isComplete && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Active Member Details + LIVE SCORE OUT OF 20 */}
          <div className="flex items-center justify-between text-xs font-semibold gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-text-secondary shrink-0">አባል:</span>
              <span className="text-brand-blue font-bold text-sm truncate max-w-[130px] sm:max-w-[220px]">
                {currentMember.users?.full_name}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 font-bold ${isCurrentComplete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {currentTotalAnswered}/{totalQuestions} ተሞልቷል
              </span>
            </div>

            {/* Live Score Badge out of 20 & PDF Download */}
            <div className="flex items-center gap-2">
              {(isCurrentMemberLocked || readOnly) && (
                <button
                  onClick={() => handleDownload20PercentPDF(currentMember)}
                  disabled={downloadingPDF}
                  className="flex items-center gap-1 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  title="የዚህ አባል የ 20% ድምር ምዘና PDF አውርድ"
                >
                  {downloadingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">20% PDF አውርድ</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-brand-blue/10 border border-brand-blue/30 px-3 py-1 rounded-xl shrink-0">
                <span className="text-[11px] text-text-secondary hidden sm:inline font-medium">የአሁኑ ውጤት:</span>
                <span className="text-sm sm:text-base font-extrabold font-heading text-brand-blue">{displayScore}</span>
                <span className="text-[10px] text-brand-blue/80 font-bold">/ 20</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-44 lg:mb-8">
          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((category) => {
            let catAnswered = 0;
            const catTotal = category.questions.length;
            let catRaw = 0;
            category.questions.forEach(q => {
              const score = currentResponses[q.question_id];
              const comment = (currentComments[q.question_id] || '').trim();
              if (score !== undefined && comment !== '') catAnswered++;
              if (score !== undefined) {
                catRaw += (q.weight || 1.0) * score;
              }
            });
            const catComplete = catAnswered === catTotal;
            const catScoreVal = (catRaw / 5).toFixed(1);

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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                      የክፍሉ ውጤት፡ {catScoreVal}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full ${catComplete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {catAnswered} / {catTotal}
                    </span>
                  </div>
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
                    <div key={q.question_id} className="flex flex-col border-b border-border/20 hover:bg-surface-secondary/20 transition-colors p-4 sm:p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="w-full sm:w-1/2 flex items-start">
                          <div className="flex gap-2.5 w-full">
                            <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded self-start mt-0.5 shrink-0 border border-brand-blue/20">
                              {q.question_id}
                            </span>
                            <span className="text-sm text-text-primary leading-snug font-medium">
                              {q.criteria}
                            </span>
                          </div>
                        </div>

                        <div className="w-full sm:w-1/2 flex justify-between items-start bg-surface-secondary/40 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-border/40 sm:border-transparent">
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
                              <div
                                key={score}
                                className="flex-1 flex flex-col items-center justify-start"
                                onClick={() => !readOnly && !isCurrentMemberLocked && handleScoreChange(currentMember.user_id, q.question_id, score)}
                              >
                                <div className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base transition-all ${readOnly || isCurrentMemberLocked ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                                  } ${isSelected ? 'bg-brand-blue text-white shadow-md scale-110' : 'bg-surface-primary sm:bg-surface-secondary text-text-secondary border border-border/60 hover:bg-border/80'
                                  }`}>
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

                      {/* Required Question Comment / Reason Text Box */}
                      <div className="w-full mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
                            <span>ለጥያቄ {q.question_id} ሂስ</span>
                            <span className="text-danger font-bold text-xs">* (ግዴታ)</span>
                          </label>
                          {!(currentComments[q.question_id] || '').trim() && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-semibold border border-amber-500/20">
                              ሂስ ይፈልጋል
                            </span>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          disabled={readOnly || isCurrentMemberLocked}
                          value={currentComments[q.question_id] || ''}
                          onChange={(e) => handleCommentChange(currentMember.user_id, q.question_id, e.target.value)}
                          placeholder={`ለጥያቄ ${q.question_id} የሰጡትን ውጤት ሂስ እዚህ ይጻፉ... (Required)`}
                          className="w-full p-3 bg-surface-secondary/50 border border-border/80 rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:opacity-60 transition-all placeholder:text-text-muted/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="premium-card p-3 sm:p-4 fixed bottom-[58px] left-3 right-3 z-30 lg:sticky lg:bottom-4 lg:left-auto lg:right-auto shadow-xl border-border flex flex-row gap-3 bg-surface-primary/95 backdrop-blur-md">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 max-w-[48px] sm:max-w-[120px] py-3 flex items-center justify-center rounded-xl bg-surface-secondary text-text-primary disabled:opacity-50 hover:bg-border transition-colors border border-border"
          >
            <ChevronLeft className="w-5 h-5 sm:mr-1" />
            <span className="hidden sm:inline">ወደኋላ</span>
          </button>

          {isCurrentMemberLocked ? (
            <div className="flex-[2] flex flex-wrap items-center justify-center gap-2 rounded-xl bg-success/10 text-success font-semibold border border-success/20 text-xs sm:text-sm py-2 px-2">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
                <span>የ {currentMember?.users?.full_name?.split(' ')[0]} ምዘና ተልኳል</span>
              </div>
              <button
                onClick={() => handleDownload20PercentPDF(currentMember)}
                disabled={downloadingPDF}
                className="flex items-center gap-1 bg-brand-blue text-white hover:bg-brand-blue/90 px-3 py-1 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50 ml-2"
              >
                {downloadingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>PDF አውርድ (20%)</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleSubmitSingleMember(currentMember)}
              disabled={loading || !isCurrentComplete}
              className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-brand-blue text-white font-bold text-xs sm:text-sm hover:bg-brand-blue/90 disabled:opacity-40 transition-all shadow-md py-3 px-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>የ {currentMember?.users?.full_name?.split(' ')[0]} ምዘና ላክ ({displayScore}/20)</span>
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
      </div>
    </div>
  );
}
