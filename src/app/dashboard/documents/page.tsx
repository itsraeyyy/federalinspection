'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconFolder, IconFileText, IconUpload, IconSearch, IconDotsVertical, IconFolderPlus, IconArrowLeft, IconDownload } from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { documentService, Folder, Document } from "@/services/documents";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [history, setHistory] = useState<Folder[]>([]);
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async (folder: Folder | null) => {
    setLoading(true);
    try {
      const fData = await documentService.getFolders(folder ? folder.id : null);
      setFolders(fData);

      if (folder) {
        const dData = await documentService.getDocumentsByFolder(folder.id);
        setDocuments(dData);
      } else {
        const dData = await documentService.getRecentDocuments();
        setDocuments(dData);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(currentFolder);
  }, [currentFolder]);

  const handleFolderClick = (folder: Folder) => {
    if (currentFolder) {
      setHistory([...history, currentFolder]);
    }
    setCurrentFolder(folder);
  };

  const handleBackClick = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevFolder = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentFolder(prevFolder);
    } else {
      setCurrentFolder(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!currentFolder) {
      alert("You can only create subfolders inside Main Office or Branches.");
      return;
    }
    const name = prompt("Enter new folder name:");
    if (!name) return;
    try {
      await documentService.createFolder(name, currentFolder.id);
      loadData(currentFolder);
    } catch (err) {
      console.error(err);
      alert("Error creating folder.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!currentFolder) {
      alert("Please navigate into a folder first to upload a file.");
      return;
    }

    setUploading(true);
    try {
      await documentService.uploadDocument(file, currentFolder.id, 'Internal');
      loadData(currentFolder);
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    }
    setUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentService.downloadDocument(doc);
    } catch (err) {
      console.error(err);
      alert("Error downloading file.");
    }
  };

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "title",
      header: "Document Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <IconFileText size={20} className="text-text-muted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary group-hover:text-brand-yellow transition-colors">{row.original.title}</span>
            <span className="text-[10px] text-text-muted mt-0.5">{row.original.file_type} • {(row.original.file_size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "uploaded_by",
      header: "Uploaded By",
      cell: ({ row }) => <span className="text-xs text-text-secondary">{row.original.uploaded_by}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div>
          <div className="text-xs text-text-secondary">{new Date(row.original.created_at).toLocaleDateString()}</div>
          <div className="text-[10px] text-text-muted mt-0.5">Version {row.original.version}</div>
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
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => handleDownload(row.original)}
            className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors border border-border/30"
            title="Download"
          >
            <IconDownload size={16} />
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
            {currentFolder ? (
              <button onClick={handleBackClick} className="text-xs font-semibold text-brand-yellow uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
                <IconArrowLeft size={14} stroke={2} /> Back
              </button>
            ) : null}
            <h1 className="text-3xl font-light text-text-primary tracking-tight">
              {currentFolder ? currentFolder.name : "Document Repository"}
            </h1>
            <p className="text-sm text-text-muted mt-1">Manage, secure, and distribute official files.</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search files..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 w-64 transition-colors" />
            </div>
            {currentFolder && (
              <button onClick={handleCreateFolder} className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-border/50 shadow-sm">
                <IconFolderPlus size={18} />
                New Folder
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button 
              onClick={() => currentFolder ? fileInputRef.current?.click() : alert('Navigate to a folder first.')} 
              disabled={uploading}
              className={`flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm ${uploading ? 'opacity-50' : ''}`}
            >
              <IconUpload size={18} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>

        {folders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
            {folders.map(folder => (
              <div 
                key={folder.id} 
                onClick={() => handleFolderClick(folder)}
                className="bg-surface-primary/30 border border-border/20 rounded-[2rem] p-5 backdrop-blur-sm hover:bg-surface-primary/50 transition-colors cursor-pointer group flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 text-brand-yellow flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <IconFolder size={24} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-sm font-medium text-text-primary truncate">{folder.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">CODE: {folder.code}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span className="text-xs text-text-secondary">{folder.filesCount || 0} Files</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
            {currentFolder ? 'Documents in folder' : 'Recent Documents'}
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
            </div>
          ) : (
             <DataTable columns={columns} data={documents} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
