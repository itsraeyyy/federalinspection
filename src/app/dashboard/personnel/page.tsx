import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconUserPlus, IconSearch, IconFilter, IconBuilding, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import Link from "next/link";

export default function PersonnelPage() {
  const mainOffice = [
    { id: 1, name: 'Dr. Abebe Bekele', role: 'Chief Commissioner', title: 'ዋና ኮሚሽነር', status: 'Active', email: 'abebe.b@cidms.gov.et' },
    { id: 2, name: 'Helen Tadesse', role: 'Head of Communications', title: 'ኮሚሽን ማኔጅመንት አባላት', status: 'Active', email: 'helen.t@cidms.gov.et' },
  ];

  const branchOffices = [
    { id: 3, name: 'Chala Desta', role: 'Branch Manager (South)', title: 'ዋና ኮሚሽነር (ቅርንጫፍ)', status: 'On Leave', email: 'chala.d@cidms.gov.et' },
    { id: 4, name: 'Aster Mengistu', role: 'Document Controller', title: 'ጸሃፊና ጽህፈት ቤት ሃላፊ', status: 'Active', email: 'aster.m@cidms.gov.et' },
  ];

  const renderTable = (people: typeof mainOffice) => (
    <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md p-2">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
            <th className="font-semibold py-4 px-6">Name</th>
            <th className="font-semibold py-4 px-4">Official Title & Role</th>
            <th className="font-semibold py-4 px-4">Email</th>
            <th className="font-semibold py-4 px-4">Status</th>
            <th className="font-semibold py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/10">
          {people.map((person) => (
            <tr key={person.id} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
              <td className="py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-secondary to-surface-primary border border-border/50 flex items-center justify-center font-bold text-text-primary text-sm shadow-sm transition-transform group-hover:scale-105">
                    {person.name.charAt(0)}{person.name.split(' ')[1]?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">{person.name}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-text-secondary">{person.title}</div>
                <div className="text-[11px] text-text-muted mt-0.5">{person.role}</div>
              </td>
              <td className="py-4 px-4 text-xs text-text-muted">{person.email}</td>
              <td className="py-4 px-4">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${person.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {person.status}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/dashboard/personnel/${person.id}`} className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors border border-border/30">
                    <IconEdit size={16} />
                  </Link>
                  <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors border border-border/30">
                    <IconTrash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Personnel Directory</h1>
            <p className="text-sm text-text-muted mt-1">Manage leadership and staff records across all branches.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search staff..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors" />
            </div>
            <button className="flex items-center justify-center p-2.5 rounded-full border border-border/30 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              <IconFilter size={18} />
            </button>
            <Link href="/dashboard/personnel/create" className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconUserPlus size={18} />
              Add Staff
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col gap-8 pb-10">
          {/* Main Office Group */}
          <div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
              <IconBuilding size={16} />
              ኮሚሽን ጽ/ቤት (Main Office)
            </h2>
            {renderTable(mainOffice)}
          </div>

          {/* Branch Offices Group */}
          <div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
              <IconBuilding size={16} />
              የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branch Offices)
            </h2>
            {renderTable(branchOffices)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
