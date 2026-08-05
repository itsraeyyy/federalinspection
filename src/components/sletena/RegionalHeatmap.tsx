'use client';

import React from 'react';
import { RegionalGapMatrix } from '@/types/sletena';
import { IconMapPins } from '@tabler/icons-react';

interface RegionalHeatmapProps {
  heatmapData?: RegionalGapMatrix[];
}

const DEFAULT_HEATMAP_DATA: RegionalGapMatrix[] = [
  {
    region: 'አዲስ አበባ',
    zone: 'ዞን 01 / ክፍለ ከተማ',
    categoryGaps: {
      'Governance & Compliance': 1.2,
      'Financial Standards': 2.4,
      'Human Resources': 1.1,
      'Safety & Risk': 2.3,
      'Quality Management': 1.0,
      'Technology & Security': 2.1,
    },
    overallAvgGap: 1.68,
  },
  {
    region: 'ኦሮሚያ',
    zone: 'ምስራቅ ሸዋ',
    categoryGaps: {
      'Governance & Compliance': 0.8,
      'Financial Standards': 1.9,
      'Human Resources': 1.4,
      'Safety & Risk': 2.6,
      'Quality Management': 1.5,
      'Technology & Security': 2.4,
    },
    overallAvgGap: 1.77,
  },
  {
    region: 'አማራ',
    zone: 'ጎንደር ዞን',
    categoryGaps: {
      'Governance & Compliance': 1.7,
      'Financial Standards': 2.8,
      'Human Resources': 0.9,
      'Safety & Risk': 1.8,
      'Quality Management': 2.2,
      'Technology & Security': 1.9,
    },
    overallAvgGap: 1.88,
  },
  {
    region: 'ሲዳማ',
    zone: 'ሐዋሳ ከተማ',
    categoryGaps: {
      'Governance & Compliance': 0.7,
      'Financial Standards': 1.4,
      'Human Resources': 0.8,
      'Safety & Risk': 1.2,
      'Quality Management': 0.9,
      'Technology & Security': 1.3,
    },
    overallAvgGap: 1.05,
  },
  {
    region: 'ትግራይ',
    zone: 'መቀሌ ማዕከላዊ',
    categoryGaps: {
      'Governance & Compliance': 2.1,
      'Financial Standards': 2.7,
      'Human Resources': 1.8,
      'Safety & Risk': 2.4,
      'Quality Management': 2.1,
      'Technology & Security': 2.5,
    },
    overallAvgGap: 2.27,
  },
];

export const RegionalHeatmap: React.FC<RegionalHeatmapProps> = ({ heatmapData = DEFAULT_HEATMAP_DATA }) => {
  const categories = Object.keys(heatmapData[0]?.categoryGaps || {});

  const getHeatmapColor = (gap: number) => {
    if (gap > 2.0) {
      return {
        bg: 'bg-rose-500/15 text-rose-600 border-rose-500/30 font-bold',
        badge: 'አስቸኳይ ስልጠና የሚፈልግ',
      };
    }
    if (gap > 1.0) {
      return {
        bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-semibold',
        badge: 'መካከለኛ ስልጠና የሚፈልግ',
      };
    }
    return {
      bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold',
      badge: 'ጥሩ ብቃት ያለው',
    };
  };

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <IconMapPins className="text-brand-blue" size={22} />
            የክልሎች እና ዞኖች የስልጠና ፍላጎት ንጽጽር (Regional Training Needs Distribution)
          </h3>
          <p className="text-xs text-text-muted mt-1">
            በየክልሉ እና ዞኑ ያሉ የአባላት የስልጠና ፍላጎት ደረጃዎች በየዘርፉ የተለዩበት ንጽጽር::
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>አስቸኳይ ስልጠና የሚፈልግ</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>መካከለኛ ስልጠና የሚፈልግ</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>ጥሩ ብቃት ያለው</span>
          </div>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto border border-border/40 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-secondary/50 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/40">
              <th className="py-3.5 px-4 min-w-[160px]">ክልል / ዞን</th>
              {categories.map((cat) => (
                <th key={cat} className="py-3.5 px-3 text-center min-w-[130px]">
                  {cat}
                </th>
              ))}
              <th className="py-3.5 px-4 text-center min-w-[140px]">ጠቅላላ የብቃት ደረጃ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {heatmapData.map((row) => {
              const overallStyle = getHeatmapColor(row.overallAvgGap);
              return (
                <tr key={`${row.region}-${row.zone}`} className="hover:bg-surface-secondary/20 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-text-primary">{row.region}</div>
                    <div className="text-[11px] text-text-muted">{row.zone}</div>
                  </td>

                  {categories.map((cat) => {
                    const gapVal = row.categoryGaps[cat] ?? 0;
                    const style = getHeatmapColor(gapVal);
                    return (
                      <td key={cat} className="py-3.5 px-3 text-center">
                        <div
                          className={`py-2 px-2.5 rounded-xl border text-xs flex flex-col items-center justify-center transition-transform hover:scale-105 ${style.bg}`}
                        >
                          <span className="font-bold text-[11px]">{style.badge}</span>
                        </div>
                      </td>
                    );
                  })}

                  <td className="py-3.5 px-4 text-center">
                    <div
                      className={`py-2 px-3 rounded-xl border text-xs font-bold ${overallStyle.bg}`}
                    >
                      {overallStyle.badge}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
