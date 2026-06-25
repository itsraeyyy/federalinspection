import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RepresentativeDashboardView } from "@/components/dashboard/RepresentativeDashboardView";

export default async function RepresentativeDashboard() {
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/login');
  }

  // Fetch representative profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('region')
    .eq('user_id', session.user.id)
    .single();

  if (!profile || !profile.region) {
    // Not a representative
    return <div className="p-8 text-center text-status-error">እርስዎ የተመዘገቡ የክልል ተወካይ አይደሉም።</div>;
  }

  // Fetch past and current reports
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <RepresentativeDashboardView 
      userId={session.user.id} 
      region={profile.region} 
      initialReports={reports || []} 
    />
  );
}
