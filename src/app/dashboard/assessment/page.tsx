import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconClipboardCheck } from "@tabler/icons-react";

export default function AssessmentPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full gap-6 pb-20">
        <div className="w-20 h-20 rounded-3xl bg-surface-secondary/50 border border-border/30 flex items-center justify-center">
          <IconClipboardCheck size={36} stroke={1.5} className="text-text-muted" />
        </div>
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-light text-text-primary tracking-tight mb-2">Assessments</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            This module is currently under development. Assessment workflows, scoring rubrics, and review tools will be available here soon.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-primary/40 border border-border/20 rounded-full px-5 py-2.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Coming Soon</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
