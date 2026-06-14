'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconUserPlus, IconSearch, IconFilter, IconBuilding, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { personnelService } from "@/services/personnel";
import { Personnel } from "@/types";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personnelService.getPersonnel().then(data => {
      setPersonnel(data);
      setLoading(false);
    });
  }, []);

  const columns: ColumnDef<Personnel>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-secondary to-surface-primary border border-border/50 flex items-center justify-center font-bold text-text-primary text-sm shadow-sm transition-transform group-hover:scale-105">
            {row.original.name.charAt(0)}{row.original.name.split(' ')[1]?.charAt(0)}
          </div>
          <span className="text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Official Title & Role",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-text-secondary">{row.original.position}</div>
          <div className="text-[11px] text-text-muted mt-0.5">{row.original.department}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-xs text-text-muted">{row.original.email}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.original.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/personnel/${row.original.id}`} className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors border border-border/30">
            <IconEdit size={16} />
          </Link>
          <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors border border-border/30">
            <IconTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  const mainOffice = personnel.filter(p => p.officeCategory === 'Main Office');
  const branchOffices = personnel.filter(p => p.officeCategory !== 'Main Office');

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
        
        {loading ? (
          <div className="flex items-center justify-center h-48">Loading...</div>
        ) : (
          <div className="flex flex-col gap-8 pb-10">
            {/* Main Office Group */}
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <IconBuilding size={16} />
                ኮሚሽን ጽ/ቤት (Main Office)
              </h2>
              <DataTable columns={columns} data={mainOffice} />
            </div>

            {/* Branch Offices Group */}
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <IconBuilding size={16} />
                የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branch Offices)
              </h2>
              <DataTable columns={columns} data={branchOffices} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
