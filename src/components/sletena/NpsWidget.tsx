'use client';

import React from 'react';
import { NPSBreakdown } from '@/types/sletena';
import { IconHeartRateMonitor, IconMoodHappy, IconMoodNeutral, IconMoodSad } from '@tabler/icons-react';

interface NpsWidgetProps {
  nps: NPSBreakdown;
}

export const NpsWidget: React.FC<NpsWidgetProps> = ({ nps }) => {
  const getNpsBadge = (score: number) => {
    if (score >= 50) return { label: 'የላቀ እርካታ', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 0) return { label: 'አዎንታዊ', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' };
    if (score >= -30) return { label: 'ማሻሻያ የሚፈልግ', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
    return { label: 'ትኩረት የሚሻ', color: 'text-red-600 bg-red-500/10 border-red-500/20' };
  };

  const badge = getNpsBadge(nps.npsScore);

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <IconHeartRateMonitor className="text-brand-blue" size={22} />
            የአባላት እርካታ ደረጃ (Net Promoter Score - NPS)
          </h3>
          <p className="text-xs text-text-muted mt-1">
            ስሌት: NPS = % ደጋፊዎች (ደረጃ 5) - % ተቃዋሚዎች/ቅሬታ አቅራቢዎች (ደረጃ 1-3)::
          </p>
        </div>

        <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Main Gauge & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Gauge Card */}
        <div className="md:col-span-1 bg-surface-secondary/40 border border-border/40 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">የNPS ውጤት</span>
          <div className="text-4xl font-extrabold text-brand-blue tracking-tight">
            {nps.npsScore > 0 ? `+${nps.npsScore}` : nps.npsScore}
          </div>
          <span className="text-[11px] text-text-muted">ደረጃ: ከ -100 እስከ +100</span>
          <div className="text-[10px] font-semibold px-2.5 py-0.5 bg-surface-primary rounded-full border border-border/50 text-text-secondary">
            {nps.totalResponses} ጠቅላላ ግምገማዎች
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="md:col-span-3 space-y-4 bg-surface-secondary/20 p-4 border border-border/30 rounded-2xl">
          {/* Promoters */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                <IconMoodHappy size={16} /> ደጋፊዎች (ደረጃ 5)
              </span>
              <span className="font-bold text-text-primary">
                {nps.promotersCount} ({nps.promotersPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${nps.promotersPct}%` }}
              />
            </div>
          </div>

          {/* Passives */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600 flex items-center gap-1.5">
                <IconMoodNeutral size={16} /> ገለልተኛ (ደረጃ 4)
              </span>
              <span className="font-bold text-text-primary">
                {nps.passivesCount} (
                {nps.totalResponses > 0
                  ? ((nps.passivesCount / nps.totalResponses) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                style={{
                  width: `${
                    nps.totalResponses > 0 ? (nps.passivesCount / nps.totalResponses) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Detractors */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-red-600 flex items-center gap-1.5">
                <IconMoodSad size={16} /> ቅሬታ አቅራቢዎች (ደረጃ 1 - 3)
              </span>
              <span className="font-bold text-text-primary">
                {nps.detractorsCount} ({nps.detractorsPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full bg-red-500 transition-all duration-500 rounded-full"
                style={{ width: `${nps.detractorsPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
