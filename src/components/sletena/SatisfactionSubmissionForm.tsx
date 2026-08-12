'use client';

import React, { useState } from 'react';
import { TrainingCategory, SatisfactionSubmission, MembershipLevel } from '@/types/sletena';
import { sletenaService } from '@/services/sletena';
import { MemberInfoSection } from './MemberInfoSection';
import { IconArrowLeft, IconCheck, IconStar, IconSend } from '@tabler/icons-react';

interface SatisfactionSubmissionFormProps {
  category: TrainingCategory;
  onBack: () => void;
  onSubmitSuccess: (submission: SatisfactionSubmission) => void;
}

const SATISFACTION_LEVEL_OPTIONS = [
  'በጣም ከፍተኛ',
  'ከፍተኛ',
  'መካከለኛ',
  'ዝቅተኛ',
  'በጣም ዝቅተኛ',
];

const OPTIONAL_OTHER_LEVEL_OPTIONS = [
  ...SATISFACTION_LEVEL_OPTIONS,
  'ሌላ (Other)',
];

export const SatisfactionSubmissionForm: React.FC<SatisfactionSubmissionFormProps> = ({
  category,
  onBack,
  onSubmitSuccess,
}) => {
  // Section 1: ጥሬ ሃቅ (Member & Demographics Meta)
  const [memberId, setMemberId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [contact, setContact] = useState('');
  const [membershipLevel, setMembershipLevel] = useState<MembershipLevel>('Abal');
  const [participantEmail, setParticipantEmail] = useState('');
  const [organizationUnit, setOrganizationUnit] = useState('');
  const [region, setRegion] = useState('አዲስ አበባ');
  const [zone, setZone] = useState('');
  const [woreda, setWoreda] = useState('');

  // Section 1 (Satisfaction Questions): ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ
  const [prepVenueRating, setPrepVenueRating] = useState('በጣም ከፍተኛ'); // 1.ሀ (Dropdown)
  const [prepDocRating, setPrepDocRating] = useState('በጣም ከፍተኛ');     // 1.ለ (Dropdown)

  // Section 2: የስልጠና አሰጣጥና ውይይት በተመለከተ
  const [deliveryDocTrainerRating, setDeliveryDocTrainerRating] = useState('በጣም ከፍተኛ'); // 2.ሀ (Dropdown with Other)
  const [deliveryDocTrainerOther, setDeliveryDocTrainerOther] = useState('');                // 2.ሀ Custom Other Text
  const [deliveryParticipationRating, setDeliveryParticipationRating] = useState('በጣም ከፍተኛ'); // 2.ለ (Dropdown)
  const [deliveryConclusionsRating, setDeliveryConclusionsRating] = useState('በጣም ከፍተኛ');   // 2.ሐ (Dropdown)

  // Section 3: ስልጠናዉ ላይ በመሳተፍዎ ያገኙት ተጨማሪ እውቀትና ግንዛቤ እንዴትይገልፁታል?
  const [knowledgeGainedText, setKnowledgeGainedText] = useState('');

  // Section 4: እርስዎ ጨምሮ ከሌሎች የስልጠና ተሳታፊዎች በቀጣይ ምን ውጤት እንጠብቅ?
  const [expectedResultsText, setExpectedResultsText] = useState('');

  // Section 5: አጠቃላይ ከስልጠናው ቅድመ ዝግጅት ጀምሮ ስልጠና እስከተመራበት አግባብ በቀጣይ ቢስተካከል የሚሉት ተጨማሪ አስተያየት ካለዎት
  const [generalImprovementText, setGeneralImprovementText] = useState('');

  // NPS Rating (1-10)
  const [recommendScore, setRecommendScore] = useState(10);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Helper to map text option to 1-5 numeric rating for analytics charts
  const optionToScore = (opt: string): number => {
    switch (opt) {
      case 'በጣም ከፍተኛ':
        return 5;
      case 'ከፍተኛ':
        return 4;
      case 'መካከለኛ':
        return 3;
      case 'ዝቅተኛ':
        return 2;
      case 'በጣም ዝቅተኛ':
        return 1;
      default:
        return 4;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalName = participantName.trim() || 'ተሳታፊ / አኖኒመስ';

    const trainerScore = optionToScore(deliveryDocTrainerRating);
    const contentScore = optionToScore(prepDocRating);
    const venueScore = optionToScore(prepVenueRating);
    const relevanceScore = optionToScore(deliveryParticipationRating);
    const overallScore = Math.round((trainerScore + contentScore + venueScore + relevanceScore) / 4);

    const newSubmission: SatisfactionSubmission = {
      id: `sat-sub-${Date.now()}`,
      categoryId: category.id,
      categoryTitle: category.title,
      participantName: finalName,
      memberId: memberId.trim(),
      contact: contact.trim(),
      membershipLevel,
      participantEmail: participantEmail.trim(),
      organizationUnit: organizationUnit.trim(),
      region,
      zone: zone.trim(),
      woreda: woreda.trim(),
      // Detailed Form Responses
      prepVenueRating,
      prepDocRating,
      deliveryDocTrainerRating,
      deliveryDocTrainerOther: deliveryDocTrainerRating === 'ሌላ (Other)' ? deliveryDocTrainerOther.trim() : '',
      deliveryParticipationRating,
      deliveryConclusionsRating,
      knowledgeGainedText: knowledgeGainedText.trim(),
      expectedResultsText: expectedResultsText.trim(),
      generalImprovementText: generalImprovementText.trim(),
      // Mapped Numeric Ratings for Charts & Analytics
      trainerRating: trainerScore,
      contentRating: contentScore,
      venueLogisticsRating: venueScore,
      relevanceRating: relevanceScore,
      overallRating: overallScore,
      recommendScore,
      positiveAspects: knowledgeGainedText.trim(),
      improvementSuggestions: generalImprovementText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase & LocalStorage
    await sletenaService.saveSatisfactionSubmission(newSubmission);

    onSubmitSuccess(newSubmission);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
          <IconCheck size={36} />
        </div>
        <h2 className="text-xl font-extrabold text-text-primary">የዕርካታ ምዘናዎ በጥሩ ሁኔታ ተመዝግቧል!</h2>
        <p className="text-xs text-text-muted">
          የሰጡት ድህረ-ስልጠና አስተያየት እና የዕርካታ ደረጃ የስልጠናችንን ጥራት ይበልጥ ለማሻሻል ይረዳናል። እናመሰግናለን!
        </p>
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              window.location.href = '/';
            }
          }}
          className="mt-4 px-6 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs shadow-md hover:bg-brand-blue/90 transition-all cursor-pointer"
        >
          ወደ ዋናው ገጽ ተመለስ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Top Bar Tag Badge */}
      <div className="flex justify-end">
        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[11px] font-bold border border-brand-blue/20">
          የድህረ-ስልጠና የዕርካታ ምዘና ቅጽ
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-primary border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Main Title & Subtitle Banner */}
        <div className="border-b border-border/40 pb-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-md">
            ለ) ዋና ዋና መጠይቆች
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-2">
            የዳሰሳ ጥናቶች/መጠይቆች/
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            {category.title} {category.description && `— ${category.description}`}
          </p>
        </div>

        {/* SECTION 1: 1. ጥሬ ሃቅ (Needs Style Demographic Section) */}
        <MemberInfoSection
          memberId={memberId}
          memberName={participantName}
          contact={contact}
          membershipLevel={membershipLevel}
          region={region}
          zone={zone}
          woreda={woreda}
          maxWoredas={category?.maxWoredas || 14}
          onChange={(fields) => {
            if (fields.memberId !== undefined) setMemberId(fields.memberId);
            if (fields.memberName !== undefined) setParticipantName(fields.memberName);
            if (fields.contact !== undefined) setContact(fields.contact);
            if (fields.membershipLevel !== undefined) setMembershipLevel(fields.membershipLevel);
            if (fields.region !== undefined) setRegion(fields.region);
            if (fields.zone !== undefined) setZone(fields.zone);
            if (fields.woreda !== undefined) setWoreda(fields.woreda);
          }}
        />

        {/* SECTION 1: ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ */}
        <div className="space-y-4 border-t border-border/40 pt-6">
          <div className="bg-brand-blue/5 border-l-4 border-brand-blue p-3 rounded-r-xl">
            <h3 className="text-sm font-extrabold text-text-primary">
              1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ
            </h3>
          </div>

          {/* 1.ሀ Dropdown */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              ሀ/ ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ *
            </label>
            <select
              required
              value={prepVenueRating}
              onChange={(e) => setPrepVenueRating(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-primary border border-border/60 rounded-xl text-text-primary font-medium focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {SATISFACTION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 1.ለ Dropdown */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              ለ/ ከስልጠናው ሰነድ ዝግጅት አኳያ *
            </label>
            <select
              required
              value={prepDocRating}
              onChange={(e) => setPrepDocRating(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-primary border border-border/60 rounded-xl text-text-primary font-medium focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {SATISFACTION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2: የስልጠና አሰጣጥና ውይይት በተመለከተ */}
        <div className="space-y-4 border-t border-border/40 pt-6">
          <div className="bg-brand-blue/5 border-l-4 border-brand-blue p-3 rounded-r-xl">
            <h3 className="text-sm font-extrabold text-text-primary">
              2. የስልጠና አሰጣጥና ውይይት በተመለከተ
            </h3>
          </div>

          {/* 2.ሀ Dropdown (+ Other) */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold text-text-primary">
              ሀ/ ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ *
            </label>
            <select
              required
              value={deliveryDocTrainerRating}
              onChange={(e) => setDeliveryDocTrainerRating(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-primary border border-border/60 rounded-xl text-text-primary font-medium focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {OPTIONAL_OTHER_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Other custom input text */}
            {deliveryDocTrainerRating === 'ሌላ (Other)' && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  ሌላ (እባክዎን ያብራሩ) *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryDocTrainerOther}
                  onChange={(e) => setDeliveryDocTrainerOther(e.target.value)}
                  placeholder="ለመለስዎ ማብራሪያ ያስገቡ..."
                  className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/60 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
                />
              </div>
            )}
          </div>

          {/* 2.ለ Dropdown */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              ለ/ ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ *
            </label>
            <select
              required
              value={deliveryParticipationRating}
              onChange={(e) => setDeliveryParticipationRating(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-primary border border-border/60 rounded-xl text-text-primary font-medium focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {SATISFACTION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 2.ሐ Dropdown */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              ሐ/ በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ *
            </label>
            <select
              required
              value={deliveryConclusionsRating}
              onChange={(e) => setDeliveryConclusionsRating(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-primary border border-border/60 rounded-xl text-text-primary font-medium focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {SATISFACTION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 3: Open Text */}
        <div className="space-y-2 border-t border-border/40 pt-6">
          <label className="block text-xs font-extrabold text-text-primary">
            3. ስልጠናዉ ላይ በመሳተፍዎ ያገኙት ተጨማሪ እውቀትና ግንዛቤ እንዴትይገልፁታል?
          </label>
          <textarea
            rows={3}
            value={knowledgeGainedText}
            onChange={(e) => setKnowledgeGainedText(e.target.value)}
            placeholder="እባክዎን ያገኙትን እውቀትና ግንዛቤ ያብራሩ..."
            className="w-full px-3.5 py-2.5 text-xs bg-surface-secondary/40 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue leading-relaxed"
          />
        </div>

        {/* SECTION 4: Open Text */}
        <div className="space-y-2 border-t border-border/40 pt-6">
          <label className="block text-xs font-extrabold text-text-primary">
            4. እርስዎ ጨምሮ ከሌሎች የስልጠና ተሳታፊዎች በቀጣይ ምን ውጤት እንጠብቅ?
          </label>
          <textarea
            rows={3}
            value={expectedResultsText}
            onChange={(e) => setExpectedResultsText(e.target.value)}
            placeholder="የሚጠበቁ ውጤቶችን እና የስራ እንቅስቃሴዎችን ይፃፉ..."
            className="w-full px-3.5 py-2.5 text-xs bg-surface-secondary/40 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue leading-relaxed"
          />
        </div>

        {/* SECTION 5: Open Text */}
        <div className="space-y-2 border-t border-border/40 pt-6">
          <label className="block text-xs font-extrabold text-text-primary">
            5. አጠቃላይ ከስልጠናው ቅድመ ዝግጅት ጀምሮ ስልጠና እስከተመራበት አግባብ በቀጣይ ቢስተካከል የሚሉት ተጨማሪ አስተያየት ካለዎት
          </label>
          <textarea
            rows={3}
            value={generalImprovementText}
            onChange={(e) => setGeneralImprovementText(e.target.value)}
            placeholder="ለቀጣይ የስልጠና ማሻሻያ ተጨማሪ አስተያየት ካለዎት ያስገቡ..."
            className="w-full px-3.5 py-2.5 text-xs bg-surface-secondary/40 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue leading-relaxed"
          />
        </div>



        {/* Submit Actions */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconSend size={16} />
            <span>የዕርካታ ምዘናውን ላክ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
