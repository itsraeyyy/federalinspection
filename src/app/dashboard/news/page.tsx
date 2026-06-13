import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconPlus, IconSearch, IconFilter, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

export default function NewsPage() {
  const articles = [
    { id: 1, title: 'Annual Commission Report 2026 Published', lang: 'English', status: 'Published', author: 'Helen T.', created: 'Oct 10, 2026', published: 'Oct 12, 2026' },
    { id: 2, title: 'የ2018 ዓ.ም በጀት ዓመት እቅድ ትውውቅ', lang: 'Amharic', status: 'Draft', author: 'Abebe B.', created: 'Oct 11, 2026', published: '-' },
    { id: 3, title: 'New Digital ID Services Announced', lang: 'English', status: 'Published', author: 'Helen T.', created: 'Oct 05, 2026', published: 'Oct 08, 2026' },
    { id: 4, title: 'Oduu Haaraa: Tajaajila Dijitaalaa', lang: 'Afaan Oromo', status: 'Draft', author: 'Chala D.', created: 'Oct 12, 2026', published: '-' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">News & Media</h1>
            <p className="text-sm text-text-muted mt-1">Manage multilingual content for the public portal.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search articles..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-green/50 w-64 transition-colors" />
            </div>
            <button className="flex items-center justify-center p-2.5 rounded-full border border-border/30 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              <IconFilter size={18} />
            </button>
            <Link href="/dashboard/news/create" className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconPlus size={18} />
              Create News
            </Link>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
                <th className="font-semibold py-4 px-6">Title & Language</th>
                <th className="font-semibold py-4 px-4">Author</th>
                <th className="font-semibold py-4 px-4">Dates</th>
                <th className="font-semibold py-4 px-4">Status</th>
                <th className="font-semibold py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-text-primary group-hover:text-brand-green transition-colors">{article.title}</div>
                    <div className="text-[10px] text-text-muted mt-1">{article.lang}</div>
                  </td>
                  <td className="py-4 px-4 text-xs text-text-secondary">{article.author}</td>
                  <td className="py-4 px-4">
                    <div className="text-xs text-text-secondary">Created: {article.created}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Published: {article.published}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${article.status === 'Published' ? 'bg-success/10 text-success' : 'bg-surface-secondary text-text-secondary'}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link href={`/dashboard/news/${article.id}`} className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors border border-border/30"><IconEye size={16} /></Link>
                      <Link href={`/dashboard/news/${article.id}/edit`} className="p-1.5 text-text-muted hover:text-brand-yellow hover:bg-brand-yellow/10 rounded-md transition-colors border border-border/30"><IconEdit size={16} /></Link>
                      <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors border border-border/30"><IconTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
