'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconPhotoPlus, IconX, IconVideo } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema } from "@/lib/validations";
import { newsService } from "@/services/news";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useState, useRef } from "react";
import Image from "next/image";

type NewsFormValues = z.infer<typeof newsSchema>;

export default function CreateNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      language: "አማርኛ",
      body: "",
      status: "Published"
    }
  });

  const watchedBody = watch("body");

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: NewsFormValues) => {
    try {
      const payload = {
        title: data.title,
        lang: data.language,
        status: data.status as any,
        content: data.body,
        author: 'Current Admin',
        image: galleryImages[0] || undefined,
        images: galleryImages.length > 0 ? galleryImages : undefined,
        videoUrl: (data as any).videoUrl || undefined,
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
              <IconArrowLeft size={14} stroke={2} /> ወደ ዜና ይመለሱ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አዲስ ዜና ይፍጠሩ</h1>
            <p className="text-sm text-text-muted mt-1">ለህዝብ ፖርታል አዲስ ዜና ያዘጋጁ።</p>
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
              placeholder="ለምሳሌ፦ የ2026 ዓመታዊ ሪፖርት..." 
              className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" 
            />
            {errors.title && <span className="text-xs text-danger">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-6">
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
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ</label>
              <select 
                {...register("status")} 
                className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="Draft">ረቂቅ</option>
                <option value="Published">የታተመ</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ፎቶዎች</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative h-28 rounded-xl overflow-hidden border border-border/30 group/image">
                  <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))}
              
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
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የዜና ይዘት</label>
            <div className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-3">
                <div className="flex items-center gap-1">
                  <button type="button" className="px-2 text-sm font-bold text-text-secondary hover:text-text-primary">B</button>
                  <button type="button" className="px-2 text-sm italic text-text-secondary hover:text-text-primary">I</button>
                  <button type="button" className="px-2 text-sm underline text-text-secondary hover:text-text-primary">U</button>
                </div>
                <div className="w-[1px] h-4 bg-border/50 mx-2"></div>
                <button type="button" className="text-xs font-medium text-text-secondary hover:text-text-primary">አገናኝ ጨምር</button>
              </div>
              <textarea 
                {...register("body")} 
                placeholder="ዜናዎን እዚህ ይጻፉ..." 
                className="w-full h-64 bg-transparent border-none resize-none focus:outline-none text-sm text-text-primary leading-relaxed"
              ></textarea>
            </div>
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
