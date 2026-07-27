'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldCheck, Save, Users, AlertCircle, Unlock, CheckCircle2, Eye, X, Printer } from 'lucide-react';
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
  const [evalScores, setEvalScores] = useState<Record<string, { score: number, is_locked: boolean, is_complete: boolean, submitted_count: number, total_required: number, evaluations: any[] }>>({});
  const [approverScores, setApproverScores] = useState<Record<string, number>>({});
  const [initialApproverScores, setInitialApproverScores] = useState<Record<string, number>>({});
  const [isFinalized, setIsFinalized] = useState(false);

  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [allUsersMap, setAllUsersMap] = useState<Record<string, string>>({});

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const { data: periodData } = await supabase
          .from('assessment_periods')
          .select('status')
          .eq('id', periodId)
          .single();
        
        if (periodData?.status === 'finalized') {
          setIsFinalized(true);
        }

        const { data: usersData } = await supabase.from('users').select('id, full_name');
        const uMap: Record<string, string> = {};
        usersData?.forEach(u => { uMap[u.id] = u.full_name; });
        setAllUsersMap(uMap);

        const { data: membersData, error: memErr } = await supabase
          .from('period_members')
          .select('*, users(full_name)')
          .eq('period_id', periodId);

        if (memErr) throw memErr;
        setMembers(membersData || []);

        const { data: selfData } = await supabase
          .from('self_assessments')
          .select('*')
          .eq('period_id', periodId);

        const sScores: Record<string, { score: number, is_locked: boolean }> = {};
        selfData?.forEach(s => {
          sScores[s.user_id] = { score: Number(s.score_10), is_locked: s.is_locked };
        });
        setSelfScores(sScores);

        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('period_id', periodId);

        const evaluatorMembers = (membersData || []).filter(m => 
          m.role === 'evaluator' || m.role === 'approver' || m.role === 'leader' || m.role === 'admin'
        );

        const evalGroups: Record<string, { scores: number[], is_locked: boolean[], evaluations: any[] }> = {};
        evalData?.forEach(e => {
          if (!evalGroups[e.target_user_id]) evalGroups[e.target_user_id] = { scores: [], is_locked: [], evaluations: [] };
          if (e.is_locked) {
            evalGroups[e.target_user_id].scores.push(Number(e.score_20));
            evalGroups[e.target_user_id].is_locked.push(e.is_locked);
          }
          evalGroups[e.target_user_id].evaluations.push(e);
        });

        const eScores: Record<string, { score: number, is_locked: boolean, is_complete: boolean, submitted_count: number, total_required: number, evaluations: any[] }> = {};
        
        (membersData || []).forEach(m => {
          const targetId = m.user_id;
          const group = evalGroups[targetId] || { scores: [], is_locked: [], evaluations: [] };
          
          const eligibleEvaluatorsCount = evaluatorMembers.filter(eMem => eMem.user_id !== targetId).length;
          const submittedCount = group.scores.length;
          const isComplete = eligibleEvaluatorsCount > 0 && submittedCount >= eligibleEvaluatorsCount;
          const avg = submittedCount > 0 ? (group.scores.reduce((a, b) => a + b, 0) / submittedCount) : 0;
          
          eScores[targetId] = { 
            score: Number(avg.toFixed(2)), 
            is_locked: group.is_locked.length > 0 && group.is_locked.every(l => l === true),
            is_complete: isComplete,
            submitted_count: submittedCount,
            total_required: eligibleEvaluatorsCount,
            evaluations: group.evaluations 
          };
        });
        setEvalScores(eScores);

        const { data: approverData } = await supabase
          .from('approver_evaluations')
          .select('*')
          .eq('period_id', periodId);

        const aScores: Record<string, number> = {};
        approverData?.forEach(a => {
          aScores[a.target_user_id] = Number(a.score_70);
        });
        setApproverScores(aScores);
        setInitialApproverScores(aScores);

      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [periodId]);

  const handleApproverScoreChange = (userId: string, val: string) => {
    let score = val === '' ? 0 : parseFloat(val);
    if (isNaN(score)) score = 0;
    if (score > 70) score = 70;
    if (score < 0) score = 0;

    setApproverScores(prev => ({
      ...prev,
      [userId]: score
    }));
  };

  const handleUnlockAssessment = async (type: 'self' | 'eval', userId: string) => {
    setSaving(true);
    try {
      if (type === 'self') {
        const { error } = await supabase
          .from('self_assessments')
          .update({ is_locked: false })
          .eq('period_id', periodId)
          .eq('user_id', userId);

        if (error) throw error;
        setSelfScores(prev => ({
          ...prev,
          [userId]: { ...prev[userId], is_locked: false }
        }));
        showToast('የራስ ግምገማው በተሳካ ሁኔታ ተከፍቷል! (Self assessment unlocked)', 'success');
      } else {
        const { error } = await supabase
          .from('evaluations')
          .update({ is_locked: false })
          .eq('period_id', periodId)
          .eq('target_user_id', userId);

        if (error) throw error;
        setEvalScores(prev => ({
          ...prev,
          [userId]: { ...prev[userId], is_locked: false }
        }));
        showToast('የገምጋሚ ግምገማዎች በተሳካ ሁኔታ ተከፍተዋል! (Evaluations unlocked)', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'መክፈት አልተሳካም (Failed to unlock)', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async (isFinalizing = false) => {
    if (!isFinalizing) setSaving(true);
    setError(null);
    try {
      const currentUser: any = (await supabase.auth.getUser()).data?.user || (await supabase.auth.getSession()).data?.session?.user;
      if (!currentUser) throw new Error('ለማስቀመጥ እባክዎ መጀመሪያ ይግቡ (Not authenticated)');

      const payload = members.map(m => ({
        period_id: periodId,
        approver_id: currentUser.id,
        target_user_id: m.user_id,
        score_70: approverScores[m.user_id] || 0,
        is_locked: isFinalizing ? true : false
      }));

      if (payload.length > 0) {
        const { error: upsertErr } = await supabase
          .from('approver_evaluations')
          .upsert(payload, { onConflict: 'period_id, approver_id, target_user_id' });
        
        if (upsertErr) throw upsertErr;
      }

      if (!isFinalizing) {
        setInitialApproverScores({ ...approverScores });
        showToast('ግምገማዎቹ በተሳካ ሁኔታ ተቀምጠዋል! (Saved successfully)', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving evaluations');
      if (!isFinalizing) showToast('ማስቀመጥ አልተሳካም (Failed to save)', 'error');
      throw err;
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
          await handleSaveAll(true);

          const { error: rpcError } = await supabase.rpc('finalize_period_scores', {
            p_period_id: periodId,
          });

          if (rpcError) throw rpcError;

          showToast('ውጤቶች በተሳካ ሁኔታ ፀድቀዋል! (Finalized successfully)', 'success');
          setSaving(false);
          setTimeout(() => router.refresh(), 1500);
        } catch (err: any) {
          setError(err.message || 'ማፅደቅ አልተሳካም። (Failed to finalize)');
          showToast(err.message || 'ማፅደቅ አልተሳካም (Failed to finalize)', 'error');
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
    updatedEvaluations[evaluationIndex] = {
      ...evaluation,
      responses: updatedResponses,
      score_20: updatedScore20
    };

    const lockedScores = updatedEvaluations.filter(e => e.is_locked).map(e => e.score_20);
    const newAvg = lockedScores.length > 0
      ? parseFloat((lockedScores.reduce((a, b) => a + b, 0) / lockedScores.length).toFixed(2))
      : 0;

    setEvalScores(prev => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        score: newAvg,
        evaluations: updatedEvaluations
      }
    }));

    try {
      const { error } = await supabase
        .from('evaluations')
        .update({
          responses: updatedResponses,
          score_20: updatedScore20
        })
        .eq('id', evaluationId);

      if (error) throw error;
    } catch (err: any) {
      showToast('ምላሽን ማዘመን አልተሳካም (Failed to update score)', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-text-secondary mt-4">ዳሽቦርድ በመጫን ላይ... (Loading approver dashboard...)</p>
      </div>
    );
  }

  const targetMemberForModal = expandedUser ? members.find(m => m.user_id === expandedUser) : null;
  const targetEvalScoreForModal = expandedUser ? evalScores[expandedUser] : null;
  const targetSelfScore = expandedUser ? (selfScores[expandedUser]?.score || 0) : 0;
  const targetEvalScoreVal = targetEvalScoreForModal?.score || 0;
  const targetApproverScoreVal = expandedUser ? (approverScores[expandedUser] || 0) : 0;
  const targetTotalScore = parseFloat((targetSelfScore + targetEvalScoreVal + targetApproverScoreVal).toFixed(2));

  const hasChanges = members.some(
    m => (approverScores[m.user_id] || 0) !== (initialApproverScores[m.user_id] || 0)
  );

  return (
    <div className="flex-1 bg-background py-8 px-2 sm:px-6 lg:px-8 flex flex-col items-center relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-3 rounded-2xl font-medium shadow-2xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-[1400px] mx-auto flex-grow flex flex-col">
        {/* Page Title Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center p-2.5 bg-brand-yellow/10 rounded-xl border border-brand-yellow/20">
              <ShieldCheck className="w-6 h-6 text-brand-yellow" />
            </div>
            <h1 className="text-3xl font-heading text-text-primary tracking-tight font-bold">
              የአጽዳቂ ዳሽቦርድ <span className="text-brand-yellow text-xl ml-2 font-sans font-medium">(Approver Dashboard)</span>
            </h1>
          </div>
          <p className="text-text-secondary text-sm max-w-3xl leading-relaxed">
            እዚህ ላይ የተጠቃሚዎችን ግምገማ ውጤት ይመለከታሉ፣ አማካይ የገምጋሚዎችን (20 ነጥብ) ይገመግማሉ፣ የራስዎን (70 ነጥብ) ይሞላሉ፣ እንዲሁም ያፀድቃሉ። (Review averages, rate out of 70, and finalize.)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Minimal Wide Table */}
        <div className="bg-surface-primary overflow-hidden border border-border/80 shadow-md rounded-2xl mb-8 flex-grow">
          <div className="bg-surface-secondary/40 px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-brand-blue" />
              <h3 className="text-lg font-heading font-bold text-text-primary">የተጠቃሚዎች ውጤት ዝርዝር (Users Scores)</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold bg-surface-primary px-3 py-1 rounded-full text-text-secondary shadow-sm border border-border/60">
                {members.length} ተጠቃሚዎች
              </span>
              <button
                onClick={() => router.push(`/dashboard/assessment/teams/${periodId}/print-all`)}
                className="text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue/90 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ማጠቃለያ ፒዲኤፍ (Summary PDF)</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-secondary/30 text-text-secondary font-semibold border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">ተጠቃሚ (User)</th>
                  <th className="px-6 py-4 text-center">
                    የራስ ግምገማ <span className="text-xs font-normal text-text-muted ml-1">(10 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    የገምጋሚዎች ውጤት <span className="text-xs font-normal text-text-muted ml-1">(20 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-4 text-center border-l border-border/40 bg-brand-blue/5">
                    ድምር <span className="text-xs font-bold text-brand-blue/80 ml-1">(30 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-4 text-center border-l border-border/40 bg-brand-yellow/5">
                    የአጽዳቂ ውጤት <span className="text-xs font-bold text-brand-yellow ml-1">(70 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-4 text-center border-l border-border/40 bg-surface-secondary/20">
                    አጠቃላይ <span className="text-xs font-bold text-brand-blue ml-1">(100 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-4 text-center border-l border-border/40">
                    ድርጊት (Actions)
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
                    <tr key={m.user_id} className="hover:bg-surface-secondary/30 transition-colors">
                      {/* User Name (Clickable) */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedUser(m.user_id)}
                          className="flex items-center gap-3 text-left font-bold text-text-primary hover:text-brand-blue transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all border border-brand-blue/20">
                            {m.users?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <span className="text-sm font-bold block leading-tight">{m.users?.full_name || 'ያልታወቀ'}</span>
                            <span className="text-[11px] font-normal text-text-muted">{m.title || 'ተገምጋሚ'}</span>
                          </div>
                        </button>
                      </td>
                      
                      {/* Self 10 points */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-sm font-semibold px-3 py-1 bg-surface-secondary rounded-lg border border-border/50 text-text-primary">
                          {s10 > 0 ? s10 : '-'}
                        </span>
                      </td>

                      {/* Evaluators 20 points */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {s20Data?.submitted_count && s20Data.submitted_count > 0 ? (
                            <span className="font-mono text-sm font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                              {s20}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
                              በሂደት ላይ (0/{s20Data?.total_required || 0})
                            </span>
                          )}
                          {s20Data?.submitted_count && !s20Data.is_complete ? (
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              ({s20Data.submitted_count}/{s20Data.total_required})
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* 30 points Sum */}
                      <td className="px-6 py-4 text-center border-l border-border/40 bg-brand-blue/5">
                        <span className="font-mono text-sm font-bold text-text-primary">
                          {parseFloat((s10 + s20).toFixed(2))}
                        </span>
                      </td>

                      {/* Approver 70 points Input */}
                      <td className="px-6 py-4 text-center border-l border-border/40 bg-brand-yellow/5">
                        <input
                          type="number"
                          min={0}
                          max={70}
                          value={s70 === 0 ? '' : s70}
                          placeholder="0"
                          disabled={isFinalized}
                          onChange={(e) => handleApproverScoreChange(m.user_id, e.target.value)}
                          className="w-20 text-center font-mono text-sm font-bold text-brand-yellow bg-surface-primary border border-border/80 rounded-xl py-1.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all hover:border-brand-yellow/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Total 100 points */}
                      <td className="px-6 py-4 text-center font-mono font-extrabold text-base text-brand-blue border-l border-border/40 bg-surface-secondary/10">
                        {total}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-center border-l border-border/40">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setExpandedUser(m.user_id)}
                            className="text-xs font-semibold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 px-3 py-1.5 rounded-xl border border-brand-blue/20 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ዝርዝር (Details)</span>
                          </button>

                          {s10Data?.is_locked && (
                            <button
                              onClick={() => handleUnlockAssessment('self', m.user_id)}
                              disabled={saving}
                              className="text-[11px] font-medium text-text-secondary hover:text-brand-blue bg-surface-secondary px-2 py-1 rounded border border-border transition-all"
                              title="የራስ ግምገማ ክፈት (Unlock Self)"
                            >
                              <Unlock className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-auto mb-8 bg-surface-primary p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
          {isFinalized ? (
            <div className="w-full flex items-center justify-center py-3.5 px-6 rounded-xl font-semibold text-success bg-success/10 border border-success/30 shadow-sm">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              ግምገማው አስቀድሞ ፀድቋል (Evaluations already finalized)
            </div>
          ) : (
            <>
              {hasChanges && (
                <button
                  onClick={() => handleSaveAll(false)}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center py-3.5 px-6 rounded-xl font-semibold text-text-primary bg-surface-secondary hover:bg-border transition-all duration-200 disabled:opacity-50 border border-border/80 hover:shadow-sm active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  70 ነጥቦችን አስቀምጥ (Save Draft)
                </button>
              )}
              
              <button
                onClick={handleFinalize}
                disabled={saving}
                className="flex-[2] flex items-center justify-center py-3.5 px-6 rounded-xl font-semibold text-white bg-brand-blue hover:bg-brand-blue/90 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                ሁሉንም ውጤቶች አፅድቅ (Finalize All Scores)
              </button>
            </>
          )}
        </div>
      </div>

      {/* POPUP MODAL FOR DETAILS & SCORE EDITING */}
      {expandedUser && targetMemberForModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-surface-primary max-w-4xl w-full max-h-[90vh] rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Sticky Header */}
            <div className="px-6 py-4 bg-surface-secondary/60 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {targetMemberForModal.users?.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-text-primary">
                    {targetMemberForModal.users?.full_name}
                  </h3>
                  <p className="text-xs text-text-secondary">{targetMemberForModal.title || 'የቡድን አባል (Team Member)'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-surface-primary px-3.5 py-1.5 rounded-xl border border-border/60 text-xs font-semibold shadow-sm">
                  <span className="text-text-muted">አጠቃላይ ውጤት:</span>
                  <span className="text-base font-bold text-brand-blue">{targetTotalScore} / 100</span>
                </div>
                <button
                  onClick={() => setExpandedUser(null)}
                  className="w-8 h-8 rounded-full bg-surface-secondary hover:bg-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all border border-border/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              
              {/* Section 1: Edit Approver 70-Point Score */}
              <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <h4 className="font-heading font-bold text-text-primary text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                    የአጽዳቂ ውጤት (70 ነጥብ)
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    ለዚህ አባል የሚሰጡትን 70 ነጥብ እዚህ ያስገቡ ወይም ያስተካክሉ።
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-surface-primary p-2 rounded-xl border border-border/80 shadow-sm">
                  <span className="text-xs font-semibold text-text-secondary pl-2">ውጤት:</span>
                  <input
                    type="number"
                    min={0}
                    max={70}
                    value={targetApproverScoreVal === 0 ? '' : targetApproverScoreVal}
                    placeholder="0"
                    disabled={isFinalized}
                    onChange={(e) => handleApproverScoreChange(expandedUser, e.target.value)}
                    className="w-24 text-center font-mono text-lg font-bold text-brand-yellow bg-surface-secondary border border-border/80 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all disabled:opacity-50"
                  />
                  <span className="text-xs font-semibold text-text-muted pr-2">/ 70</span>
                </div>
              </div>

              {/* Section 2: Evaluators Detailed Responses (20 Points) */}
              <div>
                <h4 className="font-heading font-bold text-text-primary text-base mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-blue" />
                  የገምጋሚዎች ዝርዝር ምላሽ (Evaluators Detailed Breakdown)
                </h4>

                {targetEvalScoreForModal?.evaluations?.length && targetEvalScoreForModal.evaluations.length > 0 ? (
                  <div className="space-y-4">
                    {targetEvalScoreForModal.evaluations.map((ev: any) => (
                      <div key={ev.id} className="bg-surface-secondary/30 rounded-2xl border border-border/60 p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/40">
                          <span className="font-bold text-sm text-brand-blue flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                            {allUsersMap[ev.evaluator_id] || 'ያልታወቀ ገምጋሚ'}
                          </span>
                          <span className="text-xs font-mono bg-brand-blue/10 px-2.5 py-1 rounded-lg text-brand-blue font-bold border border-brand-blue/20">
                            ውጤት: {ev.score_20} / 20
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                          {LEADERSHIP_EVALUATION_QUESTIONS_20.map(cat => (
                            cat.questions.map(q => (
                              <div key={q.question_id} className="flex justify-between items-start py-1.5 border-b border-border/20">
                                <span className="text-text-secondary pr-3 leading-snug">
                                  <span className="font-mono font-semibold mr-1.5">{q.question_id}</span>
                                  {q.criteria}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    value={ev.responses?.[q.question_id] ?? ''}
                                    disabled={isFinalized}
                                    onChange={(e) => handleEvaluatorScoreChange(ev.id, expandedUser, q.question_id, e.target.value)}
                                    className="w-10 text-center text-xs font-semibold text-text-primary bg-surface-primary border border-border/80 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-blue/50 disabled:opacity-50"
                                  />
                                  <span className="text-[10px] text-text-muted">/ 5</span>
                                </div>
                              </div>
                            ))
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary text-sm bg-surface-secondary/20 rounded-2xl border border-dashed border-border">
                    ምንም የገምጋሚ ምላሽ የለም (No evaluator evaluations submitted yet)
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-secondary/60 border-t border-border/60 flex items-center justify-end gap-3">
              <button
                onClick={() => setExpandedUser(null)}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-brand-blue hover:bg-brand-blue/90 transition-all shadow-md"
              >
                እሺ (Done)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
