'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { newsService } from "@/services/news";
import { NewsArticle } from "@/types";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function ViewNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    newsService.getArticle(id).then(data => {
      if (data) setArticle(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await newsService.deleteArticle(id);
      router.push('/dashboard/news');
    } catch (error) {
      console.error('Failed to delete article', error);
      alert('Failed to delete article');
    }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center p-10">Loading...</div></DashboardLayout>;
  if (!article) return <DashboardLayout><div className="flex justify-center p-10">Article not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to News
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">{article.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${article.status === 'Published' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {article.status}
              </span>
              <span className="text-xs text-text-muted">{article.lang} • By {article.author} • {article.published || article.created}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={handleDelete} className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
              <IconTrash size={18} />
              Delete
            </button>
            <Link href={`/dashboard/news/${id}/edit`} className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconEdit size={18} />
              Edit Article
            </Link>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
          {article.images && article.images.length > 0 ? (
            <div className="w-full h-64 bg-surface-secondary/50 rounded-2xl border border-border/50 overflow-hidden relative">
              {/* Using a standard img tag since the mock had a placeholder. Next/image needs domains configured. */}
              <img src={article.images[0]} alt={article.title} className="object-cover w-full h-full" />
            </div>
          ) : article.image ? (
            <div className="w-full h-64 bg-surface-secondary/50 rounded-2xl border border-border/50 overflow-hidden relative">
              <img src={article.image} alt={article.title} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-full h-64 bg-surface-secondary/50 rounded-2xl border border-border/50 flex items-center justify-center text-text-muted text-sm font-medium">
              [No Featured Image]
            </div>
          )}

          {article.videoUrl && (
            <div className="w-full h-12 bg-surface-secondary/30 rounded-xl flex items-center px-4">
              <a href={article.videoUrl} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline text-sm font-medium flex items-center gap-2">
                View Attached Video
              </a>
            </div>
          )}

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
            {article.content || article.body || article.excerpt || "No content available."}
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Article"
        message="Are you sure you want to delete this article?"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </DashboardLayout>
  );
}
