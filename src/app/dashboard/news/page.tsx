'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconPlus, IconSearch, IconEdit, IconEye, IconTrash, IconVideo, IconCalendar, IconUser, IconX, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { newsService } from "@/services/news";
import { NewsArticle } from "@/types";
import { getYouTubeThumbnail } from "@/lib/youtube";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Published' | 'Draft'>('all');
  const [activeTab, setActiveTab] = useState<'News' | 'Message'>('News');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; article: NewsArticle | null }>({ open: false, article: null });

  useEffect(() => {
    newsService.getArticles().then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesTab = (article.article_type || 'News') === activeTab;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
    return matchesTab && matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (deleteModal.article) {
      await newsService.deleteArticle(deleteModal.article.id);
      setArticles(articles.filter(a => a.id !== deleteModal.article!.id));
      setDeleteModal({ open: false, article: null });
    }
  };

  const activeArticlesForStats = articles.filter(a => (a.article_type || 'News') === activeTab);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">
              {activeTab === 'News' ? 'ዜናዎች' : 'መልዕክቶች'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {activeTab === 'News' ? 'ሁለገብ ቋንቋ ዜናዎችን ያስተዳድሩ።' : 'የተቋሙን መልዕክቶች ያስተዳድሩ።'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-1 w-8 bg-brand-blue rounded-full"></div>
              <div className="h-1 w-4 bg-brand-yellow rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder={activeTab === 'News' ? "ዜና ፈልግ..." : "መልዕክት ፈልግ..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'Published' | 'Draft')}
                className="bg-surface-primary/50 border border-border/30 rounded-full px-4 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer pr-10"
              >
                <option value="all">ሁሉም</option>
                <option value="Published">የታተመ</option>
                <option value="Draft">ረቂቅ</option>
              </select>
              <IconSearch size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/news/create?type=${activeTab}`}
                className={`flex items-center gap-2 ${activeTab === 'News' ? 'bg-brand-blue hover:bg-brand-blue/90 text-white' : 'bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E]'} px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm whitespace-nowrap`}
              >
                <IconPlus size={18} />
                {activeTab === 'News' ? 'አዲስ ዜና' : 'መልዕክት አጋራ'}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex border-b border-border/30">
          <button 
            onClick={() => setActiveTab('News')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'News' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'}`}
          >
            ዜና (News)
          </button>
          <button 
            onClick={() => setActiveTab('Message')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'Message' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'}`}
          >
            መልዕክት (Messages)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="text-2xl font-light text-text-primary">{activeArticlesForStats.length}</div>
            <div className="text-xs text-text-muted mt-1">ጠቅላላ {activeTab === 'News' ? 'ዜናዎች' : 'መልዕክቶች'}</div>
          </div>
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="text-2xl font-light text-success">{activeArticlesForStats.filter(a => a.status === 'Published').length}</div>
            <div className="text-xs text-text-muted mt-1">የታተሙ</div>
          </div>
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="text-2xl font-light text-brand-yellow">{activeArticlesForStats.filter(a => a.status === 'Draft').length}</div>
            <div className="text-xs text-text-muted mt-1">ረቂቆች</div>
          </div>
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="text-2xl font-light text-brand-blue">{activeArticlesForStats.filter(a => a.videoUrl).length}</div>
            <div className="text-xs text-text-muted mt-1">ቪዲዮ ያላቸው</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
              <span className="text-sm text-text-muted">በመጫን ላይ...</span>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-text-muted text-sm">ምንም ዜና አልተገኘም</div>
              <Link href="/dashboard/news/create" className="text-brand-blue text-sm font-medium hover:underline mt-2 inline-block">
                የመጀመሪያ ዜናዎን ይፍጠሩ
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const cardImage = article.image || getYouTubeThumbnail(article.videoUrl);

              return (
                <div key={article.id} className="group bg-surface-primary/30 rounded-2xl border border-border/20 backdrop-blur-md overflow-hidden hover:border-brand-blue/30 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    {cardImage ? (
                      <img
                        src={cardImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-secondary/50 flex items-center justify-center">
                        <span className="text-text-muted text-sm">ምንም ምስል የለም</span>
                      </div>
                    )}

                  {article.videoUrl && (
                    <div className="absolute top-3 right-3 bg-danger/90 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                      <IconVideo size={12} />
                      ቪዲዮ
                    </div>
                  )}

                  {article.images && article.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-brand-blue/90 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                      <IconPhoto size={12} />
                      {article.images.length}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${article.status === 'Published'
                        ? 'bg-success/90 text-white'
                        : 'bg-brand-yellow/90 text-[#3D352E]'
                      }`}>
                      {article.status === 'Published' ? 'የታተመ' : 'ረቂቅ'}
                    </span>
                    {article.article_type === 'Message' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm bg-[#014BAA]/90 text-white w-fit">
                        መልዕክት
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm bg-[#014BAA]/90 text-white w-fit">
                        {article.category || 'ዓበይት ዜናዎች'}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black/60 text-white px-2 py-1 rounded-lg text-[10px] font-medium backdrop-blur-sm">
                      {article.lang}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-text-primary line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-text-muted mt-2 line-clamp-2">
                    {article.excerpt || 'ምንም መግለጫ የለም።'}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-[11px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <IconUser size={12} />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconCalendar size={12} />
                      {article.created}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/20">
                    <Link
                      href={`/dashboard/news/${article.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                    >
                      <IconEye size={14} />
                      ይመልከቱ
                    </Link>
                    <Link
                      href={`/dashboard/news/${article.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-brand-yellow hover:bg-brand-yellow/10 rounded-lg transition-colors"
                    >
                      <IconEdit size={14} />
                      አስተካክሉ
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ open: true, article })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                      <IconTrash size={14} />
                      ሰርዝ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {deleteModal.open && deleteModal.article && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary rounded-2xl border border-border/30 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">ዜና ሰርዝ</h3>
              <button
                onClick={() => setDeleteModal({ open: false, article: null })}
                className="p-1 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              &quot;{deleteModal.article.title}&quot; ን መሰረዝ ይፈልጋሉ? ይህ ድርጊት ሊቀለበስ አይችልም።
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, article: null })}
                className="flex-1 py-2.5 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50"
              >
                ሰርዝ
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 bg-danger hover:bg-danger/90 text-white rounded-xl text-sm font-medium transition-colors"
              >
                አጽድቅ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
