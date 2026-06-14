'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconPhotoPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema } from "@/lib/validations";
import { newsService } from "@/services/news";
import { useRouter } from "next/navigation";
import * as z from "zod";

type NewsFormValues = z.infer<typeof newsSchema>;

export default function CreateNewsPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      language: "English",
      category: "Announcements",
      body: "",
      status: "Draft"
    }
  });

  const onSubmit = async (data: NewsFormValues) => {
    try {
      await newsService.createArticle({ ...data, lang: data.language, author: 'Current Admin' });
      router.push('/dashboard/news');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to News
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Create News Article</h1>
            <p className="text-sm text-text-muted mt-1">Draft a new multilingual article for the portal.</p>
          </div>
          <div className="flex gap-4">
            <button type="button" className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-border/50">
              Save as Draft
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
              <IconDeviceFloppy size={18} />
              {isSubmitting ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Article Title</label>
            <input {...register("title")} type="text" placeholder="e.g., Annual Commission Report 2026..." className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
            {errors.title && <span className="text-xs text-danger">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Language</label>
              <select {...register("language")} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                <option value="English">English</option>
                <option value="Amharic">Amharic</option>
                <option value="Afaan Oromo">Afaan Oromo</option>
                <option value="Somali">Somali</option>
                <option value="Tigrinya">Tigrinya</option>
              </select>
              {errors.language && <span className="text-xs text-danger">{errors.language.message}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Category</label>
              <select {...register("category")} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                <option value="Announcements">Announcements</option>
                <option value="Reports">Reports</option>
                <option value="Press Release">Press Release</option>
              </select>
              {errors.category && <span className="text-xs text-danger">{errors.category.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Featured Media</label>
            <div className="w-full h-40 rounded-2xl border-2 border-dashed border-border/50 bg-surface-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-secondary/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-muted group-hover:text-brand-blue transition-colors">
                <IconPhotoPlus size={24} stroke={1.5} />
              </div>
              <span className="text-xs text-text-muted font-medium">Click to upload image or video</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Article Body</label>
            <div className="w-full h-64 bg-surface-primary border border-border/50 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-3">
                <div className="flex items-center gap-1">
                  <button type="button" className="px-2 text-sm font-bold text-text-secondary hover:text-text-primary">B</button>
                  <button type="button" className="px-2 text-sm italic text-text-secondary hover:text-text-primary">I</button>
                  <button type="button" className="px-2 text-sm underline text-text-secondary hover:text-text-primary">U</button>
                </div>
                <div className="w-[1px] h-4 bg-border/50 mx-2"></div>
                <button type="button" className="text-xs font-medium text-text-secondary hover:text-text-primary">Add Link</button>
              </div>
              <textarea {...register("body")} placeholder="Write your content here..." className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-text-primary leading-relaxed"></textarea>
            </div>
            {errors.body && <span className="text-xs text-danger">{errors.body.message}</span>}
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
