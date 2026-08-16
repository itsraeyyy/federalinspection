'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  IconArrowLeft, 
  IconDeviceFloppy, 
  IconPhotoPlus, 
  IconX, 
  IconVideo,
  IconStar,
  IconStarFilled,
  IconLink,
  IconUpload,
  IconPhoto
} from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema } from "@/lib/validations";
import { newsService } from "@/services/news";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import { getYouTubeThumbnail } from "@/lib/youtube";

type NewsFormValues = z.infer<typeof newsSchema>;

export default function CreateNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      language: "አማርኛ",
      category: "ዓበይት ዜናዎች",
      body: "",
      status: "Published",
      article_type: "News"
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const type = new URLSearchParams(window.location.search).get('type');
      if (type === 'Message' || type === 'News') {
        setValue('article_type', type);
      }
    }
  }, [setValue]);

  const watchedBody = watch("body");

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await newsService.uploadImage(file);
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

  const removeGalleryImage = (index: number) => {
    const targetUrl = galleryImages[index];
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (featuredImage === targetUrl) {
      setFeaturedImage(updated[0] || '');
    }
  };

  const handleSetFeatured = (url: string) => {
    setFeaturedImage(url);
  };

  const onSubmit = async (data: NewsFormValues) => {
    try {
      const videoUrl = (data as any).videoUrl || undefined;
      const ytThumbnail = getYouTubeThumbnail(videoUrl);
      const chosenImage = featuredImage || galleryImages[0] || ytThumbnail || undefined;

      const payload = {
        title: data.title,
        lang: data.language,
        category: data.category || 'ዓበይት ዜናዎች',
        status: data.status as any,
        content: data.body,
        article_type: data.article_type,
        author: 'ኢሥኮዋጽ',
        image: chosenImage,
        images: galleryImages.length > 0 ? galleryImages : (ytThumbnail ? [ytThumbnail] : undefined),
        videoUrl: videoUrl,
        excerpt: data.body?.substring(0, 150) + '...',
        published: new Date().toISOString()
      };
      
      await newsService.createArticle(payload);
      router.push('/dashboard/news');
    } catch (error: any) {
      console.error('Error creating article:', JSON.stringify(error, null, 2), error);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> {watch("article_type") === 'Message' ? 'ወደ መልዕክቶች ይመለሱ' : 'ወደ ዜና ይመለሱ'}
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">
              {watch("article_type") === 'Message' ? 'አዲስ መልዕክት ያጋሩ' : 'አዲስ ዜና ይፍጠሩ'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {watch("article_type") === 'Message' ? 'ለህዝብ ፖርታል አዲስ መልዕክት ያዘጋጁ።' : 'ለህዝብ ፖርታል አዲስ ዜና ያዘጋጁ።'}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setValue("status", "Draft")}
              className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-border/50"
            >
              እንደ ረቂቅ አስቀምጥ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {isSubmitting ? 'በማተም ላይ...' : 'አሳትም'}
            </button>
          </div>
        </div>

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ርዕስ</label>
            <input 
              {...register("title")} 
              type="text" 
              placeholder={watch("article_type") === 'Message' ? "የመልዕክቱ ርዕስ..." : "ለምሳሌ፦ የ2026 ዓመታዊ ሪፖርት..."} 
              className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" 
            />
            {errors.title && <span className="text-xs text-danger">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ቋንቋ</label>
              <select 
                {...register("language")} 
                className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="አማርኛ">አማርኛ</option>
                <option value="English">English</option>
                <option value="Afaan Oromo">Afaan Oromo</option>
                <option value="Somali">Somali</option>
                <option value="Tigrinya">ትግርኛ</option>
              </select>
              {errors.language && <span className="text-xs text-danger">{errors.language.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ዘርፍ / ምድብ (Category)</label>
              <select 
                {...register("category")} 
                className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="ዓበይት ዜናዎች">ዓበይት ዜናዎች</option>
                <option value="ሳምንታዊ ዜናዎች">ሳምንታዊ ዜናዎች</option>
                <option value="የክልል ዜናዎች">የክልል ዜናዎች</option>
                <option value="መልዕክቶች">መልዕክቶች</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ዓይነት (Type)</label>
              <select 
                {...register("article_type")} 
                className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="News">ዜና</option>
                <option value="Message">መልዕክት</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ</label>
              <select 
                {...register("status")} 
                className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="Published">የታተመ</option>
                <option value="Draft">ረቂቅ</option>
              </select>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Image CRUD Management */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <IconPhoto size={16} className="text-brand-blue" /> ፎቶዎች (Images CRUD)
                </label>
                <p className="text-xs text-text-muted mt-0.5">ፎቶዎችን ከመሣሪያዎ ይስቀሉ።</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 bg-brand-blue hover:bg-brand-blue/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                >
                  <IconUpload size={14} /> {uploading ? 'በመጫን ላይ...' : 'ፎቶ ስቀል'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => {
                const isFeatured = featuredImage === img;
                return (
                  <div key={idx} className={`relative h-28 rounded-xl overflow-hidden border-2 group/image ${isFeatured ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-border/30'}`}>
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    {isFeatured && (
                      <span className="absolute top-1 left-1 bg-brand-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        ★ ዋና ፎቶ
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {!isFeatured && (
                        <button
                          type="button"
                          onClick={() => handleSetFeatured(img)}
                          title="ዋና ፎቶ አድርግ"
                          className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg"
                        >
                          <IconStar size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        title="አስወግድ"
                        className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-28 rounded-xl border-2 border-dashed border-border/50 bg-surface-primary/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-secondary/50 hover:border-brand-blue/30 transition-all group"
              >
                <IconPhotoPlus size={24} stroke={1.5} className="text-text-muted group-hover:text-brand-blue transition-colors" />
                <span className="text-[10px] text-text-muted font-medium">ፎቶ ጨምር</span>
              </button>
            </div>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
              <IconVideo size={14} className="text-brand-blue" />
              የቪዲዮ አድራሻ (YouTube Embed)
            </label>
            <input 
              type="text" 
              placeholder="https://www.youtube.com/embed/..."
              {...register("videoUrl")}
              className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
            />
            <p className="text-xs text-text-muted">ቪዲዮ ለማሳየት የYouTube embed አድራሻ ያስገቡ።</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              {watch("article_type") === 'Message' ? 'የመልዕክት ይዘት' : 'የዜና ይዘት'}
            </label>
            <textarea 
              {...register("body")} 
              placeholder={watch("article_type") === 'Message' ? "መልዕክትዎን እዚህ ይጻፉ..." : "ዜናዎን እዚህ ይጻፉ..."} 
              rows={10}
              className="w-full bg-surface-primary border border-border/50 rounded-2xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors leading-relaxed"
            ></textarea>
            {errors.body && <span className="text-xs text-danger">{errors.body.message}</span>}
            <div className="text-xs text-text-muted text-right">
              {watchedBody?.length || 0} ፊደላት
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
