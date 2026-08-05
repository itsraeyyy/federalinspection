'use client';

import React from 'react';
import { SletenaSubmission } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { PdfExportButton } from './PdfExportButton';
import { IconFlame, IconTarget, IconUsers, IconAlertTriangle } from '@tabler/icons-react';

interface NeedReportViewProps {
  submissions: SletenaSubmission[];
}

export const NeedReportView: React.FC<NeedReportViewProps> = ({ submissions }) => {
  const gapAnalysisItems = calculateKnowledgeGaps(submissions);

  // Sort items by priority / highest gap to find mostly needed training topics
  const sortedNeededTopics = [...gapAnalysisItems].sort((a, b) => b.gap - a.gap);
  const topCriticalNeeded = sortedNeededTopics.filter((item) => item.priorityFlag === 'HIGH');
  const mediumNeeded = sortedNeededTopics.filter((item) => item.priorityFlag === 'MEDIUM');

  // Compute top 3 requested directive codes from topPriorityDirectives array in submissions
  const directiveDemandCounts: Record<string, number> = {};
  submissions.forEach((sub) => {
    sub.topPriorityDirectives.forEach((dirId) => {
      directiveDemandCounts[dirId] = (directiveDemandCounts[dirId] || 0) + 1;
    });
  });

  const topRequestedDirectives = Object.entries(directiveDemandCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([code, count]) => {
      const match = gapAnalysisItems.find((g) => g.directiveId === code || g.directiveCode === code);
      return {
        code,
        title: match ? match.directiveTitle : code,
        category: match ? match.category : 'General',
        count,
        percentage: Math.round((count / Math.max(submissions.length, 1)) * 100),
      };
    });

  return (
    <div id="need-report-container" className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <IconFlame className="text-amber-500" size={24} />
            <h2 className="text-xl font-extrabold text-text-primary">
              የስልጠና ፍላጎት እና የከፍተኛ ርዕሶች ትንተና ሪፖርት (Training Need Report)
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            አባላት (አስቢዎች/ተቆጣጣሪዎች) በፎርም የላኳቸው የስልጠና ፍላጎቶች ትንተና እና በብዛት የተጠየቁ ርዕሶች ዝርዝር ሪፖርት::
          </p>
        </div>

        <PdfExportButton
          elementId="need-report-container"
          reportTitle="የስልጠና_ፍላጎት_እና_የከፍተኛ_ርዕሶች_ሪፖርት"
        />
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">ጠቅላላ የተሞሉ ቅጾች</span>
            <IconUsers size={18} className="text-brand-blue" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary">{submissions.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">ከሁሉም ክልሎች የተሰበሰበ</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">ከፍተኛ ፍላጎት ያላቸው ርዕሶች</span>
            <IconFlame size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{topCriticalNeeded.length}</div>
          <div className="text-[11px] text-text-muted">አስቸኳይ ስልጠና የሚሹ መመሪያዎች</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">መካከለኛ ፍላጎት ያላቸው</span>
            <IconTarget size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{mediumNeeded.length}</div>
          <div className="text-[11px] text-text-muted">መካከለኛ የክፍተት መጠን ያላቸው</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">በብዛት የተመረጠ ርዕስ</span>
            <IconAlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-600 truncate">
            {topRequestedDirectives[0]?.code || 'INS-02'}
          </div>
          <div className="text-[11px] text-text-muted truncate">
            {topRequestedDirectives[0]?.title || 'የመረጃ ደህንነት'}
          </div>
        </div>
      </div>

      {/* Main Section: Top Mostly Needed Training Topics Ranked */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          በአባላት በከፍተኛ ደረጃ የተጠየቁ የስልጠና ርዕሶች (Most Requested Training Topics)
        </h3>

        <div className="space-y-3">
          {sortedNeededTopics.slice(0, 8).map((topic, index) => {
            const isHigh = topic.priorityFlag === 'HIGH';
            const demandPct = Math.min(100, Math.round((topic.gap / 5.0) * 100));

            return (
              <div
                key={topic.directiveId}
                className="bg-surface-secondary/40 border border-border/40 rounded-xl p-4 transition-all hover:bg-surface-secondary/70"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue font-mono font-bold text-xs flex items-center justify-center border border-brand-blue/20">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-text-primary flex items-center gap-2">
                        <span>{topic.directiveCode} - {topic.directiveTitle}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isHigh
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}
                        >
                          {isHigh ? '🔥 ከፍተኛ ፍላጎት (High Priority)' : '⚡ መካከለኛ ፍላጎት'}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted">{topic.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-text-secondary">
                      የክፍተት መጠን: <span className="font-bold text-brand-blue">{topic.gap.toFixed(2)}</span> / 5.0
                    </span>
                  </div>
                </div>

                {/* Progress Demand Bar */}
                <div className="w-full bg-surface-primary/80 rounded-full h-2 overflow-hidden border border-border/30">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-brand-blue'
                    }`}
                    style={{ width: `${demandPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Feedback Summaries */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-text-primary">
          💬 በአባላት የተሰጡ የስልጠና አስተያየቶች እና ጥያቄዎች (Qualitative Member Feedback)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-border/30 pb-2">
                <span className="font-bold text-text-primary">{sub.memberName} ({sub.membershipLevel})</span>
                <span className="text-text-muted">{sub.region} - {sub.zone}</span>
              </div>
              <p className="text-xs text-text-secondary italic">"{sub.qualitativeFeedback}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
