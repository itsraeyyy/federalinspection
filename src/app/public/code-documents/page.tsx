'use client';

import { useEffect, useState } from "react";
import { documentService, MAIN_CATEGORIES, SUB_CATEGORIES } from "@/services/documents";
import { Document, OFFICES } from "@/types";
import { IconFileText, IconTable, IconCsv, IconFile, IconDownload, IconSearch, IconChevronLeft, IconBuilding, IconBuildingEstate, IconCalendar } from "@tabler/icons-react";
import Image from "next/image";

const fileTypeMeta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PDF: { icon: <IconFileText size={18} stroke={1.8} />, color: 'text-danger', bg: 'bg-danger/10' },
  DOCX: { icon: <IconFileText size={18} stroke={1.8} />, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  XLSX: { icon: <IconTable size={18} stroke={1.8} />, color: 'text-success', bg: 'bg-success/10' },
  CSV: { icon: <IconCsv size={18} stroke={1.8} />, color: 'text-success', bg: 'bg-success/10' },
};
const defaultFileIcon = { icon: <IconFile size={18} stroke={1.8} />, color: 'text-text-muted', bg: 'bg-surface-secondary' };

type ViewLevel = 'office' | 'main' | 'sub' | 'docs';

export default function PublicCodeDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('office');
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    documentService.getDocuments().then(data => {
      // Filter only public documents
      setDocuments(data.filter(d => d.is_public));
      setLoading(false);
    });
  }, []);

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

  const navigateTo = (level: ViewLevel, office?: string, main?: string, sub?: string) => {
    if (office !== undefined) setSelectedOffice(office);
    if (main !== undefined) setSelectedMain(main);
    if (sub !== undefined) setSelectedSub(sub);
    setViewLevel(level);
  };

  const handleBack = () => {
    if (viewLevel === 'main') { setSelectedOffice(null); setViewLevel('office'); }
    else if (viewLevel === 'sub') { setSelectedMain(null); setViewLevel('main'); }
    else if (viewLevel === 'docs') { setSelectedSub(null); setViewLevel('sub'); }
  };

  const getPageTitle = () => {
    if (viewLevel === 'office') return 'የህዝብ ሰነዶች ማከማቻ';
    if (viewLevel === 'main') return officeName;
    if (viewLevel === 'sub') return `${officeName} › ${mainCategory?.name}`;
    return `${officeName} › ${mainCategory?.name} › ${subCategory?.name}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brand-blue/20">
      {/* Public Header */}
      <header className="h-[72px] shrink-0 flex items-center justify-between px-4 md:px-10 bg-surface-primary/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 min-w-[40px] rounded-full overflow-hidden border border-border/50">
            <Image src="/logo.jpg" alt="Commission Logo" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">የህዝብ ኮድ ሰነዶች</span>
            <span className="text-xs text-text-muted leading-tight">ለህዝብ ክፍት የሆኑ ሰነዶች ማውጫ</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-4">
            <div className="flex items-center gap-3">
              {viewLevel !== 'office' && (
                <button onClick={handleBack} className="p-1 hover:bg-surface-secondary rounded-md transition-colors border border-transparent hover:border-border/50">
                  <IconChevronLeft size={20} className="text-text-muted" />
                </button>
              )}
              <h1 className="text-xl font-bold text-brand-blue tracking-tight">{getPageTitle()}</h1>
            </div>
            <div className="relative w-full sm:w-64">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="ሰነድ ፈልግ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-md pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue transition-colors shadow-sm" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
            </div>
          ) : viewLevel === 'office' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OFFICES.map((office) => {
                const docCount = documents.filter(d => d.office === office.code).length;
                if (docCount === 0 && searchQuery) return null; // Hide empty offices when searching
                return (
                  <button key={office.code} onClick={() => navigateTo('main', office.code)} className="group bg-surface-primary rounded-xl border border-border/50 p-6 hover:border-brand-blue/50 transition-all text-left flex items-start gap-4 shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-lg bg-brand-blue/5 flex items-center justify-center shrink-0 border border-brand-blue/10 group-hover:bg-brand-blue/10 transition-colors">
                      {office.code === 'main' ? <IconBuilding size={24} className="text-brand-blue" /> : <IconBuildingEstate size={24} className="text-brand-blue" />}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-text-primary group-hover:text-brand-blue transition-colors">{office.name}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-text-muted">{docCount} ሰነዶች</span>
                      </div>
                    </div>
                    <IconChevronLeft size={20} className="text-text-muted rotate-180 opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                  </button>
                );
              })}
            </div>
          ) : viewLevel === 'main' && selectedOffice ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MAIN_CATEGORIES.map((cat) => {
                const docCount = docsInOffice.filter(d => d.mainCategory === cat.code).length;
                if (docCount === 0) return null;
                return (
                  <button key={cat.code} onClick={() => navigateTo('sub', selectedOffice, cat.code)} className="group bg-surface-primary rounded-xl border border-border/50 p-5 hover:border-brand-blue/50 transition-all text-left flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-surface-secondary border border-border flex items-center justify-center shrink-0">
                      <span className="text-base font-bold text-text-secondary group-hover:text-brand-blue transition-colors">{cat.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight">{cat.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted">{docCount} ሰነዶች</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : viewLevel === 'sub' && selectedMain ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subs.map((sub) => {
                const docCount = docsInOffice.filter(d => d.mainCategory === selectedMain && d.subCategory === sub.code).length;
                if (docCount === 0) return null;
                return (
                  <button key={sub.code} onClick={() => navigateTo('docs', selectedOffice || undefined, selectedMain || undefined, sub.code)} className="group bg-surface-primary rounded-xl border border-border/50 p-5 hover:border-brand-blue/50 transition-all text-left flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-secondary border border-border flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-text-secondary group-hover:text-brand-blue transition-colors">{sub.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary group-hover:text-brand-blue transition-colors truncate">{sub.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">{docCount} ሰነዶች</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : viewLevel === 'docs' && selectedMain && selectedSub ? (
            <div className="flex flex-col gap-8">
              {yearsInSub.map(year => (
                <div key={year} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                    <IconCalendar size={20} className="text-brand-blue" />
                    <h2 className="text-lg font-bold text-text-primary">{year} ዓ.ም</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {docsInSub.filter(d => d.year === year).map((doc) => (
                      <div key={doc.id} className="bg-surface-primary rounded-xl border border-border/50 p-5 hover:border-brand-blue/50 transition-all flex flex-col gap-4 shadow-sm hover:shadow-md">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="mt-0.5 p-2 bg-brand-blue/10 rounded-lg"><IconFileText size={20} className="text-brand-blue" /></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-text-primary truncate">{doc.title}</h3>
                            {doc.description && <p className="text-sm text-text-muted mt-1.5 line-clamp-2">{doc.description}</p>}
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs font-medium text-text-muted bg-surface-secondary px-2 py-1 rounded-md">{doc.uploadDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
                          {doc.files.map((file) => {
                            const meta = fileTypeMeta[file.fileType] || defaultFileIcon;
                            return (
                              <div key={file.id} className="flex items-center gap-3 bg-surface-secondary/50 p-3 rounded-lg border border-transparent hover:border-border/50 group/file transition-colors">
                                <span className={meta.color}>{meta.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-text-primary truncate">{file.name}</div>
                                  <div className="text-xs text-text-muted mt-0.5">{file.fileType} • {file.fileSize}</div>
                                </div>
                                <a href={documentService.getFileUrl ? documentService.getFileUrl({ office: doc.office, year: doc.year }, file.id) : '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-white border border-border/50 text-text-primary text-xs font-semibold px-3 py-1.5 rounded hover:bg-surface-secondary transition-colors shadow-sm">
                                  <IconDownload size={14} /> አውርድ
                                </a>
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
          ) : null}
        </div>
      </main>
    </div>
  );
}
