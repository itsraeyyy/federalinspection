"use client";

import { useState } from "react";
import { 
  IconCheck, 
  IconDownload, 
  IconMessageCircle, 
  IconLoader2, 
  IconThumbUp, 
  IconTable,
  IconChevronDown,
  IconCircleCheck,
  IconCircleDashed,
  IconFileText
} from "@tabler/icons-react";
import { FormSchema, FormTableRenderer } from "@/components/dashboard/forms/FormTableRenderer";
import { provideAdminFeedbackAction, approveReportAction } from "@/app/actions/reports";
import { formatECDate } from "@/lib/date-formatter";
import { exportRegionToWord } from "@/utils/exportUtils";

interface RegionReportTabProps {
  initialReports: any[];
  schemas: FormSchema[];
}

const ALL_REGIONS = [
  'ኦሮሚያ', 'አማራ', 'ሶማሌ', 'አፋር', 'ቤን-ጉሙዝ', 'ጋምቤላ', 'ሐረሪ', 'ሲዳማ', 
  'ደ/ም/ኢ/ያ', 'ደቡብ ኢ/ያ', 'ማዕ/ኢ/ያ', 'አዲስ አበባ', 'ድሬ ዳዋ', 'ፌዴራል ተቋማት'
];

export function RegionReportTab({ initialReports, schemas }: RegionReportTabProps) {
  const [reports, setReports] = useState(initialReports);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<'forms' | 'narration'>('forms');
  const [expandedFormId, setExpandedFormId] = useState<string | null>(schemas && schemas.length > 0 ? schemas[0].id : null);

  const selectedReport = reports.find(r => r.region === selectedRegion);
  
  const activeSchemas = (selectedReport?.schema_snapshot && Array.isArray(selectedReport.schema_snapshot) && selectedReport.schema_snapshot.length > 0)
    ? selectedReport.schema_snapshot
    : schemas;

  const parsedFeedback = (() => {
    if (!selectedReport?.admin_feedback) return {};
    try {
      return JSON.parse(selectedReport.admin_feedback);
    } catch (e) {
      return { general: selectedReport.admin_feedback };
    }
  })();

  const handleExportAllWord = () => {
    if (!selectedReport) return;
    exportRegionToWord(selectedReport.region, selectedReport.year, selectedReport.period, selectedReport.forms_data, activeSchemas);
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    setIsApproving(true);
    const result = await approveReportAction(selectedReport.id);
    if (!result.error) {
      setReports(reports.map(r => r.id === selectedReport.id ? { ...r, status: 'approved' } : r));
      alert("ሪፖርቱ ፀድቋል (Approved successfully)");
    } else {
      alert("Error: " + result.error);
    }
    setIsApproving(false);
  };

  const submitFeedback = async (formId: string) => {
    if (!selectedReport) return;
    const text = feedbackInputs[formId] ?? parsedFeedback[formId] ?? "";
    if (!text.trim()) return;

    setLoading(true);
    const newFeedbackObj = { ...parsedFeedback, [formId]: text };
    const newFeedbackString = JSON.stringify(newFeedbackObj);

    const result = await provideAdminFeedbackAction(selectedReport.id, newFeedbackString);
    if (!result.error) {
      setReports(reports.map(r => r.id === selectedReport.id ? { ...r, admin_feedback: newFeedbackString, status: 'reviewed' } : r));
      alert("ግብረ መልስ ተልኳል (Feedback Sent)");
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  const toggleForm = (id: string) => {
    setExpandedFormId(prev => prev === id ? null : id);
  };

  if (!selectedRegion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">የክልል ሪፖርቶች (Regional Reports)</h2>
            <p className="text-sm text-text-muted mt-1">ሪፖርቱን ለመመልከት ከታች ካሉት ክልሎች አንዱን ይምረጡ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ALL_REGIONS.map(region => {
            const hasReport = reports.some(r => r.region === region);
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className="group relative flex flex-col p-5 bg-surface-primary hover:bg-surface-secondary border border-border-light hover:border-brand-blue/30 rounded-2xl transition-all duration-200 text-left shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${hasReport ? 'bg-status-success/15 text-status-success' : 'bg-surface-secondary text-text-muted'}`}>
                    {hasReport ? <IconCheck size={20} /> : <IconCircleDashed size={20} />}
                  </div>
                  {hasReport && (
                    <span className="text-[10px] font-bold px-2 py-1 bg-status-success/10 text-status-success rounded-full uppercase tracking-wider border border-status-success/20">
                      የቀረበ (Submitted)
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary text-lg">{region}</h3>
                <p className="text-xs text-text-muted mt-1">
                  {hasReport ? 'ሪፖርት ለማየት ይጫኑ' : 'እስካሁን ሪፖርት አላስገባም'}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary rounded-xl overflow-hidden p-1 sm:p-6 min-h-[600px]">
      
      {/* Back Button */}
      <button 
        onClick={() => setSelectedRegion("")}
        className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary mb-6 transition-colors px-2 py-1 rounded-lg hover:bg-surface-secondary w-fit"
      >
        <span className="text-lg leading-none">&larr;</span> ወደ ኋላ ተመለስ (Back to Regions)
      </button>

      {!selectedReport ? (
        <div className="flex flex-col items-center justify-center text-center bg-surface-secondary/20 rounded-2xl border border-dashed border-border-medium py-24 px-6">
          <IconCircleDashed size={48} className="text-text-muted/30 mb-4" stroke={1} />
          <h3 className="text-xl font-medium text-text-primary mb-2">ሪፖርት አልቀረበም</h3>
          <p className="text-sm text-text-muted">የ{selectedRegion} ክልል እስካሁን ሪፖርት አላስገባም። ሪፖርት ሲያስገቡ እዚህ ማየት ይችላሉ።</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          
          {/* Header & Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-border-light">
            <div>
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                የ{selectedReport.region} ሪፖርት
                {selectedReport.status === 'approved' && (
                  <span className="bg-status-success/10 text-status-success text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-status-success/20">
                    ፀድቋል (Approved)
                  </span>
                )}
              </h2>
              <p className="text-sm text-text-muted mt-1.5 font-medium">
                የተላከው: {selectedReport.submitted_at ? formatECDate(selectedReport.submitted_at) : '-'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-surface-secondary p-1 rounded-xl border border-border-light shadow-sm">
                <button
                  onClick={handleExportAllWord}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-white dark:hover:bg-surface-primary rounded-lg text-xs font-medium transition-colors text-text-secondary"
                  title="Export All to Word"
                >
                  <IconDownload size={14} /> Word
                </button>
              </div>

              {selectedReport.status !== 'approved' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50"
                >
                  {isApproving ? <IconLoader2 size={16} className="animate-spin" /> : <IconThumbUp size={16} />}
                  አፅድቅ (Approve)
                </button>
              )}
            </div>
          </div>

          {/* Report Type Switcher */}
          <div className="flex flex-col sm:flex-row bg-surface-secondary p-1 rounded-xl shadow-sm border border-border-light w-full sm:w-fit mt-6">
            <button
              onClick={() => setActiveTab('forms')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'forms' 
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

          {activeTab === 'forms' && (
            <div className="border border-border-light rounded-2xl overflow-hidden bg-surface-primary shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeSchemas.map((schema, index) => {
                const isCompleted = selectedReport.forms_data[schema.id] && Object.keys(selectedReport.forms_data[schema.id]).length > 0;
                const isExpanded = expandedFormId === schema.id;
                const isLast = index === activeSchemas.length - 1;
                const currentFeedback = feedbackInputs[schema.id] ?? parsedFeedback[schema.id] ?? "";
                
                return (
                  <div key={schema.id} className={`${!isLast ? 'border-b border-border-light' : ''}`}>
                    <button
                      onClick={() => toggleForm(schema.id)}
                      className={`w-full flex items-center justify-between p-4 sm:px-6 transition-colors focus:outline-none
                        ${isExpanded ? 'bg-brand-blue/5' : 'hover:bg-surface-secondary/30'}`}
                    >
                      <div className="flex items-center gap-4">
                        {isCompleted ? (
                          <IconCircleCheck size={18} className="text-status-success shrink-0" />
                        ) : (
                          <IconCircleDashed size={18} className="text-text-muted/50 shrink-0" />
                        )}
                        <h4 className="font-medium text-text-primary text-sm sm:text-base text-left">{schema.table_title}</h4>
                      </div>
                      <IconChevronDown 
                        size={18} 
                        className={`text-text-muted transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    {isExpanded && (
                      <div className="p-0 sm:p-5 bg-surface-secondary/10 border-t border-border-light flex flex-col gap-4">
                        <div className="opacity-95 pointer-events-none rounded-xl overflow-x-auto bg-transparent">
                          <FormTableRenderer 
                            schema={schema}
                            initialData={selectedReport.forms_data[schema.id] || {}}
                            onChange={() => {}}
                            isCompleted={isCompleted}
                            compact={true}
                          />
                        </div>
                        
                        {/* Form Actions (Export & Feedback) */}
                        {isCompleted && (
                          <div className="flex flex-col md:flex-row gap-4 mt-2 p-4 bg-surface-primary rounded-xl border border-border-medium shadow-sm">
                            <div className="flex-1 w-full relative">
                              <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                <IconMessageCircle size={14} className="text-brand-blue" />
                                የዚህ ቅጽ ግብረ መልስ (Form Feedback)
                              </label>
                              <textarea
                                value={currentFeedback}
                                onChange={(e) => setFeedbackInputs({...feedbackInputs, [schema.id]: e.target.value})}
                                placeholder="ለዚህ ቅጽ አስተያየት ካለዎት እዚህ ይፃፉ..."
                                className="w-full px-4 py-3 bg-surface-secondary/30 border border-border-medium rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-sm text-text-primary min-h-[48px] resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-3 shrink-0 items-end w-full md:w-auto pb-1">
                              <button
                                onClick={() => submitFeedback(schema.id)}
                                disabled={loading || !currentFeedback.trim() || currentFeedback === (parsedFeedback[schema.id] ?? "")}
                                className="px-6 py-2.5 bg-surface-secondary hover:bg-border-light text-text-primary border border-border-medium font-medium rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                              >
                                {loading ? <IconLoader2 size={18} className="animate-spin" /> : 'ላክ (Send)'}
                              </button>
                              
                              <button
                                onClick={() => exportRegionToWord(selectedReport.region, selectedReport.year, selectedReport.period, selectedReport.forms_data, [schema])}
                                className="px-4 py-2.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-brand-blue/20"
                              >
                                <IconDownload size={18} /> Export Word
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'narration' && (
            <div className="border border-border-light rounded-2xl overflow-hidden bg-surface-primary shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 sm:p-6 bg-surface-primary flex flex-col gap-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-border-light">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <IconFileText size={20} className="text-brand-blue" />
                    የጽሁፍ ሪፖርት (Narration Report)
                  </h3>
                  {selectedReport.forms_data?.narration_report?.text ? (
                    <span className="px-3 py-1 bg-status-success/10 text-status-success text-xs font-bold rounded-full flex items-center gap-1 border border-status-success/20">
                      <IconCircleCheck size={14} /> ተሟልቷል (Completed)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-surface-secondary text-text-muted text-xs font-bold rounded-full flex items-center gap-1 border border-border-medium">
                      <IconCircleDashed size={14} /> አልቀረበም (Not Provided)
                    </span>
                  )}
                </div>

                {selectedReport.forms_data?.narration_report?.text ? (
                  <div className="bg-surface-secondary/30 border border-border-light rounded-xl p-5 shadow-sm min-h-[150px]">
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {selectedReport.forms_data.narration_report.text}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center bg-surface-secondary/20 rounded-2xl border border-dashed border-border-medium py-12 px-6">
                    <IconFileText size={32} className="text-text-muted/30 mb-3" stroke={1.5} />
                    <h4 className="text-sm font-medium text-text-primary mb-1">ምንም ጽሁፍ የለም</h4>
                    <p className="text-xs text-text-muted">ተወካዩ ለዚህ ሪፖርት ምንም የጽሁፍ ማብራሪያ አላቀረበም።</p>
                  </div>
                )}
                
                {selectedReport.forms_data?.narration_report?.attachment_url && (
                  <div className="flex items-center justify-between p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl hover:bg-brand-blue/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <IconFileText size={20} className="text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {selectedReport.forms_data?.narration_report?.attachment_name || "አባሪ ፋይል (Attachment)"}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={selectedReport.forms_data.narration_report.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-brand-blue font-bold rounded-lg hover:bg-brand-blue/10 border border-brand-blue/20 transition-all text-sm shadow-sm flex items-center gap-2"
                    >
                      <IconDownload size={16} /> አውርድ (Download)
                    </a>
                  </div>
                )}

                {selectedReport.forms_data?.narration_report?.text && (
                  <div className="flex flex-col md:flex-row gap-4 mt-4 p-4 bg-surface-secondary/20 rounded-xl border border-border-medium shadow-sm">
                    <div className="flex-1 w-full relative">
                      <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <IconMessageCircle size={14} className="text-brand-blue" />
                        የዚህ ሪፖርት ግብረ መልስ (Feedback)
                      </label>
                      <textarea
                        value={feedbackInputs['narration'] ?? parsedFeedback['narration'] ?? ""}
                        onChange={(e) => setFeedbackInputs({...feedbackInputs, 'narration': e.target.value})}
                        placeholder="ለዚህ ሪፖርት አስተያየት ካለዎት እዚህ ይፃፉ..."
                        className="w-full px-4 py-3 bg-surface-primary border border-border-medium rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-sm text-text-primary min-h-[48px] resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-3 shrink-0 items-end w-full md:w-auto pb-1">
                      <button
                        onClick={() => submitFeedback('narration')}
                        disabled={loading || !(feedbackInputs['narration'] ?? parsedFeedback['narration'] ?? "").trim() || (feedbackInputs['narration'] ?? "") === (parsedFeedback['narration'] ?? "")}
                        className="px-6 py-2.5 bg-brand-blue text-white hover:bg-brand-blue/90 border border-brand-blue font-medium rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        {loading ? <IconLoader2 size={18} className="animate-spin" /> : 'ላክ (Send)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
