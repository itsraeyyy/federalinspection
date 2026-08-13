'use client';

import React from 'react';
import { InspectionDirective } from '@/types/sletena';
import { IconCheck, IconListCheck } from '@tabler/icons-react';

interface LikertMatrixProps {
  directives: InspectionDirective[];
  ratings: Record<string, number>;
  onRatingChange: (directiveId: string, score: number) => void;
}

const LIKERT_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: '1 - በጣም ዝቅተኛ', desc: '' },
  2: { label: '2 - ዝቅተኛ', desc: '' },
  3: { label: '3 - መካከለኛ', desc: '' },
  4: { label: '4 - ከፍተኛ', desc: '' },
  5: { label: '5 - በጣም ከፍተኛ', desc: '' },
};

export const LikertMatrix: React.FC<LikertMatrixProps> = ({ directives, ratings, onRatingChange }) => {
  const ratedCount = Object.keys(ratings).filter((k) => ratings[k] >= 1 && ratings[k] <= 5).length;
  const totalCount = directives.length;
  const progressPct = Math.round((ratedCount / totalCount) * 100);

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <IconListCheck className="text-brand-blue" size={22} />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              2. የስልጠና ፍላጎትና ደረጃዎን ይምረጡ
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-text-primary">
              ተመዝግበዋል: {ratedCount} / {totalCount}
            </span>
            <div className="w-36 h-2 bg-surface-secondary rounded-full overflow-hidden mt-1 border border-border/40">
              <div
                className="h-full bg-brand-blue transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg border border-brand-blue/20">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Scale Legend */}
      <div className="grid grid-cols-5 gap-2 p-3 bg-surface-secondary/40 border border-border/30 rounded-xl text-center">
        {[1, 2, 3, 4, 5].map((score) => (
          <div key={score} className="space-y-0.5">
            <span className="text-[11px] font-bold text-text-primary">{LIKERT_LABELS[score].label}</span>
            {LIKERT_LABELS[score].desc && (
              <p className="text-[10px] text-text-muted hidden sm:block">{LIKERT_LABELS[score].desc}</p>
            )}
          </div>
        ))}
      </div>

      {/* Matrix List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {directives.map((directive) => {
          const currentRating = ratings[directive.id] || 0;
          return (
            <div
              key={directive.id}
              className={`p-4 rounded-xl border transition-all ${currentRating > 0
                ? 'bg-surface-primary border-border/60 shadow-xs'
                : 'bg-surface-secondary/20 border-border/40'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded-md border border-brand-blue/20">
                      {directive.code}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">{directive.category}</span>
                    {currentRating > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <IconCheck size={12} /> ተመዝግቧል
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">{directive.title}</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">{directive.description}</p>
                </div>

                {/* Descriptive Word Dropdown / Selection */}
                <div className="w-full md:w-auto shrink-0">
                  <select
                    value={currentRating || ''}
                    onChange={(e) => onRatingChange(directive.id, Number(e.target.value))}
                    className={`w-full md:w-72 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${currentRating === 1
                      ? 'bg-rose-500/10 text-rose-700 border-rose-500/40 ring-1 ring-rose-500/30'
                      : currentRating === 2
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/40 ring-1 ring-amber-500/30'
                        : currentRating === 3
                          ? 'bg-blue-500/10 text-blue-700 border-blue-500/40 ring-1 ring-blue-500/30'
                          : currentRating === 4
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/40 ring-1 ring-emerald-500/30'
                            : currentRating === 5
                              ? 'bg-purple-500/10 text-purple-700 border-purple-500/40 ring-1 ring-purple-500/30'
                              : 'bg-surface-primary text-text-muted border-border/60 hover:border-brand-blue'
                      }`}
                  >
                    <option value="" disabled className="text-text-muted">
                      -- የስልጠና ፍላጎት ደረጃዎን ይምረጡ --
                    </option>
                    <option value="1">1 - በጣም ዝቅተኛ</option>
                    <option value="2">2 - ዝቅተኛ</option>
                    <option value="3">3 - መካከለኛ</option>
                    <option value="4">4 - ከፍተኛ</option>
                    <option value="5">5 - በጣም ከፍተኛ</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
