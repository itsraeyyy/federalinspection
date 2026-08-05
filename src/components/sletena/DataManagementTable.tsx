'use client';

import React, { useState } from 'react';
import { TrainingCategory } from '@/types/sletena';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import { formatECDate } from '@/lib/date-formatter';
import { SletenaFormBuilder } from './SletenaFormBuilder';
import {
  IconCopy,
  IconCheck,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconFileSpreadsheet,
  IconShare,
  IconFileAnalytics,
} from '@tabler/icons-react';

interface DataManagementTableProps {
  categories: TrainingCategory[];
  onSelectCategory: (category: TrainingCategory) => void;
  onCreateCategory?: (newCategory: Omit<TrainingCategory, 'id' | 'submittersCount' | 'shareableLink'>) => void;
  onUpdateCategory?: (updatedCategory: TrainingCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const DataManagementTable: React.FC<DataManagementTableProps> = ({
  categories,
  onSelectCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  // Form Builder View Modes (Google Form Editor)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeEditingCategory, setActiveEditingCategory] = useState<TrainingCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<TrainingCategory | null>(null);

  const filteredCategories = categories.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShareableLink = (category: TrainingCategory) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://icods.raey.work';
    return `${origin}/sletena/submit?cat=${category.id}`;
  };

  const handleCopyLink = (category: TrainingCategory) => {
    const link = getShareableLink(category);
    navigator.clipboard.writeText(link);
    setCopiedId(category.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLink = async (category: TrainingCategory) => {
    const link = getShareableLink(category);
    if (navigator.share) {
      try {
        await navigator.share({
          title: category.title,
          text: `የስልጠና ፍላጎት መሙያ ቅጽ: ${category.title}`,
          url: link,
        });
        setSharedId(category.id);
        setTimeout(() => setSharedId(null), 2000);
        return;
      } catch (err) {
        // Fallback to clipboard if user cancels share dialog
      }
    }
    // Fallback to clipboard copy
    navigator.clipboard.writeText(link);
    setSharedId(category.id);
    setTimeout(() => setSharedId(null), 2000);
  };

  const handleOpenCreate = () => {
    setActiveEditingCategory(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (category: TrainingCategory) => {
    setActiveEditingCategory(category);
    setIsBuilderOpen(true);
  };

  const handleSaveForm = (savedCategory: TrainingCategory) => {
    if (activeEditingCategory && onUpdateCategory) {
      onUpdateCategory({
        ...savedCategory,
        shareableLink: getShareableLink(savedCategory),
      });
    } else if (onCreateCategory) {
      onCreateCategory({
        title: savedCategory.title,
        description: savedCategory.description,
        dateCreated: savedCategory.dateCreated,
        isActive: savedCategory.isActive,
        selectedDirectiveIds: savedCategory.selectedDirectiveIds,
        questions: savedCategory.questions,
      });
    }
    setIsBuilderOpen(false);
    setActiveEditingCategory(null);
  };

  const confirmDelete = () => {
    if (deletingCategory && onDeleteCategory) {
      onDeleteCategory(deletingCategory.id);
    }
    setDeletingCategory(null);
  };

  if (isBuilderOpen) {
    return (
      <SletenaFormBuilder
        category={activeEditingCategory}
        onSave={handleSaveForm}
        onCancel={() => {
          setIsBuilderOpen(false);
          setActiveEditingCategory(null);
        }}
      />
    );
  }

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <IconFileSpreadsheet className="text-brand-blue" size={24} />
            የስልጠና ቅጾች ማስተዳደሪያ
          </h2>
          <p className="text-xs text-text-muted mt-1">
            የስልጠና ቅጾችን መፍጠር፣ መለወጥ፣ የሕዝብ ሊንክ ኮፒ/ሼር ማድረግ እና የየቅጹን ዝርዝር ሪፖርት መመልከቻ::
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="የስልጠና ርዕስ ፈልግ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue transition-all w-60"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <IconPlus size={16} />
            <span>አዲስ የስልጠና ቅጽ</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border/40 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-secondary/50 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/40">
              <th className="py-3.5 px-4">የስልጠናው ርዕስ እና መግለጫ</th>
              <th className="py-3.5 px-4">የተፈጠረበት ቀን</th>
              <th className="py-3.5 px-4 text-center">የተሳታፊዎች ብዛት</th>
              <th className="py-3.5 px-4 text-center">ሁኔታ</th>
              <th className="py-3.5 px-4 text-right">ተግባራት (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  ምንም የስልጠና ዘርፍ አልተገኘም።
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => {
                const questionCount = cat.questions
                  ? cat.questions.length
                  : cat.selectedDirectiveIds
                  ? cat.selectedDirectiveIds.length
                  : INSPECTION_DIRECTIVES.length;

                return (
                  <tr key={cat.id} className="hover:bg-surface-secondary/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <span>{cat.title}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                          {questionCount} ጥያቄዎች/መመሪያዎች
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                        {cat.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">{formatECDate(cat.dateCreated)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        {cat.submittersCount} ተሳታፊዎች
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {cat.isActive ? 'ንቁ' : 'ቦዝ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Primary Action: Detailed Report */}
                        <button
                          onClick={() => onSelectCategory(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90 text-xs font-bold shadow-xs transition-all cursor-pointer"
                          title="የዚህን ቅጽ ዝርዝር ሪፖርት እና ተሳታፊዎች ተመልከት"
                        >
                          <IconFileAnalytics size={15} />
                          <span>ዝርዝር ሪፖርት</span>
                        </button>

                        {/* Copy Share Link */}
                        <button
                          onClick={() => handleCopyLink(cat)}
                          className="p-1.5 rounded-lg bg-surface-secondary text-text-secondary hover:text-brand-blue border border-border/40 transition-all cursor-pointer"
                          title="የሕዝብ ሊንክ ኮፒ ያድርጉ"
                        >
                          {copiedId === cat.id ? <IconCheck size={16} className="text-emerald-500" /> : <IconCopy size={16} />}
                        </button>

                        {/* Share Link */}
                        <button
                          onClick={() => handleShareLink(cat)}
                          className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer"
                          title="ሊንክ ሼር ያድርጉ"
                        >
                          {sharedId === cat.id ? <IconCheck size={16} className="text-emerald-500" /> : <IconShare size={16} />}
                        </button>

                        {/* Edit Form */}
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                          title="ቅጹን አስተካክል"
                        >
                          <IconEdit size={16} />
                        </button>

                        {/* Delete Form */}
                        {onDeleteCategory && (
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-surface-secondary transition-all cursor-pointer"
                            title="ቅጹን ሰርዝ"
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary border border-border/50 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto border border-red-500/20">
              <IconTrash size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">የስልጠና ቅጹ ይሰረዝ?</h3>
              <p className="text-xs text-text-muted mt-1">
                እርግጠኛ ነዎት የስልጠና ቅጽ <span className="font-semibold text-text-primary">"{deletingCategory.title}"</span> መሰረዝ ይፈልጋሉ?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary cursor-pointer"
              >
                ተመለስ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all cursor-pointer"
              >
                አዎ ሰርዝ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
