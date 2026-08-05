'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SatisfactionManagementTable } from '@/components/sletena/SatisfactionManagementTable';
import { SatisfactionSubmissionForm } from '@/components/sletena/SatisfactionSubmissionForm';
import { SatisfactionReportView } from '@/components/sletena/SatisfactionReportView';
import { TrainingCategory, SatisfactionSubmission } from '@/types/sletena';
import { INITIAL_SATISFACTION_CATEGORIES, MOCK_SATISFACTION_SUBMISSIONS } from '@/data/sletenaDirectives';
import { IconStar, IconFileAnalytics, IconForms } from '@tabler/icons-react';

import { sletenaService } from '@/services/sletena';

export default function YesltenaErkataPage() {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'report'>('forms');
  const [submissions, setSubmissions] = useState<SatisfactionSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from Supabase / Service on mount
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, subs] = await Promise.all([
          sletenaService.getSatisfactionCategories(),
          sletenaService.getSatisfactionSubmissions(),
        ]);
        setCategories(cats);
        setSubmissions(subs);
      } catch (err) {
        console.error('Error loading satisfaction data:', err);
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

  const handleDeleteCategory = async (categoryId: string) => {
    await sletenaService.deleteCategory(categoryId, 'SATISFACTION');
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
              <IconStar size={24} className="text-purple-600 fill-purple-500" />
              <h1 className="text-xl font-extrabold text-text-primary">
                የስልጠና ዕርካታ ማስተዳደሪያ
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              ስልጠና ከተሰጠ በኋላ የአሰልጣኞች፣ የይዘት እና የአደረጃጀት ዕርካታ መሙያ ቅጾች እና የድህረ-ስልጠና ትንተና ሪፖርት::
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
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconForms size={16} />
              <span>የዕርካታ ቅጾች</span>
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
              <span>የዕርካታ ሪፖርት</span>
            </button>
          </div>
        </div>

        {/* View Switcher */}
        {selectedCategory ? (
          <SatisfactionReportView
            submissions={submissions}
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
          />
        ) : activeTab === 'report' ? (
          <SatisfactionReportView submissions={submissions} />
        ) : (
          <SatisfactionManagementTable
            categories={categories}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
