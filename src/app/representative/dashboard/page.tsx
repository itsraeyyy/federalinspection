import { FormsRepView } from "@/components/dashboard/forms/FormsRepView";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RepDashboardPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect('/representative/login');
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('system_role, region, user_id')
    .eq('user_id', userData.user.id)
    .single();

  if (profile?.system_role !== 'representative') {
    redirect('/');
  }

  // If force password reset is required, redirect to the reset page
  if (userData.user.user_metadata?.requires_password_change) {
    redirect('/representative/change-password');
  }

  // Rep data fetching
  const { data: currentReports } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', profile.user_id);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-end">
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm font-medium text-text-secondary hover:text-brand-blue">
            ዘግተው ይውጡ (Sign Out)
          </button>
        </form>
      </div>
      <FormsRepView userProfile={profile} initialReports={currentReports || []} />
    </div>
  );
}
