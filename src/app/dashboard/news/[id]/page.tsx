import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

export default function ViewNewsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to News
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Annual Commission Report 2026 Published</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Published</span>
              <span className="text-xs text-text-muted">English • By Helen T. • Oct 10, 2026</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
              <IconTrash size={18} />
              Delete
            </button>
            <Link href={`/dashboard/news/${params.id}/edit`} className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconEdit size={18} />
              Edit Article
            </Link>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="w-full h-64 bg-surface-secondary/50 rounded-2xl border border-border/50 flex items-center justify-center text-text-muted text-sm font-medium">
            [Featured Image Placeholder]
          </div>
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-secondary leading-relaxed">
            <p>The commission is proud to announce the publication of the 2026 Annual Report, detailing the incredible milestones achieved over the last year.</p>
            <p>We successfully digitized over 80% of our archives and established three new branch offices to better serve the community. The full breakdown of our budget allocation and impact metrics can be found in the attached documents.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
