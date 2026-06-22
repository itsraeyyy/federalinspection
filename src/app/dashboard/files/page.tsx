'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState, useEffect, useRef } from "react";
import { publicFilesService, PublicFile, PublicFileCategory } from "@/services/publicFiles";
import { IconUpload, IconTrash, IconFileText, IconLoader2, IconExternalLink } from "@tabler/icons-react";

const CATEGORIES: PublicFileCategory[] = ['መተዳደርያ ደንብ', 'የኮሚሽኑ መመሪያዎች', 'የፓርቲ መመሪያዎች'];

export default function PublicFilesPage() {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<PublicFileCategory>(CATEGORIES[0]);
  
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PublicFileCategory>(CATEGORIES[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    loadFiles();
  }, [activeTab]);

  const loadFiles = async () => {
    setLoading(true);
    const data = await publicFilesService.getFiles(activeTab);
    setFiles(data);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !selectedFile) return;

    setUploading(true);
    setUploadError('');
    const result = await publicFilesService.uploadFile(uploadTitle, uploadCategory, selectedFile);
    if (result.success) {
      setUploadTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (uploadCategory === activeTab) {
        await loadFiles();
      } else {
        setActiveTab(uploadCategory);
      }
    } else {
      setUploadError(result.error || 'Failed to upload file.');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    const success = await publicFilesService.deleteFile(id, url);
    if (success) {
      await loadFiles();
    } else {
      alert('Failed to delete file.');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-10">
        <div>
          <h1 className="text-3xl font-light text-text-primary tracking-tight">የህዝብ ፋይሎች</h1>
          <p className="text-sm text-text-muted mt-1">ለህዝብ ክፍት የሆኑ ፋይሎችን (መመሪያዎች እና ደንቦች) ያስተዳድሩ።</p>
        </div>

        {/* Upload Form */}
        <div className="bg-surface-primary/40 border border-border/20 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">አዲስ ፋይል ይጫኑ</h2>
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {uploadError}
            </div>
          )}
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">ርዕስ</label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="የፋይሉ ርዕስ..."
                className="w-full bg-surface-secondary/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">ምድብ</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as PublicFileCategory)}
                className="w-full bg-surface-secondary/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">ፋይል</label>
              <div className="relative">
                <input
                  type="file"
                  required
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 transition-all border border-border/30 rounded-xl p-0.5 bg-surface-secondary/50"
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={uploading || !selectedFile || !uploadTitle.trim()}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {uploading ? <IconLoader2 size={18} className="animate-spin" /> : <IconUpload size={18} />}
                ይጫኑ
              </button>
            </div>
          </form>
        </div>

        {/* Files List */}
        <div>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-border/20 overflow-x-auto pb-px">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === category 
                    ? 'border-brand-blue text-brand-blue' 
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <IconLoader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 bg-surface-primary/30 border border-border/20 rounded-2xl backdrop-blur-md">
              <IconFileText size={48} className="mx-auto text-text-muted/30 mb-3" />
              <p className="text-text-muted text-sm">ምንም ፋይል አልተገኘም</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => (
                <div key={file.id} className="bg-surface-primary/40 border border-border/20 rounded-2xl p-5 flex flex-col gap-3 group hover:border-brand-blue/30 transition-all hover:shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue">
                      <IconFileText size={20} />
                    </div>
                    <button
                      onClick={() => handleDelete(file.id, file.file_url)}
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="አጥፋ"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary line-clamp-1" title={file.title}>{file.title}</h3>
                    <p className="text-xs text-text-muted mt-1">{file.file_name}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/10">
                    <span className="text-xs text-text-muted font-mono">{file.file_size}</span>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-blue flex items-center gap-1 hover:underline"
                    >
                      ይመልከቱ <IconExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
