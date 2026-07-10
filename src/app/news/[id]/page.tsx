import { notFound } from "next/navigation";
import Link from "next/link";
import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { ChevronRight, CalendarDays, ArrowLeft, Share2, Clock, Bookmark } from "lucide-react";
import { newsService } from "@/services/news";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const item = await newsService.getArticle(id);
  if (!item) notFound();

  const allArticles = await newsService.getArticles();
  const relatedNews = allArticles
    .filter((n) => n.id !== item.id && n.status === 'Published')
    .slice(0, 3);

  const displayDate = item.published || item.created;

  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-white pt-24 pb-16">

        <section className="relative overflow-hidden bg-slate-50 py-14 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(#014BAA 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <Link
              href="/#news"
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-[#014BAA]"
            >
              <ArrowLeft className="size-4" />
              ወደ ዜናዎች ተመለስ
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>መነሻ</span>
              <ChevronRight className="size-4" />
              <Link href="/#news" className="transition-colors hover:text-[#014BAA]">ዜና</Link>
              <ChevronRight className="size-4" />
              <span className="text-slate-400">{item.title.slice(0, 35)}...</span>
            </div>
          </div>
        </section>

        <section className="-mt-8 relative z-20 px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <article className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_64px_-24px_rgba(1,75,170,0.10)] ring-1 ring-slate-100/80">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                {item.videoUrl ? (
                  <iframe
                    src={item.videoUrl}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#014BAA]/5 to-[#FFB800]/5">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                        <svg className="size-8 text-[#014BAA]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-400">ፎቶ ያልተሰቀለ</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-10 sm:px-8 lg:px-10 sm:py-14">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-[#014BAA]/5 px-4 py-1.5">
                      <CalendarDays className="size-3.5 text-[#014BAA]" aria-hidden="true" />
                      <time dateTime={displayDate} className="text-xs font-bold text-[#014BAA]">{displayDate}</time>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="size-3" />
                      <span>5 ደቂቃ ንባብ</span>
                    </div>
                  </div>
                  <button className="flex size-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-[#014BAA]/5 hover:text-[#014BAA] hover:ring-[#014BAA]/20" aria-label="ያጋሩ">
                    <Share2 className="size-4" />
                  </button>
                </div>

                <h1 className="mt-6 font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem]">
                  {item.title}
                </h1>

                <div className="mt-8 space-y-5 text-base leading-[1.85] text-slate-600 sm:text-lg whitespace-pre-wrap">
                  {item.content || item.description || "ምንም ይዘት የለም።"}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {["ዜና", "ኮሚሽን"].map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-8">
                  <Link
                    href="/#news"
                    className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#014BAA]"
                    style={{ color: "#014BAA" }}
                  >
                    <ArrowLeft className="size-4" />
                    ወደ ዜናዎች ተመለስ
                  </Link>
                  <button className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-[#FFB800]">
                    <Bookmark className="size-4" />
                    ያስቀምጡ
                  </button>
                </div>
              </div>
            </article>

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
                        href={`/news/${news.id}`}
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
