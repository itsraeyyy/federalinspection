import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ComplaintsHeatmap } from "@/components/dashboard/complaints-heatmap";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateComplaintsGeoJSON } from "@/lib/geojson-utils";
import { IconActivity, IconAlertTriangle, IconChecklist } from "@tabler/icons-react";

export default async function MapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify admin access server-side
  const { data: profile } = await supabaseAdmin
    .from('admin_profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status?.toLowerCase() !== 'active') {
    redirect('/auth/login?error=unauthorized');
  }

  // Fetch real complaints data
  const { data: complaints, error } = await supabaseAdmin
    .from('complaints')
    .select('id, type, target_region, target_zone, created_at, subject, status');
    
  if (error) {
    console.error("Error fetching complaints for map:", error);
  }
    
  const mapData = generateComplaintsGeoJSON(complaints || []);

  return (
    <DashboardLayout>
      <div className="w-full min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-88px)] bg-slate-50 dark:bg-[#0a0a0a] flex flex-col p-4 md:p-6 gap-4 md:gap-6">
        


        {/* The Map Component */}
        <div className="flex-1 min-h-[600px] lg:min-h-[700px] w-full relative bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <ComplaintsHeatmap initialData={mapData} />
          {/* Overlay Grid lines for terminal feel */}
          <div className="absolute inset-0 pointer-events-none bg-[url('https://transparenttextures.com/patterns/grid-me.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

      </div>
    </DashboardLayout>
  );
}
