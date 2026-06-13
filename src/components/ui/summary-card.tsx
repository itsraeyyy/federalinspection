import React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';

export const SummaryGroup = ({ children, title, action }: { children: React.ReactNode; title?: string, action?: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        {title && (
          <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            {title}
          </h3>
        )}
        {action}
      </div>
      <div className="bg-surface-primary/40 rounded-3xl p-2 flex items-center gap-2 relative overflow-hidden backdrop-blur-md">
        {children}
      </div>
    </div>
  );
};

export const SummaryItem = ({ 
  label, 
  value, 
  icon: Icon,
  color = 'blue',
  trend
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.FC<any>;
  color?: 'blue' | 'yellow' | 'green' | 'red';
  trend?: string;
}) => {
  const colorMap = {
    blue: 'text-brand-blue bg-brand-blue/10',
    yellow: 'text-brand-yellow bg-brand-yellow/10',
    green: 'text-success bg-success/10',
    red: 'text-danger bg-danger/10'
  };

  return (
    <div className="px-6 py-5 flex-1 flex flex-col gap-3 hover:bg-surface-primary/60 transition-colors rounded-2xl group cursor-default">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon size={20} stroke={2} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-3xl font-light text-text-primary tracking-tight">{value}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mt-1">{label}</span>
        </div>
      </div>
      {trend && (
        <div className="mt-1 ml-[52px]">
          <span className="text-[10px] font-bold px-2 py-1 bg-surface-secondary/50 rounded-md text-text-secondary">{trend}</span>
        </div>
      )}
    </div>
  );
};
