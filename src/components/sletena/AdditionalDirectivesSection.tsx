'use client';

import React from 'react';
import { InspectionDirective } from '@/types/sletena';
import { IconCheckbox, IconX, IconPlus, IconBooks } from '@tabler/icons-react';

interface AdditionalDirectivesSectionProps {
  directives: InspectionDirective[];
  selectedIds: string[];
  onToggleDirective: (id: string) => void;
}

export const AdditionalDirectivesSection: React.FC<AdditionalDirectivesSectionProps> = ({
  directives,
  selectedIds,
  onToggleDirective,
}) => {
  // Group directives by category for the select dropdown
  const groupedDirectives = React.useMemo(() => {
    const groups: Record<string, InspectionDirective[]> = {};
    directives.forEach((d) => {
      if (!groups[d.category]) {
        groups[d.category] = [];
      }
      groups[d.category].push(d);
    });
    return groups;
  }, [directives]);

  // Currently selected Directive objects
  const selectedDirectives = directives.filter((d) => selectedIds.includes(d.id));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      onToggleDirective(selectedId);
    }
  };

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header & Selected Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <IconCheckbox className="text-brand-blue" size={20} />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              3. ተጨማሪ የሚያስፈልጉ የስልጠና መመሪያዎች
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-1">
            ተጨማሪ የስልጠና ፍላጎት ያለባቸውን መመሪያዎች ከዝርዝር (Dropdown) ውስጥ ይምረጡ::
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-xl border border-brand-blue/20 flex items-center gap-1.5">
            <IconBooks size={16} />
            የተመረጡ: <span className="font-black text-sm">{selectedIds.length}</span>
          </span>
        </div>
      </div>

      {/* Dropdown Select Picker */}
      <div className="relative">
        <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1">
          <IconPlus size={14} className="text-brand-blue" /> ተጨማሪ መመሪያ ይምረጡ:
        </label>
        <select
          value=""
          onChange={handleSelectChange}
          className="w-full px-4 py-2.5 text-xs font-semibold bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue cursor-pointer"
        >
          <option value="">-- ተጨማሪ የስልጠና መመሪያ ይምረጡ --</option>
          {Object.entries(groupedDirectives).map(([category, items]) => (
            <optgroup key={category} label={`📂 ${category}`}>
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <option key={item.id} value={item.id}>
                    {isSelected ? '✓ ' : ''}[{item.code}] {item.title}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Selected Items Tags / Badges Display */}
      {selectedDirectives.length > 0 ? (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            የተመረጡ መመሪያዎች ዝርዝር ({selectedDirectives.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedDirectives.map((directive) => (
              <div
                key={directive.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-semibold shadow-2xs group hover:bg-brand-blue/20 transition-all"
              >
                <span className="font-bold text-[11px] bg-brand-blue/20 px-1.5 py-0.5 rounded border border-brand-blue/30">
                  {directive.code}
                </span>
                <span className="text-text-primary text-[11px] line-clamp-1 max-w-[280px]">
                  {directive.title}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleDirective(directive.id)}
                  title="አስወግድ"
                  className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-600 transition-all cursor-pointer shrink-0"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-text-muted italic pt-1">
          ምንም ተጨማሪ መመሪያ አልተመረጠም። ከላይ ካለው ተቆልቋይ ሳጥን መምረጥ ይችላሉ።
        </p>
      )}
    </div>
  );
};
