'use client';

import React from 'react';
import { SatisfactionSubmission, TrainingCategory } from '@/types/sletena';
import { formatECDate } from '@/lib/date-formatter';

// ============================================================================
// EXECUTIVE SATISFACTION PRINT SUB-COMPONENTS
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
}> = ({ data, maxCount, barColor = '#0047AB' }) => {
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
// MAIN DEDICATED SATISFACTION PDF REPORT TEMPLATE
// ============================================================================

interface SatisfactionReportPdfTemplateProps {
  submissions: SatisfactionSubmission[];
  category?: TrainingCategory | null;
  categories?: TrainingCategory[];
  reportTitle?: string;
}

const SATISFACTION_CHOICE_OPTIONS = [
  'በጣም ከፍተኛ',
  'ከፍተኛ',
  'መካከለኛ',
  'ዝቅተኛ',
  'በጣም ዝቅተኛ',
];

export const SatisfactionReportPdfTemplate: React.FC<SatisfactionReportPdfTemplateProps> = ({
  submissions = [],
  category,
  categories = [],
  reportTitle = 'የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት የድህረ-ስልጠና የዕርካታ ምዘና ኦፊሴላዊ ሪፖርት',
}) => {
  const subs = submissions || [];
  const count = subs.length;
  const safeCount = count || 1;

  // Calculate Metrics
  const avgTrainer = count > 0 ? (subs.reduce((a, b) => a + b.trainerRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgContent = count > 0 ? (subs.reduce((a, b) => a + b.contentRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgVenue = count > 0 ? (subs.reduce((a, b) => a + b.venueLogisticsRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgRelevance = count > 0 ? (subs.reduce((a, b) => a + b.relevanceRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgOverall = count > 0 ? (subs.reduce((a, b) => a + b.overallRating, 0) / safeCount).toFixed(2) : '0.00';

  const csatPct = count > 0 ? Math.round((Number(avgOverall) / 5.0) * 100) : 0;

  const promoters = subs.filter((s) => s.recommendScore >= 9).length;
  const detractors = subs.filter((s) => s.recommendScore <= 6).length;
  const npsScore = count > 0 ? Math.round(((promoters - detractors) / safeCount) * 100) : 0;

  function getSatisfactionWordLabel(scoreNum: number): string {
    if (scoreNum >= 4.5) return 'በጣም ከፍተኛ';
    if (scoreNum >= 3.5) return 'ከፍተኛ';
    if (scoreNum >= 2.5) return 'መካከለኛ';
    if (scoreNum >= 1.5) return 'ዝቅተኛ';
    return 'በጣም ዝቅተኛ';
  }

  const wordRating = getSatisfactionWordLabel(Number(avgOverall));

  // Regional breakdown
  const regionsMap: Record<string, number> = {};
  subs.forEach((s) => {
    const reg = s.region || 'ያልተገለጸ';
    regionsMap[reg] = (regionsMap[reg] || 0) + 1;
  });

  const regionList = Object.entries(regionsMap)
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / safeCount) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Membership level breakdown
  const membershipMap: Record<string, number> = {};
  subs.forEach((s) => {
    const role = s.membershipLevel || 'አባል';
    membershipMap[role] = (membershipMap[role] || 0) + 1;
  });

  const roleColors: Record<string, string> = {
    Keftegna_Amerar: '#1e1b4b',
    Mekakelegna_Amerar: '#059669',
    Abal: '#d97706',
    Yebeteseb_Yehbret_Amerar: '#7c3aed',
  };

  const roleNames: Record<string, string> = {
    Keftegna_Amerar: 'ከፍተኛ አመራር',
    Mekakelegna_Amerar: 'መካከለኛ አመራር',
    Yebatach_Amerar: 'የበታች አመራር',
    Yehbret_Amerar: 'የህብረት አመራር',
    Yebeteseb_Amerar: 'የቤተሰብ አመራር',
    Yebeteseb_Yehbret_Amerar: 'የቤተሰብ/የሕብረት አመራር',
    Abal: 'አባል',
  };

  const membershipList = Object.entries(membershipMap).map(([role, count]) => ({
    name: roleNames[role] || role || 'አባል',
    value: count,
    pct: Math.round((count / safeCount) * 100),
    color: roleColors[role] || '#2563eb',
  }));

  // Satisfaction Level Distribution Donut Data aggregating all question responses
  let vHighPdf = 0;
  let highPdf = 0;
  let medPdf = 0;
  let lowPdf = 0;
  let vLowPdf = 0;

  subs.forEach((s) => {
    const ratings = [
      s.venueLogisticsRating || 5,
      s.contentRating || 5,
      s.trainerRating || 5,
      s.relevanceRating || 5,
      s.overallRating || 5,
    ];

    ratings.forEach((r) => {
      if (r >= 5) vHighPdf++;
      else if (r >= 4) highPdf++;
      else if (r >= 3) medPdf++;
      else if (r >= 2) lowPdf++;
      else vLowPdf++;
    });
  });

  const totalAllPdf = vHighPdf + highPdf + medPdf + lowPdf + vLowPdf || 1;

  const satDistributionData = [
    { name: 'በጣም ከፍተኛ', value: vHighPdf, pct: Math.round((vHighPdf / totalAllPdf) * 100), color: '#059669' },
    { name: 'ከፍተኛ', value: highPdf, pct: Math.round((highPdf / totalAllPdf) * 100), color: '#0047AB' },
    { name: 'መካከለኛ', value: medPdf, pct: Math.round((medPdf / totalAllPdf) * 100), color: '#d97706' },
    { name: 'ዝቅተኛ', value: lowPdf, pct: Math.round((lowPdf / totalAllPdf) * 100), color: '#f97316' },
    { name: 'በጣም ዝቅተኛ', value: vLowPdf, pct: Math.round((vLowPdf / totalAllPdf) * 100), color: '#dc2626' },
  ];

  // Helper for choice breakdown calculation with fallback to numeric ratings
  const getChoiceBreakdown = (
    fieldKey: keyof SatisfactionSubmission,
    numericKey?: keyof SatisfactionSubmission
  ) => {
    const counts: Record<string, number> = {
      'በጣም ከፍተኛ': 0,
      'ከፍተኛ': 0,
      'መካከለኛ': 0,
      'ዝቅተኛ': 0,
      'በጣም ዝቅተኛ': 0,
    };

    let totalScoreSum = 0;
    let validCount = 0;

    subs.forEach((s) => {
      let val = (s[fieldKey] as string) || '';
      let sVal = 5;

      if (!val && numericKey && typeof s[numericKey] === 'number') {
        const num = s[numericKey] as number;
        sVal = num;
        if (num >= 5) val = 'በጣም ከፍተኛ';
        else if (num >= 4) val = 'ከፍተኛ';
        else if (num >= 3) val = 'መካከለኛ';
        else if (num >= 2) val = 'ዝቅተኛ';
        else val = 'በጣም ዝቅተኛ';
      } else {
        if (!val) val = 'በጣም ከፍተኛ';
        if (val === 'ከፍተኛ') sVal = 4;
        else if (val === 'መካከለኛ') sVal = 3;
        else if (val === 'ዝቅተኛ') sVal = 2;
        else if (val === 'በጣም ዝቅተኛ') sVal = 1;
        else if (val === 'በጣም ከፍተኛ') sVal = 5;
      }

      if (counts[val] !== undefined) {
        counts[val] += 1;
      } else {
        counts['በጣም ከፍተኛ'] += 1;
      }

      totalScoreSum += sVal;
      validCount += 1;
    });

    const meanScore = validCount > 0 ? (totalScoreSum / validCount).toFixed(2) : '5.00';
    return { counts, meanScore: Number(meanScore) };
  };

  const currentDateStr = formatECDate(new Date().toISOString());

  return (
    <div
      id="pdf-satisfaction-printable-document-template"
      className="w-[850px] mx-auto text-slate-900 font-sans space-y-8"
      style={{ backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: EXECUTIVE SUMMARY & SATISFACTION KPI CARDS */}
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
              <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                {category ? category.title : reportTitle}
              </h1>
              <p className="text-xs font-semibold text-slate-600 max-w-2xl leading-relaxed">
                {category ? category.description : 'ስልጠና ከተጠናቀቀ በኋላ ከተሳታፊዎች የተሰበሰቡ የአሰልጣኞች፣ የይዘት እና የአደረጃጀት ዕርካታ ኦፊሴላዊ የትንተና ሰነድ'}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-800 space-y-1 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
              <div><strong>የወጣበት ቀን፡</strong> <span className="font-mono">{currentDateStr}</span></div>
              <div><strong>ጠቅላላ ምዘና የሰጡ፡</strong> <span className="font-black text-blue-950">{count}</span> ተሳታፊዎች</div>
              <div><strong>የመዝገብ ቁጥር፡</strong> <span className="font-mono text-blue-950">ICODiS/SAT-2026/08</span></div>
            </div>
          </ExecutiveSection>

          {/* SATISFACTION EXECUTIVE KPI CARDS */}
          <ExecutiveSection className="grid grid-cols-4 gap-4">
            <div className="border-2 border-emerald-600/30 rounded-2xl p-5 bg-gradient-to-br from-emerald-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-emerald-950 font-black uppercase tracking-wider">አጠቃላይ ዕርካታ (CSAT)</div>
              <div className="text-3xl font-black text-emerald-800 font-mono">{csatPct}%</div>
              <div className="text-[10px] text-emerald-900 font-bold">የተሳታፊዎች ዕርካታ መጠን</div>
            </div>

            <div className="border-2 border-blue-950/20 rounded-2xl p-5 bg-gradient-to-br from-blue-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-blue-950 font-black uppercase tracking-wider">የዕርካታ ደረጃ</div>
              <div className="text-xl font-black text-blue-950">{wordRating}</div>
              <div className="text-[10px] text-slate-600 font-bold">አማካይ፡ {avgOverall} / 5.0</div>
            </div>

            <div className="border-2 border-amber-600/30 rounded-2xl p-5 bg-gradient-to-br from-amber-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-amber-950 font-black uppercase tracking-wider">የመደገፍ ደረጃ (NPS)</div>
              <div className="text-3xl font-black text-amber-900 font-mono">+{npsScore}</div>
              <div className="text-[10px] text-amber-900 font-bold">የተሳታፊዎች የመደገፍ ደረጃ መጠን</div>
            </div>

            <div className="border-2 border-purple-600/30 rounded-2xl p-5 bg-gradient-to-br from-purple-50/60 to-white space-y-1 shadow-2xs">
              <div className="text-[10px] text-purple-950 font-black uppercase tracking-wider">ተሳታፊዎች</div>
              <div className="text-3xl font-black text-purple-900 font-mono">{count}</div>
              <div className="text-[10px] text-purple-900 font-bold">የተሞሉ የዕርካታ ቅጾች</div>
            </div>
          </ExecutiveSection>

          {/* EXECUTIVE SATISFACTION SUMMARY & DIMENSION SCORES */}
          <ExecutiveSection className="border-2 border-blue-950 rounded-2xl p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 space-y-5 shadow-2xs">
            <div className="flex justify-between items-center border-b border-blue-950/20 pb-3">
              <div className="space-y-0.5">
                <h2 className="font-black text-blue-950 text-sm tracking-wide flex items-center gap-2">
                  <span className="mr-1 inline-block">⭐</span>
                  <span>የድህረ-ስልጠና የዕርካታ ዘርፎች ማጠቃለያ (SATISFACTION MATRIX)</span>
                </h2>
                <p className="text-[11px] text-slate-600">
                  ከተሳታፊዎች በተሰበሰቡ የዕርካታ ምዘና ቅጾች መሰረት የተሰጡ የ5 ዋና ዋና ዘርፎች አማካይ ነጥቦች::
                </p>
              </div>
              <span className="text-[10px] font-black px-3.5 py-1 bg-blue-950 text-white rounded-full uppercase tracking-wider">
                አጠቃላይ ውጤት
              </span>
            </div>

            {/* 4 DIMENSION CARDS */}
            <div className="grid grid-cols-4 gap-4">
              <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-2">
                <div className="text-[11px] font-extrabold text-blue-950">አሰልጣኝ ብቃትና አቀራረብ</div>
                <div className="text-2xl font-black text-blue-900 font-mono">{avgTrainer} / 5.0</div>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {getSatisfactionWordLabel(Number(avgTrainer))}
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-2">
                <div className="text-[11px] font-extrabold text-sky-950">ስልጠና ይዘትና ሰነድ</div>
                <div className="text-2xl font-black text-sky-900 font-mono">{avgContent} / 5.0</div>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {getSatisfactionWordLabel(Number(avgContent))}
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-2">
                <div className="text-[11px] font-extrabold text-purple-950">ከስራ ተዛማጅነትና ተሳትፎ</div>
                <div className="text-2xl font-black text-purple-900 font-mono">{avgRelevance} / 5.0</div>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {getSatisfactionWordLabel(Number(avgRelevance))}
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-2">
                <div className="text-[11px] font-extrabold text-emerald-950">ቦታና አደረጃጀት/መስተንግዶ</div>
                <div className="text-2xl font-black text-emerald-900 font-mono">{avgVenue} / 5.0</div>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {getSatisfactionWordLabel(Number(avgVenue))}
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
          <span className="font-mono font-black text-blue-950">ገፅ 1 ከ 5</span>
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
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የድህረ-ስልጠና የዕርካታ ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* MEMBERSHIP DONUT CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">📊</span>
                <span>ሀ) የተሳታፊዎች ሀላፊነት ደረጃ ስርጭት (Responsibility Level Distribution)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Demographics Analytics</span>
            </div>
            <SvgDonutChart data={membershipList} centerLabel="ተሳታፊዎች" centerValue={count} />
          </ExecutiveSection>

          {/* REGIONAL RANKED BAR CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">🗺️</span>
                <span>ለ) የተሳታፊዎች የክልል / ከተማ ስርጭት (Regional Distribution)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Ranked Chart ({regionList.length} ክልሎች)</span>
            </div>
            <SvgRankedBarChart data={regionList} barColor="#0047AB" />
          </ExecutiveSection>
        </div>

        {/* PAGE 2 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገፅ 2 ከ 5</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 3: SATISFACTION DISTRIBUTION & DETAILED QUESTION BREAKDOWNS */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የድህረ-ስልጠና የዕርካታ ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* SATISFACTION LEVEL DISTRIBUTION DONUT CHART */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">📈</span>
                <span>ሐ) የአጠቃላይ ዕርካታ ደረጃ ስርጭት (Satisfaction Level Breakdown)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Distribution Analysis</span>
            </div>
            <SvgDonutChart data={satDistributionData} centerLabel="ምዘናዎች" centerValue={count} />
          </ExecutiveSection>

          {/* DETAILED QUESTION BREAKDOWN TABLE (SECTION 1 & 2 DROPDOWNS) */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">📋</span>
                <span>መጠይቆች ዝርዝር ትንተና ሰንጠረዥ (Question Breakdown Table)</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">
                5 ዋና ዋና መጠይቆች
              </span>
            </div>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3 w-14 text-center">ኮድ</th>
                  <th className="p-3">የመጠይቁ ርዕስ (Question Title)</th>
                  <th className="p-3 w-28 text-center">አማካይ ነጥብ</th>
                  <th className="p-3 w-32 text-center">የዕርካታ ደረጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { code: '1.ሀ', title: 'ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ', key: 'prepVenueRating' as const, numKey: 'venueLogisticsRating' as const },
                  { code: '1.ለ', title: 'ከስልጠናው ሰነድ ዝግጅት አኳያ', key: 'prepDocRating' as const, numKey: 'contentRating' as const },
                  { code: '2.ሀ', title: 'ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ', key: 'deliveryDocTrainerRating' as const, numKey: 'trainerRating' as const },
                  { code: '2.ለ', title: 'ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ', key: 'deliveryParticipationRating' as const, numKey: 'relevanceRating' as const },
                  { code: '2.ሐ', title: 'በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ', key: 'deliveryConclusionsRating' as const, numKey: 'overallRating' as const },
                ].map((q, idx) => {
                  const { meanScore } = getChoiceBreakdown(q.key, q.numKey);
                  const word = getSatisfactionWordLabel(meanScore);
                  return (
                    <tr key={q.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                      <td className="p-3 font-mono font-black text-blue-950 text-center">{q.code}</td>
                      <td className="p-3 font-bold text-slate-950">{q.title}</td>
                      <td className="p-3 text-center font-black text-blue-950 font-mono">{meanScore.toFixed(2)} / 5.0</td>
                      <td className="p-3 text-center font-black text-emerald-800 font-mono">{word}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ExecutiveSection>
        </div>

        {/* PAGE 3 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገፅ 3 ከ 5</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 4: DETAILED QUESTION CHOICE BREAKDOWNS */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የድህረ-ስልጠና የዕርካታ ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* DETAILED CHOICE PERCENTAGES TABLE */}
          <ExecutiveSection className="border-2 border-slate-900/20 rounded-2xl overflow-hidden shadow-2xs space-y-0">
            <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-black text-xs tracking-wide flex items-center gap-2">
                <span className="mr-1 inline-block">📊</span>
                <span>የእያንዳንዱ መጠይቅ የምላሾች ስርጭት በመቶኛ (Choice Response Breakdown)</span>
              </h3>
              <span className="text-[10px] text-slate-300 font-bold font-mono">መቶኛ (%)</span>
            </div>

            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-950 font-black border-b border-slate-300">
                  <th className="p-3 w-14 text-center">ኮድ</th>
                  <th className="p-3">የመጠይቁ ርዕስ</th>
                  <th className="p-2 text-center text-emerald-800">በጣም ከፍተኛ</th>
                  <th className="p-2 text-center text-blue-800">ከፍተኛ</th>
                  <th className="p-2 text-center text-amber-800">መካከለኛ</th>
                  <th className="p-2 text-center text-rose-700">ዝቅተኛ</th>
                  <th className="p-2 text-center text-rose-900">በጣም ዝቅተኛ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { code: '1.ሀ', title: 'ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ', key: 'prepVenueRating' as const, numKey: 'venueLogisticsRating' as const },
                  { code: '1.ለ', title: 'ከስልጠናው ሰነድ ዝግጅት አኳያ', key: 'prepDocRating' as const, numKey: 'contentRating' as const },
                  { code: '2.ሀ', title: 'ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ', key: 'deliveryDocTrainerRating' as const, numKey: 'trainerRating' as const },
                  { code: '2.ለ', title: 'ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ', key: 'deliveryParticipationRating' as const, numKey: 'relevanceRating' as const },
                  { code: '2.ሐ', title: 'በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ', key: 'deliveryConclusionsRating' as const, numKey: 'overallRating' as const },
                ].map((q, idx) => {
                  const { counts } = getChoiceBreakdown(q.key, q.numKey);
                  const pVeryHigh = Math.round(((counts['በጣም ከፍተኛ'] || 0) / safeCount) * 100);
                  const pHigh = Math.round(((counts['ከፍተኛ'] || 0) / safeCount) * 100);
                  const pMed = Math.round(((counts['መካከለኛ'] || 0) / safeCount) * 100);
                  const pLow = Math.round(((counts['ዝቅተኛ'] || 0) / safeCount) * 100);
                  const pVLow = Math.round(((counts['በጣም ዝቅተኛ'] || 0) / safeCount) * 100);

                  return (
                    <tr key={q.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                      <td className="p-3 font-mono font-black text-blue-950 text-center">{q.code}</td>
                      <td className="p-3 font-bold text-slate-950">{q.title}</td>
                      <td className="p-2 text-center font-mono font-black text-emerald-800">{pVeryHigh}%</td>
                      <td className="p-2 text-center font-mono font-black text-blue-900">{pHigh}%</td>
                      <td className="p-2 text-center font-mono font-black text-amber-800">{pMed}%</td>
                      <td className="p-2 text-center font-mono font-black text-rose-700">{pLow}%</td>
                      <td className="p-2 text-center font-mono font-black text-rose-900">{pVLow}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ExecutiveSection>
        </div>

        {/* PAGE 4 FOOTER */}
        <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-black text-slate-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <span className="font-mono font-black text-blue-950">ገፅ 4 ከ 5</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 5: QUALITATIVE PARTICIPANT FEEDBACK & VERIFICATION */}
      {/* ========================================================================= */}
      <div
        className="pdf-page bg-white p-8 space-y-6 flex flex-col justify-between"
        style={{ minHeight: '1080px', boxSizing: 'border-box' }}
      >
        <div className="space-y-6">
          {/* MINI PAGE HEADER */}
          <div className="border-b border-slate-300 pb-3 flex justify-between items-center text-xs">
            <span className="font-black text-blue-950">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን - የድህረ-ስልጠና የዕርካታ ሪፖርት</span>
            <span className="font-mono text-slate-500 text-[10px]">{currentDateStr}</span>
          </div>

          {/* QUALITATIVE PARTICIPANT FEEDBACK CARDS */}
          <ExecutiveSection className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black text-slate-950 text-xs flex items-center gap-2">
                <span className="mr-1 inline-block">💬</span>
                <span>የተሳታፊዎች ዋና ዋና አስተያየቶች እና የማሻሻያ ሃሳቦች (Qualitative Participant Feedback)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">Open Text Responses</span>
            </div>

            <div className="space-y-3">
              {subs
                .filter((s) => s.knowledgeGainedText || s.positiveAspects || s.generalImprovementText || s.improvementSuggestions)
                .slice(0, 4)
                .map((s, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 font-bold text-slate-900">
                      <span>{s.participantName} {s.organizationUnit && `(${s.organizationUnit})`}</span>
                      <span className="text-blue-950 font-mono text-[10px]">{s.region}</span>
                    </div>
                    {(s.knowledgeGainedText || s.positiveAspects) && (
                      <p className="text-slate-700 leading-relaxed">
                        <strong className="text-emerald-800">ያገኙት እውቀት/ጥንካሬ፡</strong> "{s.knowledgeGainedText || s.positiveAspects}"
                      </p>
                    )}
                    {(s.generalImprovementText || s.improvementSuggestions) && (
                      <p className="text-slate-700 leading-relaxed">
                        <strong className="text-amber-800">የማሻሻያ ሃሳብ፡</strong> "{s.generalImprovementText || s.improvementSuggestions}"
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </ExecutiveSection>
        </div>

        {/* DOCUMENT FINAL FOOTER */}
        <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-950 inline-block" />
            <span className="font-extrabold text-slate-900">የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት</span>
          </div>
          <div className="text-right">
            <strong className="font-mono text-blue-950">ገፅ 5 ከ 5</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
