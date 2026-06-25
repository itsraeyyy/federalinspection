'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconUserPlus, IconSearch, IconEdit, IconTrash, IconShield, IconShieldCheck, IconShieldHalf } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { adminService } from "@/services/admins";
import { Admin, PERMISSION_GROUPS, ALL_MODULES } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// @BACKEND: This component displays admins from the mock service.
// Once the API is live, all CRUD operations flow through adminService.

function getRoleLabel(admin: Admin): { label: string; icon: React.ReactNode; color: string } {
  if (admin.accessLevel === 'all') {
    return {
      label: 'ሙሉ መዳረሻ',
      icon: <IconShieldCheck size={14} />,
      color: 'bg-success/10 text-success',
    };
  }
  if (admin.accessLevel === 'group') {
    const names = admin.groups.map(g => PERMISSION_GROUPS[g as keyof typeof PERMISSION_GROUPS]?.labelAm || g).join(', ');
    return {
      label: names || 'የቡድን መዳረሻ',
      icon: <IconShieldHalf size={14} />,
      color: 'bg-brand-blue/10 text-brand-blue',
    };
  }
  const names = admin.modules.map(m => ALL_MODULES.find(mod => mod.id === m)?.labelAm || m).join(', ');
  return {
    label: names || 'የተወሰነ መዳረሻ',
    icon: <IconShield size={14} />,
    color: 'bg-warning/10 text-warning',
  };
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    idToDelete: string | null;
  }>({ isOpen: false, idToDelete: null });

  useEffect(() => {
    adminService.getAdmins().then(data => {
      setAdmins(data);
      setLoading(false);
    });
  }, []);

  const deleteAdmin = (id: string) => {
    setConfirmDialog({ isOpen: true, idToDelete: id });
  };

  const confirmDelete = async () => {
    if (confirmDialog.idToDelete) {
      await adminService.deleteAdmin(confirmDialog.idToDelete);
      setAdmins(prev => prev.filter(a => a.id !== confirmDialog.idToDelete));
      setConfirmDialog({ isOpen: false, idToDelete: null });
    }
  };

  const columns: ColumnDef<Admin>[] = [
    {
      id: "name",
      header: "ስም",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-secondary to-surface-primary border border-border/50 flex items-center justify-center font-bold text-text-primary text-sm shadow-sm">
            {row.original.name.charAt(0)}{row.original.name.split(' ')[1]?.charAt(0)}
          </div>
          <div>
            <span className="text-sm font-medium text-text-primary">{row.original.name}</span>
            <div className="text-[11px] text-text-muted mt-0.5">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: "access",
      header: "የመዳረሻ ደረጃ",
      cell: ({ row }) => {
        const role = getRoleLabel(row.original);
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${role.color}`}>
            {role.icon}
            {role.label}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "ሁኔታ",
      cell: ({ row }) => (
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.original.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {row.original.status === 'Active' ? 'ንቁ' : 'እንቅስቃሴ የለም'}
        </span>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "የመጨረሻ ግቤት",
      cell: ({ row }) => <span className="text-xs text-text-muted">{row.original.lastLogin}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/admins/${row.original.id}`} className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors border border-border/30">
            <IconEdit size={16} />
          </Link>
          <button onClick={() => deleteAdmin(row.original.id)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors border border-border/30">
            <IconTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አስተዳዳሪዎች</h1>
            <p className="text-sm text-text-muted mt-1">የስርዓት አስተዳዳሪዎችን እና የመዳረሻ ፍቃዶቻቸውን ያስተዳድሩ።</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="አስተዳዳሪ ይፈልጉ..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors" />
            </div>
            <Link href="/dashboard/admins/create" className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconUserPlus size={18} />
              አዲስ አስተዳዳሪ
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-text-muted">በመጫን ላይ...</div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-text-muted">
            <IconShield size={40} stroke={1} />
            <p className="text-sm">አስተዳዳሪ የለም። አዲስ አስተዳዳሪ ለመፍጠር ከላይ ያለውን ቁልፍ ይጫኑ።</p>
          </div>
        ) : (
          <div className="pb-10">
            <DataTable columns={columns} data={admins} />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title="አስተዳዳሪ ማስወገድ"
        message="እርግጠኛ ነዎት ይህን አስተዳዳሪ ማስወገድ ይፈልጋሉ?"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, idToDelete: null })}
      />
    </DashboardLayout>
  );
}
