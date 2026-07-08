"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconDownload, IconTable } from "@tabler/icons-react";
import { FormSchema } from "@/components/dashboard/forms/FormTableRenderer";
import { exportAggregatedToWord } from "@/utils/exportUtils";

interface AggregatedDataTabProps {
  reports: any[];
  schemas: FormSchema[];
  year: number;
  period: string;
}

const REGIONS = [
  "ኦሮሚያ", "አማራ", "ሶማሌ", "አፋር", "ቤንሻንጉል ጉሙዝ", "ጋምቤላ", 
  "ሀረሪ", "ሲዳማ", "ደቡብ ምዕራብ ኢትዮጵያ", "ደቡብ ኢትዮጵያ", "ማዕከላዊ ኢትዮጵያ", 
  "አዲስ አበባ", "ድሬዳዋ", "ፌዴራል"
];

export function AggregatedDataTab({ reports, schemas, year, period }: AggregatedDataTabProps) {
  const [openForms, setOpenForms] = useState<Record<string, boolean>>({ [schemas[0].id]: true });

  const toggleForm = (id: string) => {
    setOpenForms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportWord = () => {
    exportAggregatedToWord(year, period, reports, schemas);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-bg-secondary p-4 rounded-xl border border-border-light">
        <div>
          <h3 className="font-semibold text-text-primary">የተጠቃለለ ሪፖርት (Aggregated Data)</h3>
          <p className="text-sm text-text-muted">{year} - {period}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-bg-primary border border-border-medium rounded-lg text-sm font-medium hover:bg-bg-secondary transition-colors text-text-secondary"
          >
            <IconDownload size={18} />
            Export Word
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {schemas.map((schema) => {
          const isOpen = openForms[schema.id];
          
          return (
            <div key={schema.id} className="bg-bg-primary rounded-2xl border border-border-light shadow-sm overflow-hidden">
              <button 
                onClick={() => toggleForm(schema.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold">{schema.id.replace('form_', '')}</span>
                  </div>
                  <h3 className="font-semibold text-text-primary leading-tight">
                    {schema.table_title}
                  </h3>
                </div>
                <div className="text-text-muted">
                  {isOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className="p-5 pt-0 border-t border-border-light bg-bg-secondary/10 overflow-x-auto">
                  <table className="w-full text-left min-w-max mt-4 border-collapse">
                    <thead className="bg-bg-secondary text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border border-border-light text-center align-middle" rowSpan={2}>ክልል (Region)</th>
                        {schema.columns.map((col, idx) => (
                          <th 
                            key={idx} 
                            className="px-4 py-3 border border-border-light text-center" 
                            colSpan={col.subKeys.length > 0 ? col.subKeys.length : 1}
                          >
                            {col.key}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {schema.columns.map((col) => {
                          if (col.subKeys.length > 0) {
                            return col.subKeys.map((sub, idx) => (
                              <th key={idx} className="px-4 py-2 border border-border-light text-center font-medium bg-bg-primary/50 text-text-muted">
                                {sub}
                              </th>
                            ));
                          } else {
                            return <th key={col.key} className="px-4 py-2 border border-border-light text-center font-medium bg-bg-primary/50 text-text-muted">መረጃ (Data)</th>;
                          }
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light bg-bg-primary">
                      {/* Calculate totals while rendering */}
                      {(() => {
                        const colCount = schema.columns.reduce((acc, col) => acc + (col.subKeys.length > 0 ? col.subKeys.length : 1), 0);
                        const totals: number[] = new Array(colCount).fill(0);
                        let hasAnyData = false;

                        return (
                          <>
                            {REGIONS.map((region) => {
                              const regionReport = reports.find(r => r.region === region);
                              const data = regionReport?.forms_data?.[schema.id] || {};
                              let cellIndex = 0;

                              return (
                                <tr key={region} className="hover:bg-bg-secondary/30 transition-colors">
                                  <td className="px-4 py-3 font-medium text-text-primary border border-border-light whitespace-nowrap">{region}</td>
                                  {schema.columns.map((col) => {
                                    if (col.subKeys.length > 0) {
                                      return col.subKeys.map((sub, subIdx) => {
                                        const val = data[col.key]?.[sub];
                                        if (!isNaN(Number(val)) && val !== undefined && val !== "") {
                                          totals[cellIndex] += Number(val);
                                          hasAnyData = true;
                                        }
                                        const cell = <td key={`${col.key}-${subIdx}`} className="px-4 py-3 border border-border-light text-center">{val || "-"}</td>;
                                        cellIndex++;
                                        return cell;
                                      });
                                    } else {
                                      const val = data[col.key];
                                      if (!isNaN(Number(val)) && val !== undefined && val !== "") {
                                        totals[cellIndex] += Number(val);
                                        hasAnyData = true;
                                      }
                                      const cell = <td key={col.key} className="px-4 py-3 border border-border-light text-center">{val || "-"}</td>;
                                      cellIndex++;
                                      return cell;
                                    }
                                  })}
                                </tr>
                              );
                            })}
                            
                            {/* Total Row */}
                            <tr className="bg-brand-blue/5 font-semibold">
                              <td className="px-4 py-3 border border-border-light text-brand-blue whitespace-nowrap">ጠቅላላ ድምር (Total)</td>
                              {totals.map((total, idx) => (
                                <td key={idx} className="px-4 py-3 border border-border-light text-center text-brand-blue">
                                  {hasAnyData && total !== 0 ? total : "-"}
                                </td>
                              ))}
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>

                  {/* Form Actions (Export) */}
                  <div className="flex justify-end mt-4 p-4 bg-white dark:bg-bg-primary rounded-xl border border-border-medium shadow-sm">
                    <button
                      onClick={() => exportAggregatedToWord(year, period, reports, [schema])}
                      className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-brand-blue/20"
                    >
                      <IconDownload size={18} /> Export Word
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
