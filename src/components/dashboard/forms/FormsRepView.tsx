"use client";

import { useState, useEffect } from "react";
import { FormTableRenderer, FormSchema } from "./FormTableRenderer";
import { NarrationReportForm } from "../NarrationReportForm";
import { IconSend, IconDeviceFloppy, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { saveReportFormAction, submitReportAction } from "@/app/actions/reports";
import { ReportPeriod, canSubmitReport, getCurrentFiscalYear } from "@/lib/et-calendar";

interface FormsRepViewProps {
  userProfile: any;
  initialReports: any[];
  initialSchemas: FormSchema[];
}

export function FormsRepView({ userProfile, initialReports, initialSchemas }: FormsRepViewProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'narration'>('structured');
  
  const periods: ReportPeriod[] = [
    '1ኛ ሩብ አመት', '2ኛ ሩብ አመት', 'የመጀመሪያ ግማሽ አመት', '3ኛ ሩብ አመት', '4ኛ ሩብ አመት', '2ተኛ ግማሽ አመት', 'የበጀት አመት (ሙሉ)'
  ];

  const [currentYear, setCurrentYear] = useState<number>(getCurrentFiscalYear());
  const [currentPeriod, setCurrentPeriod] = useState<ReportPeriod>("1ኛ ሩብ አመት");
  
  // Find report for the selected year and period
  const activeReport = initialReports.find(r => r.year === currentYear && r.period === currentPeriod);

  // Initialize form data from active report or empty
  const [formData, setFormData] = useState<any>(activeReport?.forms_data || {});
  
  // Determine schemas: Use snapshot if available, otherwise current latest schemas
  const activeSchemas = (activeReport?.schema_snapshot && Array.isArray(activeReport.schema_snapshot) && activeReport.schema_snapshot.length > 0) 
    ? activeReport.schema_snapshot 
    : initialSchemas;

  const [schemas, setSchemas] = useState<FormSchema[]>(activeSchemas);
  
  // Reset form data and schemas when selection changes
  useEffect(() => {
    setFormData(activeReport?.forms_data || {});
    setSchemas((activeReport?.schema_snapshot && Array.isArray(activeReport.schema_snapshot) && activeReport.schema_snapshot.length > 0) 
      ? activeReport.schema_snapshot 
      : initialSchemas);
  }, [currentYear, currentPeriod, activeReport, initialSchemas]);

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFormChange = (formId: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [formId]: data
    }));
  };

  const calculateCompletion = () => {
    let completed = 0;
    schemas.forEach(schema => {
      const formAns = formData[schema.id];
      if (formAns && Object.keys(formAns).length > 0) {
        completed++;
      }
    });
    return Math.round((completed / schemas.length) * 100);
  };

  const progress = calculateCompletion();
  const isWindowOpen = canSubmitReport(currentPeriod);
  
  // They can only view if it's submitted/reviewed. 
  // If window is closed and it's not submitted, they can't edit either.
  const isReadOnly = ['submitted', 'reviewed', 'approved'].includes(activeReport?.status);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result = await saveReportFormAction(
      userProfile.user_id,
      userProfile.region,
      currentYear,
      currentPeriod,
      formData
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("በተሳካ ሁኔታ ተቀምጧል (Draft Saved)");
    }
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!isWindowOpen) {
      setError("ማቅረቢያ ጊዜ አይደለም (Window Closed). ማቅረብ የሚቻለው ከ20 እስከ 25 ብቻ ነው።");
      return;
    }
    if (!window.confirm("እርግጠኛ ነዎት ይህን ሪፖርት መላክ ይፈልጋሉ? አንዴ ከተላከ ማስተካከል አይቻልም።")) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await submitReportAction(
      userProfile.user_id,
      userProfile.region,
      currentYear,
      currentPeriod,
      formData
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("ሪፖርቱ በተሳካ ሁኔታ ተልኳል! (Report Submitted)");
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section with Dropdowns */}
      <div className="bg-surface-primary rounded-2xl p-6 border border-border-light shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-4">የ{userProfile?.region} ክልል ሪፖርት ማቅረቢያ</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">በጀት ዓመት (Budget Year)</label>
              <input 
                type="number"
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                placeholder="ለምሳሌ፡ 2019"
                className="w-full px-3 py-2 bg-surface-secondary border border-border-medium rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">ወቅት (Period)</label>
              <select 
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(e.target.value as ReportPeriod)}
                className="w-full px-3 py-2 bg-surface-secondary border border-border-medium rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
              >
                {periods.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Progress Circle or Bar */}
        <div className="flex items-center gap-4 bg-surface-secondary px-4 py-4 rounded-xl border border-border-light w-full md:w-48 shrink-0">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-medium mb-2 text-text-secondary">
              <span>የተሞላው (Progress)</span>
              <span className={progress === 100 ? "text-status-success" : ""}>{progress}%</span>
            </div>
            <div className="h-2.5 bg-border-medium rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-status-success' : 'bg-brand-blue'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {!isWindowOpen && !['submitted', 'reviewed', 'approved'].includes(activeReport?.status) && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 flex items-start gap-3">
          <IconAlertCircle className="text-status-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-status-error">ማቅረቢያ ጊዜ አይደለም (Window Closed)</h3>
            <p className="text-sm text-text-secondary mt-1">
              የ {currentPeriod} ሪፖርት ማቅረብ የሚቻለው በሚመለከተው ወር ከ20 እስከ 25 ብቻ ነው። ሆኖም ግን ሪፖርትዎን ሞልተው ማስቀመጥ (Save Draft) ይችላሉ።
            </p>
          </div>
        </div>
      )}

      {['submitted', 'reviewed', 'approved'].includes(activeReport?.status) && (
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 flex items-start gap-3">
          <IconAlertCircle className="text-brand-blue shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brand-blue">ይህ ሪፖርት ተልኳል (Submitted)</h3>
            <p className="text-sm text-text-secondary mt-1">የተላከ ሪፖርት ላይ ማስተካከያ ማድረግ አይቻልም።</p>
          </div>
        </div>
      )}

      {activeReport?.admin_feedback && (
        <div className="bg-status-warning/10 border border-status-warning/20 rounded-xl p-4">
          <h3 className="font-semibold text-status-warning text-sm uppercase tracking-wider mb-2">የአስተዳዳሪ ግብረ መልስ (Admin Feedback)</h3>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{activeReport.admin_feedback}</p>
        </div>
      )}

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 text-status-error text-sm font-medium flex gap-2">
          <IconAlertCircle size={20} className="shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-status-success/10 border border-status-success/20 rounded-xl p-4 text-status-success text-sm font-medium">
          {success}
        </div>
      )}

      {/* Tabs Selection */}
      <div className="flex flex-col sm:flex-row bg-surface-secondary p-1 rounded-xl shadow-sm border border-border-light w-full sm:w-fit mb-4">
        <button
          onClick={() => setActiveTab('structured')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'structured' 
              ? 'bg-brand-blue text-white shadow-md' 
              : 'text-text-secondary hover:text-text-primary hover:bg-border-light/50'
          }`}
        >
          የቅጽ ሪፖርት (Structured Report)
        </button>
        <button
          onClick={() => setActiveTab('narration')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'narration' 
              ? 'bg-brand-blue text-white shadow-md' 
              : 'text-text-secondary hover:text-text-primary hover:bg-border-light/50'
          }`}
        >
          የጽሁፍ ሪፖርት (Narration Report)
        </button>
      </div>

      {/* Forms List */}
      <div className="space-y-4 relative min-h-[400px]">
        {activeTab === 'structured' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {schemas.map(schema => {
              const isCompleted = formData[schema.id] && Object.keys(formData[schema.id]).length > 0;
              return (
                <div key={schema.id} className={isReadOnly ? "opacity-90 pointer-events-none" : ""}>
                  <FormTableRenderer 
                    schema={schema}
                    initialData={formData[schema.id] || {}}
                    onChange={(data) => handleFormChange(schema.id, data)}
                    isCompleted={isCompleted}
                    compact={false}
                  />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'narration' && (
          <div className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${isReadOnly ? "opacity-90 pointer-events-none" : ""}`}>
            <NarrationReportForm
              initialData={formData['narration_report'] || {}}
              onChange={(data) => handleFormChange('narration_report', data)}
              isReadOnly={isReadOnly}
              year={currentYear}
              region={userProfile?.region}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-4 z-10">
          <div className="flex-1" />
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting}
            className="px-6 py-3 bg-surface-primary border border-border-medium hover:border-brand-blue hover:text-brand-blue text-text-secondary font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <IconLoader2 size={20} className="animate-spin" /> : <IconDeviceFloppy size={20} />}
            አስቀምጥ (Save Draft)
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isSubmitting || progress === 0 || !isWindowOpen}
            title={!isWindowOpen ? "ማቅረቢያ ጊዜ አይደለም" : ""}
            className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <IconLoader2 size={20} className="animate-spin" /> : <IconSend size={20} />}
            ሪፖርት ላክ (Send Report)
          </button>
        </div>
      )}
    </div>
  );
}
