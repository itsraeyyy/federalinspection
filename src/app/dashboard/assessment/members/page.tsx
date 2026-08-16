'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, Plus, Search, Filter, Trash2, Edit3, UserCircle2, 
  Loader2, CheckCircle2, ShieldCheck, Users, AlertCircle, Phone, Building2
} from 'lucide-react';
import { UserProfileDrawer } from '@/components/assessment/UserProfileDrawer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { registerUserAction } from '@/app/actions/auth';
import { 
  updateAssessmentUserAction, 
  deleteAssessmentUserAction 
} from '@/app/actions/assessment';

export default function AssessmentMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Profile Drawer State
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirm Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Add Member Form Values
  const [addFullName, setAddFullName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('regular');
  const [addGender, setAddGender] = useState('');
  const [addAge, setAddAge] = useState('');
  const [addEducationLevel, setAddEducationLevel] = useState('');
  const [addProfessionalField, setAddProfessionalField] = useState('');
  const [addInstitution, setAddInstitution] = useState('');
  const [addGovResponsibility, setAddGovResponsibility] = useState('');
  const [addPartyResponsibility, setAddPartyResponsibility] = useState('');

  // Edit Member Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('regular');
  const [editGender, setEditGender] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editGovResponsibility, setEditGovResponsibility] = useState('');
  const [editPartyResponsibility, setEditPartyResponsibility] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // 1. Fetch all users from public.users
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });

      if (usersErr) throw usersErr;

      // 2. Fetch profiles
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('*');

      // 3. Fetch period_members for roles
      const { data: periodMembersData } = await supabase
        .from('period_members')
        .select('*');

      const profilesMap = new Map<string, any>();
      profilesData?.forEach(p => profilesMap.set(p.user_id, p));

      const rolesMap = new Map<string, string>();
      periodMembersData?.forEach(m => {
        if (m.role && !rolesMap.has(m.user_id)) {
          rolesMap.set(m.user_id, m.role);
        }
      });

      const combined = (usersData || [])
        .filter(u => u.full_name && !u.full_name.toLowerCase().startsWith('rep'))
        .map(u => ({
          ...u,
          profile: profilesMap.get(u.id) || {},
          role: rolesMap.get(u.id) || profilesMap.get(u.id)?.system_role || 'regular'
        }));

      setMembers(combined);
    } catch (err: any) {
      console.error('fetchMembers error:', err);
      showToast('አባላትን መጫን አልተሳካም።', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const formData = new FormData();
      formData.append('periodId', 'global'); // General registration
      formData.append('fullName', addFullName);
      formData.append('phone', addPhone);
      if (addEmail) formData.append('email', addEmail);
      formData.append('role', addRole);
      formData.append('gender', addGender);
      formData.append('age', addAge);
      formData.append('educationLevel', addEducationLevel);
      formData.append('professionalField', addProfessionalField);
      formData.append('institution', addInstitution);
      formData.append('govResponsibility', addGovResponsibility);
      formData.append('partyResponsibility', addPartyResponsibility);

      const result = await registerUserAction(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      setShowAddModal(false);
      setAddFullName('');
      setAddPhone('');
      setAddEmail('');
      setAddGender('');
      setAddAge('');
      setAddEducationLevel('');
      setAddProfessionalField('');
      setAddInstitution('');
      setAddGovResponsibility('');
      setAddPartyResponsibility('');

      const tempPass = result?.tempPassword;
      const memberPhone = result?.phone || addPhone;
      if (result?.smsDelivered === false && tempPass) {
        alert(`አባሉ በተሳካ ሁኔታ ተጨምሯል! ነገር ግን በቴክኒክ ምክንያት SMS መላክ አልተቻለም።\n\nጊዜያዊ የይለፍ ቃል፡ ${tempPass}\nስልክ ቁጥር፡ ${memberPhone}\n\nእባክዎ ይህንን የይለፍ ቃል ለአባሉ በቀጥታ ያሳውቁ።`);
      } else {
        showToast('አዲስ የምዘና አባል በተሳካ ሁኔታ ተመዝግቧል!', 'success');
      }

      fetchMembers();
    } catch (err: any) {
      setAddError(err.message || 'አባል መጨመር አልተሳካም።');
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = (member: any) => {
    setEditingUserId(member.id);
    setEditFullName(member.full_name || '');
    setEditPhone(member.phone_number || '');
    setEditRole(member.role || 'regular');
    setEditGender(member.profile?.gender || '');
    setEditInstitution(member.profile?.institution || '');
    setEditGovResponsibility(member.profile?.gov_responsibility || '');
    setEditPartyResponsibility(member.profile?.party_responsibility || '');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await updateAssessmentUserAction({
        userId: editingUserId,
        fullName: editFullName,
        phone: editPhone,
        role: editRole,
        gender: editGender,
        institution: editInstitution,
        govResponsibility: editGovResponsibility,
        partyResponsibility: editPartyResponsibility,
      });

      if (!res.success) throw new Error(res.error);

      setShowEditModal(false);
      showToast('የአባሉ መረጃ በተሳካ ሁኔታ ተዘምኗል!', 'success');
      fetchMembers();
    } catch (err: any) {
      setEditError(err.message || 'የአባሉን መረጃ ማዘመን አልተሳካም።');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMember = (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'አባል መሰረዝ',
      message: `እርግጠኛ ነዎት ${userName}ን ከስርዓቱ ሙሉ በሙሉ መሰረዝ ይፈልጋሉ?`,
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await deleteAssessmentUserAction(userId);
          if (!res.success) throw new Error(res.error);
          showToast('አባሉ በተሳካ ሁኔታ ተሰርዟል!', 'success');
          fetchMembers();
        } catch (err: any) {
          showToast(err.message || 'አባሉን መሰረዝ አልተሳካም።', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const ROLES = [
    { value: 'regular', label: 'ተመዛኝ / አባል (Regular)' },
    { value: 'evaluator', label: 'መዛኝ (Evaluator)' },
    { value: 'approver', label: 'አጽዳቂ (Approver)' }
  ];

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      (m.full_name?.toLowerCase().includes(search.toLowerCase())) ||
      (m.phone_number?.includes(search)) ||
      (m.profile?.institution?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
          <Link 
            href="/dashboard/assessment" 
            className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> ወደ የምዘና ጊዜያት ተመለስ
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary p-6 rounded-2xl border border-border shadow-sm">
            <div>
              <h1 className="text-3xl font-heading text-text-primary mb-1">የምዘና አባላት (Assessment Members)</h1>
              <p className="text-text-secondary text-sm">የተመዘገቡ የምዘና ተሳታፊዎችን፣ መዛኞችን እና አጽዳቂዎችን ያስተዳድሩ።</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center bg-brand-blue text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:bg-brand-blue/90 shadow-sm shrink-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              አዲስ አባል መዝግብ
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="በስም፣ በስልክ ወይም በተቋም ይፈልጉ..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-text-muted shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface-primary border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-primary cursor-pointer outline-none focus:border-brand-blue"
            >
              <option value="all">ሁሉም ሚናዎች ({members.length})</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label} ({members.filter(m => m.role === r.value).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Members Data Table */}
        {loading ? (
          <div className="py-20 text-center text-text-muted flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue mr-3" />
            <span>አባላት በመጫን ላይ...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center bg-surface-primary rounded-2xl border border-border border-dashed">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-medium text-text-primary mb-1">ምንም አባል አልተገኘም</h3>
            <p className="text-text-secondary text-sm">አዲስ የምዘና አባል በመመዝገብ ይጀምሩ።</p>
          </div>
        ) : (
          <div className="bg-surface-primary border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-surface-secondary/50 border-b border-border text-text-muted font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ተመዛኝ / አባል (Name & Phone)</th>
                    <th className="px-4 py-4">ሚና (Role)</th>
                    <th className="px-4 py-4">ተቋም / ኃላፊነት (Institution & Position)</th>
                    <th className="px-4 py-4">ጾታ (Gender)</th>
                    <th className="px-6 py-4 text-right">ድርጊቶች (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredMembers.map((member) => {
                    const roleBadge = 
                      member.role === 'evaluator' 
                        ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' 
                        : member.role === 'approver' 
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' 
                        : 'bg-blue-500/10 text-blue-600 border-blue-500/30';

                    const roleLabel = ROLES.find(r => r.value === member.role)?.label.split(' ')[0] || member.role;

                    return (
                      <tr key={member.id} className="hover:bg-surface-secondary/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-base shrink-0">
                              {member.full_name ? member.full_name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-text-primary">{member.full_name}</div>
                              <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                <Phone size={12} />
                                {member.phone_number}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleBadge}`}>
                            {roleLabel}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-xs text-text-primary font-medium">
                            {member.profile?.institution || 'ያልተጠቀሰ ተቋም'}
                          </div>
                          {member.profile?.gov_responsibility && (
                            <div className="text-[11px] text-text-muted truncate max-w-[200px]">
                              {member.profile.gov_responsibility}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap text-xs text-text-secondary">
                          {member.profile?.gender || '-'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Profile Drawer View */}
                            <button
                              onClick={() => {
                                setSelectedProfileId(member.id);
                                setIsDrawerOpen(true);
                              }}
                              className="p-2 rounded-lg bg-surface-secondary hover:bg-border/60 text-text-primary transition-colors"
                              title="ፕሮፋይል ይመልከቱ"
                            >
                              <UserCircle2 size={16} className="text-brand-blue" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-2 rounded-lg bg-surface-secondary hover:bg-border/60 text-text-primary transition-colors"
                              title="አስተካክል"
                            >
                              <Edit3 size={16} className="text-text-secondary" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteMember(member.id, member.full_name)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
                              title="ሰርዝ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-primary border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-text-primary">አዲስ የምዘና አባል መዝግብ</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-text-primary text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {addError && (
                <div className="p-3.5 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{addError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ሙሉ ስም *</label>
                  <input
                    type="text"
                    required
                    value={addFullName}
                    onChange={(e) => setAddFullName(e.target.value)}
                    placeholder="ለምሳሌ፡ አበበ ከበደ"
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ስልክ ቁጥር *</label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="0911000000"
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ኢሜይል (ምርጫዊ)</label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ሚና (Role) *</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ተቋም (Institution)</label>
                  <input
                    type="text"
                    value={addInstitution}
                    onChange={(e) => setAddInstitution(e.target.value)}
                    placeholder="ለምሳሌ፡ የብልፅግና ጽ/ቤት"
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">የመንግስት ኃላፊነት</label>
                  <input
                    type="text"
                    value={addGovResponsibility}
                    onChange={(e) => setAddGovResponsibility(e.target.value)}
                    placeholder="ኃላፊነት"
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">የፓርቲ ኃላፊነት</label>
                  <input
                    type="text"
                    value={addPartyResponsibility}
                    onChange={(e) => setAddPartyResponsibility(e.target.value)}
                    placeholder="የፓርቲ ኃላፊነት"
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ጾታ (Gender)</label>
                  <select
                    value={addGender}
                    onChange={(e) => setAddGender(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  >
                    <option value="">ይምረጡ</option>
                    <option value="ወንድ">ወንድ</option>
                    <option value="ሴት">ሴት</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-secondary"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  አስቀምጥ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-primary border border-border rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-text-primary">የአባል መረጃ አስተካክል</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-text-muted hover:text-text-primary text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMember} className="p-6 space-y-4">
              {editError && (
                <div className="p-3.5 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase">ሙሉ ስም</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase">ስልክ ቁጥር</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ሚና (Role)</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">ጾታ</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  >
                    <option value="">ይምረጡ</option>
                    <option value="ወንድ">ወንድ</option>
                    <option value="ሴት">ሴት</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase">ተቋም</label>
                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">የመንግስት ኃላፊነት</label>
                  <input
                    type="text"
                    value={editGovResponsibility}
                    onChange={(e) => setEditGovResponsibility(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase">የፓርቲ ኃላፊነት</label>
                  <input
                    type="text"
                    value={editPartyResponsibility}
                    onChange={(e) => setEditPartyResponsibility(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-surface-secondary border border-border rounded-xl text-sm focus:border-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-secondary"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  ለወጡትን አስቀምጥ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Drawer */}
      <UserProfileDrawer
        userId={selectedProfileId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={() => fetchMembers()}
      />

      {/* Confirm Action Modal */}
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
