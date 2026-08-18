import { FormsRepView } from "@/components/dashboard/forms/FormsRepView";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RepLogoutButton } from "@/components/layout/rep-logout-button";

export default async function RepDashboardPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect('/representative/login');
  }

  // Get user profile to determine role (with supabaseAdmin fallback to ensure RLS doesn't block legitimate reps)
  let profile: any = null;
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('system_role, region, user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (userProfile?.system_role === 'representative') {
    profile = userProfile;
  } else {
    const { data: adminProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('system_role, region, user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (adminProfile?.system_role === 'representative') {
      profile = adminProfile;
    }
  }

  // Fallback: check user_metadata for role & region if profile table row is missing
  if (!profile && (userData.user.user_metadata?.role === 'representative' || userData.user.user_metadata?.system_role === 'representative')) {
    profile = {
      system_role: 'representative',
      region: userData.user.user_metadata?.region || 'አዲስ አበባ',
      user_id: userData.user.id,
    };
  }

  if (!profile || profile.system_role !== 'representative') {
    redirect('/representative/login?error=access_denied');
  }

  // If force password reset is required, redirect to the reset page
  if (userData.user.user_metadata?.requires_password_change || userData.user.user_metadata?.force_password_change) {
    redirect('/representative/change-password');
  }

  // Rep data fetching (fetch by region instead of user_id so new reps see history)
  const { data: currentReports } = await supabase
    .from('reports')
    .select('*')
    .eq('region', profile.region);

  // Fetch dynamic schemas
  const { data: schemas } = await supabase
    .from('form_schemas')
    .select('*')
    .order('id');
    
  // Sort them naturally if they have standard names like form_01, form_02, form_02_1
  const sortedSchemas = (schemas || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-surface-primary p-1 rounded-xl shadow-sm border border-border-light w-fit">
          <Link
            href="/representative/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-brand-blue text-white shadow-md"
          >
            አዲስ ሪፖርት (Current Report)
          </Link>
          <Link
            href="/representative/dashboard/history"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5"
          >
            የሪፖርት ታሪክ (History)
          </Link>
        </div>
        <RepLogoutButton className="text-sm font-medium text-text-secondary hover:text-brand-blue px-4 py-2 rounded-lg hover:bg-surface-secondary transition-all w-auto">
          ዘግተው ይውጡ (Sign Out)
        </RepLogoutButton>
      </div>
      <FormsRepView userProfile={profile} initialReports={currentReports || []} initialSchemas={sortedSchemas} />
    </div>
  );
}
