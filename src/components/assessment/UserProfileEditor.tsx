'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Loader2, Save } from 'lucide-react';

interface UserProfileEditorProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSaved: () => void;
}

export function UserProfileEditor({ userId, userName, onClose, onSaved }: UserProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    gender: '',
    age: '',
    education_level: '',
    professional_field: '',
    experience_professional: '',
    experience_leadership: '',
    institution: '',
    current_responsibility_gov: '',
    current_responsibility_com: '',
    system_role: ''
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile({
            gender: data.gender || '',
            age: data.age?.toString() || '',
            education_level: data.education_level || '',
            professional_field: data.professional_field || '',
            experience_professional: data.experience_professional?.toString() || '',
            experience_leadership: data.experience_leadership?.toString() || '',
            institution: data.institution || '',
            current_responsibility_gov: data.current_responsibility_gov || '',
            current_responsibility_com: data.current_responsibility_com || '',
            system_role: data.system_role || ''
          });
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        user_id: userId,
        gender: profile.gender || null,
        age: profile.age ? parseInt(profile.age, 10) : null,
        education_level: profile.education_level || null,
        professional_field: profile.professional_field || null,
        experience_professional: profile.experience_professional ? parseInt(profile.experience_professional, 10) : null,
        experience_leadership: profile.experience_leadership ? parseInt(profile.experience_leadership, 10) : null,
        institution: profile.institution || null,
        current_responsibility_gov: profile.current_responsibility_gov || null,
        current_responsibility_com: profile.current_responsibility_com || null,
        system_role: profile.system_role || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      onSaved();
    } catch (err: any) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-primary rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary bg-surface-secondary p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-heading text-text-primary mb-1">ግለ ታሪክ (Profile)</h2>
        <p className="text-sm text-text-secondary mb-6">ለ {userName} መረጃ ያስገቡ (Edit profile for {userName})</p>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">ፆታ (Gender)</label>
                <select
                  value={profile.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                >
                  <option value="">-- ምረጥ (Select) --</option>
                  <option value="Male">ወንድ (Male)</option>
                  <option value="Female">ሴት (Female)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">ዕድሜ (Age)</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">የት/ት ደረጃ (Education Level)</label>
                <select
                  value={profile.education_level}
                  onChange={(e) => handleChange('education_level', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                >
                  <option value="">-- ምረጥ (Select) --</option>
                  <option value="Diploma">ዲፕሎማ (Diploma)</option>
                  <option value="BA/BSc">ዲግሪ (BA/BSc)</option>
                  <option value="MA/MSc">ማስተርስ (MA/MSc)</option>
                  <option value="PhD">ዶክትሬት (PhD)</option>
                  <option value="Other">ሌላ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">የሙያ መስመር (Professional Field)</label>
                <input
                  type="text"
                  value={profile.professional_field}
                  onChange={(e) => handleChange('professional_field', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                  placeholder="ምህንድስና፣ ህክምና ወዘተ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">የስራ ልምድ በባለሙያ (Experience as Professional in Yrs)</label>
                <input
                  type="number"
                  value={profile.experience_professional}
                  onChange={(e) => handleChange('experience_professional', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">የስራ ልምድ በአመራር (Experience in Leadership in Yrs)</label>
                <input
                  type="number"
                  value={profile.experience_leadership}
                  onChange={(e) => handleChange('experience_leadership', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                  placeholder="2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">የሚሰራበት ተቋም (Institution/Organization)</label>
              <input
                type="text"
                value={profile.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                placeholder="የተቋም ስም"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">አሁን ያለው ሀላፊነት በመንግስት (Role in Govt)</label>
                <input
                  type="text"
                  value={profile.current_responsibility_gov}
                  onChange={(e) => handleChange('current_responsibility_gov', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                  placeholder="መሪ ስራ አስፈፃሚ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">አሁን ያለው ሀላፊነት በኮሚሽን (Role in Commission)</label>
                <input
                  type="text"
                  value={profile.current_responsibility_com}
                  onChange={(e) => handleChange('current_responsibility_com', e.target.value)}
                  className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
                  placeholder="አባል፣ ሰብሳቢ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
              <select
                value={profile.system_role}
                onChange={(e) => handleChange('system_role', e.target.value)}
                className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary"
              >
                <option value="">-- ምረጥ (Select) --</option>
                <option value="Admin">Admin</option>
                <option value="Approver">Approver</option>
                <option value="Evaluator">Evaluator</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center bg-brand-blue text-white px-6 py-2.5 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                አስቀምጥ (Save)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
