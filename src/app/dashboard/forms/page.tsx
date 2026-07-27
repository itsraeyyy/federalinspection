import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FormsAdminView } from "@/components/dashboard/FormsAdminView";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import { verifyAdminUser } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const isAdminAuthorized = await verifyAdminUser(user.id, user.email);
  if (!isAdminAuthorized) {
    redirect('/auth/login?error=unauthorized');
  }

  // Admin data fetching via admin client (bypasses RLS issues)
  const { data: fetchedReps } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, region, system_role, users:user_id(full_name, phone_number)')
    .eq('system_role', 'representative');

  const { data: fetchedReports } = await supabaseAdmin
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
    
  const { data: fetchedSchemas } = await supabaseAdmin
    .from('form_schemas')
    .select('*')
    .order('id');
    
  const sortedSchemas = (fetchedSchemas || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return (
    <DashboardLayout>
      <FormsAdminView 
        initialRepresentatives={fetchedReps || []} 
        initialReports={fetchedReports || []} 
        initialSchemas={sortedSchemas}
      />
    </DashboardLayout>
  );
}
