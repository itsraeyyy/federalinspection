'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  IconCheck, 
  IconX, 
  IconDeviceMobile, 
  IconFileText, 
  IconCopy, 
  IconBuilding, 
  IconShieldLock, 
  IconTrash,
  IconExternalLink,
  IconShieldCheck
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from "@/lib/supabaseClient";

type QRCategory = 'public_hq' | 'confidential_docs';

interface CategoryOption {
  id: QRCategory;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  targetUrlSuffix: string;
  isPublic: boolean;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'public_hq',
    title: 'ኮሚሽን ዋና ጽ/ቤት',
    subtitle: 'ለህዝብ ክፍት የሆኑ የኮሚሽኑ ሰነዶችና መረጃዎች',
    badge: 'ህዝባዊ ሰነዶች',
    icon: IconBuilding,
    targetUrlSuffix: '/public/code-documents?office=main',
    isPublic: true
  },
  {
    id: 'confidential_docs',
    title: 'የኮሚሽኑ ሚስጥራዊ ሰነዶች',
    subtitle: 'ለተፈቀደላቸው አመራሮችና አባላት ብቻ የሚጋራ',
    badge: 'ሚስጥራዊ ሰነዶች',
    icon: IconShieldLock,
    targetUrlSuffix: '/request-access?target=confidential',
    isPublic: false
  }
];

export default function QRAccessPage() {
  const [selectedCategory, setSelectedCategory] = useState<QRCategory>('public_hq');
  const [copied, setCopied] = useState(false);
  
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);

  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  useEffect(() => {
    // Fetch initial access requests
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('scan_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPendingRequests(data.filter(r => r.status === 'Pending'));
        setHistoryRequests(data.filter(r => r.status !== 'Pending'));
      }
    };

    fetchRequests();

    // Subscribe to new access requests in real-time
    const subscription = supabase
      .channel('public:scan_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.status === 'Pending') {
            setPendingRequests(prev => [payload.new, ...prev]);
          } else {
            setHistoryRequests(prev => [payload.new, ...prev]);
          }
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status !== 'Pending') {
            setPendingRequests(prev => prev.filter(req => req.id !== payload.new.id));
            setHistoryRequests(prev => {
              const exists = prev.find(req => req.id === payload.new.id);
              if (exists) {
                return prev.map(req => req.id === payload.new.id ? payload.new : req);
              }
              return [payload.new, ...prev];
            });
          } else {
            setPendingRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleApprove = async (id: string) => {
    const reqToUpdate = pendingRequests.find(r => r.id === id);
    const resolvedAt = new Date().toISOString();
    
    if (reqToUpdate) {
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      setHistoryRequests(prev => [{ ...reqToUpdate, status: 'Approved', resolved_at: resolvedAt }, ...prev]);
    }

    await supabase
      .from('scan_requests')
      .update({ status: 'Approved', resolved_at: resolvedAt })
      .eq('id', id);
  };

  const handleDeny = async (id: string) => {
    const reqToUpdate = pendingRequests.find(r => r.id === id);
    const resolvedAt = new Date().toISOString();
    
    if (reqToUpdate) {
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      setHistoryRequests(prev => [{ ...reqToUpdate, status: 'Denied', resolved_at: resolvedAt }, ...prev]);
    }

    await supabase
      .from('scan_requests')
      .update({ status: 'Denied', resolved_at: resolvedAt })
      .eq('id', id);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('ሁሉንም የታሪክ መዝገቦች ማጥፋት ይፈልጋሉ?')) return;
    
    setHistoryRequests([]);
    await supabase.from('scan_requests').delete().neq('status', 'Pending');
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}${currentCategoryObj.targetUrlSuffix}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-semibold mb-2 border border-brand-blue/20">
              <IconShieldCheck size={14} /> የደህንነትና የQR መዳረሻ ማስተዳደሪያ
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-text-primary tracking-tight">የQR መዳረሻ አስተዳደር</h1>
            <p className="text-sm text-text-secondary mt-1">ለኮሚሽኑ ዋና ጽ/ቤት እና ሚስጥራዊ ሰነዶች ማረጋገጫ QR ኮድ ማመንጫ</p>
          </div>
        </div>

        {/* Category Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`cursor-pointer rounded-2xl p-6 border transition-all flex items-center justify-between shadow-sm ${
                  isSelected 
                    ? 'border-brand-blue bg-surface-primary ring-2 ring-brand-blue/10' 
                    : 'border-border/40 bg-surface-primary/40 hover:bg-surface-primary/80 hover:border-border/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-xl border ${
                    isSelected ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-surface-secondary border-border/40 text-text-muted'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-text-primary">{cat.title}</h3>
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-surface-secondary text-text-secondary border border-border/40">
                        {cat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{cat.subtitle}</p>
                  </div>
                </div>

                <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm' 
                    : 'bg-surface-secondary text-text-muted border-border/40 hover:text-text-primary'
                }`}>
                  {isSelected ? 'ተመርጧል' : 'ምረጥ'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid: QR Generator Card & Access Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column (2/5): Professional QR Visual Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              የQR ኮድ
            </h2>

            <div className="bg-surface-primary/60 border border-border/40 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center gap-6 shadow-sm">
              
              {/* Selected Category Indicator */}
              <div className="w-full text-center p-3 rounded-xl bg-surface-secondary/40 border border-border/30">
                <span className="text-[11px] text-text-muted block font-medium">የተመረጠው ዘርፍ</span>
                <span className="text-sm font-bold text-text-primary">{currentCategoryObj.title}</span>
              </div>

              {/* QR Frame */}
              <div className="w-56 h-56 rounded-2xl bg-white border border-border/30 flex items-center justify-center p-5 shadow-sm">
                <QRCodeSVG value={qrUrl} size={190} fgColor="#0f172a" />
              </div>

              {/* Action Buttons */}
              <div className="w-full flex gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary py-3 rounded-xl text-xs font-semibold transition-all border border-border/50 shadow-sm"
                >
                  {copied ? <IconCheck size={16} className="text-emerald-600" /> : <IconCopy size={16} />}
                  {copied ? 'ተቀድቷል' : 'ሊንክ ቅዳ'}
                </button>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white py-3 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  <IconExternalLink size={16} />
                  ሊንኩን ይክፈቱ
                </a>
              </div>
            </div>
          </div>

          {/* Right Column (3/5): Access Requests & Log */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Pending Requests Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                በመጠባበቅ ላይ ያሉ የመዳረሻ ጥያቄዎች
              </h2>
              <span className="text-[11px] font-bold text-text-primary bg-surface-secondary px-2.5 py-0.5 rounded-md border border-border/40">
                {pendingRequests.length} አዲስ ጥያቄ
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-surface-primary/50 border border-border/30 rounded-xl overflow-hidden p-4 sm:p-5 hover:border-border/60 transition-all shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 border border-border/40">
                        <IconDeviceMobile size={20} className="text-text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary truncate">{req.requester_device || 'Unknown Device'}</span>
                          <span className="text-[10px] text-text-muted shrink-0">• {new Date(req.created_at).toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <IconFileText size={12} className="text-text-muted shrink-0" />
                          <span className="text-xs text-brand-blue font-medium truncate">{req.file_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button 
                        onClick={() => handleApprove(req.id)} 
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <IconCheck size={14} stroke={2.5} />
                        ፍቀድ
                      </button>
                      <button 
                        onClick={() => handleDeny(req.id)} 
                        className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        <IconX size={14} stroke={2.5} />
                        ከልክል
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center h-44 gap-2 border border-dashed border-border/40 rounded-2xl bg-surface-primary/20 p-6 text-center">
                  <IconShieldCheck size={32} className="text-text-muted/40" />
                  <div className="text-xs text-text-muted font-semibold">ምንም በመጠባበቅ ላይ ያለ ጥያቄ የለም</div>
                  <p className="text-[11px] text-text-muted/70">አዳዲስ የQR መዳረሻ ጥያቄዎች ሲቀርቡ እዚህ ይደርሰዎታል።</p>
                </div>
              )}
            </div>

            {/* History Header */}
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                የጥያቄዎች ታሪክ
              </h2>
              {historyRequests.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="text-[11px] font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  <IconTrash size={14} /> ታሪክ አጥፋ
                </button>
              )}
            </div>

            {/* History Records List */}
            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {historyRequests.map((req) => (
                <div key={req.id} className="bg-surface-primary/40 border border-border/30 rounded-xl p-3.5 flex items-center justify-between gap-4 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {req.status === 'Approved' ? <IconCheck size={16} stroke={2.5} /> : <IconX size={16} stroke={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate">{req.requester_device || 'Unknown Device'}</div>
                      <div className="text-[11px] text-text-muted truncate">{req.file_name}</div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md shrink-0 border ${
                    req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                  }`}>
                    {req.status === 'Approved' ? 'ተፈቅዷል' : 'ተከልክሏል'}
                  </span>
                </div>
              ))}

              {historyRequests.length === 0 && (
                <div className="text-xs text-text-muted text-center py-6">ምንም የተመዘገበ ታሪክ የለም</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
