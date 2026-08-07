'use client';

import React from 'react';
import { SletenaSubmission, SatisfactionSubmission, TrainingCategory, InspectionDirective } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { formatECDate } from '@/lib/date-formatter';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';

// ============================================================================
// EXECUTIVE REPORT PRINT SUB-COMPONENTS (FORTUNE 100 DESIGN SYSTEM)
// ============================================================================

/** Executive Section Wrapper ensuring zero mid-card or mid-table splits */
const ExecutiveSection: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`space-y-4 ${className}`}
    style={{
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
    }}
  >
    {children}
  </div>
);

/** Custom Native SVG Donut Chart with side legend table */
const SvgDonutChart: React.FC<{
  data: { name: string; value: number; pct: number; color: string }[];
  centerLabel?: string;
  centerValue?: string | number;
}> = ({ data, centerLabel = 'áŒ á‰…áˆ‹áˆ‹', centerValue }) => {
  const size = 160;
  const radius = 52;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex items-center gap-6 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {data.map((item, i) => {
            const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.pct;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
            {centerLabel}
          </span>
          <span className="text-xl font-black text-slate-950 font-mono">
            {centerValue !== undefined ? centerValue : data.reduce((acc, d) => acc + d.value, 0)}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 last:border-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-bold text-slate-800">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-slate-950 font-mono">{item.value}</span>
              <span className="text-[11px] font-black text-slate-600 font-mono w-10 text-right">
                ({item.pct}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Custom Native SVG Ranked Horizontal Bar Chart */
const SvgRankedBarChart: React.FC<{
  data: { label: string; count: number; pct: number }[];
  maxCount?: number;
  barColor?: string;
}> = ({ data, maxCount, barColor = '#1e3a8a' }) => {
  const highest = maxCount || Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2.5 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80">
      {data.map((item, idx) => {
        const widthPct = Math.max(Math.round((item.count / highest) * 100), 6);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-950 text-white font-mono text-[10px] flex items-center justify-center font-black">
                  {idx + 1}
                </span>
                <span>{item.label}</span>
              </span>
              <span className="font-mono text-slate-950">
                <strong>{item.count}</strong> <span className="text-slate-600">({item.pct}%)</span>
              </span>
            </div>
            <div className="h-3 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN EXECUTIVE PDF REPORT TEMPLATE
// ============================================================================

interface SletenaReportPdfTemplateProps {
  needSubmissions: SletenaSubmission[];
  satisfactionSubmissions?: SatisfactionSubmission[];
  category?: TrainingCategory | null;
  reportTitle?: string;
}

export const SletenaReportPdfTemplate: React.FC<SletenaReportPdfTemplateProps> = ({
  needSubmissions,
  satisfactionSubmissions = [],
  category,
  reportTitle = 'á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µá£ á‹¨á‰¥á‰ƒá‰µ áŠ­áá‰°á‰µ (Gap) áŠ¥áŠ“ á‰µáŒá‰ áˆ« áˆ™áˆ‰ áŠ¦áŠáˆ´áˆ‹á‹Š áˆªá–áˆ­á‰µ',
}) => {
  const needSubs = needSubmissions || [];

  // Dynamically resolve active directives from ratings or priority directives across submissions
  const activeDirectiveMap = new Map<string, { id: string; code: string; title: string }>();
  needSubs.forEach((sub) => {
    if (sub.ratings) {
      Object.keys(sub.ratings).forEach((key) => {
        if (!activeDirectiveMap.has(key)) {
          const match = INSPECTION_DIRECTIVES.find((d) => d.id === key || d.code === key);
          if (match) {
            activeDirectiveMap.set(match.id, { id: match.id, code: match.code, title: match.title });
          } else {
            activeDirectiveMap.set(key, { id: key, code: key, title: `áˆ˜áˆ˜áˆªá‹« / áˆ˜áŒ á‹­á‰… ${key}` });
          }
        }
      });
    }
    if (sub.topPriorityDirectives) {
      sub.topPriorityDirectives.forEach((key) => {
        if (!activeDirectiveMap.has(key)) {
          const match = INSPECTION_DIRECTIVES.find((d) => d.id === key || d.code === key);
          if (match) {
            activeDirectiveMap.set(match.id, { id: match.id, code: match.code, title: match.title });
          } else {
            activeDirectiveMap.set(key, { id: key, code: key, title: `áˆ˜áˆ˜áˆªá‹« / áˆ˜áŒ á‹­á‰… ${key}` });
          }
        }
      });
    }
  });

  const activeDirectives: InspectionDirective[] = Array.from(activeDirectiveMap.values()).map((d) => ({
    id: d.id,
    code: d.code,
    title: d.title,
    description: '',
    category: 'GENERAL',
    targetScore: 5.0,
  }));

  const questionsAsDirectives: InspectionDirective[] = (category?.questions || []).map((q) => ({
    id: q.id,
    code: q.code || q.id,
    title: q.title || `áˆ˜áˆ˜áˆªá‹« ${q.id}`,
    description: q.description || '',
    category: q.category || 'GENERAL',
    targetScore: q.targetScore || 5.0,
  }));

  const gapAnalysis = calculateKnowledgeGaps(
    needSubs,
    activeDirectives.length > 0
      ? activeDirectives
      : questionsAsDirectives.length > 0
      ? questionsAsDirectives
      : INSPECTION_DIRECTIVES
  );

  const sortedGaps = [...gapAnalysis].sort((a, b) => b.gap - a.gap);

  const topPriorityVotesMap: Record<string, number> = {};
  needSubs.forEach((sub) => {
    if (sub.topPriorityDirectives && Array.isArray(sub.topPriorityDirectives)) {
      sub.topPriorityDirectives.forEach((dirId) => {
        topPriorityVotesMap[dirId] = (topPriorityVotesMap[dirId] || 0) + 1;
      });
    }
  });

  const top3Recommended = sortedGaps.slice(0, 3).map((item) => {
    let displayTitle = item.directiveTitle;
    if (!displayTitle || displayTitle.startsWith('áˆ˜áˆ˜áˆªá‹« / áˆ˜áŒ á‹­á‰…')) {
      const match = INSPECTION_DIRECTIVES.find((d) => d.id === item.directiveId || d.code === item.directiveCode);
      if (match) displayTitle = match.title;
    }
    const votes = topPriorityVotesMap[item.directiveId] || topPriorityVotesMap[item.directiveCode] || 0;
    const votePct = Math.round((votes / Math.max(needSubs.length, 1)) * 100);
    return {
      ...item,
      displayTitle,
      votes,
      votePct,
      needPct: Math.round((item.currentScore / 5.0) * 100),
    };
  });

  const regionsMap: Record<string, number> = {};
  needSubs.forEach((sub) => {
    const reg = sub.region || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸';
    regionsMap[reg] = (regionsMap[reg] || 0) + 1;
  });

  const regionList = Object.entries(regionsMap)
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / Math.max(needSubs.length, 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const membershipMap: Record<string, number> = {};
  needSubs.forEach((sub) => {
    const role = sub.membershipLevel || 'áŠ á‰£áˆ';
    membershipMap[role] = (membershipMap[role] || 0) + 1;
  });

  const roleColors: Record<string, string> = {
    'Keftegna_Amerar': '#1e1b4b',
    'Mekakelegna_Amerar': '#059669',
    'Abal': '#d97706',
    'Yebeteseb_Yehbret_Amerar': '#7c3aed',
  };

  const membershipList = Object.entries(membershipMap).map(([role, count]) => ({
    name: role,
    value: count,
    pct: Math.round((count / Math.max(needSubs.length, 1)) * 100),
    color: roleColors[role] || '#2563eb',
  }));

  let inPersonCount = 0;
  let onlineCount = 0;
  let videoAudioCount = 0;
  let hardCopyCount = 0;

  needSubs.forEach((s) => {
    const methods = s.preferredTrainingMethods || [];
    if (methods.some((m) => m.includes('In-Person') || m.includes('á‰ áŠ áŠ«áˆ'))) inPersonCount++;
    if (methods.some((m) => m.includes('Online') || m.includes('áŠ¦áŠ•áˆ‹á‹­áŠ•'))) onlineCount++;
    if (methods.some((m) => m.includes('á‰ªá‹²á‹®') || m.includes('á‹µáˆá…') || m.includes('Media'))) videoAudioCount++;
    if (methods.some((m) => m.includes('á‹¨á‰³á‰°áˆ˜') || m.includes('Hard Copy'))) hardCopyCount++;
  });

  const totalSubs = Math.max(needSubs.length, 1);
  const inPersonPct = Math.round((inPersonCount / totalSubs) * 100);
  const onlinePct = Math.round((onlineCount / totalSubs) * 100);

  const trainingModeChartData = [
    { name: 'á‰ áŠ áŠ«áˆ (In-Person)', value: inPersonCount, pct: inPersonPct, color: '#059669' },
    { name: 'Online (áŠ¦áŠ•áˆ‹á‹­áŠ•)', value: onlineCount, pct: onlinePct, color: '#2563eb' },
  ];

  const videoAudioPct = Math.round((videoAudioCount / totalSubs) * 100);
  const hardCopyPct = Math.round((hardCopyCount / totalSubs) * 100);

  const trainingMaterialChartData = [
    { name: 'á‹¨á‰ªá‹²á‹®áŠ“ á‹µáˆá… áˆ›á‰¥áˆ«áˆªá‹«á‹Žá‰½', value: videoAudioCount, pct: videoAudioPct, color: '#d97706' },
    { name: 'á‹¨á‰³á‰°áˆ˜ áˆ°áŠá‹µ (Hard Copy)', value: hardCopyCount, pct: hardCopyPct, color: '#7c3aed' },
  ];

  const additionalDirectivesMap: Record<string, { code: string; title: string; count: number }> = {};
  needSubs.forEach((sub) => {
    if (sub.additionalNeededDirectives && Array.isArray(sub.additionalNeededDirectives)) {
      sub.additionalNeededDirectives.forEach((dirId: string) => {
        const match = INSPECTION_DIRECTIVES.find((d) => d.id === dirId || d.code === dirId);
        const code = match ? match.code : dirId;
        const title = match ? match.title : `á‰°áŒ¨áˆ›áˆª áˆ˜áˆ˜áˆªá‹« ${dirId}`;
        if (!additionalDirectivesMap[code]) {
          additionalDirectivesMap[code] = { code, title, count: 0 };
        }
        additionalDirectivesMap[code].count += 1;
      });
    }
  });

  const allAdditionalDirectives = Object.values(additionalDirectivesMap)
    .map((item, idx) => ({
      id: `add_${idx}`,
      code: item.code,
      title: item.title,
      count: item.count,
      pct: Math.round((item.count / totalSubs) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const zoneWoredaMap: Record<string, { region: string; zone: string; woreda: string; count: number }> = {};
  needSubs.forEach((sub) => {
    const key = `${sub.region || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸'}_${sub.zone || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸'}_${sub.woreda || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸'}`;
    if (!zoneWoredaMap[key]) {
      zoneWoredaMap[key] = {
        region: sub.region || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸',
        zone: sub.zone || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸',
        woreda: sub.woreda || 'á‹«áˆá‰°áŒˆáˆˆáŒ¸',
        count: 0,
      };
    }
    zoneWoredaMap[key].count += 1;
  });

  const zoneWoredaRows = Object.values(zoneWoredaMap).sort((a, b) => b.count - a.count);
  const currentDateStr = formatECDate(new Date().toISOString());

  return (
    <div
      id="pdf-printable-document-template"
      className="w-[850px] mx-auto text-slate-900 font-sans space-y-8"
      style={{ backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: EXECUTIVE SUMMARY & ACTION PLAN */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* EXECUTIVE GOVERNMENT HEADER */}
          <ExecutiveSection className="border-b-4 border-blue-950 pb-6 flex justify-between items-end">
            <div className="space-y-1.5">
              <div className="text-[11px] font-black text-blue-950 tracking-widest uppercase flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-950 inline-block shadow-xs" />
                á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ
              </div>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">
                {category ? category.title : reportTitle}
              </h1>
              <p className="text-xs font-semibold text-slate-600 max-w-2xl leading-relaxed">
                {category ? category.description : 'á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µá£ á‹¨á‰¥á‰ƒá‰µ áŠ­áá‰°á‰µ (Gap) áŠ¥áŠ“ á‹¨áˆµáˆáŒ áŠ“ á‰µáŒá‰ áˆ« á‹áˆ³áŠ” áŠ¦áŠáˆ´áˆ‹á‹Š á‹¨á‰µáŠ•á‰°áŠ“ áˆ°áŠá‹µ'}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-800 space-y-1 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
              <div><strong>á‹¨á‹ˆáŒ£á‰ á‰µ á‰€áŠ•á¡</strong> <span className="font-mono">{currentDateStr}</span></div>
              <div><strong>áŒ á‰…áˆ‹áˆ‹ á‰°áˆ³á‰³áŠá‹Žá‰½á¡</strong> <span className="font-black text-blue-950">{needSubs.length}</span> áŠ á‰£áˆ‹á‰µ/áŠ áˆ˜áˆ«áˆ®á‰½</div>
              <div><strong>á‹¨áˆ˜á‹áŒˆá‰¥ á‰áŒ¥áˆ­á¡</strong> <span className="font-mono text-blue-950">ICODiS/TR-2026/08</span></div>
            </div>
          </ExecutiveSection>

          {/* LARGE EXECUTIVE KPI CARDS */}
          <ExecutiveSection className="grid grid-cols-4 gap-4">
            <div className="border-2 border-blue-950/20 rounded-2xl p-5 bg-gradient-to-br from-blue-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-blue-950 font-black uppercase tracking-wider">áŒ á‰…áˆ‹áˆ‹ á‰°áˆ³á‰³áŠá‹Žá‰½</div>
              <div className="text-3xl font-black text-blue-950 font-mono">{needSubs.length}</div>
              <div className="text-[10px] text-slate-600 font-bold">á‹¨á‰°áˆžáˆ‰ á‹¨áˆá‹˜áŠ“ á‰…áŒ¾á‰½</div>
            </div>

            <div className="border-2 border-rose-600/30 rounded-2xl p-5 bg-gradient-to-br from-rose-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-rose-800 font-black uppercase tracking-wider">á‹¨ááˆ‹áŒŽá‰µ áˆ˜áˆ˜áˆªá‹«á‹Žá‰½</div>
              <div className="text-3xl font-black text-rose-700 font-mono">5</div>
              <div className="text-[10px] text-rose-800 font-bold">áŠ áˆµá‰¸áŠ³á‹­ áˆµáˆáŒ áŠ“ á‹¨áˆšáˆ¹ (Top 5)</div>
            </div>

            <div className="border-2 border-emerald-600/30 rounded-2xl p-5 bg-gradient-to-br from-emerald-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-emerald-900 font-black uppercase tracking-wider">á‰ áŠ áŠ«áˆ áˆµáˆáŒ áŠ“</div>
              <div className="text-3xl font-black text-emerald-800 font-mono">{inPersonPct}%</div>
              <div className="text-[10px] text-emerald-900 font-bold">á‰ áŠ áŠ«áˆ áˆ˜áŠ«áˆáˆ á‹¨áˆšáˆáˆáŒ‰</div>
            </div>

            <div className="border-2 border-amber-600/30 rounded-2xl p-5 bg-gradient-to-br from-amber-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-amber-950 font-black uppercase tracking-wider">á‰°áˆ³á‰µáŽ á‹¨á‹°áˆ¨áˆ°á‰£á‰¸á‹</div>
              <div className="text-3xl font-black text-amber-900 font-mono">{regionList.length}</div>
              <div className="text-[10px] text-amber-900 font-bold">áŠ­áˆáˆŽá‰½ / áŠ¨á‰°áˆžá‰½</div>
            </div>
          </ExecutiveSection>

          {/* EXECUTIVE ACTION PLAN & RECOMMENDATIONS */}
          <ExecutiveSection className="border-2 border-blue-950 rounded-2xl p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 space-y-5 shadow-2xs">
            <div className="flex justify-between items-center border-b border-blue-950/20 pb-3">
              <div className="space-y-0.5">
                <h2 className="font-black text-blue-950 text-sm tracking-wide flex items-center gap-2">
                  <span className="mr-1 inline-block">ðŸŽ¯</span>
                  <span>á‹¨áˆµáˆáŒ áŠ“ á‰µáŒá‰ áˆ« á‹áˆ³áŠ” áŠ¥áŠ“ á‹¨áŠ áˆ°áˆáŒ£áŠáŠá‰µ á‹¨á‹áˆ³áŠ” áˆƒáˆ³á‰¥ (Executive Action Plan)</span>
                </h2>
                <p className="text-[11px] text-slate-600">
                  á‰ áŠ á‰£áˆ‹á‰µ á‹¨ááˆ‹áŒŽá‰µ áˆá‹˜áŠ“ á‹áŒ¤á‰µ áŠ¥áŠ“ á‰ á‰…á‹µáˆšá‹« áˆáˆ­áŒ« á‰°áˆ³á‰µáŽ áˆ˜áˆ°áˆ¨á‰µ áˆµáˆáŒ áŠ“ áˆˆáˆ˜áŒ€áˆ˜áˆ­ á‹¨á‰°áˆ˜áˆ¨áŒ¡ 3 á‹‹áŠ“ á‹‹áŠ“ áˆ˜áˆ˜áˆªá‹«á‹Žá‰½::
                </p>
              </div>
              <span className="text-[10px] font-black px-3.5 py-1 bg-blue-950 text-white rounded-full uppercase tracking-wider">
                á‹¨á‹áˆ³áŠ” áˆƒáˆ³á‰¥ (ACTION MATRIX)
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-black text-slate-950 uppercase tracking-wide">
                áˆˆáˆµáˆáŒ áŠ“ áŠ áˆµá‰¸áŠ³á‹­ á‰µáŒá‰ áˆ« á‹¨á‰°áˆ˜áˆ¨áŒ¡ 3 á‹‹áŠ“ á‹‹áŠ“ áˆ˜áˆ˜áˆªá‹«á‹Žá‰½ (TOP 3 PRIORITY TRAINING DIRECTIVES):
              </div>
              <div className="grid grid-cols-3 gap-4">
                {top3Recommended.map((rec, idx) => (
                  <div key={rec.directiveId} className="border-2 border-blue-950/30 rounded-2xl p-4 bg-white space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-blue-950 text-white">
                        {rec.directiveCode}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        á‰°áˆ˜áˆ«áŒ­ #{idx + 1}
                      </span>
                    </div>
                    <div className="font-black text-slate-950 text-xs leading-snug min-h-[38px] flex items-center">
                      {rec.displayTitle}
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1 font-mono text-slate-700">
                      <div className="flex justify-between">
                        <span>á‹¨ááˆ‹áŒŽá‰µ á‹°áˆ¨áŒƒá¡</span>
                        <strong className="text-rose-700">{rec.needPct}% ááˆ‹áŒŽá‰µ</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>áŠ áˆ›áŠ«á‹­ áŠáŒ¥á‰¥á¡</span>
                        <strong className="text-slate-950">{rec.currentScore} / 5.0</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>á‰…á‹µáˆšá‹« á‹¨áˆ˜áˆ¨áŒ¡á‰µá¡</span>
                        <strong className="text-blue-950">{rec.votes} áŠ á‰£áˆ‹á‰µ ({rec.votePct}%)</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-blue-950/20 text-xs">
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-300/80 space-y-1">
                <div className="font-black text-emerald-950 text-[11px]">á‹¨á‰°áˆ˜áˆ¨áŒ á‹ á‹¨áˆµáˆáŒ áŠ“ áŠ áˆ°áŒ£áŒ¥ áˆ˜áŠ•áŒˆá‹µ</div>
                <div className="font-black text-emerald-800 text-sm">{inPersonPct > onlinePct ? 'Online (áŠ¦áŠ•áˆ‹á‹­áŠ•)' : 'In-Person (á‰ áŠ áŠ«áˆ)'}</div>
                <div className="text-[10px] text-emerald-900 font-medium">
                  {onlinePct}% áŠ á‰£áˆ‹á‰µ á‰ áŠ¦áŠ•áˆ‹á‹­áŠ• áˆˆáˆ˜áŠ«áˆáˆ ááˆ‹áŒŽá‰µ áŠ áˆ³á‹­á‰°á‹‹áˆá¢
                </div>
              </div>

              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-300/80 space-y-1">
                <div className="font-black text-blue-950 text-[11px]">á‹¨á‰°áˆ˜áˆ¨áŒ á‹ á‹¨áˆ›á‰¥áˆ«áˆªá‹« áˆ°áŠá‹µ áŠ á‹­áŠá‰µ</div>
                <div className="font-black text-blue-900 text-sm">á‹¨á‰ªá‹²á‹®/á‹µáˆá… áˆ›á‰¥áˆ«áˆªá‹«</div>
                <div className="text-[10px] text-blue-900 font-medium">
                  5% á‹¨á‰³á‰°áˆ˜ áˆ°áŠá‹µá£ {videoAudioPct}% á‹°áŒáˆž á‹¨á‰ªá‹²á‹®/á‹µáˆá… áˆ›á‰¥áˆ«áˆªá‹« áˆ˜áˆ­áŒ á‹‹áˆá¢
                </div>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300/80 space-y-1">
                <div className="font-black text-amber-950 text-[11px]">á‹¨á‰…á‹µáˆšá‹« á‰µáŠ©áˆ¨á‰µ áŠ á‰…áŒ£áŒ«</div>
                <div className="font-black text-amber-900 text-sm">áŠ á‹áˆ­ áŠ­áˆáˆá£ á‰µáŒáˆ«á‹­ áŠ­áˆáˆá£ áŠ á‹²áˆµ áŠ á‰ á‰£</div>
                <div className="text-[10px] text-amber-950 font-medium">
                  áŠ¨áá‰°áŠ› á‹¨á‰°áˆ³á‰³áŠ á‰áŒ¥áˆ­ á‰£áˆµáˆ˜á‹˜áŒˆá‰¡ 3 á‹‹áŠ“ á‹‹áŠ“ áŠ áŠ«á‰£á‰¢á‹Žá‰½ á‹­áŒ€áˆ˜áˆ«áˆá¢
                </div>
              </div>
            </div>
          </ExecutiveSection>
        </div>

        {/* PAGE 1 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ</span>
          </div>
          <span className="font-mono font-black text-blue-950">áŒˆáŒ½ 1 áŠ¨ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: DEMOGRAPHICS & REGIONAL DISTRIBUTION */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• - á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ áˆªá–áˆ­á‰µ</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* MEMBERSHIP DONUT CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">ðŸ“Š</span>
                <span>áˆ€) á‹¨áŠ á‰£áˆ‹á‰µ / á‹¨áˆ¥áˆ« á‹°áˆ¨áŒƒ áˆµáˆ­áŒ­á‰µ (Membership Distribution)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Donut Analytics</span>
            </div>
            <SvgDonutChart data={membershipList} centerLabel="á‰°áˆ³á‰³áŠá‹Žá‰½" centerValue={needSubs.length} />
          </ExecutiveSection>

          {/* REGIONAL RANKED BAR CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">ðŸ—ºï¸</span>
                <span>áˆˆ) á‹¨áŠ­áˆáˆ / áŠ¨á‰°áˆ› á‰°áˆ³á‰µáŽ áˆµáˆ­áŒ­á‰µ (Regional Distribution)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Ranked Chart ({regionList.length} áŠ­áˆáˆŽá‰½)</span>
            </div>
            <SvgRankedBarChart data={regionList} barColor="#0f2942" />
          </ExecutiveSection>
        </div>

        {/* PAGE 2 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ</span>
          </div>
          <span className="font-mono font-black text-blue-950">áŒˆáŒ½ 2 áŠ¨ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: SECTION 2 & SECTION 3 ANALYTICS DATA TABLES */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• - á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ áˆªá–áˆ­á‰µ</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* SECTION 2 ANALYTICS: TOP 5 TRAINING NEEDS DATA TABLE */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">ðŸ”¥</span>
                <span>Section 2 Analytics: áŠ¨áá‰°áŠ› á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ á‹«áˆ‹á‰¸á‹ 5 áˆ˜áˆ˜áˆªá‹«á‹Žá‰½ (Top 5 Training Needs)</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">
                áŠ­ááˆ 2 (Top 5)
              </span>
            </div>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3 w-12 text-center">á‹°áˆ¨áŒƒ</th>
                  <th className="p-3 w-24">áŠ®á‹µ</th>
                  <th className="p-3">á‹¨áˆ˜áˆ˜áˆªá‹«á‹ áˆ­á‹•áˆµ (Directive Title)</th>
                  <th className="p-3 w-36 text-center">á‰…á‹µáˆšá‹« á‹¨áˆ˜áˆ¨áŒ¡á‰µ</th>
                  <th className="p-3 w-32 text-center">á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ á‹°áˆ¨áŒƒ</th>
                  <th className="p-3 w-28 text-center">áŠ áˆ›áŠ«á‹­ á‹áŒ¤á‰µ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedGaps.length > 0 ? (
                  sortedGaps.slice(0, 5).map((item, index) => {
                    let displayTitle = item.directiveTitle;
                    if (!displayTitle || displayTitle.startsWith('áˆ˜áˆ˜áˆªá‹« / áˆ˜áŒ á‹­á‰…')) {
                      const match = INSPECTION_DIRECTIVES.find((d) => d.id === item.directiveId || d.code === item.directiveCode);
                      if (match) displayTitle = match.title;
                    }
                    const votes = topPriorityVotesMap[item.directiveId] || topPriorityVotesMap[item.directiveCode] || 0;
                    const votePct = Math.round((votes / Math.max(needSubs.length, 1)) * 100);
                    const needPct = Math.round((item.currentScore / 5.0) * 100);

                    return (
                      <tr key={item.directiveId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                        <td className="p-3 font-black text-center text-slate-950 font-mono">#{index + 1}</td>
                        <td className="p-3 font-mono font-black text-blue-950">{item.directiveCode}</td>
                        <td className="p-3 font-bold text-slate-950 leading-snug">{displayTitle}</td>
                        <td className="p-3 text-center font-black text-blue-950 font-mono">
                          {votes > 0 ? `áŠ¨ ${needSubs.length} á‹áˆµáŒ¥ ${votes} (${votePct}%)` : '-'}
                        </td>
                        <td className="p-3 text-center font-black text-rose-700 font-mono">{needPct}% ááˆ‹áŒŽá‰µ</td>
                        <td className="p-3 text-center font-black text-slate-900 font-mono">{item.currentScore} / 5.0</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      áˆáŠ•áˆ á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ áˆ˜áˆ¨áŒƒ áŠ áˆá‰°áŒˆáŠ˜áˆá¢
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ExecutiveSection>

          {/* SECTION 3 ANALYTICS: TOP 5 ADDITIONAL DIRECTIVES */}
          {allAdditionalDirectives.length > 0 && (
            <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
              <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
                <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                  <span className="mr-1 inline-block">ðŸ’¡</span>
                  <span>Section 3 Analytics: á‰ áˆ°áˆáŒ£áŠžá‰½ á‰ á‰¥á‹›á‰µ á‹¨á‰°áŒ á‹¨á‰ áŠ¨áá‰°áŠ› 5 á‰°áŒ¨áˆ›áˆª á‹¨áˆµáˆáŒ áŠ“ áˆ˜áˆ˜áˆªá‹«á‹Žá‰½ (Top 5 Most Requested)</span>
                </h3>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">
                  áŠ­ááˆ 3 (Top 5)
                </span>
              </div>
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                    <th className="p-3 w-12 text-center">á‹°áˆ¨áŒƒ</th>
                    <th className="p-3 w-24">áŠ®á‹µ</th>
                    <th className="p-3">á‹¨á‰°áŒ á‹¨á‰€á‹ á‰°áŒ¨áˆ›áˆª áˆ˜áˆ˜áˆªá‹« áˆ­á‹•áˆµ (Additional Directive)</th>
                    <th className="p-3 w-36 text-center">á‹¨áŒ á‹¨á‰ áŠ á‰£áˆ‹á‰µ á‰¥á‹›á‰µ</th>
                    <th className="p-3 w-32 text-center">á‹¨ááˆ‹áŒŽá‰µ á‹µáˆ­áˆ» (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allAdditionalDirectives.slice(0, 5).map((add, idx) => (
                    <tr key={add.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                      <td className="p-3 font-black text-center text-slate-950 font-mono">#{idx + 1}</td>
                      <td className="p-3 font-mono font-black text-blue-950">{add.code}</td>
                      <td className="p-3 font-bold text-slate-950">{add.title}</td>
                      <td className="p-3 text-center font-black text-blue-950 font-mono">{add.count} áˆ°á‹Žá‰½</td>
                      <td className="p-3 text-center font-black text-slate-900 font-mono">{add.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ExecutiveSection>
          )}
        </div>

        {/* PAGE 3 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ</span>
          </div>
          <span className="font-mono font-black text-blue-950">áŒˆáŒ½ 3 áŠ¨ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 4: SECTION 4.1 & 4.2 DONUT CHARTS */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• - á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ áˆªá–áˆ­á‰µ</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* PREFERRED METHOD & MATERIALS DONUT CHARTS */}
          <ExecutiveSection className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                  <span className="mr-1 inline-block">ðŸŽ“</span>
                  <span>Section 4.1: á‹¨á‰°áˆ˜áŠ¨áˆ¨ á‹¨áˆµáˆáŒ áŠ“ áŠ áˆ°áŒ£áŒ¥ áˆ˜áŠ•áŒˆá‹µ (Preferred Mode)</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-500">In-Person vs Online</span>
              </div>
              <SvgDonutChart data={trainingModeChartData} centerLabel="áˆáˆ­áŒ«" centerValue={`${onlinePct}%`} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                  <span className="mr-1 inline-block">ðŸ“„</span>
                  <span>Section 4.2: á‹¨á‰°áˆ˜áŠ¨áˆ¨ á‹¨áˆµáˆáŒ áŠ“ áˆ›á‰¥áˆ«áˆªá‹« áˆ°áŠá‹µ (Preferred Materials)</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-500">Media vs Hard Copy</span>
              </div>
              <SvgDonutChart data={trainingMaterialChartData} centerLabel="áˆ°áŠá‹µ" centerValue={`${videoAudioPct}%`} />
            </div>
          </ExecutiveSection>
        </div>

        {/* PAGE 4 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ</span>
          </div>
          <span className="font-mono font-black text-blue-950">áŒˆáŒ½ 4 áŠ¨ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: GEOGRAPHIC BREAKDOWN TABLE â€” PART 1 */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• - á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ áˆªá–áˆ­á‰µ</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* GEOGRAPHIC BREAKDOWN TABLE â€” FIRST HALF */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">ðŸ“</span>
                <span>áˆ) á‹¨á‹žáŠ•/áŠ­ááˆˆ áŠ¨á‰°áˆ› áŠ¥áŠ“ á‹ˆáˆ¨á‹³ á‹áˆ­á‹áˆ­ á‰°áˆ³á‰µáŽ (Zone & Woreda Breakdown)</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold font-mono">{zoneWoredaRows.length} áŠ áŠ«á‰£á‰¢á‹Žá‰½ â€” áŠ­ááˆ 1</span>
            </div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3">áŠ­áˆáˆ / áŠ¨á‰°áˆ›</th>
                  <th className="p-3">á‹žáŠ• / áŠ­ááˆˆ áŠ¨á‰°áˆ›</th>
                  <th className="p-3">á‹ˆáˆ¨á‹³</th>
                  <th className="p-3 text-right">á‹¨á‰°áˆžáˆ‰ á‰…áŒ¾á‰½ á‰¥á‹›á‰µ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {zoneWoredaRows.slice(0, Math.ceil(zoneWoredaRows.length / 2)).map((r, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="p-3 font-black text-slate-950">{r.region}</td>
                    <td className="p-3 text-slate-800 font-medium">{r.zone}</td>
                    <td className="p-3 text-slate-800 font-medium">{r.woreda}</td>
                    <td className="p-3 text-right font-black text-blue-950 font-mono">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ExecutiveSection>
        </div>

        {/* PAGE 5 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ</span>
          </div>
          <span className="font-mono font-black text-blue-950">áŒˆáŒ½ 5 áŠ¨ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 6: GEOGRAPHIC BREAKDOWN TABLE â€” PART 2 + FINAL FOOTER */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• - á‹¨áˆµáˆáŒ áŠ“ ááˆ‹áŒŽá‰µ áˆªá–áˆ­á‰µ</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* GEOGRAPHIC BREAKDOWN TABLE â€” SECOND HALF */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">ðŸ“</span>
                <span>áˆ) á‹¨á‹žáŠ•/áŠ­ááˆˆ áŠ¨á‰°áˆ› áŠ¥áŠ“ á‹ˆáˆ¨á‹³ á‹áˆ­á‹áˆ­ á‰°áˆ³á‰µáŽ (Zone & Woreda Breakdown) â€” áŠ­ááˆ 2</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold font-mono">{zoneWoredaRows.length} áŠ áŠ«á‰£á‰¢á‹Žá‰½ â€” áŠ­ááˆ 2</span>
            </div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3">áŠ­áˆáˆ / áŠ¨á‰°áˆ›</th>
                  <th className="p-3">á‹žáŠ• / áŠ­ááˆˆ áŠ¨á‰°áˆ›</th>
                  <th className="p-3">á‹ˆáˆ¨á‹³</th>
                  <th className="p-3 text-right">á‹¨á‰°áˆžáˆ‰ á‰…áŒ¾á‰½ á‰¥á‹›á‰µ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {zoneWoredaRows.slice(Math.ceil(zoneWoredaRows.length / 2)).map((r, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="p-3 font-black text-slate-950">{r.region}</td>
                    <td className="p-3 text-slate-800 font-medium">{r.zone}</td>
                    <td className="p-3 text-slate-800 font-medium">{r.woreda}</td>
                    <td className="p-3 text-right font-black text-blue-950 font-mono">{r.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 font-black text-slate-950 border-t-2 border-slate-400">
                  <td colSpan={3} className="p-3 font-black">
                    á‹µáˆáˆ­ áŒ á‰…áˆ‹áˆ‹ (Total Submissions Across All Locations)
                  </td>
                  <td className="p-3 text-right font-black text-blue-950 text-xs font-mono">
                    {zoneWoredaRows.reduce((acc, r) => acc + r.count, 0)} á‰…áŒ¾á‰½
                  </td>
                </tr>
              </tfoot>
            </table>
          </ExecutiveSection>
        </div>

        {/* DOCUMENT FINAL FOOTER */}
        <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-extrabold text-slate-900">á‹¨á‰¥áˆá…áŒáŠ“ á‹¨áŠ¢áŠ•áˆµá”áŠ­áˆ½áŠ•áŠ“ á‹¨áˆ¥áŠ-áˆáŒá‰£áˆ­ áŠ®áˆšáˆ½áŠ• á‹‹áŠ“ áŒ½/á‰¤á‰µ</span>
          </div>
          <div className="text-right">
            <span>á‰ áˆ²áˆµá‰°áˆ™ á‰ áˆ«áˆµ-áˆ°áˆ­ á‹¨á‰°áˆ˜áˆ¨á‰° áˆ…áŒ‹á‹Š áˆ°áŠá‹µ | <strong className="font-mono text-blue-950">áŒˆáŒ½ 6 áŠ¨ 6</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
