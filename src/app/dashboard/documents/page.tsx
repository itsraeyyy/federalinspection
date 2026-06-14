'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconFolder, IconFileText, IconUpload, IconSearch, IconDotsVertical } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { documentService } from "@/services/documents";
import { Document } from "@/types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService.getDocuments().then(data => {
      setDocuments(data);
      setLoading(false);
    });
  }, []);

  const folders = [
    { id: 1, name: 'ኮሚሽን ዋና ጽ/ቤት (Main Office)', code: 'ADMIN_DEFINED', files: 124 },
    { id: 2, name: 'የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branches)', code: '14', files: 86 },
  ];

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "title",
      header: "Document Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <IconFileText size={20} className="text-text-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary group-hover:text-brand-yellow transition-colors">{row.original.title}</span>
            <span className="text-[10px] text-text-muted mt-0.5">{row.original.fileType}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "folderCode",
      header: "Folder",
      cell: ({ row }) => <span className="text-xs text-text-secondary">{row.original.folderCode}</span>,
    },
    {
      accessorKey: "uploadDate",
      header: "Metadata",
      cell: ({ row }) => (
        <div>
          <div className="text-xs text-text-secondary">{row.original.uploadedBy}</div>
          <div className="text-[10px] text-text-muted mt-0.5">{row.original.uploadDate} • {row.original.version}</div>
        </div>
      ),
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      cell: ({ row }) => (
        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${row.original.visibility === 'Public' ? 'bg-success/10 text-success' : row.original.visibility === 'Restricted' ? 'bg-danger/10 text-danger' : 'bg-surface-secondary text-text-secondary'}`}>
          {row.original.visibility}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="text-right">
          <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100">
            <IconDotsVertical size={16} />
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
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Document Repository</h1>
            <p className="text-sm text-text-muted mt-1">Manage, secure, and distribute official files.</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search files..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 w-64 transition-colors" />
            </div>
            <button className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconUpload size={18} />
              Upload File
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          {folders.map(folder => (
            <div key={folder.id} className="bg-surface-primary/30 border border-border/20 rounded-[2rem] p-5 backdrop-blur-sm hover:bg-surface-primary/50 transition-colors cursor-pointer group flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 text-brand-yellow flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <IconFolder size={24} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-sm font-medium text-text-primary truncate">{folder.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">CODE: {folder.code}</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span className="text-xs text-text-secondary">{folder.files} Files</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">Recent Documents</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">Loading...</div>
          ) : (
             <DataTable columns={columns} data={documents} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
