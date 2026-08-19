import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdminHistoryView } from "@/components/dashboard/history/AdminHistoryView";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { verifyAdminUser } from "@/lib/adminAuth";

import { sortFormSchemas } from "@/utils/schemaSort";

export const dynamic = 'force-dynamic';

export default async function ReportsHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const isAdminAuthorized = await verifyAdminUser(user.id, user.email);
  if (!isAdminAuthorized) {
    redirect('/auth/login?error=unauthorized');
  }

  // Fetch all submitted, reviewed, and approved reports via authenticated session client
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .in('status', ['submitted', 'submitted_to_federal', 'reviewed', 'approved'])
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });
    
  const { data: schemas } = await supabase
    .from('form_schemas')
    .select('*');
    
  const sortedSchemas = sortFormSchemas(schemas || []);

  return (
    <DashboardLayout>
      <AdminHistoryView 
        initialReports={reports || []} 
        initialSchemas={sortedSchemas}
      />
    </DashboardLayout>
  );
}
