import { supabaseAdmin } from "@/lib/supabaseAdmin";
import DashboardUI from "./DashboardUI";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const revalidate = 0; // Dynamic rendering

export default async function AnalyticsPage(props: { searchParams: Promise<{ range?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabaseAdmin
    .from('admin_profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status?.toLowerCase() !== 'active') {
    redirect('/auth/login?error=unauthorized');
  }

  const searchParams = await props.searchParams;
  const range = searchParams.range || "30d";
  
  const end_date = new Date();
  const start_date = new Date();
  
  if (range === "24h") {
    start_date.setHours(start_date.getHours() - 24);
  } else if (range === "7d") {
    start_date.setDate(start_date.getDate() - 7);
  } else if (range === "90d") {
    start_date.setDate(start_date.getDate() - 90);
  } else {
    // Default 30d
    start_date.setDate(start_date.getDate() - 30);
  }

  const { data, error } = await supabaseAdmin.rpc("get_analytics_summary", {
    start_date: start_date.toISOString(),
    end_date: end_date.toISOString()
  });

  if (error) {
    console.error("Error fetching analytics data:", JSON.stringify(error, null, 2), error.message, error.details, error.hint);
  }

  const defaultData = {
    total_views: 0,
    unique_visitors: 0,
    bounce_rate: 0,
    time_series: [],
    top_pages: [],
    top_referrers: [],
    devices: [],
    locations: []
  };

  const analyticsData = data || defaultData;

  return (
    <DashboardLayout>
      <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8 font-sans">
        <div className="mx-auto max-w-6xl space-y-8">
          <Suspense fallback={<div className="h-full flex items-center justify-center p-12"><div className="animate-pulse flex flex-col gap-4 w-full"><div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div><div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div></div></div>}>
            <DashboardUI initialData={analyticsData} currentRange={range} />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
