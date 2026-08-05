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
  IconCalendar,
  IconUsers,
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

      {/* Form Cards List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="py-12 text-center text-text-muted bg-surface-secondary/20 rounded-2xl border border-dashed border-border/50">
            ምንም የስልጠና ቅጽ አልተገኘም።
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const questionCount = cat.questions
              ? cat.questions.length
              : cat.selectedDirectiveIds
              ? cat.selectedDirectiveIds.length
              : INSPECTION_DIRECTIVES.length;

            return (
              <div
                key={cat.id}
                className="bg-surface-primary border border-border/60 hover:border-brand-blue/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 group"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/30 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-text-primary group-hover:text-brand-blue transition-colors">
                        {cat.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                        {questionCount} ጥያቄዎች/መመሪያዎች
                      </span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      cat.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {cat.isActive ? 'ንቁ' : 'ቦዝ'}
                  </span>
                </div>

                {/* Card Info & Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  {/* Badges */}
                  <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <IconCalendar size={15} className="text-text-muted" />
                      <span>የተፈጠረበት ቀን፡ <strong>{formatECDate(cat.dateCreated)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconUsers size={15} className="text-brand-blue" />
                      <span>ተሳታፊዎች፡ <strong className="text-brand-blue">{cat.submittersCount} አባላት</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Primary Action: Detailed Report */}
                    <button
                      onClick={() => onSelectCategory(cat)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      title="የዚህን ቅጽ ዝርዝር ሪፖርት እና ተሳታፊዎች ተመልከት"
                    >
                      <IconFileAnalytics size={16} />
                      <span>ዝርዝር ሪፖርት</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(cat)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-secondary text-text-secondary hover:text-brand-blue border border-border/40 text-xs font-semibold transition-all cursor-pointer"
                      title="የሕዝብ ሊንክ ኮፒ ያድርጉ"
                    >
                      {copiedId === cat.id ? <IconCheck size={16} className="text-emerald-500" /> : <IconCopy size={16} />}
                      <span>{copiedId === cat.id ? 'ኮፒ ተደርጓል' : 'ሊንክ ኮፒ'}</span>
                    </button>

                    {/* Share Link */}
                    <button
                      onClick={() => handleShareLink(cat)}
                      className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border border-brand-blue/20 transition-all cursor-pointer"
                      title="ሊንክ ሼር ያድርጉ"
                    >
                      {sharedId === cat.id ? <IconCheck size={16} className="text-emerald-500" /> : <IconShare size={16} />}
                    </button>

                    {/* Edit Form */}
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                      title="ቅጹን አስተካክል"
                    >
                      <IconEdit size={16} />
                    </button>

                    {/* Delete Form */}
                    {onDeleteCategory && (
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-surface-secondary transition-all cursor-pointer"
                        title="ቅጹን ሰርዝ"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
