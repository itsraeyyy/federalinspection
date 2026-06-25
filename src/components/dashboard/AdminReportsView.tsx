"use client";

import { useState } from "react";
import { IconFileDescription, IconCheck, IconX, IconMessageCircle, IconLoader2 } from "@tabler/icons-react";
import { provideAdminFeedbackAction } from "@/app/actions/reports";

export function AdminReportsView({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);

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
      <h2 className="text-xl font-bold text-text-primary tracking-tight">የደረሱ ሪፖርቶች</h2>

      {reports.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-bg-secondary/50 rounded-xl border border-dashed border-border-medium">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-text-muted shadow-sm mb-4">
            <IconFileDescription size={32} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">ምንም ሪፖርት አልደረሰም</h3>
          <p className="text-text-muted max-w-sm">በአሁኑ ጊዜ የተላኩ የክልል ሪፖርቶች የሉም።</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-light">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-bg-secondary text-text-primary font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3 border-b border-border-light">ክልል</th>
                <th className="px-4 py-3 border-b border-border-light">ዓመት / ወቅት</th>
                <th className="px-4 py-3 border-b border-border-light">ሁኔታ</th>
                <th className="px-4 py-3 border-b border-border-light">የተላከበት ጊዜ</th>
                <th className="px-4 py-3 border-b border-border-light">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light bg-bg-primary">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{report.region}</td>
                  <td className="px-4 py-3">{report.year} - {report.period}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'submitted' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' : 
                      report.status === 'reviewed' ? 'bg-status-success/10 text-status-success border border-status-success/20' : 
                      'bg-bg-secondary text-text-muted border border-border-medium'
                    }`}>
                      {report.status === 'submitted' ? 'አዲስ' : report.status === 'reviewed' ? 'ታይቷል' : 'በመሰራት ላይ (Draft)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString('am-ET') : '-'}
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
          <div className="bg-bg-primary w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border-light bg-bg-secondary/30 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-tight">ሪፖርት ግምገማ: {selectedReport.region}</h2>
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
                <div className="bg-bg-secondary p-4 rounded-xl border border-border-light overflow-x-auto">
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
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all text-text-primary min-h-[120px]"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 text-text-secondary font-medium hover:bg-bg-secondary rounded-xl transition-colors"
                    >
                      ዝጋ
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !feedbackText.trim()}
                      className="px-5 py-2 bg-brand-blue text-white font-medium rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-50 flex items-center gap-2"
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
