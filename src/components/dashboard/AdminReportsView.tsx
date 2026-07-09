"use client";

import { useState } from "react";
import { IconFileDescription, IconCheck, IconX, IconMessageCircle, IconLoader2, IconDownload, IconThumbUp } from "@tabler/icons-react";
import { provideAdminFeedbackAction, approveReportAction } from "@/app/actions/reports";
import { formatECDate } from "@/lib/date-formatter";

export function AdminReportsView({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleDownload = () => {
    // Basic CSV download logic
    let csv = "ክልል,ዓመት,ወቅት,ሁኔታ\n";
    reports.forEach(r => {
      csv += `${r.region},${r.year},${r.period},${r.status}\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aggregated_reports_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    setIsApproving(true);
    const result = await approveReportAction(selectedReport.id);
    if (!result.error) {
      setReports(reports.map(r => r.id === selectedReport.id ? { ...r, status: 'approved' } : r));
      setSelectedReport({ ...selectedReport, status: 'approved' });
      alert("ሪፖርቱ ፀድቋል (Approved successfully)");
    } else {
      alert("Error: " + result.error);
    }
    setIsApproving(false);
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setLoading(true);

    const result = await provideAdminFeedbackAction(selectedReport.id, feedbackText);
    if (!result.error) {
      setReports(reports.map(r => r.id === selectedReport.id ? { ...r, admin_feedback: feedbackText, status: 'reviewed' } : r));
      setSelectedReport(null);
      setFeedbackText("");
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">የደረሱ ሪፖርቶች</h2>
          <label className="flex items-center gap-2 cursor-pointer bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-light">
            <input 
              type="checkbox" 
              checked={autoApprove} 
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="w-4 h-4 text-brand-blue rounded border-border-medium focus:ring-brand-blue"
            />
            <span className="text-sm font-medium text-text-secondary">Auto-Approve</span>
          </label>
        </div>
        
        <button
          onClick={handleDownload}
          className="bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-blue/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <IconDownload size={18} />
          Aggregated CSV
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-surface-secondary/50 rounded-xl border border-dashed border-border-medium">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-text-muted shadow-sm mb-4">
            <IconFileDescription size={32} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">ምንም ሪፖርት አልደረሰም</h3>
          <p className="text-text-muted max-w-sm">በአሁኑ ጊዜ የተላኩ የክልል ሪፖርቶች የሉም።</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-light">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-surface-secondary text-text-primary font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3 border-b border-border-light">ክልል</th>
                <th className="px-4 py-3 border-b border-border-light">ዓመት / ወቅት</th>
                <th className="px-4 py-3 border-b border-border-light">ሁኔታ</th>
                <th className="px-4 py-3 border-b border-border-light">የተላከበት ጊዜ</th>
                <th className="px-4 py-3 border-b border-border-light">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light bg-surface-primary">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-surface-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{report.region}</td>
                  <td className="px-4 py-3">{report.year} - {report.period}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'submitted' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' : 
                      report.status === 'reviewed' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 
                      report.status === 'approved' ? 'bg-status-success/10 text-status-success border border-status-success/20' : 
                      'bg-surface-secondary text-text-muted border border-border-medium'
                    }`}>
                      {report.status === 'submitted' ? 'አዲስ' : report.status === 'reviewed' ? 'ታይቷል' : report.status === 'approved' ? 'የፀደቀ' : 'በመሰራት ላይ (Draft)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {report.submitted_at ? formatECDate(report.submitted_at) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="text-brand-blue hover:text-brand-blue/80 font-medium text-sm"
                    >
                      ገምግም
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-primary w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-light bg-surface-secondary/30 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">ሪፖርት ግምገማ: {selectedReport.region}</h2>
                  {selectedReport.status === 'approved' && (
                    <span className="bg-status-success/10 text-status-success text-xs font-bold px-2 py-0.5 rounded-full border border-status-success/20 flex items-center gap-1">
                      <IconCheck size={14} /> የፀደቀ (Approved)
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted mt-1">{selectedReport.year} - {selectedReport.period}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-border-light rounded-full text-text-muted transition-colors">
                <IconX size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-3">ቅጽ 01 ውሂብ</h3>
                {/* Basic rendering of form data, will expand later */}
                <div className="bg-surface-secondary p-4 rounded-xl border border-border-light overflow-x-auto">
                  <pre className="text-xs text-text-secondary">{JSON.stringify(selectedReport.forms_data, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <IconMessageCircle size={18} className="text-brand-blue" />
                  የአስተያየት መስጫ (ግብረ መልስ)
                </h3>
                {selectedReport.admin_feedback && !feedbackText ? (
                  <div className="bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/20 text-sm text-text-primary">
                    {selectedReport.admin_feedback}
                  </div>
                ) : null}
                <form onSubmit={handleFeedback} className="space-y-3">
                  <textarea
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="ለሪፖርት አቅራቢው ግብረ መልስ ይፃፉ..."
                    className="w-full px-4 py-3 bg-surface-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary min-h-[120px]"
                  />
                  <div className="flex justify-end gap-3 items-center">
                    {selectedReport.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="px-5 py-2 bg-status-success text-white font-medium rounded-xl hover:bg-status-success/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isApproving ? <IconLoader2 size={18} className="animate-spin" /> : <IconThumbUp size={18} />}
                        አፅድቅ (Approve)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 text-text-secondary font-medium hover:bg-surface-secondary rounded-xl transition-colors"
                    >
                      ዝጋ
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !feedbackText.trim()}
                      className="px-5 py-2 bg-brand-blue text-white font-medium rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                    >
                      {loading ? <IconLoader2 size={18} className="animate-spin" /> : <><IconCheck size={18} /> ላክ</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
