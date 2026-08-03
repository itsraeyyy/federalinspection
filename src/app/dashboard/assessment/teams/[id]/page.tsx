'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  ArrowLeft, Trash2, ShieldCheck, Loader2, Plus, QrCode, X, AlertCircle, 
  Power, Pencil, Users, Filter, Download, UserCircle2, FileCheck, Printer, 
  Search, UserPlus, Check, CheckCircle2, Clock 
} from 'lucide-react';
import Link from 'next/link';
import { UserProfileDrawer } from '@/components/assessment/UserProfileDrawer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { registerUserAction } from '@/app/actions/auth';
import { exportBulkOverview } from '@/lib/exportUtils';
import { downloadPDFDocument } from '@/lib/exportToPDF';
import { AssessmentReportPDF } from '@/components/assessment/AssessmentReportPDF';
import { 
  LEADERSHIP_EVALUATION_QUESTIONS_20, 
  SELF_ASSESSMENT_QUESTIONS, 
  getPerformanceGradeLabel 
} from '@/lib/assessment-data';
import { 
  getExistingAssessmentUsersAction, 
  addExistingUsersToNewPeriodAction 
} from '@/app/actions/assessment';

export default function PeriodManagePage() {
  const params = useParams();
  const periodId = params.id as string;
  const router = useRouter();

  const [period, setPeriod] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { s10: number, s20: number, s70: number, f100: number, is20Complete?: boolean, evalProgress?: string, isApproved?: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [pdfLoadingUserId, setPdfLoadingUserId] = useState<string | null>(null);

  const handleDownloadIndividualPDF = async (member: any) => {
    const targetUserId = member.user_id;
    setPdfLoadingUserId(targetUserId);
    try {
      const [userRes, selfRes, evalRes, apprRes] = await Promise.all([
        supabase.from('users').select('*, user_profiles(*)').eq('id', targetUserId).single(),
        supabase.from('self_assessments').select('*').eq('period_id', periodId).eq('user_id', targetUserId).maybeSingle(),
        supabase.from('evaluations').select('*').eq('period_id', periodId).eq('target_user_id', targetUserId).eq('is_locked', true),
        supabase.from('approver_evaluations').select('*').eq('period_id', periodId).eq('target_user_id', targetUserId).maybeSingle()
      ]);

      const userObj = userRes.data || member.users || {};
      const profileObj = userRes.data?.user_profiles?.[0] || {};
      const selfData = selfRes.data;
      const evals = evalRes.data || [];
      const apprData = apprRes.data;

      let peerTotalWeight = 0, peerTotalScore = 0;
      const evaluatorTotals = new Array(evals.length).fill(0);

      const peerRows = LEADERSHIP_EVALUATION_QUESTIONS_20.flatMap(category =>
        category.questions.map(q => {
          const w = q.weight;
          peerTotalWeight += w;
          let validScores = 0, sumScores = 0;
          const scores = evals.map((ev, idx) => {
            const s = ev.responses?.[q.question_id];
            if (s !== undefined && s !== null) {
              evaluatorTotals[idx] += s * w;
              validScores++;
              sumScores += s;
              return s;
            }
            return '-';
          });

          const avgRaw = validScores > 0 ? sumScores / validScores : 0;
          const score = avgRaw * w;
          peerTotalScore += score;

          return { id: q.question_id, criteria: q.criteria, weight: w, scores, avgRaw: avgRaw.toFixed(2), score: score.toFixed(2) };
        })
      );
      const peer20 = peerTotalScore / 5;

      let selfTotalWeight = 0, selfTotalScore = 0;
      const selfRows = SELF_ASSESSMENT_QUESTIONS.flatMap(category =>
        category.questions.map(q => {
          const w = q.weight;
          selfTotalWeight += w;
          const sRaw = selfData?.responses?.[q.question_id];
          const score = sRaw ? sRaw * w : 0;
          selfTotalScore += score;
          return { id: q.question_id, criteria: q.criteria, weight: w, raw: sRaw || '-', score: score.toFixed(2) };
        })
      );
      const self10 = selfTotalScore / 10;
      const appr70 = Number(apprData?.score_70 || 0);
      const approverRemarks = apprData?.comments || apprData?.remarks || 'አስተያየት አልተሰጠም።';
      const sum30 = peer20 + self10;
      const final100 = sum30 + appr70;
      const grade = getPerformanceGradeLabel(final100);

      const docEl = React.createElement(AssessmentReportPDF, {
        user: userObj,
        profile: profileObj,
        period: period,
        evaluators: evals,
        peerRows,
        peerTotalWeight,
        evaluatorTotals,
        peerTotalScore,
        peer20,
        selfRows,
        selfTotalWeight,
        self10,
        sum30,
        appr70,
        final100,
        grade,
        approverRemarks
      });

      const safeName = (userObj.full_name || 'Member').replace(/\s+/g, '_');
      const safePeriod = (period?.name || 'Assessment').replace(/\s+/g, '_');
      await downloadPDFDocument(docEl, `የ_${safeName}_${safePeriod}_ሪፖርት.pdf`);
      showToast(`የ ${userObj.full_name || 'አባል'} ፒዲኤፍ ሪፖርት በተሳካ ሁኔታ ወርዷል!`, 'success');
    } catch (err: any) {
      console.error('PDF download error:', err);
      showToast(err.message || 'ፒዲኤፍ ማውረድ አልተሳካም።', 'error');
    } finally {
      setPdfLoadingUserId(null);
    }
  };
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');

  // Existing Users State
  const [existingUsers, setExistingUsers] = useState<{ user_id: string; full_name: string; phone_number: string; last_role: string }[]>([]);
  const [existingLoading, setExistingLoading] = useState(false);
  const [existingSearch, setExistingSearch] = useState('');
  const [selectedExistingMap, setSelectedExistingMap] = useState<Map<string, { user_id: string; full_name: string; phone_number: string; role: string }>>(new Map());

  // New Member Form State
  const [addFullName, setAddFullName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('regular');
  const [addGender, setAddGender] = useState('');
  const [addAge, setAddAge] = useState('');
  const [addEducationLevel, setAddEducationLevel] = useState('');
  const [addProfessionalField, setAddProfessionalField] = useState('');
  const [addExpProfessional, setAddExpProfessional] = useState('');
  const [addExpLeadership, setAddExpLeadership] = useState('');
  const [addInstitution, setAddInstitution] = useState('');
  const [addGovResponsibility, setAddGovResponsibility] = useState('');
  const [addPartyResponsibility, setAddPartyResponsibility] = useState('');
  
  // Profile Drawer State
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Filter & Export State
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPeriodData = async () => {
    try {
      const { data: periodData, error: periodErr } = await supabase
        .from('assessment_periods')
        .select('*')
        .eq('id', periodId)
        .single();
      
      if (periodErr) throw periodErr;
      setPeriod(periodData);

      const { data: membersData, error: membersErr } = await supabase
        .from('period_members')
        .select('*, users(full_name, phone_number)')
        .eq('period_id', periodId);

      if (membersErr) throw membersErr;
      setMembers(membersData || []);

      // Fetch scores
      const [selfRes, evalRes, apprRes, finalRes] = await Promise.all([
        supabase.from('self_assessments').select('user_id, score_10').eq('period_id', periodId),
        supabase.from('evaluations').select('target_user_id, score_20, is_locked').eq('period_id', periodId),
        supabase.from('approver_evaluations').select('target_user_id, score_70').eq('period_id', periodId),
        supabase.from('final_scores').select('user_id, final_score_100').eq('period_id', periodId)
      ]);

      const scoreMap: Record<string, { s10: number, s20: number, s70: number, f100: number, is20Complete?: boolean, evalProgress?: string, isApproved?: boolean }> = {};
      
      selfRes.data?.forEach(s => {
        if (!scoreMap[s.user_id]) scoreMap[s.user_id] = { s10: 0, s20: 0, s70: 0, f100: 0, isApproved: false };
        scoreMap[s.user_id].s10 = s.score_10;
      });

      const evaluatorMembers = (membersData || []).filter(m => 
        m.role === 'evaluator' || m.role === 'approver' || m.role === 'leader' || m.role === 'admin'
      );

      const evalGroups: Record<string, number[]> = {};
      evalRes.data?.forEach(e => {
        if (e.is_locked) {
          if (!evalGroups[e.target_user_id]) evalGroups[e.target_user_id] = [];
          evalGroups[e.target_user_id].push(Number(e.score_20));
        }
      });

      membersData?.forEach(m => {
        const targetId = m.user_id;
        if (!scoreMap[targetId]) scoreMap[targetId] = { s10: 0, s20: 0, s70: 0, f100: 0 };

        const eligibleEvaluatorCount = evaluatorMembers.filter(eMem => eMem.user_id !== targetId).length;
        const submittedScores = evalGroups[targetId] || [];
        const submittedCount = submittedScores.length;
        const isComplete = eligibleEvaluatorCount > 0 && submittedCount >= eligibleEvaluatorCount;

        if (isComplete) {
          const avg = submittedScores.reduce((a, b) => a + b, 0) / submittedCount;
          scoreMap[targetId].s20 = Number(avg.toFixed(1));
          scoreMap[targetId].is20Complete = true;
        } else {
          scoreMap[targetId].s20 = 0;
          scoreMap[targetId].is20Complete = false;
          scoreMap[targetId].evalProgress = `${submittedCount}/${eligibleEvaluatorCount}`;
        }
      });
      
      apprRes.data?.forEach(a => {
        if (!scoreMap[a.target_user_id]) scoreMap[a.target_user_id] = { s10: 0, s20: 0, s70: 0, f100: 0 };
        scoreMap[a.target_user_id].s70 += Number(a.score_70);
      });

      finalRes.data?.forEach(f => {
        if (!scoreMap[f.user_id]) scoreMap[f.user_id] = { s10: 0, s20: 0, s70: 0, f100: 0, isApproved: false };
        scoreMap[f.user_id].f100 = f.final_score_100;
        scoreMap[f.user_id].isApproved = true;
      });

      setScores(scoreMap as any);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodData();
  }, [periodId]);

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    setAddTab('existing');
    setAddError(null);
    setSelectedExistingMap(new Map());
    setExistingLoading(true);
    try {
      const res = await getExistingAssessmentUsersAction();
      setExistingUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setExistingLoading(false);
    }
  };

  const toggleExistingUser = (u: { user_id: string; full_name: string; phone_number: string; last_role: string }) => {
    setSelectedExistingMap(prev => {
      const next = new Map(prev);
      if (next.has(u.user_id)) {
        next.delete(u.user_id);
      } else {
        next.set(u.user_id, {
          user_id: u.user_id,
          full_name: u.full_name,
          phone_number: u.phone_number,
          role: u.last_role || 'regular'
        });
      }
      return next;
    });
  };

  const setExistingUserRole = (userId: string, role: string) => {
    setSelectedExistingMap(prev => {
      const next = new Map(prev);
      const item = next.get(userId);
      if (item) {
        next.set(userId, { ...item, role });
      }
      return next;
    });
  };

  const handleAddExistingMembers = async () => {
    if (selectedExistingMap.size === 0) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const usersToAdd = Array.from(selectedExistingMap.values());
      await addExistingUsersToNewPeriodAction({
        periodId,
        periodName: period?.name || 'ምዘና',
        users: usersToAdd
      });

      setShowAddModal(false);
      setSelectedExistingMap(new Map());
      showToast(`${usersToAdd.length} አባላት ወደ ምዘናው በተሳካ ሁኔታ ተጨምረዋል!`, 'success');
      fetchPeriodData();
    } catch (err: any) {
      setAddError(err.message || 'አባላትን መጨመር አልተሳካም።');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingRole(memberId);
    try {
      const { error } = await supabase
        .from('period_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      
      const newPending = { ...pendingRoles };
      delete newPending[memberId];
      setPendingRoles(newPending);

      showToast('ኃላፊነት በተሳካ ሁኔታ ተቀይሯል!', 'success');
    } catch (err: any) {
      showToast(err.message || 'ኃላፊነት መቀየር አልተሳካም።', 'error');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleStatusToggle = async () => {
    if (!period) return;
    const newStatus = period.status === 'active' ? 'finalized' : 'active';
    
    setConfirmDialog({
      isOpen: true,
      title: 'ሁኔታ መቀየር',
      message: `እርግጠኛ ነዎት ይህን የምዘና ጊዜ ወደ '${newStatus === 'active' ? 'በሂደት ላይ' : 'የተጠናቀቀ'}' መቀየር ይፈልጋሉ?`,
      isDanger: false,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('assessment_periods')
            .update({ status: newStatus })
            .eq('id', period.id);

          if (error) throw error;
          
          setPeriod({ ...period, status: newStatus });
          showToast('ሁኔታ በተሳካ ሁኔታ ተቀይሯል!', 'success');
        } catch (err: any) {
          showToast(err.message || 'ሁኔታ መቀየር አልተሳካም።', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'አባል ሰርዝ',
      message: `እርግጠኛ ነዎት ${memberName}ን ከዚህ ምዘና መሰረዝ ይፈልጋሉ?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('period_members')
            .delete()
            .eq('id', memberId);

          if (error) throw error;

          setMembers(members.filter(m => m.id !== memberId));
          showToast('አባል በተሳካ ሁኔታ ተሰርዟል!', 'success');
        } catch (err: any) {
          showToast(err.message || 'አባል መሰረዝ አልተሳካም።', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(false);

    try {
      const formData = new FormData();
      formData.append('periodId', periodId);
      formData.append('fullName', addFullName);
      formData.append('phone', addPhone);
      if (addEmail) formData.append('email', addEmail);
      formData.append('role', addRole);
      formData.append('gender', addGender);
      formData.append('age', addAge);
      formData.append('educationLevel', addEducationLevel);
      formData.append('professionalField', addProfessionalField);
      formData.append('expProfessional', addExpProfessional);
      formData.append('expLeadership', addExpLeadership);
      formData.append('institution', addInstitution);
      formData.append('govResponsibility', addGovResponsibility);
      formData.append('partyResponsibility', addPartyResponsibility);

      const result = await registerUserAction(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      setAddSuccess(true);
      setAddFullName('');
      setAddPhone('');
      setAddEmail('');
      setAddGender('');
      setAddAge('');
      setAddEducationLevel('');
      setAddProfessionalField('');
      setAddExpProfessional('');
      setAddExpLeadership('');
      setAddInstitution('');
      setAddGovResponsibility('');
      setAddPartyResponsibility('');
      setShowAddModal(false);
      showToast('አዲስ አባል በተሳካ ሁኔታ ተጨምሯል!', 'success');
      fetchPeriodData();
    } catch (err: any) {
      setAddError(err.message || 'አባል መጨመር አልተሳካም። (Failed to add member)');
    } finally {
      setAddLoading(false);
    }
  };

  const ROLES = [
    { value: 'regular', label: 'ተመዛኝ / አባል' },
    { value: 'evaluator', label: 'መዛኝ' },
    { value: 'approver', label: 'አጽዳቂ' }
  ];

  const filteredMembers = members.filter(m => roleFilter === 'all' || m.role === roleFilter);

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredMembers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const handleBulkExport = () => {
    const targetMembers = selectedUserIds.size > 0 
      ? members.filter(m => selectedUserIds.has(m.id))
      : filteredMembers;

    if (targetMembers.length === 0) {
      showToast('ምንም መረጃ አልተገኘም', 'error');
      return;
    }

    const exportData = targetMembers.map(m => {
      const userScores = scores[m.user_id] || { s10: 0, s20: 0, s70: 0, f100: 0, isApproved: false };
      const currentTotal = userScores.s10 + userScores.s20 + userScores.s70;
      const isApproved = userScores.isApproved || period?.status === 'finalized';
      const roleLabel = ROLES.find(r => r.value === m.role)?.label || m.role;

      return {
        name: m.users?.full_name || 'ያልታወቀ',
        phone: m.users?.phone_number || '',
        role: roleLabel,
        s10: userScores.s10,
        s20: userScores.s20,
        s30: Number((userScores.s10 + userScores.s20).toFixed(1)),
        s70: userScores.s70,
        total: period?.status === 'finalized' ? userScores.f100 : currentTotal
      };
    });

    exportBulkOverview(exportData, `${period?.name}_Overview.xlsx`);
  };

  // Eligible existing users not currently in this period
  const currentMemberUserIds = members.map(m => m.user_id);
  const eligibleExistingUsers = existingUsers.filter(u =>
    !currentMemberUserIds.includes(u.user_id) &&
    (u.full_name?.toLowerCase().includes(existingSearch.toLowerCase()) ||
     u.phone_number?.includes(existingSearch))
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        </div>
      </DashboardLayout>
    );
  }

  if (!period) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-heading text-text-primary mb-2">የምዘና ጊዜ አልተገኘም</h2>
          <Link href="/dashboard/assessment" className="text-brand-blue hover:underline">
            ወደ ዳሽቦርድ ተመለስ
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.message}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full relative">
        <div className="mb-6">
          <Link href="/dashboard/assessment" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> ወደ ዳሽቦርድ ተመለስ
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2">
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">{period.name}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-secondary">ሁኔታ:</span>
                <button 
                  onClick={handleStatusToggle}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:ring-offset-1 focus:ring-offset-background ${
                    period.status === 'active' ? 'bg-brand-blue' : 'bg-surface-secondary border border-border'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    period.status === 'active' ? 'translate-x-4.5' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm font-medium ${period.status === 'active' ? 'text-brand-blue' : 'text-text-muted'}`}>
                  {period.status === 'active' ? 'በሂደት ላይ' : 'የተጠናቀቀ'}
                </span>
              </div>
              
              <button 
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center bg-brand-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 mr-2" />
                አባል ጨምር (Add Member)
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 text-text-primary">
              <h3 className="text-xl font-semibold">የተመዘገቡ ተጠቃሚዎች</h3>
              <span className="bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 rounded-full text-xs font-bold ml-1">
                {filteredMembers.length}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-transparent border-b border-border pb-1 transition-colors focus-within:border-brand-blue">
                <Filter className="w-4 h-4 text-text-muted" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-text-primary focus:ring-0 cursor-pointer outline-none w-full"
                >
                  <option value="all">ሁሉም ሚናዎች (All Roles)</option>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleBulkExport}
                className="inline-flex items-center justify-center bg-transparent text-brand-blue px-3 py-1.5 rounded-lg font-medium hover:bg-brand-blue/10 transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {selectedUserIds.size > 0 ? `አውርድ (${selectedUserIds.size})` : 'ኤክሴል (Excel)'}
              </button>
              
              <Link
                href={`/dashboard/assessment/teams/${periodId}/print-all`}
                className="inline-flex items-center justify-center bg-brand-blue text-white px-3 py-1.5 rounded-lg font-medium hover:bg-brand-blue/90 transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                ሁሉንም ፒዲኤፍ አውርድ (Download All PDF)
              </Link>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">ምንም ተጠቃሚ የለም (No users yet)</h3>
              <p className="text-text-secondary text-sm">
                "አባል ጨምር" የሚለውን በመጫን ነባር ወይም አዲስ አባላትን መመዝገብ ይችላሉ።
              </p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="border-b-2 border-border/60 text-text-muted font-medium text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 pr-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.size === filteredMembers.length && filteredMembers.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-border/80 text-brand-blue focus:ring-brand-blue/50 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-2 py-3">ስም (Name)</th>
                    <th className="px-2 py-3">ሚና (Role)</th>
                    <th className="px-2 py-3 text-center">የራስ (10)</th>
                    <th className="px-2 py-3 text-center">የመዛኞች (20)</th>
                    <th className="px-2 py-3 text-center font-semibold text-brand-blue/80">ድምር (30)</th>
                    <th className="px-2 py-3 text-center">የአጽዳቂ (70)</th>
                    <th className="px-2 py-3 text-center text-brand-blue">ድምር (100)</th>
                    <th className="px-2 py-3 text-center">ሁኔታ (STATUS)</th>
                    <th className="pl-2 py-3 text-right">ድርጊት</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredMembers.map((member) => {
                    const userScores = scores[member.user_id] || { s10: 0, s20: 0, s70: 0, f100: 0 };
                    const currentTotal = userScores.s10 + userScores.s20 + userScores.s70;
                    const isSelected = selectedUserIds.has(member.id);
                    
                    return (
                      <tr key={member.id} className={`group/row transition-colors ${isSelected ? 'bg-brand-blue/5' : 'hover:bg-surface-secondary/20'}`}>
                        <td className="py-3 pr-4">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleUserSelection(member.id)}
                            className="rounded border-border/80 text-brand-blue focus:ring-brand-blue/50 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <div className="font-semibold text-text-primary">
                            {member.users?.full_name || 'ያልታወቀ ተጠቃሚ'}
                          </div>
                          <div className="text-xs text-text-muted">
                            {member.users?.phone_number}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={pendingRoles[member.id] !== undefined ? pendingRoles[member.id] : member.role}
                              onChange={(e) => setPendingRoles({ ...pendingRoles, [member.id]: e.target.value })}
                              disabled={updatingRole === member.id}
                              className="bg-surface-secondary border border-border rounded-lg px-2.5 py-1 text-xs font-medium text-text-primary focus:ring-1 focus:ring-brand-blue cursor-pointer outline-none hover:border-brand-blue/50 transition-colors"
                            >
                              {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>

                            {pendingRoles[member.id] !== undefined && pendingRoles[member.id] !== member.role && (
                              <button
                                onClick={() => handleRoleChange(member.id, pendingRoles[member.id])}
                                disabled={updatingRole === member.id}
                                className="p-1 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-all text-xs flex items-center gap-1 shrink-0 shadow-sm"
                                title="ለወጡትን አስቀምጥ"
                              >
                                {updatingRole === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-2 py-3 text-center font-mono text-xs">
                          {userScores.s10 > 0 ? userScores.s10.toFixed(1) : '-'}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-xs">
                          {userScores.is20Complete ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              {userScores.s20.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium border border-amber-200 dark:border-amber-800">
                              {userScores.evalProgress ? `${userScores.evalProgress}` : '0'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-xs font-bold text-brand-blue">
                          {userScores.s10 > 0 && userScores.is20Complete ? (userScores.s10 + userScores.s20).toFixed(1) : '-'}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-xs">
                          {userScores.s70 > 0 ? userScores.s70.toFixed(1) : '-'}
                        </td>
                        <td className="px-2 py-3 text-center font-mono text-sm font-bold text-text-primary">
                          {period.status === 'finalized' ? userScores.f100.toFixed(1) : (
                            userScores.s10 > 0 && userScores.is20Complete && userScores.s70 > 0 ? currentTotal.toFixed(1) : '-'
                          )}
                        </td>
                        <td className="px-2 py-3 text-center whitespace-nowrap">
                          {userScores.isApproved || period.status === 'finalized' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-full shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ፀድቋል</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-full shadow-xs">
                              <Clock className="w-3.5 h-3.5" />
                              <span>ያልፀደቀ</span>
                            </span>
                          )}
                        </td>

                        <td className="pl-2 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* Profile Button (Always visible) */}
                            <button
                              onClick={() => {
                                setSelectedProfileId(member.user_id);
                                setIsDrawerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-secondary hover:bg-border/60 text-text-primary text-xs font-medium border border-border/60 transition-colors cursor-pointer"
                              title="የአባሉን መረጃ ይመልከቱ"
                            >
                              <UserCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                              <span>ፕሮፋይል</span>
                            </button>

                            {/* PDF Download Button (Visible ONLY if approved or period finalized) */}
                            {(userScores.isApproved || period.status === 'finalized') && (
                              <button
                                onClick={() => handleDownloadIndividualPDF(member)}
                                disabled={pdfLoadingUserId === member.user_id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                title="የፀደቀውን ፒዲኤፍ አውርድ"
                              >
                                {pdfLoadingUserId === member.user_id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>ፒዲኤፍ</span>
                              </button>
                            )}

                            {/* Delete Button (Always visible) */}
                            <button
                              onClick={() => handleDeleteMember(member.id, member.users?.full_name || 'ተጠቃሚ')}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-danger/5 hover:bg-danger/10 text-danger text-xs font-medium border border-danger/20 transition-colors cursor-pointer"
                              title="አባሉን ይሰርዙ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>ሰርዝ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-surface-primary border border-border rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/60 flex items-center justify-between bg-surface-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-text-primary">አባል ወደ ምዘናው ጨምር</h2>
                  <p className="text-xs text-text-secondary">Add Member to Assessment Period</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-surface-secondary hover:bg-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-border/60 bg-surface-secondary/30">
              <button
                type="button"
                onClick={() => setAddTab('existing')}
                className={`flex-1 py-3.5 px-4 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
                  addTab === 'existing'
                    ? 'border-brand-blue text-brand-blue bg-surface-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ነባር አባል መምረጫ ({selectedExistingMap.size} ተመርጧል)</span>
              </button>
              <button
                type="button"
                onClick={() => setAddTab('new')}
                className={`flex-1 py-3.5 px-4 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
                  addTab === 'new'
                    ? 'border-brand-blue text-brand-blue bg-surface-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>አዲስ አባል መዝግብ</span>
              </button>
            </div>

            {addError && (
              <div className="m-4 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            {/* TAB 1: SELECT EXISTING MEMBER */}
            {addTab === 'existing' ? (
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={existingSearch}
                    onChange={(e) => setExistingSearch(e.target.value)}
                    placeholder="የአባሉን ስም ወይም ስልክ ቁጥር ይፈልጉ..."
                    className="w-full pl-11 pr-4 py-3 bg-surface-secondary/50 border border-border rounded-2xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/30 placeholder:text-text-muted font-medium"
                  />
                </div>

                {existingLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center text-text-muted text-sm gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                    <span>ነባር አባላትን በማውረድ ላይ...</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 min-h-[220px] max-h-[400px]">
                    {eligibleExistingUsers.length === 0 ? (
                      <div className="text-center py-12 text-text-muted text-sm bg-surface-secondary/20 rounded-2xl border border-dashed border-border/80">
                        {existingSearch ? 'ምንም ነባር አባል አልተገኘም።' : 'ሁሉም ነባር አባላት አስቀድመው በዚህ ምዘና ተመዝግበዋል።'}
                      </div>
                    ) : (
                      eligibleExistingUsers.map(u => {
                        const isSelected = selectedExistingMap.has(u.user_id);
                        const selectedItem = selectedExistingMap.get(u.user_id);

                        return (
                          <div
                            key={u.user_id}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                              isSelected
                                ? 'bg-brand-blue/5 border-brand-blue/40 shadow-sm'
                                : 'bg-surface-primary border-border/70 hover:border-border'
                            }`}
                          >
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleExistingUser(u)}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleExistingUser(u)}
                                className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue/30 cursor-pointer"
                              />
                              <div>
                                <p className="text-sm font-bold text-text-primary">{u.full_name}</p>
                                <p className="text-xs text-text-muted font-mono">{u.phone_number}</p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                                <span className="text-xs font-semibold text-text-secondary">ሚና:</span>
                                <select
                                  value={selectedItem?.role || 'regular'}
                                  onChange={(e) => setExistingUserRole(u.user_id, e.target.value)}
                                  className="px-3 py-1.5 bg-surface-secondary border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-blue/40 cursor-pointer"
                                >
                                  {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Footer for Existing User Tab */}
                <div className="pt-5 mt-4 border-t border-border flex items-center justify-between gap-3 shrink-0">
                  <p className="text-xs text-text-muted font-medium hidden sm:block">
                    {selectedExistingMap.size > 0 ? `${selectedExistingMap.size} አባላት ተመርጠዋል` : 'እባክዎ የሚጨምሩትን ነባር አባላት ይምረጡ'}
                  </p>
                  <div className="flex w-full sm:w-auto items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-2xl font-medium text-text-secondary bg-surface-secondary hover:bg-border/60 hover:text-text-primary transition-all text-sm"
                    >
                      ሰርዝ (Cancel)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExistingMembers}
                      disabled={addLoading || selectedExistingMap.size === 0}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 transition-all shadow-md disabled:opacity-50"
                    >
                      {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>{addLoading ? 'በመጨመር ላይ...' : `የተመረጡትን (${selectedExistingMap.size}) ወደ ምዘናው ጨምር`}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: REGISTER NEW MEMBER FORM */
              addSuccess ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-2">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-text-primary">አዲስ አባል በተሳካ ሁኔታ ተመዝግቧል!</h3>
                  <p className="text-sm text-text-secondary max-w-md">
                    የይለፍ ቃል በፅሁፍ መልዕክት (SMS) ወደ አባሉ ስልክ ተልኳል። አባሉ በዚህ መረጃ በመጠቀም መግባት ይችላል።
                  </p>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setAddSuccess(false);
                    }}
                    className="w-full max-w-xs bg-brand-blue text-white px-6 py-3 rounded-2xl font-semibold hover:bg-brand-blue/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    ጨርስ (Done)
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-surface-primary/50">
                    <form id="add-member-form" onSubmit={handleAddMember} className="space-y-10 max-w-3xl mx-auto">
                      
                      {/* Mandatory Fields Section */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                            <span className="font-bold text-sm">1</span>
                          </div>
                          <h3 className="text-lg font-semibold text-text-primary">አስፈላጊ መረጃዎች (Mandatory Fields)</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-primary p-6 rounded-3xl border border-border/80 shadow-sm">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                              ሙሉ ስም (Name) <span className="text-danger text-lg leading-none">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={addFullName}
                              onChange={(e) => setAddFullName(e.target.value)}
                              className="w-full px-5 py-3.5 bg-surface-secondary/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 text-text-primary placeholder:text-text-muted transition-all font-medium hover:border-border/80"
                              placeholder="አበበ ከበደ"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                              ስልክ ቁጥር (Phone) <span className="text-danger text-lg leading-none">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={addPhone}
                              onChange={(e) => setAddPhone(e.target.value)}
                              className="w-full px-5 py-3.5 bg-surface-secondary/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 text-text-primary placeholder:text-text-muted transition-all font-medium hover:border-border/80"
                              placeholder="0911223344"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                              ኢሜይል (Email) <span className="text-xs text-text-muted font-normal">(አማራጭ)</span>
                            </label>
                            <input
                              type="email"
                              value={addEmail}
                              onChange={(e) => setAddEmail(e.target.value)}
                              className="w-full px-5 py-3.5 bg-surface-secondary/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 text-text-primary placeholder:text-text-muted transition-all font-medium hover:border-border/80"
                              placeholder="user@example.com"
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                              የምዘና ሚና (Assessment Role) <span className="text-danger text-lg leading-none">*</span>
                            </label>
                            <select
                              value={addRole}
                              onChange={(e) => setAddRole(e.target.value)}
                              className="w-full px-5 py-3.5 bg-surface-secondary/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 text-text-primary font-medium transition-all cursor-pointer hover:border-border/80"
                            >
                              {ROLES.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-px bg-border/40"></div>

                      {/* Optional Profile Fields Section */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-6 opacity-80">
                          <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-muted shrink-0">
                            <span className="font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary">ተጨማሪ መረጃዎች</h3>
                            <p className="text-xs text-text-muted">(Optional Profile Fields)</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-surface-primary p-6 rounded-3xl border border-border/60 shadow-sm">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">ፆታ (Gender)</label>
                            <select
                              value={addGender}
                              onChange={(e) => setAddGender(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm transition-all"
                            >
                              <option value="">ያልተመረጠ (N/A)</option>
                              <option value="Male">ወንድ (Male)</option>
                              <option value="Female">ሴት (Female)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">ዕድሜ (Age)</label>
                            <input
                              type="number"
                              value={addAge}
                              onChange={(e) => setAddAge(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">የትምህርት ደረጃ</label>
                            <input
                              type="text"
                              value={addEducationLevel}
                              onChange={(e) => setAddEducationLevel(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">የትምህርት ዘርፍ</label>
                            <input
                              type="text"
                              value={addProfessionalField}
                              onChange={(e) => setAddProfessionalField(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">የስራ ልምድ/አመት</label>
                            <input
                              type="number"
                              value={addExpProfessional}
                              onChange={(e) => setAddExpProfessional(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">የአመራር ልምድ</label>
                            <input
                              type="number"
                              value={addExpLeadership}
                              onChange={(e) => setAddExpLeadership(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2 lg:col-span-3">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">ተቋም (Institution)</label>
                            <input
                              type="text"
                              value={addInstitution}
                              onChange={(e) => setAddInstitution(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2 lg:col-span-1 sm:col-span-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">የመንግስት ኃላፊነት</label>
                            <input
                              type="text"
                              value={addGovResponsibility}
                              onChange={(e) => setAddGovResponsibility(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                          <div className="space-y-2 lg:col-span-2 sm:col-span-2">
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">የፓርቲ ኃላፊነት</label>
                            <input
                              type="text"
                              value={addPartyResponsibility}
                              onChange={(e) => setAddPartyResponsibility(e.target.value)}
                              className="w-full px-4 py-3 bg-surface-secondary/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-text-primary text-sm placeholder:text-text-muted/50 transition-all"
                              placeholder="N/A"
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  {/* Fixed Footer */}
                  <div className="p-6 bg-surface-primary border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <p className="text-sm text-text-muted font-medium hidden sm:block">
                      አባሉን ከጨመሩ በኋላ የይለፍ ቃል በSMS ይላካል።
                    </p>
                    <div className="flex w-full sm:w-auto items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-medium text-text-secondary bg-surface-secondary hover:bg-border/60 hover:text-text-primary transition-all"
                      >
                        ሰርዝ (Cancel)
                      </button>
                      <button
                        type="submit"
                        form="add-member-form"
                        disabled={addLoading || !addFullName || !addPhone}
                        className="flex-1 sm:flex-none flex items-center justify-center bg-brand-blue text-white px-8 py-3.5 rounded-2xl font-semibold transition-all hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {addLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'መዝግብ እና SMS ላክ'}
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}

      <UserProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userId={selectedProfileId}
        periodId={periodId}
      />
      
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </DashboardLayout>
  );
}
