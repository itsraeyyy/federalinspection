import React from 'react';
import { IconTrendingUp, IconTrendingDown, IconDiscountCheckFilled } from '@tabler/icons-react';

export type AccentColor = 'yellow' | 'green' | 'purple' | 'red' | 'blue';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  substats?: { label: string; value: string | number }[];
  accentColor?: AccentColor;
  icon: React.ElementType<any>;
  badge?: string;
}

const colorMap = {
  yellow: 'var(--accent-card-yellow)',
  green: 'var(--accent-card-green)',
  purple: 'var(--accent-card-purple)',
  red: 'var(--accent-card-red)',
  blue: 'var(--brand-blue)'
};

export const StatCard = ({ 
  label, 
  value, 
  description,
  trend, 
  trendDirection = 'up',
  substats = [],
  accentColor = 'blue', 
  icon: Icon,
  badge
}: StatCardProps) => {
  const accentHex = colorMap[accentColor];

  return (
    <div className="premium-card p-5 flex flex-col justify-between min-h-[140px] group bg-surface-primary/60 hover:bg-surface-primary/90 border-border/40 transition-all duration-300 hover:shadow-lg">
      {/* Left Edge Stripe */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ 
          background: `repeating-linear-gradient(-45deg, ${accentHex}, ${accentHex} 4px, color-mix(in srgb, ${accentHex} 70%, black) 4px, color-mix(in srgb, ${accentHex} 70%, black) 8px)`
        }}
      />
      
      {/* Background glow based on accent */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none"
        style={{ backgroundColor: accentHex }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10 pl-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</span>
          <div className="text-3xl sm:text-4xl font-light tracking-tight text-text-primary flex items-baseline gap-1.5 mt-1.5">
            {value}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-secondary/40 text-text-muted group-hover:text-text-primary transition-colors border border-border/30 shadow-sm">
          <Icon size={22} stroke={1.5} />
        </div>
      </div>

      {/* Bottom Row */}
      {(description || substats.length > 0 || trend || badge) && (
        <div className="flex items-center justify-between relative z-10 pl-3 mt-4 pt-3 border-t border-border/20">
          <div className="flex gap-4">
            {description ? (
              <span className="text-xs text-text-muted font-medium">{description}</span>
            ) : substats.length > 0 ? (
              substats.map((sub, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                    {idx === 0 ? <IconTrendingUp size={14} className="text-success" /> : <IconTrendingDown size={14} className="text-danger" />}
                    {sub.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted/60 font-semibold">{sub.label}</span>
                </div>
              ))
            ) : trend ? (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className={trendDirection === 'up' ? 'text-success' : 'text-danger'}>
                  {trendDirection === 'up' ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                </span>
                <span className="text-text-muted">{trend}</span>
              </div>
            ) : null}
          </div>
          
          {badge && (
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-text-secondary">
              <IconDiscountCheckFilled size={14} className="text-success/80" />
              {badge}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
