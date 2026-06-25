"use client";

import { useState } from "react";
import { IconUsers, IconReportAnalytics } from "@tabler/icons-react";
import { RepresentativesManager } from "./RepresentativesManager";
import { AdminReportsView } from "./AdminReportsView";

export function FormsAdminView({ initialRepresentatives, initialReports }: { initialRepresentatives: any[], initialReports: any[] }) {
  const [activeTab, setActiveTab] = useState<'reps' | 'reports'>('reps');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">የክልል ሪፖርቶች (Regional Reports)</h1>
          <p className="text-text-muted mt-1">የክልል ሪፖርት አቅራቢዎችን እና ሪፖርቶችን ያስተዳድሩ</p>
        </div>
        
        <div className="flex bg-bg-primary p-1 rounded-xl shadow-sm border border-border-light">
          <button
            onClick={() => setActiveTab('reps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'reps' 
                ? 'bg-brand-blue text-white shadow-md' 
                : 'text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5'
            }`}
          >
            <IconUsers size={18} />
            ተወካዮች (Representatives)
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'reports' 
                ? 'bg-brand-blue text-white shadow-md' 
                : 'text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5'
            }`}
          >
            <IconReportAnalytics size={18} />
            ሪፖርቶች (Reports)
          </button>
        </div>
      </div>

      <div className="bg-bg-primary rounded-2xl border border-border-light shadow-sm p-6 overflow-hidden relative">
        {activeTab === 'reps' && <RepresentativesManager initialRepresentatives={initialRepresentatives} />}
        {activeTab === 'reports' && <AdminReportsView initialReports={initialReports} />}
      </div>
    </div>
  );
}
