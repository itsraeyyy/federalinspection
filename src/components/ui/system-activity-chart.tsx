'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IconActivity } from '@tabler/icons-react';

const data = [
  { name: 'Mon', views: 4000, bandwidth: 2400 },
  { name: 'Tue', views: 3000, bandwidth: 1398 },
  { name: 'Wed', views: 2000, bandwidth: 9800 },
  { name: 'Thu', views: 2780, bandwidth: 3908 },
  { name: 'Fri', views: 1890, bandwidth: 4800 },
  { name: 'Sat', views: 2390, bandwidth: 3800 },
  { name: 'Sun', views: 3490, bandwidth: 4300 },
];

export const SystemActivityChart = () => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          System Activity
        </h3>
        <button className="text-[10px] font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full hover:bg-brand-blue/20 transition-colors">
          This Week
        </button>
      </div>
      <div className="bg-surface-primary/40 rounded-[2rem] p-6 pt-8 flex-1 relative overflow-hidden backdrop-blur-md border border-border/20 flex flex-col min-h-[320px]">
        
        <div className="flex gap-8 mb-6 px-2">
           <div className="flex flex-col">
              <span className="text-3xl font-light text-text-primary tracking-tight">45.2K</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mt-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue"></span> Total Views</span>
           </div>
           <div className="flex flex-col">
              <span className="text-3xl font-light text-text-primary tracking-tight">840 GB</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mt-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-yellow"></span> Bandwidth</span>
           </div>
        </div>

        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-yellow)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--brand-yellow)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface-secondary)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                labelStyle={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="views" stroke="var(--brand-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="bandwidth" stroke="var(--brand-yellow)" strokeWidth={2} fillOpacity={1} fill="url(#colorBandwidth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
