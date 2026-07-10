import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconHistory, IconEye, IconCalendar, IconCheck, IconChecks, IconAlertCircle } from "@tabler/icons-react";
import { formatECDate } from "@/lib/date-formatter";

export default async function RepHistoryPage() {
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

  // Fetch only submitted/reviewed/approved reports for this region
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('region', profile.region)
    .in('status', ['submitted', 'reviewed', 'approved'])
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <IconCheck size={18} className="text-brand-blue" />;
      case 'reviewed': return <IconChecks size={18} className="text-status-warning" />;
      case 'approved': return <IconChecks size={18} className="text-status-success" />;
      default: return <IconAlertCircle size={18} className="text-text-muted" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'ተልኳል (Submitted)';
      case 'reviewed': return 'ታይቷል (Reviewed)';
      case 'approved': return 'ጸድቋል (Approved)';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-surface-primary p-1 rounded-xl shadow-sm border border-border-light w-fit">
          <a
            href="/representative/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-text-secondary hover:text-brand-blue hover:bg-brand-blue/5"
          >
            አዲስ ሪፖርት (Current Report)
          </a>
          <a
            href="/representative/dashboard/history"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-brand-blue text-white shadow-md"
          >
            የሪፖርት ታሪክ (History)
          </a>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm font-medium text-text-secondary hover:text-brand-blue px-4 py-2 rounded-lg hover:bg-surface-secondary transition-all">
            ዘግተው ይውጡ (Sign Out)
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-surface-primary rounded-2xl p-6 border border-border-light shadow-sm">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <IconHistory className="text-brand-blue" size={28} />
            የ{profile.region} ክልል ያለፉ ሪፖርቶች
          </h1>
          <p className="text-text-muted mt-2">ቀደም ሲል የቀረቡ እና የጸደቁ ሪፖርቶችን ይመልከቱ</p>
        </div>

        {(!reports || reports.length === 0) ? (
          <div className="bg-surface-primary rounded-2xl p-12 border border-border-light shadow-sm flex flex-col items-center justify-center text-center">
            <IconHistory size={48} className="text-border-medium mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">ምንም ሪፖርት የለም (No Reports)</h3>
            <p className="text-text-muted">እስካሁን ያቀረቡት ምንም ሪፖርት የለም።</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-surface-primary border border-border-light rounded-2xl p-5 hover:border-brand-blue/30 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-text-primary font-bold">
                    <IconCalendar size={20} className="text-brand-blue" />
                    {report.year} - {report.period}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-secondary rounded-full text-xs font-semibold">
                    {getStatusIcon(report.status)}
                    <span className="text-text-primary">{getStatusText(report.status)}</span>
                  </div>
                </div>

                <div className="text-sm text-text-secondary space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>የቀረበበት ቀን:</span>
                    <span className="font-medium text-text-primary">{report.submitted_at ? formatECDate(report.submitted_at) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>አስተያየት (Feedback):</span>
                    <span className={`font-medium ${report.admin_feedback ? 'text-status-warning' : 'text-text-muted'}`}>
                      {report.admin_feedback ? 'ተሰጥቷል' : 'የለም'}
                    </span>
                  </div>
                </div>

                <Link 
                  href={`/representative/dashboard/history/${report.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-secondary hover:bg-brand-blue hover:text-white text-text-primary font-medium rounded-xl transition-all"
                >
                  <IconEye size={18} />
                  ሪፖርቱን እይ (View Report)
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
