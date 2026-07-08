'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ArrowLeft, Trash2, ShieldCheck, Loader2, Plus, QrCode, X, AlertCircle, Power, Pencil, Users, Filter, Download, UserCircle2, FileCheck, Printer } from 'lucide-react';
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addPhone, setAddPhone] = useState('');
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
        s30: Number((userScores.s10 + userScores.s20).toFixed(2)),
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
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center bg-brand-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 mr-2" />
                አዲስ አባል (Add Member)
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
                በQR ኮዱ ወይም በመመዝገቢያ ሊንክ ሲመዘገቡ እዚህ ይታያሉ።
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
                    <th className="px-2 py-3 text-center">የገምጋሚ (20)</th>
                    <th className="px-2 py-3 text-center font-semibold text-brand-blue/80">ድምር (30)</th>
                    <th className="px-2 py-3 text-center">የአጽዳቂ (70)</th>
                    <th className="px-2 py-3 text-center text-brand-blue">ድምር (100)</th>
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
                          <button 
                            onClick={() => {
                              setSelectedProfileId(member.user_id);
                              setIsDrawerOpen(true);
                            }}
                            className="text-left flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
                          >
                            <span className="font-medium text-text-primary transition-colors truncate max-w-[200px]">
                              {member.users?.full_name || 'ያልታወቀ'}
                            </span>
                            <span className="text-xs text-text-muted mt-0.5">{member.users?.phone_number}</span>
                          </button>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={pendingRoles[member.id] || member.role}
                              onChange={(e) => setPendingRoles({...pendingRoles, [member.id]: e.target.value})}
                              disabled={period.status !== 'active' || updatingRole === member.id}
                              className="bg-transparent border-0 hover:bg-surface-secondary/50 text-text-secondary text-sm rounded focus:ring-1 focus:ring-brand-blue focus:border-brand-blue block py-1 disabled:opacity-50 min-w-[100px] transition-colors outline-none cursor-pointer"
                            >
                              {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            {pendingRoles[member.id] && pendingRoles[member.id] !== member.role && (
                              <button
                                onClick={() => handleRoleChange(member.id, pendingRoles[member.id])}
                                disabled={updatingRole === member.id}
                                className="bg-brand-blue text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-blue/90 transition-all hover:scale-105 active:scale-95"
                              >
                                {updatingRole === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'አስቀምጥ'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center">
                          {userScores.s10 > 0 ? (
                            <span className="text-text-secondary">{userScores.s10}</span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {userScores.s20 > 0 ? (
                            <span className="text-text-secondary">{userScores.s20}</span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center font-medium text-text-primary">
                          {(userScores.s10 > 0 || userScores.s20 > 0) ? (
                            Number((userScores.s10 + userScores.s20).toFixed(2))
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {userScores.s70 > 0 ? (
                            <span className="text-text-secondary">{userScores.s70}</span>
                          ) : (
                            <span className="text-border">-</span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-brand-blue">
                          {period.status === 'finalized' ? userScores.f100 : currentTotal}
                        </td>
                        <td className="pl-2 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedProfileId(member.user_id);
                                setIsDrawerOpen(true);
                              }}
                              className="text-text-secondary hover:text-brand-blue hover:bg-brand-blue/10 p-1.5 rounded-md transition-colors"
                              title="መገለጫ (Profile)"
                            >
                              <UserCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id, member.users?.full_name || 'ያልታወቀ')}
                              disabled={period.status !== 'active'}
                              className="text-text-secondary hover:text-danger hover:bg-danger/10 p-1.5 rounded-md transition-colors disabled:opacity-30"
                              title="አስወግድ (Remove)"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-surface-primary rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[95vh] flex flex-col border border-border/60 overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-border/50 bg-surface-secondary/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue/80 to-brand-blue/20"></div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 text-text-muted hover:text-text-primary bg-surface-primary hover:bg-surface-secondary p-2.5 rounded-full transition-all border border-border/50 hover:shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-heading font-bold text-text-primary mb-2 flex items-center gap-3">
                <div className="p-2.5 bg-brand-blue/10 rounded-2xl border border-brand-blue/10">
                  <UserCircle2 className="w-6 h-6 text-brand-blue" />
                </div>
                አዲስ አባል ጨምር <span className="text-text-muted font-normal text-lg">(Add New Member)</span>
              </h2>
              <p className="text-sm text-text-secondary ml-14 max-w-2xl">
                የአባሉን መረጃ ያስገቡ። ስም፣ ስልክ ቁጥር እና ሚና <span className="text-danger font-medium bg-danger/10 px-1.5 py-0.5 rounded text-xs ml-1">ግዴታ</span> ናቸው። የይለፍ ቃል ተፈጥሮ በፅሁፍ መልዕክት (SMS) ይላካል።
              </p>
            </div>

            {addError && (
              <div className="m-6 mb-0 p-4 bg-danger/10 border-l-4 border-danger text-danger text-sm font-medium rounded-r-xl flex items-center">
                <div className="mr-3 text-lg">•</div>
                {addError}
              </div>
            )}

            {addSuccess ? (
              <div className="text-center py-12 flex-1 flex flex-col justify-center items-center">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 border border-success/20">
                  <ShieldCheck className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-text-primary mb-3">አባል በተሳካ ሁኔታ ተጨምሯል!</h3>
                <p className="text-text-secondary text-base mb-8 max-w-md">
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
