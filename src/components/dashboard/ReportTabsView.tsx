"use client";

import { useState } from "react";
import { ReportForm01 } from "./ReportForm01";
import { NarrationReportForm } from "./NarrationReportForm";
import { IconTable, IconFileText } from "@tabler/icons-react";
import { ReportPeriod, canSubmitReport } from "@/lib/et-calendar";

interface ReportTabsViewProps {
  userId: string;
  region: string;
  year: number;
  period: ReportPeriod;
  existingReport?: any;
  onSuccess: () => void;
}

export function ReportTabsView({
  userId,
  region,
  year,
  period,
  existingReport,
  onSuccess
}: ReportTabsViewProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'narration'>('structured');
  
  const isReadOnly = !canSubmitReport(period) || existingReport?.status === 'submitted' || existingReport?.status === 'reviewed' || existingReport?.status === 'approved';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row bg-surface-secondary p-1 rounded-xl shadow-sm border border-border-light w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('structured')}
          className={`flex-1 flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'structured' 
              ? 'bg-surface-primary text-brand-blue shadow-md border border-border-light' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <IconTable size={18} />
          የቅጽ ሪፖርት (Structured Report)
        </button>
        <button
          onClick={() => setActiveTab('narration')}
          className={`flex-1 flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'narration' 
              ? 'bg-surface-primary text-brand-blue shadow-md border border-border-light' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <IconFileText size={18} />
          የጽሁፍ ሪፖርት (Narration Report)
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'structured' && (
          <ReportForm01 
             userId={userId} 
             region={region} 
             year={year} 
             period={period}
             existingData={existingReport?.forms_data}
             onSuccess={onSuccess}
             isReadOnly={isReadOnly}
           />
        )}
        {activeTab === 'narration' && (
          <NarrationReportForm 
             userId={userId} 
             region={region} 
             year={year} 
             period={period}
             existingData={existingReport?.forms_data}
             onSuccess={onSuccess}
             isReadOnly={isReadOnly}
          />
        )}
      </div>
    </div>
  );
}
