'use client';

import React, { useState } from 'react';
import { TrainingCategory } from '@/types/sletena';
import { formatECDate } from '@/lib/date-formatter';
import {
  IconCopy,
  IconCheck,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconSearch,
  IconStar,
  IconShare,
  IconFileAnalytics,
} from '@tabler/icons-react';

interface SatisfactionManagementTableProps {
  categories: TrainingCategory[];
  onSelectCategory: (category: TrainingCategory) => void;
  onCreateCategory?: (newCategory: Omit<TrainingCategory, 'id' | 'submittersCount' | 'shareableLink'>) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const SatisfactionManagementTable: React.FC<SatisfactionManagementTableProps> = ({
  categories,
  onSelectCategory,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredCategories = categories.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShareableLink = (category: TrainingCategory) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://icods.raey.work';
    return `${origin}/sletena/erkata?cat=${category.id}`;
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
          text: `የድህረ-ስልጠና የዕርካታ መሙያ ቅጽ: ${category.title}`,
          url: link,
        });
        setSharedId(category.id);
        setTimeout(() => setSharedId(null), 2000);
        return;
      } catch (err) {
        // Fallback to clipboard copy
      }
    }
    navigator.clipboard.writeText(link);
    setSharedId(category.id);
    setTimeout(() => setSharedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onCreateCategory) return;

    onCreateCategory({
      title: newTitle.trim(),
      description: newDesc.trim(),
      dateCreated: new Date().toISOString().split('T')[0],
      isActive: true,
      categoryType: 'SATISFACTION',
    });

    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <IconStar className="text-purple-500 fill-purple-500/20" size={24} />
            የድህረ-ስልጠና የዕርካታ ቅጾች ማስተዳደሪያ (Post-Training Satisfaction Forms)
          </h2>
          <p className="text-xs text-text-muted mt-1">
            ስልጠና ከተጠናቀቀ በኋላ ተሳታፊዎች የአሰልጣኞች፣ የይዘት እና የአደረጃጀት ዕርካታቸውን የሚመዝኑበት ቅጽ ይፍጠሩ እና ሊንክ ሼር ያድርጉ::
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="የዕርካታ ቅጽ ፈልግ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-purple-500 transition-all w-60"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <IconPlus size={16} />
            <span>አዲስ የዕርካታ ቅጽ ፍጠር</span>
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
              <th className="py-3.5 px-4 text-center">የምዘና ተሳታፊዎች</th>
              <th className="py-3.5 px-4 text-center">ሁኔታ</th>
              <th className="py-3.5 px-4 text-right">ተግባራት (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  ምንም የዕርካታ ቅጽ አልተገኘም።
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-secondary/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-primary flex items-center gap-2">
                      <span>{cat.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        ⭐ የዕርካታ ምዘና
                      </span>
                    </div>
                    <div className="text-[11px] text-text-muted line-clamp-1 mt-0.5">{cat.description}</div>
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">{formatECDate(cat.dateCreated)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {cat.submittersCount} ተሳታፊዎች
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      ንቁ
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Primary Action: Detailed Report */}
                      <button
                        onClick={() => onSelectCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        title="የዚህን የዕርካታ ቅጽ ዝርዝር ሪፖርት ተመልከት"
                      >
                        <IconFileAnalytics size={15} />
                        <span>ዝርዝር ሪፖርት</span>
                      </button>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(cat)}
                        className="p-1.5 rounded-lg bg-surface-secondary text-text-secondary hover:text-purple-600 border border-border/40 transition-all cursor-pointer"
                        title="የቅጹን የሕዝብ ሊንክ ኮፒ ያድርጉ"
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

                      {/* Delete Form */}
                      {onDeleteCategory && (
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-surface-secondary transition-all cursor-pointer"
                          title="ቅጹን ሰርዝ"
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating New Satisfaction Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary border border-border/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-text-primary">አዲስ የድህረ-ስልጠና የዕርካታ ቅጽ መፍጠሪያ</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">የስልጠናው ርዕስ *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ምሳሌ: የብሔራዊ ፍተሻ ተቆጣጣሪዎች የድህረ-ስልጠና ዕርካታ..."
                  className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">መግለጫ / አላማ</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="የስልጠናውን አጠቃላይ የዕርካታ ሁኔታ ለመገምገም..."
                  className="w-full px-3 py-2 text-xs bg-surface-secondary/60 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary cursor-pointer"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  ቅጹን ፍጠር
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
