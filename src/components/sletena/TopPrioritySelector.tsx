'use client';

import React from 'react';
import { InspectionDirective } from '@/types/sletena';
import { IconAlertTriangle, IconCheck, IconTarget, IconX } from '@tabler/icons-react';

interface TopPrioritySelectorProps {
  directives: InspectionDirective[];
  selectedIds: string[];
  onChange: (newSelectedIds: [string, string, string] | string[]) => void;
}

export const TopPrioritySelector: React.FC<TopPrioritySelectorProps> = ({
  directives,
  selectedIds,
  onChange,
}) => {
  const currentCount = selectedIds.length;
  const isExactThree = currentCount === 3;

  const handleSelect = (directiveId: string) => {
    if (!directiveId) return;

    if (selectedIds.includes(directiveId)) {
      // Deselect
      onChange(selectedIds.filter((id) => id !== directiveId));
    } else {
      if (currentCount >= 3) {
        return; // Restrict to 3 max
      }
      onChange([...selectedIds, directiveId]);
    }
  };

  const handleRemove = (directiveId: string) => {
    onChange(selectedIds.filter((id) => id !== directiveId));
  };

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <IconTarget className="text-amber-500" size={22} />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              3. ከፍተኛ ቅድሚያ የሚሰጣቸው 3 የስልጠና መስኮች መረጣ (ልክ 3 መመረጥ አለባቸው)
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            አስቸኳይ የስልጠና ድጋፍ እና ትኩረት የሚሹ 3 ዋና ዋና የመመሪያ መስኮችን ይምረጡ።
          </p>
        </div>

        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isExactThree
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}
          >
            {isExactThree ? <IconCheck size={16} /> : <IconAlertTriangle size={16} />}
            <span>የተመረጡ: {currentCount} / 3</span>
          </span>
        </div>
      </div>

      {/* Selected Directive Badges */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-text-secondary">
          የተመረጡ ቅድሚያዎች ({currentCount}/3):
        </label>
        {selectedIds.length === 0 ? (
          <div className="p-3 bg-surface-secondary/30 border border-dashed border-border/50 rounded-xl text-xs text-text-muted text-center">
            ምንም ቅድሚያ የሚሰጠው መስክ አልተመረጠም። እባክዎን ከታች ካለው ዝርዝር ልክ 3 ይምረጡ።
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const directive = directives.find((d) => d.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/30 rounded-xl text-xs font-semibold text-brand-blue"
                >
                  <span>
                    [{directive?.code}] {directive?.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    className="hover:text-red-500 p-0.5 rounded-md transition-colors"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection Dropdown / Quick Picker */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-text-secondary">
          ቅድሚያ የሚሰጠውን መመሪያ ለመምረጥ:
        </label>
        <select
          value=""
          disabled={currentCount >= 3}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {currentCount >= 3
              ? 'የተፈቀደው 3 ከፍተኛ ቅድሚያዎች ሞልቷል። ሌላ ለመጨመር አንዱን ይቀንሱ።'
              : '-- መመሪያ ይምረጡ --'}
          </option>
          {directives
            .filter((d) => !selectedIds.includes(d.id))
            .map((directive) => (
              <option key={directive.id} value={directive.id}>
                [{directive.code}] {directive.title} ({directive.category})
              </option>
            ))}
        </select>
      </div>

      {!isExactThree && (
        <p className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
          <IconAlertTriangle size={14} /> ቅጹን ለማስገባት ልክ 3 ቅድሚያ የሚሰጣቸውን መስኮች መምረጥ አለብዎት።
        </p>
      )}
    </div>
  );
};
