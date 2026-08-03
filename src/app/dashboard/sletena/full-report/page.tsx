'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { GapAnalyticsChart } from '@/components/sletena/GapAnalyticsChart';
import { RegionalHeatmap } from '@/components/sletena/RegionalHeatmap';
import { NpsWidget } from '@/components/sletena/NpsWidget';
import { SentimentAnalysisWidget } from '@/components/sletena/SentimentAnalysisWidget';
import { PdfExportButton } from '@/components/sletena/PdfExportButton';
import { MOCK_SUBMISSIONS } from '@/data/sletenaDirectives';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { calculateNPS } from '@/lib/sletena/npsEngine';
import { analyzeSentiment } from '@/lib/sletena/sentimentNLP';
import { IconTrendingUp } from '@tabler/icons-react';

export default function SletenaFullReportPage() {
  const [submissions] = useState(MOCK_SUBMISSIONS);

  // Compute analytics dynamically via engines
  const gapAnalysisItems = calculateKnowledgeGaps(submissions);
  const npsData = calculateNPS(submissions);
  const sentimentData = analyzeSentiment(submissions);

  const highPriorityDirectives = gapAnalysisItems.filter((i) => i.priorityFlag === 'HIGH');
  const avgOverallGap = (
    gapAnalysisItems.reduce((acc, curr) => acc + curr.gap, 0) / gapAnalysisItems.length
  ).toFixed(2);

  return (
    <DashboardLayout>
      <div id="sletena-report-view" className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h1 className="text-xl font-extrabold text-text-primary">
                የስልጠና ሙሉ ሪፖርት እና ትንተና
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              የስልጠና ፍላጎት እና የክፍተት ትንተና ዳሽቦርድ (Gap = Target - Current)፣ የክልሎች ካርታ፣ የNPS ደረጃ እና የአስተያየት NLP ትንተና
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PdfExportButton
              elementId="sletena-report-view"
              reportTitle="የስልጠና ፍላጎት ሙሉ ሪፖርት"
            />
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Evaluated */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">ጠቅላላ የተሞሉ ቅጾች</span>
            <div className="text-2xl font-extrabold text-text-primary">{submissions.length}</div>
            <div className="text-[11px] text-text-muted flex items-center gap-1">
              <IconTrendingUp size={14} className="text-emerald-500" /> በ3 ክልሎች የተሰበሰበ
            </div>
          </div>

          {/* Card 2: Overall Mean Gap */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">አማካይ የስልጠና ክፍተት</span>
            <div className="text-2xl font-extrabold text-amber-600">{avgOverallGap}</div>
            <div className="text-[11px] text-text-muted">የዒላማ ደረጃ: 5.0</div>
          </div>

          {/* Card 3: High Priority Directives */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">ከፍተኛ ቅድሚያ የሚሹ</span>
            <div className="text-2xl font-extrabold text-red-600">{highPriorityDirectives.length}</div>
            <div className="text-[11px] text-text-muted">ክፍተት &gt; 2.0 (አስቸኳይ ስልጠና)</div>
          </div>

          {/* Card 4: Net Promoter Score */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">የNPS እርካታ ደረጃ</span>
            <div className="text-2xl font-extrabold text-brand-blue">
              {npsData.npsScore > 0 ? `+${npsData.npsScore}` : npsData.npsScore}
            </div>
            <div className="text-[11px] text-text-muted">{npsData.promotersPct}% ደጋፊዎች</div>
          </div>
        </div>

        {/* 1. Gap Calculation & Priority Flagging Chart */}
        <GapAnalyticsChart gapItems={gapAnalysisItems} />

        {/* 2. Regional & Zonal Knowledge Gap Heatmap */}
        <RegionalHeatmap />

        {/* 3. NPS Aggregate Tracker & Sentiment NLP Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NpsWidget nps={npsData} />
          <SentimentAnalysisWidget sentiment={sentimentData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
