'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { supabase } from '@/lib/supabaseClient';
import { PlusCircle, QrCode, FileCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AssessmentPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const loadPeriods = async () => {
    // Fetch periods. Based on RLS, admins will see all periods.
    const { data, error } = await supabase
      .from('assessment_periods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPeriods(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'የምዘና ጊዜ ማጥፋት',
      message: `እርግጠኛ ነዎት '${name}' የምዘና ጊዜን ማጥፋት ይፈልጋሉ? ይህ እርምጃ ሁሉንም ውጤቶች እና መረጃዎች ሙሉ በሙሉ ያጠፋል።`,
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase
          .from('assessment_periods')
          .delete()
          .eq('id', id);
          
        if (error) {
          alert('ማጥፋት አልተሳካም።');
          console.error(error);
          setLoading(false);
        } else {
          await loadPeriods();
        }
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-primary p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-heading text-text-primary mb-1">የምዘና ጊዜ</h1>
            <p className="text-text-secondary text-sm">የምዘና ጊዜዎችን ያስተዳድሩ፣ መጋበዣ (QR) ያዘጋጁ፣ እና ውጤቶችን ያፅድቁ።</p>
          </div>
          <Link 
            href="/dashboard/assessment/teams/new"
            className="inline-flex items-center justify-center bg-brand-blue text-white px-5 py-2.5 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 shadow-sm"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            አዲስ የምዘና ጊዜ ፍጠር
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-text-muted">በመጫን ላይ...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {periods.length > 0 ? (
              periods.map((period) => (
                <div key={period.id} className="premium-card p-6 flex flex-col h-full relative group card-hover">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-xl font-heading font-semibold text-text-primary truncate">
                        {period.name}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        መለያ: <span className="font-mono text-xs opacity-70">{period.id.substring(0, 8)}...</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        period.status === 'active' 
                          ? 'bg-warning/10 text-warning border border-warning/20' 
                          : 'bg-success/10 text-success border border-success/20'
                      }`}>
                        {period.status === 'active' ? 'በሂደት ላይ' : 'የተጠናቀቀ'}
                      </span>
                      <button 
                        onClick={() => handleDelete(period.id, period.name)}
                        className="text-text-muted hover:text-danger p-1 rounded-md hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Period"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-4 border-t border-border/60">
                    <Link 
                      href={`/dashboard/assessment/teams/${period.id}/qr`}
                      className="flex-1 inline-flex items-center justify-center bg-surface-secondary text-text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-border transition-colors border border-border"
                      title="Generate QR Invite"
                    >
                      <QrCode className="w-4 h-4 mr-2 text-brand-yellow" />
                      መጋበዣ QR
                    </Link>
                    <Link 
                      href={`/dashboard/assessment/teams/${period.id}`}
                      className="flex-1 inline-flex items-center justify-center bg-brand-blue text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors shadow-sm"
                    >
                      <FileCheck className="w-4 h-4 mr-2" />
                      አስተዳድር
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-surface-primary rounded-2xl border border-border border-dashed">
                <div className="w-16 h-16 rounded-full bg-surface-secondary/50 mx-auto mb-4 flex items-center justify-center">
                  <PlusCircle className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-1">ምንም የምዘና ጊዜ የለም</h3>
                <p className="text-text-secondary text-sm">አዲስ የምዘና ጊዜ በመፍጠር የግምገማ ሂደቱን ይጀምሩ።</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </DashboardLayout>
  );
}
