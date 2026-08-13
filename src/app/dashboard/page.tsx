import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/ui/stat-card";
import { Greeting } from "@/components/ui/greeting";
import { 
  IconNews, 
  IconFileText, 
  IconUsers, 
  IconMessage2, 
  IconChartBar, 
  IconBuilding,
  IconArrowUpRight
} from '@tabler/icons-react';
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { verifyAdminUser } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify admin access server-side
  const isAdminAuthorized = await verifyAdminUser(user.id, user.email);
  if (!isAdminAuthorized) {
    redirect('/auth/login?error=unauthorized');
  }

  // Fetch real analytics data from Supabase
  const [
    { count: totalComplaintsCount },
    { count: resolvedComplaintsCount },
    { count: newComplaintsCount },
    { count: totalPersonnelCount },
    { count: branchCount },
    { count: commissionMembersCount },
    { count: totalPeriodsCount },
    { data: branchLeaders }
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).ilike('status', 'resolved'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).or('status.ilike.new,status.ilike.processing,status.is.null'),
    supabase.from('personnel').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('personnel').select('*', { count: 'exact', head: true }).eq('office_category', 'branch'),
    supabase.from('personnel').select('*', { count: 'exact', head: true }).eq('office_category', 'commission-members'),
    supabase.from('assessment_periods').select('*', { count: 'exact', head: true }),
    supabase.from('personnel').select('region, name_am, position_am, status').eq('office_category', 'branch').order('created_at', { ascending: true })
  ]);

  const totalComplaints = totalComplaintsCount ?? 0;
  const resolvedComplaints = resolvedComplaintsCount ?? 0;
  const newComplaints = newComplaintsCount ?? 0;
  const totalPersonnel = totalPersonnelCount ?? 0;
  const totalBranches = branchCount ?? 0;
  const totalCommissionMembers = commissionMembersCount ?? 0;
  const totalPeriods = totalPeriodsCount ?? 0;

  // Resolution Rate %
  const resolutionRate = totalComplaints > 0 
    ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
    : '0.0';

  return (
    <DashboardLayout>
      {/* Header - Original Design */}
      <div className="flex flex-col mb-10 pt-6">
        <h1 className="text-4xl font-light text-text-primary mb-2 tracking-tight flex items-center gap-3">
          <span className="text-brand-yellow drop-shadow-md">☕</span> <Greeting />, አስተዳዳሪ
        </h1>
        <p className="text-text-secondary text-sm">የዛሬው የስርዓት አጠቃላይ እይታ።</p>
      </div>

      {/* Stat Cards - Original Grid Layout with New Accurate Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="ጥቆማዎችና አቤቱታዎች"
          value={totalComplaints.toLocaleString()}
          description={`${totalComplaints} አጠቃላይ የቀረቡ ጉዳዮች`}
          accentColor="purple"
          icon={IconMessage2}
        />
        <StatCard
          label="የመፍትሔ አሰጣጥ ምጣኔ"
          value={`${resolutionRate}%`}
          description={`${resolvedComplaints} ውሳኔ የተሰጣቸው • ${newComplaints} በሂደት ላይ`}
          accentColor="green"
          icon={IconChartBar}
        />
        <StatCard
          label="የአመራር አካላት"
          value={totalPersonnel.toLocaleString()}
          description={`${totalBranches} ቅርንጫፍ ኃላፊዎች • ${totalCommissionMembers} ኮሚሽን አባላት`}
          accentColor="blue"
          icon={IconUsers}
        />
        <StatCard
          label="የተካሄዱ ምዘናዎች"
          value={totalPeriods.toLocaleString()}
          description={`${totalPeriods} ንቁ የምዘనా ዙሮች`}
          accentColor="yellow"
          icon={IconFileText}
        />
      </div>

      {/* Main Analytics Content */}
      <div className="flex flex-col gap-6 mb-8 w-full">
        {/* Complaints & Whistleblowing Detailed Analytics Panel */}
        <div className="premium-card p-6 bg-surface-primary/60 border-border/40 rounded-3xl w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <IconMessage2 size={18} className="text-brand-purple" />
                የጥቆማዎችና አቤቱታዎች አጠቃላይ ሁኔታ
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">የቀረቡ አቤቱታዎችና ጥቆማዎች የሂደት ሁኔታ ክፍፍል</p>
            </div>
            <Link href="/dashboard/complaints" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
              ዝርዝር ይመልከቱ <IconArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: New / Incoming */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">አዲስ ጥቆማዎችና አቤቱታዎች</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600">አዲስ</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">{newComplaints}</div>
              <div className="w-full bg-border/30 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: totalComplaints > 0 ? `${(newComplaints / totalComplaints) * 100}%` : '0%' }} />
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">በምርመራ ላይ ያሉ</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600">በሂደት</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">0</div>
              <div className="w-full bg-border/30 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            {/* Card 3: Resolved */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">ውሳኔ ያገኙ</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600">ውሳኔ ያገኘ</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">{resolvedComplaints}</div>
              <div className="w-full bg-border/30 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: totalComplaints > 0 ? `${(resolvedComplaints / totalComplaints) * 100}%` : '0%' }} />
              </div>
            </div>

            {/* Card 4: Rejected / Closed */}
            <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">ውድቅ የተደረጉ / የተዘጉ</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600">የተዘገ</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">0</div>
              <div className="w-full bg-border/30 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>

          {/* Overall Resolution Bar */}
          <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
                <IconChartBar size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">የአቤቱታ መፍትሔ አሰጣጥ ምጣኔ</h4>
                <p className="text-[11px] text-text-secondary mt-0.5">የቀረቡ አቤቱታዎችና ጥቆማዎች አጠቃላይ ምላሽ አሰጣጥ አፈጻጸም</p>
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="text-xl font-bold text-brand-blue">{resolutionRate}%</span>
              <p className="text-[10px] text-text-muted font-medium">የስርዓቱ አጠቃላይ አፈጻጸም</p>
            </div>
          </div>
        </div>

        {/* Regional Offices Breakdown Panel */}
        <div className="premium-card p-6 bg-surface-primary/60 border-border/40 rounded-3xl w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <IconBuilding size={18} className="text-brand-blue" />
                የኮሚሽኑ ቅርንጫፍ ጽሕፈት ቤቶች አወቃቀር
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">በ 13 ቱም ክልሎችና አስተዳደሮች ያሉ የቅርንጫፍ ጽ/ቤት ኃላፊዎች</p>
            </div>
            <Link href="/dashboard/personnel" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
              አመራሮችን ማስተዳደር <IconArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {branchLeaders && branchLeaders.length > 0 ? (
              branchLeaders.map((leader, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-surface-secondary/30 border border-border/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-text-primary">{leader.region}</p>
                    <p className="text-[11px] text-text-muted truncate max-w-[150px]" title={leader.name_am}>{leader.name_am}</p>
                  </div>
                  <span className="size-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0" title="Active Head" />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-text-muted">ምንም ቅርንጫፍ ኃላፊዎች አልተገኙም።</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
