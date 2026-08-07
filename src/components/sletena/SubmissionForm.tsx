'use client';

import React, { useState } from 'react';
import { InspectionDirective, MembershipLevel, SletenaSubmission, TrainingCategory } from '@/types/sletena';
import { sletenaService } from '@/services/sletena';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import { extractAutoHighNeeds } from '@/lib/sletena/gapEngine';
import { MemberInfoSection } from './MemberInfoSection';
import { LikertMatrix } from './LikertMatrix';
import { AdditionalDirectivesSection } from './AdditionalDirectivesSection';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { useAutoSave } from '@/lib/sletena/autoSave';
import { IconSend, IconMessage2, IconCheck, IconAlertCircle, IconArrowLeft, IconSchool, IconDevices, IconVideo, IconBook } from '@tabler/icons-react';

interface SubmissionFormProps {
  category: TrainingCategory;
  initialSubmission?: SletenaSubmission;
  onBack?: () => void;
  onSubmitSuccess?: (submission: SletenaSubmission) => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  category,
  initialSubmission,
  onBack,
  onSubmitSuccess,
}) => {
  // Read active questions from category.questions or category.selectedDirectiveIds or default to all 27
  const activeDirectives: InspectionDirective[] = React.useMemo(() => {
    if (category.questions && category.questions.length > 0) {
      return category.questions.map((q) => ({
        id: q.id,
        code: q.code || q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        targetScore: q.targetScore,
      }));
    }
    if (category.selectedDirectiveIds && category.selectedDirectiveIds.length > 0) {
      const selected = INSPECTION_DIRECTIVES.filter(
        (d) =>
          category.selectedDirectiveIds?.includes(d.id) ||
          category.selectedDirectiveIds?.includes(d.code)
      );
      if (selected.length > 0) return selected;
    }
    return INSPECTION_DIRECTIVES;
  }, [category.questions, category.selectedDirectiveIds]);

  const [memberId, setMemberId] = useState(initialSubmission?.memberId || '');
  const [memberName, setMemberName] = useState(initialSubmission?.memberName || '');
  const [contact, setContact] = useState(initialSubmission?.contact || '');
  const [membershipLevel, setMembershipLevel] = useState<MembershipLevel>(
    initialSubmission?.membershipLevel || 'Abal'
  );
  const [region, setRegion] = useState(initialSubmission?.region || '');
  const [zone, setZone] = useState(initialSubmission?.zone || '');
  const [woreda, setWoreda] = useState(initialSubmission?.woreda || '');
  const [ratings, setRatings] = useState<Record<string, number>>(initialSubmission?.ratings || {});
  const [qualitativeFeedback, setQualitativeFeedback] = useState(
    initialSubmission?.qualitativeFeedback || ''
  );
  const [hasNoSuggestions, setHasNoSuggestions] = useState(
    initialSubmission?.qualitativeFeedback === 'ምንም የለኝም'
  );
  const [additionalNeededDirectives, setAdditionalNeededDirectives] = useState<string[]>(
    initialSubmission?.additionalNeededDirectives || []
  );
  const [preferredTrainingMethods, setPreferredTrainingMethods] = useState<string[]>(
    initialSubmission?.preferredTrainingMethods || []
  );

  const handleToggleAdditionalDirective = (directiveId: string) => {
    setAdditionalNeededDirectives((prev) =>
      prev.includes(directiveId)
        ? prev.filter((id) => id !== directiveId)
        : [...prev, directiveId]
    );
  };

  const handleTogglePreferredMethod = (method: string) => {
    setPreferredTrainingMethods((prev) => {
      // 'በአካል' and 'Online' are mutually exclusive (select 1)
      if (method === 'በአካል') {
        const withoutOnline = prev.filter((m) => m !== 'Online');
        return withoutOnline.includes('በአካል')
          ? withoutOnline.filter((m) => m !== 'በአካል')
          : [...withoutOnline, 'በአካል'];
      }
      if (method === 'Online') {
        const withoutPhysical = prev.filter((m) => m !== 'በአካል');
        return withoutPhysical.includes('Online')
          ? withoutPhysical.filter((m) => m !== 'Online')
          : [...withoutPhysical, 'Online'];
      }
      return prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method];
    });
  };

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State payload for auto-save
  const formData = {
    categoryId: category.id,
    memberId,
    memberName,
    contact,
    membershipLevel,
    region,
    zone,
    woreda,
    ratings,
    additionalNeededDirectives,
    preferredTrainingMethods,
    qualitativeFeedback,
  };

  // 1-second Auto-Save hook setup
  const { status: autoSaveStatus, lastSavedTime } = useAutoSave({
    data: formData,
    debounceMs: 1000,
    storageKey: `sletena_draft_${category.id}`,
    onSave: async (data) => {
      console.log('[Sletena Auto-Save] Persisting draft payload:', data);
    },
  });

  const handleRatingChange = (directiveId: string, score: number) => {
    setRatings((prev) => ({
      ...prev,
      [directiveId]: score,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation Check 2: All Active Directives Rated
    const ratedCount = Object.keys(ratings).filter(
      (k) => activeDirectives.some((d) => d.id === k) && ratings[k] >= 1 && ratings[k] <= 5
    ).length;

    if (ratedCount < activeDirectives.length) {
      setValidationError(
        `እባክዎን ሁሉንም የተመረጡትን ${activeDirectives.length} ፍተሻ መመሪያዎች ይመዝኑ:: በአሁኑ ጊዜ የተመዘገቡት: ${ratedCount}/${activeDirectives.length}::`
      );
      return;
    }

    // System automatically calculates top 3 high training needs based on lowest rating scores
    const autoCalculatedPriorities = extractAutoHighNeeds(ratings);

    const finalSubmission: SletenaSubmission = {
      id: initialSubmission?.id || `sub-${Date.now()}`,
      categoryId: category.id,
      memberId: memberId.trim(),
      memberName: memberName.trim(),
      contact: contact.trim(),
      membershipLevel,
      region,
      zone,
      woreda: woreda.trim(),
      ratings,
      topPriorityDirectives: autoCalculatedPriorities,
      additionalNeededDirectives,
      preferredTrainingMethods,
      qualitativeFeedback: qualitativeFeedback.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase database (and sync to local storage fallback)
    await sletenaService.saveNeedSubmission(finalSubmission);

    if (onSubmitSuccess) {
      onSubmitSuccess(finalSubmission);
    }
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
          <IconCheck size={36} />
        </div>
        <h2 className="text-xl font-extrabold text-text-primary">የስልጠና ፍላጎት ቅጽዎ በስኬት ተመዝግቧል!</h2>
        <p className="text-xs text-text-muted">
          የሰጡት የምዘና ነጥብ ሲስተሙ በራስ-ሰር ከፍተኛ የስልጠና ፍላጎቶችን ለመለየት (Training Needs Prioritization) ጥቅም ላይ ይውላል። እናመሰግናለን!
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs shadow-md hover:bg-brand-blue/90 transition-all cursor-pointer"
          >
            ተመለስ
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Error Alert */}
      {validationError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 text-xs font-semibold flex items-start gap-2">
          <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">ማስተካከያ የሚያስፈልጋቸው መረጃዎች አሉ</div>
            <div className="mt-0.5 text-[11px] font-normal">{validationError}</div>
          </div>
        </div>
      )}

      {/* Section 1: Member Info */}
      <MemberInfoSection
        memberId={memberId}
        memberName={memberName}
        contact={contact}
        membershipLevel={membershipLevel}
        region={region}
        zone={zone}
        woreda={woreda}
        maxWoredas={category?.maxWoredas || 14}
        onChange={(fields) => {
          if (fields.memberId !== undefined) setMemberId(fields.memberId);
          if (fields.memberName !== undefined) setMemberName(fields.memberName);
          if (fields.contact !== undefined) setContact(fields.contact);
          if (fields.membershipLevel !== undefined) setMembershipLevel(fields.membershipLevel);
          if (fields.region !== undefined) setRegion(fields.region);
          if (fields.zone !== undefined) setZone(fields.zone);
          if (fields.woreda !== undefined) setWoreda(fields.woreda);
        }}
      />

      {/* Section 2: Likert Scale Directives Matrix */}
      <LikertMatrix
        directives={activeDirectives}
        ratings={ratings}
        onRatingChange={handleRatingChange}
      />

      {/* Section 3: Additional Needed Directives (Checkmark List) */}
      <AdditionalDirectivesSection
        directives={INSPECTION_DIRECTIVES}
        selectedIds={additionalNeededDirectives}
        onToggleDirective={handleToggleAdditionalDirective}
      />

      {/* Section 4: Preferred Training Method & Material */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <IconSchool className="text-brand-blue" size={20} />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
            4. ተመራጭ የስልጠና መንገድና የስልጠና ቁሳቁስ/ማኑዋል ፍላጎት
          </h3>
        </div>

        {/* Sub-section A: Training Mode (Mutually Exclusive: በአካል vs Online) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            ሀ) የስልጠና አሰጣጥ መንገድ (ከሁለቱ አንዱን ብቻ ይምረጡ):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'በአካል', icon: IconSchool, desc: 'በስልጠና ማዕከል / በአካል ተገኝቶ የሚሰጥ ስልጠና' },
              { label: 'Online', icon: IconDevices, desc: 'በኦንላይን / በኢንተርኔት የሚሰጥ ስልጠና' },
            ].map((item) => {
              const isSelected = preferredTrainingMethods.includes(item.label);
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.label}
                  onClick={() => handleTogglePreferredMethod(item.label)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-brand-blue/10 border-brand-blue/50 text-brand-blue shadow-2xs'
                      : 'bg-surface-secondary/30 border-border/40 text-text-secondary hover:text-text-primary hover:border-border/80'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? 'border-brand-blue bg-brand-blue text-white shadow-xs'
                        : 'border-border/80 bg-surface-primary'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ItemIcon size={18} className={isSelected ? 'text-brand-blue' : 'text-text-muted'} />
                      <span className="text-xs font-bold leading-tight">{item.label}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-section B: Training Material / Manual */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            ለ) የስልጠና ቁሳቁስ/ማኑዋል ፍላጎት (ምልክት ያድርጉ):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'የቪዲዮና የድምፅ ማብራሪያዎች', icon: IconVideo, desc: 'መልቲሚዲያ የቪዲዮ እና ኦዲዮ ማብራሪያዎች' },
              { label: 'የታተመ ሰነድ (Hard Copy)', icon: IconBook, desc: 'የታተሙ የስልጠና ማኑዋሎች እና ሰነዶች' },
            ].map((item) => {
              const isSelected = preferredTrainingMethods.includes(item.label);
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.label}
                  onClick={() => handleTogglePreferredMethod(item.label)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-brand-blue/10 border-brand-blue/50 text-brand-blue shadow-2xs'
                      : 'bg-surface-secondary/30 border-border/40 text-text-secondary hover:text-text-primary hover:border-border/80'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? 'bg-brand-blue border-brand-blue text-white shadow-xs'
                        : 'border-border/80 bg-surface-primary'
                    }`}
                  >
                    {isSelected && <IconCheck size={14} strokeWidth={3} />}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ItemIcon size={18} className={isSelected ? 'text-brand-blue' : 'text-text-muted'} />
                      <span className="text-xs font-bold leading-tight">{item.label}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 5: Qualitative Open-Ended Feedback */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <IconMessage2 className="text-brand-blue" size={20} />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              5. የስልጠናው ሂደት ውጤታማ እንዲሆን እንዲካተት የሚፈልጉት ተጨማሪ ነገሮች
            </h3>
          </div>

          {/* "ምንም የለኝም" Checkbox Toggle */}
          <label
            onClick={() => {
              const nextVal = !hasNoSuggestions;
              setHasNoSuggestions(nextVal);
              if (nextVal) {
                setQualitativeFeedback('ምንም የለኝም');
              } else {
                setQualitativeFeedback('');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
              hasNoSuggestions
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 shadow-2xs'
                : 'bg-surface-secondary/40 border-border/50 text-text-secondary hover:text-text-primary'
            }`}
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                hasNoSuggestions
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'border-border/80 bg-surface-primary'
              }`}
            >
              {hasNoSuggestions && <IconCheck size={12} strokeWidth={3} />}
            </div>
            <span>ምንም የለኝም</span>
          </label>
        </div>

        {!hasNoSuggestions ? (
          <textarea
            rows={4}
            value={qualitativeFeedback}
            onChange={(e) => setQualitativeFeedback(e.target.value)}
            placeholder="እባክዎን የስልጠናው ሂደት ውጤታማ እንዲሆን የሚረዱ ተጨማሪ ነገሮችን ወይም ሃሳቦችን እዚህ ይጻፉ..."
            className="w-full px-3.5 py-2.5 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
          />
        ) : (
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-700 font-semibold flex items-center gap-2">
            <IconCheck size={16} />
            <span>ምንም ተጨማሪ አስተያየት የለም ተብሎ ተመዝግቧል።</span>
          </div>
        )}
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-between p-4 bg-surface-primary border border-border/50 rounded-2xl shadow-sm">
        <AutoSaveIndicator status={autoSaveStatus} lastSavedTime={lastSavedTime} />
        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <IconSend size={16} />
          <span>የስልጠና ፍላጎት ቅጹን ላክ</span>
        </button>
      </div>
    </form>
  );
};
