'use client';

import React, { useState } from 'react';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import { calculateKnowledgeGaps } from '@/lib/sletena/gapEngine';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import { formatECDate } from '@/lib/date-formatter';
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
    <div className="space-y-6">
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

        {/* Public Share Link Copy Widget */}
        <div className="flex items-center gap-2 bg-surface-secondary/70 p-2 rounded-xl border border-border/50 shrink-0">
          <span className="text-[11px] font-mono text-brand-blue truncate max-w-[220px]">
            {category.shareableLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-sm hover:bg-brand-blue/90 cursor-pointer"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            <span>{copied ? 'ኮፒ ተደርጓል' : 'የሕዝብ ሊንክ ኮፒ'}</span>
          </button>
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
            <IconFlame size={20} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{topHighNeeds.length} ርዕሶች</div>
          <div className="text-[11px] text-text-muted">በዝቅተኛ ውጤት በራስ-ሰር የተለዩ</div>
        </div>

        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">የቅጹ አማካይ ብቃት</span>
            <IconTarget size={20} className="text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{avgFormScore} / 5.0</div>
          <div className="text-[11px] text-text-muted">የአጠቃላይ መመሪያዎች አማካይ ውጤት</div>
        </div>
      </div>

      {/* Auto-Calculated High Training Needs Section */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <IconFlame className="text-amber-500" size={20} />
            በሲስተሙ በራስ-ሰር የተሰሉ ከፍተኛ የስልጠና ፍላጎቶች (Auto-Calculated High Training Needs)
          </h3>
          <span className="text-xs text-text-muted">
            (በተሳታፊዎች ዝቅተኛ የምዘና ውጤት መነሻነት በራስ-ሰር የተመረጡ)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedGaps.slice(0, 6).map((item, index) => {
            const isHigh = item.priorityFlag === 'HIGH';
            return (
              <div
                key={item.directiveId}
                className={`p-4 rounded-xl border transition-all ${
                  isHigh
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-surface-secondary/40 border-border/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-brand-blue">
                    #{index + 1} {item.directiveCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isHigh
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}
                  >
                    {isHigh ? '🔥 ከፍተኛ ፍላጎት' : '⚡ መካከለኛ ፍላጎት'}
                  </span>
                </div>
                <div className="font-bold text-xs text-text-primary line-clamp-1">{item.directiveTitle}</div>
                <div className="text-[11px] text-text-muted mt-1 flex justify-between items-center">
                  <span>አማካይ ውጤት: <strong className="text-text-primary">{item.currentScore}/5.0</strong></span>
                  <span>የክፍተት መጠን: <strong className="text-rose-500">+{item.gap}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
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
                📊 የ27ቱ መመሪያዎች የምዘና ነጥቦች (1-5 Scale)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(selectedSubmission.ratings).map(([code, score]) => (
                  <div key={code} className="bg-surface-secondary/40 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-mono font-semibold text-text-secondary">{code}:</span>
                    <span className={`font-bold ${score <= 2 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {score}/5 {score <= 2 ? '🔥' : '✓'}
                    </span>
                  </div>
                ))}
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
    </div>
  );
};
