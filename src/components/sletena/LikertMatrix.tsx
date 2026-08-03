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
  1: { label: '1 - በጣም ዝቅተኛ', desc: 'ከፍተኛ የስልጠና እና የእውቀት ክፍተት ያለበት' },
  2: { label: '2 - ማሻሻያ የሚፈልግ', desc: 'ተጨማሪ ስልጠና የሚያስፈልገው' },
  3: { label: '3 - መካከለኛ', desc: 'መሰረታዊ የስራ እውቀት ያለው' },
  4: { label: '4 - ከፍተኛ', desc: 'ጥሩ የስራ አፈፃፀም ብቃት ያለው' },
  5: { label: '5 - እጅግ በጣም ከፍተኛ', desc: 'ሙሉ ብቃት እና የላቀ አፈፃፀም ያለው' },
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
              2. የ27ቱ ፍተሻ መመሪያዎች የብቃት ምዘና (ከ INS-01 እስከ INS-27)
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            እያንዳንዱን የፌደራል ፍተሻ መመሪያ ከ 1 (በጣም ዝቅተኛ) እስከ 5 (እጅግ በጣም ከፍተኛ) የብቃት ደረጃ ይመዝኑ።
          </p>
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
            <p className="text-[10px] text-text-muted hidden sm:block">{LIKERT_LABELS[score].desc}</p>
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
              className={`p-4 rounded-xl border transition-all ${
                currentRating > 0
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

                {/* Likert 1-5 Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = currentRating === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => onRatingChange(directive.id, score)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-blue text-white shadow-md ring-2 ring-brand-blue/30 scale-105'
                            : 'bg-surface-secondary/70 text-text-secondary hover:bg-surface-secondary border border-border/50'
                        }`}
                        title={LIKERT_LABELS[score].desc}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
