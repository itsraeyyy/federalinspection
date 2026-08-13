'use client';

import React, { useState, useMemo } from 'react';
import { SatisfactionSubmission, TrainingCategory } from '@/types/sletena';
import { PdfExportButton } from './PdfExportButton';
import { SatisfactionReportPdfTemplate } from './SatisfactionReportPdfTemplate';
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
  categories?: TrainingCategory[];
  onBack?: () => void;
  onSelectCategory?: (category: TrainingCategory) => void;
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
  categories = [],
  onBack,
  onSelectCategory,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter submissions strictly by category if a specific form is selected
  const relevantSubmissions = category
    ? submissions.filter((s) => s.categoryId === category.id)
    : submissions;
  
  const count = relevantSubmissions.length;
  const safeCount = count || 1;

  const handleCopyLink = () => {
    if (!category) return;
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://icods.raey.work';
    const link = `${origin}/sletena/erkata?cat=${category.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const avgTrainer = count > 0 ? (relevantSubmissions.reduce((a, b) => a + b.trainerRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgContent = count > 0 ? (relevantSubmissions.reduce((a, b) => a + b.contentRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgVenue = count > 0 ? (relevantSubmissions.reduce((a, b) => a + b.venueLogisticsRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgRelevance = count > 0 ? (relevantSubmissions.reduce((a, b) => a + b.relevanceRating, 0) / safeCount).toFixed(2) : '0.00';
  const avgOverall = count > 0 ? (relevantSubmissions.reduce((a, b) => a + b.overallRating, 0) / safeCount).toFixed(2) : '0.00';

  const csatPct = count > 0 ? Math.round((Number(avgOverall) / 5.0) * 100) : 0;

  const promoters = relevantSubmissions.filter((s) => s.recommendScore >= 9).length;
  const detractors = relevantSubmissions.filter((s) => s.recommendScore <= 6).length;
  const npsScore = count > 0 ? Math.round(((promoters - detractors) / safeCount) * 100) : 0;

  function getSatisfactionWordLabel(scoreNum: number): string {
    if (scoreNum >= 4.5) return 'በጣም ከፍተኛ';
    if (scoreNum >= 3.5) return 'ከፍተኛ';
    if (scoreNum >= 2.5) return 'መካከለኛ';
    if (scoreNum >= 1.5) return 'ዝቅተኛ';
    return 'በጣም ዝቅተኛ';
  }

  // Cross-Form Comparative Summary Data Calculation
  const categoryComparativeData = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.map((cat) => {
      const catSubmissions = submissions.filter((s) => s.categoryId === cat.id);
      const catCount = catSubmissions.length;
      const safeCatCount = catCount || 1;

      const avgT = catCount > 0 ? catSubmissions.reduce((a, b) => a + b.trainerRating, 0) / safeCatCount : 0;
      const avgC = catCount > 0 ? catSubmissions.reduce((a, b) => a + b.contentRating, 0) / safeCatCount : 0;
      const avgV = catCount > 0 ? catSubmissions.reduce((a, b) => a + b.venueLogisticsRating, 0) / safeCatCount : 0;
      const avgR = catCount > 0 ? catSubmissions.reduce((a, b) => a + b.relevanceRating, 0) / safeCatCount : 0;
      const avgO = catCount > 0 ? catSubmissions.reduce((a, b) => a + b.overallRating, 0) / safeCatCount : 0;

      const dims = [
        { name: 'አሰልጣኝ ብቃት', score: avgT },
        { name: 'ስልጠና ይዘት', score: avgC },
        { name: 'ከስራ ተዛማጅነት', score: avgR },
        { name: 'ቦታና አደረጃጀት', score: avgV },
      ];
      const topDim = catCount > 0 ? dims.sort((a, b) => b.score - a.score)[0]?.name || 'አሰልጣኝ ብቃት' : 'ያልተመዘገበ';

      const csat = catCount > 0 ? Math.round((avgO / 5.0) * 100) : 0;
      const word = catCount > 0 ? getSatisfactionWordLabel(avgO) : 'ያልተሞላ';

      return {
        category: cat,
        submittersCount: catCount,
        avgScore: avgO.toFixed(2),
        csatPct: csat,
        wordLabel: word,
        topDimension: topDim,
      };
    });
  }, [categories, submissions]);

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
      'የቤተሰብ አመራር': 0,
      'የህብረት አመራር': 0,
      'የበታች አመራር': 0,
      'መካከለኛ አመራር': 0,
      'ከፍተኛ አመራር': 0,
    };

    relevantSubmissions.forEach((s) => {
      const lvl = s.membershipLevel;
      if (lvl === 'Abal') counts['አባል'] += 1;
      else if (lvl === 'Yebeteseb_Amerar') counts['የቤተሰብ አመራር'] += 1;
      else if (lvl === 'Yehbret_Amerar') counts['የህብረት አመራር'] += 1;
      else if (lvl === 'Yebatach_Amerar') counts['የበታች አመራር'] += 1;
      else if (lvl === 'Yebeteseb_Yehbret_Amerar') counts['የህብረት አመራር'] += 1;
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

  // 1. Pie chart: Satisfaction distribution aggregating all question responses
  let vHighCount = 0;
  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;
  let vLowCount = 0;

  relevantSubmissions.forEach((s) => {
    const ratings = [
      s.venueLogisticsRating || 5,
      s.contentRating || 5,
      s.trainerRating || 5,
      s.relevanceRating || 5,
      s.overallRating || 5,
    ];

    ratings.forEach((r) => {
      if (r >= 5) vHighCount++;
      else if (r >= 4) highCount++;
      else if (r >= 3) medCount++;
      else if (r >= 2) lowCount++;
      else vLowCount++;
    });
  });

  const totalAllResponses = vHighCount + highCount + medCount + lowCount + vLowCount || 1;

  const satisfactionPieData = [
    { name: 'በጣም ከፍተኛ', value: vHighCount, color: '#059669' },
    { name: 'ከፍተኛ', value: highCount, color: '#0047AB' },
    { name: 'መካከለኛ', value: medCount, color: '#d97706' },
    { name: 'ዝቅተኛ', value: lowCount, color: '#f97316' },
    { name: 'በጣም ዝቅተኛ', value: vLowCount, color: '#dc2626' },
  ];

  // 2. Bar chart: Average score per dimension (out of 5)
  const dimensionBarData = [
    { name: 'አሰልጣኝ', fullName: 'አሰልጣኝ ብቃትና አቀራረብ', avg: Number(avgTrainer), label: getSatisfactionWordLabel(Number(avgTrainer)), color: '#0047AB' },
    { name: 'ይዘት', fullName: 'ስልጠና ይዘትና ሰነድ', avg: Number(avgContent), label: getSatisfactionWordLabel(Number(avgContent)), color: '#0ea5e9' },
    { name: 'ተዛማጅነት', fullName: 'ከስራ ተዛማጅነትና ተሳትፎ', avg: Number(avgRelevance), label: getSatisfactionWordLabel(Number(avgRelevance)), color: '#8b5cf6' },
    { name: 'አደረጃጀት', fullName: 'ቦታና አደረጃጀት/መስተንግዶ', avg: Number(avgVenue), label: getSatisfactionWordLabel(Number(avgVenue)), color: '#10b981' },
  ];

  // Helper for choice question breakdown calculation
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
      'ሌላ (Other)': 0,
    };

    let totalScoreSum = 0;
    let validCount = 0;

    relevantSubmissions.forEach((s) => {
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
      } else if (val.startsWith('ሌላ') || val.length > 0) {
        counts['ሌላ (Other)'] += 1;
      } else {
        counts['በጣም ከፍተኛ'] += 1;
      }

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
      numericKey: 'venueLogisticsRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '1.ለ',
      category: '1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ',
      title: 'ለ/ ከስልጠናው ሰነድ ዝግጅት አኳያ',
      fieldKey: 'prepDocRating' as const,
      numericKey: 'contentRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '2.ሀ',
      category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
      title: 'ሀ/ ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ',
      fieldKey: 'deliveryDocTrainerRating' as const,
      numericKey: 'trainerRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '2.ለ',
      category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
      title: 'ለ/ ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ',
      fieldKey: 'deliveryParticipationRating' as const,
      numericKey: 'relevanceRating' as const,
      type: 'dropdown' as const,
    },
    {
      code: '2.ሐ',
      category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
      title: 'ሐ/ በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ',
      fieldKey: 'deliveryConclusionsRating' as const,
      numericKey: 'overallRating' as const,
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
            reportTitle={category ? `Training Satisfaction Form - ${category.title}` : 'Training Satisfaction Form'}
            filename={
              category
                ? `${category.title} - Training Satisfaction Form (${category.dateCreated || new Date().toISOString().split('T')[0]})`
                : `Training Satisfaction Form (${new Date().toISOString().split('T')[0]})`
            }
          />
        </div>
      </div>

      {/* Zero submissions notice banner */}
      {category && relevantSubmissions.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center space-y-2">
          <h4 className="text-sm font-bold text-amber-700">ለዚህ የዕርካታ ቅጽ እስካሁን የተላከ ምዘና የለም</h4>
          <p className="text-xs text-text-muted">
            ተሳታፊዎች ቅጹን ሞልተው ሲልኩ በራስ-ሰር እዚህ ይተነተናል። የቅጹን ሊንክ ኮፒ በማድረግ ለተሳታፊዎች ማጋራት ይችላሉ::
          </p>
        </div>
      )}

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
          <div className="text-xs text-text-secondary mt-1">የተሳታፊዎች የመደገፍ ደረጃ መጠን</div>
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

      {/* GLOBAL SUMMARY: FORM-BY-FORM COMPARATIVE SUMMARY TABLE */}
      {!category && categoryComparativeData.length > 0 && (
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            <div>
              <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                <IconBulb className="text-amber-500" size={22} />
                የየስልጠናዎች የዕርካታ ማጠቃለያና ንጽጽር ሰንጠረዥ (Cross-Training Comparative Analytics)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                በስርዓቱ ውስጥ ከተመዘገቡ ሁሉም የስልጠና ዕርካታ ቅጾች የተሰበሰቡ ውጤቶች ንጽጽር ሰንጠረዥ::
              </p>
            </div>
            <span className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
              {categoryComparativeData.length} ቅጾች በንጽጽር
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-secondary/70 text-text-primary font-bold border-b border-border/50">
                  <th className="p-3">የስልጠና ዕርካታ ቅጽ ርዕስ</th>
                  <th className="p-3 text-center">ተሳታፊዎች</th>
                  <th className="p-3 text-center">አጠቃላይ ዕርካታ (CSAT)</th>
                  <th className="p-3 text-center">አማካይ ነጥብ</th>
                  <th className="p-3 text-center">የዕርካታ ደረጃ</th>
                  <th className="p-3 text-center">ከፍተኛ ውጤት ያመጣበት ዘርፍ</th>
                  <th className="p-3 text-right">እርምጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {categoryComparativeData.map(({ category: catItem, submittersCount, avgScore, csatPct, wordLabel, topDimension }) => (
                  <tr key={catItem.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="p-3 font-bold text-text-primary">
                      {catItem.title}
                      <div className="text-[10px] text-text-muted font-normal mt-0.5">{catItem.description}</div>
                    </td>
                    <td className="p-3 text-center font-bold text-text-primary">{submittersCount}</td>
                    <td className="p-3 text-center font-extrabold text-emerald-600 font-mono">{csatPct}%</td>
                    <td className="p-3 text-center font-extrabold text-brand-blue font-mono">{avgScore} / 5.0</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {wordLabel}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-text-secondary">{topDimension}</td>
                    <td className="p-3 text-right">
                      {onSelectCategory && (
                        <button
                          onClick={() => onSelectCategory(catItem)}
                          className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-[11px] font-bold shadow-2xs hover:bg-brand-blue/90 transition-all cursor-pointer"
                        >
                          ዝርዝር ሪፖርት
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            <h4 className="text-xs font-bold text-text-primary">ሀላፊነት ደረጃ ስርጭት</h4>
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
                      const pct = Math.round((d.value / totalAllResponses) * 100);
                      return (
                        <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs max-w-[200px]">
                          <div className="font-bold text-text-primary mb-1">{d.name}</div>
                          <div style={{ color: d.color }} className="font-bold">
                            {d.value} ምላሽ ({pct}%)
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/30">
            {satisfactionPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-text-secondary truncate">
                  <strong>{item.name}:</strong> {item.value} ({Math.round((item.value / totalAllResponses) * 100)}%)
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
                          <div className="font-extrabold text-emerald-600">ደረጃ፡ {d.label}</div>
                          <div className="font-bold text-text-secondary" style={{ color: d.color }}>አማካይ ነጥብ: {d.avg.toFixed(2)} / 5.0</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  <LabelList dataKey="avg" position="top" formatter={(v: unknown) => `${Number(v).toFixed(2)}`} style={{ fontSize: 10, fontWeight: 700 }} />
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
              const { counts, meanScore } = getChoiceBreakdown(qItem.fieldKey, qItem.numericKey);
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
        <SatisfactionReportPdfTemplate
          submissions={relevantSubmissions}
          category={category}
          categories={categories}
          reportTitle={category ? category.title : 'የስልጠና ዕርካታ ሪፖርት'}
        />
      </div>
    </div>
  );
};
