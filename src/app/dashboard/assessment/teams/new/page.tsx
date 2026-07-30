'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, PlusCircle, CheckCircle2,
  Search, UserPlus, Users, X, ChevronDown, Bell
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  createAssessmentPeriodAction,
  getExistingAssessmentUsersAction,
  addExistingUsersToNewPeriodAction
} from '@/app/actions/assessment';
import { registerUserAction } from '@/app/actions/auth';

type ExistingUser = { user_id: string; full_name: string; phone_number: string; last_role: string };
type NewMember = { id: string; fullName: string; phone: string; role: string };
type SelectedUser = ExistingUser & { role: string };

const ROLES = [
  { value: 'regular', label: 'ተገምጋሚ' },
  { value: 'evaluator', label: 'ገምጋሚ' },
  { value: 'approver', label: 'አጽዳቂ' },
  { value: 'admin', label: 'አስተዳዳሪ' },
];

export default function CreatePeriodPage() {
  const router = useRouter();

  // Period config
  const [year, setYear] = useState('2019');
  const [half, setHalf] = useState('1st');

  // Existing users
  const [existing, setExisting] = useState<ExistingUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selected, setSelected] = useState<Map<string, SelectedUser>>(new Map());
  const [search, setSearch] = useState('');

  // New members queue
  const [newMembers, setNewMembers] = useState<NewMember[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('regular');

  // Tab
  const [tab, setTab] = useState<'existing' | 'new'>('existing');

  // Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExistingAssessmentUsersAction().then(res => {
      setExisting(res.users || []);
      setUsersLoading(false);
    });
  }, []);

  const filtered = existing.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone_number?.includes(search)
  );

  const toggle = (u: ExistingUser) => {
    setSelected(prev => {
      const n = new Map(prev);
      n.has(u.user_id) ? n.delete(u.user_id) : n.set(u.user_id, { ...u, role: u.last_role || 'regular' });
      return n;
    });
  };

  const setRole = (userId: string, role: string) => {
    setSelected(prev => {
      const n = new Map(prev);
      const u = n.get(userId);
      if (u) n.set(userId, { ...u, role });
      return n;
    });
  };

  const addNewMember = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setNewMembers(prev => [...prev, { id: crypto.randomUUID(), fullName: newName.trim(), phone: newPhone.trim(), role: newRole }]);
    setNewName(''); setNewPhone(''); setNewRole('regular');
  };

  const removeNew = (id: string) => setNewMembers(prev => prev.filter(m => m.id !== id));

  const totalCount = selected.size + newMembers.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) return;
    setLoading(true);
    setError(null);

    const periodName = `${year} ዓ.ም - ${half === '1st' ? '1ኛ መንፈቀ አመት' : '2ኛ መንፈቀ አመት'}`;
    const { success, data, error: err } = await createAssessmentPeriodAction(periodName, year, half);
    if (!success || !data) { setError(err || 'መፍጠር አልተሳካም'); setLoading(false); return; }

    // Enroll existing selected users
    if (selected.size > 0) {
      const arr = Array.from(selected.values()).map(u => ({
        user_id: u.user_id, full_name: u.full_name, phone_number: u.phone_number, role: u.role
      }));
      await addExistingUsersToNewPeriodAction({ periodId: data.id, periodName, users: arr });
    }

    // Register & enroll new members
    for (const m of newMembers) {
      const fd = new FormData();
      fd.append('periodId', data.id);
      fd.append('fullName', m.fullName);
      fd.append('phone', m.phone);
      fd.append('role', m.role);
      await registerUserAction(fd);
    }

    router.push(`/dashboard/assessment/teams/${data.id}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">

        {/* Back */}
        <Link href="/dashboard/assessment" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> ወደ ዳሽቦርድ
        </Link>

        <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">አዲስ ምዘና ጊዜ</h1>
        <p className="text-sm text-text-secondary mb-8">ዓ.ም እና መንፈቀ አመት ይምረጡ፣ ከዚያ አባላትን ይጨምሩ።</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl">{error}</div>
          )}

          {/* ── Period Config ─────────────────────────────── */}
          <div className="bg-surface-primary border border-border/70 rounded-2xl p-5 space-y-5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">የምዘና ጊዜ</p>

            <div className="flex gap-4 items-end">
              {/* Year */}
              <div className="flex-1 space-y-1.5">
                <label htmlFor="year" className="text-xs font-medium text-text-secondary">ዓ.ም (Year)</label>
                <input
                  id="year"
                  type="text"
                  required
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue placeholder:text-text-muted"
                  placeholder="2019"
                />
              </div>

              {/* Half toggle */}
              <div className="flex gap-2">
                {[{ v: '1st', l: '1ኛ' }, { v: '2nd', l: '2ኛ' }].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setHalf(o.v)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${half === o.v ? 'bg-brand-blue text-white border-brand-blue shadow-sm' : 'bg-surface-secondary/60 text-text-secondary border-border/70 hover:border-border'}`}
                  >
                    {o.l} <span className="text-[11px] font-normal opacity-70">መንፈቀ</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-text-muted bg-surface-secondary/40 rounded-lg px-3 py-2 font-mono">
              {year} ዓ.ም — {half === '1st' ? '1ኛ' : '2ኛ'} መንፈቀ አመት
            </div>
          </div>

          {/* ── Members ──────────────────────────────────── */}
          <div className="bg-surface-primary border border-border/70 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-blue" /> አባላት
                </p>
                <p className="text-xs text-text-muted mt-0.5">ካለፉ ምዘናዎች ወይም አዲስ ይጨምሩ</p>
              </div>
              {totalCount > 0 && (
                <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full border border-brand-blue/20">
                  {totalCount} ተጨምረዋል
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/50">
              {([['existing', 'ካሉ ሰዎች ምረጥ'], ['new', 'አዲስ አባል ጨምር']] as const).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all ${tab === t ? 'text-brand-blue border-b-2 border-brand-blue bg-brand-blue/5' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Existing tab */}
            {tab === 'existing' && (
              <div>
                <div className="px-4 py-3 border-b border-border/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="ስም ወይም ስልክ ቁጥር..."
                      className="w-full pl-8 pr-4 py-2 text-xs bg-surface-secondary/60 border border-border/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue/30 focus:border-brand-blue text-text-primary placeholder:text-text-muted"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-border/30">
                  {usersLoading ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-text-muted text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> በመጫን ላይ...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-8 text-center text-xs text-text-muted">
                      {search ? 'ምንም ውጤት አልተገኘም' : 'ምንም ቀደም ሲል የተመዘገቡ ሰዎች የሉም'}
                    </div>
                  ) : (
                    filtered.map(u => {
                      const isSel = selected.has(u.user_id);
                      return (
                        <div
                          key={u.user_id}
                          onClick={() => toggle(u)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSel ? 'bg-brand-blue/5' : 'hover:bg-surface-secondary/30'}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSel ? 'bg-brand-blue border-brand-blue' : 'border-border/60'}`}>
                            {isSel && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold flex items-center justify-center shrink-0">
                            {u.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{u.full_name}</div>
                            <div className="text-xs text-text-muted">{u.phone_number}</div>
                          </div>
                          {isSel && (
                            <select
                              value={selected.get(u.user_id)?.role}
                              onChange={e => { e.stopPropagation(); setRole(u.user_id, e.target.value); }}
                              onClick={e => e.stopPropagation()}
                              className="text-xs bg-surface-primary border border-border/70 rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-blue/30 shrink-0"
                            >
                              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {selected.size > 0 && (
                  <div className="px-4 py-3 bg-brand-blue/5 border-t border-brand-blue/20 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                    <p className="text-xs text-brand-blue flex-1">
                      <strong>{selected.size} ሰዎች</strong> ይታከላሉ — SMS ማሳወቂያ ይላካላቸዋል
                    </p>
                    <button type="button" onClick={() => setSelected(new Map())} className="text-xs text-text-muted hover:text-danger flex items-center gap-0.5">
                      <X className="w-3 h-3" /> ሁሉ አጥፋ
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* New member tab */}
            {tab === 'new' && (
              <div className="p-4 space-y-4">
                {/* Inline add form */}
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-text-muted">ሙሉ ስም *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="ሙሉ ስም..."
                      className="w-full px-3 py-2.5 text-sm bg-surface-secondary/60 border border-border/70 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue placeholder:text-text-muted"
                    />
                  </div>
                  <div className="w-40 space-y-1">
                    <label className="text-xs text-text-muted">ስልክ *</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="09..."
                      className="w-full px-3 py-2.5 text-sm bg-surface-secondary/60 border border-border/70 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue placeholder:text-text-muted"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-xs text-text-muted">ኃላፊነት</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-surface-secondary/60 border border-border/70 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={addNewMember}
                    disabled={!newName.trim() || !newPhone.trim()}
                    className="shrink-0 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> ጨምር
                  </button>
                </div>

                {/* Queued new members */}
                {newMembers.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">ለመጨመር የተዘጋጁ ({newMembers.length})</p>
                    <div className="divide-y divide-border/30 border border-border/50 rounded-xl overflow-hidden">
                      {newMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-surface-secondary/20">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{m.fullName}</div>
                            <div className="text-xs text-text-muted">{m.phone} · {ROLES.find(r => r.value === m.role)?.label}</div>
                          </div>
                          <button type="button" onClick={() => removeNew(m.id)} className="text-text-muted hover:text-danger transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">አዲስ አባላት ይመዘገቡ እና ምዘናው ሲፈጠር SMS ይላካላቸዋል።</p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-text-muted border border-dashed border-border/50 rounded-xl">
                    <UserPlus className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    ስም እና ስልክ ሞልተው ጨምር ይጫኑ
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Submit ───────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/assessment"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-surface-secondary hover:bg-border/50 transition-all border border-border/60"
            >
              ሰርዝ
            </Link>
            <button
              type="submit"
              disabled={loading || !year}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-blue/90 disabled:opacity-50 shadow-sm transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {loading ? 'በማቀናጀት ላይ...' : totalCount > 0 ? `ፍጠር እና ${totalCount} አባላት ጨምር` : 'ፍጠር (Create)'}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
