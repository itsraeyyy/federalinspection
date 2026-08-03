'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DataManagementTable } from '@/components/sletena/DataManagementTable';
import { SubmissionForm } from '@/components/sletena/SubmissionForm';
import { TrainingCategory, SletenaSubmission } from '@/types/sletena';
import { INITIAL_TRAINING_CATEGORIES } from '@/data/sletenaDirectives';
import { IconForms } from '@tabler/icons-react';

export default function YesltenaFlagotPage() {
  const [categories, setCategories] = useState<TrainingCategory[]>(INITIAL_TRAINING_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);

  const handleCreateCategory = (
    newCategoryData: Omit<TrainingCategory, 'id' | 'submittersCount' | 'shareableLink'>
  ) => {
    const newId = `cat-${Date.now()}`;
    const newCategory: TrainingCategory = {
      ...newCategoryData,
      id: newId,
      submittersCount: 0,
      shareableLink: `https://icodis.gov.et/sletena/submit?cat=${newId}`,
    };
    setCategories((prev) => [newCategory, ...prev]);
  };

  const handleUpdateCategory = (updatedCategory: TrainingCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
    );
    if (selectedCategory?.id === updatedCategory.id) {
      setSelectedCategory(updatedCategory);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
    }
  };

  const handleFormSubmissionSuccess = (submission: SletenaSubmission) => {
    // Increment submitters count for this category
    setCategories((prev) =>
      prev.map((c) =>
        c.id === submission.categoryId ? { ...c, submittersCount: c.submittersCount + 1 } : c
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
              <span className="text-2xl">📚</span>
              <h1 className="text-xl font-extrabold text-text-primary">የስልጠና ፍላጎት</h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              የአመራር እና ሰራተኞች የስልጠና ፍላጎት መሙያ እና ማስተዳደሪያ ፖርታል (ከ INS-01 እስከ INS-27)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl border border-brand-blue/20">
            <IconForms size={16} />
            <span>ነባር የስልጠና ዘርፎች: {categories.length}</span>
          </div>
        </div>

        {/* Dynamic View Switch: Table vs Active Submission Form */}
        {selectedCategory ? (
          <SubmissionForm
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
            onSubmitSuccess={handleFormSubmissionSuccess}
          />
        ) : (
          <DataManagementTable
            categories={categories}
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
