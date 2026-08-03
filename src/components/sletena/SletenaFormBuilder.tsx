'use client';

import React, { useState } from 'react';
import { FormQuestion, TrainingCategory } from '@/types/sletena';
import { INSPECTION_DIRECTIVES } from '@/data/sletenaDirectives';
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconArrowUp,
  IconArrowDown,
  IconCheck,
  IconCheckbox,
  IconSquare,
  IconDeviceFloppy,
  IconX,
  IconFileCode,
  IconListCheck,
} from '@tabler/icons-react';

interface SletenaFormBuilderProps {
  category?: TrainingCategory | null;
  onSave: (savedCategory: TrainingCategory) => void;
  onCancel: () => void;
}

export const SletenaFormBuilder: React.FC<SletenaFormBuilderProps> = ({
  category,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(category?.title || '');
  const [desc, setDesc] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  // Checked directives for training title & scope
  const [selectedDirectiveIds, setSelectedDirectiveIds] = useState<string[]>(
    category?.selectedDirectiveIds && category.selectedDirectiveIds.length > 0
      ? category.selectedDirectiveIds
      : INSPECTION_DIRECTIVES.map((d) => d.id)
  );

  // Questions list (Google Form questions CRUD)
  const [questions, setQuestions] = useState<FormQuestion[]>(() => {
    if (category?.questions && category.questions.length > 0) {
      return category.questions;
    }
    // Default initial questions from selected directive IDs or all 27
    const initialIds =
      category?.selectedDirectiveIds && category.selectedDirectiveIds.length > 0
        ? category.selectedDirectiveIds
        : INSPECTION_DIRECTIVES.map((d) => d.id);

    return INSPECTION_DIRECTIVES.filter((d) => initialIds.includes(d.id)).map((d) => ({
      id: d.id,
      code: d.code,
      title: d.title,
      description: d.description,
      category: d.category,
      targetScore: d.targetScore,
      questionType: 'likert_1_5',
      isRequired: true,
    }));
  });

  // Editing state for individual question
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // New Question Form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('Governance & Compliance');
  const [newTargetScore, setNewTargetScore] = useState(5.0);

  // Select/Unselect directive checkmark handler
  const handleToggleDirectiveCheck = (directiveId: string) => {
    const isChecked = selectedDirectiveIds.includes(directiveId);
    let updatedIds: string[];

    if (isChecked) {
      updatedIds = selectedDirectiveIds.filter((id) => id !== directiveId);
      // Also remove from questions list if deselecting
      setQuestions((prev) => prev.filter((q) => q.id !== directiveId));
    } else {
      updatedIds = [...selectedDirectiveIds, directiveId];
      // Add directive to questions list if selecting
      const found = INSPECTION_DIRECTIVES.find((d) => d.id === directiveId);
      if (found && !questions.some((q) => q.id === directiveId)) {
        setQuestions((prev) => [
          ...prev,
          {
            id: found.id,
            code: found.code,
            title: found.title,
            description: found.description,
            category: found.category,
            targetScore: found.targetScore,
            questionType: 'likert_1_5',
            isRequired: true,
          },
        ]);
      }
    }
    setSelectedDirectiveIds(updatedIds);
  };

  const handleSelectAllDirectives = () => {
    const allIds = INSPECTION_DIRECTIVES.map((d) => d.id);
    setSelectedDirectiveIds(allIds);
    setQuestions(
      INSPECTION_DIRECTIVES.map((d) => ({
        id: d.id,
        code: d.code,
        title: d.title,
        description: d.description,
        category: d.category,
        targetScore: d.targetScore,
        questionType: 'likert_1_5',
        isRequired: true,
      }))
    );
  };

  const handleDeselectAllDirectives = () => {
    setSelectedDirectiveIds([]);
    setQuestions([]);
  };

  // Add custom or preset question
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const customId = `q-${Date.now()}`;
    const newQ: FormQuestion = {
      id: customId,
      code: newCode.trim() || `Q-${questions.length + 1}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategoryName,
      targetScore: Number(newTargetScore) || 5.0,
      questionType: 'likert_1_5',
      isRequired: true,
    };

    setQuestions((prev) => [...prev, newQ]);
    setNewCode('');
    setNewTitle('');
    setNewDesc('');
    setIsAddingQuestion(false);
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setSelectedDirectiveIds((prev) => prev.filter((id) => id !== questionId));
  };

  // Move Question Up / Down
  const handleMoveQuestion = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === questions.length - 1) return;

    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setQuestions(updated);
  };

  // Save Question Edit
  const handleUpdateQuestion = (
    id: string,
    updatedFields: Partial<FormQuestion>
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q))
    );
    setEditingQuestionId(null);
  };

  // Main Form Submit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory: TrainingCategory = {
      id: category?.id || `cat-${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      dateCreated: category?.dateCreated || new Date().toISOString().split('T')[0],
      submittersCount: category?.submittersCount || 0,
      isActive,
      shareableLink: category?.shareableLink || `https://icodis.gov.et/sletena/submit?cat=${Date.now()}`,
      selectedDirectiveIds,
      questions,
    };

    onSave(finalCategory);
  };

  return (
    <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-lg space-y-6 max-w-4xl mx-auto">
      {/* Header Bar (Google Form Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <IconFileCode size={24} className="text-brand-blue" />
            <h2 className="text-xl font-bold text-text-primary">
              {category ? 'የስልጠና ቅጽ ማስተካከያ (Google Form-style Editor)' : 'አዲስ የስልጠና ቅጽ መፍጠሪያ (Google Form Builder)'}
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            የስልጠና ቅጹን ርዕስ፣ የጥያቄዎች/መመሪያዎች ዝርዝር (CRUD Questions) እና የፍተሻ መስኮች ያስተዳድሩ።
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary"
          >
            ሰርዝ
          </button>
          <button
            type="button"
            onClick={handleSaveForm}
            className="flex items-center gap-2 px-5 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconDeviceFloppy size={16} />
            <span>ቅጹን አስቀምጥ (Save Form)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveForm} className="space-y-6">
        {/* Section 1: Form Header Settings */}
        <div className="bg-surface-secondary/30 border border-border/40 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              የስልጠናው ርዕስ (Training Form Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ምሳሌ: የብሔራዊ ፍተሻ መመሪያዎች የብቃት ምዘና 2018"
              className="w-full px-4 py-2.5 text-sm bg-surface-primary border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              የቅጹ መግለጫ / መመሪያ (Form Description)
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="ለተሳታፊዎች የሚታይ መግለጫ..."
              className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="formActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-brand-blue focus:ring-brand-blue cursor-pointer"
            />
            <label htmlFor="formActiveCheck" className="text-xs font-semibold text-text-primary cursor-pointer">
              ይህ ቅጽ ንቁ (Active) ሆኖ ለተሳታፊዎች ይከፈት
            </label>
          </div>
        </div>

        {/* Section 2: Directives Selection Checkmarks Matrix ([✓] Checkmarks) */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <IconListCheck size={20} className="text-brand-blue" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                የስልጠናው ርዕስ እና መመሪያዎች መረጣ (ከ27ቱ መመሪያዎች የተመረጡ: {selectedDirectiveIds.length}/27)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllDirectives}
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                ሁሉንም ይምረጡ
              </button>
              <span className="text-text-muted">|</span>
              <button
                type="button"
                onClick={handleDeselectAllDirectives}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                ሁሉንም ይሰርዙ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-border/30 rounded-xl bg-surface-secondary/20">
            {INSPECTION_DIRECTIVES.map((directive) => {
              const isChecked = selectedDirectiveIds.includes(directive.id);
              return (
                <label
                  key={directive.id}
                  onClick={() => handleToggleDirectiveCheck(directive.id)}
                  className={`flex items-start gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                    isChecked
                      ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue font-semibold shadow-xs'
                      : 'bg-surface-primary border-border/30 text-text-secondary hover:bg-surface-secondary/50'
                  }`}
                >
                  {isChecked ? (
                    <IconCheckbox size={18} className="text-brand-blue shrink-0 mt-0.5" />
                  ) : (
                    <IconSquare size={18} className="text-text-muted shrink-0 mt-0.5" />
                  )}
                  <span className="line-clamp-2">
                    <strong className="mr-1">[{directive.code}]</strong>
                    {directive.title}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 3: Google Form Questions List (CRUD Questionnaires) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              የቅጹ ጥያቄዎች ዝርዝር ({questions.length} ጥያቄዎች የተካተቱ)
            </h3>

            <button
              type="button"
              onClick={() => setIsAddingQuestion(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 rounded-xl text-xs font-bold border border-brand-blue/20 transition-all cursor-pointer"
            >
              <IconPlus size={16} />
              <span>አዲስ ጥያቄ ጨምር (Add Question)</span>
            </button>
          </div>

          {/* New Question Modal / Inline Form */}
          {isAddingQuestion && (
            <div className="p-4 bg-brand-blue/5 border border-brand-blue/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-brand-blue">
                <span>አዲስ ጥያቄ ማከያ (New Question Entry)</span>
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">ኮድ (Code)</label>
                  <input
                    type="text"
                    placeholder="ምሳሌ: Q-01"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">የጥያቄው ርዕስ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ምሳሌ: የፋይናንስ ቁጥጥር እና ኦዲት አፈፃፀም ብቃት..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">መግለጫ / መመሪያ</label>
                <input
                  type="text"
                  placeholder="የጥያቄው ዝርዝር መግለጫ..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-text-primary"
                >
                  ሰርዝ
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestionSubmit}
                  className="px-4 py-1.5 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  ጥያቄውን አክል
                </button>
              </div>
            </div>
          )}

          {/* Questions Cards List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {questions.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border/40 rounded-2xl">
                ምንም ጥያቄ አልተካተተም። ከላይ ካለው መረጣ መመሪያዎችን ይምረጡ ወይም አዲስ ጥያቄ ይጨምሩ።
              </div>
            ) : (
              questions.map((q, index) => {
                const isEditing = editingQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className="p-4 bg-surface-primary border border-border/50 rounded-2xl shadow-xs space-y-2 hover:border-brand-blue/40 transition-all"
                  >
                    {isEditing ? (
                      /* Editing Question View */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-text-muted">ኮድ</label>
                            <input
                              type="text"
                              value={q.code}
                              onChange={(e) =>
                                handleUpdateQuestion(q.id, { code: e.target.value })
                              }
                              className="w-full px-2.5 py-1 text-xs bg-surface-secondary/50 border border-border/50 rounded-lg"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-text-muted">ርዕስ</label>
                            <input
                              type="text"
                              value={q.title}
                              onChange={(e) =>
                                handleUpdateQuestion(q.id, { title: e.target.value })
                              }
                              className="w-full px-2.5 py-1 text-xs bg-surface-secondary/50 border border-border/50 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-text-muted">መግለጫ</label>
                          <input
                            type="text"
                            value={q.description}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, { description: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs bg-surface-secondary/50 border border-border/50 rounded-lg"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="px-3 py-1 bg-brand-blue text-white rounded-lg text-xs font-semibold"
                          >
                            አስቀምጥ
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Question View (Google Form Card) */
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-blue px-2 py-0.5 bg-brand-blue/10 rounded-md border border-brand-blue/20">
                              #{index + 1} {q.code}
                            </span>
                            <span className="text-xs font-semibold text-text-muted">{q.category}</span>
                          </div>
                          <h4 className="text-xs font-bold text-text-primary">{q.title}</h4>
                          <p className="text-[11px] text-text-muted leading-relaxed">{q.description}</p>
                        </div>

                        {/* Card CRUD Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(index, 'UP')}
                            disabled={index === 0}
                            className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                            title="ወደ ላይ ውሰድ"
                          >
                            <IconArrowUp size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(index, 'DOWN')}
                            disabled={index === questions.length - 1}
                            className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                            title="ወደ ታች ውሰድ"
                          >
                            <IconArrowDown size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(q.id)}
                            className="p-1 text-text-muted hover:text-amber-500"
                            title="ጥያቄውን አስተካክል"
                          >
                            <IconEdit size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 text-text-muted hover:text-red-500"
                            title="ጥያቄውን ሰርዝ"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary"
          >
            ሰርዝ
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconCheck size={16} />
            <span>ቅጹን አስቀምጥ (Save Form)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
