'use client';

import React, { useState } from 'react';
import { TrainingCategory, SatisfactionSubmission } from '@/types/sletena';
import { IconArrowLeft, IconCheck, IconStar, IconSend } from '@tabler/icons-react';

interface SatisfactionSubmissionFormProps {
  category: TrainingCategory;
  onBack: () => void;
  onSubmitSuccess: (submission: SatisfactionSubmission) => void;
}

export const SatisfactionSubmissionForm: React.FC<SatisfactionSubmissionFormProps> = ({
  category,
  onBack,
  onSubmitSuccess,
}) => {
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [organizationUnit, setOrganizationUnit] = useState('');
  const [region, setRegion] = useState('አዲስ አበባ');

  // Ratings (1 to 5 scale)
  const [trainerRating, setTrainerRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [venueLogisticsRating, setVenueLogisticsRating] = useState(4);
  const [relevanceRating, setRelevanceRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [recommendScore, setRecommendScore] = useState(10); // 1 to 10 NPS

  const [positiveAspects, setPositiveAspects] = useState('');
  const [improvementSuggestions, setImprovementSuggestions] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) return;

    const newSubmission: SatisfactionSubmission = {
      id: `sat-sub-${Date.now()}`,
      categoryId: category.id,
      categoryTitle: category.title,
      participantName: participantName.trim(),
      participantEmail: participantEmail.trim(),
      organizationUnit: organizationUnit.trim(),
      region,
      trainerRating,
      contentRating,
      venueLogisticsRating,
      relevanceRating,
      overallRating,
      recommendScore,
      positiveAspects: positiveAspects.trim(),
      improvementSuggestions: improvementSuggestions.trim(),
      submittedAt: new Date().toISOString(),
    };

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
          onClick={onBack}
          className="mt-4 px-6 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs shadow-md hover:bg-brand-blue/90 transition-all cursor-pointer"
        >
          ወደ ዋናው ገጽ ተመለስ
        </button>
      </div>
    );
  }

  const renderStarRating = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    description?: string
  ) => (
    <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <label className="text-xs font-bold text-text-primary">{label}</label>
          {description && <p className="text-[11px] text-text-muted">{description}</p>}
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-all cursor-pointer"
            >
              <IconStar
                size={22}
                className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
              />
            </button>
          ))}
          <span className="text-xs font-mono font-bold text-text-primary ml-2">{value}/5</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <IconArrowLeft size={16} />
          <span>ተመለስ</span>
        </button>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-[11px] font-bold border border-purple-500/20">
          ⭐ ድህረ-ስልጠና የዕርካታ ምዘና
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary">{category.title}</h2>
          <p className="text-xs text-text-muted mt-1">{category.description}</p>
        </div>

        {/* Participant Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">የተሳታፊው ሙሉ ስም *</label>
            <input
              type="text"
              required
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="ስምዎን ያስገቡ..."
              className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">ኢሜይል (አማራጭ)</label>
            <input
              type="email"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
              placeholder="example@inspection.gov.et"
              className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">የተቋም / ክፍል ስም</label>
            <input
              type="text"
              value={organizationUnit}
              onChange={(e) => setOrganizationUnit(e.target.value)}
              placeholder="የስራ ክፍል..."
              className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">ክልል / ከተማ አስተዳደር</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            >
              <option value="አዲስ አበባ">አዲስ አበባ</option>
              <option value="ኦሮሚያ">ኦሮሚያ</option>
              <option value="አማራ">አማራ</option>
              <option value="ትግራይ">ትግራይ</option>
              <option value="ደቡብ ኢትዮጵያ">ደቡብ ኢትዮጵያ</option>
              <option value="ሲዳማ">ሲዳማ</option>
              <option value="ድሬዳዋ">ድሬዳዋ</option>
            </select>
          </div>
        </div>

        {/* Rating Dimensions */}
        <div className="space-y-3 border-t border-border/40 pt-4">
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
            📊 የዕርካታ ምዘና መስፈርቶች (Evaluation Criteria)
          </h3>

          {renderStarRating('1. የአሰልጣኝ ብቃት እና ዝግጅት (Trainer Expertise)', trainerRating, setTrainerRating, 'አሰልጣኞች በርዕሱ ላይ ያላቸው እውቀት እና ማብራሪያ')}
          {renderStarRating('2. የስልጠና ይዘት ጥራት (Content Quality)', contentRating, setContentRating, 'የስልጠና ማኑዋሎች እና መረጃዎች ግልፅነት')}
          {renderStarRating('3. የአደረጃጀት እና መስተንግዶ ጥራት (Venue & Logistics)', venueLogisticsRating, setVenueLogisticsRating, 'የስልጠና አዳራሽ፣ ቴክኖሎጂ እና አቅርቦት')}
          {renderStarRating('4. ከስራዎ ጋር ያለው ተዛማጅነት (Job Relevance)', relevanceRating, setRelevanceRating, 'ለቀን ተቀን የፍተሻ ስራዎ ያለው ጠቃሚነት')}
          {renderStarRating('5. አጠቃላይ የዕርካታ ደረጃ (Overall Satisfaction)', overallRating, setOverallRating, 'በአጠቃላይ በስልጠናው ላይ ያሎት ዕርካታ')}
        </div>

        {/* NPS Rating: Recommend Score (1 to 10) */}
        <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-text-primary">
            ይህንን ስልጠና ለሌሎች የስራ ባልደረቦችዎ የመምከር እድሎት ምን ያህል ነው? (NPS Score: 1-10)
          </label>
          <div className="flex items-center justify-between gap-1 pt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                type="button"
                key={score}
                onClick={() => setRecommendScore(score)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  recommendScore === score
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                    : 'bg-surface-primary text-text-secondary border-border/50 hover:bg-surface-secondary'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div className="space-y-4 border-t border-border/40 pt-4">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              በስልጠናው ይበልጥ የወደዱት አዎንታዊ ጎን (Positive Aspects)
            </label>
            <textarea
              rows={2}
              value={positiveAspects}
              onChange={(e) => setPositiveAspects(e.target.value)}
              placeholder="በስልጠናው ያስደሰተዎትን ያብራሩ..."
              className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              ለቀጣይ እንዲሻሻል የሚሰጡት የመፍትሔ አስተያየት (Improvement Suggestions)
            </label>
            <textarea
              rows={2}
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              placeholder="ለወደፊት ስልጠናዎች የመሻሻያ ሀሳብ ካለዎት ያስገቡ..."
              className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary cursor-pointer"
          >
            ሰርዝ
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconSend size={16} />
            <span>የዕርካታ ምዘናውን ላክ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
