"use client";

import { useEffect, useState } from "react";
import { getFormSchemas, updateFormSchema, createFormSchema, deleteFormSchema, FormSchema } from "@/app/actions/form-schemas";
import { FormSchemaEditor } from "@/components/dashboard/admin/FormSchemaEditor";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconEdit, IconPlus, IconTrash, IconFileDescription, IconLoader2, IconAlertCircle } from "@tabler/icons-react";

export default function AdminFormsPage() {
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchema, setEditingSchema] = useState<FormSchema | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    setLoading(true);
    const { data, error } = await getFormSchemas();
    if (error) {
      setError(error);
    } else if (data) {
      setSchemas(data);
    }
    setLoading(false);
  };

  const handleSaveSchema = async (id: string, title: string, columns: any[]) => {
    setError(null);
    if (isCreating) {
      const { error } = await createFormSchema(id, title, columns);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const { error } = await updateFormSchema(id, title, columns);
      if (error) {
        setError(error);
        return;
      }
    }
    
    await loadSchemas();
    setEditingSchema(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`እርግጠኛ ነዎት ቅጽ "${id}" ማጥፋት ይፈልጋሉ? (Are you sure?)`)) return;
    
    setError(null);
    const { error } = await deleteFormSchema(id);
    if (error) {
      setError(error);
    } else {
      await loadSchemas();
    }
  };

  const startCreateNew = () => {
    const nextNum = schemas.length + 1;
    const newId = `form_${nextNum.toString().padStart(2, '0')}`;
    setEditingSchema({
      id: newId,
      table_title: "አዲስ ቅጽ (New Form)",
      columns: []
    });
    setIsCreating(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <IconLoader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-surface-primary p-6 rounded-2xl border border-border-light shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">የቅጽ አስተዳደር (Form Management)</h1>
            <p className="text-sm text-text-secondary">የሪፖርት ማቅረቢያ ቅጾችን ያርትዑ ወይም አዲስ ይጨምሩ (Edit or add new report forms)</p>
          </div>
          {!editingSchema && (
            <button 
              onClick={startCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-medium shadow-md hover:bg-brand-blue/90 transition-colors"
            >
              <IconPlus size={20} /> አዲስ ቅጽ (New Form)
            </button>
          )}
        </div>

        {error && (
          <div className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 flex gap-3 text-status-error text-sm font-medium">
            <IconAlertCircle className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {editingSchema ? (
          <FormSchemaEditor 
            schema={editingSchema} 
            onSave={handleSaveSchema} 
            onCancel={() => {
              setEditingSchema(null);
              setIsCreating(false);
            }} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemas.map(schema => (
              <div key={schema.id} className="bg-surface-primary border border-border-light rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-brand-blue/10 text-brand-blue p-2.5 rounded-lg shrink-0">
                    <IconFileDescription size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-brand-blue mb-1 uppercase tracking-wider">{schema.id}</div>
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-tight" title={schema.table_title}>
                      {schema.table_title}
                    </h3>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border-light flex justify-between items-center">
                  <span className="text-xs font-medium text-text-muted">{schema.columns.length} አምዶች (Cols)</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingSchema(schema)}
                      className="p-1.5 text-text-secondary hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors"
                      title="አርትዕ (Edit)"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(schema.id)}
                      className="p-1.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-md transition-colors"
                      title="አጥፋ (Delete)"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
