'use client';

import React from 'react';
import { SletenaSubmission, SatisfactionSubmission, TrainingCategory } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { formatECDate } from '@/lib/date-formatter';

interface SletenaReportPdfTemplateProps {
  needSubmissions: SletenaSubmission[];
  satisfactionSubmissions: SatisfactionSubmission[];
  category?: TrainingCategory;
  reportTitle?: string;
}

export const SletenaReportPdfTemplate: React.FC<SletenaReportPdfTemplateProps> = ({
  needSubmissions,
  satisfactionSubmissions,
  category,
  reportTitle = 'የስልጠና ፍላጎት እና ትንተና ሪፖርት',
}) => {
  const activeNeedSubs = category
    ? needSubmissions.filter((s) => s.categoryId === category.id)
    : needSubmissions;
  const needSubs = activeNeedSubs.length > 0 ? activeNeedSubs : needSubmissions;

  const activeSatSubs = category
    ? satisfactionSubmissions.filter((s) => s.categoryId === category.id)
    : satisfactionSubmissions;
  const satSubs = activeSatSubs.length > 0 ? activeSatSubs : satisfactionSubmissions;

  const gapAnalysisItems = calculateKnowledgeGaps(needSubs);
  const sortedGaps = [...gapAnalysisItems].sort((a, b) => b.gap - a.gap);

  const highNeeds = sortedGaps.filter((g) => g.priorityFlag === 'HIGH');
  const mediumNeeds = sortedGaps.filter((g) => g.priorityFlag === 'MEDIUM');
  const lowNeeds = sortedGaps.filter((g) => g.priorityFlag === 'LOW');

  // Count demand selections
  const directiveDemandCounts: Record<string, number> = {};
  needSubs.forEach((sub) => {
    (sub.topPriorityDirectives || []).forEach((dirId) => {
      directiveDemandCounts[dirId] = (directiveDemandCounts[dirId] || 0) + 1;
    });
  });

  // Category demand
  const categoryDemandMap: Record<string, number> = {};
  gapAnalysisItems.forEach((item) => {
    const demand = item.priorityFlag === 'HIGH' ? 3 : item.priorityFlag === 'MEDIUM' ? 2 : 1;
    categoryDemandMap[item.category] = (categoryDemandMap[item.category] || 0) + demand;
  });

  const categoryEntries = Object.entries(categoryDemandMap);
  const totalCategoryDemand = categoryEntries.reduce((a, [, v]) => a + v, 0) || 1;

  // Satisfaction metrics
  const satCount = satSubs.length || 1;
  const avgTrainer = (satSubs.reduce((a, b) => a + b.trainerRating, 0) / satCount).toFixed(1);
  const avgContent = (satSubs.reduce((a, b) => a + b.contentRating, 0) / satCount).toFixed(1);
  const avgRelevance = (satSubs.reduce((a, b) => a + b.relevanceRating, 0) / satCount).toFixed(1);
  const avgVenue = (satSubs.reduce((a, b) => a + b.venueLogisticsRating, 0) / satCount).toFixed(1);
  const avgOverall = (satSubs.reduce((a, b) => a + b.overallRating, 0) / satCount).toFixed(1);
  const csatPct = Math.round((Number(avgOverall) / 5.0) * 100);

  const currentDateStr = formatECDate(new Date().toISOString());

  return (
    <div
      id="pdf-printable-document-template"
      className="bg-white text-slate-900 p-8 max-w-[1100px] mx-auto font-sans leading-normal text-xs space-y-6 border border-slate-200"
      style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
    >
      {/* 1. OFFICIAL DOCUMENT HEADER */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
        <div>
          <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            የፌደራል የዴሞክራሲያዊ ኮሚሽን ፍተሻ ፖርታል
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {category ? category.title : reportTitle}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {category ? category.description : 'የስልጠና ፍላጎት፣ የብቃት ክፍተት (Gap) እና የድህረ-ስልጠና ዕርካታ ኦፊሴላዊ የትንተና ሰነድ'}
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600 space-y-0.5 shrink-0">
          <div><strong>ቀን፡</strong> {currentDateStr}</div>
          <div><strong>ጠቅላላ ተሳታፊዎች፡</strong> {needSubs.length} ሰዎች</div>
          <div><strong>የሰነድ አይነት፡</strong> ኦፊሴላዊ ሪፖርት</div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS GRID */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
          <div className="text-[10px] text-slate-500 font-bold uppercase">ጠቅላላ ተሳታፊዎች</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{needSubs.length}</div>
          <div className="text-[10px] text-slate-600 mt-0.5">የተሞሉ የምዘና ቅጾች</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-rose-50">
          <div className="text-[10px] text-rose-700 font-bold uppercase">ከፍተኛ ቅድሚያ (High Need)</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{highNeeds.length} ርዕሶች</div>
          <div className="text-[10px] text-rose-600 mt-0.5">አስቸኳይ ስልጠና የሚሹ</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-amber-50">
          <div className="text-[10px] text-amber-700 font-bold uppercase">መካከለኛ ቅድሚያ (Medium Need)</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{mediumNeeds.length} ርዕሶች</div>
          <div className="text-[10px] text-amber-600 mt-0.5">ሁለተኛ ደረጃ ስልጠና</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-emerald-50">
          <div className="text-[10px] text-emerald-700 font-bold uppercase">የዕርካታ መጠን (CSAT)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{csatPct}%</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">የተሳታፊዎች አጠቃላይ ዕርካታ</div>
        </div>
      </div>

      {/* 3. CHARTS & GRAPH ANALYSIS SECTION */}
      <div className="grid grid-cols-2 gap-6 pt-2">
        {/* Category Breakdown Pie Chart Data */}
        <div className="border border-slate-300 rounded-lg p-4 bg-white space-y-3">
          <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2 text-xs">
            📊 የስልጠና ፍላጎት በዘርፍ ስርጭት (Demand Distribution by Sector)
          </h3>
          <div className="space-y-2">
            {categoryEntries.map(([catName, val], i) => {
              const pct = Math.round((val / totalCategoryDemand) * 100);
              const barColors = ['bg-blue-700', 'bg-rose-600', 'bg-amber-500', 'bg-emerald-600'];
              const colorClass = barColors[i % barColors.length];
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{catName}</span>
                    <span className="font-bold text-slate-900">{pct}% ({val} ነጥብ)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Satisfaction Dimensions Bar Graph */}
        <div className="border border-slate-300 rounded-lg p-4 bg-white space-y-3">
          <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2 text-xs">
            ⭐️ የድህረ-ስልጠና የዕርካታ ዘርፎች ውጤት (Avg Score out of 5.0)
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'የአሰልጣኝ ብቃት (Trainer Expertise)', score: avgTrainer, color: 'bg-blue-700' },
              { label: 'የስልጠና ይዘት (Content Quality)', score: avgContent, color: 'bg-sky-600' },
              { label: 'ከስራ ጋር ተዛማጅነት (Job Relevance)', score: avgRelevance, color: 'bg-purple-600' },
              { label: 'አደረጃጀት/መስተንግዶ (Venue Logistics)', score: avgVenue, color: 'bg-emerald-600' },
            ].map((item) => {
              const numScore = Number(item.score);
              const pct = Math.round((numScore / 5.0) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.score} / 5.0 ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. DETAILED DATA TABLE */}
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-xs">
            📋 ዝርዝር የስልጠና ፍላጎቶች እና የብቃት ደረጃዎች ሰንጠረዥ (Detailed Analysis Table)
          </h3>
          <span className="text-[10px] text-slate-600 font-medium">በደረጃ ቅደም ተከተል ተደርድረዋል</span>
        </div>

        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
              <th className="p-2.5 w-12 text-center">ደረጃ</th>
              <th className="p-2.5 w-24">ኮድ</th>
              <th className="p-2.5">የስልጠና ርዕስ (Topic)</th>
              <th className="p-2.5 w-32">ዘርፍ (Category)</th>
              <th className="p-2.5 w-36 text-center">የመረጡ አባላት</th>
              <th className="p-2.5 w-28 text-center">የዕውቀት ክፍተት</th>
              <th className="p-2.5 w-32 text-center">ቅድሚያ ደረጃ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedGaps.map((item, index) => {
              const countChosen = directiveDemandCounts[item.directiveCode] || directiveDemandCounts[item.directiveId] || 0;
              const total = Math.max(needSubs.length, 1);
              const pctChosen = Math.round((countChosen / total) * 100);
              const gapPct = Math.round((item.gap / item.targetScore) * 100);

              const isHigh = item.priorityFlag === 'HIGH';
              const isMedium = item.priorityFlag === 'MEDIUM';

              const badgeStyle = isHigh
                ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                : isMedium
                ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';

              const badgeText = isHigh
                ? '🔴 ከፍተኛ ቅድሚያ'
                : isMedium
                ? '🟡 መካከለኛ ቅድሚያ'
                : '🟢 ጥሩ ብቃት';

              return (
                <tr key={item.directiveId} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2.5 font-bold text-center text-slate-900">#{index + 1}</td>
                  <td className="p-2.5 font-mono font-bold text-blue-900">{item.directiveCode}</td>
                  <td className="p-2.5 font-medium text-slate-900">{item.directiveTitle}</td>
                  <td className="p-2.5 text-slate-600">{item.category}</td>
                  <td className="p-2.5 text-center font-bold text-blue-900">
                    ከ {total} ውስጥ {countChosen} ({pctChosen}%)
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-800">{gapPct}%</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. PARTICIPANTS FEEDBACK SUMMARY */}
      {satSubs.some((s) => s.improvementSuggestions || s.positiveAspects) && (
        <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-2">
          <h3 className="font-bold text-slate-900 text-xs">💬 የተሳታፊዎች ዋና ዋና አስተያየቶች እና የማሻሻያ ሀሳቦች</h3>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            {satSubs
              .filter((s) => s.improvementSuggestions || s.positiveAspects)
              .slice(0, 4)
              .map((s, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">{s.participantName} ({s.region})</div>
                  {s.positiveAspects && <p className="text-slate-700"><strong>ጥንካሬ፡</strong> {s.positiveAspects}</p>}
                  {s.improvementSuggestions && <p className="text-slate-700"><strong>ማሻሻያ፡</strong> {s.improvementSuggestions}</p>}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 6. DOCUMENT FOOTER */}
      <div className="pt-4 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-500">
        <div>
          <div>ኦፊሴላዊ የፌደራል ፍተሻ ፖርታል የስልጠና ትንተና ሪፖርት</div>
          <div>በሲስተሙ በራስ-ሰር የተመረተ ህጋዊ ሰነድ</div>
        </div>
      </div>
    </div>
  );
};
