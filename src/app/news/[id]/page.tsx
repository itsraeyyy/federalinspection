import { notFound } from "next/navigation";
import Link from "next/link";
import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { ChevronRight, CalendarDays, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { newsService } from "@/services/news";
import { ShareButton } from "@/components/ShareButton";

import { createNewsSlug } from "@/lib/slug";

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return null;
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const item = await newsService.getArticle(id);
  if (!item) notFound();

  const allArticles = await newsService.getArticles();
  const relatedNews = allArticles
    .filter((n) => n.id !== item.id && n.status === 'Published')
    .slice(0, 3);

  const displayDate = item.published || item.created;
  const embedVideoUrl = getYouTubeEmbedUrl(item.videoUrl);

  const allImages = item.images && item.images.length > 0 
    ? item.images 
    : (item.image ? [item.image] : []);

  const mainImage = item.image || (allImages.length > 0 ? allImages[0] : null);
  const galleryImages = allImages;

  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-white pt-24 pb-16">

        {/* Top Breadcrumbs */}
        <section className="relative overflow-hidden bg-slate-50 py-10 lg:py-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(#014BAA 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
            <Link
              href="/#news"
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors hover:text-[#014BAA]"
            >
              <ArrowLeft className="size-3.5" />
              ወደ ዜናዎች ተመለስ
            </Link>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>መነሻ</span>
              <ChevronRight className="size-3.5" />
              <Link href="/#news" className="transition-colors hover:text-[#014BAA]">ዜና</Link>
              <ChevronRight className="size-3.5" />
              <span className="text-slate-400 line-clamp-1">{item.title}</span>
            </div>
          </div>
        </section>

        {/* News Article Container */}
        <section className="-mt-6 relative z-20 px-5 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-20px_rgba(1,75,170,0.08)] ring-1 ring-slate-100">
              
              {/* YouTube Video Player (If Available) */}
              {embedVideoUrl ? (
                <div className="relative aspect-[16/9] max-h-[420px] w-full overflow-hidden bg-slate-900 border-b border-slate-100">
                  <iframe
                    src={embedVideoUrl}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : mainImage ? (
                /* Main Image (Controlled Moderate Height) */
                <div className="relative max-h-[360px] sm:max-h-[420px] w-full overflow-hidden bg-slate-100 border-b border-slate-100 flex items-center justify-center">
                  <img 
                    src={mainImage} 
                    alt={item.title} 
                    className="w-full max-h-[360px] sm:max-h-[420px] object-cover object-center" 
                  />
                </div>
              ) : null}

              {/* Other Images Gallery directly under the main image */}
              {galleryImages.length > 1 && (
                <div className="bg-slate-50/70 p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <ImageIcon className="size-3.5 text-[#014BAA]" />
                    <span>ተጨማሪ ምስሎች (Gallery)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white aspect-[4/3] shadow-sm hover:shadow-md transition-all">
                        <img 
                          src={imgUrl} 
                          alt={`Gallery ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-8 sm:px-10 sm:py-12">
                
                {/* Meta Header Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 rounded-full bg-[#014BAA]/5 px-4 py-1.5 border border-[#014BAA]/10">
                    <CalendarDays className="size-3.5 text-[#014BAA]" aria-hidden="true" />
                    <time dateTime={displayDate} className="text-xs font-bold text-[#014BAA]">{displayDate}</time>
                  </div>

                  {/* Interactive Share Button */}
                  <ShareButton title={item.title} />
                </div>

                {/* Article Title */}
                <h1 className="mt-6 font-heading text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  {item.title}
                </h1>

                {/* Article Main Text */}
                <div className="mt-8 space-y-5 text-base leading-[1.85] text-slate-700 sm:text-lg whitespace-pre-wrap font-normal">
                  {item.content || item.description || "ምንም ይዘት የለም።"}
                </div>

                {/* Footer Navigation Link */}
                <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-8">
                  <Link
                    href="/#news"
                    className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#014BAA]"
                    style={{ color: "#014BAA" }}
                  >
                    <ArrowLeft className="size-4" />
                    ወደ ዜናዎች ተመለስ
                  </Link>
                </div>
              </div>
            </article>

            {/* Related News Cards */}
            {relatedNews.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  ተጨማሪ <span style={{ color: "#014BAA" }}>ዜናዎች</span>
                </h2>
                <div className="mt-2 h-1 w-10 rounded-full" style={{ backgroundColor: "#FFB800" }} />
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedNews.map((news) => {
                    const rDate = news.published || news.created;
                    return (
                      <Link
                        key={news.id}
                        href={`/news/${createNewsSlug(news.id, news.title)}`}
                        className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-[#014BAA]/20"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                          {news.image ? (
                            <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                              <svg className="size-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21Z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CalendarDays className="size-3" />
                            <time>{rDate}</time>
                          </div>
                          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#014BAA]">
                            {news.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {news.excerpt || news.description || news.content}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
