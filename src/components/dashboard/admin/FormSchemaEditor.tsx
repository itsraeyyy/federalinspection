"use client";

import { useState } from "react";
import { FormSchema } from "@/app/actions/form-schemas";
import { IconCheck, IconDeviceFloppy, IconPlus, IconTrash, IconX } from "@tabler/icons-react";

interface FormSchemaEditorProps {
  schema: FormSchema;
  onSave: (id: string, title: string, columns: any[]) => Promise<void>;
  onCancel: () => void;
}

export function FormSchemaEditor({ schema, onSave, onCancel }: FormSchemaEditorProps) {
  const [title, setTitle] = useState(schema.table_title);
  const [columns, setColumns] = useState([...schema.columns]);
  const [isSaving, setIsSaving] = useState(false);

  const addColumn = () => {
    setColumns([...columns, { key: "አዲስ አምድ (New Column)", subKeys: [] }]);
  };

  const removeColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const updateColumnKey = (idx: number, newKey: string) => {
    const newCols = [...columns];
    newCols[idx].key = newKey;
    setColumns(newCols);
  };

  const addSubKey = (colIdx: number) => {
    const newCols = [...columns];
    newCols[colIdx].subKeys.push("አዲስ ንዑስ-አምድ (New Sub-Column)");
    setColumns(newCols);
  };

  const removeSubKey = (colIdx: number, subIdx: number) => {
    const newCols = [...columns];
    newCols[colIdx].subKeys = newCols[colIdx].subKeys.filter((_, i) => i !== subIdx);
    setColumns(newCols);
  };

  const updateSubKey = (colIdx: number, subIdx: number, newSubKey: string) => {
    const newCols = [...columns];
    newCols[colIdx].subKeys[subIdx] = newSubKey;
    setColumns(newCols);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(schema.id, title, columns);
    setIsSaving(false);
  };

  return (
    <div className="bg-surface-primary border border-border-medium rounded-xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6 border-b border-border-light pb-4">
        <h3 className="font-bold text-lg text-text-primary">
          ቅጽ አርትዕ (Edit Form): {schema.id.replace("form_", "")}
        </h3>
        <button onClick={onCancel} className="text-text-muted hover:text-status-error transition-colors">
          <IconX size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            የሠንጠረዥ ርዕስ (Table Title)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-surface-secondary border border-border-medium rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-text-secondary">
              አምዶች (Columns)
            </label>
            <button
              onClick={addColumn}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 rounded-lg text-sm font-medium transition-colors"
            >
              <IconPlus size={16} /> አምድ ጨምር
            </button>
          </div>

          <div className="space-y-4">
            {columns.map((col, cIdx) => (
              <div key={cIdx} className="p-4 border border-border-light rounded-xl bg-surface-secondary/30 relative">
                <button
                  onClick={() => removeColumn(cIdx)}
                  className="absolute top-4 right-4 text-text-muted hover:text-status-error"
                >
                  <IconTrash size={18} />
                </button>
                <div className="mb-4 pr-8">
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    ዋና አምድ (Main Column)
                  </label>
                  <input
                    type="text"
                    value={col.key}
                    onChange={(e) => updateColumnKey(cIdx, e.target.value)}
                    className="w-full px-3 py-2 bg-surface-primary border border-border-medium rounded-lg text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="pl-4 border-l-2 border-border-medium">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-text-muted">
                      ንዑስ-አምዶች (Sub-columns)
                    </label>
                    <button
                      onClick={() => addSubKey(cIdx)}
                      className="text-xs text-brand-blue font-medium flex items-center gap-1 hover:underline"
                    >
                      <IconPlus size={14} /> ንዑስ-አምድ ጨምር
                    </button>
                  </div>
                  
                  {col.subKeys.length === 0 ? (
                    <p className="text-xs text-text-muted italic">ምንም ንዑስ-አምድ የለም። ነጠላ ግብዓት ይሆናል (Single input field).</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {col.subKeys.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sub}
                            onChange={(e) => updateSubKey(cIdx, sIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-surface-primary border border-border-medium rounded-md text-xs focus:outline-none focus:border-brand-blue"
                          />
                          <button
                            onClick={() => removeSubKey(cIdx, sIdx)}
                            className="text-text-muted hover:text-status-error p-1 rounded-md hover:bg-status-error/10"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border-light flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border-medium text-text-secondary hover:bg-surface-secondary font-medium transition-colors"
          >
            ሰርዝ (Cancel)
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-medium flex items-center gap-2 shadow-md transition-colors disabled:opacity-70"
          >
            {isSaving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <IconDeviceFloppy size={20} />
            )}
            አስቀምጥ (Save Changes)
          </button>
        </div>
      </div>
    </div>
  );
}
