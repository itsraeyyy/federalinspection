import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/ui/stat-card";
import { RecentActivity } from "@/components/ui/recent-activity";
import { Greeting } from "@/components/ui/greeting";
import { IconNews, IconFileText, IconUsers, IconMessage2, IconQrcode, IconCheck, IconX, IconDeviceMobile, IconChartBar } from '@tabler/icons-react';
import Link from "next/link";
import { PendingQRRequests } from "@/components/dashboard/pending-qr-requests";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `አሁን`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ደቂቃ በፊት`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ሰዓት በፊት`;
  return `${Math.floor(diffInSeconds / 86400)} ቀን በፊት`;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify admin access cleanly via authenticated session client
  const { data: profile, error: profileErr } = await supabase
    .from('admin_profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profileErr || profile.status?.toLowerCase() !== 'active') {
    console.error("[Dashboard Auth Check Failed] User ID:", user.id, "| Error:", profileErr, "| Found Profile:", profile);
    redirect('/auth/login?error=unauthorized');
  }

  // Fetch all dashboard stats in a single RPC call via authenticated session client
  const [{ data: stats, error: statsErr }, { data: scanRequests }] = await Promise.all([
    supabase.rpc('get_dashboard_stats'),
    supabase.from('scan_requests')
      .select('*')
      .ilike('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  if (statsErr) {
    console.error("[Dashboard Stats Fetch Error]:", statsErr);
  }


  const totalDocs = stats?.total_docs ?? 0;
  const publicDocs = stats?.public_docs ?? 0;
  const privateDocs = totalDocs - publicDocs;
  const totalNews = stats?.total_news ?? 0;
  const publishedNews = stats?.published_news ?? 0;
  const draftNews = stats?.draft_news ?? 0;
  const totalComplaints = stats?.total_complaints ?? 0;
  const resolvedComplaints = stats?.resolved_complaints ?? 0;
  const newComplaints = totalComplaints - resolvedComplaints;
  const totalPersonnel = stats?.total_personnel ?? 0;
  const activePersonnel = stats?.active_personnel ?? 0;
  const onLeavePersonnel = totalPersonnel - activePersonnel;

  const qrRequests = scanRequests?.map(req => ({
    id: req.id,
    device: req.requester_device || 'Unknown Device',
    file: req.file_name || 'Unknown File',
    time: formatTimeAgo(req.created_at)
  })) || [];


  return (
    <DashboardLayout>
      <div className="flex flex-col mb-10 pt-6">
        <h1 className="text-4xl font-light text-text-primary mb-2 tracking-tight flex items-center gap-3">
          <span className="text-brand-yellow drop-shadow-md">☕</span> <Greeting />, አስተዳዳሪ
        </h1>
        <p className="text-text-secondary text-sm">የዛሬው የስርዓት አጠቃላይ እይታ።</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="ሰነዶች"
          value={(totalDocs || 0).toLocaleString()}
          accentColor="yellow"
          icon={IconFileText}
          substats={[
            { label: 'ህዝባዊ', value: (publicDocs || 0).toString() },
            { label: 'የግል', value: privateDocs.toString() }
          ]}
          badge="ተመሳስሏል"
        />
        <StatCard
          label="ዜናዎች"
          value={(totalNews || 0).toLocaleString()}
          accentColor="green"
          icon={IconNews}
          substats={[
            { label: 'ታተመ', value: (publishedNews || 0).toString() },
            { label: 'ረቂቅ', value: (draftNews || 0).toString() }
          ]}
          badge="ንቁ"
        />
        <StatCard
          label="ጥቆማዎች"
          value={(totalComplaints || 0).toLocaleString()}
          accentColor="purple"
          icon={IconMessage2}
          substats={[
            { label: 'አዲስ', value: newComplaints.toString() },
            { label: 'ተፈቷል', value: (resolvedComplaints || 0).toString() }
          ]}
          badge="ቅድመ ተሰጥዎ"
        />
        <StatCard
          label="የተመዘገቡ ተቆጣጣሪዎች "
          value={(totalPersonnel || 0).toLocaleString()}
          accentColor="red"
          icon={IconUsers}
          substats={[
            { label: 'ንቁ', value: (activePersonnel || 0).toString() },
            { label: 'በዕረፍት', value: onLeavePersonnel.toString() }
          ]}
          badge="ተረጋግጧል"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              በመጠባበቅ ላይ ያሉ QR ጥያቄዎች
            </h2>
            <Link href="/dashboard/qr-access" className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:underline">
              ሁሉንም →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <PendingQRRequests initialRequests={qrRequests} />
          </div>
        </div>

        <div className="xl:col-span-1 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">ፈጣን እርምጃዎች</h2>
          <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-5 backdrop-blur-md flex flex-col gap-3 flex-1">
            <Link href="/dashboard/personnel/create" className="w-full py-3 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-sm font-medium transition-colors border border-brand-blue/20 flex items-center justify-center gap-2">
              <IconUsers size={16} /> አዲስ አባል ጨምር
            </Link>
            <Link href="/dashboard/news/create" className="w-full py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50 flex items-center justify-center gap-2">
              <IconNews size={16} /> ዜና ጽሁፍ ፍጠር
            </Link>
            <Link href="/dashboard/qr-access" className="w-full py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50 flex items-center justify-center gap-2">
              <IconQrcode size={16} /> QR ኮዶችን ያስተዳድሩ
            </Link>
            <Link href="/dashboard/statistics" className="w-full py-3 bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow rounded-xl text-sm font-medium transition-colors border border-brand-yellow/20 flex items-center justify-center gap-2">
              <IconChartBar size={16} /> መረጃ ይመልከቱ
            </Link>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
