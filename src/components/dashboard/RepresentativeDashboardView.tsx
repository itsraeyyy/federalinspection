"use client";

import { useState, useEffect } from "react";
import { IconCalendarEvent, IconCheck, IconX, IconEdit, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { ReportPeriod, getCurrentEtDate, canSubmitReport, getCurrentFiscalYear, ET_MONTHS } from "@/lib/et-calendar";
import { ReportTabsView } from "./ReportTabsView";

export function RepresentativeDashboardView({ userId, region, initialReports }: { userId: string, region: string, initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [activeFormPeriod, setActiveFormPeriod] = useState<ReportPeriod | null>(null);
  const [etDate, setEtDate] = useState<{year: number, month: number, day: number} | null>(null);

  useEffect(() => {
    // Mock the date for testing or get actual
    // For now get actual Ethiopian date
    setEtDate(getCurrentEtDate());
  }, []);

  
  const periods: ReportPeriod[] = [
    '1ኛ ሩብ አመት', '2ኛ ሩብ አመት', 'የመጀመሪያ ግማሽ አመት', '3ኛ ሩብ አመት', '4ኛ ሩብ አመት', '2ተኛ ግማሽ አመት', 'የበጀት አመት (ሙሉ)'
  ];
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentFiscalYear());
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('1ኛ ሩብ አመት');

  const isWindowOpen = canSubmitReport(selectedPeriod);
  const existingReport = reports.find(r => r.period === selectedPeriod && r.year === selectedYear);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'submitted': return <span className="px-2 py-1 rounded-full bg-status-warning/10 text-status-warning text-xs font-medium border border-status-warning/20">ተልኳል (Submitted)</span>;
      case 'reviewed': return <span className="px-2 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-medium border border-status-success/20">ታይቷል (Reviewed)</span>;
      case 'draft': return <span className="px-2 py-1 rounded-full bg-surface-secondary text-text-secondary text-xs font-medium border border-border-medium">በመሰራት ላይ (Draft)</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">የ{region} ክልል ዳሽቦርድ</h1>
          <p className="text-text-muted mt-1">እንኳን በደህና መጡ! ሪፖርቶችዎን ከዚህ ያስተዳድሩ።</p>
        </div>
        
        {etDate && (
          <div className="bg-brand-blue/5 border border-brand-blue/20 px-4 py-2 rounded-xl flex items-center gap-3">
            <IconCalendarEvent className="text-brand-blue" />
            <div>
              <p className="text-xs text-text-muted">የዛሬ ቀን (ኢት.ካ)</p>
              <p className="text-sm font-semibold text-text-primary">
                {Object.keys(ET_MONTHS).find(k => (ET_MONTHS as any)[k] === etDate.month)} {etDate.day}, {etDate.year}
              </p>
            </div>
          </div>
        )}
      </div>

      {activeFormPeriod ? (
        <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-border-light pb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-brand-blue tracking-tight">ሪፖርት ማቅረቢያ - {activeFormPeriod} ({selectedYear})</h2>
              </div>
              <button onClick={() => setActiveFormPeriod(null)} className="px-4 py-2 bg-surface-secondary hover:bg-border-light text-text-secondary font-medium rounded-xl transition-colors">
                ተመለስ (Back)
              </button>
           </div>

           <ReportTabsView 
             userId={userId}
             region={region}
             year={selectedYear}
             period={activeFormPeriod}
             existingReport={existingReport}
             onSuccess={() => {
               setActiveFormPeriod(null);
               window.location.reload();
             }}
           />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm overflow-hidden p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">አዲስ ሪፖርት ማቅረቢያ (New Submission)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">በጀት ዓመት (Budget Year)</label>
                  <input 
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    placeholder="ለምሳሌ፡ 2019"
                    className="w-full px-4 py-2.5 bg-surface-secondary border border-border-medium rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">ወቅት (Period)</label>
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
                    className="w-full px-4 py-2.5 bg-surface-secondary border border-border-medium rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  >
                    {periods.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl mb-6 bg-surface-secondary/50 border border-border-light flex items-start gap-3">
                {isWindowOpen ? (
                  <IconCheck className="text-status-success shrink-0 mt-0.5" />
                ) : (
                  <IconAlertCircle className="text-status-error shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {isWindowOpen ? "ማቅረቢያ ጊዜው ክፍት ነው።" : "ማቅረቢያ ጊዜ አይደለም።"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {isWindowOpen 
                      ? "አሁን ሪፖርትዎን መሙላት እና መላክ ይችላሉ።" 
                      : `የ ${selectedPeriod} ሪፖርት ማቅረብ የሚቻለው በሚመለከተው ወር ከ20 እስከ 25 ብቻ ነው።`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {existingReport && (
                  <div className="mr-auto flex items-center gap-2">
                    <span className="text-sm font-medium text-text-secondary">ሁኔታ:</span> 
                    {getStatusBadge(existingReport.status)}
                  </div>
                )}
                
                <button
                  disabled={!isWindowOpen && !existingReport}
                  onClick={() => setActiveFormPeriod(selectedPeriod)}
                  className={`px-6 py-2.5 font-medium rounded-xl text-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center ${
                    (existingReport && existingReport.status !== 'draft') || (!isWindowOpen && existingReport)
                      ? 'bg-surface-secondary text-text-secondary hover:bg-border-light border border-border-medium' // View mode
                      : isWindowOpen
                        ? 'bg-brand-blue text-white shadow-sm hover:bg-brand-blue/90' // Edit/Fill mode
                        : 'bg-surface-secondary text-text-muted opacity-50 cursor-not-allowed border border-border-medium' // Disabled
                  }`}
                >
                  {existingReport && existingReport.status !== 'draft' ? (
                    <>ክፈት / እይ (View)</>
                  ) : existingReport && existingReport.status === 'draft' ? (
                    isWindowOpen ? <><IconEdit size={18}/> ቀጥል (Continue Draft)</> : <>ክፈት / እይ (View Draft)</>
                  ) : (
                    <>ሙላ (Start Filling)</>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm overflow-hidden p-6">
               <h2 className="text-lg font-bold text-text-primary mb-4">የቀድሞ ሪፖርቶች (Past Submissions)</h2>
               <div className="space-y-3">
                 {reports.length === 0 ? (
                   <p className="text-sm text-text-muted text-center py-6">ምንም ሪፖርት አላስገቡም</p>
                 ) : (
                   reports.map(r => (
                     <div key={r.id} className="flex items-center justify-between p-3 border border-border-light rounded-xl hover:bg-surface-secondary/30">
                       <div>
                         <p className="text-sm font-medium text-text-primary">{r.period} ({r.year})</p>
                       </div>
                       <div>{getStatusBadge(r.status)}</div>
                     </div>
                   ))
                 )}
               </div>
            </div>

          </div>
          
          <div className="space-y-6">
            <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm overflow-hidden p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconMessageCircle size={20} className="text-brand-blue" />
                የቅርብ ጊዜ ግብረ መልሶች
              </h2>
              <div className="space-y-4">
                {reports.filter(r => r.admin_feedback).length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4 bg-surface-secondary/50 rounded-xl border border-dashed border-border-medium">
                    ምንም ግብረ መልስ አልተሰጠም
                  </p>
                ) : (
                  reports.filter(r => r.admin_feedback).map(r => {
                    let feedbackObj: Record<string, string> = { general: r.admin_feedback };
                    try {
                      const parsed = JSON.parse(r.admin_feedback);
                      if (typeof parsed === 'object' && parsed !== null) {
                        feedbackObj = parsed;
                      }
                    } catch (e) {
                      // fallback to string
                    }

                    return (
                      <div key={r.id} className="bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/10 space-y-3">
                        <div className="flex justify-between items-center text-xs text-text-muted font-medium mb-2">
                          <span>{r.period} ({r.year})</span>
                          <span className="bg-white px-2 py-0.5 rounded-full border border-border-light text-brand-blue font-bold">ከአድሚን (Admin)</span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(feedbackObj).map(([key, text]) => {
                            if (!text || (typeof text !== 'string')) return null;
                            const title = key === 'general' ? 'አጠቃላይ አስተያየት (General Feedback)' : key.replace('form_', 'ቅጽ ');
                            return (
                              <div key={key} className="bg-white p-3 rounded-lg border border-border-light shadow-sm">
                                <p className="text-xs font-bold text-brand-blue mb-1.5 border-b border-border-light pb-1">{title}</p>
                                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{text}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { IconMessageCircle } from "@tabler/icons-react";
