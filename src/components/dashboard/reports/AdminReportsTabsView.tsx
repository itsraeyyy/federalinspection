"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMap2, IconTable, IconEdit } from "@tabler/icons-react";
import { RegionReportTab } from "./RegionReportTab";
import { AggregatedDataTab } from "./AggregatedDataTab";
import { FormSchema } from "@/components/dashboard/forms/FormTableRenderer";

export function AdminReportsTabsView({ initialReports, initialSchemas }: { initialReports: any[], initialSchemas: FormSchema[] }) {
  const [activeTab, setActiveTab] = useState<'region' | 'aggregated'>('region');
  const schemas = initialSchemas;

  // Note: hardcoded for current year/period in this context, normally from state/DB
  const currentYear = 2016; 
  const currentPeriod = "3ኛ ሩብ አመት";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">የደረሱ ሪፖርቶች</h2>
          <p className="text-sm text-text-muted mt-1">የሪፖርቶችን ዝርዝር እና የተጠቃለለ መረጃ ይመልከቱ</p>
        </div>
        
        <div className="flex bg-surface-primary p-1 rounded-xl shadow-sm border border-border-light">
          <button
            onClick={() => setActiveTab('region')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'region' 
                ? 'bg-brand-blue text-white shadow-md' 
                : 'text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5'
            }`}
          >
            <IconMap2 size={18} />
            በክልል (By Region)
          </button>
          <button
            onClick={() => setActiveTab('aggregated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'aggregated' 
                ? 'bg-brand-blue text-white shadow-md' 
                : 'text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5'
            }`}
          >
            <IconTable size={18} />
            የተጠቃለለ (Aggregated)
          </button>
        </div>
      </div>

      <div className="bg-surface-primary rounded-2xl border border-border-light shadow-sm p-6">
        {activeTab === 'region' && (
          <RegionReportTab initialReports={initialReports} schemas={schemas} />
        )}
        {activeTab === 'aggregated' && (
          <AggregatedDataTab reports={initialReports} schemas={schemas} year={currentYear} period={currentPeriod} />
        )}
      </div>
    </div>
  );
}
