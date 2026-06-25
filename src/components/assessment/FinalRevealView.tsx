'use client';

import { Trophy } from 'lucide-react';

export function FinalRevealView({ score }: { score: number }) {
  // Score is out of 100
  const percentage = (score / 100) * 100;

  const getClassification = (s: number) => {
    if (s > 95) return { label: 'በጣም ከፍተኛ', subLabel: '(Very High)', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };
    if (s >= 85) return { label: 'ከፍተኛ', subLabel: '(High)', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/30' };
    if (s >= 65) return { label: 'መካከለኛ', subLabel: '(Medium)', color: 'text-brand-yellow', bg: 'bg-brand-yellow/10', border: 'border-brand-yellow/30' };
    if (s >= 50) return { label: 'ዝቅተኛ', subLabel: '(Low)', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { label: 'በጣም ዝቅተኛ', subLabel: '(Very Low)', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' };
  };

  const classification = getClassification(score);

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
      <div className="premium-card max-w-md w-full p-8 text-center relative overflow-hidden shadow-xl border border-border/50">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className={`w-20 h-20 rounded-2xl ${classification.bg} ${classification.border} border flex items-center justify-center mx-auto mb-6 shadow-sm`}>
            <Trophy className={`w-10 h-10 ${classification.color}`} />
          </div>
          
          <h2 className="text-xl font-heading text-text-secondary uppercase tracking-widest mb-2">የመጨረሻ ውጤት (Final Score)</h2>
          
          <div className="text-6xl font-heading font-bold text-text-primary mb-3 flex items-baseline justify-center">
            {Number(score).toFixed(1)}
            <span className="text-2xl text-text-muted font-normal ml-2">/ 100</span>
          </div>

          <div className={`inline-flex flex-col items-center justify-center px-6 py-3 rounded-xl ${classification.bg} ${classification.border} border mb-6`}>
            <span className={`text-xl font-bold font-heading ${classification.color}`}>
              {classification.label}
            </span>
            <span className={`text-sm font-medium ${classification.color} opacity-80 mt-0.5`}>
              {classification.subLabel}
            </span>
          </div>

          <div className="w-full bg-border rounded-full h-3 mb-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-yellow to-brand-blue h-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-text-secondary leading-relaxed">
            ግምገማዎ በአመራር ቡድኑ ጸድቋል እና ተጠናቋል። ይህ የመጨረሻ ውጤትዎ ነው።
          </p>
        </div>
      </div>
    </div>
  );
}
