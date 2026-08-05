'use client';

import React from 'react';
import { SletenaSubmission } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { PdfExportButton } from './PdfExportButton';
import { IconFlame, IconTarget, IconUsers, IconAlertTriangle, IconFileChart, IconChartBar } from '@tabler/icons-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { SletenaReportPdfTemplate } from './SletenaReportPdfTemplate';

interface NeedReportViewProps {
  submissions: SletenaSubmission[];
}

export const NeedReportView: React.FC<NeedReportViewProps> = ({ submissions }) => {
  const gapAnalysisItems = calculateKnowledgeGaps(submissions);

  const sortedNeededTopics = [...gapAnalysisItems].sort((a, b) => b.gap - a.gap);
  const topCriticalNeeded = sortedNeededTopics.filter((item) => item.priorityFlag === 'HIGH');
  const mediumNeeded = sortedNeededTopics.filter((item) => item.priorityFlag === 'MEDIUM');

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

  // Category Breakdown for Pie Chart
  const categoryDemandMap: Record<string, number> = {};
  gapAnalysisItems.forEach((item) => {
    const demand = item.priorityFlag === 'HIGH' ? 3 : item.priorityFlag === 'MEDIUM' ? 2 : 1;
    categoryDemandMap[item.category] = (categoryDemandMap[item.category] || 0) + demand;
  });

  const categoryColors = ['#0047AB', '#f43f5e', '#f59e0b', '#10b981'];
  const pieData = Object.entries(categoryDemandMap).map(([name, value], idx) => ({
    name,
    value,
    color: categoryColors[idx % categoryColors.length],
  }));

  // Top 6 Requested Directives for Bar Graph
  const barGraphData = (topRequestedDirectives.length > 0 ? topRequestedDirectives : sortedNeededTopics)
    .slice(0, 6)
    .map((item) => ({
      name: 'code' in item ? item.code : item.directiveCode,
      fullTitle: 'title' in item ? item.title : item.directiveTitle,
      demand: 'count' in item ? item.count : (item.priorityFlag === 'HIGH' ? 8 : 4),
    }));

  return (
    <div id="need-report-container" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <IconTarget className="text-brand-blue" size={24} />
            <h2 className="text-xl font-extrabold text-text-primary">
              የስልጠና ፍላጎት ሪፖርት (Training Need Report)
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            የተሰበሰቡ የስልጠና ፍላጎቶች ትንተና እና በብዛት የተጠየቁ ርዕሶች ማጠቃለያ
          </p>
        </div>
        <PdfExportButton
          elementId="need-report-container"
          reportTitle="የስልጠና_ፍላጎት_ሪፖርት"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">የተሞሉ ቅጾች</span>
            <IconUsers size={18} className="text-brand-blue" />
          </div>
          <div className="text-3xl font-extrabold text-brand-blue">{submissions.length}</div>
          <div className="text-xs text-text-secondary mt-1">ጠቅላላ ተሳታፊዎች</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">ከፍተኛ ፍላጎት (High)</span>
            <IconFlame size={18} className="text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{topCriticalNeeded.length}</div>
          <div className="text-xs text-text-secondary mt-1">አስቸኳይ ስልጠና የሚሹ ርዕሶች</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">መካከለኛ ፍላጎት (Med)</span>
            <IconAlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{mediumNeeded.length}</div>
          <div className="text-xs text-text-secondary mt-1">መካከለኛ ቅድሚያ የሚሰጣቸው</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">በብዛት የተጠየቀው</span>
            <IconTarget size={18} className="text-brand-blue" />
          </div>
          <div className="text-lg font-extrabold text-brand-blue truncate">
            {topRequestedDirectives[0]?.code || 'የለም'}
          </div>
          <div className="text-xs text-text-secondary mt-1 truncate">
            {topRequestedDirectives[0]?.title || 'መረጃ የለም'}
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Pie Chart + Bar Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Pie Chart Card */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <IconFileChart className="text-brand-blue" size={20} />
            <h3 className="text-sm font-bold text-text-primary">የስልጠና ፍላጎት በዘርፍ (Demand Distribution by Category)</h3>
          </div>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs">
                          <div className="font-bold text-text-primary mb-1">{data.name}</div>
                          <div className="text-brand-blue font-semibold">የፍላጎት ድርሻ: {data.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  cornerRadius={6}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-text-secondary truncate font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Bar Graph Card */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <IconChartBar className="text-brand-blue" size={20} />
            <h3 className="text-sm font-bold text-text-primary">ከፍተኛ ፍላጎት የታየባቸው ርዕሶች (Top Requested Directives)</h3>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface-primary border border-border/60 p-4 rounded-xl shadow-lg text-xs space-y-1.5 max-w-[220px]">
                          <div className="font-bold text-text-primary leading-snug">{data.fullTitle}</div>
                          <div className="text-brand-blue font-bold text-sm">
                            ከ{submissions.length} ሰዎች ውስጥ፣ {data.demand} ሰዎች
                          </div>
                          <div className="text-text-muted">ይህን ርዕስ እንዲሰለጥኑ መረጡ</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="demand" fill="#0047AB" radius={[6, 6, 0, 0]} name="የሚፈልጉ ሰዎች ብዛት" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Report Cards */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">ዝርዝር የስልጠና ፍላጎት ሪፖርት</h3>
            <p className="text-xs text-text-muted mt-0.5">
              ከ<span className="font-bold text-text-primary">{submissions.length}</span> ሰዎች ውስጥ፣ ሰዎች በደረጃ ቅደም ተከተል የከፈሉት የስልጠና ፍላጎት
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> ከፍተኛ ቅድሚያ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> መካከለኛ ቅድሚያ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> አነስተኛ ፍላጎት</span>
          </div>
        </div>

        <div className="space-y-3">
          {sortedNeededTopics.map((topic, index) => {
            const demandEntry = topRequestedDirectives.find(
              (d) => d.code === topic.directiveCode || d.code === topic.directiveId
            );
            const demandCount = demandEntry?.count ?? 0;
            const demandPct = Math.round((demandCount / Math.max(submissions.length, 1)) * 100);
            const gapPct = Math.round((topic.gap / topic.targetScore) * 100);

            const isHigh = topic.priorityFlag === 'HIGH';
            const isMedium = topic.priorityFlag === 'MEDIUM';

            const badgeBg = isHigh
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : isMedium
              ? 'bg-amber-400/10 text-amber-600 border-amber-400/20'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

            const rankBg = isHigh
              ? 'bg-rose-500/10 text-rose-600'
              : isMedium
              ? 'bg-amber-400/10 text-amber-600'
              : 'bg-emerald-500/10 text-emerald-600';

            const gapBarColor = isHigh
              ? 'bg-rose-500'
              : isMedium
              ? 'bg-amber-400'
              : 'bg-emerald-500';

            const gapTextColor = isHigh
              ? 'text-rose-500'
              : isMedium
              ? 'text-amber-500'
              : 'text-emerald-600';

            const badgeText = isHigh
              ? 'ከፍተኛ ቅድሚያ'
              : isMedium
              ? 'መካከለኛ ቅድሚያ'
              : 'ጥሩ ብቃት (አነስተኛ ፍላጎት)';

            return (
              <div
                key={topic.directiveId}
                className="group bg-surface-secondary/30 hover:bg-surface-secondary/60 border border-border/40 hover:border-border/70 rounded-xl p-4 transition-all duration-200"
              >
                {/* Top Row */}
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold mt-0.5 ${rankBg}`}>
                    #{index + 1}
                  </div>

                  {/* Title block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-text-muted bg-surface-secondary px-2 py-0.5 rounded-md">
                        {topic.directiveCode}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeBg}`}>
                        {isHigh ? <IconFlame size={11} /> : isMedium ? <IconAlertTriangle size={11} /> : null}
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary leading-snug">{topic.directiveTitle}</p>
                    <p className="text-xs text-text-muted mt-0.5">{topic.category}</p>
                  </div>

                  {/* Right stat (desktop) */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <div className="text-xl font-extrabold text-brand-blue">{demandCount}</div>
                    <div className="text-[10px] text-text-muted">ሰዎች መረጡ</div>
                    <div className="text-[10px] font-bold text-text-secondary">{demandPct}% ከጠቅላላ</div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      <span>ፍላጎት (ከ{submissions.length} ሰዎች)</span>
                      <span className="font-bold text-brand-blue">{demandCount} ({demandPct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-brand-blue transition-all duration-700" style={{ width: `${demandPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      <span>የዕውቀት ክፍተት (Gap)</span>
                      <span className={`font-bold ${gapTextColor}`}>{gapPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${gapBarColor}`} style={{ width: `${gapPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Mobile demand line */}
                <div className="mt-2 sm:hidden text-xs text-text-muted">
                  <span className="font-bold text-brand-blue">{demandCount} ሰዎች</span> ይህን ርዕስ እንዲሰለጥኑ መረጡ
                  <span className="ml-1 text-text-secondary">({demandPct}% ከጠቅላላ)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden Official PDF Document Template for Clean Printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1100px' }}>
        <SletenaReportPdfTemplate
          needSubmissions={submissions}
          satisfactionSubmissions={[]}
          reportTitle="የስልጠና ፍላጎት እና ክፍተት ትንተና ሪፖርት"
        />
      </div>
    </div>
  );
};
