'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconChartBar, IconPlus, IconDeviceFloppy, IconUsers, IconMapPin, IconTrendingUp, IconBuilding } from "@tabler/icons-react";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { RegionalHeatmap } from "@/components/ui/regional-heatmap";

export default function StatisticsPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'input'>('overview');

  // Sample data
  const membersByRegion = [
    { name: 'Addis Ababa', members: 42000 },
    { name: 'Oromia', members: 38000 },
    { name: 'Amhara', members: 31000 },
    { name: 'SNNPR', members: 24000 },
    { name: 'Tigray', members: 18000 },
    { name: 'Sidama', members: 12000 },
    { name: 'Somali', members: 9000 },
    { name: 'Others', members: 16000 },
  ];

  const genderDistribution = [
    { name: 'Male', value: 58 },
    { name: 'Female', value: 42 },
  ];

  const ageGroups = [
    { name: 'Youth (18-29)', value: 35 },
    { name: 'Adult (30-49)', value: 42 },
    { name: 'Senior (50+)', value: 23 },
  ];

  const growthData = [
    { month: 'Jan', members: 168000 },
    { month: 'Feb', members: 170000 },
    { month: 'Mar', members: 172500 },
    { month: 'Apr', members: 175000 },
    { month: 'May', members: 178000 },
    { month: 'Jun', members: 180000 },
    { month: 'Jul', members: 182000 },
    { month: 'Aug', members: 185000 },
    { month: 'Sep', members: 187500 },
    { month: 'Oct', members: 190000 },
  ];

  const PIE_COLORS = ['#014BAA', '#EFB100', '#10B981', '#8B5CF6', '#F43F5E', '#F59E0B', '#06B6D4', '#6366F1'];

  const summaryStats = [
    { label: 'Total Members', value: '190,000', icon: IconUsers, color: 'brand-blue' },
    { label: 'Active Regions', value: '11', icon: IconMapPin, color: 'brand-yellow' },
    { label: 'Branch Offices', value: '47', icon: IconBuilding, color: 'success' },
    { label: 'Growth Rate', value: '+12.4%', icon: IconTrendingUp, color: 'brand-blue' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full pb-10">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Statistics & Data</h1>
            <p className="text-sm text-text-muted mt-1">Visualize membership data, geographic distribution, and organizational growth.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-primary/40 backdrop-blur-md p-1.5 rounded-2xl border border-border/20">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeSection === 'overview'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('input')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeSection === 'input'
                  ? 'bg-brand-yellow text-[#3D352E] shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              <IconPlus size={16} /> Input Data
            </button>
          </div>
        </div>

        {activeSection === 'overview' ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryStats.map((stat, i) => (
                <div key={i} className="bg-surface-primary/30 border border-border/20 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4 group hover:bg-surface-primary/50 transition-colors">
                  <div className={`w-11 h-11 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center shrink-0`}>
                    <stat.icon size={22} stroke={1.5} />
                  </div>
                  <div>
                    <div className="text-2xl font-light text-text-primary tracking-tight">{stat.value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Chart + Demographics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Membership Growth */}
              <div className="xl:col-span-2 bg-surface-primary/30 rounded-[2rem] border border-border/20 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Membership Growth</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full">2026</span>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        labelStyle={{ fontSize: '10px', color: 'var(--text-muted)' }}
                        formatter={(value: number) => [`${(value / 1000).toFixed(1)}K members`, 'Total']}
                      />
                      <Area type="monotone" dataKey="members" stroke="var(--brand-blue)" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Demographics */}
              <div className="flex flex-col gap-6">
                {/* Gender */}
                <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-6 backdrop-blur-md flex-1">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Gender Split</h3>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={genderDistribution} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value" strokeWidth={0}>
                          {genderDistribution.map((_, index) => (
                            <Cell key={`g-${index}`} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    {genderDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                        <span className="text-xs text-text-secondary">{item.name} <span className="font-bold text-text-primary">{item.value}%</span></span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Age Groups */}
                <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-6 backdrop-blur-md flex-1">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Age Distribution</h3>
                  <div className="flex flex-col gap-3">
                    {ageGroups.map((group, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-text-secondary w-24 shrink-0">{group.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-surface-secondary overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${group.value}%`, backgroundColor: PIE_COLORS[i] }}></div>
                        </div>
                        <span className="text-xs font-bold text-text-primary w-8 text-right">{group.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Heatmap */}
            <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-6 backdrop-blur-md flex flex-col xl:col-span-3">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Geographic Membership Density</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Interactive Map</span>
              </div>
              <div className="w-full h-[450px]">
                <RegionalHeatmap data={membersByRegion} />
              </div>
            </div>
          </>
        ) : (
          /* Data Input Section */
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Input Statistics Data</h3>
                <button className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
                  <IconDeviceFloppy size={18} />
                  Save & Publish
                </button>
              </div>

              {/* Region Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Target Region</label>
                <select className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option>Addis Ababa</option>
                  <option>Oromia</option>
                  <option>Amhara</option>
                  <option>SNNPR</option>
                  <option>Tigray</option>
                  <option>Sidama</option>
                  <option>Somali</option>
                  <option>Afar</option>
                  <option>Benishangul-Gumuz</option>
                  <option>Gambella</option>
                  <option>Harari</option>
                </select>
              </div>

              {/* Membership Numbers */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Membership Numbers</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Total Members</span>
                    <input type="number" placeholder="e.g., 42000" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">New This Month</span>
                    <input type="number" placeholder="e.g., 1200" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Active Members</span>
                    <input type="number" placeholder="e.g., 38500" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-border/20"></div>

              {/* Demographics */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Demographics</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Male Members (%)</span>
                    <input type="number" placeholder="e.g., 58" max={100} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Female Members (%)</span>
                    <input type="number" placeholder="e.g., 42" max={100} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Youth 18-29 (%)</span>
                    <input type="number" placeholder="e.g., 35" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Adult 30-49 (%)</span>
                    <input type="number" placeholder="e.g., 42" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Senior 50+ (%)</span>
                    <input type="number" placeholder="e.g., 23" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-border/20"></div>

              {/* Geolocation */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Geolocation & Infrastructure</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Number of Branch Offices</span>
                    <input type="number" placeholder="e.g., 12" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Kebele Coverage (%)</span>
                    <input type="number" placeholder="e.g., 78" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-border/20"></div>

              {/* Additional Notes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Additional Notes & Context</label>
                <textarea placeholder="Add any additional context about this data submission, sources, or relevant notes for the reporting period..." className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors resize-none h-28 leading-relaxed"></textarea>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
