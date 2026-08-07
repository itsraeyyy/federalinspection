'use client';

import React, { useState, useMemo } from 'react';
import { SatisfactionSubmission, TrainingCategory } from '@/types/sletena';
import { PdfExportButton } from './PdfExportButton';
import { SletenaReportPdfTemplate } from './SletenaReportPdfTemplate';
import {
  IconStar,
  IconUsers,
  IconHeartHandshake,
  IconChartBar,
  IconBulb,
  IconFileChart,
  IconArrowLeft,
  IconCopy,
  IconCheck,
  IconUserCheck,
  IconMapPin,
  IconListCheck,
  IconMessage2,
} from '@tabler/icons-react';
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
  LabelList,
} from 'recharts';

interface SatisfactionReportViewProps {
  submissions: SatisfactionSubmission[];
  category?: TrainingCategory;
  onBack?: () => void;
}

const SATISFACTION_CHOICE_OPTIONS = [
  'በጣም ከፍተኛ',
  'ከፍተኛ',
  'መካከለኛ',
  'ዝቅተኛ',
  'በጣም ዝቅተኛ',
];

export const SatisfactionReportView: React.FC<SatisfactionReportViewProps> = ({ 
  submissions,
  category,
  onBack,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter submissions by category if a specific form is selected
  const activeSubmissions = category
    ? submissions.filter((s) => s.categoryId === category.id)
    : submissions;

  // Fallback to all submissions if selected category has 0 submissions yet for demo
  const relevantSubmissions = activeSubmissions.length > 0 ? activeSubmissions : submissions;
  const count = relevantSubmissions.length || 1;

  const handleCopyLink = () => {
    if (!category) return;
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://icods.raey.work';
    const link = `${origin}/sletena/erkata?cat=${category.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const avgTrainer = (relevantSubmissions.reduce((a, b) => a + b.trainerRating, 0) / count).toFixed(2);
  const avgContent = (relevantSubmissions.reduce((a, b) => a + b.contentRating, 0) / count).toFixed(2);
  const avgVenue = (relevantSubmissions.reduce((a, b) => a + b.venueLogisticsRating, 0) / count).toFixed(2);
  const avgRelevance = (relevantSubmissions.reduce((a, b) => a + b.relevanceRating, 0) / count).toFixed(2);
  const avgOverall = (relevantSubmissions.reduce((a, b) => a + b.overallRating, 0) / count).toFixed(2);

  const csatPct = Math.round((Number(avgOverall) / 5.0) * 100);

  const promoters = relevantSubmissions.filter((s) => s.recommendScore >= 9).length;
  const detractors = relevantSubmissions.filter((s) => s.recommendScore <= 6).length;
  const npsScore = Math.round(((promoters - detractors) / count) * 100);

  function getSatisfactionWordLabel(scoreNum: number): string {
    if (scoreNum >= 4.5) return 'እጅግ ከፍተኛ ዕርካታ';
    if (scoreNum >= 3.5) return 'ጥሩ ዕርካታ';
    if (scoreNum >= 2.5) return 'መካከለኛ ዕርካታ';
    return 'አነስተኛ ዕርካታ';
  }

  // --- Section 1: ጥሬ ሃቅ Demographic Analytics ---
  const zoneWoredaStats = useMemo(() => {
    const table: Record<string, { region: string; zone: string; woreda: string; count: number }> = {};
    relevantSubmissions.forEach((s) => {
      if (!s.region) return;
      const key = `${s.region}-${s.zone || 'N/A'}-${s.woreda || 'N/A'}`;
      if (!table[key]) {
        table[key] = {
          region: s.region,
          zone: s.zone || 'ያልተገለጸ',
          woreda: s.woreda || 'ያልተገለጸ',
          count: 0,
        };
      }
      table[key].count += 1;
    });
    return Object.values(table).sort((a, b) => b.count - a.count);
  }, [relevantSubmissions]);

  const membershipLevelStats = useMemo(() => {
    const counts: Record<string, number> = {
      'አባል': 0,
      'የቤተሰብ/የሕብረት አመራር': 0,
      'መካከለኛ አመራር': 0,
      'ከፍተኛ አመራር': 0,
    };

    relevantSubmissions.forEach((s) => {
      const lvl = s.membershipLevel;
      if (lvl === 'Abal') counts['አባል'] += 1;
      else if (lvl === 'Yebeteseb_Yehbret_Amerar') counts['የቤተሰብ/የሕብረት አመራር'] += 1;
      else if (lvl === 'Mekakelegna_Amerar') counts['መካከለኛ አመራር'] += 1;
      else if (lvl === 'Keftegna_Amerar') counts['ከፍተኛ አመራር'] += 1;
      else counts['አባል'] += 1;
    });

    const colors = ['#0047AB', '#10b981', '#f59e0b', '#7c3aed'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      percentage: Math.round((value / Math.max(relevantSubmissions.length, 1)) * 100),
      color: colors[idx % colors.length],
    }));
  }, [relevantSubmissions]);

  // --- Chart Data ---
  // 1. Pie chart: Satisfaction distribution (Satisfied / Neutral / Dissatisfied)
  const satisfied = relevantSubmissions.filter((s) => s.overallRating >= 4).length;
  const neutral = relevantSubmissions.filter((s) => s.overallRating === 3).length;
  const dissatisfied = relevantSubmissions.filter((s) => s.overallRating <= 2).length;
  const satisfactionPieData = [
    { name: 'ዕርካታ ያለው (Satisfied)', value: satisfied, color: '#10b981' },
    { name: 'ገለልተኛ (Neutral)', value: neutral, color: '#f59e0b' },
    { name: 'ዕርካታ የሌለው (Dissatisfied)', value: dissatisfied, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // 2. Bar chart: Average score per dimension (out of 5)
  const dimensionBarData = [
    { name: 'አሰልጣኝ', fullName: 'አሰልጣኝ ብቃት (Trainer)', avg: Number(avgTrainer), color: '#0047AB' },
    { name: 'ይዘት', fullName: 'ስልጠና ይዘት (Content)', avg: Number(avgContent), color: '#0ea5e9' },
    { name: 'ተዛማጅነት', fullName: 'ከስራ ተዛማጅነት (Relevance)', avg: Number(avgRelevance), color: '#8b5cf6' },
    { name: 'አደረጃጀት', fullName: 'ቦታ እና አደረጃጀት (Venue)', avg: Number(avgVenue), color: '#10b981' },
  ];

  // Helper for choice question breakdown calculation
  const getChoiceBreakdown = (fieldKey: keyof SatisfactionSubmission) => {
    const counts: Record<string, number> = {
      'በጣም ከፍተኛ': 0,
      'ከፍተኛ': 0,
      'መካከለኛ': 0,
      'ዝቅተኛ': 0,
      'በጣም ዝቅተኛ': 0,
      'ሌላ (Other)': 0,
    };

    let totalScoreSum = 0;
    let validCount = 0;

    relevantSubmissions.forEach((s) => {
      const val = (s[fieldKey] as string) || 'በጣም ከፍተኛ';
      if (counts[val] !== undefined) {
        counts[val] += 1;
      } else if (val.startsWith('ሌላ') || val.length > 0) {
        counts['ሌላ (Other)'] += 1;
      } else {
        counts['በጣም ከፍተኛ'] += 1;
      }

      // Calculate score map
      let sVal = 5;
      if (val === 'ከፍተኛ') sVal = 4;
      else if (val === 'መካከለኛ') sVal = 3;
      else if (val === 'ዝቅተኛ') sVal = 2;
      else if (val === 'በጣም ዝቅተኛ') sVal = 1;
      totalScoreSum += sVal;
      validCount += 1;
    });

    const meanScore = validCount > 0 ? (totalScoreSum / validCount).toFixed(2) : '5.00';
    return { counts, meanScore: Number(meanScore) };
  };

  // List of every question for detailed breakdown
  const questionReports = [
    {
      code: '1.ሀ',
      category: '1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ',
      title: 'ሀ/ ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ',
      fieldKey: 'prepVenueRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '1.ለ',
      category: '1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ',
      title: 'ለ/ ከስልጠናው ሰነድ ዝግጅት አኳያ',
      fieldKey: 'prepDocRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '2.ሀ',
      category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
      title: 'ሀ/ ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ',
      fieldKey: 'deliveryDocTrainerRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '2.ለ',
      category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
      title: 'ለ/ ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ',
      fieldKey: 'deliveryParticipationRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '2.ሐ',
      category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
      title: 'ሐ/ በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ',
      fieldKey: 'deliveryConclusionsRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '3',
      category: '3. ያገኙት እውቀትና ግንዛቤ',
      title: '3. ስልጠናዉ ላይ በመሳተፍዎ ያገኙት ተጨማሪ እውቀትና ግንዛቤ እንዴትይገልፁታል?',
      fieldKey: 'knowledgeGainedText' as const,
      type: 'text' as const,
    },
    {
      code: '4',
      category: '4. የሚጠበቅ ውጤት',
      title: '4. እርስዎ ጨምሮ ከሌሎች የስልጠና ተሳታፊዎች በቀጣይ ምን ውጤት እንጠብቅ?',
      fieldKey: 'expectedResultsText' as const,
      type: 'text' as const,
    },
    {
      code: '5',
      category: '5. ተጨማሪ አስተያየትና ማሻሻያ',
      title: '5. አጠቃላይ ከስልጠናው ቅድመ ዝግጅት ጀምሮ ስልጠና እስከተመራበት አግባብ በቀጣይ ቢስተካከል የሚሉት ተጨማሪ አስተያየት ካለዎት',
      fieldKey: 'generalImprovementText' as const,
      type: 'text' as const,
    },
  ];

  return (
    <div id="satisfaction-report-container" className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary border border-border/50 transition-all cursor-pointer mt-1"
              title="ተመለስ ወደ ዕርካታ ቅጾች"
            >
              <IconArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <IconStar className="text-brand-blue" size={24} />
              <h2 className="text-xl font-extrabold text-text-primary">
                {category ? category.title : 'የስልጠና ዕርካታ ሪፖርት (Satisfaction Report)'}
              </h2>
              {category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                  የቅጽ ዝርዝር ሪፖርት
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {category
                ? category.description
                : 'ስልጠና ከተጠናቀቀ በኋላ ከተሳታፊዎች የተሰበሰቡ የዕርካታ ደረጃዎች ማጠቃለያ'}
            </p>
          </div>
        </div>

        {/* Top Header Controls (Copy Link & Export PDF) */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {category && (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface-secondary/80 text-brand-blue text-xs font-bold transition-all border border-border/50 cursor-pointer"
            >
              {copiedLink ? <IconCheck size={16} /> : <IconCopy size={16} />}
              <span>{copiedLink ? 'ሊንክ ኮፒ ተደርጓል' : 'የቅጹን ሊንክ ኮፒ'}</span>
            </button>
          )}
          <PdfExportButton
            elementId="satisfaction-report-container"
            reportTitle={category ? `የዕርካታ_ሪፖርት_${category.title.replace(/\s+/g, '_')}` : 'የስልጠና_ዕርካታ_ሪፖርት'}
          />
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">አጠቃላይ ዕርካታ (CSAT)</span>
            <IconHeartHandshake size={18} className="text-brand-blue" />
          </div>
          <div className="text-3xl font-extrabold text-brand-blue">{csatPct}%</div>
          <div className="text-xs text-text-secondary mt-1">የተሳታፊዎች ዕርካታ መጠን</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">የዕርካታ ደረጃ</span>
            <IconStar size={18} className="text-brand-blue" />
          </div>
          <div className="text-xl font-extrabold text-brand-blue">{getSatisfactionWordLabel(Number(avgOverall))}</div>
          <div className="text-xs text-text-secondary mt-1">የአጠቃላይ መመሪያዎች ዕርካታ</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">የመደገፍ ደረጃ (NPS)</span>
            <IconChartBar size={18} className="text-brand-blue" />
          </div>
          <div className="text-3xl font-extrabold text-brand-blue">+{npsScore}</div>
          <div className="text-xs text-text-secondary mt-1">Net Promoter Score</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center text-text-muted mb-2">
            <span className="text-xs font-bold uppercase">ተሳታፊዎች</span>
            <IconUsers size={18} className="text-brand-blue" />
          </div>
          <div className="text-3xl font-extrabold text-brand-blue">{relevantSubmissions.length}</div>
          <div className="text-xs text-text-secondary mt-1">የተሰበሰቡ ቅጾች ብዛት</div>
        </div>
      </div>

      {/* SECTION 1: 1. ጥሬ ሃቅ DEMOGRAPHICS ANALYTICS */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <IconUserCheck className="text-brand-blue" size={22} />
          <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wide">
            1. ጥሬ ሃቅ — የተሳታፊዎች ስነ-ህዝባዊ መረጃ (Participant Demographics)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Membership Level Distribution */}
          <div className="space-y-3 bg-surface-secondary/30 p-4 rounded-xl border border-border/40">
            <h4 className="text-xs font-bold text-text-primary">የአባልነት / የሥራ ደረጃ ስርጭት</h4>
            <div className="space-y-2">
              {membershipLevelStats.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{item.name}</span>
                    <span className="font-bold text-text-primary">{item.value} ተሳታፊ ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region / Location Overview */}
          <div className="space-y-3 bg-surface-secondary/30 p-4 rounded-xl border border-border/40">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <IconMapPin size={16} className="text-brand-blue" />
              የተሳታፊዎች ዞን እና ወረዳ ስርጭት (Sub-city & Woreda Breakdown)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {zoneWoredaStats.length === 0 ? (
                <div className="text-xs text-text-muted p-3 text-center">ምንም አካባቢ አልተመዘገበም</div>
              ) : (
                zoneWoredaStats.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 bg-surface-primary/70 rounded-lg border border-border/30">
                    <div className="flex items-center gap-1.5 font-bold text-text-primary">
                      <span>{item.region}</span>
                      <span className="text-text-muted font-normal">• {item.zone}</span>
                      {item.woreda !== 'ያልተገለጸ' && (
                        <span className="text-brand-blue font-bold">• {item.woreda}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-extrabold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md shrink-0">
                      {item.count} ተሳታፊ ({Math.round((item.count / Math.max(relevantSubmissions.length, 1)) * 100)}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Pie Chart + Bar Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Satisfaction Distribution Pie Chart */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <IconFileChart className="text-brand-blue" size={20} />
            <h3 className="text-sm font-bold text-text-primary">የዕርካታ ስርጭት (Satisfaction Distribution)</h3>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const pct = Math.round((d.value / Math.max(relevantSubmissions.length, 1)) * 100);
                      return (
                        <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs max-w-[200px]">
                          <div className="font-bold text-text-primary mb-1">{d.name}</div>
                          <div style={{ color: d.color }} className="font-bold">
                            {d.value} ተሳታፊ ({pct}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={satisfactionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  cornerRadius={6}
                  dataKey="value"
                  stroke="none"
                >
                  {satisfactionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
            {satisfactionPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-text-secondary truncate">
                  {item.name.split(' ')[0]} ({Math.round((item.value / Math.max(relevantSubmissions.length, 1)) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Average Scores Bar Chart */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <IconChartBar className="text-brand-blue" size={20} />
            <h3 className="text-sm font-bold text-text-primary">የምዘና ዘርፍ አማካይ ደረጃ (Avg. Score by Dimension)</h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dimensionBarData} margin={{ top: 16, right: 8, left: -24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <div className="font-bold text-text-primary">{d.fullName}</div>
                          <div className="font-bold" style={{ color: d.color }}>አማካይ: {d.avg.toFixed(2)} / 5.0</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  <LabelList dataKey="avg" position="top" formatter={(v: unknown) => Number(v).toFixed(1)} style={{ fontSize: 10, fontWeight: 700 }} />
                  {dimensionBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EVERY QUESTION REPORT SECTION (እያንዳንዱ መጠይቅ ሪፖርት) */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
          <div>
            <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <IconListCheck className="text-brand-blue" size={22} />
              እያንዳንዱ መጠይቅ ሪፖርት (Every Question Detailed Analytics)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              በቅጹ ላይ በተካተቱ ሁሉም ጥያቄዎች የተሰጡ የደረጃ ምላሾች እና ክፍት አስተያየቶች በዝርዝር::
            </p>
          </div>
          <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
            {questionReports.length} ጥያቄዎች የተተነተኑ
          </span>
        </div>

        {/* Loop through every question */}
        <div className="space-y-6">
          {questionReports.map((qItem, idx) => {
            if (qItem.type === 'dropdown') {
              const { counts, meanScore } = getChoiceBreakdown(qItem.fieldKey);
              const wordLabel = getSatisfactionWordLabel(meanScore);
              const pctOverall = Math.round((meanScore / 5.0) * 100);

              return (
                <div
                  key={qItem.code}
                  className="bg-surface-secondary/30 border border-border/50 rounded-xl p-5 space-y-4 hover:border-brand-blue/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue font-black flex items-center justify-center text-xs shrink-0">
                        {qItem.code}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                          {qItem.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-text-primary">{qItem.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-lg">
                        አማካይ፡ {meanScore.toFixed(2)} / 5.0
                      </span>
                      <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                        {wordLabel}
                      </span>
                    </div>
                  </div>

                  {/* Choice Response Bar Breakdown */}
                  <div className="space-y-2.5">
                    {SATISFACTION_CHOICE_OPTIONS.map((choice) => {
                      const choiceCount = counts[choice] || 0;
                      const choicePct = Math.round((choiceCount / Math.max(relevantSubmissions.length, 1)) * 100);

                      const barBg =
                        choice === 'በጣም ከፍተኛ' || choice === 'ከፍተኛ'
                          ? 'bg-emerald-500'
                          : choice === 'መካከለኛ'
                          ? 'bg-amber-400'
                          : 'bg-rose-500';

                      return (
                        <div key={choice} className="space-y-1 text-xs">
                          <div className="flex justify-between text-text-secondary font-medium">
                            <span>{choice}</span>
                            <span className="font-bold text-text-primary">
                              {choiceCount} ምላሽ ({choicePct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-surface-primary rounded-full overflow-hidden border border-border/40">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                              style={{ width: `${choicePct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              // Open Paragraph Text Questions (3, 4, 5)
              const answers = relevantSubmissions
                .map((s) => ({
                  name: s.participantName,
                  unit: s.organizationUnit,
                  region: s.region,
                  text: (s[qItem.fieldKey] as string) || '',
                }))
                .filter((a) => a.text.trim().length > 0);

              return (
                <div
                  key={qItem.code}
                  className="bg-surface-secondary/30 border border-border/50 rounded-xl p-5 space-y-4 hover:border-brand-blue/30 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 font-black flex items-center justify-center text-xs shrink-0">
                        {qItem.code}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                          {qItem.category} (Open Text Responses)
                        </span>
                        <h4 className="text-sm font-extrabold text-text-primary">{qItem.title}</h4>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {answers.length} ምላሾች ተሰጥተዋል
                    </span>
                  </div>

                  {/* Participant Text Answers Cards */}
                  <div className="space-y-3">
                    {answers.length === 0 ? (
                      <div className="text-xs text-text-muted p-3 bg-surface-primary/60 rounded-lg text-center border border-dashed border-border/40">
                        ለዚህ ጥያቄ እስካሁን የተጻፈ ምላሽ የለም::
                      </div>
                    ) : (
                      answers.map((ans, aIdx) => (
                        <div key={aIdx} className="bg-surface-primary/80 p-3.5 rounded-xl border border-border/40 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-text-muted border-b border-border/20 pb-1 font-semibold text-[11px]">
                            <span className="text-text-primary font-bold">{ans.name} {ans.unit && `(${ans.unit})`}</span>
                            <span className="text-brand-blue">{ans.region}</span>
                          </div>
                          <p className="text-text-secondary leading-relaxed pt-0.5">
                            "{ans.text}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Hidden Official PDF Document Template for Clean Printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1100px' }}>
        <SletenaReportPdfTemplate
          needSubmissions={[]}
          satisfactionSubmissions={relevantSubmissions}
          category={category}
          reportTitle={category ? category.title : 'የስልጠና ዕርካታ ሪፖርት'}
        />
      </div>
    </div>
  );
};
