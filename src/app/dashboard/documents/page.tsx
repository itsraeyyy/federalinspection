'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconSearch, IconUpload, IconDownload, IconX, IconFile, IconFileText, IconTable, IconCsv, IconFolder, IconChevronLeft, IconCalendar, IconUser, IconBuilding, IconBuildingEstate, IconMapPin, IconQrcode, IconTrash, IconLoader2, IconExternalLink, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { documentService, MAIN_CATEGORIES, SUB_CATEGORIES } from "@/services/documents";
import { publicFilesService, PublicFile, PublicFileCategory } from "@/services/publicFiles";
import { Document, OFFICES } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const ETHIOPIA_REGIONS = [
  'አዲስ አበባ', 'ድሬዳዋ', 'ኦሮሚያ', 'አማራ', 'ደቡብ ኢትዮጵያ', 
  'ደቡብ ምዕራብ ኢትዮጵያ', 'ማዕከላዊ ኢትዮጵያ', 'ሲዳማ', 'ሶማሌ', 
  'አፋር', 'ቤንሻንጉል ጉሙዝ', 'ጋምቤላ', 'ሐረሪ', 'ፌዴራል ተቋማት'
];

const fileTypeMeta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PDF: { icon: <IconFileText size={18} stroke={1.8} />, color: 'text-danger', bg: 'bg-danger/10' },
  DOCX: { icon: <IconFileText size={18} stroke={1.8} />, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  XLSX: { icon: <IconTable size={18} stroke={1.8} />, color: 'text-success', bg: 'bg-success/10' },
  CSV: { icon: <IconCsv size={18} stroke={1.8} />, color: 'text-success', bg: 'bg-success/10' },
};
const defaultFileIcon = { icon: <IconFile size={18} stroke={1.8} />, color: 'text-text-muted', bg: 'bg-surface-secondary' };

type ViewLevel = 'office' | 'region' | 'main' | 'sub' | 'docs';

const WEBSITE_CATEGORIES: PublicFileCategory[] = ['መተዳደርያ ደንብ', 'የኮሚሽኑ መመሪያዎች', 'የፓርቲ መመሪያዎች', 'ሌላ'];
const CONFIDENTIAL_CATEGORIES: PublicFileCategory[] = ['የኮሚሽኑ ሚስጥራዊ ሰነዶች'];

export default function DocumentsPage() {
  const [mainTab, setMainTab] = useState<'code' | 'website' | 'confidential'>('code');

  // --- Code File Management State ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('office');
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  
  const [uploadOffice, setUploadOffice] = useState<string>('main');
  const [uploadMainCat, setUploadMainCat] = useState('000');
  const [uploadSubCat, setUploadSubCat] = useState('010');
  const [uploadYear, setUploadYear] = useState('2026');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showQRForFile, setShowQRForFile] = useState<string | null>(null);
  const [showPublicQRModal, setShowPublicQRModal] = useState(false);

  // --- Other Files State ---
  const [publicFiles, setPublicFiles] = useState<PublicFile[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicUploading, setPublicUploading] = useState(false);
  
  const [activeWebsiteTab, setActiveWebsiteTab] = useState<PublicFileCategory>(WEBSITE_CATEGORIES[0]);
  const [activeConfidentialTab, setActiveConfidentialTab] = useState<PublicFileCategory>(CONFIDENTIAL_CATEGORIES[0]);
  
  const [publicUploadTitle, setPublicUploadTitle] = useState('');
  const [publicUploadCategory, setPublicUploadCategory] = useState<PublicFileCategory>(WEBSITE_CATEGORIES[0]);
  const [publicSelectedFile, setPublicSelectedFile] = useState<File | null>(null);
  const publicFileInputRef = useRef<HTMLInputElement>(null);
  const [publicUploadError, setPublicUploadError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; fileToDelete: { id: string; url: string; category: PublicFileCategory } | null; }>({ isOpen: false, fileToDelete: null });

  const activePublicTab = mainTab === 'website' ? activeWebsiteTab : activeConfidentialTab;
  const currentCategories = mainTab === 'website' ? WEBSITE_CATEGORIES : CONFIDENTIAL_CATEGORIES;

  // Sync upload category when changing tabs
  useEffect(() => {
    if (mainTab === 'website') setPublicUploadCategory(WEBSITE_CATEGORIES[0]);
    if (mainTab === 'confidential') setPublicUploadCategory(CONFIDENTIAL_CATEGORIES[0]);
  }, [mainTab]);

  // --- Code File Management Logic ---
  const fetchDocuments = () => {
    documentService.getDocuments().then(data => {
      setDocuments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (mainTab === 'code') fetchDocuments();
    else loadPublicFiles();
  }, [mainTab, activePublicTab]);

  const filtered = documents.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || (d.description?.toLowerCase().includes(q) ?? false);
  });

  const officeName = OFFICES.find(o => o.code === selectedOffice)?.name || '';
  const mainCategory = MAIN_CATEGORIES.find(m => m.code === selectedMain);
  const subs = selectedMain ? (SUB_CATEGORIES[selectedMain] || []) : [];
  const subCategory = subs.find(s => s.code === selectedSub);

  const docsInOffice = selectedOffice ? filtered.filter(d => d.office === selectedOffice) : [];
  const docsInMain = docsInOffice.filter(d => d.mainCategory === selectedMain);
  const docsInSub = docsInMain.filter(d => d.subCategory === selectedSub);
  const yearsInSub = [...new Set(docsInSub.map(d => d.year))].sort((a, b) => b.localeCompare(a));

  const totalSubs = (mainCode: string) => (SUB_CATEGORIES[mainCode] || []).length;
  const totalDocsInMain = (mainCode: string) => docsInOffice.filter(d => d.mainCategory === mainCode).length;

  const navigateTo = (level: ViewLevel, office?: string, region?: string, main?: string, sub?: string) => {
    if (office !== undefined) setSelectedOffice(office);
    if (region !== undefined) setSelectedRegion(region);
    if (main !== undefined) setSelectedMain(main);
    if (sub !== undefined) setSelectedSub(sub);
    setViewLevel(level);
  };

  const handleBack = () => {
    if (viewLevel === 'region') { setSelectedOffice(null); setViewLevel('office'); }
    else if (viewLevel === 'main') { 
      if (selectedOffice === 'branch') { setSelectedRegion(null); setViewLevel('region'); } 
      else { setSelectedOffice(null); setViewLevel('office'); }
    }
    else if (viewLevel === 'sub') { setSelectedMain(null); setViewLevel('main'); }
    else if (viewLevel === 'docs') { setSelectedSub(null); setViewLevel('sub'); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('ይህን ሰነድ ማጥፋት እንደሚፈልጉ እርግጠኛ ነዎት?')) return;
    const success = await documentService.deleteDocument(id);
    if (success) {
      setDocuments(documents.filter(d => d.id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
    } else alert('ሰነዱን ማጥፋት አልተሳካም።');
  };

  const handleTogglePublic = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    const newStatus = !doc.is_public;
    const success = await documentService.togglePublicStatus(doc.id, newStatus);
    if (success) {
      setDocuments(documents.map(d => d.id === doc.id ? { ...d, is_public: newStatus } : d));
      if (previewDoc?.id === doc.id) setPreviewDoc({ ...previewDoc, is_public: newStatus });
    } else alert('የህዝብ ሁኔታ መቀየር አልተሳካም።');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return alert('እባክዎ ፋይል ይምረጡ');
    setIsUploading(true);
    try {
      const docData = { title: selectedFiles[0].name, description: '', office: uploadOffice as any, mainCategory: uploadMainCat, subCategory: uploadSubCat, year: uploadYear };
      for (const file of selectedFiles) await documentService.uploadDocument(docData, file);
      setUploadModal(false);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('ፋይል መጫን አልተሳካም።');
    } finally {
      setIsUploading(false);
    }
  };

  const getPageTitle = () => {
    if (viewLevel === 'office') return 'የሰነዶች ማከማቻ';
    if (viewLevel === 'region') return officeName;
    if (viewLevel === 'main') return selectedOffice === 'branch' && selectedRegion ? `${officeName} › ${selectedRegion}` : officeName;
    if (viewLevel === 'sub') return selectedOffice === 'branch' ? `${officeName} › ${selectedRegion} › ${mainCategory?.name}` : `${officeName} › ${mainCategory?.name}`;
    return selectedOffice === 'branch' ? `${officeName} › ${selectedRegion} › ${mainCategory?.name} › ${subCategory?.name}` : `${officeName} › ${mainCategory?.name} › ${subCategory?.name}`;
  };

  // --- Other Files Logic ---
  const loadPublicFiles = async () => {
    setPublicLoading(true);
    const data = await publicFilesService.getFiles(activePublicTab);
    setPublicFiles(data);
    setPublicLoading(false);
  };

  const handlePublicUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicUploadTitle.trim() || !publicSelectedFile) return;
    setPublicUploading(true);
    setPublicUploadError('');
    const result = await publicFilesService.uploadFile(publicUploadTitle, publicUploadCategory, publicSelectedFile);
    if (result.success) {
      setPublicUploadTitle('');
      setPublicSelectedFile(null);
      if (publicFileInputRef.current) publicFileInputRef.current.value = '';
      if (publicUploadCategory === activePublicTab) await loadPublicFiles();
      else {
        if (mainTab === 'website') setActiveWebsiteTab(publicUploadCategory);
        else setActiveConfidentialTab(publicUploadCategory);
      }
    } else setPublicUploadError(result.error || 'Failed to upload file.');
    setPublicUploading(false);
  };

  const confirmDelete = async () => {
    if (!confirmDialog.fileToDelete) return;
    const { id, url, category } = confirmDialog.fileToDelete;
    const success = await publicFilesService.deleteFile(id, url, category);
    if (success) {
      setConfirmDialog({ isOpen: false, fileToDelete: null });
      await loadPublicFiles();
    } else alert('Failed to delete file.');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-full max-w-6xl">
        {/* Main Tabs */}
        <div className="flex items-center gap-2 border-b border-border/20 pb-px mt-2 overflow-x-auto">
          <button
            onClick={() => setMainTab('code')}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              mainTab === 'code' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            የኮድ ፋይል አስተዳደር
          </button>
          <button
            onClick={() => setMainTab('website')}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              mainTab === 'website' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            የዌብሳይት ፋይሎች
          </button>
          <button
            onClick={() => setMainTab('confidential')}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              mainTab === 'confidential' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            የኮሚሽኑ ሚስጥራዊ ሰነዶች
          </button>
        </div>

        {mainTab === 'code' && (
          <div className="flex flex-col gap-6 flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-4 mt-2">
              <div className="flex items-center gap-3">
                {viewLevel !== 'office' && (
                  <button onClick={handleBack} className="p-1 hover:bg-surface-secondary rounded-md transition-colors border border-transparent hover:border-border/50">
                    <IconChevronLeft size={20} className="text-text-muted" />
                  </button>
                )}
                <h1 className="text-xl font-bold text-brand-blue tracking-tight">{getPageTitle()}</h1>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowPublicQRModal(true)} 
                  className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm whitespace-nowrap border border-border/50"
                  title="የህዝብ QR"
                >
                  <IconQrcode size={16} />
                  የህዝብ QR
                </button>
                <div className="relative flex-1 sm:flex-initial">
                  <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" placeholder="ሰነድ ፈልግ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 bg-surface-primary border border-border/50 rounded-md pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue transition-colors" />
                </div>
                <button onClick={() => setUploadModal(true)} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
                  <IconUpload size={16} />
                  ሰነድ ጫን
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-start h-24">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
                  <span className="text-sm text-text-muted">በመጫን ላይ...</span>
                </div>
              </div>
            )}

            {!loading && viewLevel === 'office' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {OFFICES.map((office) => {
                  const docCount = documents.filter(d => d.office === office.code).length;
                  const mainCount = [...new Set(documents.filter(d => d.office === office.code).map(d => d.mainCategory))].length;
                  return (
                    <button key={office.code} onClick={() => { if (office.code === 'branch') navigateTo('region', office.code); else navigateTo('main', office.code); }} className="group bg-surface-primary rounded-lg border border-border/50 p-5 hover:border-brand-blue/50 transition-all text-left flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-brand-blue/5 flex items-center justify-center shrink-0 border border-brand-blue/10 group-hover:bg-brand-blue/10 transition-colors">
                        {office.code === 'main' ? <IconBuilding size={20} className="text-brand-blue" /> : <IconBuildingEstate size={20} className="text-brand-blue" />}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-base font-bold text-text-primary group-hover:text-brand-blue transition-colors">{office.name}</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-text-muted">{docCount} ሰነዶች</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="text-xs text-text-muted">{mainCount} ምድቦች</span>
                        </div>
                      </div>
                      <IconChevronLeft size={16} className="text-text-muted rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && viewLevel === 'region' && selectedOffice === 'branch' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ETHIOPIA_REGIONS.map((region) => (
                  <button key={region} onClick={() => navigateTo('main', 'branch', region)} className="group bg-surface-primary rounded-lg border border-border/50 p-4 hover:border-brand-blue/50 transition-all text-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-brand-yellow/10 flex items-center justify-center shrink-0">
                      <IconMapPin size={16} className="text-brand-yellow" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors">{region}</h3>
                      <p className="text-[11px] text-text-muted mt-0.5">{documents.filter(d => d.office === 'branch').length} ሰነዶች</p>
                    </div>
                    <IconChevronLeft size={14} className="text-text-muted rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {!loading && viewLevel === 'main' && selectedOffice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {MAIN_CATEGORIES.map((cat) => (
                  <button key={cat.code} onClick={() => navigateTo('sub', selectedOffice, selectedRegion || undefined, cat.code)} className="group bg-surface-primary rounded-lg border border-border/50 p-4 hover:border-brand-blue/50 transition-all text-left flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-surface-secondary border border-border flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-text-secondary group-hover:text-brand-blue transition-colors">{cat.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight">{cat.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-text-muted">{totalDocsInMain(cat.code)} ሰነዶች</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[11px] text-text-muted">{totalSubs(cat.code)} ንኡስ</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && viewLevel === 'sub' && selectedMain && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subs.map((sub) => (
                  <button key={sub.code} onClick={() => navigateTo('docs', selectedOffice || undefined, selectedRegion || undefined, selectedMain || undefined, sub.code)} className="group bg-surface-primary rounded-lg border border-border/50 p-4 hover:border-brand-blue/50 transition-all text-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-surface-secondary border border-border flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-text-secondary group-hover:text-brand-blue transition-colors">{sub.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors truncate">{sub.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-text-muted">{docsInOffice.filter(d => d.mainCategory === selectedMain && d.subCategory === sub.code).length} ሰነዶች</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && viewLevel === 'docs' && selectedMain && selectedSub && (
              <div className="flex flex-col gap-6">
                {yearsInSub.length === 0 && <div className="p-8 border border-border/50 rounded-lg bg-surface-primary text-center"><span className="text-sm text-text-muted">ምንም ሰነድ አልተገኘም</span></div>}
                {yearsInSub.map(year => (
                  <div key={year} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-brand-blue" />
                      <h2 className="text-sm font-bold text-text-primary">{year} ዓ.ም</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {docsInSub.filter(d => d.year === year).map((doc) => (
                        <div key={doc.id} className="group bg-surface-primary rounded-lg border border-border/50 p-4 hover:border-brand-blue/50 transition-all flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="mt-0.5"><IconFileText size={18} className="text-text-muted group-hover:text-brand-blue transition-colors" /></div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-text-primary truncate">{doc.title}</h3>
                                {doc.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{doc.description}</p>}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] text-text-muted">{doc.uploadedBy}</span>
                                  <span className="w-1 h-1 rounded-full bg-border" />
                                  <span className="text-[10px] text-text-muted">{doc.uploadDate}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => handleTogglePublic(e, doc)} className={`text-xs flex items-center gap-1 ${doc.is_public ? 'text-green-600 hover:text-green-700' : 'text-orange-500 hover:text-orange-600'} transition-colors`} title={doc.is_public ? 'ለህዝብ ክፍት ነው (Public)' : 'ግል ሰነድ (Private)'}>
                                {doc.is_public ? <IconEye size={16} stroke={1.5} /> : <IconEyeOff size={16} stroke={1.5} />}
                              </button>
                              <button onClick={(e) => handleDelete(e, doc.id)} className="text-red-500 hover:text-red-600 transition-colors" title="አጥፋ">
                                <IconTrash size={16} stroke={1.5} />
                              </button>
                              <button onClick={() => setPreviewDoc(doc)} className="text-brand-blue text-xs font-semibold whitespace-nowrap">
                                ዝርዝር
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 pt-3 border-t border-border/30">
                            {doc.files.map((file) => {
                              const meta = fileTypeMeta[file.fileType] || defaultFileIcon;
                              return (
                                <div key={file.id} className="flex items-center gap-3 bg-surface-secondary/50 p-2 rounded-md border border-transparent hover:border-border/50 group/file transition-colors">
                                  <span className={meta.color}>{meta.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-medium text-text-primary truncate">{file.name}</div>
                                    <div className="text-[10px] text-text-muted">{file.fileType} • {file.fileSize}</div>
                                  </div>
                                  <a href={documentService.getFileUrl ? documentService.getFileUrl({ office: doc.office, year: doc.year }, file.id) : '#'} target="_blank" rel="noreferrer" className="text-brand-blue opacity-0 group-hover/file:opacity-100 transition-opacity p-1"><IconDownload size={14} /></a>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(mainTab === 'website' || mainTab === 'confidential') && (
          <div className="flex flex-col gap-6 mt-4">
            <div className="bg-surface-primary border border-border/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-primary mb-4">አዲስ ፋይል ይጫኑ</h2>
              {publicUploadError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{publicUploadError}</div>}
              <form onSubmit={handlePublicUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">ርዕስ</label>
                  <input type="text" required value={publicUploadTitle} onChange={(e) => setPublicUploadTitle(e.target.value)} placeholder="የፋይሉ ርዕስ..." className="w-full bg-surface-secondary/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">ምድብ</label>
                  <select value={publicUploadCategory} onChange={(e) => setPublicUploadCategory(e.target.value as PublicFileCategory)} className="w-full bg-surface-secondary/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors">
                    {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">ፋይል</label>
                  <div className="relative">
                    <input type="file" required ref={publicFileInputRef} onChange={(e) => setPublicSelectedFile(e.target.files?.[0] || null)} className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 transition-all border border-border/30 rounded-xl p-0.5 bg-surface-secondary/50" accept=".pdf,.doc,.docx" />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <button type="submit" disabled={publicUploading || !publicSelectedFile || !publicUploadTitle.trim()} className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    {publicUploading ? <IconLoader2 size={18} className="animate-spin" /> : <IconUpload size={18} />} ይጫኑ
                  </button>
                </div>
              </form>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6 border-b border-border/20 overflow-x-auto pb-px">
                <div className="flex items-center gap-2">
                  {currentCategories.map(category => {
                    const isActive = mainTab === 'website' ? activeWebsiteTab === category : activeConfidentialTab === category;
                    return (
                      <button 
                        key={category} 
                        onClick={() => mainTab === 'website' ? setActiveWebsiteTab(category) : setActiveConfidentialTab(category)} 
                        className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'}`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
                {mainTab === 'confidential' && (
                  <button 
                    onClick={() => setShowPublicQRModal(true)} // Reusing the modal logic, but we'll conditionally render the correct QR URL inside the modal
                    className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm whitespace-nowrap border border-border/50 mb-2"
                    title="የመዳረሻ QR"
                  >
                    <IconQrcode size={16} />
                    የመዳረሻ QR
                  </button>
                )}
              </div>
              {publicLoading ? (
                <div className="flex justify-center py-12"><IconLoader2 className="animate-spin text-brand-blue" size={32} /></div>
              ) : publicFiles.length === 0 ? (
                <div className="text-center py-12 bg-surface-primary/30 border border-border/20 rounded-2xl"><IconFileText size={48} className="mx-auto text-text-muted/30 mb-3" /><p className="text-text-muted text-sm">ምንም ፋይል አልተገኘም</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicFiles.map(file => (
                    <div key={file.id} className="bg-surface-primary/40 border border-border/20 rounded-2xl p-5 flex flex-col gap-3 group hover:border-brand-blue/30 transition-all hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-brand-blue/10 rounded-xl text-brand-blue"><IconFileText size={20} /></div>
                        <button onClick={() => setConfirmDialog({ isOpen: true, fileToDelete: { id: file.id, url: file.file_url, category: file.category } })} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="አጥፋ">
                          <IconTrash size={16} />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary line-clamp-1" title={file.title}>{file.title}</h3>
                        <p className="text-xs text-text-muted mt-1">{file.file_name}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/10">
                        <span className="text-xs text-text-muted font-mono">{file.file_size}</span>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-blue flex items-center gap-1 hover:underline">
                          ይመልከቱ <IconExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- Modals for Code File Management --- */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setUploadModal(false)}>
          <div className="bg-surface-primary rounded-lg border border-border/50 max-w-xl w-full shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 sticky top-0 bg-surface-primary z-10">
              <h3 className="text-base font-bold text-text-primary">አዲስ ሰነድ ጫን</h3>
              <button onClick={() => setUploadModal(false)} className="text-text-muted hover:text-text-primary"><IconX size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary">ቢሮ</label>
                  <select value={uploadOffice} onChange={(e) => setUploadOffice(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-md p-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue">
                    {OFFICES.map(o => <option key={o.code} value={o.code}>{o.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary">ዓመት</label>
                  <select value={uploadYear} onChange={(e) => setUploadYear(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-md p-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue">
                    {['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012'].map(y => <option key={y} value={y}>{y} ዓ.ም</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">ዋና ምድብ</label>
                <select value={uploadMainCat} onChange={(e) => { setUploadMainCat(e.target.value); setUploadSubCat((SUB_CATEGORIES[e.target.value] || [])[0]?.code || ''); }} className="w-full bg-surface-primary border border-border/50 rounded-md p-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue">
                  {MAIN_CATEGORIES.map(cat => <option key={cat.code} value={cat.code}>{cat.code} - {cat.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">ንኡስ ምድብ</label>
                <select value={uploadSubCat} onChange={(e) => setUploadSubCat(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-md p-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue">
                  {(SUB_CATEGORIES[uploadMainCat] || []).map(sub => <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold text-text-secondary">ፋይሎች</label>
                <div onClick={() => fileInputRef.current?.click()} className="w-full rounded-md border-2 border-dashed border-border/50 bg-surface-secondary/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-blue/50 transition-colors p-6">
                  <IconUpload size={20} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">ፋይሎችን ይምረጡ</span>
                </div>
                <input type="file" multiple hidden ref={fileInputRef} onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {selectedFiles.map((f, i) => <div key={i} className="text-[11px] text-text-primary flex items-center gap-2"><IconFileText size={14} className="text-brand-blue" /> {f.name}</div>)}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/30 mt-2">
                <button onClick={() => setUploadModal(false)} className="px-4 py-2 bg-surface-secondary hover:bg-border/50 text-text-primary rounded-md text-sm font-medium transition-colors">ሰርዝ</button>
                <button onClick={handleUpload} disabled={isUploading} className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition-colors">
                  {isUploading ? 'በመጫን ላይ...' : 'ጫን'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewDoc && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-surface-primary rounded-lg border border-border/50 max-w-xl w-full shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 py-4 border-b border-border/50 sticky top-0 bg-surface-primary z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-brand-blue">{previewDoc.mainCategory}.{previewDoc.subCategory}</span>
                  <span className="text-[10px] text-text-muted">{previewDoc.year} ዓ.ም</span>
                  {!previewDoc.is_public && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-sm">ግል ፋይል</span>}
                </div>
                <h3 className="text-base font-bold text-text-primary">{previewDoc.title}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-text-muted hover:text-text-primary"><IconX size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              {previewDoc.description && <p className="text-sm text-text-secondary">{previewDoc.description}</p>}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'ቢሮ', value: OFFICES.find(o => o.code === previewDoc.office)?.name || '' },
                  { label: 'ዋና ምድብ', value: `${previewDoc.mainCategory} - ${MAIN_CATEGORIES.find(m => m.code === previewDoc.mainCategory)?.name || ''}` },
                  { label: 'ንኡስ ምድብ', value: `${previewDoc.subCategory} - ${SUB_CATEGORIES[previewDoc.mainCategory]?.find(s => s.code === previewDoc.subCategory)?.name || ''}` },
                  { label: 'ያወጣው', value: previewDoc.uploadedBy },
                  { label: 'የተለቀቀበት ቀን', value: previewDoc.uploadDate },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-text-muted">{item.label}</span>
                    <span className="text-sm font-medium text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-primary mb-3">የተያያዙ ፋይሎች</h4>
                <div className="flex flex-col gap-2">
                  {previewDoc.files.map((file) => {
                    const meta = fileTypeMeta[file.fileType] || defaultFileIcon;
                    return (
                      <div key={file.id} className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 p-3 rounded-md bg-surface-primary border border-border/50">
                          <span className={meta.color}>{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{file.name}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">{file.fileType} • {file.fileSize}</div>
                          </div>
                          <button onClick={() => setShowQRForFile(showQRForFile === file.name ? null : file.name)} className="p-1.5 text-text-muted hover:text-brand-blue rounded transition-colors" title="QR ኮድ አሳይ"><IconQrcode size={16} /></button>
                          <a href={documentService.getFileUrl ? documentService.getFileUrl({ office: previewDoc.office, year: previewDoc.year }, file.id) : '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded text-xs font-medium transition-colors"><IconDownload size={14} /> አውርድ</a>
                        </div>
                        {showQRForFile === file.name && (
                          <div className="flex flex-col items-center justify-center p-4 bg-surface-secondary/30 rounded-md border border-border/50 mt-1 mb-1">
                            <div className="p-2 bg-white rounded border border-border/50">
                              <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/request-access?targetType=file&target=${encodeURIComponent(file.name)}`} size={120} fgColor="#1a1a2e" />
                            </div>
                            <span className="text-[10px] text-text-muted mt-2">መዳረሻ ለመጠየቅ ይህንን ኮድ ይቃኙ</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Code QR Modal */}
      {showPublicQRModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowPublicQRModal(false)}>
          <div className="bg-surface-primary rounded-lg border border-border/50 max-w-sm w-full shadow-lg p-8 flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end w-full mb-2">
              <button onClick={() => setShowPublicQRModal(false)} className="text-text-muted hover:text-text-primary"><IconX size={18} /></button>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {mainTab === 'confidential' ? 'የሚስጥራዊ ሰነዶች መዳረሻ QR' : 'የህዝብ ፋይሎች QR'}
            </h3>
            <p className="text-sm text-text-muted mb-6">
              {mainTab === 'confidential' 
                ? 'ይህንን QR በመቃኘት ለሚስጥራዊ ሰነዶች መዳረሻ መጠየቅ ይቻላል።' 
                : 'ይህንን QR በመቃኘት ማንም ሰው ክፍት የሆኑ የኮድ ፋይሎችን ማየት ይችላል።'}
            </p>
            <div className="p-4 bg-white rounded-xl border border-border/50 shadow-sm inline-block mb-4">
              <QRCodeSVG 
                value={mainTab === 'confidential' 
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/request-access?targetType=confidential&target=የኮሚሽኑ ሚስጥራዊ ሰነዶች`
                  : `${typeof window !== 'undefined' ? window.location.origin : ''}/public/code-documents`} 
                size={200} 
                fgColor="#1a1a2e" 
              />
            </div>
            {mainTab !== 'confidential' && (
              <a href="/public/code-documents" target="_blank" className="text-brand-blue text-sm font-semibold hover:underline">ሊንኩን ይክፈቱ</a>
            )}
            {mainTab === 'confidential' && (
              <a href="/request-access?targetType=confidential&target=የኮሚሽኑ ሚስጥራዊ ሰነዶች" target="_blank" className="text-brand-blue text-sm font-semibold hover:underline">ሊንኩን ይክፈቱ</a>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal for Other Files */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title="ፋይል ማጥፋት"
        message="እርግጠኛ ነዎት ይህን ፋይል ማጥፋት ይፈልጋሉ?"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, fileToDelete: null })}
      />
    </DashboardLayout>
  );
}
