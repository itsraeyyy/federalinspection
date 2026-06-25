'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldCheck, Save, Users, AlertCircle, Unlock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

export function ApproverDashboardView({ periodId }: { periodId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [members, setMembers] = useState<any[]>([]);
  const [selfScores, setSelfScores] = useState<Record<string, { score: number, is_locked: boolean }>>({});
  const [evalScores, setEvalScores] = useState<Record<string, { score: number, is_locked: boolean, evaluations: any[] }>>({});
  const [approverScores, setApproverScores] = useState<Record<string, number>>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [allUsersMap, setAllUsersMap] = useState<Record<string, string>>({});
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: membersData } = await supabase
          .from('period_members')
          .select('*, users(full_name)')
          .eq('period_id', periodId);

        const usersMap: Record<string, string> = {};
        membersData?.forEach(m => {
          if (m.users?.full_name) usersMap[m.user_id] = m.users.full_name;
        });
        setAllUsersMap(usersMap);

        setMembers(membersData || []);

        const { data: selfData } = await supabase
          .from('self_assessments')
          .select('*')
          .eq('period_id', periodId);

        const sScores: Record<string, { score: number, is_locked: boolean }> = {};
        selfData?.forEach(s => sScores[s.user_id] = { score: s.score_10, is_locked: s.is_locked });
        setSelfScores(sScores);

        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('period_id', periodId);

        // Calculate average for evaluator scores (20)
        const evalGroups: Record<string, { scores: number[], is_locked: boolean[], evaluations: any[] }> = {};
        evalData?.forEach(e => {
          if (!evalGroups[e.target_user_id]) evalGroups[e.target_user_id] = { scores: [], is_locked: [], evaluations: [] };
          evalGroups[e.target_user_id].scores.push(Number(e.score_20));
          evalGroups[e.target_user_id].is_locked.push(e.is_locked);
          evalGroups[e.target_user_id].evaluations.push(e);
        });

        const eScores: Record<string, { score: number, is_locked: boolean, evaluations: any[] }> = {};
        for (const [targetId, group] of Object.entries(evalGroups)) {
          const avg = group.scores.reduce((a, b) => a + b, 0) / group.scores.length;
          const allLocked = group.is_locked.every(l => l === true);
          eScores[targetId] = { score: Number(avg.toFixed(2)), is_locked: allLocked, evaluations: group.evaluations };
        }
        setEvalScores(eScores);

        const { data: appData } = await supabase
          .from('approver_evaluations')
          .select('*')
          .eq('period_id', periodId)
          .eq('approver_id', session.user.id);

        const aScores: Record<string, number> = {};
        let finalized = false;
        appData?.forEach(a => {
          aScores[a.target_user_id] = Number(a.score_70);
          if (a.is_locked) finalized = true;
        });
        setApproverScores(aScores);
        setIsFinalized(finalized);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [periodId]);

  const handleApproverScoreChange = (targetId: string, value: string) => {
    // Allow empty string to easily clear the input, default to 0 otherwise but bound it.
    let score = value === '' ? 0 : parseFloat(value);
    if (isNaN(score)) score = 0;
    
    const validScore = Math.max(0, Math.min(70, score));
    setApproverScores(prev => ({ ...prev, [targetId]: validScore }));
  };

  const handleUnlockAssessment = async (type: 'self' | 'eval', targetId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ማረጋገጫ (Unlock Confirmation)',
      message: 'ይህን ግምገማ መክፈት (Unlock) ይፈልጋሉ? አንዴ ከተከፈተ ተጠቃሚው ውጤቱን መቀየር ይችላል። (Are you sure you want to unlock?)',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setSaving(true);
        setError(null);
        try {
          if (type === 'self') {
            const { error: updErr } = await supabase
              .from('self_assessments')
              .update({ is_locked: false })
              .eq('period_id', periodId)
              .eq('user_id', targetId);
              
            if (updErr) throw updErr;
            setSelfScores(prev => ({ ...prev, [targetId]: { ...prev[targetId], is_locked: false } }));
          } else {
            // Unlock all evaluations for this user in this period
            const { error: updErr } = await supabase
              .from('evaluations')
              .update({ is_locked: false })
              .eq('period_id', periodId)
              .eq('target_user_id', targetId);
              
            if (updErr) throw updErr;
            setEvalScores(prev => ({ ...prev, [targetId]: { ...prev[targetId], is_locked: false } }));
          }
          
          showToast('በተሳካ ሁኔታ ተከፍቷል። (Unlocked successfully)', 'success');
        } catch (err: any) {
          setError(err.message || 'መክፈት አልተሳካም። (Failed to unlock)');
          showToast('መክፈት አልተሳካም (Failed)', 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleSaveAll = async (isFinalizing = false) => {
    if (!isFinalizing) setSaving(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Approver ONLY upserts their 70-point evaluation. 20-point eval is strictly for Evaluators.
      const payload = members.map(m => ({
        period_id: periodId,
        approver_id: session.user.id,
        target_user_id: m.user_id,
        score_70: approverScores[m.user_id] || 0,
        is_locked: isFinalizing
      }));

      if (payload.length > 0) {
        const { error: upsertErr } = await supabase
          .from('approver_evaluations')
          .upsert(payload, { onConflict: 'period_id, approver_id, target_user_id' });
        
        if (upsertErr) throw upsertErr;
      }

      if (!isFinalizing) {
        showToast('ግምገማዎቹ በተሳካ ሁኔታ ተቀምጠዋል! (Saved successfully)', 'success');
      }
    } catch (err: any) {
      if (err.message?.includes('row-level security') || err.code === '42501') {
        const msg = 'ይህ ግምገማ አስቀድሞ ስለፀደቀ መቀየር አይቻልም። (This evaluation is already finalized and locked.)';
        setError(msg);
        if (!isFinalizing) showToast('አስቀድሞ ፀድቋል (Already finalized)', 'error');
        throw new Error(msg);
      } else {
        setError(err.message || 'Error saving evaluations');
        if (!isFinalizing) showToast('ማስቀመጥ አልተሳካም (Failed to save)', 'error');
        throw err;
      }
    } finally {
      if (!isFinalizing) setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'ማረጋገጫ (Finalize Confirmation)',
      message: 'ሁሉንም ውጤቶች ማፅደቅ ይፈልጋሉ? አንዴ ከተፀደቀ መቀየር አይቻልም። (Finalize all scores?)',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setSaving(true);
        setError(null);
        try {
          // First save current scores and lock them
          await handleSaveAll(true);

          const { error: rpcError } = await supabase.rpc('finalize_period_scores', {
            p_period_id: periodId,
          });

          if (rpcError) throw rpcError;

          showToast('ውጤቶች በተሳካ ሁኔታ ፀድቀዋል! (Finalized successfully)', 'success');
          setTimeout(() => router.refresh(), 1500);
        } catch (err: any) {
          setError(err.message || 'ማፅደቅ አልተሳካም። (Failed to finalize)');
          showToast('ማፅደቅ አልተሳካም (Failed to finalize)', 'error');
          setSaving(false);
        }
      }
    });
  };

  const handleEvaluatorScoreChange = async (evaluationId: string, targetId: string, questionId: string, newScoreStr: string) => {
    let newScore = newScoreStr === '' ? 0 : parseInt(newScoreStr, 10);
    if (isNaN(newScore)) newScore = 0;
    const validScore = Math.max(0, Math.min(5, newScore));

    const targetEvalScore = evalScores[targetId];
    if (!targetEvalScore) return;

    const evaluationIndex = targetEvalScore.evaluations.findIndex(e => e.id === evaluationId);
    if (evaluationIndex === -1) return;

    const evaluation = targetEvalScore.evaluations[evaluationIndex];
    const updatedResponses = { ...evaluation.responses, [questionId]: validScore };

    let raw_score = 0;
    LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
      cat.questions.forEach(q => {
        if (updatedResponses[q.question_id] !== undefined) {
          raw_score += q.weight * updatedResponses[q.question_id];
        }
      });
    });
    const updatedScore20 = parseFloat((raw_score / 5).toFixed(2));

    const updatedEvaluations = [...targetEvalScore.evaluations];
    updatedEvaluations[evaluationIndex] = { ...evaluation, responses: updatedResponses, score_20: updatedScore20 };
    
    const avg = updatedEvaluations.reduce((acc, curr) => acc + curr.score_20, 0) / updatedEvaluations.length;

    setEvalScores(prev => ({
      ...prev,
      [targetId]: { ...prev[targetId], evaluations: updatedEvaluations, score: parseFloat(avg.toFixed(2)) }
    }));

    try {
      const { error: updateErr } = await supabase
        .from('evaluations')
        .update({ responses: updatedResponses, score_20: updatedScore20 })
        .eq('id', evaluationId);

      if (updateErr) throw updateErr;
    } catch (err: any) {
      console.error(err);
      showToast('ውጤት መቀየር አልተሳካም። (Failed to update score)', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background py-8 px-4 sm:px-6 lg:px-12 flex flex-col relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-medium shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-yellow/10 rounded-2xl mb-4 border border-brand-yellow/20">
            <ShieldCheck className="w-8 h-8 text-brand-yellow" />
          </div>
          <h1 className="text-4xl font-heading text-text-primary tracking-tight mb-3">
            የአጽዳቂ ዳሽቦርድ <span className="text-brand-yellow text-2xl ml-2 font-sans font-medium">(Approver Dashboard)</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-3xl leading-relaxed">
            እዚህ ላይ የተጠቃሚዎችን ግምገማ ውጤት ይመለከታሉ፣ አማካይ የገምጋሚዎችን (20 ነጥብ) ይገመግማሉ፣ የራስዎን (70 ነጥብ) ይሞላሉ፣ እንዲሁም ያፀድቃሉ። (Review averages, rate out of 70, and finalize.)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="premium-card overflow-hidden mb-8 border border-border/60 shadow-lg bg-surface-primary flex-grow">
          <div className="bg-gradient-to-r from-surface-secondary to-background px-6 py-5 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-blue" />
              <h3 className="text-xl font-heading font-semibold text-text-primary">የተጠቃሚዎች ውጤት ዝርዝር (Users Scores)</h3>
            </div>
            <span className="text-sm font-medium bg-surface-primary px-3 py-1 rounded-full text-text-secondary shadow-sm border border-border/50">
              {members.length} ተጠቃሚዎች
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-secondary/50 text-text-secondary font-medium">
                <tr>
                  <th className="px-6 py-5">ተጠቃሚ (User)</th>
                  <th className="px-6 py-5 text-center">
                    የራስ ግምገማ <span className="block text-xs font-bold text-text-muted mt-0.5">(10 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-5 text-center">
                    አማካይ የገምጋሚ ውጤት <span className="block text-xs font-bold text-text-muted mt-0.5">(20 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-5 text-center">
                    የአጽዳቂ ውጤት <span className="block text-xs font-bold text-brand-yellow mt-0.5">(70 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-5 text-center border-l border-border/50 bg-surface-secondary/30">
                    አጠቃላይ <span className="block text-xs font-bold text-brand-blue mt-0.5">(100 ነጥብ)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {members.map(m => {
                  const s10Data = selfScores[m.user_id];
                  const s20Data = evalScores[m.user_id];
                  const s10 = s10Data?.score || 0;
                  const s20 = s20Data?.score || 0;
                  const s70 = approverScores[m.user_id] || 0;
                  const total = parseFloat((s10 + s20 + s70).toFixed(2));

                  return (
                    <tr key={m.user_id} className="hover:bg-surface-secondary/20 transition-colors">
                      <td className="px-6 py-5 font-medium text-text-primary text-[15px]">
                        {m.users?.full_name || 'ያልታወቀ'}
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-mono text-base font-semibold px-3 py-1 bg-surface-secondary rounded-lg border border-border/50 text-text-primary shadow-sm min-w-[50px] text-center">
                            {s10 > 0 ? s10 : '-'}
                          </span>
                          {s10Data?.is_locked && (
                            <button
                              onClick={() => handleUnlockAssessment('self', m.user_id)}
                              disabled={saving}
                              className="text-[11px] font-medium flex items-center text-brand-blue hover:text-brand-blue/80 bg-brand-blue/10 px-2 py-1 rounded border border-brand-blue/20 transition-all hover:shadow-sm active:scale-95"
                              title="ክፈት (Unlock)"
                            >
                              <Unlock className="w-3 h-3 mr-1" /> ክፈት
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-mono text-base font-semibold px-3 py-1 bg-surface-secondary rounded-lg border border-border/50 text-text-primary shadow-sm min-w-[50px] text-center">
                            {s20 > 0 ? s20 : '-'}
                          </span>
                          <button
                            onClick={() => setExpandedUser(expandedUser === m.user_id ? null : m.user_id)}
                            className="text-[11px] font-medium text-text-secondary hover:text-brand-blue underline"
                          >
                            {expandedUser === m.user_id ? 'ደብቅ (Hide)' : 'ዝርዝር (Details)'}
                          </button>
                          {s20Data?.is_locked && (
                            <button
                              onClick={() => handleUnlockAssessment('eval', m.user_id)}
                              disabled={saving}
                              className="text-[11px] font-medium flex items-center text-brand-blue hover:text-brand-blue/80 bg-brand-blue/10 px-2 py-1 rounded border border-brand-blue/20 transition-all hover:shadow-sm active:scale-95"
                              title="ክፈት (Unlock All Evals)"
                            >
                              <Unlock className="w-3 h-3 mr-1" /> ክፈት
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={70}
                          value={s70 === 0 ? '' : s70}
                          placeholder="0"
                          disabled={isFinalized}
                          onChange={(e) => handleApproverScoreChange(m.user_id, e.target.value)}
                          className="w-20 text-center font-mono text-base font-bold text-brand-yellow bg-surface-primary border border-border/80 rounded-xl py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all hover:border-brand-yellow/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="px-6 py-5 text-center font-mono font-bold text-lg text-text-primary border-l border-border/50 bg-surface-secondary/10">
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {expandedUser && evalScores[expandedUser]?.evaluations?.length > 0 && (
              <div className="bg-surface-secondary/30 p-6 border-t border-border/50">
                <h4 className="text-sm font-semibold mb-4 text-text-primary">የገምጋሚዎች ዝርዝር ምላሽ (Evaluators Detailed Responses)</h4>
                <div className="space-y-6">
                  {evalScores[expandedUser].evaluations.map((ev: any) => (
                    <div key={ev.id} className="bg-surface-primary rounded-xl border border-border/50 p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/30">
                        <span className="font-medium text-brand-blue">{allUsersMap[ev.evaluator_id] || 'ያልታወቀ ገምጋሚ'}</span>
                        <span className="text-sm font-mono bg-brand-blue/10 px-2 py-1 rounded text-brand-blue font-semibold">
                          ውጤት: {ev.score_20} / 20
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {LEADERSHIP_EVALUATION_QUESTIONS_20.map(cat => (
                          cat.questions.map(q => (
                            <div key={q.question_id} className="flex justify-between items-start py-2 border-b border-border/10">
                              <span className="text-text-secondary pr-4 leading-snug">
                                <span className="font-mono text-xs mr-2">{q.question_id}</span>
                                {q.criteria}
                              </span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={5}
                                  value={ev.responses?.[q.question_id] ?? ''}
                                  disabled={isFinalized}
                                  onChange={(e) => handleEvaluatorScoreChange(ev.id, expandedUser, q.question_id, e.target.value)}
                                  className="w-12 text-center text-sm font-semibold text-text-primary bg-surface-secondary border border-border/80 rounded py-1 focus:outline-none focus:ring-1 focus:ring-brand-blue/50 transition-all hover:border-brand-blue/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className="text-xs text-text-muted font-normal">/ 5</span>
                              </div>
                            </div>
                          ))
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-auto mb-8 bg-surface-primary p-4 sm:p-6 rounded-2xl border border-border shadow-md">
          {isFinalized ? (
            <div className="w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-success bg-success/10 border border-success/30 shadow-sm">
              <CheckCircle2 className="w-6 h-6 mr-2" />
              ግምገማው አስቀድሞ ፀድቋል (Evaluations already finalized)
            </div>
          ) : (
            <>
              <button
                onClick={() => handleSaveAll(false)}
                disabled={saving}
                className="flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-text-primary bg-surface-secondary hover:bg-border transition-all duration-200 disabled:opacity-50 border border-border/80 hover:shadow-sm active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                70 ነጥቦችን አስቀምጥ (Save Draft)
              </button>
              
              <button
                onClick={handleFinalize}
                disabled={saving}
                className="flex-[2] flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white bg-brand-blue hover:bg-brand-blue/90 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                ሁሉንም ውጤቶች አፅድቅ (Finalize All Scores)
              </button>
            </>
          )}
        </div>

      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-primary max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 border border-border">
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-3">{confirmModal.title}</h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={saving}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-text-primary bg-surface-secondary hover:bg-border transition-colors border border-border"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                onClick={confirmModal.onConfirm}
                disabled={saving}
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium text-white bg-brand-blue hover:bg-brand-blue/90 transition-colors shadow-md"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                አረጋግጥ (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
