import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/ui/stat-card";
import { RecentActivity } from "@/components/ui/recent-activity";
import { IconNews, IconFileText, IconUsers, IconMessage2, IconQrcode, IconCheck, IconX, IconDeviceMobile, IconChartBar } from '@tabler/icons-react';
import Link from "next/link";

export default function DashboardPage() {
  const qrRequests = [
    { id: 'REQ-4912', device: 'iPhone 13', file: 'Annual_Budget_2026.pdf', time: '10 mins ago' },
    { id: 'REQ-4911', device: 'Chrome/Windows', file: 'Commission_Bylaws.pdf', time: '1 hour ago' },
    { id: 'REQ-4910', device: 'Samsung S24', file: 'Q3_Report.docx', time: '3 hours ago' },
  ];

  return (
    <DashboardLayout>
      {/* Top Header Section */}
      <div className="flex flex-col mb-10 pt-6">
        <h1 className="text-4xl font-light text-text-primary mb-2 tracking-tight flex items-center gap-3">
          <span className="text-brand-yellow drop-shadow-md">☕</span> Good morning, Administrator
        </h1>
        <p className="text-text-secondary text-sm">Here's your system overview for today.</p>
      </div>
      
      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Documents Library" 
          value="1,482" 
          accentColor="yellow" 
          icon={IconFileText} 
          substats={[
            { label: 'Added', value: '42' },
            { label: 'Archived', value: '12' }
          ]}
          badge="Synced"
        />
        <StatCard 
          label="News & Media" 
          value="124" 
          accentColor="green" 
          icon={IconNews} 
          substats={[
            { label: 'Published', value: '118' },
            { label: 'Drafts', value: '6' }
          ]}
          badge="Active"
        />
        <StatCard 
          label="Citizen Complaints" 
          value="48" 
          accentColor="purple" 
          icon={IconMessage2} 
          substats={[
            { label: 'New', value: '12' },
            { label: 'Resolved', value: '36' }
          ]}
          badge="Priority"
        />
        <StatCard 
          label="Registered Personnel" 
          value="342" 
          accentColor="red" 
          icon={IconUsers} 
          substats={[
            { label: 'Active', value: '310' },
            { label: 'Leave', value: '32' }
          ]}
          badge="Verified"
        />
      </div>

      {/* QR Requests + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* QR Pending Requests */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              Pending QR Requests
            </h2>
            <Link href="/dashboard/qr-access" className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:underline">
              View All →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {qrRequests.map(req => (
              <div key={req.id} className="bg-surface-primary/30 border border-border/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-surface-primary/50 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-warning/50"></div>
                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-surface-secondary flex items-center justify-center text-text-muted">
                      <IconDeviceMobile size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{req.device}</span>
                        <span className="text-[10px] text-text-muted">• {req.time}</span>
                      </div>
                      <span className="text-xs text-brand-blue font-medium">{req.file}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 bg-success/10 hover:bg-success/20 text-success px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                      <IconCheck size={12} stroke={3} /> Approve
                    </button>
                    <button className="flex items-center gap-1 bg-danger/10 hover:bg-danger/20 text-danger px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                      <IconX size={12} stroke={3} /> Deny
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Quick Actions</h2>
          <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-5 backdrop-blur-md flex flex-col gap-3 flex-1">
            <Link href="/dashboard/personnel/create" className="w-full py-3 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-sm font-medium transition-colors border border-brand-blue/20 flex items-center justify-center gap-2">
              <IconUsers size={16} /> Add New Staff
            </Link>
            <Link href="/dashboard/news/create" className="w-full py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50 flex items-center justify-center gap-2">
              <IconNews size={16} /> Create News Article
            </Link>
            <Link href="/dashboard/qr-access" className="w-full py-3 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50 flex items-center justify-center gap-2">
              <IconQrcode size={16} /> Manage QR Codes
            </Link>
            <Link href="/dashboard/statistics" className="w-full py-3 bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow rounded-xl text-sm font-medium transition-colors border border-brand-yellow/20 flex items-center justify-center gap-2">
              <IconChartBar size={16} /> View Statistics
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="w-full pb-8">
        <RecentActivity />
      </div>
    </DashboardLayout>
  );
}
