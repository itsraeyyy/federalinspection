'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  IconUser,
  IconSchool,
  IconDevices,
  IconVideo,
  IconBook,
  IconMessage2,
  IconChevronDown,
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
  // Form Header Banner Titles
  const [formTitle, setFormTitle] = useState(
    category?.title || 'የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት የስልጠና ፍላጎት ማሰበሰቢያ ቅጽ'
  );
  const [formSubtitle, setFormSubtitle] = useState(
    category?.description || 'ጊዜዎን ሰተው ስለሚሞሉ እናመሰግናለን'
  );
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [maxWoredas, setMaxWoredas] = useState<number>(category?.maxWoredas || 14);

  // Section Header Titles
  const [sec1Title, setSec1Title] = useState('1. ጥሬ ሃቅ');
  const [sec2Title, setSec2Title] = useState('2. የስልጠና ፍላጎትና ደረጃዎን ይምረጡ');
  const [sec3Title, setSec3Title] = useState('3. ተጨማሪ የሚያስፈልጉ የስልጠና መመሪያዎች');
  const [sec4Title, setSec4Title] = useState('4. ተመራጭ የስልጠና መንገድና የስልጠና ቁሳቁስ/ማኑዋል ፍላጎት');
  const [sec5Title, setSec5Title] = useState('5. የስልጠናው ሂደት ውጤታማ እንዲሆን እንዲካተት የሚፈልጉት ተጨማሪ ነገሮች');

  // Section 1 Input Field Labels
  const [labelMemberId, setLabelMemberId] = useState('የአባልነት ቁጥር (Member ID)');
  const [labelMemberName, setLabelMemberName] = useState('ሙሉ ስም');
  const [labelContact, setLabelContact] = useState('ስልክ ቁጥር');
  const [labelMembershipLevel, setLabelMembershipLevel] = useState('ሀላፊነት ደረጃ');
  const [labelRegion, setLabelRegion] = useState('ክልል / ከተማ');
  const [labelZone, setLabelZone] = useState('ዞን / ክፍለ ከተማ');
  const [labelWoreda, setLabelWoreda] = useState('ወረዳ');

  // Section 4 Option Labels
  const [labelModePhysical, setLabelModePhysical] = useState('በአካል');
  const [labelModeOnline, setLabelModeOnline] = useState('Online');
  const [labelMaterialMedia, setLabelMaterialMedia] = useState('የቪዲዮና የድምፅ ማብራሪያዎች');
  const [labelMaterialPrint, setLabelMaterialPrint] = useState('የታተመ ሰነድ (Hard Copy)');

  // Section 5 Option Labels
  const [labelNoSuggestions, setLabelNoSuggestions] = useState('ምንም የለኝም');

  // Checked directive IDs
  const [selectedDirectiveIds, setSelectedDirectiveIds] = useState<string[]>(
    category?.selectedDirectiveIds && category.selectedDirectiveIds.length > 0
      ? category.selectedDirectiveIds
      : INSPECTION_DIRECTIVES.map((d) => d.id)
  );

  // Questions list (Directives CRUD)
  const [questions, setQuestions] = useState<FormQuestion[]>(() => {
    if (category?.questions && category.questions.length > 0) {
      return category.questions;
    }
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

  // Inline editing state for Section headers & Labels
  const [editingLabelKey, setEditingLabelKey] = useState<string | null>(null);

  // New Question Form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('የኮሚሽን መመሪያዎች');

  // Select/Unselect directive checkmark handler
  const handleToggleDirectiveCheck = (directiveId: string) => {
    const isChecked = selectedDirectiveIds.includes(directiveId);
    let updatedIds: string[];

    if (isChecked) {
      updatedIds = selectedDirectiveIds.filter((id) => id !== directiveId);
      setQuestions((prev) => prev.filter((q) => q.id !== directiveId));
    } else {
      updatedIds = [...selectedDirectiveIds, directiveId];
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

  // Add custom directive question
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const customId = `q-${Date.now()}`;
    const newQ: FormQuestion = {
      id: customId,
      code: newCode.trim() || `INS-${questions.length + 1}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategoryName,
      targetScore: 5.0,
      questionType: 'likert_1_5',
      isRequired: true,
    };

    setQuestions((prev) => [...prev, newQ]);
    setSelectedDirectiveIds((prev) => [...prev, customId]);
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
  const handleUpdateQuestion = (id: string, updatedFields: Partial<FormQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedFields } : q))
    );
    setEditingQuestionId(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Filter questions array so only checkmarked/selected directives are saved
    const activeQuestions =
      selectedDirectiveIds.length > 0
        ? questions.filter(
            (q) => selectedDirectiveIds.includes(q.id) || selectedDirectiveIds.includes(q.code)
          )
        : questions;

    const finalCategory: TrainingCategory = {
      id: category?.id || `cat-${Date.now()}`,
      title: formTitle.trim(),
      description: formSubtitle.trim(),
      dateCreated: category?.dateCreated || new Date().toISOString().split('T')[0],
      submittersCount: category?.submittersCount || 0,
      isActive,
      shareableLink: category?.shareableLink || `https://icods.raey.work/sletena/submit?cat=${Date.now()}`,
      selectedDirectiveIds,
      questions: activeQuestions,
      maxWoredas,
    };

    onSave(finalCategory);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Builder Sticky Controls Bar */}
      <div className="bg-surface-primary border border-border/50 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-30">
        <div className="flex items-center gap-2">
          <IconFileCode size={22} className="text-brand-blue" />
          <div>
            <h2 className="text-sm font-extrabold text-text-primary">
              {category ? 'የስልጠና ቅጽ ማስተካከያ (Visual Form Builder & CRUD)' : 'አዲስ የስልጠና ቅጽ መፍጠሪያ (Form Builder & CRUD)'}
            </h2>
            <p className="text-[11px] text-text-muted">
              የቅጹን ርዕሶች፣ የጥያቄዎች ዝርዝር (Directives CRUD) እና የሌብል ስሞች በቀጥታ ያስተዳድሩ::
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 mr-2">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title="የቅጹን ሁኔታ ይቀይሩ (ON = ምላሽ ይቀበላል, OFF = ይዘጋል)"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isActive ? 'ቅጹ ክፍት ነው (ON / Active)' : 'ቅጹ ተዘግቷል (OFF / Inactive)'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer"
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
        {/* ========================================== */}
        {/* HEADER LOGO BANNER (Live Replica with Edit) */}
        {/* ========================================== */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-3">
          <div className="flex items-start gap-4">
            <Image
              src="/logo.jpg"
              alt="Commission Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-white/40 shadow-sm"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              {editingLabelKey === 'formTitle' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-base font-extrabold text-slate-900 bg-white rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey(null)}
                    className="p-1.5 bg-emerald-500 text-white rounded-lg"
                  >
                    <IconCheck size={16} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-start justify-between gap-2">
                  <h1 className="text-xl sm:text-2xl font-black leading-tight">{formTitle}</h1>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('formTitle')}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-white/20 hover:bg-white/30 rounded text-white transition-all shrink-0"
                    title="ርዕስ አስተካክል"
                  >
                    <IconEdit size={16} />
                  </button>
                </div>
              )}

              {editingLabelKey === 'formSubtitle' ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-3 py-1 text-xs text-slate-900 bg-white rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey(null)}
                    className="p-1 bg-emerald-500 text-white rounded-lg"
                  >
                    <IconCheck size={14} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">{formSubtitle}</p>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('formSubtitle')}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-white/20 hover:bg-white/30 rounded text-white transition-all shrink-0"
                    title="መግለጫ አስተካክል"
                  >
                    <IconEdit size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 1 CARD: Member Info & Labels CRUD */}
        {/* ========================================== */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <IconUser className="text-brand-blue" size={20} />
              {editingLabelKey === 'sec1Title' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec1Title}
                    onChange={(e) => setSec1Title(e.target.value)}
                    className="px-2 py-1 text-xs font-bold text-text-primary bg-surface-secondary rounded border"
                  />
                  <button type="button" onClick={() => setEditingLabelKey(null)} className="p-1 text-emerald-600">
                    <IconCheck size={14} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{sec1Title}</h3>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('sec1Title')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue"
                  >
                    <IconEdit size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-secondary text-text-muted rounded">
              7 የመረጃ መስኮች (Editable Labels)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Member ID */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {labelMemberId}
              </label>
              <input
                disabled
                type="text"
                placeholder="ምሳሌ: MEM-9021"
                className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted cursor-not-allowed"
              />
            </div>

            {/* Field 2: Full Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {labelMemberName}
              </label>
              <input
                disabled
                type="text"
                placeholder="ምሳሌ: ዳዊት አበበ"
                className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted cursor-not-allowed"
              />
            </div>

            {/* Field 3: Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {labelContact}
              </label>
              <input
                disabled
                type="text"
                placeholder="ምሳሌ: 0911223344"
                className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted cursor-not-allowed"
              />
            </div>

            {/* Field 4: Membership Level */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {labelMembershipLevel}
              </label>
              <div className="relative">
                <select disabled className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted appearance-none cursor-not-allowed">
                  <option>አባል</option>
                  <option>የቤተሰብ አመራር</option>
                  <option>የህብረት አመራር</option>
                  <option>የበታች አመራር</option>
                  <option>መካከለኛ አመራር</option>
                  <option>ከፍተኛ አመራር</option>
                </select>
                <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </div>

            {/* Field 5: Region */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {labelRegion}
              </label>
              <div className="relative">
                <select disabled className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted appearance-none cursor-not-allowed">
                  <option>-- ክልል/ከተማ ይምረጡ --</option>
                </select>
                <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </div>

            {/* Field 6: Zone */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {labelZone}
              </label>
              <div className="relative">
                <select disabled className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted appearance-none cursor-not-allowed">
                  <option>-- ዞን/ክፍለ ከተማ ይምረጡ --</option>
                </select>
                <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </div>

            {/* Field 7: Woreda Dropdown Range */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-text-secondary">
                  {labelWoreda} (ለክፍለ ከተማ የሚኖሩ ወረዳዎች)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-text-muted font-bold">የወረዳዎች ብዛት፡</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxWoredas}
                    onChange={(e) => setMaxWoredas(parseInt(e.target.value) || 14)}
                    className="w-16 px-2 py-0.5 text-xs bg-surface-secondary border border-border/50 rounded-lg text-brand-blue font-black focus:outline-none focus:border-brand-blue text-center cursor-pointer"
                  />
                </div>
              </div>
              <div className="relative">
                <select disabled className="w-full px-3 py-2 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted appearance-none cursor-not-allowed">
                  <option>-- ወረዳ 01 እስከ ወረዳ {maxWoredas.toString().padStart(2, '0')} --</option>
                </select>
                <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 2 CARD: Directives Matrix & Directives CRUD */}
        {/* ========================================== */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <IconListCheck className="text-brand-blue" size={20} />
              {editingLabelKey === 'sec2Title' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec2Title}
                    onChange={(e) => setSec2Title(e.target.value)}
                    className="px-2 py-1 text-xs font-bold text-text-primary bg-surface-secondary rounded border"
                  />
                  <button type="button" onClick={() => setEditingLabelKey(null)} className="p-1 text-emerald-600">
                    <IconCheck size={14} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{sec2Title}</h3>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('sec2Title')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue"
                  >
                    <IconEdit size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingQuestion(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <IconPlus size={16} />
                <span>አዲስ መመሪያ/ጥያቄ ጨምር (Add Directive)</span>
              </button>
            </div>
          </div>

          {/* Scale Legend Display */}
          <div className="grid grid-cols-5 gap-2 p-3 bg-surface-secondary/40 border border-border/30 rounded-xl text-center text-xs font-bold text-text-primary">
            <div>1 - በጣም ዝቅተኛ</div>
            <div>2 - ዝቅተኛ</div>
            <div>3 - መካከለኛ</div>
            <div>4 - ከፍተኛ</div>
            <div>5 - በጣም ከፍተኛ</div>
          </div>

          {/* Directives Checklist Matrix ([✓] Checkmarks to include/exclude) */}
          <div className="space-y-3 bg-surface-secondary/20 p-4 border border-border/30 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-text-secondary pb-2 border-b border-border/30">
              <span>ከ27ቱ መመሪያዎች የተመረጡ: ({selectedDirectiveIds.length}/27)</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSelectAllDirectives} className="text-brand-blue hover:underline text-[11px]">
                  ሁሉንም ይምረጡ
                </button>
                <span>|</span>
                <button type="button" onClick={handleDeselectAllDirectives} className="text-red-500 hover:underline text-[11px]">
                  ሁሉንም ይሰርዙ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {INSPECTION_DIRECTIVES.map((directive) => {
                const isChecked = selectedDirectiveIds.includes(directive.id);
                return (
                  <div
                    key={directive.id}
                    onClick={() => handleToggleDirectiveCheck(directive.id)}
                    className={`flex items-start gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all select-none ${
                      isChecked
                        ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue font-semibold'
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Question Form Modal/Box */}
          {isAddingQuestion && (
            <div className="p-4 bg-brand-blue/5 border border-brand-blue/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-brand-blue">
                <span>አዲስ መመሪያ/ጥያቄ ማከያ (New Directive Entry)</span>
                <button type="button" onClick={() => setIsAddingQuestion(false)} className="text-text-muted hover:text-text-primary">
                  <IconX size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">ኮድ (Code)</label>
                  <input
                    type="text"
                    placeholder="ምሳሌ: INS-05"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">የመመሪያው ርዕስ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ምሳሌ: የፋይናንስ ቁጥጥር እና የኦዲት አፈፃፀም መመሪያ..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">መግለጫ / ዝርዝር</label>
                <input
                  type="text"
                  placeholder="የመመሪያው ዝርዝር መግለጫ..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddingQuestion(false)} className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-text-primary">
                  ሰርዝ
                </button>
                <button type="button" onClick={handleAddQuestionSubmit} className="px-4 py-1.5 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-sm">
                  መመሪያውን አክል
                </button>
              </div>
            </div>
          )}

          {/* Questions/Directives List with Full Edit/Move/Delete CRUD */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q, index) => {
              const isEditing = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-4 bg-surface-primary border border-border/50 rounded-2xl shadow-2xs space-y-2 hover:border-brand-blue/40 transition-all"
                >
                  {isEditing ? (
                    /* Inline Editing Question View */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-text-muted">ኮድ</label>
                          <input
                            type="text"
                            value={q.code}
                            onChange={(e) => handleUpdateQuestion(q.id, { code: e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-surface-secondary/50 border border-border/50 rounded-lg font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-text-muted">ርዕስ</label>
                          <input
                            type="text"
                            value={q.title}
                            onChange={(e) => handleUpdateQuestion(q.id, { title: e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-surface-secondary/50 border border-border/50 rounded-lg font-bold text-text-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-text-muted">መግለጫ</label>
                        <input
                          type="text"
                          value={q.description}
                          onChange={(e) => handleUpdateQuestion(q.id, { description: e.target.value })}
                          className="w-full px-2.5 py-1 text-xs bg-surface-secondary/50 border border-border/50 rounded-lg text-text-secondary"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(null)}
                          className="px-3.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                        >
                          አስቀምጥ
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Directive Question Card */
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-brand-blue px-2 py-0.5 bg-brand-blue/10 rounded-md border border-brand-blue/20">
                            #{index + 1} {q.code}
                          </span>
                          <span className="text-xs font-semibold text-text-muted">{q.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary leading-snug">{q.title}</h4>
                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">{q.description}</p>
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
                          className="p-1 text-text-muted hover:text-amber-600"
                          title="መመሪያውን አስተካክል"
                        >
                          <IconEdit size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-text-muted hover:text-red-500"
                          title="መመሪያውን ሰርዝ"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 3 CARD: Additional Directives Picker */}
        {/* ========================================== */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <IconCheckbox className="text-brand-blue" size={20} />
              {editingLabelKey === 'sec3Title' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec3Title}
                    onChange={(e) => setSec3Title(e.target.value)}
                    className="px-2 py-1 text-xs font-bold text-text-primary bg-surface-secondary rounded border"
                  />
                  <button type="button" onClick={() => setEditingLabelKey(null)} className="p-1 text-emerald-600">
                    <IconCheck size={14} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{sec3Title}</h3>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('sec3Title')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue"
                  >
                    <IconEdit size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-secondary text-text-muted rounded">
              ተቆልቋይ መረጣ (Dropdown Picker)
            </span>
          </div>

          <div className="relative">
            <select disabled className="w-full px-4 py-2.5 text-xs font-semibold bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted appearance-none cursor-not-allowed">
              <option>-- ተጨማሪ የስልጠና መመሪያ ይምረጡ --</option>
            </select>
            <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 4 CARD: Training Method & Materials */}
        {/* ========================================== */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <IconSchool className="text-brand-blue" size={20} />
              {editingLabelKey === 'sec4Title' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec4Title}
                    onChange={(e) => setSec4Title(e.target.value)}
                    className="px-2 py-1 text-xs font-bold text-text-primary bg-surface-secondary rounded border"
                  />
                  <button type="button" onClick={() => setEditingLabelKey(null)} className="p-1 text-emerald-600">
                    <IconCheck size={14} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{sec4Title}</h3>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('sec4Title')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue"
                  >
                    <IconEdit size={14} />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-secondary text-text-muted rounded">
              ተመራጭ መንገዶች (Radio & Checkbox)
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                ሀ) የስልጠና አሰጣጥ መንገድ (ከሁለቱ አንዱን ይምረጡ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border/40 bg-surface-secondary/20 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-border/80" />
                  <IconSchool size={18} className="text-brand-blue" />
                  <span className="text-xs font-bold text-text-primary">{labelModePhysical}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/40 bg-surface-secondary/20 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-border/80" />
                  <IconDevices size={18} className="text-brand-blue" />
                  <span className="text-xs font-bold text-text-primary">{labelModeOnline}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/30">
              <label className="block text-xs font-bold text-text-secondary uppercase mb-2">
                ለ) የስልጠና ቁሳቁስ/ማኑዋል ፍላጎት (ምልክት ያድርጉ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border/40 bg-surface-secondary/20 flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-border/80" />
                  <IconVideo size={18} className="text-brand-blue" />
                  <span className="text-xs font-bold text-text-primary">{labelMaterialMedia}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/40 bg-surface-secondary/20 flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-border/80" />
                  <IconBook size={18} className="text-brand-blue" />
                  <span className="text-xs font-bold text-text-primary">{labelMaterialPrint}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 5 CARD: Suggestions & Checkbox */}
        {/* ========================================== */}
        <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <IconMessage2 className="text-brand-blue" size={20} />
              {editingLabelKey === 'sec5Title' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sec5Title}
                    onChange={(e) => setSec5Title(e.target.value)}
                    className="px-2 py-1 text-xs font-bold text-text-primary bg-surface-secondary rounded border"
                  />
                  <button type="button" onClick={() => setEditingLabelKey(null)} className="p-1 text-emerald-600">
                    <IconCheck size={14} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{sec5Title}</h3>
                  <button
                    type="button"
                    onClick={() => setEditingLabelKey('sec5Title')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue"
                  >
                    <IconEdit size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-secondary border border-border/40 text-xs font-bold text-text-secondary">
              <div className="w-3.5 h-3.5 rounded border border-border/80 bg-surface-primary" />
              <span>{labelNoSuggestions}</span>
            </div>
          </div>

          <textarea
            disabled
            rows={3}
            placeholder="እባክዎን የስልጠናው ሂደት ውጤታማ እንዲሆን የሚረዱ ተጨማሪ ነገሮችን ወይም ሃሳቦችን እዚህ ይጻፉ..."
            className="w-full px-3.5 py-2.5 text-xs bg-surface-secondary/40 border border-border/40 rounded-xl text-text-muted cursor-not-allowed"
          />
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer"
          >
            ሰርዝ
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconDeviceFloppy size={16} />
            <span>ቅጹን አስቀምጥ (Save Form)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
