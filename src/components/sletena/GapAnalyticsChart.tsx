'use client';

import React, { useState } from 'react';
import { GapAnalysisItem } from '@/types/sletena';
import { IconAlertTriangle, IconChartBar, IconCheck, IconSearch } from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface GapAnalyticsChartProps {
  gapItems: GapAnalysisItem[];
}

export const GapAnalyticsChart: React.FC<GapAnalyticsChartProps> = ({ gapItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const categories = Array.from(new Set(gapItems.map((item) => item.category)));

  const filteredItems = gapItems.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.directiveTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.directiveCode.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || item.priorityFlag === priorityFilter;
    return matchesCat && matchesSearch && matchesPriority;
  });

  const highPriorityCount = gapItems.filter((item) => item.priorityFlag === 'HIGH').length;
  const mediumPriorityCount = gapItems.filter((item) => item.priorityFlag === 'MEDIUM').length;
  const lowPriorityCount = gapItems.filter((item) => item.priorityFlag === 'LOW').length;

  const chartData = filteredItems.map((item) => ({
    code: item.directiveCode,
    Title: item.directiveTitle,
    Target: item.targetScore,
    Current: item.currentScore,
    Gap: item.gap,
    priority: item.priorityFlag,
  }));

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & Priority Summary Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <IconChartBar className="text-brand-blue" size={22} />
            የስልጠና ፍላጎት እና የብቃት ደረጃዎች ትንተና
          </h3>
          <p className="text-xs text-text-muted mt-1">
            በተሳታፊዎች ምዘና መነሻነት በራስ-ሰር የተለዩ የስልጠና ፍላጎቶች እና የቅድሚያ ትኩረት ዘርፎች::
          </p>
        </div>

        {/* Priority Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setPriorityFilter(priorityFilter === 'HIGH' ? 'ALL' : 'HIGH')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              priorityFilter === 'ALL' || priorityFilter === 'HIGH' 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 hover:bg-rose-500/20' 
                : 'bg-surface-secondary border border-border/40 text-text-muted hover:bg-border/20'
            }`}
          >
            <IconAlertTriangle size={15} />
            <span>አስቸኳይ ስልጠና የሚፈልጉ: {highPriorityCount}</span>
          </button>

          <button 
            onClick={() => setPriorityFilter(priorityFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              priorityFilter === 'ALL' || priorityFilter === 'MEDIUM' 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 hover:bg-amber-500/20' 
                : 'bg-surface-secondary border border-border/40 text-text-muted hover:bg-border/20'
            }`}
          >
            <span>መካከለኛ ቅድሚያ ({mediumPriorityCount})</span>
          </button>

          <button 
            onClick={() => setPriorityFilter(priorityFilter === 'LOW' ? 'ALL' : 'LOW')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              priorityFilter === 'ALL' || priorityFilter === 'LOW' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20' 
                : 'bg-surface-secondary border border-border/40 text-text-muted hover:bg-border/20'
            }`}
          >
            <IconCheck size={15} />
            <span>ጥሩ ብቃት ({lowPriorityCount})</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-secondary/40 border border-border/30 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">የመመሪያ ዘርፍ:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-lg text-text-primary focus:outline-none focus:border-brand-blue"
          >
            <option value="ALL">ሁሉንም ዘርፎች ({gapItems.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="የመመሪያ ኮድ ወይም ርዕስ ፈልግ..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-lg text-text-primary focus:outline-none focus:border-brand-blue w-56"
          />
        </div>
      </div>

      {/* Recharts Bar Visualization */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="code" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const currentLevelWord =
                    data.priority === 'HIGH' ? 'ዝቅተኛ ብቃት' : data.priority === 'MEDIUM' ? 'መካከለኛ ብቃት' : 'ጥሩ ብቃት';
                  return (
                    <div className="bg-surface-primary border border-border/60 p-3 rounded-xl shadow-lg text-xs space-y-1">
                      <div className="font-bold text-text-primary">
                        [{data.code}] {data.Title}
                      </div>
                      <div className="text-text-secondary">የዒላማ ደረጃ: ከፍተኛ</div>
                      <div className="text-text-secondary">የአሁኑ ብቃት: {currentLevelWord}</div>
                      <div className="pt-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            data.priority === 'HIGH'
                              ? 'bg-red-500/20 text-red-600'
                              : data.priority === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-600'
                              : 'bg-emerald-500/20 text-emerald-600'
                          }`}
                        >
                          {data.priority === 'HIGH' ? 'ከፍተኛ ቅድሚያ' : data.priority === 'MEDIUM' ? 'መካከለኛ ቅድሚያ' : 'ጥሩ ብቃት'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Gap" fill="#ef4444" radius={[4, 4, 0, 0]} name="የስልጠና ክፍተት" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table Detailed Breakdown */}
      <div className="overflow-x-auto border border-border/40 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-secondary/50 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/40">
              <th className="py-3 px-4">የመመሪያ ኮድ</th>
              <th className="py-3 px-4">ርዕስ እና ዘርፍ</th>
              <th className="py-3 px-4 text-center">ዒላማ</th>
              <th className="py-3 px-4 text-center">የአሁኑ የብቃት ደረጃ</th>
              <th className="py-3 px-4 text-right">የቅድሚያ ደረጃ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredItems.map((item) => {
              const currentLevelWord =
                item.priorityFlag === 'HIGH' ? 'ዝቅተኛ ብቃት' : item.priorityFlag === 'MEDIUM' ? 'መካከለኛ ብቃት' : 'ጥሩ ብቃት';
              return (
                <tr key={item.directiveId} className="hover:bg-surface-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-brand-blue whitespace-nowrap">{item.directiveCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-text-primary">{item.directiveTitle}</div>
                    <div className="text-[11px] text-text-muted">{item.category}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-text-secondary">ከፍተኛ</td>
                  <td className="py-3 px-4 text-center font-medium text-text-secondary">{currentLevelWord}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.priorityFlag === 'HIGH'
                          ? 'bg-red-500/10 text-red-600 border border-red-500/30'
                          : item.priorityFlag === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      }`}
                    >
                      {item.priorityFlag === 'HIGH' && <IconAlertTriangle size={14} />}
                      {item.priorityFlag === 'HIGH' ? 'ከፍተኛ ቅድሚያ' : item.priorityFlag === 'MEDIUM' ? 'መካከለኛ ቅድሚያ' : 'ጥሩ አፈፃፀም'}
                    </span>
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
