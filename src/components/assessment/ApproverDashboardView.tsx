'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldCheck, Save, Users, AlertCircle, Unlock, CheckCircle2, Eye, X, Printer, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LEADERSHIP_EVALUATION_QUESTIONS_20, getPerformanceGradeLabel } from '@/lib/assessment-data';
import { notifyFinalApprovalAction } from '@/app/actions/assessment';
import { downloadPDFDocument } from '@/lib/exportToPDF';
import { SummaryReportPDF } from '@/components/assessment/SummaryReportPDF';
import { SummaryMemberRow } from '@/components/assessment/EvaluationSummaryReport';

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
  const [approverRemarks, setApproverRemarks] = useState<Record<string, string>>({});
  const [questionRemarks, setQuestionRemarks] = useState<Record<string, string>>({});
  const [finalizedUserIds, setFinalizedUserIds] = useState<string[]>([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [periodData, setPeriodData] = useState<any>(null);

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

        const { data: pData } = await supabase
          .from('assessment_periods')
          .select('*')
          .eq('id', periodId)
          .single();
        
        setPeriodData(pData);

        if (pData?.status === 'finalized') {
          setIsFinalized(true);
        }

        const { data: usersData } = await supabase.from('users').select('id, full_name');
        const uMap: Record<string, string> = {};
        usersData?.forEach(u => { uMap[u.id] = u.full_name; });
        setAllUsersMap(uMap);

        const { data: membersData, error: memErr } = await supabase
          .from('period_members')
          .select('*, users(*, user_profiles(*))')
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
            score: Number(avg.toFixed(1)), 
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
        const aRemarks: Record<string, string> = {};
        approverData?.forEach(a => {
          aScores[a.target_user_id] = Number(a.score_70);
          aRemarks[a.target_user_id] = a.comments || a.remarks || '';
        });
        setApproverScores(aScores);
        setInitialApproverScores(aScores);
        setApproverRemarks(aRemarks);

        const { data: finalScoresData } = await supabase
          .from('final_scores')
          .select('user_id')
          .eq('period_id', periodId);

        setFinalizedUserIds((finalScoresData || []).map((f: any) => f.user_id));

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

  const handleApproverRemarksChange = (userId: string, val: string) => {
    setApproverRemarks(prev => ({
      ...prev,
      [userId]: val
    }));
  };

  const handleApproveSinglePerson = async (targetUserId: string) => {
    const s10 = selfScores[targetUserId]?.score || 0;
    const e20 = evalScores[targetUserId]?.score || 0;
    const s20Data = evalScores[targetUserId];
    const aScore70 = approverScores[targetUserId] || 0;

    if (s10 <= 0 || !s20Data?.is_complete || aScore70 <= 0) {
      const missing: string[] = [];
      if (s10 <= 0) missing.push('የራስ ምዘና (10%)');
      if (!s20Data?.is_complete) missing.push(`የመዛኞች ውጤት (20%) (${s20Data?.submitted_count || 0}/${s20Data?.total_required || 0} ተሞልቷል)`);
      if (aScore70 <= 0) missing.push('የአጽዳቂ ውጤት (70%)');
      showToast(`ማፅደቅ አይቻልም! እባክዎን የሚከተሉትን ያሟሉ: ${missing.join(', ')}`, 'error');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const currentUser: any = (await supabase.auth.getUser()).data?.user || (await supabase.auth.getSession()).data?.session?.user;
      if (!currentUser) throw new Error('ለማስቀመጥ እባክዎ መጀመሪያ ይግቡ (Not authenticated)');

      // Self-healing check: Ensure currentUser.id exists in public.users to prevent FK constraint error
      const { data: userExist } = await supabase.from('users').select('id').eq('id', currentUser.id).maybeSingle();
      if (!userExist) {
        await supabase.from('users').insert({
          id: currentUser.id,
          full_name: currentUser.email?.split('@')[0] || 'አጽዳቂ (Approver)',
          phone_number: currentUser.email || currentUser.id
        });
      }

      const aComments = approverRemarks[targetUserId] || '';

      // 1. Upsert into approver_evaluations
      const { error: appErr } = await supabase
        .from('approver_evaluations')
        .upsert({
          period_id: periodId,
          approver_id: currentUser.id,
          target_user_id: targetUserId,
          score_70: aScore70,
          comments: aComments,
          is_locked: true
        }, { onConflict: 'period_id, approver_id, target_user_id' });

      if (appErr) throw appErr;

      // 2. Compute final score for this single user
      const s10 = selfScores[targetUserId]?.score || 0;
      const e20 = evalScores[targetUserId]?.score || 0;
      const score30 = Number((s10 + e20).toFixed(1));
      const final100 = Number((score30 + aScore70).toFixed(1));

      // 3. Upsert into final_scores
      const { error: finalErr } = await supabase
        .from('final_scores')
        .upsert({
          period_id: periodId,
          user_id: targetUserId,
          score_30: score30,
          final_score_100: final100
        }, { onConflict: 'period_id, user_id' });

      if (finalErr) throw finalErr;

      // 4. Send SMS notification to the approved user
      notifyFinalApprovalAction({
        periodId,
        userId: targetUserId,
        finalScore: final100
      }).catch(err => console.error('Failed to send SMS notification:', err));

      setFinalizedUserIds(prev => Array.from(new Set([...prev, targetUserId])));
      const targetUserObj = members.find(m => m.user_id === targetUserId);
      const name = targetUserObj?.users?.full_name || 'አባል';

      showToast(`የ ${name} ውጤት በተሳካ ሁኔታ ፀድቋል! (SMS ተልኳል)`, 'success');

      if (expandedUser === targetUserId) {
        setExpandedUser(null);
      }
    } catch (err: any) {
      setError(err.message || 'ማፅደቅ አልተሳካም።');
      showToast(err.message || 'ማፅደቅ አልተሳካም', 'error');
    } finally {
      setSaving(false);
    }
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
        showToast('የራስ ምዘናው በተሳካ ሁኔታ ተከፍቷል! (Self assessment unlocked)', 'success');
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
        showToast('የመዛኞች ምዘናዎች በተሳካ ሁኔታ ተከፍተዋል! (Evaluations unlocked)', 'success');
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
        comments: approverRemarks[m.user_id] || '',
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
        showToast('ምዘናዎቹ በተሳካ ሁኔታ ተቀምጠዋል! (Saved successfully)', 'success');
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
        const incompleteMember = members.find(m => {
          const s10 = selfScores[m.user_id]?.score || 0;
          const s20Data = evalScores[m.user_id];
          const s70 = approverScores[m.user_id] || 0;
          return s10 <= 0 || !s20Data?.is_complete || s70 <= 0;
        });

        if (incompleteMember) {
          const name = incompleteMember.users?.full_name || 'አባል';
          showToast(`የ ${name} ምዘናዎች አልተጠናቀቁም። (ለማፅደቅ 10%፣ 20% እና 70% በሙሉ መሞላት አለባቸው)`, 'error');
          return;
        }

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
    const updatedScore20 = parseFloat((raw_score / 5).toFixed(1));

    const updatedEvaluations = [...targetEvalScore.evaluations];
    updatedEvaluations[evaluationIndex] = {
      ...evaluation,
      responses: updatedResponses,
      score_20: updatedScore20
    };

    const lockedScores = updatedEvaluations.filter(e => e.is_locked).map(e => e.score_20);
    const newAvg = lockedScores.length > 0
      ? parseFloat((lockedScores.reduce((a, b) => a + b, 0) / lockedScores.length).toFixed(1))
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
  const targetTotalScore = parseFloat((targetSelfScore + targetEvalScoreVal + targetApproverScoreVal).toFixed(1));

  const handleDownloadSummaryPDF = async () => {
    setDownloadingPDF(true);
    try {
      const summaryRows: SummaryMemberRow[] = members.map(m => {
        const userId = m.user_id;
        const userObj = m.users || {};
        const profileObj = userObj.user_profiles?.[0] || {};

        const s10 = selfScores[userId]?.score || 0;
        const e20 = evalScores[userId]?.score || 0;
        const a70 = approverScores[userId] || 0;
        const sum30 = s10 + e20;
        const final100 = sum30 + a70;
        const grade = getPerformanceGradeLabel(final100);

        return {
          id: userId,
          full_name: userObj.full_name || 'ያልታወቀ',
          phone_number: userObj.phone_number || '',
          institution: profileObj.institution || '',
          gov_responsibility: profileObj.gov_responsibility || '',
          party_responsibility: profileObj.party_responsibility || '',
          gender: profileObj.gender || '',
          education_level: profileObj.education_level || '',
          score10: s10,
          score20: e20,
          sum30: sum30,
          score70: a70,
          final100: final100,
          grade: grade,
          status: finalizedUserIds.includes(userId) || isFinalized ? 'ፀድቋል' : 'ያልፀደቀ'
        };
      });

      const docEl = <SummaryReportPDF period={periodData} members={summaryRows} />;
      const safePeriodName = (periodData?.name || 'Assessment').replace(/\s+/g, '_');
      await downloadPDFDocument(docEl, `የ_${safePeriodName}_የአካቲቭ_ምዘና_ማጠቃለያ_ሪፖርት.pdf`);
      showToast('ማጠቃለያ ፒዲኤፍ ሪፖርት በተሳካ ሁኔታ ወርዷል!', 'success');
    } catch (err: any) {
      console.error('Download summary PDF error:', err);
      showToast(err.message || 'ማጠቃለያ ፒዲኤፍ ማውረድ አልተሳካም።', 'error');
    } finally {
      setDownloadingPDF(false);
    }
  };

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
            እዚህ ላይ የተጠቃሚዎችን የምዘና ውጤት ይመለከታሉ፣ የመዛኞችን (20 ነጥብ) ይመረምራሉ፣ የራስዎን (70 ነጥብ) ይሞላሉ፣ እንዲሁም ያፀድቃሉ። (Review averages, rate out of 70, and finalize.)
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
                onClick={handleDownloadSummaryPDF}
                disabled={downloadingPDF}
                className="text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue/90 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {downloadingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
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
                    የራስ ምዘና <span className="text-xs font-normal text-text-muted ml-1">(10 ነጥብ)</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    የመዛኞች ውጤት <span className="text-xs font-normal text-text-muted ml-1">(20 ነጥብ)</span>
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
                  const total = parseFloat((s10 + s20 + s70).toFixed(1));

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
                            <span className="text-[11px] font-normal text-text-muted">{m.title || 'ተመዛኝ'}</span>
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
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-center gap-2">
                            {s20Data?.is_complete ? (
                              <span className="font-mono text-sm font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                                {s20}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
                                በሂደት ላይ ({s20Data?.submitted_count || 0}/{s20Data?.total_required || 0})
                              </span>
                            )}
                          </div>

                          {/* View Details button placed under 20% score */}
                          <button
                            onClick={() => setExpandedUser(m.user_id)}
                            className="text-[11px] font-semibold text-brand-blue hover:text-brand-blue/80 bg-brand-blue/10 hover:bg-brand-blue/20 px-2.5 py-1 rounded-lg border border-brand-blue/20 transition-all flex items-center gap-1 shadow-sm"
                            title="የ 20% ምዘና ዝርዝር እና ማስተካከያ (View/Edit 20% Details)"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ዝርዝር (Details)</span>
                          </button>
                        </div>
                      </td>

                      {/* 30 points Sum */}
                      <td className="px-6 py-4 text-center border-l border-border/40 bg-brand-blue/5">
                        <span className="font-mono text-sm font-bold text-text-primary">
                          {s10 > 0 && s20Data?.is_complete ? parseFloat((s10 + s20).toFixed(1)) : '-'}
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
                          disabled={isFinalized || finalizedUserIds.includes(m.user_id)}
                          onChange={(e) => handleApproverScoreChange(m.user_id, e.target.value)}
                          className="w-20 text-center font-mono text-sm font-bold text-brand-yellow bg-surface-primary border border-border/80 rounded-xl py-1.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all hover:border-brand-yellow/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Total 100 points */}
                      <td className="px-6 py-4 text-center font-mono font-extrabold text-base text-brand-blue border-l border-border/40 bg-surface-secondary/10">
                        {s10 > 0 && s20Data?.is_complete && s70 > 0 ? (
                          <div className="flex flex-col items-center justify-center">
                            <span>{total}</span>
                            <span className="text-[10px] font-semibold text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-full border border-border/60">
                              ({getPerformanceGradeLabel(total)})
                            </span>
                          </div>
                        ) : '-'}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-center border-l border-border/40">
                        <div className="flex items-center justify-center gap-2">
                          {finalizedUserIds.includes(m.user_id) || isFinalized ? (
                            <span className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-xl border border-success/20 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ፀድቋል</span>
                            </span>
                          ) : (
                            (() => {
                              const isEligible = s10 > 0 && s20Data?.is_complete && s70 > 0;
                              return (
                                <button
                                  onClick={() => handleApproveSinglePerson(m.user_id)}
                                  disabled={saving || !isEligible}
                                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                                    isEligible
                                      ? 'text-white bg-brand-blue hover:bg-brand-blue/90 active:scale-95'
                                      : 'text-text-muted bg-surface-secondary border border-border/80 opacity-60 cursor-not-allowed'
                                  }`}
                                  title={
                                    isEligible
                                      ? 'የዚህን አባል ውጤት አፅድቅ (Approve)'
                                      : 'ለማፅደቅ የ 10%፣ 20% (100% አባላት) እና 70% መሞላት አለባቸው'
                                  }
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>አፅድቅ</span>
                                </button>
                              );
                            })()
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
              ምዘናው አስቀድሞ ፀድቋል (Evaluations already finalized)
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
                  <span className="text-base font-bold text-brand-blue">
                    {targetSelfScore > 0 && targetEvalScoreForModal?.is_complete && targetApproverScoreVal > 0 
                      ? `${targetTotalScore} / 100 (${getPerformanceGradeLabel(targetTotalScore)})` 
                      : 'በሂደት ላይ (In Progress)'}
                  </span>
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
              
              {/* Section 1: Edit Approver 70-Point Score & Required Remarks Box */}
              <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-heading font-bold text-text-primary text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                      የአጽዳቂ ውጤት (70 ነጥብ)
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      ለዚህ አባል የሚሰጡትን 70 ነጥብ እዚህ ያስገቡ ወይም ያስተካክሉ።
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-primary p-2 rounded-xl border border-border/80 shadow-sm shrink-0">
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


              </div>

              {/* Section 2: Evaluators Detailed Responses (20 Points) */}
              <div>
                <h4 className="font-heading font-bold text-text-primary text-base mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-blue" />
                  የመዛኞች ዝርዝር ምላሽ (Evaluators Detailed Breakdown)
                </h4>

                {targetEvalScoreForModal?.evaluations?.length && targetEvalScoreForModal.evaluations.length > 0 ? (
                  <div className="space-y-4">
                    {targetEvalScoreForModal.evaluations.map((ev: any, eIdx: number) => (
                      <div key={ev.id} className="bg-surface-secondary/30 rounded-2xl border border-border/60 p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/40">
                          <span className="font-bold text-sm text-brand-blue flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                            መዛኝ {eIdx + 1} (Evaluator {eIdx + 1})
                          </span>
                          <span className="text-xs font-mono bg-brand-blue/10 px-2.5 py-1 rounded-lg text-brand-blue font-bold border border-brand-blue/20">
                            ውጤት: {ev.score_20} / 20
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                          {LEADERSHIP_EVALUATION_QUESTIONS_20.map(cat => (
                            cat.questions.map(q => {
                              const scoreVal = Number(ev.responses?.[q.question_id]);
                              const ratingTextMap: Record<number, string> = {
                                5: 'በጣም ከፍተኛ',
                                4: 'ከፍተኛ',
                                3: 'መካከለኛ',
                                2: 'ዝቅተኛ',
                                1: 'በጣም ዝቅተኛ'
                              };
                              const ratingText = ratingTextMap[scoreVal] || 'ያልተሞላ';

                              const qRemarkKey = `${ev.id}:${q.question_id}`;

                              return (
                                <div key={q.question_id} className="py-2.5 border-b border-border/20 last:border-0">
                                  {/* Row: question label + rating dropdown */}
                                  <div className="flex justify-between items-center gap-2 mb-1.5">
                                    <span className="text-text-secondary leading-snug">
                                      <span className="font-mono font-semibold mr-1.5">{q.question_id}</span>
                                      {q.criteria}
                                    </span>
                                    <div className="shrink-0">
                                      <select
                                        value={scoreVal || 5}
                                        disabled={isFinalized || finalizedUserIds.includes(expandedUser)}
                                        onChange={(e) => handleEvaluatorScoreChange(ev.id, expandedUser, q.question_id, e.target.value)}
                                        className="text-xs font-bold bg-surface-primary text-brand-blue border border-brand-blue/30 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 cursor-pointer disabled:opacity-50 shadow-sm"
                                      >
                                        <option value={5}>በጣም ከፍተኛ (5)</option>
                                        <option value={4}>ከፍተኛ (4)</option>
                                        <option value={3}>መካከለኛ (3)</option>
                                        <option value={2}>ዝቅተኛ (2)</option>
                                        <option value={1}>በጣም ዝቅተኛ (1)</option>
                                      </select>
                                    </div>
                                  </div>
                                  {/* Per-question approver remarks box */}
                                  <textarea
                                    value={questionRemarks[qRemarkKey] || ''}
                                    onChange={(e) => setQuestionRemarks(prev => ({ ...prev, [qRemarkKey]: e.target.value }))}
                                    disabled={isFinalized || finalizedUserIds.includes(expandedUser)}
                                    placeholder={`${q.question_id} ላይ አስተያየት ያስገቡ...`}
                                    rows={2}
                                    className="w-full text-xs p-2 bg-surface-primary border border-border/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue/40 text-text-primary resize-none placeholder:text-text-muted/60 disabled:opacity-50"
                                  />
                                </div>
                              );
                            })
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary text-sm bg-surface-secondary/20 rounded-2xl border border-dashed border-border">
                    ምንም የመዛኝ ምላሽ የለም (No evaluator evaluations submitted yet)
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-secondary/60 border-t border-border/60 flex items-center justify-between gap-3">
              <div>
                {!finalizedUserIds.includes(expandedUser) && !isFinalized && (() => {
                  const modalS10 = selfScores[expandedUser]?.score || 0;
                  const modalS20Data = evalScores[expandedUser];
                  const modalS70 = approverScores[expandedUser] || 0;
                  const isModalUserEligible = modalS10 > 0 && modalS20Data?.is_complete && modalS70 > 0;

                  return (
                    <button
                      onClick={() => handleApproveSinglePerson(expandedUser)}
                      disabled={saving || !isModalUserEligible}
                      className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                        isModalUserEligible
                          ? 'text-white bg-brand-blue hover:bg-brand-blue/90 active:scale-95'
                          : 'text-text-muted bg-surface-secondary border border-border/80 opacity-60 cursor-not-allowed'
                      }`}
                      title={
                        isModalUserEligible
                          ? 'የዚህን አባል ውጤት አፅድቅ (Approve)'
                          : 'ለማፅደቅ የ 10%፣ 20% (100% አባላት) እና 70% መሞላት አለባቸው'
                      }
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>የ {targetMemberForModal.users?.full_name?.split(' ')[0]} ውጤት አፅድቅ (Approve)</span>
                    </button>
                  );
                })()}
              </div>

              <button
                onClick={() => setExpandedUser(null)}
                className="px-6 py-2.5 rounded-xl font-medium text-text-primary bg-surface-primary hover:bg-border transition-all border border-border"
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
