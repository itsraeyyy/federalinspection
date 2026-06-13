import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconUserCircle, IconShieldLock, IconBell, IconPalette, IconLanguage, IconDatabase } from "@tabler/icons-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "Account",
      items: [
        { icon: IconUserCircle, title: "Profile Information", desc: "Update your personal details and avatar." },
        { icon: IconShieldLock, title: "Password & Security", desc: "Manage your password and 2FA settings." },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: IconPalette, title: "Appearance", desc: "Customize the dashboard theme and colors." },
        { icon: IconLanguage, title: "Language & Region", desc: "Set your primary language and timezone." },
        { icon: IconBell, title: "Notifications", desc: "Configure how you receive alerts and updates." },
      ]
    },
    {
      title: "System",
      items: [
        { icon: IconDatabase, title: "Data Management", desc: "Manage backups and storage allocations." },
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pt-2 max-w-4xl h-full">
        <div>
          <h1 className="text-3xl font-light text-text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Manage your account and system preferences.</p>
        </div>
        
        <div className="flex flex-col gap-8 pb-10">
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest">{section.title}</h3>
              <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md divide-y divide-border/10">
                {section.items.map((item, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-surface-secondary/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="p-3 rounded-2xl bg-surface-secondary/50 text-text-secondary group-hover:text-brand-blue group-hover:bg-brand-blue/10 transition-colors">
                        <item.icon size={22} stroke={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">{item.title}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted/50 group-hover:text-brand-blue transition-colors">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
