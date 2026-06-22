import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconTool } from "@tabler/icons-react";

export default function FormsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mb-2">
          <IconTool size={40} />
        </div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">ቅጾች</h1>
        <p className="text-lg text-text-muted">ይህ ገፅ በመሰራት ላይ ነው</p>
      </div>
    </DashboardLayout>
  );
}
