import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconFolder, IconFileText, IconUpload, IconSearch, IconDotsVertical } from "@tabler/icons-react";

export default function DocumentsPage() {
  const folders = [
    { id: 1, name: 'ኮሚሽን ዋና ጽ/ቤት (Main Office)', code: 'ADMIN_DEFINED', files: 124 },
    { id: 2, name: 'የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branches)', code: '14', files: 86 },
  ];

  const recentFiles = [
    { id: 1, title: 'Annual_Budget_2026.xlsx', type: 'Excel', size: '2.4 MB', folder: 'Main Office', uploader: 'Abebe B.', date: 'Today', version: 'v1.2', visibility: 'Internal' },
    { id: 2, title: 'Commission_Bylaws_Revised.pdf', type: 'PDF', size: '1.1 MB', folder: 'Branches', uploader: 'Helen T.', date: 'Yesterday', version: 'v2.0', visibility: 'Public' },
    { id: 3, title: 'Q3_Performance_Report.docx', type: 'Word', size: '845 KB', folder: 'Main Office', uploader: 'System', date: 'Oct 10, 2026', version: 'v1.0', visibility: 'Restricted' },
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
          <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
                  <th className="font-semibold py-4 px-6">Document Title</th>
                  <th className="font-semibold py-4 px-4">Folder</th>
                  <th className="font-semibold py-4 px-4">Metadata</th>
                  <th className="font-semibold py-4 px-4">Visibility</th>
                  <th className="font-semibold py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <IconFileText size={20} className="text-text-muted" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary group-hover:text-brand-yellow transition-colors">{file.title}</span>
                        <span className="text-[10px] text-text-muted mt-0.5">{file.size} • {file.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-text-secondary">{file.folder}</td>
                    <td className="py-4 px-4">
                      <div className="text-xs text-text-secondary">{file.uploader}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">{file.date} • {file.version}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${file.visibility === 'Public' ? 'bg-success/10 text-success' : file.visibility === 'Restricted' ? 'bg-danger/10 text-danger' : 'bg-surface-secondary text-text-secondary'}`}>
                        {file.visibility}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <IconDotsVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
