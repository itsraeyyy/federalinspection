import { FormsRepView } from "@/components/dashboard/forms/FormsRepView";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { ReportPeriod } from "@/lib/et-calendar";

export default async function RepHistoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect('/representative/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('system_role, region, user_id')
    .eq('user_id', userData.user.id)
    .single();

  if (profile?.system_role !== 'representative') {
    redirect('/');
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
    .select('*')
    .order('id');
    
  const sortedSchemas = (schemas || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

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
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm font-medium text-text-secondary hover:text-brand-blue px-4 py-2 rounded-lg hover:bg-surface-secondary transition-all">
            ዘግተው ይውጡ (Sign Out)
          </button>
        </form>
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
