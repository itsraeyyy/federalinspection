'use client';

import React, { useState } from 'react';
import { InspectionDirective, MembershipLevel, SletenaSubmission, TrainingCategory } from '@/types/sletena';
import { sletenaService } from '@/services/sletena';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import { extractAutoHighNeeds } from '@/lib/sletena/gapEngine';
import { MemberInfoSection } from './MemberInfoSection';
import { LikertMatrix } from './LikertMatrix';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { useAutoSave } from '@/lib/sletena/autoSave';
import { IconSend, IconMessage2, IconCheck, IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';

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
    initialSubmission?.membershipLevel || 'Level_3'
  );
  const [region, setRegion] = useState(initialSubmission?.region || 'አዲስ አበባ');
  const [zone, setZone] = useState(initialSubmission?.zone || 'ዞን 01');
  const [ratings, setRatings] = useState<Record<string, number>>(initialSubmission?.ratings || {});
  const [qualitativeFeedback, setQualitativeFeedback] = useState(
    initialSubmission?.qualitativeFeedback || ''
  );

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
    ratings,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation Check 1: Member Info
    if (!memberId.trim() || !memberName.trim() || !contact.trim()) {
      setValidationError('እባክዎን ሁሉንም የአባል/ሰራተኛ መለያ መረጃዎች (መለያ ቁጥር፣ ስም፣ ስልክ/ኢሜይል) ይሙሉ::');
      return;
    }

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
      ratings,
      topPriorityDirectives: autoCalculatedPriorities,
      qualitativeFeedback: qualitativeFeedback.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase database
    sletenaService.saveNeedSubmission(finalSubmission);

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
          የሰጡት የምዘና ነጥብ ሲስተሙ በራስ-ሰር ከፍተኛ የስልጠና ክፍተቶችን ለመለየት (Knowledge Gap Analysis) ጥቅም ላይ ይውላል። እናመሰግናለን!
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
      {/* Top Header Card */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary border border-border/50 transition-all cursor-pointer"
              >
                <IconArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-extrabold text-text-primary">{category.title}</h2>
              <p className="text-xs text-text-muted mt-1">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={autoSaveStatus} lastSavedTime={lastSavedTime} />
        </div>
      </div>

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
        onChange={(fields) => {
          if (fields.memberId !== undefined) setMemberId(fields.memberId);
          if (fields.memberName !== undefined) setMemberName(fields.memberName);
          if (fields.contact !== undefined) setContact(fields.contact);
          if (fields.membershipLevel !== undefined) setMembershipLevel(fields.membershipLevel);
          if (fields.region !== undefined) setRegion(fields.region);
          if (fields.zone !== undefined) setZone(fields.zone);
        }}
      />

      {/* Section 2: Likert Scale Directives Matrix */}
      <LikertMatrix
        directives={activeDirectives}
        ratings={ratings}
        onRatingChange={handleRatingChange}
      />

      {/* Section 3: Qualitative Open-Ended Feedback */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <IconMessage2 className="text-brand-blue" size={20} />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
            4. ተጨማሪ አስተያየት እና የስልጠና የውሳኔ ሃሳቦች
          </h3>
        </div>
        <p className="text-xs text-text-muted">
          ተጨማሪ የስራ ላይ ተግዳሮቶች፣ የሀብት እጥረቶች ወይም የስልጠና ጥቆማዎችን እዚህ ያብራሩ (በስልጠና NLP ትንተና ሞተር ይተነተናሉ)።
        </p>
        <textarea
          rows={4}
          value={qualitativeFeedback}
          onChange={(e) => setQualitativeFeedback(e.target.value)}
          placeholder="ምሳሌ: የፋይናንስ ቁጥጥር እና የድንገተኛ አደጋ ዝግጁነት ላይ በዞን 01 ተጨማሪ የተግባር ስልጠና ያስፈልጋል..."
          className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
        />
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-between p-4 bg-surface-primary border border-border/50 rounded-2xl shadow-sm">
        <AutoSaveIndicator status={autoSaveStatus} lastSavedTime={lastSavedTime} />
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer"
            >
              ተመለስ
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconSend size={16} />
            <span>የስልጠና ፍላጎት ቅጹን ላክ</span>
          </button>
        </div>
      </div>
    </form>
  );
};
