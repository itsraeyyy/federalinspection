import { FormsRepView } from "@/components/dashboard/forms/FormsRepView";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { ReportPeriod } from "@/lib/et-calendar";
import { RepLogoutButton } from "@/components/layout/rep-logout-button";
import { sortFormSchemas } from "@/utils/schemaSort";

export default async function RepHistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect('/representative/login');
  }

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

  // Fetch the specific report
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (!report || report.region !== profile.region) {
    redirect('/representative/dashboard/history');
  }

  // Fetch all reports for the region so they can still use the dropdown if they want, 
  // but we default to this report's year and period
  const { data: allReports } = await supabase
    .from('reports')
    .select('*')
    .eq('region', profile.region);

  // Fetch dynamic schemas (fallback)
  const { data: schemas } = await supabase
    .from('form_schemas')
    .select('*');
    
  const sortedSchemas = sortFormSchemas(schemas || []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-surface-primary p-1 rounded-xl shadow-sm border border-border-light w-fit">
          <Link
            href="/representative/dashboard/history"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5"
          >
            <IconArrowLeft size={18} />
            ወደ ታሪክ ተመለስ (Back to History)
          </Link>
        </div>
        <RepLogoutButton className="text-sm font-medium text-text-secondary hover:text-brand-blue px-4 py-2 rounded-lg hover:bg-surface-secondary transition-all w-auto">
          ዘግተው ይውጡ (Sign Out)
        </RepLogoutButton>
      </div>

      {/* Warning banner indicating they are viewing history */}
      <div className="max-w-4xl mx-auto mb-4 bg-brand-blue/10 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
        <div>
          <h3 className="font-bold text-brand-blue text-sm">የታሪክ ማህደር (History View)</h3>
          <p className="text-xs text-text-secondary mt-0.5">እየተመለከቱ ያሉት ከዚህ በፊት የቀረበ የ{report.year} {report.period} ሪፖርትን ነው።</p>
        </div>
      </div>

      <FormsRepView 
        userProfile={profile} 
        initialReports={allReports || []} 
        initialSchemas={sortedSchemas} 
        defaultYear={report.year}
        defaultPeriod={report.period as ReportPeriod}
      />
    </div>
  );
}
