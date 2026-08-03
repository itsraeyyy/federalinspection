'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Loader2, User, Briefcase, GraduationCap, Building, Download, 
  History, AlertCircle, CheckCircle2, Edit2, Save, X, Check 
} from 'lucide-react';
import { downloadPDFDocument } from '@/lib/exportToPDF';
import { AllAssessmentsReportPDF } from './AllAssessmentsReportPDF';
import { updateUserProfileSelfAction } from '@/app/actions/auth';

interface UserProfileViewerProps {
  userId: string;
}

const EDUCATION_LEVEL_OPTIONS = [
  'ሰርተፊኬት (Certificate)',
  'ዲፕሎማ (Diploma)',
  'ባችለር (BSc/BA)',
  'ማስተርስ (MSc/MA)',
  'ዶክትሬት (PhD)',
  'ሌላ (Other)'
];

function ProfileFieldItem({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number | null | undefined; 
  icon?: React.ReactNode 
}) {
  const isFilled = value !== null && value !== undefined && value !== '' && value !== '-';

  return (
    <div className={`p-3.5 rounded-xl border transition-all ${
      isFilled 
        ? 'bg-surface-secondary/40 border-border/70' 
        : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <span className="block text-text-muted text-xs mb-1.5 font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <div className="flex items-center justify-between gap-2">
        <span className={`font-semibold text-xs sm:text-sm truncate ${
          isFilled ? 'text-text-primary' : 'text-amber-600 dark:text-amber-400 font-normal italic'
        }`}>
          {isFilled ? value : 'ያልተሞላ (Not filled)'}
        </span>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
          isFilled 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        }`}>
          {isFilled ? 'ተሞልቷል' : 'ያልተሞላ'}
        </span>
      </div>
    </div>
  );
}

export function UserProfileViewer({ userId }: UserProfileViewerProps) {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    education_level: '',
    professional_field: '',
    experience_professional: '',
    experience_leadership: '',
    institution: '',
    current_responsibility_gov: '',
    current_responsibility_com: ''
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, phone_number')
          .eq('id', userId)
          .single();
          
        if (userData) setUser(userData);

        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (profileData) {
          setProfile(profileData);
          setFormData({
            gender: profileData.gender || '',
            age: profileData.age ? String(profileData.age) : '',
            education_level: profileData.education_level || '',
            professional_field: profileData.professional_field || '',
            experience_professional: profileData.experience_professional ? String(profileData.experience_professional) : '',
            experience_leadership: profileData.experience_leadership ? String(profileData.experience_leadership) : '',
            institution: profileData.institution || '',
            current_responsibility_gov: profileData.current_responsibility_gov || '',
            current_responsibility_com: profileData.current_responsibility_com || ''
          });
        }

        // Fetch All Period Memberships for History
        const { data: memberships } = await supabase
          .from('period_members')
          .select('*, assessment_periods(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // Fetch all scores for this user across all periods
        const [selfRes, evalRes, apprRes, finalRes] = await Promise.all([
          supabase.from('self_assessments').select('*').eq('user_id', userId),
          supabase.from('evaluations').select('*').eq('target_user_id', userId),
          supabase.from('approver_evaluations').select('*').eq('target_user_id', userId),
          supabase.from('final_scores').select('*').eq('user_id', userId)
        ]);

        const historyData = memberships?.map(m => {
          const pId = m.period_id;
          const s10Data = selfRes.data?.find(s => s.period_id === pId);
          const evals = evalRes.data?.filter(e => e.period_id === pId) || [];
          const apprData = apprRes.data?.find(a => a.period_id === pId);
          const f100Data = finalRes.data?.find(f => f.period_id === pId);

          const avgEvalScore = evals.length > 0 
            ? evals.reduce((acc, curr) => acc + Number(curr.score_20), 0) / evals.length 
            : 0;

          const s10Val = Number(s10Data?.score_10 || 0);
          const s20Val = Number(avgEvalScore || 0);
          const s70Val = Number(apprData?.score_70 || 0);
          const totalVal = f100Data?.final_score_100 ?? (s10Val + s20Val + s70Val);

          return {
            periodId: pId,
            periodName: m.assessment_periods?.name || 'Unknown Period',
            role: m.role,
            status: m.assessment_periods?.status,
            s10: s10Val.toFixed(1),
            s20: s20Val.toFixed(1),
            s70: s70Val.toFixed(1),
            total: Number(totalVal).toFixed(1)
          };
        }) || [];

        setHistory(historyData);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleDownloadAllPDF = async () => {
    if (history.length === 0) return;
    setDownloadingAll(true);
    try {
      const fileName = `${user?.full_name ? user.full_name.replace(/\s+/g, '_') : 'User'}_All_Assessments.pdf`;
      const docElement = (
        <AllAssessmentsReportPDF
          user={user}
          profile={profile}
          history={history}
        />
      );
      await downloadPDFDocument(docElement, fileName);
    } catch (err) {
      console.error('Error downloading all assessments PDF:', err);
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        educationLevel: formData.education_level || null,
        professionalField: formData.professional_field || null,
        expProfessional: formData.experience_professional ? parseInt(formData.experience_professional) : null,
        expLeadership: formData.experience_leadership ? parseInt(formData.experience_leadership) : null,
        institution: formData.institution || null,
        govResponsibility: formData.current_responsibility_gov || null,
        partyResponsibility: formData.current_responsibility_com || null,
      };

      const result = await updateUserProfileSelfAction(userId, payload);
      if (result.error) {
        throw new Error(result.error);
      }

      setProfile(result.profile);
      setIsEditing(false);
      showToast('የግል መረጃዎ በተሳካ ሁኔታ ተሻሽሏል! (Profile updated successfully!)', 'success');
    } catch (err: any) {
      showToast(err.message || 'ማሻሻል አልተሳካም (Failed to update profile)', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="premium-card p-4 mb-6 flex justify-center items-center">
        <Loader2 className="w-5 h-5 animate-spin text-brand-blue mr-2" />
        <span className="text-sm text-text-muted">ግለ ታሪክ በማውረድ ላይ... (Loading Profile...)</span>
      </div>
    );
  }

  const profileFieldsList = [
    profile?.gender,
    profile?.age,
    profile?.education_level,
    profile?.professional_field,
    profile?.experience_professional,
    profile?.experience_leadership,
    profile?.institution,
    profile?.current_responsibility_gov,
    profile?.current_responsibility_com
  ];

  const filledCount = profileFieldsList.filter(v => v !== null && v !== undefined && v !== '' && v !== '-').length;
  const totalFields = profileFieldsList.length;
  const isFullyComplete = filledCount === totalFields;

  return (
    <div className="premium-card overflow-hidden mb-8 shadow-sm relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl font-medium shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Profile Header */}
      <div className="w-full flex items-center justify-between p-5 bg-surface-secondary/50 border-b border-border text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
            <User className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary">የግል መረጃ (My Profile)</h2>
            <p className="text-xs text-text-secondary">{user?.full_name || 'ተጠቃሚ'}</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition-all shadow-sm active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>መረጃን አሻሽል (Edit Profile)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-secondary hover:bg-border text-text-secondary text-xs font-medium transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>ሰርዝ</span>
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Status Summary Banner */}
        {!isEditing && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isFullyComplete 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isFullyComplete ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {isFullyComplete ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading">
                  {isFullyComplete 
                    ? 'የግል መረጃዎ ሙሉ በሙሉ ተጠናቋል (Profile Complete)' 
                    : 'የግል መረጃዎ አልተጠናቀቀም (Profile Incomplete)'}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  {isFullyComplete 
                    ? 'ሁሉም አስፈላጊ መረጃዎች በተሳካ ሁኔታ ተሞልተዋል።' 
                    : 'አንዳንድ መረጃዎች አልተሞሉም። ከታች ያለውን "መረጃን አሻሽል" በመጫን መሙላት ይችላሉ።'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                isFullyComplete 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}>
                {filledCount} / {totalFields} ተሞልቷል
              </span>
              {!isFullyComplete && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                >
                  መረጃዬን ልሙላ
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW MODE */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Personal Info Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <User className="w-4 h-4 text-brand-yellow" />
                <h3 className="font-heading font-medium text-text-primary text-sm">ግላዊ መረጃ (Personal Info)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <ProfileFieldItem label="ሙሉ ስም" value={user?.full_name} />
                <ProfileFieldItem label="ስልክ ቁጥር" value={user?.phone_number} />
                <ProfileFieldItem 
                  label="ፆታ" 
                  value={profile?.gender === 'Male' ? 'ወንድ (Male)' : profile?.gender === 'Female' ? 'ሴት (Female)' : profile?.gender} 
                />
                <ProfileFieldItem 
                  label="ዕድሜ" 
                  value={profile?.age ? `${profile.age} ዓመት` : null} 
                />
              </div>
            </div>

            {/* Education & Experience */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <GraduationCap className="w-4 h-4 text-brand-blue" />
                <h3 className="font-heading font-medium text-text-primary text-sm">ትምህርትና ልምድ (Education & Experience)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <ProfileFieldItem label="የት/ት ደረጃ" value={profile?.education_level} />
                <ProfileFieldItem label="የሙያ መስመር" value={profile?.professional_field} />
                <ProfileFieldItem 
                  label="የስራ ልምድ በባለሙያ" 
                  value={profile?.experience_professional ? `${profile.experience_professional} ዓመት` : null} 
                />
                <ProfileFieldItem 
                  label="የስራ ልምድ በአመራር" 
                  value={profile?.experience_leadership ? `${profile.experience_leadership} ዓመት` : null} 
                />
              </div>
            </div>

            {/* Current Role */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <Briefcase className="w-4 h-4 text-success" />
                <h3 className="font-heading font-medium text-text-primary text-sm">የአሁኑ የስራ ሀላፊነት (Current Responsibility)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ProfileFieldItem 
                  label="የሚሰራበት ተቋም" 
                  value={profile?.institution} 
                  icon={<Building className="w-3.5 h-3.5 text-text-muted" />} 
                />
                <ProfileFieldItem label="ሀላፊነት በመንግስት" value={profile?.current_responsibility_gov} />
                <ProfileFieldItem label="ሀላፊነት በኮሚሽን" value={profile?.current_responsibility_com} />
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-blue" />
                  <h3 className="font-heading font-medium text-text-primary text-sm">የምዘና ታሪክ (Assessment History)</h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleDownloadAllPDF}
                    disabled={downloadingAll}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 transition-all shadow-sm disabled:opacity-50"
                  >
                    {downloadingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{downloadingAll ? 'ፒዲኤፍ በማውረድ ላይ...' : 'ሁሉንም ምዘናዎች በ PDF አውርድ (Download All PDF)'}</span>
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-text-muted text-sm py-2">ምንም የምዘና ታሪክ አልተገኘም። (No assessment history found.)</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map(h => (
                    <div key={h.periodId} className="bg-surface-secondary/50 rounded-xl border border-border/80 p-4 hover:border-brand-blue/30 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-text-primary text-sm">{h.periodName}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${h.status === 'finalized' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {h.status === 'finalized' ? 'የተጠናቀቀ' : 'በሂደት ላይ'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-surface-primary rounded-lg p-1.5 border border-border/50">
                          <p className="text-[9px] text-text-muted font-bold mb-1">የራስ</p>
                          <p className="font-mono text-xs font-medium text-brand-blue">{h.s10}</p>
                        </div>
                        <div className="bg-surface-primary rounded-lg p-1.5 border border-border/50">
                          <p className="text-[9px] text-text-muted font-bold mb-1">መዛኝ</p>
                          <p className="font-mono text-xs font-medium text-brand-blue">{h.s20}</p>
                        </div>
                        <div className="bg-surface-primary rounded-lg p-1.5 border border-border/50">
                          <p className="text-[9px] text-text-muted font-bold mb-1">አጽዳቂ</p>
                          <p className="font-mono text-xs font-medium text-brand-yellow">{h.s70}</p>
                        </div>
                        <div className="bg-brand-blue/5 rounded-lg p-1.5 border border-brand-blue/20">
                          <p className="text-[9px] text-text-muted font-bold mb-1">ድምር</p>
                          <p className="font-mono font-bold text-text-primary text-sm leading-none">{h.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* EDIT MODE FORM */
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-brand-blue shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-text-primary">የግል መረጃ ማሻሻያ (Edit Profile Form)</h3>
                  <p className="text-xs text-text-secondary">እባክዎ መረጃዎችዎን በትክክል ሞልተው "አስቀምጥ" የሚለውን ይጫኑ።</p>
                </div>
              </div>
            </div>

            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider border-b border-border/60 pb-2">
                1. ግላዊ መረጃ (Personal Info)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">ፆታ (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    <option value="">-- ይምረጡ (Select) --</option>
                    <option value="Male">ወንድ (Male)</option>
                    <option value="Female">ሴት (Female)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">ዕድሜ (Age)</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="ለምሳሌ: 35"
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Education & Experience */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider border-b border-border/60 pb-2">
                2. ትምህርትና ልምድ (Education & Experience)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">የትምህርት ደረጃ (Education Level)</label>
                  <select
                    value={formData.education_level}
                    onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  >
                    <option value="">-- ይምረጡ (Select) --</option>
                    {EDUCATION_LEVEL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">የሙያ መስመር (Professional Field)</label>
                  <input
                    type="text"
                    value={formData.professional_field}
                    onChange={e => setFormData({ ...formData, professional_field: e.target.value })}
                    placeholder="ለምሳሌ: ኢንጂነሪንግ, አይቲ, አስተዳደር..."
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">የስራ ልምድ በባለሙያ (ዓመት)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.experience_professional}
                    onChange={e => setFormData({ ...formData, experience_professional: e.target.value })}
                    placeholder="ለምሳሌ: 5"
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">የስራ ልምድ በአመራር (ዓመት)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.experience_leadership}
                    onChange={e => setFormData({ ...formData, experience_leadership: e.target.value })}
                    placeholder="ለምሳሌ: 3"
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Current Responsibility */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider border-b border-border/60 pb-2">
                3. የአሁኑ የስራ ሀላፊነት (Current Responsibility)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">የሚሰራበት ተቋም (Institution)</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="ለምሳሌ: የፌዴራል ስነምግባር ኮሚሽን"
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">ሀላፊነት በመንግስት (Gov Role)</label>
                  <input
                    type="text"
                    value={formData.current_responsibility_gov}
                    onChange={e => setFormData({ ...formData, current_responsibility_gov: e.target.value })}
                    placeholder="ለምሳሌ: ዳይሬክተር"
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">ሀላፊነት በኮሚሽን (Commission Role)</label>
                  <input
                    type="text"
                    value={formData.current_responsibility_com}
                    onChange={e => setFormData({ ...formData, current_responsibility_com: e.target.value })}
                    placeholder="ለምሳሌ: ኮሚቴ አባል"
                    className="w-full px-3.5 py-2.5 bg-surface-secondary/60 border border-border/70 rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary bg-surface-secondary hover:bg-border transition-colors border border-border"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue/90 transition-all shadow-md disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ (Save Profile)'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
