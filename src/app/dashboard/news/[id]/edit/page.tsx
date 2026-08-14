'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  IconArrowLeft, 
  IconDeviceFloppy, 
  IconPhoto, 
  IconPlus, 
  IconTrash, 
  IconStar, 
  IconStarFilled,
  IconUpload,
  IconLink
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { newsService } from "@/services/news";
import { NewsArticle } from "@/types";
import { useRouter } from "next/navigation";

import { getYouTubeThumbnail } from "@/lib/youtube";

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('Amharic');
  const [category, setCategory] = useState('ዓበይት ዜናዎች');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [articleType, setArticleType] = useState<'News' | 'Message'>('News');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('ኢሥኮዋጽ');
  
  // Image CRUD state
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    newsService.getArticle(id).then(data => {
      if (data) {
        setArticle(data);
        setTitle(data.title || '');
        setLang(data.lang || 'Amharic');
        setCategory(data.category || 'ዓበይት ዜናዎች');
        setStatus(data.status || 'Published');
        setArticleType(data.article_type || 'News');
        setAuthor(data.author || 'ኢሥኮዋጽ');
        setBody(data.content || data.body || data.excerpt || '');

        const imgs = data.images && data.images.length > 0 ? [...data.images] : (data.image ? [data.image] : []);
        setGalleryImages(imgs);
        setFeaturedImage(data.image || imgs[0] || '');
      }
      setLoading(false);
    });
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await newsService.uploadImage(files[i]);
        uploadedUrls.push(url);
      }

      setGalleryImages(prev => [...prev, ...uploadedUrls]);
      if (!featuredImage && uploadedUrls.length > 0) {
        setFeaturedImage(uploadedUrls[0]);
      }
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('ምስሎችን ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const updated = galleryImages.filter(url => url !== urlToRemove);
    setGalleryImages(updated);
    if (featuredImage === urlToRemove) {
      setFeaturedImage(updated[0] || '');
    }
  };

  const handleSetFeatured = (url: string) => {
    setFeaturedImage(url);
  };

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    try {
      const ytThumb = getYouTubeThumbnail(article.videoUrl);
      const chosenImg = featuredImage || galleryImages[0] || ytThumb || '';

      await newsService.updateArticle(id, {
        title,
        lang,
        status,
        category,
        author,
        article_type: articleType,
        content: body,
        excerpt: body.slice(0, 160),
        image: chosenImg,
        images: galleryImages.length > 0 ? galleryImages : (ytThumb ? [ytThumb] : []),
      });
      router.push(`/dashboard/news/${id}`);
    } catch (error) {
      console.error('Failed to update article', error);
      alert('ለውጦችን ማስቀመጥ አልተቻለም');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center p-10 text-text-muted">በማምጣት ላይ...</div></DashboardLayout>;
  if (!article) return <DashboardLayout><div className="flex justify-center p-10 text-text-muted">ዜናው አልተገኘም</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <Link href={`/dashboard/news/${id}`} className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ ዜናው ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ዜና ማስተካከያ</h1>
            <p className="text-sm text-text-muted mt-1">የዜና መረጃ እና ፎቶዎችን ማስተካከያ</p>
          </div>
          <div className="flex gap-4">
            <Link href={`/dashboard/news/${id}`} className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-border/50">
              ሰርዝ
            </Link>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 disabled:opacity-50 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconDeviceFloppy size={18} />
              {saving ? 'በማስቀመጥ ላይ...' : 'ለውጦችን አስቀምጥ'}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          
          {/* Article Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የዜናው ርዕስ (Title)</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" 
              placeholder="የዜናውን ርዕስ ያስገቡ..."
            />
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ቋንቋ (Language)</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option value="Amharic">አማርኛ (Amharic)</option>
                <option value="English">English</option>
                <option value="Afaan Oromo">Afaan Oromoo</option>
                <option value="Somali">Somali</option>
                <option value="Tigrinya">ትግርኛ</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ዘርፍ / ምድብ (Category)</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option value="ዓበይት ዜናዎች">ዓበይት ዜናዎች</option>
                <option value="ሳምንታዊ ዜናዎች">ሳምንታዊ ዜናዎች</option>
                <option value="የክልል ዜናዎች">የክልል ዜናዎች</option>
                <option value="መልዕክቶች">መልዕክቶች</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ (Status)</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option value="Published">የታተመ (Published)</option>
                <option value="Draft">ረቂቅ (Draft)</option>
              </select>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Image CRUD Management Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <IconPhoto size={18} className="text-brand-blue" />
                  የዜናው ፎቶዎች አስተዳደር (News Images Management)
                </h3>
                <p className="text-xs text-text-muted mt-1">ፎቶዎችን ከመሣሪያዎ ይስቀሉ፣ ያስወግዱ ወይም ዋና ፎቶ (Featured Image) ይምረጡ።</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm">
                  <IconUpload size={15} />
                  {uploading ? 'በመጫን ላይ...' : 'ፎቶ ስቀል'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Gallery Grid */}
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {galleryImages.map((imgUrl, index) => {
                  const isFeatured = featuredImage === imgUrl;

                  return (
                    <div
                      key={index}
                      className={`group relative rounded-2xl overflow-hidden border-2 aspect-video bg-surface-secondary transition-all ${
                        isFeatured ? 'border-brand-blue ring-2 ring-brand-blue/20 shadow-md' : 'border-border/40 hover:border-border/80'
                      }`}
                    >
                      <img src={imgUrl} alt={`News image ${index + 1}`} className="w-full h-full object-cover" />

                      {/* Featured Badge Overlay */}
                      {isFeatured && (
                        <div className="absolute top-2 left-2 bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                          <IconStarFilled size={12} /> ዋና ፎቶ
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {!isFeatured && (
                          <button
                            type="button"
                            onClick={() => handleSetFeatured(imgUrl)}
                            title="ዋና ፎቶ አድርግ"
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
                          >
                            <IconStar size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgUrl)}
                          title="ፎቶውን አስወግድ"
                          className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-border/50 rounded-2xl p-8 bg-surface-primary/20 text-center gap-3">
                <IconPhoto size={36} className="text-text-muted/40" />
                <div className="text-xs text-text-muted font-semibold">ምንም ፎቶ አልተጨመረም</div>
                <p className="text-[11px] text-text-muted/70">ለዚህ ዜና ፎቶዎችን ለመጫን "ፎቶ ስቀል" የሚለውን ይጫኑ።</p>
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Article Content */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የዜናው ዝርዝር መረጃ (Article Content)</label>
            <textarea 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              rows={12}
              className="w-full bg-surface-primary border border-border/50 rounded-2xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors leading-relaxed"
              placeholder="የዜናውን ሙሉ ጽሑፍ እዚህ ያስገቡ..."
            />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
