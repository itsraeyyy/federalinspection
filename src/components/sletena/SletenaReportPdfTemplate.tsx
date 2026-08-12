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
}> = ({ data, centerLabel = 'ጠቅላላ', centerValue }) => {
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
  reportTitle = 'የስልጠና ፍላጎት፣ የብቃት ክፍተት (Gap) እና ትግበራ ሙሉ ኦፊሴላዊ ሪፖርት',
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
            activeDirectiveMap.set(key, { id: key, code: key, title: `መመሪያ / መጠይቅ ${key}` });
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
            activeDirectiveMap.set(key, { id: key, code: key, title: `መመሪያ / መጠይቅ ${key}` });
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
    title: q.title || `መመሪያ ${q.id}`,
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

  const activeReportDirectivesCount = gapAnalysis.length || 5;
  const topCount5 = Math.min(5, Math.max(1, activeReportDirectivesCount));
  const topCount3 = Math.min(3, Math.max(1, activeReportDirectivesCount));

  const top3Recommended = sortedGaps.slice(0, topCount3).map((item) => {
    let displayTitle = item.directiveTitle;
    if (!displayTitle || displayTitle.startsWith('መመሪያ / መጠይቅ')) {
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
    const reg = sub.region || 'ያልተገለጸ';
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
    const role = sub.membershipLevel || 'አባል';
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
    if (methods.some((m) => m.includes('In-Person') || m.includes('በአካል'))) inPersonCount++;
    if (methods.some((m) => m.includes('Online') || m.includes('ኦንላይን'))) onlineCount++;
    if (methods.some((m) => m.includes('ቪዲዮ') || m.includes('ድምፅ') || m.includes('Media'))) videoAudioCount++;
    if (methods.some((m) => m.includes('የታተመ') || m.includes('Hard Copy'))) hardCopyCount++;
  });

  const totalSubs = Math.max(needSubs.length, 1);
  const inPersonPct = Math.round((inPersonCount / totalSubs) * 100);
  const onlinePct = Math.round((onlineCount / totalSubs) * 100);

  const trainingModeChartData = [
    { name: 'በአካል (In-Person)', value: inPersonCount, pct: inPersonPct, color: '#059669' },
    { name: 'Online (ኦንላይን)', value: onlineCount, pct: onlinePct, color: '#2563eb' },
  ];

  const videoAudioPct = Math.round((videoAudioCount / totalSubs) * 100);
  const hardCopyPct = Math.round((hardCopyCount / totalSubs) * 100);

  const trainingMaterialChartData = [
    { name: 'የቪዲዮና ድምፅ ማብራሪያዎች', value: videoAudioCount, pct: videoAudioPct, color: '#d97706' },
    { name: 'የታተመ ሰነድ (Hard Copy)', value: hardCopyCount, pct: hardCopyPct, color: '#7c3aed' },
  ];

  const additionalDirectivesMap: Record<string, { code: string; title: string; count: number }> = {};
  needSubs.forEach((sub) => {
    if (sub.additionalNeededDirectives && Array.isArray(sub.additionalNeededDirectives)) {
      sub.additionalNeededDirectives.forEach((dirId: string) => {
        const match = INSPECTION_DIRECTIVES.find((d) => d.id === dirId || d.code === dirId);
        const code = match ? match.code : dirId;
        const title = match ? match.title : `ተጨማሪ መመሪያ ${dirId}`;
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
    const key = `${sub.region || 'ያልተገለጸ'}_${sub.zone || 'ያልተገለጸ'}_${sub.woreda || 'ያልተገለጸ'}`;
    if (!zoneWoredaMap[key]) {
      zoneWoredaMap[key] = {
        region: sub.region || 'ያልተገለጸ',
        zone: sub.zone || 'ያልተገለጸ',
        woreda: sub.woreda || 'ያልተገለጸ',
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
                የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት
              </div>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-tight">
                {category ? category.title : reportTitle}
              </h1>
              <p className="text-xs font-semibold text-slate-600 max-w-2xl leading-relaxed">
                {category ? category.description : 'የስልጠና ፍላጎት፣ የብቃት ክፍተት (Gap) እና የስልጠና ትግበራ ውሳኔ ኦፊሴላዊ የትንተና ሰነድ'}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-800 space-y-1 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
              <div><strong>የወጣበት ቀን፡</strong> <span className="font-mono">{currentDateStr}</span></div>
              <div><strong>ጠቅላላ ተሳታፊዎች፡</strong> <span className="font-black text-blue-950">{needSubs.length}</span> አባላት/አመራሮች</div>
              <div><strong>የመዝገብ ቁጥር፡</strong> <span className="font-mono text-blue-950">ICODiS/TR-2026/08</span></div>
            </div>
          </ExecutiveSection>

          {/* LARGE EXECUTIVE KPI CARDS */}
          <ExecutiveSection className="grid grid-cols-4 gap-4">
            <div className="border-2 border-blue-950/20 rounded-2xl p-5 bg-gradient-to-br from-blue-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-blue-950 font-black uppercase tracking-wider">ጠቅላላ ተሳታፊዎች</div>
              <div className="text-3xl font-black text-blue-950 font-mono">{needSubs.length}</div>
              <div className="text-[10px] text-slate-600 font-bold">የተሞሉ የምዘና ቅጾች</div>
            </div>

            <div className="border-2 border-rose-600/30 rounded-2xl p-5 bg-gradient-to-br from-rose-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-rose-800 font-black uppercase tracking-wider">የፍላጎት መመሪያዎች</div>
              <div className="text-3xl font-black text-rose-700 font-mono">5</div>
              <div className="text-[10px] text-rose-800 font-bold">አስቸኳይ ስልጠና የሚሹ (Top 5)</div>
            </div>

            <div className="border-2 border-emerald-600/30 rounded-2xl p-5 bg-gradient-to-br from-emerald-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-emerald-900 font-black uppercase tracking-wider">በአካል ስልጠና</div>
              <div className="text-3xl font-black text-emerald-800 font-mono">{inPersonPct}%</div>
              <div className="text-[10px] text-emerald-900 font-bold">በአካል መካፈል የሚፈልጉ</div>
            </div>

            <div className="border-2 border-amber-600/30 rounded-2xl p-5 bg-gradient-to-br from-amber-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-amber-950 font-black uppercase tracking-wider">ተሳትፎ የደረሰባቸው</div>
              <div className="text-3xl font-black text-amber-900 font-mono">{regionList.length}</div>
              <div className="text-[10px] text-amber-900 font-bold">ክልሎች / ከተሞች</div>
            </div>
          </ExecutiveSection>

          {/* EXECUTIVE ACTION PLAN & RECOMMENDATIONS */}
          <ExecutiveSection className="border-2 border-blue-950 rounded-2xl p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 space-y-5 shadow-2xs">
            <div className="flex justify-between items-center border-b border-blue-950/20 pb-3">
              <div className="space-y-0.5">
                <h2 className="font-black text-blue-950 text-sm tracking-wide flex items-center gap-2">
                  <span className="mr-1 inline-block">🎯</span>
                  <span>የስልጠና ትግበራ ውሳኔ እና የአሰልጣኝነት የውሳኔ ሃሳብ (Executive Action Plan)</span>
                </h2>
                <p className="text-[11px] text-slate-600">
                  በአባላት የፍላጎት ምዘና ውጤት እና በቅድሚያ ምርጫ ተሳትፎ መሰረት ስልጠና ለመጀመር የተመረጡ {topCount3} ዋና ዋና መመሪያዎች::
                </p>
              </div>
              <span className="text-[10px] font-black px-3.5 py-1 bg-blue-950 text-white rounded-full uppercase tracking-wider">
                የውሳኔ ሃሳብ (ACTION MATRIX)
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-black text-slate-950 uppercase tracking-wide">
                ለስልጠና አስቸኳይ ትግበራ የተመረጡ {topCount3} ዋና ዋና መመሪያዎች (TOP {topCount3} PRIORITY TRAINING DIRECTIVES):
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-${Math.min(topCount3, 3)} gap-4`}>
                {top3Recommended.map((rec, idx) => (
                  <div key={rec.directiveId} className="border-2 border-blue-950/30 rounded-2xl p-4 bg-white space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-blue-950 text-white">
                        {rec.directiveCode}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        ተመራጭ #{idx + 1}
                      </span>
                    </div>
                    <div className="font-black text-slate-950 text-xs leading-snug min-h-[38px] flex items-center">
                      {rec.displayTitle}
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1 font-mono text-slate-700">
                      <div className="flex justify-between">
                        <span>የፍላጎት ደረጃ፡</span>
                        <strong className="text-rose-700">{rec.needPct}% ፍላጎት</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>አማካይ ነጥብ፡</span>
                        <strong className="text-slate-950">{rec.currentScore} / 5.0</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>ቅድሚያ የመረጡት፡</span>
                        <strong className="text-blue-950">{rec.votes} አባላት ({rec.votePct}%)</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-blue-950/20 text-xs">
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-300/80 space-y-1">
                <div className="font-black text-emerald-950 text-[11px]">የተመረጠው የስልጠና አሰጣጥ መንገድ</div>
                <div className="font-black text-emerald-800 text-sm">{inPersonPct > onlinePct ? 'Online (ኦንላይን)' : 'In-Person (በአካል)'}</div>
                <div className="text-[10px] text-emerald-900 font-medium">
                  {onlinePct}% አባላት በኦንላይን ለመካፈል ፍላጎት አሳይተዋል።
                </div>
              </div>

              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-300/80 space-y-1">
                <div className="font-black text-blue-950 text-[11px]">የተመረጠው የማብራሪያ ሰነድ አይነት</div>
                <div className="font-black text-blue-900 text-sm">የቪዲዮ/ድምፅ ማብራሪያ</div>
                <div className="text-[10px] text-blue-900 font-medium">
                  5% የታተመ ሰነድ፣ {videoAudioPct}% ደግሞ የቪዲዮ/ድምፅ ማብራሪያ መርጠዋል።
                </div>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300/80 space-y-1">
                <div className="font-black text-amber-950 text-[11px]">የቅድሚያ ትኩረት አቅጣጫ</div>
                <div className="font-black text-amber-900 text-sm">አፋር ክልል፣ ትግራይ ክልል፣ አዲስ አበባ</div>
                <div className="text-[10px] text-amber-950 font-medium">
                  ከፍተኛ የተሳታፊ ቁጥር ባስመዘገቡ 3 ዋና ዋና አካባቢዎች ይጀመራል።
                </div>
              </div>
            </div>
          </ExecutiveSection>
        </div>

        {/* PAGE 1 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገጽ 1 ከ 6</span>
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
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የስልጠና ፍላጎት ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* MEMBERSHIP DONUT CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">📊</span>
                <span>ሀ) የአባላት / የሥራ ደረጃ ስርጭት (Membership Distribution)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Donut Analytics</span>
            </div>
            <SvgDonutChart data={membershipList} centerLabel="ተሳታፊዎች" centerValue={needSubs.length} />
          </ExecutiveSection>

          {/* REGIONAL RANKED BAR CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">🗺️</span>
                <span>ለ) የክልል / ከተማ ተሳትፎ ስርጭት (Regional Distribution)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Ranked Chart ({regionList.length} ክልሎች)</span>
            </div>
            <SvgRankedBarChart data={regionList} barColor="#0f2942" />
          </ExecutiveSection>
        </div>

        {/* PAGE 2 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገጽ 2 ከ 6</span>
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
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የስልጠና ፍላጎት ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* SECTION 2 ANALYTICS: TOP 5 TRAINING NEEDS DATA TABLE */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">🔥</span>
                <span>Section 2 Analytics: ከፍተኛ የስልጠና ፍላጎት ያላቸው {topCount5} መመሪያዎች (Top {topCount5} Training Needs)</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">
                ክፍል 2 (Top {topCount5})
              </span>
            </div>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3 w-12 text-center">ደረጃ</th>
                  <th className="p-3 w-24">ኮድ</th>
                  <th className="p-3">የመመሪያው ርዕስ (Directive Title)</th>
                  <th className="p-3 w-36 text-center">ቅድሚያ የመረጡት</th>
                  <th className="p-3 w-32 text-center">የስልጠና ፍላጎት ደረጃ</th>
                  <th className="p-3 w-28 text-center">አማካይ ውጤት</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedGaps.length > 0 ? (
                  sortedGaps.slice(0, topCount5).map((item, index) => {
                    let displayTitle = item.directiveTitle;
                    if (!displayTitle || displayTitle.startsWith('መመሪያ / መጠይቅ')) {
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
                          {votes > 0 ? `ከ ${needSubs.length} ውስጥ ${votes} (${votePct}%)` : '-'}
                        </td>
                        <td className="p-3 text-center font-black text-rose-700 font-mono">{needPct}% ፍላጎት</td>
                        <td className="p-3 text-center font-black text-slate-900 font-mono">{item.currentScore} / 5.0</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      ምንም የስልጠና ፍላጎት መረጃ አልተገኘም።
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
                  <span className="mr-1 inline-block">💡</span>
                  <span>Section 3 Analytics: በሰልጣኞች በብዛት የተጠየቁ ከፍተኛ 5 ተጨማሪ የስልጠና መመሪያዎች (Top 5 Most Requested)</span>
                </h3>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">
                  ክፍል 3 (Top 5)
                </span>
              </div>
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                    <th className="p-3 w-12 text-center">ደረጃ</th>
                    <th className="p-3 w-24">ኮድ</th>
                    <th className="p-3">የተጠየቀው ተጨማሪ መመሪያ ርዕስ (Additional Directive)</th>
                    <th className="p-3 w-36 text-center">የጠየቁ አባላት ብዛት</th>
                    <th className="p-3 w-32 text-center">የፍላጎት ድርሻ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allAdditionalDirectives.slice(0, 5).map((add, idx) => (
                    <tr key={add.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                      <td className="p-3 font-black text-center text-slate-950 font-mono">#{idx + 1}</td>
                      <td className="p-3 font-mono font-black text-blue-950">{add.code}</td>
                      <td className="p-3 font-bold text-slate-950">{add.title}</td>
                      <td className="p-3 text-center font-black text-blue-950 font-mono">{add.count} ሰዎች</td>
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
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገጽ 3 ከ 6</span>
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
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የስልጠና ፍላጎት ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* PREFERRED METHOD & MATERIALS DONUT CHARTS */}
          <ExecutiveSection className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                  <span className="mr-1 inline-block">🎓</span>
                  <span>Section 4.1: የተመከረ የስልጠና አሰጣጥ መንገድ (Preferred Mode)</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-500">In-Person vs Online</span>
              </div>
              <SvgDonutChart data={trainingModeChartData} centerLabel="ምርጫ" centerValue={`${onlinePct}%`} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                  <span className="mr-1 inline-block">📄</span>
                  <span>Section 4.2: የተመከረ የስልጠና ማብራሪያ ሰነድ (Preferred Materials)</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-500">Media vs Hard Copy</span>
              </div>
              <SvgDonutChart data={trainingMaterialChartData} centerLabel="ሰነድ" centerValue={`${videoAudioPct}%`} />
            </div>
          </ExecutiveSection>
        </div>

        {/* PAGE 4 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገጽ 4 ከ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: GEOGRAPHIC BREAKDOWN TABLE — PART 1 */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የስልጠና ፍላጎት ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* GEOGRAPHIC BREAKDOWN TABLE — FIRST HALF */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">📍</span>
                <span>ሐ) የዞን/ክፍለ ከተማ እና ወረዳ ዝርዝር ተሳትፎ (Zone & Woreda Breakdown)</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold font-mono">{zoneWoredaRows.length} አካባቢዎች — ክፍል 1</span>
            </div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3">ክልል / ከተማ</th>
                  <th className="p-3">ዞን / ክፍለ ከተማ</th>
                  <th className="p-3">ወረዳ</th>
                  <th className="p-3 text-right">የተሞሉ ቅጾች ብዛት</th>
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
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገጽ 5 ከ 6</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 6: GEOGRAPHIC BREAKDOWN TABLE — PART 2 + FINAL FOOTER */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የስልጠና ፍላጎት ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* GEOGRAPHIC BREAKDOWN TABLE — SECOND HALF */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">📍</span>
                <span>ሐ) የዞን/ክፍለ ከተማ እና ወረዳ ዝርዝር ተሳትፎ (Zone & Woreda Breakdown) — ክፍል 2</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold font-mono">{zoneWoredaRows.length} አካባቢዎች — ክፍል 2</span>
            </div>
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3">ክልል / ከተማ</th>
                  <th className="p-3">ዞን / ክፍለ ከተማ</th>
                  <th className="p-3">ወረዳ</th>
                  <th className="p-3 text-right">የተሞሉ ቅጾች ብዛት</th>
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
                    ድምር ጠቅላላ (Total Submissions Across All Locations)
                  </td>
                  <td className="p-3 text-right font-black text-blue-950 text-xs font-mono">
                    {zoneWoredaRows.reduce((acc, r) => acc + r.count, 0)} ቅጾች
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
            <span className="font-extrabold text-slate-900">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <div className="text-right">
            <span>በሲስተሙ በራስ-ሰር የተመረተ ህጋዊ ሰነድ | <strong className="font-mono text-blue-950">ገጽ 6 ከ 6</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};