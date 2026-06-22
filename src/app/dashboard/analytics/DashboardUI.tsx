"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Monitor, Link as LinkIcon, FileText, ArrowUpRight, ArrowDownRight, Smartphone, Tablet, Laptop, BarChart3, Calendar, Clock, Loader2, Activity } from "lucide-react";

interface AnalyticsData {
  total_views: number;
  unique_visitors: number;
  bounce_rate: number;
  session_duration: string;
  time_series: { date: string; views: number; unique: number; bounce_rate: number; duration_seconds: number }[];
  top_pages: { path: string; views: number }[];
  entry_pages: { path: string; views: number }[];
  exit_pages: { path: string; views: number }[];
  top_referrers: { referrer: string; views: number }[];
  devices: { device_type: string; views: number }[];
  locations: { country: string; views: number }[];
}

export default function DashboardUI({ initialData, currentRange }: { initialData: AnalyticsData, currentRange: string }) {
  const router = useRouter();
  const [chartType] = useState<"area" | "bar">("bar");
  const [pagesTab, setPagesTab] = useState<"Pages" | "Entry" | "Exit">("Pages");
  const [activeMetric, setActiveMetric] = useState<"views" | "unique" | "bounce" | "duration">("views");

  const handleRangeChange = (value: string) => {
    router.push(`/dashboard/analytics?range=${value}`);
  };

  const chartData = useMemo(() => {
    if (!initialData.time_series) return [];
    return initialData.time_series.map((item) => {
      const dateObj = new Date(item.date);
      const label = currentRange === "24h" 
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        ...item,
        label
      };
    });
  }, [initialData.time_series, currentRange]);

  const calculateMax = (items: { views: number }[]) => {
    return items.length > 0 ? Math.max(...items.map(i => i.views)) : 1;
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'Desktop') return <Monitor className="w-3.5 h-3.5 mr-2 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    if (deviceType === 'Mobile') return <Smartphone className="w-3.5 h-3.5 mr-2 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    if (deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 mr-2 text-zinc-500 dark:text-zinc-400 shrink-0" />;
    return <Laptop className="w-3.5 h-3.5 mr-2 text-zinc-500 dark:text-zinc-400 shrink-0" />;
  };

  const ListWidget = ({ title, items, max, labelKey, colorClass, showIconFor }: { title: string, items: any[], max: number, labelKey: string, colorClass: string, showIconFor?: "device" | "country" }) => (
    <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">{title}</h3>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto max-h-[320px] p-2">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-[13px] text-zinc-500">No data available</div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map((item, i) => {
              const percentage = Math.max((item.views / max) * 100, 1);
              return (
                <li key={i} className="group relative flex flex-col justify-center px-3 py-2 text-[13px] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md transition-colors cursor-default">
                  <div className="flex items-center justify-between z-10 relative mb-1.5">
                    <div className="flex items-center truncate pr-4 text-zinc-700 dark:text-zinc-300">
                      {showIconFor === "device" && getDeviceIcon(item[labelKey])}
                      {showIconFor === "country" && <Globe className="w-3.5 h-3.5 mr-2 text-zinc-500 dark:text-zinc-400 shrink-0" />}
                      <span className="truncate">{item[labelKey] || "Unknown"}</span>
                    </div>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium font-mono text-[12px]">{item.views.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-[3px] bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden relative z-0">
                    <div 
                      className={`absolute left-0 top-0 bottom-0 rounded-full ${colorClass}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const PagesWidget = () => {
    const dataMap = {
      Pages: initialData.top_pages || [],
      Entry: initialData.entry_pages || [],
      Exit: initialData.exit_pages || []
    };
    const items = dataMap[pagesTab];
    const max = calculateMax(items);

    return (
      <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[13px] font-semibold">
            <button onClick={() => setPagesTab("Pages")} className={`transition-colors ${pagesTab === "Pages" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}>Pages</button>
            <button onClick={() => setPagesTab("Entry")} className={`transition-colors ${pagesTab === "Entry" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}>Entry</button>
            <button onClick={() => setPagesTab("Exit")} className={`transition-colors ${pagesTab === "Exit" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}>Exit</button>
          </div>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto max-h-[320px] p-2">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-[13px] text-zinc-500">No data available</div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {items.map((item, i) => {
                const percentage = Math.max((item.views / max) * 100, 1);
                return (
                  <li key={i} className="group relative flex flex-col justify-center px-3 py-2 text-[13px] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md transition-colors cursor-default">
                    <div className="flex items-center justify-between z-10 relative mb-1.5">
                      <div className="flex items-center truncate pr-4 text-zinc-700 dark:text-zinc-300">
                        <FileText className="w-3.5 h-3.5 mr-2 text-zinc-500 dark:text-zinc-400 shrink-0" />
                        <span className="truncate">{item.path || "/"}</span>
                      </div>
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium font-mono text-[12px]">{item.views.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-[3px] bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden relative z-0">
                      <div className="absolute left-0 top-0 bottom-0 rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const getChartConfig = () => {
    switch (activeMetric) {
      case "views": return { key: "views", color: "#3b82f6", bg: "bg-blue-500", name: "Page Views", format: (v: number) => v.toLocaleString() };
      case "unique": return { key: "unique", color: "#10b981", bg: "bg-emerald-500", name: "Unique Visitors", format: (v: number) => v.toLocaleString() };
      case "bounce": return { key: "bounce_rate", color: "#f43f5e", bg: "bg-rose-500", name: "Bounce Rate", format: (v: number) => `${v}%` };
      case "duration": return { key: "duration_seconds", color: "#8b5cf6", bg: "bg-purple-500", name: "Session Duration", format: (v: number) => `${Math.floor(v / 60)}m ${Math.round(v % 60)}s` };
    }
  };
  const chartConfig = getChartConfig();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Analytics
          </h1>
          <div className="hidden sm:flex items-center gap-4 text-[13px] font-medium text-zinc-500">
            <button className="text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100 pb-1">Dashboard</button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={currentRange} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-[#111111] border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm h-9 text-[13px] font-medium">
              <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-zinc-200 dark:border-zinc-800 shadow-xl text-[13px]">
              <SelectItem value="24h">Today (24h)</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Unified Metrics & Chart Card (Pirsch Style) */}
      <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
        
        {/* Metrics Header Tabs */}
        <div className="flex flex-wrap items-center border-b border-zinc-100 dark:border-zinc-800/80">
          <div 
            onClick={() => setActiveMetric("unique")}
            className={`flex-1 min-w-[120px] p-5 border-r border-zinc-100 dark:border-zinc-800/80 transition-colors cursor-pointer ${activeMetric === 'unique' ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}`}
          >
            <div className="text-[12px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5">
              Unique Visitors
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {initialData.unique_visitors.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
              </span>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveMetric("views")}
            className={`flex-1 min-w-[120px] p-5 border-r border-zinc-100 dark:border-zinc-800/80 transition-colors cursor-pointer ${activeMetric === 'views' ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}`}
          >
            <div className="text-[12px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5">
              Page Views
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {initialData.total_views.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5%
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveMetric("bounce")}
            className={`flex-1 min-w-[120px] p-5 border-r border-zinc-100 dark:border-zinc-800/80 transition-colors cursor-pointer ${activeMetric === 'bounce' ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}`}
          >
            <div className="text-[12px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5">
              Bounce Rate
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {initialData.bounce_rate}%
              </span>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center">
                <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2%
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveMetric("duration")}
            className={`flex-1 min-w-[120px] p-5 transition-colors cursor-pointer ${activeMetric === 'duration' ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}`}
          >
            <div className="text-[12px] font-medium text-zinc-500 mb-1 flex items-center gap-1.5">
              Session Duration <Clock className="w-3.5 h-3.5 ml-1 opacity-50" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {initialData.session_duration || '0m 0s'}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={0} barSize={24}>
                  <XAxis 
                    dataKey="label" 
                    axisLine={{ stroke: '#3f3f46', strokeWidth: 1 }} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11 }} 
                    dy={10} 
                    minTickGap={30}
                  />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ fill: '#27272a', opacity: 0.1 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length && payload[0].payload) {
                        const fullDate = payload[0].payload.date ? new Date(payload[0].payload.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : label;
                        return (
                          <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
                            <p className="text-[11px] font-semibold text-zinc-500 mb-2">{fullDate}</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
                                  <div className={`w-2 h-2 rounded-full ${chartConfig.bg}`} /> {chartConfig.name}
                                </span>
                                <span className="font-mono text-[12px] font-semibold">{chartConfig.format(payload[0].value as number)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey={chartConfig.key} fill="transparent" stroke={chartConfig.color} strokeWidth={1.5} radius={[2, 2, 0, 0]} />
                  <Bar dataKey={chartConfig.key} fill={chartConfig.color} opacity={0.3} radius={[2, 2, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    axisLine={{ stroke: '#3f3f46', strokeWidth: 1 }} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11 }} 
                    dy={10} 
                    minTickGap={30}
                  />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length && payload[0].payload) {
                        const fullDate = payload[0].payload.date ? new Date(payload[0].payload.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : label;
                        return (
                          <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
                            <p className="text-[11px] font-semibold text-zinc-500 mb-2">{fullDate}</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-6">
                                <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-700 dark:text-zinc-300">
                                  <div className={`w-2 h-2 rounded-full ${chartConfig.bg}`} /> {chartConfig.name}
                                </span>
                                <span className="font-mono text-[12px] font-semibold">{chartConfig.format(payload[0].value as number)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartConfig.key}
                    stroke={chartConfig.color}
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    activeDot={{ r: 5, strokeWidth: 0, fill: chartConfig.color }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Layout for details (Pirsch style 2x2 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PagesWidget />
        <ListWidget 
          title="Referrers" 
          items={initialData.top_referrers || []} 
          max={calculateMax(initialData.top_referrers || [])} 
          labelKey="referrer"
          colorClass="bg-blue-500" 
        />
        <ListWidget 
          title="Countries" 
          items={initialData.locations || []} 
          max={calculateMax(initialData.locations || [])} 
          labelKey="country"
          colorClass="bg-rose-500" 
          showIconFor="country"
        />
        <ListWidget 
          title="Devices" 
          items={initialData.devices || []} 
          max={calculateMax(initialData.devices || [])} 
          labelKey="device_type"
          colorClass="bg-purple-500" 
          showIconFor="device"
        />
      </div>

    </div>
  );
}
