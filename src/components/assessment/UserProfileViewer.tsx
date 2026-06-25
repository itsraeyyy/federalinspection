'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, User, Briefcase, GraduationCap, Building } from 'lucide-react';

interface UserProfileViewerProps {
  userId: string;
}

export function UserProfileViewer({ userId }: UserProfileViewerProps) {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

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

          return {
            periodId: pId,
            periodName: m.assessment_periods?.name || 'Unknown Period',
            role: m.role,
            status: m.assessment_periods?.status,
            s10: s10Data?.score_10 || 0,
            s20: Number(avgEvalScore.toFixed(2)),
            s70: apprData?.score_70 || 0,
            total: f100Data?.final_score_100 || ((s10Data?.score_10 || 0) + avgEvalScore + (apprData?.score_70 || 0))
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

  if (loading) {
    return (
      <div className="premium-card p-4 mb-6 flex justify-center items-center">
        <Loader2 className="w-5 h-5 animate-spin text-brand-blue mr-2" />
        <span className="text-sm text-text-muted">ግለ ታሪክ በማውረድ ላይ... (Loading Profile...)</span>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden mb-8 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-surface-secondary/50 hover:bg-surface-secondary transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
            <User className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary">የግል መረጃ (My Profile)</h2>
            <p className="text-xs text-text-secondary">{user?.full_name || 'ተጠቃሚ'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!profile && <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full border border-warning/20">ያልተሞላ (Incomplete)</span>}
          <span className="text-sm font-medium text-brand-blue">
            {isOpen ? 'ደብቅ (Hide)' : 'አሳይ (Show)'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-border animate-in slide-in-from-top-2 fade-in duration-200">
          {!profile ? (
            <div className="text-center py-8">
              <p className="text-text-secondary text-sm">የግል መረጃዎ ገና አልተሞላም። (Your profile has not been completed by the admin yet.)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                  <User className="w-4 h-4 text-brand-yellow" />
                  <h3 className="font-heading font-medium text-text-primary">ግላዊ መረጃ (Personal Info)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-text-muted text-xs mb-1">ሙሉ ስም</span>
                    <span className="font-medium text-text-primary">{user?.full_name || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">ስልክ ቁጥር</span>
                    <span className="font-medium text-text-primary">{user?.phone_number || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">ፆታ</span>
                    <span className="font-medium text-text-primary">{profile.gender === 'Male' ? 'ወንድ (Male)' : profile.gender === 'Female' ? 'ሴት (Female)' : '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">ዕድሜ</span>
                    <span className="font-medium text-text-primary">{profile.age || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Education & Experience */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                  <GraduationCap className="w-4 h-4 text-brand-blue" />
                  <h3 className="font-heading font-medium text-text-primary">ትምህርትና ልምድ (Education & Experience)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-text-muted text-xs mb-1">የት/ት ደረጃ</span>
                    <span className="font-medium text-text-primary">{profile.education_level || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">የሙያ መስመር</span>
                    <span className="font-medium text-text-primary">{profile.professional_field || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">የስራ ልምድ በባለሙያ</span>
                    <span className="font-medium text-text-primary">{profile.experience_professional ? `${profile.experience_professional} ዓመት` : '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">የስራ ልምድ በአመራር</span>
                    <span className="font-medium text-text-primary">{profile.experience_leadership ? `${profile.experience_leadership} ዓመት` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Current Role */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                  <Briefcase className="w-4 h-4 text-success" />
                  <h3 className="font-heading font-medium text-text-primary">የአሁኑ የስራ ሀላፊነት (Current Responsibility)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-text-muted text-xs mb-1">የሚሰራበት ተቋም</span>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-text-muted" />
                      <span className="font-medium text-text-primary">{profile.institution || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">ሀላፊነት በመንግስት</span>
                    <span className="font-medium text-text-primary">{profile.current_responsibility_gov || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted text-xs mb-1">ሀላፊነት በኮሚሽን</span>
                    <span className="font-medium text-text-primary">{profile.current_responsibility_com || '-'}</span>
                  </div>
                </div>
              </div>

              {/* History Section */}
              <div className="space-y-4 md:col-span-2 mt-4">
                <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                  <User className="w-4 h-4 text-brand-blue" />
                  <h3 className="font-heading font-medium text-text-primary">የምዘና ታሪክ (Assessment History)</h3>
                </div>
                {history.length === 0 ? (
                  <p className="text-text-muted text-sm py-2">ምንም የምዘና ታሪክ አልተገኘም። (No assessment history found.)</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map(h => (
                      <div key={h.periodId} className="bg-surface-secondary/50 rounded-xl border border-border/80 p-4">
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
                            <p className="text-[9px] text-text-muted font-bold mb-1">ገምጋሚ</p>
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
          )}
        </div>
      )}
    </div>
  );
}
