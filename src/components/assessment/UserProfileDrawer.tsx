import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Loader2, Download, UserCircle, Calendar, ShieldAlert, Edit2, Check, Upload, Save, Briefcase, GraduationCap, Building2, Printer } from 'lucide-react';
import { exportDetailedUserReport } from '@/lib/exportUtils';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  periodId: string;
}

export function UserProfileDrawer({ isOpen, onClose, userId, periodId }: UserProfileDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setIsEditing(false);
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // Fetch User details and Profile
        const { data: user } = await supabase
          .from('users')
          .select('*, user_profiles(*)')
          .eq('id', userId)
          .single();

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
            total: f100Data?.final_score_100 || ((s10Data?.score_10 || 0) + avgEvalScore + (apprData?.score_70 || 0)),
            raw: {
              self: s10Data,
              evals: evals,
              appr: apprData
            }
          };
        }) || [];

        setProfileData(user);
        setHistory(historyData);
        
        // Setup Form Data
        const p = user?.user_profiles?.[0] || {};
        const currentRole = historyData.find(h => h.periodId === periodId)?.role || 'regular';
        setFormData({
          full_name: user?.full_name || '',
          phone_number: user?.phone_number || '',
          role: currentRole,
          gender: p.gender || '',
          age: p.age || '',
          education_level: p.education_level || '',
          professional_field: p.professional_field || '',
          experience_professional: p.experience_professional || '',
          experience_leadership: p.experience_leadership || '',
          institution: p.institution || '',
          current_responsibility_gov: p.current_responsibility_gov || '',
          current_responsibility_com: p.current_responsibility_com || '',
          system_role: p.system_role || '',
          photo_url: p.photo_url || ''
        });

      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isOpen, userId]);

  const handleExportDetailed = async (periodHistory: any) => {
    if (!profileData) return;
    setExportingId(periodHistory.periodId);

    try {
      const evalsWithNames = await Promise.all((periodHistory.raw.evals || []).map(async (ev: any) => {
        const { data: evaluator } = await supabase.from('users').select('full_name').eq('id', ev.evaluator_id).single();
        return { ...ev, evaluatorName: evaluator?.full_name };
      }));

      let approverName = null;
      if (periodHistory.raw.appr) {
        const { data: approver } = await supabase.from('users').select('full_name').eq('id', periodHistory.raw.appr.approver_id).single();
        approverName = approver?.full_name;
      }

      const approverData = periodHistory.raw.appr ? { ...periodHistory.raw.appr, approverName } : null;

      const userOverview = {
        name: profileData.full_name,
        phone: profileData.phone_number,
        role: periodHistory.role,
        periodName: periodHistory.periodName,
        s10: periodHistory.s10,
        s20: periodHistory.s20,
        s70: periodHistory.s70,
        total: periodHistory.total
      };

      const fileName = `${profileData.full_name.replace(/\s+/g, '_')}_${periodHistory.periodName.replace(/\s+/g, '_')}_Report.xlsx`;
      
      exportDetailedUserReport(
        userOverview,
        periodHistory.raw.self,
        evalsWithNames,
        approverData,
        fileName
      );
    } catch (err) {
      console.error("Failed to export", err);
      alert("Failed to export detailed report.");
    } finally {
      setExportingId(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !userId) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newPhotoUrl = urlData.publicUrl;

      setFormData({ ...formData, photo_url: newPhotoUrl });
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      // 1. Update basic users table
      await supabase.from('users').update({
        full_name: formData.full_name,
        phone_number: formData.phone_number
      }).eq('id', userId);

      // 2. Upsert user_profiles table
      const profilePayload = {
        user_id: userId,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        education_level: formData.education_level,
        professional_field: formData.professional_field,
        experience_professional: formData.experience_professional ? parseInt(formData.experience_professional) : null,
        experience_leadership: formData.experience_leadership ? parseInt(formData.experience_leadership) : null,
        institution: formData.institution,
        current_responsibility_gov: formData.current_responsibility_gov,
        current_responsibility_com: formData.current_responsibility_com,
        system_role: formData.system_role,
        photo_url: formData.photo_url,
        updated_at: new Date().toISOString()
      };

      await supabase.from('user_profiles').upsert(profilePayload);

      // 3. Update period role
      if (formData.role) {
        await supabase.from('period_members').update({ role: formData.role }).eq('user_id', userId).eq('period_id', periodId);
        setHistory(prev => prev.map(h => h.periodId === periodId ? { ...h, role: formData.role } : h));
      }

      // Update local state to reflect changes without full reload
      setProfileData({
        ...profileData,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        user_profiles: [profilePayload]
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface-primary max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-secondary/50 shrink-0">
          <h2 className="text-xl font-heading font-semibold text-text-primary flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-brand-blue" />
            የተጠቃሚ መገለጫ (User Profile)
          </h2>
          <div className="flex items-center gap-2">
            {!loading && profileData && (
              <button 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isEditing 
                    ? 'bg-brand-blue text-white shadow-md hover:bg-brand-blue/90' 
                    : 'bg-surface-secondary text-text-primary border border-border hover:bg-border'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    አስቀምጥ (Save)
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    አስተካክል (Edit)
                  </>
                )}
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-border text-text-secondary transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
          ) : profileData ? (
            <div className="space-y-8">
              {/* Profile Header Card */}
              <div className="bg-surface-secondary rounded-2xl p-6 border border-border shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
                
                {/* Avatar Section */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-blue/10 flex items-center justify-center border-4 border-surface-primary shadow-lg overflow-hidden relative">
                    {formData.photo_url ? (
                      <Image 
                        src={formData.photo_url} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-brand-blue">
                        {formData.full_name?.charAt(0) || '?'}
                      </span>
                    )}

                    {isEditing && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          <Upload className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                    />
                  )}
                </div>

                {/* Name and Basic Info */}
                <div className="flex-1 w-full text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-3 w-full">
                      <input 
                        type="text" 
                        value={formData.full_name}
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-surface-primary border border-border rounded-lg px-3 py-2 text-text-primary text-xl font-heading font-semibold focus:ring-2 focus:ring-brand-blue outline-none"
                        placeholder="ሙሉ ስም (Full Name)"
                      />
                      <input 
                        type="text" 
                        value={formData.phone_number}
                        onChange={e => setFormData({...formData, phone_number: e.target.value})}
                        className="w-full bg-surface-primary border border-border rounded-lg px-3 py-2 text-text-primary font-mono focus:ring-2 focus:ring-brand-blue outline-none"
                        placeholder="ስልክ ቁጥር (Phone)"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-heading font-semibold text-text-primary mb-1">{formData.full_name}</h3>
                      <p className="text-text-secondary font-mono mb-2">{formData.phone_number}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        {formData.institution && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/10 text-brand-yellow text-sm font-medium border border-brand-yellow/20">
                            <Building2 className="w-3.5 h-3.5" />
                            {formData.institution}
                          </span>
                        )}
                        {formData.system_role && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-medium border border-brand-blue/20">
                            <Briefcase className="w-3.5 h-3.5" />
                            {formData.system_role}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Extended Profile Details */}
              <div className="bg-surface-primary border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-surface-secondary/50 px-5 py-4 border-b border-border flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-yellow" />
                  <h4 className="font-heading font-semibold text-text-primary">ዝርዝር መረጃ (Detailed Information)</h4>
                </div>
                
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  
                  {/* Form Fields Mapping */}
                  {[
                    { label: 'የምዘና ሚና (Assessment Role)', key: 'role', type: 'select', options: ['regular', 'evaluator', 'approver'], displayOptions: ['ተገምጋሚ / አባል (Member)', 'ገምጋሚ (Evaluator)', 'አጽዳቂ (Approver)'] },
                    { label: 'ፆታ (Gender)', key: 'gender', type: 'select', options: ['ወንድ', 'ሴት'] },
                    { label: 'ዕድሜ (Age)', key: 'age', type: 'number' },
                    { label: 'የትምህርት ደረጃ (Education)', key: 'education_level', type: 'text' },
                    { label: 'የትምህርት ዘርፍ (Field)', key: 'professional_field', type: 'text' },
                    { label: 'የስራ ልምድ/አመት (Experience)', key: 'experience_professional', type: 'number' },
                    { label: 'የአመራር ልምድ/አመት (Leadership Exp)', key: 'experience_leadership', type: 'number' },
                    { label: 'ተቋም (Institution)', key: 'institution', type: 'text' },
                    { label: 'የመንግስት ሀላፊነት (Gov Responsibility)', key: 'current_responsibility_gov', type: 'text' },
                    { label: 'የፓርቲ ሀላፊነት (Party Responsibility)', key: 'current_responsibility_com', type: 'text' },
                    { label: 'የስርአት ሚና (System Role)', key: 'system_role', type: 'text' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{field.label}</label>
                      {isEditing ? (
                        field.type === 'select' ? (
                          <select
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                            className="w-full bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-brand-blue outline-none"
                          >
                            <option value="">ምረጥ (Select)</option>
                            {field.options?.map((opt, idx) => (
                              <option key={opt} value={opt}>
                                {field.displayOptions ? field.displayOptions[idx] : opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                            className="w-full bg-surface-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-brand-blue outline-none"
                            placeholder={field.label}
                          />
                        )
                      ) : (
                        <p className="text-sm font-medium text-text-primary bg-surface-secondary/30 border border-border/40 px-3 py-2 rounded-lg">
                          {field.displayOptions && field.options?.indexOf(formData[field.key]) !== -1
                            ? field.displayOptions[field.options!.indexOf(formData[field.key])]
                            : (formData[field.key] || <span className="text-text-muted/50 italic">ያልተሞላ (N/A)</span>)}
                        </p>
                      )}
                    </div>
                  ))}

                </div>
              </div>

              {/* History Section */}
              {!isEditing && (
                <div>
                  <h4 className="text-lg font-heading font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-yellow" />
                    የምዘና ታሪክ (Assessment History)
                  </h4>
                  
                  {history.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-4 bg-surface-secondary rounded-xl border border-border">ምንም የምዘና ታሪክ አልተገኘም። (No history found)</p>
                  ) : (
                    <div className="space-y-4">
                      {history.map((h, idx) => (
                        <div key={h.periodId} className="bg-surface-primary rounded-xl border border-border/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                          <div className="bg-surface-secondary/30 px-5 py-3 border-b border-border/50 flex justify-between items-center">
                            <span className="font-medium text-text-primary">{h.periodName}</span>
                            <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${h.status === 'finalized' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                              {h.status === 'finalized' ? 'የተጠናቀቀ' : 'በሂደት ላይ'}
                            </span>
                          </div>
                          <div className="p-5">
                            <div className="grid grid-cols-4 gap-2 text-center mb-4">
                              <div className="bg-surface-secondary rounded-lg p-2 border border-border/50">
                                <p className="text-[10px] text-text-muted font-bold mb-1">የራስ (10)</p>
                                <p className="font-mono font-medium text-brand-blue">{h.s10}</p>
                              </div>
                              <div className="bg-surface-secondary rounded-lg p-2 border border-border/50">
                                <p className="text-[10px] text-text-muted font-bold mb-1">ገምጋሚ (20)</p>
                                <p className="font-mono font-medium text-brand-blue">{h.s20}</p>
                              </div>
                              <div className="bg-surface-secondary rounded-lg p-2 border border-border/50">
                                <p className="text-[10px] text-text-muted font-bold mb-1">አጽዳቂ (70)</p>
                                <p className="font-mono font-medium text-brand-yellow">{h.s70}</p>
                              </div>
                              <div className="bg-brand-blue/5 rounded-lg p-2 border border-brand-blue/20">
                                <p className="text-[10px] text-text-muted font-bold mb-1">ድምር (100)</p>
                                <p className="font-mono font-bold text-text-primary text-lg leading-none">{h.total}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleExportDetailed(h)}
                              disabled={exportingId === h.periodId}
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-secondary hover:bg-border text-text-primary rounded-xl text-sm font-medium transition-colors border border-border"
                            >
                              {exportingId === h.periodId ? (
                                <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                              ) : (
                                <Download className="w-4 h-4 text-brand-blue" />
                              )}
                              ዝርዝር ውጤት ኤክሴል (Excel)
                            </button>
                            <Link
                              href={`/dashboard/assessment/teams/${h.periodId}/print-all?user=${userId}`}
                              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-sm font-medium transition-colors border border-brand-blue/20 mt-2"
                              target="_blank"
                            >
                              <Printer className="w-4 h-4" />
                              ፒዲኤፍ አውርድ (Download PDF)
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-4 opacity-50" />
              <p className="text-text-muted">መረጃ አልተገኘም (No data found)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
