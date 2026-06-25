import { ReactNode } from "react";
import Link from "next/link";
import { IconDashboard, IconFileDescription } from "@tabler/icons-react";
import { RepLogoutButton } from "@/components/layout/rep-logout-button";

export default function RepresentativeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-bg-primary border-r border-border-light flex flex-col">
        <div className="p-6 border-b border-border-light flex items-center justify-center">
          <h1 className="text-xl font-bold text-brand-blue tracking-tight">ክልል ሪፖርት አቅራቢ</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/representative/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-blue/10 text-brand-blue font-medium transition-colors">
            <IconDashboard size={20} />
            ዳሽቦርድ
          </Link>
          <Link href="/representative/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors">
            <IconFileDescription size={20} />
            ሪፖርቶች
          </Link>
        </nav>
        <div className="p-4 border-t border-border-light">
          <RepLogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
