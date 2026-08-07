'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DataManagementTable } from '@/components/sletena/DataManagementTable';
import { SingleFormDetailView } from '@/components/sletena/SingleFormDetailView';
import { NeedReportView } from '@/components/sletena/NeedReportView';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import { INITIAL_TRAINING_CATEGORIES, MOCK_SUBMISSIONS } from '@/data/sletenaDirectives';
import { IconForms, IconFileAnalytics, IconTarget } from '@tabler/icons-react';

import { sletenaService } from '@/services/sletena';

export default function YesltenaFlagotPage() {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'report'>('forms');
  const [submissions, setSubmissions] = useState<SletenaSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from Supabase / Service on mount
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, subs] = await Promise.all([
          sletenaService.getNeedCategories(),
          sletenaService.getNeedSubmissions(),
        ]);
        setCategories(cats);
        setSubmissions(subs);
      } catch (err) {
        console.error('Error loading sletena data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateCategory = async (
    newCategoryData: Omit<TrainingCategory, 'id' | 'submittersCount' | 'shareableLink'>
  ) => {
    const created = await sletenaService.createCategory(newCategoryData);
    setCategories((prev) => [created, ...prev]);
  };

  const handleUpdateCategory = (updatedCategory: TrainingCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)));
    if (selectedCategory?.id === updatedCategory.id) {
      setSelectedCategory(updatedCategory);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await sletenaService.deleteCategory(categoryId, 'NEED');
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <IconTarget size={24} className="text-brand-blue" />
              <h1 className="text-xl font-extrabold text-text-primary">የስልጠና ፍላጎት ማስተዳደሪያ</h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              የአመራር እና አባላት የስልጠና ፍላጎት መሙያ፣ የቅጾች ማስተዳደሪያ እና የከፍተኛ ፍላጎቶች ትንተና ሪፖርት::
            </p>
          </div>

          {/* Navigation Tabs: Forms vs Report */}
          <div className="flex items-center gap-2 bg-surface-secondary/60 p-1.5 rounded-xl border border-border/50">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveTab('forms');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'forms' && !selectedCategory
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconForms size={16} />
              <span>የስልጠና ፍላጎት ቅጾች</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveTab('report');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconFileAnalytics size={16} />
              <span>አጠቃላይ የስልጠና ፍላጎት ሪፖርት</span>
            </button>
          </div>
        </div>

        {/* View Switcher */}
        {selectedCategory ? (
          <SingleFormDetailView
            category={selectedCategory}
            submissions={submissions}
            onBack={() => setSelectedCategory(null)}
          />
        ) : activeTab === 'report' ? (
          <NeedReportView submissions={submissions} />
        ) : (
          <DataManagementTable
            categories={categories}
            submissions={submissions}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
