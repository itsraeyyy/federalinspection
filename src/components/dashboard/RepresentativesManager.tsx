"use client";

import { useState } from "react";
import { IconPlus, IconPhone, IconMapPin, IconLoader2, IconCheck, IconTrash, IconKey } from "@tabler/icons-react";
import { createRepresentativeAction } from "@/app/actions/reports";

const ETHIOPIA_REGIONS = [
  'ኦሮሚያ', 'አማራ', 'ሶማሌ', 'አፋር', 'ቤን-ጉሙዝ', 'ጋምቤላ', 'ሐረሪ', 'ሲዳማ', 'ደ/ም/ኢ/ያ', 'ደቡብ ኢ/ያ', 'ማዕ/ኢ/ያ', 'አዲስ አበባ', 'ድሬ ዳዋ', 'ፌዴራል ተቋማት'
];

export function RepresentativesManager({ initialRepresentatives }: { initialRepresentatives: any[] }) {
  const [reps, setReps] = useState(initialRepresentatives);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createRepresentativeAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        window.location.reload(); // naive reload to fetch new data
      }, 1500);
    }
    setLoading(false);
  };

  const [actingUserId, setActingUserId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'reset' | null>(null);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("በእርግጥ ይህንን ተወካይ መሰረዝ ይፈልጋሉ?")) return;
    
    setActingUserId(userId);
    setActionType('delete');
    const { deleteRepresentativeAction } = await import('@/app/actions/reports');
    const result = await deleteRepresentativeAction(userId);
    
    if (result.error) {
      alert(result.error);
    } else {
      setReps(prev => prev.filter(r => r.user_id !== userId));
    }
    setActingUserId(null);
    setActionType(null);
  };

  const handleResetPassword = async (userId: string, phone: string, fullName: string) => {
    if (!window.confirm(`የ ${fullName} የይለፍ ቃል ቀይረው በSMS እንዲላክ ይፈልጋሉ?`)) return;

    setActingUserId(userId);
    setActionType('reset');
    const { resetRepresentativePasswordAction } = await import('@/app/actions/reports');
    const result = await resetRepresentativePasswordAction(userId, phone, fullName);
    
    if (result.error) {
      alert(result.error);
    } else {
      alert('የይለፍ ቃል በተሳካ ሁኔታ ተቀይሮ ተልኳል!');
    }
    setActingUserId(null);
    setActionType(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary tracking-tight">የተመዘገቡ ተወካዮች</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-blue/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <IconPlus size={18} />
          አዲስ አክል
        </button>
      </div>

      {reps.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-bg-secondary/50 rounded-xl border border-dashed border-border-medium">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-text-muted shadow-sm mb-4">
            <IconUsers size={32} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">ምንም ተወካይ የለም</h3>
          <p className="text-text-muted max-w-sm">እስካሁን ምንም የክልል ተወካይ አልተመዘገበም። "አዲስ አክል" የሚለውን በመጫን ይጀምሩ።</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reps.map((rep) => (
            <div key={rep.user_id} className="bg-bg-primary border border-border-light rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-text-primary text-lg truncate">{rep.users?.full_name || 'Unknown'}</h3>
                <span className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {rep.region === 'ፌዴራል ተቋማት' ? 'ተቋማት' : rep.region}
                </span>
              </div>
              <div className="space-y-2 text-sm text-text-secondary flex-1 mb-4">
                <div className="flex items-center gap-2">
                  <IconPhone size={16} className="text-brand-blue/70" />
                  <span>{rep.users?.phone_number || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconMapPin size={16} className="text-brand-blue/70" />
                  <span>{rep.region === 'ፌዴራል ተቋማት' ? 'ተቋማት' : rep.region}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-border-light mt-auto">
                <button
                  onClick={() => handleResetPassword(rep.user_id, rep.users?.phone_number, rep.users?.full_name)}
                  disabled={actingUserId === rep.user_id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg border border-transparent hover:border-brand-blue/20 transition-all"
                >
                  {actingUserId === rep.user_id && actionType === 'reset' ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <IconKey size={16} />
                  )}
                  ይለፍ ቃል (Reset)
                </button>
                <button
                  onClick={() => handleDelete(rep.user_id)}
                  disabled={actingUserId === rep.user_id}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-status-error hover:bg-status-error/10 rounded-lg border border-transparent hover:border-status-error/20 transition-all"
                >
                  {actingUserId === rep.user_id && actionType === 'delete' ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <IconTrash size={16} />
                  )}
                  አጥፋ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-bg-primary w-full max-w-md rounded-[24px] shadow-2xl border border-border-light overflow-hidden relative" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="pt-8 pb-4 px-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-blue/10 to-transparent pointer-events-none" />
              <div className="w-16 h-16 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-border-light relative z-10">
                <IconUsers size={32} className="text-brand-blue" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight relative z-10">አዲስ ተወካይ</h2>
              <p className="text-sm text-text-secondary mt-1.5 relative z-10">ተወካዩ በSMS የይለፍ ቃል ይደርሰዋል</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 pt-2 space-y-5">
              {error && (
                <div className="p-3.5 bg-status-error/10 text-status-error text-sm rounded-xl border border-status-error/20 flex items-start gap-2.5 animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-error mt-1.5 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3.5 bg-status-success/10 text-status-success text-sm rounded-xl border border-status-success/20 flex items-center gap-2.5 animate-in slide-in-from-top-2">
                  <IconCheck size={18} />
                  በተሳካ ሁኔታ ተመዝግቧል!
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">ሙሉ ስም (Full Name)</label>
                  <div className="relative">
                    <input
                      name="fullName"
                      type="text"
                      required
                      placeholder="የተወካዩ ስም"
                      className="w-full pl-4 pr-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">ስልክ ቁጥር (Phone)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IconPhone size={18} className="text-text-muted" />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="09..."
                      className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">ክልል (Region)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IconMapPin size={18} className="text-text-muted" />
                    </div>
                    <select
                      name="region"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary text-sm font-medium appearance-none"
                    >
                      <option value="">ክልል ይምረጡ</option>
                      {ETHIOPIA_REGIONS.map(r => (
                        <option key={r} value={r}>{r === 'ፌዴራል ተቋማት' ? 'ተቋማት' : r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-text-secondary font-medium bg-bg-secondary hover:bg-border-light rounded-xl transition-colors text-sm"
                >
                  ሰርዝ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex-[1.5] px-4 py-3 bg-brand-blue text-white font-medium rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  {loading ? <IconLoader2 size={18} className="animate-spin" /> : "መዝግብ (Register)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure we have IconUsers imported since we use it
import { IconUsers } from "@tabler/icons-react";
