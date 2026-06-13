import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconPhotoPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function EditNewsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to News
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Edit News Article</h1>
            <p className="text-sm text-text-muted mt-1">Updating article #{params.id}</p>
          </div>
          <div className="flex gap-4">
            <Link href={`/dashboard/news/${params.id}`} className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-border/50">
              Cancel
            </Link>
            <button className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconDeviceFloppy size={18} />
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Article Title</label>
            <input type="text" defaultValue="Annual Commission Report 2026 Published" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Language</label>
              <select defaultValue="English" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option>English</option>
                <option>Amharic</option>
                <option>Afaan Oromo</option>
                <option>Somali</option>
                <option>Tigrinya</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Status</label>
              <select defaultValue="Published" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Article Body</label>
            <div className="w-full h-64 bg-surface-primary border border-border/50 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-3">
                <div className="flex items-center gap-1">
                  <button className="px-2 text-sm font-bold text-text-secondary hover:text-text-primary">B</button>
                  <button className="px-2 text-sm italic text-text-secondary hover:text-text-primary">I</button>
                  <button className="px-2 text-sm underline text-text-secondary hover:text-text-primary">U</button>
                </div>
                <div className="w-[1px] h-4 bg-border/50 mx-2"></div>
                <button className="text-xs font-medium text-text-secondary hover:text-text-primary">Add Link</button>
              </div>
              <textarea defaultValue="The commission is proud to announce the publication of the 2026 Annual Report, detailing the incredible milestones achieved over the last year." className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-text-primary leading-relaxed"></textarea>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
