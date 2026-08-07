'use client';

import React, { useState } from 'react';
import { FormQuestion, TrainingCategory } from '@/types/sletena';
import { SatisfactionSubmissionForm } from './SatisfactionSubmissionForm';
import {
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconX,
  IconEye,
  IconForms,
  IconListCheck,
  IconStar,
} from '@tabler/icons-react';

interface SatisfactionFormBuilderProps {
  category?: TrainingCategory | null;
  onSave: (savedCategory: TrainingCategory) => void;
  onCancel: () => void;
}

export const SatisfactionFormBuilder: React.FC<SatisfactionFormBuilderProps> = ({
  category,
  onSave,
  onCancel,
}) => {
  // View mode: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Form Banner Headers
  const [formTitle, setFormTitle] = useState(
    category?.title || 'የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ዋና ጽ/ቤት የድህረ-ስልጠና ዕርካታ ምዘና ቅጽ'
  );
  const [formSubtitle, setFormSubtitle] = useState(
    category?.description || 'በቅርቡ በወሰዱት ስልጠና ላይ ያሎትን ዕርካታ፣ የአሰልጣኞች ብቃት እና የመስተንግዶ ሁኔታ ይገምግሙ::'
  );
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [maxWoredas, setMaxWoredas] = useState<number>(category?.maxWoredas || 14);

  // Custom Questions List
  const [questions, setQuestions] = useState<FormQuestion[]>(
    category?.questions || [
      {
        id: 'q-prep-1',
        code: '1.ሀ',
        title: 'ሀ/ ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ *',
        description: 'የስልጠና ቦታ እና የቁሳቁስ ዝግጅት ምዘና',
        category: '1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ',
        targetScore: 5.0,
        questionType: 'multiple_choice',
        isRequired: true,
      },
      {
        id: 'q-prep-2',
        code: '1.ለ',
        title: 'ለ/ ከስልጠናው ሰነድ ዝግጅት አኳያ *',
        description: 'የስልጠና ማኑዋል እና የሰነድ ዝግጅት ምዘና',
        category: '1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ',
        targetScore: 5.0,
        questionType: 'multiple_choice',
        isRequired: true,
      },
      {
        id: 'q-deliv-1',
        code: '2.ሀ',
        title: 'ሀ/ ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ *',
        description: 'የአሰልጣኞች ማብራሪያ እና ዝግጅት ምዘና',
        category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
        targetScore: 5.0,
        questionType: 'multiple_choice',
        isRequired: true,
      },
      {
        id: 'q-deliv-2',
        code: '2.ለ',
        title: 'ለ/ ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ *',
        description: 'የሰልጣኞች ተሳትፎ እና የውይይት ነጻነት ምዘና',
        category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
        targetScore: 5.0,
        questionType: 'multiple_choice',
        isRequired: true,
      },
      {
        id: 'q-deliv-3',
        code: '2.ሐ',
        title: 'ሐ/ በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ *',
        description: 'የጋራ መደምደሚያ ነጥቦች ጥራት ምዘና',
        category: '2. የስልጠና አሰጣጥና ውይይት በተመለከተ',
        targetScore: 5.0,
        questionType: 'multiple_choice',
        isRequired: true,
      },
      {
        id: 'q-text-3',
        code: '3',
        title: '3. ስልጠናዉ ላይ በመሳተፍዎ ያገኙት ተጨማሪ እውቀትና ግንዛቤ እንዴትይገልፁታል?',
        description: 'ያገኙት እውቀትና ግንዛቤ ማብራሪያ',
        category: '3. ተጨማሪ እውቀትና ግንዛቤ',
        targetScore: 5.0,
        questionType: 'text',
        isRequired: false,
      },
      {
        id: 'q-text-4',
        code: '4',
        title: '4. እርስዎ ጨምሮ ከሌሎች የስልጠና ተሳታፊዎች በቀጣይ ምን ውጤት እንጠብቅ?',
        description: 'የሚጠበቁ ውጤቶችና እንቅስቃሴዎች',
        category: '4. የሚጠበቅ ውጤት',
        targetScore: 5.0,
        questionType: 'text',
        isRequired: false,
      },
      {
        id: 'q-text-5',
        code: '5',
        title: '5. አጠቃላይ ከስልጠናው ቅድመ ዝግጅት ጀምሮ ስልጠና እስከተመራበት አግባብ በቀጣይ ቢስተካከል የሚሉት ተጨማሪ አስተያየት ካለዎት',
        description: 'ለቀጣይ የስልጠና ማሻሻያ አስተያየቶች',
        category: '5. ተጨማሪ አስተያየት',
        targetScore: 5.0,
        questionType: 'text',
        isRequired: false,
      },
    ]
  );

  // New Question Form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('2. የስልጠና አሰጣጥና ውይይት በተመለከተ');
  const [newQuestionType, setNewQuestionType] = useState<'multiple_choice' | 'text'>('multiple_choice');

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQ: FormQuestion = {
      id: `q-custom-${Date.now()}`,
      code: `Q-${questions.length + 1}`,
      title: newTitle.trim(),
      description: '',
      category: newCategoryName,
      targetScore: 5.0,
      questionType: newQuestionType,
      isRequired: true,
    };

    setQuestions((prev) => [...prev, newQ]);
    setNewTitle('');
    setIsAddingQuestion(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;

    const updatedCat: TrainingCategory = {
      id: category?.id || `sat-cat-${Date.now()}`,
      title: formTitle.trim(),
      description: formSubtitle.trim(),
      dateCreated: category?.dateCreated || new Date().toISOString().split('T')[0],
      submittersCount: category?.submittersCount || 0,
      isActive,
      categoryType: 'SATISFACTION',
      shareableLink: category?.shareableLink || `https://icods.raey.work/sletena/erkata?cat=${category?.id || `sat-cat-${Date.now()}`}`,
      questions,
      maxWoredas,
    };

    onSave(updatedCat);
  };

  const previewCategory: TrainingCategory = {
    id: category?.id || 'preview-cat',
    title: formTitle,
    description: formSubtitle,
    dateCreated: new Date().toISOString().split('T')[0],
    submittersCount: 0,
    isActive: true,
    categoryType: 'SATISFACTION',
    shareableLink: '',
    questions,
    maxWoredas,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-primary border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm sticky top-4 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
            <IconStar size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-text-primary">
                {category ? 'የዕርካታ ቅጽ ማስተካከያ (Form Editor)' : 'አዲስ የድህረ-ስልጠና የዕርካታ ቅጽ ማዘጋጃ'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                Google Forms Style
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              የስልጠና ዕርካታ ምዘና ቅጹን ርዕስ፣ መግለጫ እና ጥያቄዎች አዘጋጅተው ያትሙ::
            </p>
          </div>
        </div>

        {/* View Switcher: Editor vs Live Preview */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-secondary/60 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconForms size={16} />
              <span>ቅጽ ማዘጋጃ</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-brand-yellow text-slate-900 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconEye size={16} />
              <span>ቅድመ-ዕይታ</span>
            </button>
          </div>

          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-all cursor-pointer border border-border/40"
            title="ሰርዝ"
          >
            <IconX size={18} />
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <IconDeviceFloppy size={18} />
            <span>ቅጹን አስቀምጥ</span>
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-4">
          <div className="bg-brand-yellow/10 border border-brand-yellow/30 text-amber-800 dark:text-amber-300 rounded-xl p-3 text-xs font-semibold text-center">
            👀 ይህ ተሳታፊዎች ቅጹን ሲከፍቱ የሚያዩት የቀጥታ የሕዝብ ቅጽ ቅድመ-ዕይታ (Live Public Form Preview) ነው::
          </div>
          <SatisfactionSubmissionForm
            category={previewCategory}
            onBack={() => setActiveTab('editor')}
            onSubmitSuccess={() => {}}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card (Form Banner Title & Subtitle) */}
          <div className="bg-surface-primary border-t-8 border-t-brand-blue border-x border-b border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-brand-blue uppercase tracking-wider mb-1">
                  ለ) ዋና ዋና መጠይቆች /የዳሰሳ ጥናቶች/
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="የቅጹ ርዕስ..."
                  className="w-full text-lg sm:text-xl font-black bg-surface-secondary/40 border border-border/50 rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-muted mb-1">
                  የቅጹ መግለጫ / መመሪያ
                </label>
                <textarea
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="ለተሳታፊዎች የሚሰጥ መመሪያ..."
                  className="w-full text-xs bg-surface-secondary/40 border border-border/50 rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:border-brand-blue leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-text-muted">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue cursor-pointer"
                />
                <span className="font-semibold text-text-primary">ቅጹ ንቁ ይሁን (Accept Responses)</span>
              </label>
              <span>የጥያቄዎች ብዛት፡ <strong>{questions.length} መጠይቆች</strong></span>
            </div>
          </div>

          {/* SECTION 1: 1. ጥሬ ሃቅ DEMOGRAPHIC WOREDA SETTINGS */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-text-primary">
                  1. ጥሬ ሃቅ (የተሳታፊዎች ስነ-ህዝብ መረጃ መቼት)
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  ለዚህ ቅጽ የክፍለ ከተማ/ዞን ወረዳዎች መምረጫ ብዛት ይወስኑ::
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary">የወረዳዎች ብዛት፡</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxWoredas}
                  onChange={(e) => setMaxWoredas(parseInt(e.target.value) || 14)}
                  className="w-20 px-3 py-1 text-xs bg-surface-secondary border border-border/50 rounded-xl text-brand-blue font-black focus:outline-none focus:border-brand-blue text-center cursor-pointer"
                />
              </div>
            </div>
            <div className="text-xs text-text-muted bg-surface-secondary/40 border border-border/40 p-2.5 rounded-xl font-mono">
              Dropdown Selection Options: ወረዳ 01 እስከ ወረዳ {maxWoredas.toString().padStart(2, '0')}
            </div>
          </div>

          {/* SECTION 1 EDIT BOX */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="bg-brand-blue/10 border-l-4 border-brand-blue p-3 rounded-r-xl flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary">
                1. ከስልጠና ቅድመ ዝግጅት አኳያ ያለዎት አስተያየት በተመለከተ
              </h3>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                Dropdown Selection Fields
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-text-primary">
                  ሀ/ ከስልጠና ቦታ እና ከስልጠና ቁሳቁስ ማሟላት አኳያ *
                </label>
                <div className="flex items-center justify-between text-xs text-text-muted bg-surface-primary border border-border/60 p-2.5 rounded-lg">
                  <span>በጣም ከፍተኛ ፣ ከፍተኛ ፣ መካከለኛ ፣ ዝቅተኛ ፣ በጣም ዝቅተኛ</span>
                  <span className="text-[10px] font-extrabold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">Dropdown</span>
                </div>
              </div>

              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-text-primary">
                  ለ/ ከስልጠናው ሰነድ ዝግጅት አኳያ *
                </label>
                <div className="flex items-center justify-between text-xs text-text-muted bg-surface-primary border border-border/60 p-2.5 rounded-lg">
                  <span>በጣም ከፍተኛ ፣ ከፍተኛ ፣ መካከለኛ ፣ ዝቅተኛ ፣ በጣም ዝቅተኛ</span>
                  <span className="text-[10px] font-extrabold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">Dropdown</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 EDIT BOX */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="bg-brand-blue/10 border-l-4 border-brand-blue p-3 rounded-r-xl flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary">
                2. የስልጠና አሰጣጥና ውይይት በተመለከተ
              </h3>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                Dropdown Selection Fields (+ Other Option)
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-text-primary">
                  ሀ/ ከስልጠና ሰነድ አቀራረብና ከአሰልጣኙ ዝግጅት አኳያ *
                </label>
                <div className="flex items-center justify-between text-xs text-text-muted bg-surface-primary border border-border/60 p-2.5 rounded-lg">
                  <span>በጣም ከፍተኛ ፣ ከፍተኛ ፣ መካከለኛ ፣ ዝቅተኛ ፣ በጣም ዝቅተኛ ፣ ሌላ (Other)</span>
                  <span className="text-[10px] font-extrabold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">Dropdown + Write-in</span>
                </div>
              </div>

              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-text-primary">
                  ለ/ ከሰልጣኞች ተሳትፎና የሃሳብ ነጻነትና ጥራት አኳያ *
                </label>
                <div className="flex items-center justify-between text-xs text-text-muted bg-surface-primary border border-border/60 p-2.5 rounded-lg">
                  <span>በጣም ከፍተኛ ፣ ከፍተኛ ፣ መካከለኛ ፣ ዝቅተኛ ፣ በጣም ዝቅተኛ</span>
                  <span className="text-[10px] font-extrabold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">Dropdown</span>
                </div>
              </div>

              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-text-primary">
                  ሐ/ በተነሱ ሃሳቦች ላይ የተሰጡ የጋራ መደምደሚያ ነጥቦች አኳያ *
                </label>
                <div className="flex items-center justify-between text-xs text-text-muted bg-surface-primary border border-border/60 p-2.5 rounded-lg">
                  <span>በጣም ከፍተኛ ፣ ከፍተኛ ፣ መካከለኛ ፣ ዝቅተኛ ፣ በጣም ዝቅተኛ</span>
                  <span className="text-[10px] font-extrabold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">Dropdown</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTIONS 3, 4, 5 EDIT BOX */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="bg-brand-blue/10 border-l-4 border-brand-blue p-3 rounded-r-xl flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary">
                3፣ 4 እና 5. ክፍት አስተያየቶችና ውጤቶች (Open Text Responses)
              </h3>
              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                Paragraph Text Areas
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-1">
                <label className="block text-xs font-bold text-text-primary">
                  3. ስልጠናዉ ላይ በመሳተፍዎ ያገኙት ተጨማሪ እውቀትና ግንዛቤ እንዴትይገልፁታል?
                </label>
                <span className="text-[11px] text-text-muted block font-mono">Input Type: Textarea (Paragraph)</span>
              </div>

              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-1">
                <label className="block text-xs font-bold text-text-primary">
                  4. እርስዎ ጨምሮ ከሌሎች የስልጠና ተሳታፊዎች በቀጣይ ምን ውጤት እንጠብቅ?
                </label>
                <span className="text-[11px] text-text-muted block font-mono">Input Type: Textarea (Paragraph)</span>
              </div>

              <div className="bg-surface-secondary/30 border border-border/40 rounded-xl p-4 space-y-1">
                <label className="block text-xs font-bold text-text-primary">
                  5. አጠቃላይ ከስልጠናው ቅድመ ዝግጅት ጀምሮ ስልጠና እስከተመራበት አግባብ በቀጣይ ቢስተካከል የሚሉት ተጨማሪ አስተያየት ካለዎት
                </label>
                <span className="text-[11px] text-text-muted block font-mono">Input Type: Textarea (Paragraph)</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC CUSTOM QUESTIONS LIST & ADDER */}
          <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                  <IconListCheck size={18} className="text-brand-blue" />
                  ተጨማሪ ብጁ መጠይቆች (Custom Questions)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  ለዚህ ስልጠና ተጨማሪ ጥያቄዎችን ማከል ወይም ማስወገድ ይችላሉ::
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingQuestion(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <IconPlus size={16} />
                <span>ጥያቄ ጨምር</span>
              </button>
            </div>

            {/* Custom Question Adder Form */}
            {isAddingQuestion && (
              <form onSubmit={handleAddQuestionSubmit} className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-brand-blue">አዲስ መጠይቅ ማዘጋጃ</h4>
                <div>
                  <label className="block text-[11px] font-bold text-text-primary mb-1">የጥያቄው ርዕስ *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="ጥያቄዎን ያስገቡ..."
                    className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1">ምድብ</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1">የምላሽ አይነት</label>
                    <select
                      value={newQuestionType}
                      onChange={(e) => setNewQuestionType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-surface-primary border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue cursor-pointer"
                    >
                      <option value="multiple_choice">Dropdown (በጣም ከፍተኛ-በጣም ዝቅተኛ)</option>
                      <option value="text">Open Textarea (የፅሁፍ ምላሽ)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary"
                  >
                    ሰርዝ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-blue text-white shadow-sm hover:bg-brand-blue/90"
                  >
                    አስገባ
                  </button>
                </div>
              </form>
            )}

            {/* Questions List */}
            <div className="space-y-2">
              {questions.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted border border-dashed border-border/50 rounded-xl">
                  ምንም ተጨማሪ መጠይቆች አልተካተቱም።
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-3 bg-surface-secondary/30 border border-border/40 rounded-xl p-3.5 text-xs hover:border-brand-blue/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-brand-blue/10 text-brand-blue font-extrabold flex items-center justify-center text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-text-primary">{q.title}</div>
                        <div className="text-[10px] text-text-muted">{q.category}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="ጥያቄውን ሰርዝ"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary cursor-pointer"
            >
              ሰርዝ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <IconDeviceFloppy size={18} />
              <span>ቅጹን አስቀምጥ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
