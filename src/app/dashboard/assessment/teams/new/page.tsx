'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  LayoutTemplate, 
  PlusCircle, 
  CheckCircle2, 
  Search, 
  UserCheck, 
  Users, 
  UserPlus, 
  X, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  createAssessmentPeriodAction, 
  getExistingAssessmentUsersAction, 
  addExistingUsersToNewPeriodAction 
} from '@/app/actions/assessment';
import { registerUserAction } from '@/app/actions/auth';

type ExistingUser = {
  user_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  last_role: string;
};

type SelectedUser = ExistingUser & { role: string };

type NewMemberDraft = {
  id: string;
  fullName: string;
  phone: string;
  role: string;
};

const ROLE_OPTIONS = [
  { value: 'regular', label: 'ተመዛኝ (Regular)' },
  { value: 'evaluator', label: 'መዛኝ (Evaluator)' },
  { value: 'approver', label: 'አጽዳቂ (Approver)' },
  { value: 'admin', label: 'አስተዳዳሪ (Admin)' },
];

export default function CreatePeriodPage() {
  const router = useRouter();
  
  // Period Form State
  const [year, setYear] = useState('2019');
  const [periodHalf, setPeriodHalf] = useState('1st');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Existing Users State
  const [existingUsers, setExistingUsers] = useState<ExistingUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Map<string, SelectedUser>>(new Map());
  const [search, setSearch] = useState('');
  
  // Active Tab for Member Setup ("existing" | "new")
  const [memberTab, setMemberTab] = useState<'existing' | 'new'>('existing');

  // New Members Draft State
  const [newMembers, setNewMembers] = useState<NewMemberDraft[]>([]);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('regular');
  const [newFormError, setNewFormError] = useState<string | null>(null);

  useEffect(() => {
    getExistingAssessmentUsersAction().then(res => {
      setExistingUsers(res.users || []);
      setUsersLoading(false);
    });
  }, []);

  const filteredUsers = existingUsers.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone_number?.includes(search)
  );

  const toggleUser = (user: ExistingUser) => {
    setSelectedUsers(prev => {
      const next = new Map(prev);
      if (next.has(user.user_id)) {
        next.delete(user.user_id);
      } else {
        next.set(user.user_id, { ...user, role: user.last_role || 'regular' });
      }
      return next;
    });
  };

  const setUserRole = (userId: string, role: string) => {
    setSelectedUsers(prev => {
      const next = new Map(prev);
      const u = next.get(userId);
      if (u) next.set(userId, { ...u, role });
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedUsers(prev => {
      const next = new Map(prev);
      filteredUsers.forEach(user => {
        if (!next.has(user.user_id)) {
          next.set(user.user_id, { ...user, role: user.last_role || 'regular' });
        }
      });
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedUsers(new Map());
  };

  const handleAddNewDraftMember = (e: React.FormEvent) => {
    e.preventDefault();
    setNewFormError(null);

    if (!newFullName.trim() || !newPhone.trim()) {
      setNewFormError('እባክዎን ስም እና ስልክ ቁጥር ያስገቡ (Please fill in name and phone)');
      return;
    }

    const cleanPhone = newPhone.trim();
    
    // Check if duplicate in newMembers
    if (newMembers.some(m => m.phone === cleanPhone)) {
      setNewFormError('ይህ ስልክ ቁጥር ቀድሞ በረቂቅ ዝርዝር ውስጥ አለ');
      return;
    }

    const draftItem: NewMemberDraft = {
      id: Date.now().toString(),
      fullName: newFullName.trim(),
      phone: cleanPhone,
      role: newRole
    };

    setNewMembers(prev => [...prev, draftItem]);
    setNewFullName('');
    setNewPhone('');
    setNewRole('regular');
  };

  const handleRemoveDraftMember = (id: string) => {
    setNewMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const periodName = `${year} ዓ.ም - ${periodHalf === '1st' ? '1ኛ መንፈቀ አመት' : '2ኛ መንፈቀ አመት'}`;

    // 1. Create period
    const { success, data, error: submitError } = await createAssessmentPeriodAction(periodName, year, periodHalf);

    if (!success || !data) {
      setError(submitError || 'የምዘና ጊዜ መፍጠር አልተሳካም። (Failed to create period)');
      setLoading(false);
      return;
    }

    const periodId = data.id;

    // 2. Add existing selected users
    if (selectedUsers.size > 0) {
      const usersArr = Array.from(selectedUsers.values()).map(u => ({
        user_id: u.user_id,
        full_name: u.full_name,
        phone_number: u.phone_number,
        email: u.email,
        role: u.role,
      }));
      await addExistingUsersToNewPeriodAction({ periodId, periodName, users: usersArr });
    }

    // 3. Register newly added members
    if (newMembers.length > 0) {
      for (const m of newMembers) {
        const formData = new FormData();
        formData.append('periodId', periodId);
        formData.append('fullName', m.fullName);
        formData.append('phone', m.phone);
        formData.append('role', m.role);
        await registerUserAction(formData);
      }
    }

    const totalAdded = selectedUsers.size + newMembers.length;
    setSuccessMsg(`"${periodName}" በትክክል ተፈጥሯል${totalAdded > 0 ? ` እና ${totalAdded} አባላት ተመድበዋል!` : '!'}`);
    
    setTimeout(() => {
      router.push(`/dashboard/assessment/teams/${periodId}`);
    }, 1200);
  };

  const totalMembersCount = selectedUsers.size + newMembers.length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">

        {/* Minimal Header */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/assessment"
              className="p-2 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-border/60 transition-all border border-border/50"
              title="ተመለስ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-text-primary">
                አዲስ የምዘና ጊዜ ፍጠር
              </h1>
              <p className="text-xs text-text-muted">
                አዲስ የምዘና ወቅት ያዘጋጁ እና አባላትን መዝግበው ይመድቡ።
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full border border-brand-blue/20">
            <LayoutTemplate className="w-4 h-4" />
            <span>አዲስ ወቅት</span>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-2xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Assessment Period Config (Compact Horizontal Form) */}
          <div className="bg-surface-primary border border-border/70 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                1. የምዘና ጊዜ መረጃ (Period Setup)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              {/* Year Input */}
              <div className="space-y-2">
                <label htmlFor="year" className="block text-xs font-bold text-text-secondary uppercase">
                  ዓ.ም (Year)
                </label>
                <div className="relative">
                  <input
                    id="year"
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary font-mono text-base font-bold"
                    placeholder="2019"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted pointer-events-none">
                    ዓ.ም
                  </div>
                </div>
              </div>

              {/* Period Half Selection Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-secondary uppercase">
                  መንፈቀ አመት (Period Half)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: '1st', label: '1ኛ መንፈቀ አመት' },
                    { v: '2nd', label: '2ኛ መንፈቀ አመት' }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.v}
                      onClick={() => setPeriodHalf(opt.v)}
                      className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all border text-center ${
                        periodHalf === opt.v
                          ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                          : 'bg-surface-secondary/60 text-text-secondary border-border/60 hover:bg-surface-secondary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Members Assignment & Creation */}
          <div className="bg-surface-primary border border-border/70 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-blue" />
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  2. ተመዛኞችን እና መዛኞችን መድብ (Assign Members)
                </h2>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center bg-surface-secondary p-1 rounded-2xl border border-border/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setMemberTab('existing')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    memberTab === 'existing'
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>ነባር አባላት ({existingUsers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberTab('new')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    memberTab === 'new'
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>አዲስ አባል ጨምር ({newMembers.length})</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Existing Users Picker */}
            {memberTab === 'existing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="ስም ወይም ስልክ ቁጥር ይፈልጉ..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-secondary/50 border border-border/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-text-primary placeholder:text-text-muted"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="px-3 py-2 rounded-xl text-[11px] font-bold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 transition-all"
                    >
                      ሁሉንም መዝግብ ({filteredUsers.length})
                    </button>
                    {selectedUsers.size > 0 && (
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="px-3 py-2 rounded-xl text-[11px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
                      >
                        አፅዳ
                      </button>
                    )}
                  </div>
                </div>

                {/* User List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-border/30 rounded-2xl border border-border/60 bg-surface-secondary/20">
                  {usersLoading ? (
                    <div className="py-12 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                      <span>በመጫን ላይ...</span>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-xs text-text-muted">
                      {search ? 'ምንም የሚዛመድ አባል አልተገኘም' : 'ምንም ቀደም ሲል የተመዘገቡ ሰዎች የሉም'}
                    </div>
                  ) : (
                    filteredUsers.map(user => {
                      const isSelected = selectedUsers.has(user.user_id);
                      const selUser = selectedUsers.get(user.user_id);

                      return (
                        <div
                          key={user.user_id}
                          className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors ${
                            isSelected ? 'bg-brand-blue/5' : 'hover:bg-surface-secondary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleUser(user)}
                              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                isSelected 
                                  ? 'bg-brand-blue border-brand-blue text-white' 
                                  : 'border-border/80 bg-surface-primary'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>

                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center shrink-0 border border-brand-blue/20">
                              {user.full_name?.charAt(0) || '?'}
                            </div>

                            <div className="min-w-0" onClick={() => toggleUser(user)} style={{ cursor: 'pointer' }}>
                              <div className="text-xs font-bold text-text-primary truncate">{user.full_name}</div>
                              <div className="text-[11px] font-mono text-text-muted truncate">{user.phone_number}</div>
                            </div>
                          </div>

                          {/* Role Selector if Selected */}
                          {isSelected ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={selUser?.role || 'regular'}
                                onChange={e => setUserRole(user.user_id, e.target.value)}
                                className="text-xs font-bold bg-surface-primary border border-brand-blue/40 rounded-xl px-2.5 py-1 text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 cursor-pointer shadow-sm"
                              >
                                {ROLE_OPTIONS.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                              <UserCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                          ) : (
                            <span className="text-[11px] text-text-muted shrink-0 hidden sm:inline">
                              {user.last_role === 'evaluator' ? 'መዛኝ' : user.last_role === 'approver' ? 'አጽዳቂ' : 'ተመዛኝ'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Add New Member Form */}
            {memberTab === 'new' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Form to Add to Draft */}
                <div className="bg-surface-secondary/40 border border-border/60 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-brand-blue" />
                    <span>አዲስ አባል መረጃ (Add New Person)</span>
                  </h3>

                  {newFormError && (
                    <div className="p-2.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{newFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">
                        ሙሉ ስም (Full Name) *
                      </label>
                      <input
                        type="text"
                        value={newFullName}
                        onChange={e => setNewFullName(e.target.value)}
                        placeholder="ለምሳሌ፡ ከበደ ታደሰ"
                        className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">
                        ስልክ ቁጥር (Phone) *
                      </label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        placeholder="0911..."
                        className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-text-primary font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary mb-1">
                        ኃላፊነት (Role)
                      </label>
                      <select
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-text-primary font-semibold"
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewDraftMember}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-brand-blue/90 transition-all shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ ወደ ዝርዝር ጨምር (Add to Draft List)</span>
                  </button>
                </div>

                {/* Staged New Members List */}
                {newMembers.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-text-primary flex items-center justify-between">
                      <span>የሚፈጠሩ አዳዲስ አባላት ({newMembers.length})</span>
                      <span className="text-[11px] text-text-muted font-normal">ምዘናው ሲፈጠር አካውንታቸው ይፈጠራል።</span>
                    </div>

                    <div className="divide-y divide-border/30 rounded-2xl border border-border/60 bg-surface-primary">
                      {newMembers.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">
                              {m.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-text-primary">{m.fullName}</div>
                              <div className="text-[11px] font-mono text-text-muted">{m.phone}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-secondary border border-border/60 text-brand-blue">
                              {ROLE_OPTIONS.find(r => r.value === m.role)?.label.split(' ')[0]}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftMember(m.id)}
                              className="text-text-muted hover:text-red-500 transition-colors p-1"
                              title="ማስወገድ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Floating Summary & Action Bar */}
          <div className="sticky bottom-4 z-20 bg-surface-primary/95 backdrop-blur-md border border-border/80 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-base shrink-0">
                {totalMembersCount}
              </div>
              <div>
                <div className="text-xs font-bold text-text-primary">
                  ተመድበው የሚፈጠሩ አባላት: {totalMembersCount}
                </div>
                <div className="text-[11px] text-text-muted">
                  {selectedUsers.size > 0 ? `${selectedUsers.size} ነባር` : ''}
                  {selectedUsers.size > 0 && newMembers.length > 0 ? ' + ' : ''}
                  {newMembers.length > 0 ? `${newMembers.length} አዲስ` : ''}
                  {totalMembersCount === 0 ? 'ምንም አባል አልተመረጠም (አማራጭ)' : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push('/dashboard/assessment')}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl font-bold text-xs text-text-secondary bg-surface-secondary hover:bg-border/60 transition-all border border-border/60"
              >
                ሰርዝ
              </button>

              <button
                type="submit"
                disabled={loading || !year}
                className="flex-1 sm:flex-none flex items-center justify-center bg-brand-blue text-white px-8 py-3 rounded-2xl font-bold text-xs transition-all hover:bg-brand-blue/90 disabled:opacity-50 shadow-lg shadow-brand-blue/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <PlusCircle className="w-4 h-4 mr-2" />
                )}
                <span>የምዘና ጊዜውን ፍጠር (Create Assessment)</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
