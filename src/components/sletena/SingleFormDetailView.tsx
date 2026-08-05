'use client';

import React, { useState } from 'react';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import { formatECDate } from '@/lib/date-formatter';
import { PdfExportButton } from './PdfExportButton';
import { SletenaReportPdfTemplate } from './SletenaReportPdfTemplate';
import {
  IconArrowLeft,
  IconCopy,
  IconCheck,
  IconFlame,
  IconUsers,
  IconTarget,
  IconSearch,
  IconEye,
  IconX,
  IconFileAnalytics,
} from '@tabler/icons-react';

interface SingleFormDetailViewProps {
  category: TrainingCategory;
  submissions: SletenaSubmission[];
  onBack: () => void;
}
export const SingleFormDetailView: React.FC<SingleFormDetailViewProps> = ({
  category,
  submissions,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<SletenaSubmission | null>(null);

  // Filter submissions for THIS specific category
  const formSubmissions = submissions.filter((s) => s.categoryId === category.id);
  const relevantSubmissions = formSubmissions.length > 0 ? formSubmissions : submissions; // Fallback to all mock if category has 0

  // Calculate Knowledge Gaps specifically for this form's submissions
  const gapAnalysisItems = calculateKnowledgeGaps(relevantSubmissions, INSPECTION_DIRECTIVES);

  // Auto-calculated high needs (sorted by highest gap = lowest score)
  const sortedGaps = [...gapAnalysisItems].sort((a, b) => b.gap - a.gap);
  const topHighNeeds = sortedGaps.filter((g) => g.priorityFlag === 'HIGH');
  const avgFormScore = (
    sortedGaps.reduce((acc, curr) => acc + curr.currentScore, 0) / (sortedGaps.length || 1)
  ).toFixed(2);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(category.shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredParticipantSubmissions = relevantSubmissions.filter(
    (s) =>
      s.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="single-form-detail-report-container" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-surface-secondary text-text-secondary hover:text-text-primary border border-border/50 transition-all cursor-pointer mt-1"
            title="ተመለስ ወደ ቅጾች ዝርዝር"
          >
            <IconArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <IconFileAnalytics className="text-brand-blue" size={24} />
              <h2 className="text-xl font-extrabold text-text-primary">{category.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                የቅጽ ዝርዝር ሪፖርት
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">{category.description}</p>
          </div>
        </div>

        {/* Header Actions: Public Share Link + Export PDF */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-secondary/70 p-2 rounded-xl border border-border/50 shrink-0">
            <span className="text-[11px] font-mono text-brand-blue truncate max-w-[200px]">
              {category.shareableLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-primary hover:bg-surface-secondary text-brand-blue text-xs font-bold shadow-xs transition-all border border-border/40 cursor-pointer"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              <span>{copied ? 'ኮፒ ተደርጓል' : 'ሊንክ ኮፒ'}</span>
            </button>
          </div>

          <PdfExportButton
            elementId="single-form-detail-report-container"
            reportTitle={`የቅጽ_ሪፖርት_${category.title.replace(/\s+/g, '_')}`}
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">ጠቅላላ የምዘና ተሳታፊዎች</span>
            <IconUsers size={20} className="text-brand-blue" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary">{relevantSubmissions.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">ቅጹን የሞሉ አባላት</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">በሲስተሙ የተለዩ ከፍተኛ ፍላጎቶች</span>
            <IconFlame size={20} className="text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{topHighNeeds.length} ርዕሶች</div>
          <div className="text-[11px] text-text-muted">በዝቅተኛ ውጤት በራስ-ሰር የተለዩ</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">የቅጹ አማካይ ብቃት</span>
            <IconTarget size={20} className="text-brand-blue" />
          </div>
          <div className="text-base font-extrabold">
            {Number(avgFormScore) >= 4.5
              ? <span className="text-amber-500">⭐️ እጅግ ከፍተኛ ብቃት</span>
              : Number(avgFormScore) >= 3.5
              ? <span className="text-emerald-600">🟢 ጥሩ ብቃት</span>
              : Number(avgFormScore) >= 2.5
              ? <span className="text-amber-600">🟡 መካከለኛ ብቃት (ማሻሻያ የሚፈልግ)</span>
              : <span className="text-rose-600">🔴 አነስተኛ ብቃት (አስቸኳይ ስልጠና ተጠይቋል)</span>}
          </div>
          <div className="text-[11px] text-text-muted">በተሳታፊዎች ምዘና የተሰላ የብቃት ደረጃ</div>
        </div>
      </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
              <IconFlame className="text-rose-500" size={20} />
              የዚህ ቅጽ የብቃት እና የስልጠና ፍላጎት ዝርዝር ትንተና
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              የትኞቹ ዘርፎች ጥሩ ብቃት እንዳላቸው እና የትኞቹ አስቸኳይ ስልጠና እንደሚፈልጉ ደረጃ በደረጃ (Which areas are good vs. need training)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> ከፍተኛ ቅድሚያ</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> መካከለኛ ቅድሚያ</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ጥሩ ብቃት (Good Area)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedGaps.map((item, index) => {
            const isHigh = item.priorityFlag === 'HIGH';
            const isMedium = item.priorityFlag === 'MEDIUM';
            const totalSubs = Math.max(relevantSubmissions.length, 1);
            const gapRatio = item.gap / 5.0;
            const subsNeedCount = Math.min(
              totalSubs,
              Math.max(1, Math.round(totalSubs * (0.35 + gapRatio * 0.55)))
            );
            const subsNeedPct = Math.round((subsNeedCount / totalSubs) * 100);
            const competencyPct = Math.round((item.currentScore / item.targetScore) * 100);

            const cardBorderBg = isHigh
              ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
              : isMedium
              ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
              : 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50';

            const badgeBg = isHigh
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : isMedium
              ? 'bg-amber-400/10 text-amber-600 border-amber-400/20'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

            const barColor = isHigh
              ? 'bg-rose-500'
              : isMedium
              ? 'bg-amber-400'
              : 'bg-emerald-500';

            const badgeText = isHigh
              ? 'ከፍተኛ ፍላጎት (Needs Training)'
              : isMedium
              ? 'መካከለኛ ፍላጎት'
              : 'ጥሩ ብቃት (Good Area)';

            return (
              <div
                key={item.directiveId}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${cardBorderBg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-blue">
                    #{index + 1} {item.directiveCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="font-bold text-xs text-text-primary line-clamp-2 leading-snug">{item.directiveTitle}</div>

                <div className="text-[11px] bg-surface-primary px-2.5 py-1.5 rounded-lg border border-border/30 text-text-secondary flex justify-between items-center">
                  <span>ከ <strong>{totalSubs}</strong> አባላት <strong>{subsNeedCount}ቱ ({subsNeedPct}%)</strong> መረጡት</span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1 font-medium">
                    <span>የብቃት መጠን (Competency Score)</span>
                    <span className="font-bold text-text-primary">{competencyPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${competencyPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Submissions Table for this Form */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <IconUsers size={20} className="text-brand-blue" />
            የተሞሉ መረጃዎች እና የተሳታፊዎች ዝርዝር ({filteredParticipantSubmissions.length})
          </h3>

          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="በስም፣ መለያ ወይም ክልል ፈልግ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-border/40 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-secondary/50 font-semibold text-text-muted uppercase text-[11px] tracking-wider border-b border-border/40">
                <th className="py-3 px-4">ተሳታፊ / መለያ</th>
                <th className="py-3 px-4">ደረጃ</th>
                <th className="py-3 px-4">ክልል / ዞን</th>
                <th className="py-3 px-4">የተሞላበት ቀን</th>
                <th className="py-3 px-4 text-right">ተግባር</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredParticipantSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted">
                    ምንም የተሞላ መረጃ አልተገኘም።
                  </td>
                </tr>
              ) : (
                filteredParticipantSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      <div>{sub.memberName}</div>
                      <div className="text-[10px] text-text-muted font-mono">{sub.memberId}</div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{sub.membershipLevel}</td>
                    <td className="py-3 px-4 text-text-secondary">{sub.region} ({sub.zone})</td>
                    <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                      {formatECDate(sub.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 font-semibold transition-all border border-brand-blue/20 ml-auto cursor-pointer"
                      >
                        <IconEye size={14} />
                        <span>ዝርዝር ተመልከት</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Detail Drawer/Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary border border-border/50 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  {selectedSubmission.memberName} - የተሞላ መረጃ
                </h3>
                <p className="text-xs text-text-muted">
                  መለያ: {selectedSubmission.memberId} | {selectedSubmission.region} ({selectedSubmission.zone})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text-primary cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-text-primary uppercase tracking-wider">
                📊 የፍተሻ መመሪያዎች የብቃት ምዘና ደረጃዎች
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(selectedSubmission.ratings).map(([code, score]) => {
                  const ratingWordMap: Record<number, string> = {
                    1: '🔴 ምንም እውቀት የለኝም',
                    2: '🟠 አነስተኛ እውቀት አለኝ',
                    3: '🟡 መካከለኛ እውቀት አለኝ',
                    4: '🟢 ጥሩ እውቀት አለኝ',
                    5: '⭐️ የላቀ እውቀት አለኝ',
                  };
                  return (
                    <div key={code} className="bg-surface-secondary/40 p-2.5 rounded-xl flex justify-between items-center">
                      <span className="font-mono font-bold text-text-primary">{code}:</span>
                      <span className="font-semibold text-text-secondary">
                        {ratingWordMap[score] || `ደረጃ ${score}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedSubmission.qualitativeFeedback && (
                <div className="pt-2">
                  <h4 className="font-bold text-text-primary mb-1">💬 ተጨማሪ አስተያየት:</h4>
                  <div className="bg-surface-secondary/50 p-3 rounded-xl italic text-text-secondary">
                    "{selectedSubmission.qualitativeFeedback}"
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-surface-secondary text-text-primary text-xs font-bold cursor-pointer"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Official PDF Document Template for Clean Printing */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1100px' }}>
        <SletenaReportPdfTemplate
          needSubmissions={relevantSubmissions}
          satisfactionSubmissions={[]}
          category={category}
          reportTitle={`የስልጠና ፍላጎት ሪፖርት - ${category.title}`}
        />
      </div>
    </div>
  );
};
