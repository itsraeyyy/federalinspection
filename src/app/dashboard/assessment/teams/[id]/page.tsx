'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ArrowLeft, Trash2, ShieldCheck, Loader2, Plus, QrCode, X, AlertCircle, Power, Pencil, Users, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { UserProfileDrawer } from '@/components/assessment/UserProfileDrawer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { registerUserAction } from '@/app/actions/auth';
import { exportBulkOverview } from '@/lib/exportUtils';

export default function PeriodManagePage() {
  const params = useParams();
  const periodId = params.id as string;
  const router = useRouter();

  const [period, setPeriod] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { s10: number, s20: number, s70: number, f100: number }>>({});
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  
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
        supabase.from('evaluations').select('target_user_id, score_20').eq('period_id', periodId),
        supabase.from('approver_evaluations').select('target_user_id, score_70').eq('period_id', periodId),
        supabase.from('final_scores').select('user_id, final_score_100').eq('period_id', periodId)
      ]);

      const scoreMap: Record<string, { s10: number, s20: number, s70: number, f100: number }> = {};
      
      selfRes.data?.forEach(s => {
        if (!scoreMap[s.user_id]) scoreMap[s.user_id] = { s10: 0, s20: 0, s70: 0, f100: 0 };
        scoreMap[s.user_id].s10 = s.score_10;
      });
      
      evalRes.data?.forEach(e => {
        if (!scoreMap[e.target_user_id]) scoreMap[e.target_user_id] = { s10: 0, s20: 0, s70: 0, f100: 0 };
        scoreMap[e.target_user_id].s20 += Number(e.score_20); // rough aggregate if multiple
      });
      
      apprRes.data?.forEach(a => {
        if (!scoreMap[a.target_user_id]) scoreMap[a.target_user_id] = { s10: 0, s20: 0, s70: 0, f100: 0 };
        scoreMap[a.target_user_id].s70 += Number(a.score_70);
      });

      finalRes.data?.forEach(f => {
        if (!scoreMap[f.user_id]) scoreMap[f.user_id] = { s10: 0, s20: 0, s70: 0, f100: 0 };
        scoreMap[f.user_id].f100 = f.final_score_100;
      });

      setScores(scoreMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodData();
  }, [periodId]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingRole(memberId);
    try {
      const { error } = await supabase
        .from('period_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      
      // Remove from pending roles
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
        }
      }
    });
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'አባል ማስወገድ',
      message: `እርግጠኛ ነዎት '${memberName}'ን ከምዘናው ማውጣት ይፈልጋሉ?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('period_members')
            .delete()
            .eq('id', memberId);

          if (error) throw error;
          
          setMembers(members.filter(m => m.id !== memberId));
          showToast('አባል በተሳካ ሁኔታ ተወግዷል!', 'success');
        } catch (err: any) {
          showToast(err.message || 'አባል ማስወገድ አልተሳካም።', 'error');
        }
      }
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName || !addPhone) return;

    setAddLoading(true);
    setAddError(null);

    try {
      const formData = new FormData();
      formData.append('periodId', periodId);
      formData.append('fullName', addFullName);
      formData.append('phone', addPhone);

      const result = await registerUserAction(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      setAddSuccess(true);
      setAddFullName('');
      setAddPhone('');
      fetchPeriodData(); // Refresh list
    } catch (err: any) {
      setAddError(err.message || 'አባል መጨመር አልተሳካም። (Failed to add member)');
    } finally {
      setAddLoading(false);
    }
  };

  const ROLES = [
    { value: 'regular', label: 'ተገምጋሚ / አባል' },
    { value: 'evaluator', label: 'ገምጋሚ' },
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
      const userScores = scores[m.user_id] || { s10: 0, s20: 0, s70: 0, f100: 0 };
      const currentTotal = userScores.s10 + userScores.s20 + userScores.s70;
      const roleLabel = ROLES.find(r => r.value === m.role)?.label || m.role;

      return {
        name: m.users?.full_name || 'ያልታወቀ',
        phone: m.users?.phone_number || '',
        role: roleLabel,
        s10: userScores.s10,
        s20: userScores.s20,
        s70: userScores.s70,
        total: period?.status === 'finalized' ? userScores.f100 : currentTotal
      };
    });

    exportBulkOverview(exportData, `${period?.name}_Overview.xlsx`);
  };

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
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-primary p-6 rounded-2xl border border-border shadow-sm">
            <div className="space-y-1 flex-1">
              <h1 className="text-3xl font-heading text-text-primary">{period.name}</h1>
              <p className="text-text-secondary text-sm font-mono opacity-60">መለያ: {period.id}</p>
            </div>
            
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-surface-secondary px-4 py-2 rounded-xl border border-border/50">
                <span className="text-sm font-medium text-text-primary">ሁኔታ:</span>
                <button 
                  onClick={handleStatusToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    period.status === 'active' ? 'bg-brand-blue' : 'bg-surface-primary border border-border'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    period.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm font-medium ${period.status === 'active' ? 'text-brand-blue' : 'text-text-secondary'}`}>
                  {period.status === 'active' ? 'በሂደት ላይ' : 'የተጠናቀቀ'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/dashboard/assessment/teams/${period.id}/qr`}
                  className="inline-flex items-center justify-center bg-surface-secondary text-text-primary px-4 py-2.5 rounded-xl font-medium hover:bg-border transition-colors border border-border shadow-sm"
                >
                  <QrCode className="w-4 h-4 mr-2 text-brand-yellow" />
                  የመመዝገቢያ QR
                </Link>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center bg-brand-blue text-white px-4 py-2.5 rounded-xl font-medium hover:bg-brand-blue/90 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  አዲስ አባል
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-lg font-heading text-text-primary">
              <Users className="w-5 h-5 text-brand-blue" />
              <h3>የተመዘገቡ ተጠቃሚዎች እና ውጤቶች</h3>
              <span className="bg-surface-secondary text-text-secondary px-3 py-1 rounded-full text-sm font-medium ml-2 border border-border/50">
                {filteredMembers.length}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border/50">
                <Filter className="w-4 h-4 text-text-secondary" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium text-text-primary focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="all">ሁሉም</option>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleBulkExport}
                className="inline-flex items-center justify-center bg-surface-secondary text-brand-blue px-4 py-2 rounded-xl font-medium hover:bg-border transition-colors border border-border/50 text-sm shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {selectedUserIds.size > 0 ? `የተመረጡትን አውርድ (${selectedUserIds.size})` : 'ሁሉንም አውርድ'}
              </button>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">ምንም ተጠቃሚ የለም (No users yet)</h3>
              <p className="text-text-secondary text-sm">
                በQR ኮዱ ወይም በመመዝገቢያ ሊንክ ሲመዘገቡ እዚህ ይታያሉ።
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-secondary text-text-secondary font-medium">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.size === filteredMembers.length && filteredMembers.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-border/80 text-brand-blue focus:ring-brand-blue/50 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4">ስም</th>
                    <th className="px-6 py-4">ሚና</th>
                    <th className="px-6 py-4 text-center">የራስ (10)</th>
                    <th className="px-6 py-4 text-center">የገምጋሚ (20)</th>
                    <th className="px-6 py-4 text-center">የአጽዳቂ (70)</th>
                    <th className="px-6 py-4 text-center border-l border-border/50 bg-surface-secondary/50">ድምር (100)</th>
                    <th className="px-6 py-4 border-l border-border/50">ድርጊት</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMembers.map((member) => {
                    const userScores = scores[member.user_id] || { s10: 0, s20: 0, s70: 0, f100: 0 };
                    const currentTotal = userScores.s10 + userScores.s20 + userScores.s70;
                    const isSelected = selectedUserIds.has(member.id);
                    
                    return (
                      <tr key={member.id} className={`hover:bg-surface-secondary/50 transition-colors ${isSelected ? 'bg-brand-blue/5' : ''}`}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleUserSelection(member.id)}
                            className="rounded border-border/80 text-brand-blue focus:ring-brand-blue/50 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => {
                              setSelectedProfileId(member.user_id);
                              setIsDrawerOpen(true);
                            }}
                            className="text-left group"
                          >
                            <p className="font-medium text-text-primary group-hover:text-brand-blue transition-colors">
                              {member.users?.full_name || 'ያልታወቀ'}
                            </p>
                            <p className="text-xs text-text-muted font-mono mt-0.5">{member.users?.phone_number}</p>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={pendingRoles[member.id] || member.role}
                              onChange={(e) => setPendingRoles({...pendingRoles, [member.id]: e.target.value})}
                              disabled={period.status !== 'active' || updatingRole === member.id}
                              className="bg-surface-primary border border-border text-text-primary text-xs rounded-lg focus:ring-brand-blue focus:border-brand-blue block p-2 disabled:opacity-50 min-w-[120px] shadow-sm hover:border-brand-blue/30 transition-colors"
                            >
                              {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            {pendingRoles[member.id] && pendingRoles[member.id] !== member.role && (
                              <button
                                onClick={() => handleRoleChange(member.id, pendingRoles[member.id])}
                                disabled={updatingRole === member.id}
                                className="bg-brand-blue text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-blue/90 transition-colors"
                              >
                                {updatingRole === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'አስቀምጥ'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {userScores.s10 > 0 ? (
                            <span className="text-brand-blue font-medium bg-brand-blue/10 px-2 py-0.5 rounded">{userScores.s10}</span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {userScores.s20 > 0 ? (
                            <span className="text-brand-blue font-medium bg-brand-blue/10 px-2 py-0.5 rounded">{userScores.s20}</span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {userScores.s70 > 0 ? (
                            <span className="text-brand-yellow font-medium bg-brand-yellow/10 px-2 py-0.5 rounded">{userScores.s70}</span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold border-l border-border/50 text-text-primary bg-surface-secondary/20">
                          {period.status === 'finalized' ? userScores.f100 : currentTotal}
                        </td>
                        <td className="px-6 py-4 border-l border-border/50 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedProfileId(member.user_id);
                              setIsDrawerOpen(true);
                            }}
                            className="text-brand-blue hover:text-brand-blue/80 bg-brand-blue/10 hover:bg-brand-blue/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-brand-blue/20"
                          >
                            መገለጫ
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.users?.full_name || 'ያልታወቀ')}
                            disabled={period.status !== 'active'}
                            className="text-danger hover:text-danger/80 bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 border border-danger/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-primary rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary bg-surface-secondary p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-heading text-text-primary mb-2">አዲስ አባል ጨምር</h2>
            <p className="text-sm text-text-secondary mb-6">የአባሉን ስም እና ስልክ ያስገቡ። የይለፍ ቃል ተፈጥሮ በፅሁፍ መልዕክት (SMS) ይላካል።</p>

            {addError && (
              <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg">
                {addError}
              </div>
            )}

            {addSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-heading text-text-primary mb-2">አባል በተሳካ ሁኔታ ተጨምሯል!</h3>
                <p className="text-text-secondary text-sm mb-6">
                  የይለፍ ቃል በፅሁፍ መልዕክት (SMS) ወደ አባሉ ስልክ ተልኳል።
                </p>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddSuccess(false);
                  }}
                  className="w-full bg-surface-secondary text-text-primary px-4 py-2.5 rounded-xl font-medium hover:bg-border transition-colors border border-border"
                >
                  ዝጋ
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">ሙሉ ስም</label>
                  <input
                    type="text"
                    required
                    value={addFullName}
                    onChange={(e) => setAddFullName(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
                    placeholder="አበበ ከበደ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">ስልክ ቁጥር</label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
                    placeholder="0911223344"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={addLoading || !addFullName || !addPhone}
                  className="w-full flex items-center justify-center bg-brand-blue text-white px-4 py-3 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50 mt-4"
                >
                  {addLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'መዝግብ እና SMS ላክ'}
                </button>
              </form>
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
