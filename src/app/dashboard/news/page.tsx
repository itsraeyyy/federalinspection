'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconPlus, IconSearch, IconFilter, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { newsService } from "@/services/news";
import { NewsArticle } from "@/types";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const columns: ColumnDef<NewsArticle>[] = [
    {
      accessorKey: "title",
      header: "Title & Language",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium text-text-primary group-hover:text-brand-green transition-colors">{row.original.title}</div>
          <div className="text-[10px] text-text-muted mt-1">{row.original.lang}</div>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => <span className="text-xs text-text-secondary">{row.original.author}</span>,
    },
    {
      accessorKey: "created",
      header: "Dates",
      cell: ({ row }) => (
        <div>
          <div className="text-xs text-text-secondary">Created: {row.original.created}</div>
          <div className="text-[10px] text-text-muted mt-0.5">Published: {row.original.published}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.original.status === 'Published' ? 'bg-success/10 text-success' : 'bg-surface-secondary text-text-secondary'}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2 transition-opacity">
          <Link href={`/dashboard/news/${row.original.id}`} className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors border border-border/30"><IconEye size={16} /></Link>
          <Link href={`/dashboard/news/${row.original.id}/edit`} className="p-1.5 text-text-muted hover:text-brand-yellow hover:bg-brand-yellow/10 rounded-md transition-colors border border-border/30"><IconEdit size={16} /></Link>
          <button onClick={() => newsService.deleteArticle(row.original.id).then(() => setArticles(articles.filter(a => a.id !== row.original.id)))} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors border border-border/30"><IconTrash size={16} /></button>
        </div>
      ),
    },
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
        
        {loading ? (
          <div className="flex items-center justify-center h-48">Loading...</div>
        ) : (
          <DataTable columns={columns} data={articles} />
        )}
      </div>
    </DashboardLayout>
  );
}
