import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FormsAdminView } from "@/components/dashboard/FormsAdminView";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function FormsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Fetch representatives
  const { data: reps } = await supabase
    .from('user_profiles')
    .select('user_id, region, system_role, users:user_id(full_name, phone_number)')
    .eq('system_role', 'representative');

  // Fetch reports
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <FormsAdminView initialRepresentatives={reps || []} initialReports={reports || []} />
    </DashboardLayout>
  );
}
