"use client";

import { useState } from "react";
import { IconHistory, IconCalendar, IconMapPin, IconCheck, IconChecks, IconAlertCircle, IconEye, IconFilter } from "@tabler/icons-react";
import { FormSchema } from "@/components/dashboard/forms/FormTableRenderer";
import { formatECDate } from "@/lib/date-formatter";
import { RegionReportTab } from "../reports/RegionReportTab";
import { ReportPeriod } from "@/lib/et-calendar";

export function AdminHistoryView({ initialReports, initialSchemas }: { initialReports: any[], initialSchemas: FormSchema[] }) {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Extract unique regions, years, and periods for filters
  const regions = ["All", ...Array.from(new Set(initialReports.map(r => r.region))).sort()];
  const years = ["All", ...Array.from(new Set(initialReports.map(r => r.year.toString()))).sort().reverse()];
  const periods = ["All", ...Array.from(new Set(initialReports.map(r => r.period))).sort()];

  const filteredReports = initialReports.filter(report => {
    if (selectedRegion !== "All" && report.region !== selectedRegion) return false;
    if (selectedYear !== "All" && report.year.toString() !== selectedYear) return false;
    if (selectedPeriod !== "All" && report.period !== selectedPeriod) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <IconCheck size={18} className="text-brand-blue" />;
      case 'reviewed': return <IconChecks size={18} className="text-status-warning" />;
      case 'approved': return <IconChecks size={18} className="text-status-success" />;
      default: return <IconAlertCircle size={18} className="text-text-muted" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'ተልኳል (Submitted)';
      case 'reviewed': return 'ታይቷል (Reviewed)';
      case 'approved': return 'ጸድቋል (Approved)';
      default: return status;
    }
  };

  // If a specific report is selected, show it using RegionReportTab or a simplified view
  if (selectedReportId) {
    const report = initialReports.find(r => r.id === selectedReportId);
    if (!report) return null;

    // We can use RegionReportTab since it expects a list of reports and filters by selectedRegion, currentYear, currentPeriod
    // Wait, RegionReportTab uses its own state for selectedRegion, currentYear, currentPeriod. 
    // It's better to pass default values to a custom wrapper or just render RegionReportTab and tell the user to select the specific one.
    // However, RegionReportTab doesn't take default values for its dropdowns out of the box, we would need to pass them.
    // Let's create a wrapper or just reuse RegionReportTab. Actually, we can use the same pattern as FormsRepView but for Admin.
    // For now, let's just let the admin use the RegionReportTab directly from the Forms page, OR we can pass defaults to RegionReportTab.
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <IconHistory className="text-brand-blue" size={28} />
            የሪፖርት ታሪክ (Report History)
          </h1>
          <p className="text-text-muted mt-1">ቀደም ሲል የቀረቡ ሪፖርቶችን ይመልከቱ እና ያጣሩ</p>
        </div>
      </div>

      {selectedReportId ? (
        <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 border-b border-border-light pb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">የሪፖርት ዝርዝር</h2>
              <p className="text-sm text-text-muted mt-1">እየተመለከቱ ያሉት ከታሪክ ማህደር ነው።</p>
            </div>
            <button 
              onClick={() => setSelectedReportId(null)}
              className="px-4 py-2 bg-surface-secondary hover:bg-border-light text-text-primary font-medium rounded-xl transition-colors text-sm"
            >
              ተመለስ (Back)
            </button>
          </div>
          {/* We use RegionReportTab and it will use the initialReports. The Admin will need to select the region/year in the tab itself. 
              To make it seamless, we would need to modify RegionReportTab to take defaultValues. 
              For now, we just mount it and they can view it. */}
          <RegionReportTab 
            initialReports={initialReports} 
            schemas={initialSchemas} 
            defaultRegion={initialReports.find(r => r.id === selectedReportId)?.region}
            defaultYear={initialReports.find(r => r.id === selectedReportId)?.year}
            defaultPeriod={initialReports.find(r => r.id === selectedReportId)?.period}
          />
        </div>
      ) : (
        <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-surface-secondary/50 rounded-xl border border-border-medium">
            <div className="flex items-center gap-2 text-text-primary font-semibold shrink-0">
              <IconFilter size={18} className="text-brand-blue" /> ማጣሪያ (Filters):
            </div>
            <div className="flex-1 flex gap-4 flex-wrap">
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 bg-surface-primary border border-border-medium rounded-lg text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-blue/20 flex-1 min-w-[150px] max-w-[200px]"
              >
                {regions.map(r => <option key={r} value={r}>{r === 'All' ? 'ሁሉም ክልሎች (All)' : r}</option>)}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 bg-surface-primary border border-border-medium rounded-lg text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-blue/20 flex-1 min-w-[120px] max-w-[150px]"
              >
                {years.map(y => <option key={y} value={y}>{y === 'All' ? 'ሁሉም አመታት (All)' : y}</option>)}
              </select>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-surface-primary border border-border-medium rounded-lg text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-blue/20 flex-1 min-w-[120px] max-w-[150px]"
              >
                {periods.map(p => <option key={p} value={p}>{p === 'All' ? 'ሁሉም ወቅቶች (All)' : p}</option>)}
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <IconHistory size={48} className="text-border-medium mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">ምንም ሪፖርት አልተገኘም</h3>
              <p className="text-text-muted">በተመረጠው ማጣሪያ መሰረት ምንም ሪፖርት የለም።</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-surface-primary border border-border-medium rounded-xl p-5 hover:border-brand-blue/30 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-secondary rounded-full text-xs font-semibold">
                      {getStatusIcon(report.status)}
                      <span className="text-text-primary">{getStatusText(report.status)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
                    <IconMapPin size={18} className="text-brand-blue" />
                    {report.region}
                  </h3>
                  
                  <div className="text-sm text-text-secondary space-y-2 mb-6 mt-3">
                    <div className="flex justify-between">
                      <span>በጀት ዓመት / ወቅት:</span>
                      <span className="font-bold text-text-primary">{report.year} - {report.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>የቀረበበት ቀን:</span>
                      <span className="font-medium text-text-primary">{report.submitted_at ? formatECDate(report.submitted_at) : '-'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedReportId(report.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-surface-secondary hover:bg-brand-blue hover:text-white text-text-primary font-medium rounded-lg transition-all text-sm"
                  >
                    <IconEye size={18} />
                    ሪፖርቱን ክፈት (Open Report)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
