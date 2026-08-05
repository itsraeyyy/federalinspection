'use client';

import React from 'react';
import { SatisfactionSubmission, TrainingCategory } from '@/types/sletena';
import { PdfExportButton } from './PdfExportButton';
import { SletenaReportPdfTemplate } from './SletenaReportPdfTemplate';
import { IconStar, IconUsers, IconHeartHandshake, IconChartBar, IconBulb, IconFileChart, IconArrowLeft } from '@tabler/icons-react';
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

export const SatisfactionReportView: React.FC<SatisfactionReportViewProps> = ({ 
  submissions,
  category,
  onBack,
}) => {
  // Filter submissions by category if a specific form is selected
  const activeSubmissions = category
    ? submissions.filter((s) => s.categoryId === category.id)
    : submissions;

  // Fallback to all submissions if selected category has 0 submissions yet for demo
  const relevantSubmissions = activeSubmissions.length > 0 ? activeSubmissions : submissions;
  const count = relevantSubmissions.length || 1;

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

  return (
    <div id="satisfaction-report-container" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary border border-border/50 transition-all cursor-pointer mt-1"
              title="ተመለስ ወደ ዕርካታ ቅጾች"
            >
              <IconArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <IconStar className="text-brand-blue" size={24} />
              <h2 className="text-xl font-extrabold text-text-primary">
                {category ? category.title : 'የስልጠና ዕርካታ ሪፖርት (Satisfaction Report)'}
              </h2>
              {category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
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
        <PdfExportButton
          elementId="satisfaction-report-container"
          reportTitle="የስልጠና_ዕርካታ_ሪፖርት"
        />
      </div>

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
          <div className="text-3xl font-extrabold text-brand-blue">{submissions.length}</div>
          <div className="text-xs text-text-secondary mt-1">የተሰበሰቡ ቅጾች ብዛት</div>
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
                      const pct = Math.round((d.value / Math.max(submissions.length, 1)) * 100);
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
                  {item.name.split(' ')[0]} ({Math.round((item.value / Math.max(submissions.length, 1)) * 100)}%)
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

      {/* Detailed Satisfaction Breakdown Report */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              ዝርዝር የዕርካታ ትንተና ሪፖርት (Detailed Satisfaction Analysis)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              በየዘርፉ የተመዘገበ የዕርካታ ደረጃ እና ትኩረት የሚሹ ክፍተቶች (High vs. Low Performing Areas)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ጥሩ ዕርካታ (Good Area)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> መካከለኛ (Fair Area)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> ማሻሻያ የሚፈልግ (Needs Improvement)
            </span>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="space-y-4">
          {[
            {
              id: 'trainer',
              title: 'የአሰልጣኝ ብቃት እና ዝግጅት (Trainer Expertise & Preparation)',
              avgNum: Number(avgTrainer),
              field: 'trainerRating' as const,
              desc: 'የአሰልጣኙ የርዕስ እውቀት፣ የማብራራት ችሎታ እና ለተሳታፊዎች ጥያቄ የሰጡት ምላሽ'
            },
            {
              id: 'content',
              title: 'የስልጠና ይዘት ጥራት (Content Quality & Clarity)',
              avgNum: Number(avgContent),
              field: 'contentRating' as const,
              desc: 'የስልጠናው ሞጁሎች ግልፅነት፣ የህትመት ሰነዶች ጥራት እና የተካተቱ ተግባራዊ ምሳሌዎች'
            },
            {
              id: 'relevance',
              title: 'ከስራ ጋር ያለው ተዛማጅነት (Job Relevance & Practical Utility)',
              avgNum: Number(avgRelevance),
              field: 'relevanceRating' as const,
              desc: 'የስልጠናው ይዘት ከተሳታፊዎች የእለት ተእለት የስራ ሀላፊነት እና ከክትትል ስራዎች ጋር ያለው ግንኙነት'
            },
            {
              id: 'venue',
              title: 'የአደረጃጀት እና መስተንግዶ ጥራት (Venue, Logistics & Hospitality)',
              avgNum: Number(avgVenue),
              field: 'venueLogisticsRating' as const,
              desc: 'የስልጠና አዳራሹ ይመችነት፣ የቴክኖሎጂ ቁሳቁሶች እና የምግብ/መስተንግዶ ጥራት'
            },
            {
              id: 'overall',
              title: 'አጠቃላይ የስልጠና ዕርካታ (Overall Training Satisfaction)',
              avgNum: Number(avgOverall),
              field: 'overallRating' as const,
              desc: 'ተሳታፊዎች በጠቅላላው በስልጠናው ሂደት ላይ ያላቸው አጠቃላይ የዕርካታ ግምገማ'
            },
          ].map((item, idx) => {
            const avg = item.avgNum;
            const pct = Math.round((avg / 5.0) * 100);

            // Calculate exact counts
            const satisfiedCount = submissions.filter((s) => s[item.field] >= 4).length;
            const neutralCount = submissions.filter((s) => s[item.field] === 3).length;
            const dissatisfiedCount = submissions.filter((s) => s[item.field] <= 2).length;

            const satisfiedPct = Math.round((satisfiedCount / count) * 100);
            const neutralPct = Math.round((neutralCount / count) * 100);
            const dissatisfiedPct = Math.round((dissatisfiedCount / count) * 100);

            const isGood = avg >= 3.5;
            const isFair = avg >= 2.5 && avg < 3.5;

            const badgeBg = isGood
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
              : isFair
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-600 border-rose-500/30';

            const rankBg = isGood
              ? 'bg-emerald-500/10 text-emerald-600'
              : isFair
              ? 'bg-amber-400/10 text-amber-600'
              : 'bg-rose-500/10 text-rose-600';

            const barColor = isGood
              ? 'bg-emerald-500'
              : isFair
              ? 'bg-amber-400'
              : 'bg-rose-500';

            const wordLabel = getSatisfactionWordLabel(avg);
            const statusTag = isGood
              ? 'ጥሩ ብቃት የታየበት (Good Area)'
              : isFair
              ? 'መካከለኛ ደረጃ (Fair Area)'
              : 'ማሻሻያ የሚፈልግ (Needs Improvement)';

            return (
              <div
                key={item.id}
                className="bg-surface-secondary/30 hover:bg-surface-secondary/60 border border-border/40 hover:border-border/70 rounded-xl p-4 transition-all duration-200"
              >
                {/* Header Row */}
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold mt-0.5 ${rankBg}`}>
                    #{idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeBg}`}>
                        {statusTag}
                      </span>
                      <span className="text-[11px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md">
                        {wordLabel}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary leading-snug">{item.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                  </div>

                  <div className="shrink-0 text-right hidden sm:block">
                    <div className="text-2xl font-extrabold text-brand-blue">{pct}%</div>
                    <div className="text-[10px] text-text-muted">የዕርካታ መጠን</div>
                  </div>
                </div>

                {/* Progress Bar & Breakdown */}
                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-text-muted mb-1 font-medium">
                      <span>የዕርካታ ደረጃ (Satisfaction Score)</span>
                      <span className="font-bold text-text-primary">{wordLabel} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Submitter Ratings Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20 text-xs">
                    <div className="bg-surface-primary/60 p-2 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-text-muted">ዕርካታ ያለው (Satisfied)</div>
                      <div className="font-bold text-emerald-600 mt-0.5">{satisfiedCount} ተሳታፊ ({satisfiedPct}%)</div>
                    </div>
                    <div className="bg-surface-primary/60 p-2 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-text-muted">ገለልተኛ (Neutral)</div>
                      <div className="font-bold text-amber-600 mt-0.5">{neutralCount} ተሳታፊ ({neutralPct}%)</div>
                    </div>
                    <div className="bg-surface-primary/60 p-2 rounded-lg border border-border/30 text-center">
                      <div className="text-[10px] text-text-muted">ዕርካታ የሌለው (Dissatisfied)</div>
                      <div className="font-bold text-rose-600 mt-0.5">{dissatisfiedCount} ተሳታፊ ({dissatisfiedPct}%)</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
          <IconBulb size={18} className="text-brand-blue" />
          አስተያየቶች እና የማሻሻያ ሀሳቦች (Feedback & Suggestions)
        </h3>
        <div className="space-y-4">
          {submissions
            .filter((s) => s.improvementSuggestions || s.positiveAspects)
            .slice(0, 5)
            .map((sub) => (
              <div key={sub.id} className="bg-surface-secondary/30 p-4 rounded-xl border border-border/40">
                <div className="flex justify-between items-center text-xs text-text-muted mb-2">
                  <span className="font-bold text-text-primary">{sub.participantName}</span>
                  <span>{sub.region}</span>
                </div>
                {sub.positiveAspects && (
                  <p className="text-sm text-text-secondary mb-1"><span className="font-medium text-text-primary">ጥንካሬ፡</span> {sub.positiveAspects}</p>
                )}
                {sub.improvementSuggestions && (
                  <p className="text-sm text-text-secondary"><span className="font-medium text-text-primary">ማሻሻያ፡</span> {sub.improvementSuggestions}</p>
                )}
              </div>
            ))}
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

