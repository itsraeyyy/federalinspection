'use client';

import React from 'react';
import { SatisfactionSubmission } from '@/types/sletena';
import { PdfExportButton } from './PdfExportButton';
import { IconStar, IconUsers, IconHeartHandshake, IconChartBar, IconBulb } from '@tabler/icons-react';

interface SatisfactionReportViewProps {
  submissions: SatisfactionSubmission[];
}

export const SatisfactionReportView: React.FC<SatisfactionReportViewProps> = ({ submissions }) => {
  const count = submissions.length || 1;

  const avgTrainer = (submissions.reduce((a, b) => a + b.trainerRating, 0) / count).toFixed(2);
  const avgContent = (submissions.reduce((a, b) => a + b.contentRating, 0) / count).toFixed(2);
  const avgVenue = (submissions.reduce((a, b) => a + b.venueLogisticsRating, 0) / count).toFixed(2);
  const avgRelevance = (submissions.reduce((a, b) => a + b.relevanceRating, 0) / count).toFixed(2);
  const avgOverall = (submissions.reduce((a, b) => a + b.overallRating, 0) / count).toFixed(2);

  const csatPct = Math.round((Number(avgOverall) / 5.0) * 100);

  // Calculate NPS Score: promoters = recommendScore 9-10, detractors = 1-6
  const promoters = submissions.filter((s) => s.recommendScore >= 9).length;
  const detractors = submissions.filter((s) => s.recommendScore <= 6).length;
  const npsScore = Math.round(((promoters - detractors) / count) * 100);

  return (
    <div id="satisfaction-report-container" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <IconStar className="text-purple-500 fill-purple-500" size={24} />
            <h2 className="text-xl font-extrabold text-text-primary">
              የስልጠና ዕርካታ ትንተና እና ሪፖርት (Post-Training Satisfaction Report)
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            ስልጠና ከተጠናቀቀ በኋላ ከተሳታፊዎች የተሰበሰቡ የዕርካታ ደረጃዎች፣ የአሰልጣኞች ብቃት ምዘና እና የማሻሻያ ሀሳቦች ሪፖርት::
          </p>
        </div>

        <PdfExportButton
          elementId="satisfaction-report-container"
          reportTitle="የስልጠና_ዕርካታ_ትንተና_ሪፖርት"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall CSAT */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">የአጠቃላይ ዕርካታ (CSAT)</span>
            <IconHeartHandshake size={20} className="text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-600">{csatPct}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">ከፍተኛ የዕርካታ ደረጃ</div>
        </div>

        {/* Average Overall Rating */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">አማካይ የዕርካታ ነጥብ</span>
            <IconStar size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-500">{avgOverall} / 5.0</div>
          <div className="text-[11px] text-text-muted">ከ5 የከዋክብት ደረጃ</div>
        </div>

        {/* NPS Score */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">የመደገፍ ደረጃ (NPS)</span>
            <IconChartBar size={20} className="text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">+{npsScore}</div>
          <div className="text-[11px] text-text-muted">{promoters} የተደሰቱ ደጋፊዎች</div>
        </div>

        {/* Total Responses */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">የምዘና ተሳታፊዎች</span>
            <IconUsers size={20} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-text-primary">{submissions.length}</div>
          <div className="text-[11px] text-text-muted">የተሞሉ የዕርካታ ቅጾች</div>
        </div>
      </div>

      {/* Ratings by Criteria Dimensions */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
          የስልጠና ዕርካታ በዘርፍ (Satisfaction Breakdown by Category)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trainer Score */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-text-primary">
              <span>👨‍🏫 የአሰልጣኝ ብቃት እና ዝግጅት (Trainer Expertise)</span>
              <span className="text-purple-600 font-mono text-sm">{avgTrainer} / 5.0</span>
            </div>
            <div className="w-full bg-surface-primary rounded-full h-2.5 overflow-hidden border border-border/30">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(Number(avgTrainer) / 5) * 100}%` }} />
            </div>
          </div>

          {/* Content Score */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-text-primary">
              <span>📘 የስልጠና ይዘት ጥራት (Content Quality)</span>
              <span className="text-blue-600 font-mono text-sm">{avgContent} / 5.0</span>
            </div>
            <div className="w-full bg-surface-primary rounded-full h-2.5 overflow-hidden border border-border/30">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(Number(avgContent) / 5) * 100}%` }} />
            </div>
          </div>

          {/* Job Relevance */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-text-primary">
              <span>💼 ከስራ ጋር ያለው ተዛማጅነት (Job Relevance)</span>
              <span className="text-emerald-600 font-mono text-sm">{avgRelevance} / 5.0</span>
            </div>
            <div className="w-full bg-surface-primary rounded-full h-2.5 overflow-hidden border border-border/30">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(Number(avgRelevance) / 5) * 100}%` }} />
            </div>
          </div>

          {/* Venue & Logistics */}
          <div className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-text-primary">
              <span>🏛️ የአደረጃጀት እና መስተንግዶ ጥራት (Venue & Logistics)</span>
              <span className="text-amber-600 font-mono text-sm">{avgVenue} / 5.0</span>
            </div>
            <div className="w-full bg-surface-primary rounded-full h-2.5 overflow-hidden border border-border/30">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(Number(avgVenue) / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Participant Qualitative Feedback & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Feedback */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
            <IconStar size={18} className="fill-emerald-500 text-emerald-500" />
            ተሳታፊዎች ያደነቋቸው አዎንታዊ ጎኖች (Positive Aspects)
          </h3>
          <div className="space-y-3">
            {submissions
              .filter((s) => s.positiveAspects)
              .map((sub) => (
                <div key={sub.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-text-primary">
                    <span>{sub.participantName}</span>
                    <span className="text-emerald-600">⭐ {sub.overallRating}/5</span>
                  </div>
                  <p className="text-xs text-text-secondary italic">"{sub.positiveAspects}"</p>
                </div>
              ))}
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-amber-600 flex items-center gap-2">
            <IconBulb size={18} className="text-amber-500" />
            ለወደፊት እንዲሻሻሉ የተሰጡ የመፍትሔ አስተያየቶች (Suggestions)
          </h3>
          <div className="space-y-3">
            {submissions
              .filter((s) => s.improvementSuggestions)
              .map((sub) => (
                <div key={sub.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-text-primary">
                    <span>{sub.participantName}</span>
                    <span className="text-text-muted">{sub.region}</span>
                  </div>
                  <p className="text-xs text-text-secondary italic">"{sub.improvementSuggestions}"</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
