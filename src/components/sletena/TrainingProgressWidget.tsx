'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IconBook } from '@tabler/icons-react';
import { GapAnalysisItem } from '@/types/sletena';

interface TrainingProgressWidgetProps {
  gapItems: GapAnalysisItem[];
}

export const TrainingProgressWidget: React.FC<TrainingProgressWidgetProps> = ({ gapItems }) => {
  // 1. Get Top 5 Trainings by Gap Percentage
  const top5Needs = [...gapItems]
    .map(item => ({
      ...item,
      gapPercent: Math.round((item.gap / item.targetScore) * 100)
    }))
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .slice(0, 5);

  // 2. Use Top 5 for the Pie Chart directly
  const totalGapSum = top5Needs.reduce((sum, item) => sum + item.gapPercent, 0);

  const mainChartData = top5Needs.map((item, idx) => {
     const colors = ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
     return {
       name: item.directiveTitle,
       value: Math.round((item.gapPercent / totalGapSum) * 100),
       actualPercent: item.gapPercent,
       color: colors[idx]
     };
  });

  const totalValue = top5Needs.length > 0 ? `${top5Needs.length} ዋና` : "0";

  return (
    <div className="bg-surface-primary border border-border/50 rounded-[2rem] p-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Main Gauge/Pie Chart Card */}
        <div className="bg-surface-secondary/40 rounded-3xl p-6 relative flex flex-col items-center justify-center border border-border/30 h-full">
          <div className="w-full text-left mb-6">
            <h4 className="font-bold text-sm text-text-primary">ዋና ዋና የስልጠና ዘርፎች (በክፍተት መጠን)</h4>
          </div>
          
          <div className="relative w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs max-w-[200px] z-50 relative">
                          <div className="font-bold text-text-primary mb-1">
                            {data.name}
                          </div>
                          <div className="text-text-secondary">
                            ክፍተት: <span className="font-bold text-brand-blue">{data.actualPercent}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={mainChartData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={2}
                  cornerRadius={4}
                >
                  {mainChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Floating Icon */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-14 h-14 bg-surface-primary rounded-full shadow-md flex items-center justify-center border-4 border-surface-secondary z-10">
              <IconBook size={24} className="text-text-secondary" />
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="text-3xl font-black text-text-primary flex items-center justify-center gap-2">
              <span>{totalValue}</span>
            </div>
            <div className="text-sm font-bold text-text-secondary mt-1">አስቸኳይ የስልጠና ርዕሶች</div>
            <p className="text-xs text-text-muted mt-3 max-w-[280px] mx-auto leading-relaxed">
              በተሰበሰበው መረጃ መሠረት ከፍተኛ የስልጠና ክፍተት (Gap) የታየባቸው ዋነኛ ዘርፎች ድርሻ::
            </p>
          </div>
        </div>

        {/* Right Side: Circular Progress List */}
        <div className="flex flex-col justify-center gap-4 py-2 pr-4">
          
          {top5Needs.map((item, index) => {
            const colors = ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];
            return (
              <ProgressRow 
                key={item.directiveId}
                value={item.gapPercent} 
                color={colors[index]} 
                label={`${item.gapPercent}%`} 
                title={item.directiveTitle.length > 40 ? item.directiveTitle.substring(0, 40) + '...' : item.directiveTitle}
                desc={`ዘርፍ: ${item.category} | ቅድሚያ ደረጃ: ${item.priorityFlag === 'HIGH' ? 'ከፍተኛ ቅድሚያ' : item.priorityFlag === 'MEDIUM' ? 'መካከለኛ ቅድሚያ' : 'ጥሩ ብቃት'}`}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
};

interface ProgressRowProps {
  value: number;
  color: string;
  label: string;
  title: string;
  desc: string;
}

const ProgressRow: React.FC<ProgressRowProps> = ({ value, color, label, title, desc }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      {/* Circle Indicator */}
      <div className="w-[60px] h-[60px] shrink-0 relative flex items-center justify-center bg-surface-primary rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-border/20">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle 
            cx="28" 
            cy="28" 
            r={radius} 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="transparent" 
            className="text-surface-secondary" 
          />
          <circle 
            cx="28" 
            cy="28" 
            r={radius} 
            stroke={color} 
            strokeWidth="4" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-text-primary">{label}</span>
      </div>
      
      {/* Text Info */}
      <div className="flex-1">
        <h5 className="font-bold text-[13px] text-text-primary">{title}</h5>
        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
};
