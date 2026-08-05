'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SatisfactionManagementTable } from '@/components/sletena/SatisfactionManagementTable';
import { SatisfactionSubmissionForm } from '@/components/sletena/SatisfactionSubmissionForm';
import { SatisfactionReportView } from '@/components/sletena/SatisfactionReportView';
import { TrainingCategory, SatisfactionSubmission } from '@/types/sletena';
import { INITIAL_SATISFACTION_CATEGORIES, MOCK_SATISFACTION_SUBMISSIONS } from '@/data/sletenaDirectives';
import { IconStar, IconFileAnalytics, IconForms } from '@tabler/icons-react';

export default function YesltenaErkataPage() {
  const [categories, setCategories] = useState<TrainingCategory[]>(INITIAL_SATISFACTION_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'report'>('forms');
  const [submissions, setSubmissions] = useState<SatisfactionSubmission[]>(MOCK_SATISFACTION_SUBMISSIONS);

  const handleCreateCategory = (
    newCategoryData: Omit<TrainingCategory, 'id' | 'submittersCount' | 'shareableLink'>
  ) => {
    const newId = `sat-cat-${Date.now()}`;
    const newCategory: TrainingCategory = {
      ...newCategoryData,
      id: newId,
      submittersCount: 0,
      categoryType: 'SATISFACTION',
      shareableLink: `https://icods.raey.work/sletena/erkata?cat=${newId}`,
    };
    setCategories((prev) => [newCategory, ...prev]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
    }
  };

  const handleSubmissionSuccess = (newSubmission: SatisfactionSubmission) => {
    setSubmissions((prev) => [newSubmission, ...prev]);
    setCategories((prev) =>
      prev.map((c) =>
        c.id === newSubmission.categoryId ? { ...c, submittersCount: c.submittersCount + 1 } : c
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
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
          <SatisfactionSubmissionForm
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onSubmitSuccess={handleSubmissionSuccess}
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
