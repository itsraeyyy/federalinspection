"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconCheck } from "@tabler/icons-react";

export interface FormSchema {
  id: string;
  table_title: string;
  columns: {
    key: string;
    subKeys: string[];
  }[];
}

interface FormTableRendererProps {
  schema: FormSchema;
  initialData?: any;
  onChange: (data: any) => void;
  isCompleted?: boolean;
  compact?: boolean;
}

export function FormTableRenderer({ schema, initialData = {}, onChange, isCompleted, compact = false }: FormTableRendererProps) {
  const [isOpen, setIsOpen] = useState(compact ? true : false);
  
  const handleInputChange = (colKey: string, subKey: string, value: string) => {
    const newData = { ...initialData };
    if (!newData[colKey]) {
      newData[colKey] = {};
    }
    
    if (subKey) {
      newData[colKey][subKey] = value;
    } else {
      newData[colKey] = value;
    }
    
    onChange(newData);
  };

  const tableBody = (
    <div className={`overflow-x-auto ${compact ? '' : 'pb-2'}`}>
      <table className="w-full text-left min-w-[600px] md:min-w-full">
        <thead className="bg-surface-secondary rounded-xl text-xs font-semibold text-text-secondary uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 rounded-tl-xl rounded-bl-xl w-1/3">ዝርዝር (Category)</th>
            {schema.columns[0]?.subKeys.length > 0 ? (
              <th className="px-4 py-3 text-center rounded-tr-xl rounded-br-xl" colSpan={schema.columns[0].subKeys.length}>
                መረጃ (Data)
              </th>
            ) : (
              <th className="px-4 py-3 rounded-tr-xl rounded-br-xl">መረጃ (Data)</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {schema.columns.map((col, idx) => (
            <tr key={col.key} className="hover:bg-surface-secondary/30 transition-colors">
              <td className="px-4 py-4 text-sm font-medium text-text-primary w-1/3">
                {col.key}
              </td>
              <td className="px-4 py-3">
                {col.subKeys.length > 0 ? (
                  <div className="flex gap-3">
                    {col.subKeys.map(subKey => (
                      <div key={subKey} className="flex-1 space-y-1.5">
                        <label className="text-xs text-text-muted block md:hidden">{subKey}</label>
                        <div className="relative group">
                          <span className="absolute -top-2.5 left-2 bg-surface-primary px-1 text-[10px] text-text-muted font-medium hidden md:block z-10">
                            {subKey}
                          </span>
                          <input
                            type="number"
                            value={initialData[col.key]?.[subKey] || ''}
                            onChange={(e) => handleInputChange(col.key, subKey, e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface-primary border border-border-medium rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={initialData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, '', e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-primary border border-border-medium rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                    placeholder="-"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (compact) {
    return (
      <div className="w-full">
        {tableBody}
      </div>
    );
  }

  return (
    <div className={`bg-surface-primary rounded-2xl border transition-all duration-200 overflow-hidden ${
      isCompleted 
        ? 'border-status-success/30 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]' 
        : isOpen 
          ? 'border-brand-blue/30 shadow-[0_0_0_1px_rgba(0,102,255,0.1)] shadow-md' 
          : 'border-border-light shadow-sm hover:border-border-medium'
    }`}>
      {/* Header / Accordion Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-surface-secondary/30"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            isCompleted ? 'bg-status-success/10 text-status-success' : 'bg-brand-blue/10 text-brand-blue'
          }`}>
            {isCompleted ? <IconCheck size={18} /> : <span className="text-sm font-bold">{schema.id.replace('form_', '')}</span>}
          </div>
          <h3 className="font-semibold text-text-primary leading-tight pr-4">
            {schema.table_title}
          </h3>
        </div>
        <div className="text-text-muted shrink-0">
          {isOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
        </div>
      </button>

      {/* Body / Form Inputs */}
      {isOpen && (
        <div className="p-5 pt-2 border-t border-border-light bg-surface-secondary/10 animate-in slide-in-from-top-2 duration-200">
          {tableBody}
        </div>
      )}
    </div>
  );
}
