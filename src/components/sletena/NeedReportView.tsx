'use client';

import React, { useState, useMemo } from 'react';
import { SletenaSubmission, TrainingCategory, InspectionDirective } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { PdfExportButton } from './PdfExportButton';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import {
  IconFlame,
  IconTarget,
  IconUsers,
  IconAlertTriangle,
  IconFileChart,
  IconChartBar,
  IconMapPin,
  IconSchool,
  IconMessage2,
  IconCheckbox,
  IconSearch,
  IconCheck,
  IconBuilding,
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
} from 'recharts';

import { SletenaReportPdfTemplate } from './SletenaReportPdfTemplate';

interface NeedReportViewProps {
  submissions: SletenaSubmission[];
  category?: TrainingCategory;
  onBack?: () => void;
  hideHeaderBanner?: boolean;
}

export const NeedReportView: React.FC<NeedReportViewProps> = ({ 
  submissions, 
  category, 
  onBack, 
  hideHeaderBanner = false 
}) => {
  const [regionFilter, setRegionFilter] = useState<string>('ሁሉም');
  const [feedbackSearch, setFeedbackSearch] = useState<string>('');

  // Unique Regions list
  const regionsList = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.region) set.add(s.region);
    });
    return ['ሁሉም', ...Array.from(set)];
  }, [submissions]);

  // Filtered submissions by region
  const filteredSubmissions = useMemo(() => {
    if (regionFilter === 'ሁሉም') return submissions;
    return submissions.filter((s) => s.region === regionFilter);
  }, [submissions, regionFilter]);

  // Section 1 Analytics: Membership Levels & Geography
  const membershipLevelStats = useMemo(() => {
    const counts: Record<string, number> = {
      'አባል': 0,
      'የቤተሰብ አመራር': 0,
      'የህብረት አመራር': 0,
      'የበታች አመራር': 0,
      'መካከለኛ አመራር': 0,
      'ከፍተኛ አመራር': 0,
    };

    filteredSubmissions.forEach((s) => {
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
      percentage: Math.round((value / Math.max(filteredSubmissions.length, 1)) * 100),
      color: colors[idx % colors.length],
    }));
  }, [filteredSubmissions]);

  const regionStatsData = useMemo(() => {
    const regMap: Record<string, number> = {};
    submissions.forEach((s) => {
      const r = s.region || 'ያልተገለጸ';
      regMap[r] = (regMap[r] || 0) + 1;
    });
    return Object.entries(regMap)
      .map(([region, count]) => ({
        region,
        count,
        pct: Math.round((count / Math.max(submissions.length, 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [submissions]);

  const zoneWoredaTableData = useMemo(() => {
    const table: Record<string, { region: string; zone: string; woreda: string; count: number }> = {};
    filteredSubmissions.forEach((s) => {
      const key = `${s.region || 'N/A'}-${s.zone || 'N/A'}-${s.woreda || 'N/A'}`;
      if (!table[key]) {
        table[key] = {
          region: s.region || 'ያልተገለጸ',
          zone: s.zone || 'ያልተገለጸ',
          woreda: s.woreda || 'ያልተገለጸ',
          count: 0,
        };
      }
      table[key].count += 1;
    });
    return Object.values(table).sort((a, b) => b.count - a.count);
  }, [filteredSubmissions]);

  // Active directives list (scoped to category & custom form questions)
  const activeDirectives = useMemo(() => {
    let list: InspectionDirective[] = [];

    if (category) {
      if (category.questions && category.questions.length > 0) {
        const rawQuestions =
          category.selectedDirectiveIds && category.selectedDirectiveIds.length > 0
            ? category.questions.filter(
                (q) =>
                  category.selectedDirectiveIds?.includes(q.id) ||
                  category.selectedDirectiveIds?.includes(q.code)
              )
            : category.questions;

        list = rawQuestions.map((q) => {
          let cleanTitle = q.title;
          let cleanDesc = q.description || '';

          if (!cleanTitle || cleanTitle.startsWith('መመሪያ / መጠይቅ')) {
            const match = INSPECTION_DIRECTIVES.find((d) => d.id === q.id || d.code === q.code);
            if (match) {
              cleanTitle = match.title;
              cleanDesc = cleanDesc || match.description;
            } else if (q.id && q.id.startsWith('INS-')) {
              const idx = parseInt(q.id.replace('INS-', ''), 10) - 1;
              if (idx >= 0 && idx < INSPECTION_DIRECTIVES.length) {
                cleanTitle = INSPECTION_DIRECTIVES[idx].title;
                cleanDesc = cleanDesc || INSPECTION_DIRECTIVES[idx].description;
              }
            }
          }

          return {
            id: q.id,
            code: q.code || q.id,
            title: cleanTitle,
            description: cleanDesc || 'የኮሚሽኑ የኢንስፔክሽንና የሥነ-ምግባር አሰራር መመሪያ::',
            category: q.category || 'ፍተሻ መመሪያ',
            targetScore: q.targetScore || 5.0,
          };
        });
      } else if (category.selectedDirectiveIds && category.selectedDirectiveIds.length > 0) {
        list = INSPECTION_DIRECTIVES.filter(
          (d) =>
            category.selectedDirectiveIds!.includes(d.id) ||
            category.selectedDirectiveIds!.includes(d.code)
        );
      }
    }

    if (list.length === 0) {
      list = [...INSPECTION_DIRECTIVES];
    }

    // Dynamically include any custom directive/question key from ratings or top_priority_directives
    filteredSubmissions.forEach((sub) => {
      const keys = [
        ...Object.keys(sub.ratings || {}),
        ...(sub.topPriorityDirectives || []),
      ];
      keys.forEach((key) => {
        if (key && !list.some((d) => d.id === key || d.code === key)) {
          let match = INSPECTION_DIRECTIVES.find((d) => d.id === key || d.code === key);
          if (!match && key.startsWith('INS-')) {
            const idx = parseInt(key.replace('INS-', ''), 10) - 1;
            if (idx >= 0 && idx < INSPECTION_DIRECTIVES.length) {
              match = INSPECTION_DIRECTIVES[idx];
            }
          }

          list.push({
            id: key,
            code: match ? match.code : key,
            title: match ? match.title : `መመሪያ (${key})`,
            category: match ? match.category : 'ፍተሻ መመሪያ',
            targetScore: 5.0,
            description: match ? match.description : 'የኮሚሽኑ የኢንስፔክሽንና የሥነ-ምግባር አሰራር መመሪያ::',
          });
        }
      });
    });

    return list;
  }, [category, filteredSubmissions]);

  // Section 2 Analytics: Directives Ratings & Gap Analysis (Scoped to activeDirectives)
  const gapAnalysisItems = useMemo(() => {
    return calculateKnowledgeGaps(filteredSubmissions, activeDirectives);
  }, [filteredSubmissions, activeDirectives]);

  // Compute top priority votes frequency from sub.topPriorityDirectives
  const topPriorityVotesMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSubmissions.forEach((sub) => {
      if (sub.topPriorityDirectives && Array.isArray(sub.topPriorityDirectives)) {
        sub.topPriorityDirectives.forEach((pKey) => {
          if (pKey) {
            map[pKey] = (map[pKey] || 0) + 1;
          }
        });
      }
    });
    return map;
  }, [filteredSubmissions]);

  const sortedNeededTopics = useMemo(() => {
    return [...gapAnalysisItems].sort((a, b) => {
      const votesA = topPriorityVotesMap[a.directiveId] || topPriorityVotesMap[a.directiveCode] || 0;
      const votesB = topPriorityVotesMap[b.directiveId] || topPriorityVotesMap[b.directiveCode] || 0;
      if (b.gap !== a.gap) return b.gap - a.gap;
      return votesB - votesA;
    });
  }, [gapAnalysisItems, topPriorityVotesMap]);

  const topCriticalNeeded = sortedNeededTopics.filter((item) => item.priorityFlag === 'HIGH' || (topPriorityVotesMap[item.directiveId] || 0) > 0);
  const mediumNeeded = sortedNeededTopics.filter((item) => item.priorityFlag === 'MEDIUM');

  // Section 3 Analytics: Additional Recommended Directives Frequency
  const additionalDirectivesStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSubmissions.forEach((sub) => {
      if (sub.additionalNeededDirectives && Array.isArray(sub.additionalNeededDirectives)) {
        sub.additionalNeededDirectives.forEach((dirId) => {
          counts[dirId] = (counts[dirId] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        let match =
          activeDirectives.find((d) => d.id === id || d.code === id) ||
          INSPECTION_DIRECTIVES.find((d) => d.id === id || d.code === id);

        // Fallback for INS-xx codes if match title is generic placeholder
        if ((!match || match.title.startsWith('መመሪያ / መጠይቅ')) && id.startsWith('INS-')) {
          const idx = parseInt(id.replace('INS-', ''), 10) - 1;
          if (idx >= 0 && idx < INSPECTION_DIRECTIVES.length) {
            match = INSPECTION_DIRECTIVES[idx];
          }
        }

        const rawTitle = match ? match.title : id;
        const cleanTitle = rawTitle.startsWith('መመሪያ / መጠይቅ')
          ? INSPECTION_DIRECTIVES.find((d) => d.id === id || d.code === id)?.title || rawTitle
          : rawTitle;

        return {
          id,
          code: match ? match.code : id,
          title: cleanTitle,
          description: match?.description || 'የኮሚሽኑ የኢንስፔክሽንና የሥነ-ምግባር አሰራር መመሪያ::',
          category: match?.category || 'የፓርቲና የኮሚሽን መመሪያዎች',
          count,
          percentage: Math.round((count / Math.max(filteredSubmissions.length, 1)) * 100),
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filteredSubmissions, activeDirectives]);

  // Section 4 Analytics: Preferred Training Mode & Materials
  const trainingModeStats = useMemo(() => {
    let physicalCount = 0;
    let onlineCount = 0;
    let videoAudioCount = 0;
    let hardCopyCount = 0;

    filteredSubmissions.forEach((sub) => {
      const methods = sub.preferredTrainingMethods || [];
      if (methods.includes('በአካል')) physicalCount += 1;
      if (methods.includes('Online')) onlineCount += 1;
      if (methods.includes('የቪዲዮና የድምፅ ማብራሪያዎች')) videoAudioCount += 1;
      if (methods.includes('የታተመ ሰነድ (Hard Copy)')) hardCopyCount += 1;
    });

    const totalSubs = Math.max(filteredSubmissions.length, 1);
    return {
      mode: [
        { name: 'በአካል (In-Person)', value: physicalCount, pct: Math.round((physicalCount / totalSubs) * 100), color: '#0047AB' },
        { name: 'Online (ኦንላይን)', value: onlineCount, pct: Math.round((onlineCount / totalSubs) * 100), color: '#10b981' },
      ],
      materials: [
        { name: 'የቪዲዮና የድምፅ ማብራሪያዎች', value: videoAudioCount, pct: Math.round((videoAudioCount / totalSubs) * 100), color: '#f59e0b' },
        { name: 'የታተመ ሰነድ (Hard Copy)', value: hardCopyCount, pct: Math.round((hardCopyCount / totalSubs) * 100), color: '#7c3aed' },
      ],
    };
  }, [filteredSubmissions]);

  // Section 5 Analytics: Qualitative Suggestions & "ምንም የለኝም"
  const qualitativeStats = useMemo(() => {
    let noSuggestionsCount = 0;
    const activeFeedbacks: { id: string; name: string; region: string; zone: string; text: string; date: string }[] = [];

    filteredSubmissions.forEach((s) => {
      const text = (s.qualitativeFeedback || '').trim();
      if (!text || text === 'ምንም የለኝም') {
        noSuggestionsCount += 1;
      } else {
        activeFeedbacks.push({
          id: s.id,
          name: s.memberName || 'አባል/አመራር',
          region: s.region || 'N/A',
          zone: s.zone || 'N/A',
          text,
          date: s.createdAt,
        });
      }
    });

    const totalSubs = Math.max(filteredSubmissions.length, 1);
    const withFeedbackCount = activeFeedbacks.length;

    const filteredFeedbacks = activeFeedbacks.filter(
      (f) =>
        f.text.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        f.name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        f.region.toLowerCase().includes(feedbackSearch.toLowerCase())
    );

    return {
      noSuggestionsCount,
      noSuggestionsPct: Math.round((noSuggestionsCount / totalSubs) * 100),
      withFeedbackCount,
      withFeedbackPct: Math.round((withFeedbackCount / totalSubs) * 100),
      feedbacks: filteredFeedbacks,
    };
  }, [filteredSubmissions, feedbackSearch]);

  const topCount5 = Math.min(5, Math.max(1, activeDirectives.length || 5));
  const topCount3 = Math.min(3, Math.max(1, activeDirectives.length || 3));

  return (
    <div id="need-report-container" className="space-y-8">
      {/* Report Banner & Controls */}
      {!hideHeaderBanner ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <IconTarget className="text-brand-blue" size={26} />
              <h2 className="text-xl font-black text-text-primary">
                {category ? category.title : 'አጠቃላይ የስልጠና ፍላጎት ሪፖርት'}
              </h2>
              {category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                  የቅጽ ሪፖርት ({activeDirectives.length} መመሪያዎች)
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {category
                ? category.description
                : 'በ5ቱም የቅጹ ክፍሎች (Sections 1-5) መሰረት የተተነተነ አጠቃላይ የስልጠና ፍላጎት ሪፖርት::'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Region Filter */}
            <div className="flex items-center gap-1.5 bg-surface-secondary/50 px-3 py-1.5 rounded-xl border border-border/40 text-xs">
              <IconMapPin size={15} className="text-brand-blue" />
              <span className="font-bold text-text-muted">ክልል:</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-transparent font-bold text-text-primary focus:outline-none cursor-pointer"
              >
                {regionsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <PdfExportButton
              elementId="need-report-container"
              reportTitle={category ? `Training Needs Form - ${category.title}` : 'Training Needs Form'}
              filename={
                category
                  ? `${category.title} - Training Needs Form (${category.dateCreated || new Date().toISOString().split('T')[0]})`
                  : `Training Needs Form (${new Date().toISOString().split('T')[0]})`
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-1.5 bg-surface-secondary/80 px-4 py-2 rounded-xl border border-border/50 text-xs shadow-2xs">
            <IconMapPin size={16} className="text-brand-blue" />
            <span className="font-extrabold text-text-muted">ክልል ያጣሩ:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent font-black text-brand-blue focus:outline-none cursor-pointer"
            >
              {regionsList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-bold uppercase">ጠቅላላ የተሞሉ ቅጾች</span>
            <IconUsers size={20} className="text-brand-blue" />
          </div>
          <div className="text-3xl font-black text-brand-blue">{filteredSubmissions.length}</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-bold uppercase">ከፍተኛ የስልጠና ፍላጎቶች</span>
            <IconFlame size={20} className="text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600">{topCount5}</div>
          <div className="text-[11px] text-text-secondary">አስቸኳይ ስልጠና የሚሹ ዋና ዋና መመሪያዎች (Top {topCount5})</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-bold uppercase">በአካል ስልጠና ተመራጭነት</span>
            <IconSchool size={20} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{trainingModeStats.mode[0].pct}%</div>
          <div className="text-[11px] text-text-secondary">በአካል መካፈል የሚፈልጉ</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-xl p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-xs font-bold uppercase">ምንም ተጨማሪ ሃሳብ የሌላቸው</span>
            <IconCheckbox size={20} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">{qualitativeStats.noSuggestionsPct}%</div>
          <div className="text-[11px] text-text-secondary">"ምንም የለኝም" ብለው የመለሱ</div>
        </div>
      </div>

      {/* ========================================== */}
      {/* EXECUTIVE TRAINING ACTION PLAN & RECOMMENDATIONS */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-brand-blue/10 via-brand-blue/5 to-transparent border-2 border-brand-blue/30 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-brand-blue/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold shadow-md">
              <IconTarget size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-text-primary">
                የስልጠና ትግበራ ውሳኔ እና የአሰልጣኝነት የውሳኔ ሃሳብ (Executive Training Action Plan & Recommendations)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                በአባላት የፍላጎት ምዘና እና በቅድሚያ ምርጫ ውጤት መሰረት ስልጠና ለመጀመር የተመረጡ ከፍተኛ {topCount3} መመሪያዎች እና የትግበራ አቅጣጫ::
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 bg-brand-blue text-white rounded-full shadow-sm shrink-0">
            የውሳኔ ሃሳብ (Executive Action)
          </span>
        </div>

        {/* Top 3 Directives Recommended to Start Training */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
            <IconFlame className="text-rose-500" size={16} />
            ለስልጠና አስቸኳይ ትግበራ የተመረጡ {topCount3} ዋና ዋና መመሪያዎች (Top {topCount3} Priority Directives to Start Training)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sortedNeededTopics.slice(0, topCount3).map((topic, i) => {
              const needPct = Math.round((topic.currentScore / 5.0) * 100);
              const votes = topPriorityVotesMap[topic.directiveId] || topPriorityVotesMap[topic.directiveCode] || 0;
              const totalSubs = filteredSubmissions.length;
              const votePct = Math.round((votes / Math.max(totalSubs, 1)) * 100);

              let displayTitle = topic.directiveTitle;
              if (!displayTitle || displayTitle.startsWith('መመሪያ / መጠይቅ')) {
                const match = INSPECTION_DIRECTIVES.find((d) => d.id === topic.directiveId || d.code === topic.directiveCode);
                if (match) displayTitle = match.title;
              }

              return (
                <div key={topic.directiveId} className="bg-surface-primary border border-brand-blue/30 rounded-xl p-4 space-y-2 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg">
                    ተመራጭ #{i + 1}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded border border-brand-blue/20 font-mono">
                      {topic.directiveCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded">
                      {needPct}% ፍላጎት
                    </span>
                  </div>
                  <h5 className="text-xs font-extrabold text-text-primary line-clamp-2 leading-snug">{displayTitle}</h5>
                  <div className="text-[11px] text-text-muted space-y-0.5 pt-1 border-t border-border/30">
                    <div>🎯 <strong>ቅድሚያ የመረጡት፡</strong> ከ {totalSubs} አባላት {votes} ({votePct}%)</div>
                    <div>📊 <strong>አማካይ ውጤት፡</strong> {topic.currentScore} / 5.0 ነጥብ</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Strategy Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-blue/15 text-xs">
          <div className="bg-surface-primary/80 border border-border/40 p-3 rounded-xl space-y-1">
            <div className="font-extrabold text-brand-blue flex items-center gap-1">
              <IconSchool size={15} />
              የተመከረ የስልጠና አሰጣጥ መንገድ
            </div>
            <div className="font-black text-text-primary text-sm">
              {trainingModeStats.mode[0].pct >= trainingModeStats.mode[1].pct ? 'በአካል (In-Person)' : 'Online (ኦንላይን)'}
            </div>
            <p className="text-[11px] text-text-muted">
              {trainingModeStats.mode[0].pct}% አባላት የስልጠና ውይይቶች በአካል ቢካሄዱ ውጤታማ ይሆናል ብለዋል።
            </p>
          </div>

          <div className="bg-surface-primary/80 border border-border/40 p-3 rounded-xl space-y-1">
            <div className="font-extrabold text-brand-blue flex items-center gap-1">
              <IconCheckbox size={15} />
              የተመከረ የስልጠና ማብራሪያ ሰነድ
            </div>
            <div className="font-black text-text-primary text-sm">
              {trainingModeStats.materials[0].value >= trainingModeStats.materials[1].value ? 'የቪዲዮና የድምፅ ማብራሪያዎች' : 'የታተመ ሰነድ (Hard Copy)'}
            </div>
            <p className="text-[11px] text-text-muted">
              ከፍተኛ ፍላጎት ያገኙት ማብራሪያ ሰነዶች በቅድሚያ እንዲዘጋጁ ይመከራል።
            </p>
          </div>

          <div className="bg-surface-primary/80 border border-border/40 p-3 rounded-xl space-y-1">
            <div className="font-extrabold text-brand-blue flex items-center gap-1">
              <IconMapPin size={15} />
              የቅድሚያ ክልሎች ትኩረት
            </div>
            <div className="font-black text-text-primary text-sm">
              {regionStatsData.slice(0, 3).map((r) => r.region).join(', ') || 'አጠቃላይ ክልሎች'}
            </div>
            <p className="text-[11px] text-text-muted">
              ከፍተኛ የተሳታፊዎች ቁጥር የተመዘገበባቸው እና በቅድሚያ ስልጠና የሚሹ አካባቢዎች::
            </p>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 1 ANALYTICS: Demographics & Geography */}
      {/* ========================================== */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <IconBuilding className="text-brand-blue" size={22} />
            <h3 className="text-base font-extrabold text-text-primary">
              Section 1 Analytics: የአባላት ስነ-ሕዝብ እና ጂኦግራፊያዊ ስርጭት (Demographics & Geography)
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg">
            ክፍል 1
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Membership Level Pie Chart */}
          <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
              ሀ) ሀላፊነት ደረጃ ስርጭት (Responsibility Level Distribution)
            </h4>
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs">
                            <div className="font-bold text-text-primary">{data.name}</div>
                            <div className="text-brand-blue font-bold">
                              {data.value} ሰዎች ({data.percentage}%)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={membershipLevelStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {membershipLevelStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
              {membershipLevelStats.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface-primary/60 border border-border/30">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary truncate font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-text-primary shrink-0 ml-1">{item.value} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Region Submissions Responsive Distribution */}
          <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                ለ) የክልል / ከተማ ተሳትፎ ስርጭት (Regional Distribution)
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded-md border border-brand-blue/20">
                {regionStatsData.length} ክልሎች/ከተሞች
              </span>
            </div>

            <div className="space-y-3 pt-1 max-h-60 overflow-y-auto pr-1">
              {regionStatsData.map((item) => (
                <div key={item.region} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{item.region}</span>
                    <span className="font-extrabold text-brand-blue">{item.count} ቅጾች ({item.pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className="h-full bg-brand-blue rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.pct, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-text-muted italic pt-1 text-center border-t border-border/30">
              በአጠቃላይ ከ <span className="font-bold text-text-primary">{regionStatsData.length}</span> ክልሎች/ከተሞች ምላሽ ተሰብስቧል።
            </div>
          </div>
        </div>

        {/* Zone & Woreda Geographic Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
              ሐ) የዞን/ክፍለ ከተማ እና ወረዳ ዝርዝር ተሳትፎ (Zone & Woreda Breakdown Table)
            </h4>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue rounded-md border border-brand-blue/20">
              {zoneWoredaTableData.length} የተለዩ አካባቢዎች
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/40 max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary text-text-secondary font-bold uppercase sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">ክልል / ከተማ</th>
                  <th className="p-2.5">ዞን / ክፍለ ከተማ</th>
                  <th className="p-2.5">ወረዳ</th>
                  <th className="p-2.5 text-right">የተሞሉ ቅጾች ብዛት</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {zoneWoredaTableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-secondary/40">
                    <td className="p-2.5 font-bold text-text-primary">{row.region}</td>
                    <td className="p-2.5 text-text-secondary">{row.zone}</td>
                    <td className="p-2.5 text-text-secondary">{row.woreda}</td>
                    <td className="p-2.5 text-right font-black text-brand-blue">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surface-secondary/90 font-bold border-t border-border/50 sticky bottom-0 z-10">
                <tr>
                  <td colSpan={3} className="p-2.5 text-text-primary font-black">
                    ድምር ጠቅላላ (Total Submissions Across All Locations)
                  </td>
                  <td className="p-2.5 text-right font-black text-brand-blue text-sm">
                    {zoneWoredaTableData.reduce((acc, r) => acc + r.count, 0)} ቅጾች
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 2 ANALYTICS: High Needs Priority List */}
      {/* ========================================== */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <IconFlame className="text-rose-500" size={22} />
            <h3 className="text-base font-extrabold text-text-primary">
              Section 2 Analytics: ከፍተኛ የስልጠና ፍላጎት ያላቸው {topCount5} መመሪያዎች (Top {topCount5} Training Needs)
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-rose-500/10 text-rose-600 rounded-lg">
            ክፍል 2 (Top {topCount5})
          </span>
        </div>

        <div className="space-y-3">
          {sortedNeededTopics.slice(0, topCount5).map((topic, index) => {
            const isHigh = topic.priorityFlag === 'HIGH';
            const isMedium = topic.priorityFlag === 'MEDIUM';

            const badgeBg = isHigh
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              : isMedium
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';

            const needPct = Math.round((topic.currentScore / 5.0) * 100);

            // Clean title resolution
            let displayTitle = topic.directiveTitle;
            if (!displayTitle || displayTitle.startsWith('መመሪያ / መጠይቅ')) {
              const match = INSPECTION_DIRECTIVES.find((d) => d.id === topic.directiveId || d.code === topic.directiveCode);
              if (match) {
                displayTitle = match.title;
              } else if (topic.directiveId && topic.directiveId.startsWith('INS-')) {
                const idx = parseInt(topic.directiveId.replace('INS-', ''), 10) - 1;
                if (idx >= 0 && idx < INSPECTION_DIRECTIVES.length) {
                  displayTitle = INSPECTION_DIRECTIVES[idx].title;
                }
              }
            }

            const votes = topPriorityVotesMap[topic.directiveId] || topPriorityVotesMap[topic.directiveCode] || 0;

            return (
              <div
                key={topic.directiveId}
                className="bg-surface-secondary/20 hover:bg-surface-secondary/50 border border-border/40 rounded-xl p-4 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      #{index + 1}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded border border-brand-blue/20 font-mono">
                          {topic.directiveCode}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border/30">
                          {topic.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
                          {isHigh ? '🔥 በጣም ከፍተኛ ፍላጎት' : isMedium ? '⚡ መካከለኛ ፍላጎት' : '✓ ዝቅተኛ ፍላጎት'}
                        </span>
                        {votes > 0 && (() => {
                          const totalSubs = filteredSubmissions.length;
                          const votePct = Math.round((votes / Math.max(totalSubs, 1)) * 100);
                          return (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-500/20 text-rose-600 rounded border border-rose-500/30">
                              🎯 ከ {totalSubs} አባላት {votes} ({votePct}%) በቅድሚያ መረጡት
                            </span>
                          );
                        })()}
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-text-primary leading-snug">{displayTitle}</h4>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base sm:text-lg font-black text-brand-blue">{needPct}% ፍላጎት</div>
                    <div className="text-[11px] font-extrabold text-text-secondary">({topic.currentScore} / 5.0 ነጥብ)</div>
                    <div className="text-[10px] text-text-muted font-semibold">የአጠቃላይ ምዘና አማካይ</div>
                  </div>
                </div>

                {/* Training Need Intensity Score Bar */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>የስልጠና ፍላጎት ደረጃ (Training Need Intensity)</span>
                    <span className="font-bold text-brand-blue">{needPct}% ({isHigh ? 'በጣም ከፍተኛ ፍላጎት' : isMedium ? 'መካከለኛ ፍላጎት' : 'ዝቅተኛ ፍላጎት'})</span>
                  </div>
                  <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${needPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 3 ANALYTICS: Recommended Additional Directives */}
      {/* ========================================== */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <IconCheckbox className="text-brand-blue" size={22} />
            <h3 className="text-base font-extrabold text-text-primary">
              Section 3 Analytics: በሰልጣኞች በብዛት የተጠየቁ ከፍተኛ 5 ተጨማሪ የስልጠና መመሪያዎች (Top 5 Most Requested)
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg">
            ክፍል 3 (Top 5)
          </span>
        </div>

        {additionalDirectivesStats.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalDirectivesStats.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-surface-secondary/20 border border-border/40 space-y-3 hover:bg-surface-secondary/50 hover:border-brand-blue/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded border border-brand-blue/20 font-mono">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-semibold text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border/30">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs font-black text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-lg border border-brand-blue/20 shrink-0">
                      {item.count} ሰዎች ({item.percentage}%)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-extrabold text-text-primary leading-snug" title={item.title}>
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Demand Intensity Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>የተጠያቂነት ደረጃ (Demand Rate)</span>
                      <span className="font-bold text-brand-blue">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden border border-border/30">
                      <div
                        className="h-full bg-brand-blue rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {additionalDirectivesStats.length > 5 && (
              <div className="text-[11px] text-text-muted text-center pt-2 italic">
                ከላይ የቀረቡት በሰልጣኞች በከፍተኛ ሁኔታ (Most Requested) የተመረጡት 5 መመሪያዎች ናቸው። (በአጠቃላይ ከተመረጡ {additionalDirectivesStats.length} መመሪያዎች ውስጥ)።
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic text-center py-4">
            ምንም ተጨማሪ መመሪያ አልተመረጠም።
          </p>
        )}
      </div>

      {/* ========================================== */}
      {/* SECTION 4 ANALYTICS: Preferred Method & Material */}
      {/* ========================================== */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <IconSchool className="text-brand-blue" size={22} />
            <h3 className="text-base font-extrabold text-text-primary">
              Section 4 Analytics: ተመራጭ የስልጠና መንገድና የስልጠና ቁሳቁስ/ማኑዋል ፍላጎት
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg">
            ክፍል 4
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sub-section A: Training Mode */}
          <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
              ሀ) የስልጠና አሰጣጥ መንገድ (Training Mode: በአካል vs Online)
            </h4>
            <div className="space-y-3 pt-2">
              {trainingModeStats.mode.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-brand-blue">{item.value} ሰዎች ({item.pct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-surface-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section B: Training Material */}
          <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
              ለ) የስልጠና ቁሳቁስ/ማኑዋል ፍላጎት (Training Materials)
            </h4>
            <div className="space-y-3 pt-2">
              {trainingModeStats.materials.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-brand-blue">{item.value} ሰዎች ({item.pct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-surface-secondary rounded-full overflow-hidden border border-border/30">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 5 ANALYTICS: Suggestions & "ምንም የለኝም" */}
      {/* ========================================== */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <IconMessage2 className="text-brand-blue" size={22} />
            <h3 className="text-base font-extrabold text-text-primary">
              Section 5 Analytics: የስልጠናው ሂደት ውጤታማ እንዲሆን ተጨማሪ ነገሮች
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="አስተያየት ፈልግ..."
              value={feedbackSearch}
              onChange={(e) => setFeedbackSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Quantitative Split Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase">"ምንም የለኝም" ያሉ</div>
              <div className="text-2xl font-black text-amber-700">{qualitativeStats.noSuggestionsCount} ሰዎች</div>
            </div>
            <div className="text-lg font-black text-amber-600 bg-white/40 px-3 py-1 rounded-xl">
              {qualitativeStats.noSuggestionsPct}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-brand-blue uppercase">ተጨማሪ አስተያየት የጻፉ</div>
              <div className="text-2xl font-black text-brand-blue">{qualitativeStats.withFeedbackCount} ሰዎች</div>
            </div>
            <div className="text-lg font-black text-brand-blue bg-white/40 px-3 py-1 rounded-xl">
              {qualitativeStats.withFeedbackPct}%
            </div>
          </div>
        </div>

        {/* Active Suggestions Cards Feed */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
            የተሰጡ ተጨማሪ አስተያየቶች እና ጥቆማዎች ({qualitativeStats.feedbacks.length}):
          </h4>
          {qualitativeStats.feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {qualitativeStats.feedbacks.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-surface-secondary/30 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-primary">{f.name}</span>
                    <span className="text-[10px] font-semibold text-text-muted bg-surface-primary px-2 py-0.5 rounded border border-border/40">
                      {f.region} / {f.zone}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed bg-surface-primary/70 p-3 rounded-lg border border-border/30">
                    "{f.text}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic text-center py-4">
              ምንም የሚዛመድ የተጻፈ አስተያየት አልተገኘም።
            </p>
          )}
        </div>
      </div>

      {/* Hidden Official PDF Document Template for Clean Printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1100px' }}>
        <SletenaReportPdfTemplate
          needSubmissions={filteredSubmissions}
          satisfactionSubmissions={[]}
          category={category}
          reportTitle={category ? `የስልጠና ፍላጎት ሪፖርት - ${category.title}` : "የስልጠና ፍላጎት እና ክፍተት አጠቃላይ ሪፖርት"}
        />
      </div>
    </div>
  );
};
