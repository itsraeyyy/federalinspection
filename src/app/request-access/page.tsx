'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { IconFileText, IconCheck, IconX, IconLoader2, IconDownload, IconShieldLock } from '@tabler/icons-react';

function RequestAccessForm() {
  const searchParams = useSearchParams();
  const targetType = searchParams.get('targetType');
  const target = searchParams.get('target');

  const [name, setName] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('Unknown Device');
  
  // 'idle' | 'submitting' | 'pending' | 'approved' | 'denied'
  const [status, setStatus] = useState<'idle' | 'submitting' | 'pending' | 'approved' | 'denied'>('idle');
  const [requestId, setRequestId] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [categoryFiles, setCategoryFiles] = useState<{doc: any, file: any}[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(false);

  useEffect(() => {
    // Basic User-Agent parser for a friendly device name
    const ua = navigator.userAgent;
    let device = 'Mobile Device';
    if (/android/i.test(ua)) device = 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) device = 'iOS';
    if (/windows phone/i.test(ua)) device = 'Windows Phone';
    if (/windows nt/i.test(ua)) device = 'Windows PC';
    if (/macintosh/i.test(ua)) device = 'Mac';
    
    let browser = 'Browser';
    if (/chrome|crios|crmo/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';

    setDeviceInfo(`${device} - ${browser}`);
  }, []);

  useEffect(() => {
    if (!requestId || status !== 'pending') return;

    // Listen for status changes
    const subscription = supabase
      .channel(`scan_request_${requestId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'scan_requests', 
        filter: `id=eq.${requestId}` 
      }, (payload) => {
        const newStatus = payload.new.status;
        if (newStatus === 'Approved') setStatus('approved');
        if (newStatus === 'Denied') setStatus('denied');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [requestId, status]);

  useEffect(() => {
    if (status === 'approved' && targetType !== 'file') {
      fetchCategoryFiles();
    }
  }, [status, targetType]);

  const fetchCategoryFiles = async () => {
    if (!target) return;
    setFetchingFiles(true);
    try {
      const { data: docs, error: docsError } = await supabase.from('documents').select('*');
      if (docsError) throw docsError;

      const codePart = target.split(' - ')[0];
      let mainCode = '';
      let subCode = '';
      
      if (targetType === 'main') {
        mainCode = codePart;
      } else if (targetType === 'sub') {
        const parts = codePart.split('.');
        mainCode = parts[0];
        subCode = parts[1];
      }

      const filesList: {doc: any, file: any}[] = [];
      docs.forEach(doc => {
        let match = false;
        if (targetType === 'main' && doc.main_category === mainCode) match = true;
        if (targetType === 'sub' && doc.main_category === mainCode && doc.sub_category === subCode) match = true;
        
        if (match && doc.files) {
          doc.files.forEach((f: any) => {
            filesList.push({doc, file: f});
          });
        }
      });
      setCategoryFiles(filesList);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingFiles(false);
    }
  };

  const downloadFile = async (doc: any, file: any) => {
    try {
      const storagePath = `${doc.office}/${doc.year}/${file.id}`;
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(storagePath, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert('ፋይሉን ማውረድ አልተሳካም።');
    }
  };

  const handleDownloadSingle = async () => {
    if (!target) return;
    setDownloading(true);
    try {
      const { data: docs, error: docsError } = await supabase.from('documents').select('*');
      if (docsError) throw docsError;

      let foundDoc = null;
      let foundFile = null;

      for (const doc of docs) {
        const files = doc.files || [];
        const file = files.find((f: any) => f.name === target);
        if (file) {
          foundDoc = doc;
          foundFile = file;
          break;
        }
      }

      if (foundDoc && foundFile) {
        await downloadFile(foundDoc, foundFile);
      } else {
        alert('ፋይሉ አልተገኘም');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setStatus('submitting');

    const { data, error } = await supabase
      .from('scan_requests')
      .insert([{
        requester_device: `${name.trim()} (${deviceInfo})`,
        file_name: target || 'Unknown Target',
        status: 'Pending'
      }])
      .select('id')
      .single();

    if (error) {
      console.error(error);
      alert('ጥያቄውን መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
      setStatus('idle');
      return;
    }

    if (data) {
      setRequestId(data.id);
      setStatus('pending');
    }
  };

  if (!target) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted">
        <IconX size={48} className="text-danger mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">የተሳሳተ መዳረሻ</h2>
        <p>የመዳረሻ አድራሻው ትክክል አይደለም ወይም ጊዜው አልፎበታል።</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
          <IconShieldLock size={32} className="text-brand-blue" stroke={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">የመዳረሻ ጥያቄ</h1>
          <p className="text-sm text-text-muted mt-2">
            ለዚህ ሰነድ መዳረሻ ለማግኘት እባክዎ ስምዎን ያስገቡ እና አስተዳዳሪ እስኪፈቅድ ይጠብቁ።
          </p>
        </div>
      </div>

      {/* Target Info */}
      <div className="bg-surface-secondary/50 rounded-2xl p-4 border border-border/50">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 text-center">
          የተጠየቀ ሰነድ
        </div>
        <div className="flex items-center justify-center gap-3">
          <IconFileText size={20} className="text-brand-blue shrink-0" />
          <span className="font-semibold text-text-primary text-sm break-words text-center">
            {target}
          </span>
        </div>
      </div>

      {/* Form / Status */}
      <div className="bg-white rounded-3xl border border-border/30 shadow-sm p-6 relative overflow-hidden">
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-yellow" />

        {status === 'idle' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-text-primary">
                ሙሉ ስም
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ስምዎን ያስገቡ..."
                required
                className="w-full bg-surface-primary/50 border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              መዳረሻ ጠይቅ
            </button>
          </form>
        )}

        {status === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <IconLoader2 size={32} className="text-brand-blue animate-spin" />
            <p className="text-sm font-medium text-text-primary">በመላክ ላይ...</p>
          </div>
        )}

        {status === 'pending' && (
          <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-warning/30 border-t-warning animate-spin" />
              <IconLoader2 size={24} className="text-warning animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">ጥያቄው ተልኳል</h3>
              <p className="text-sm text-text-muted mt-2 max-w-[250px] mx-auto">
                አስተዳዳሪ ጥያቄዎን እስኪፈቅድ ድረስ እባክዎ ይህንን ገጽ አይዝጉ።
              </p>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="flex flex-col items-center justify-center py-6 gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <IconCheck size={32} className="text-success" stroke={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">ጥያቄው ተፈቅዷል!</h3>
              <p className="text-sm text-text-muted mt-2">
                አሁን ሰነዱን ማውረድ ወይም ማየት ይችላሉ።
              </p>
            </div>
            {targetType === 'file' ? (
              <button 
                onClick={handleDownloadSingle} 
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-70"
              >
                {downloading ? <IconLoader2 size={20} className="animate-spin" /> : <IconDownload size={20} />}
                {downloading ? 'በማውረድ ላይ...' : 'ሰነዱን አውርድ'}
              </button>
            ) : (
              <div className="w-full flex flex-col gap-3 max-h-64 overflow-y-auto mt-4 text-left border-t border-border/50 pt-4">
                <h4 className="text-sm font-semibold text-text-primary mb-2">የተፈቀዱ ሰነዶች፡</h4>
                {fetchingFiles ? (
                  <div className="flex justify-center p-4"><IconLoader2 className="animate-spin text-brand-blue" /></div>
                ) : (
                  categoryFiles.length > 0 ? categoryFiles.map((cf, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface-primary/50 border border-border/50 rounded-xl hover:border-brand-blue/30 transition-colors">
                      <span className="text-xs font-medium text-text-primary truncate mr-2" title={cf.file.name}>{cf.file.name}</span>
                      <button onClick={() => downloadFile(cf.doc, cf.file)} className="text-brand-blue hover:text-brand-blue/80 p-2 bg-brand-blue/10 rounded-lg transition-colors shrink-0">
                        <IconDownload size={16} stroke={2} />
                      </button>
                    </div>
                  )) : (
                    <div className="text-sm text-text-muted text-center p-4 bg-surface-primary/50 rounded-xl">ምንም ሰነድ አልተገኘም</div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {status === 'denied' && (
          <div className="flex flex-col items-center justify-center py-6 gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
              <IconX size={32} className="text-danger" stroke={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">ጥያቄው ተከልክሏል</h3>
              <p className="text-sm text-text-muted mt-2">
                ለዚህ ሰነድ መዳረሻ አልተፈቀደልዎትም። ጥያቄ ካለዎት አስተዳዳሪን ያነጋግሩ።
              </p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="w-full bg-surface-secondary hover:bg-border/50 text-text-primary py-3.5 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              እንደገና ሞክር
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen bg-[#F5F3F0] flex flex-col items-center pt-12 sm:pt-24 px-4 font-sans">
      <div className="w-full max-w-md text-center mb-8">
        {/* Minimal logo / header area */}
        <div className="inline-block p-1.5 bg-white rounded-2xl shadow-sm border border-border/20 mb-4 overflow-hidden">
          <div className="relative w-16 h-16 rounded-xl flex items-center justify-center">
            <Image src="/logo.jpg" alt="የብልፅግና ኢንስፔክሽን ኮሚሽን" fill className="object-cover rounded-xl" />
          </div>
        </div>
        <h2 className="text-sm font-bold text-text-secondary tracking-widest">የብልፅግና ፓርቲ ኢንስፔክሽን ኮሚሽን</h2>
      </div>
      
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-12">
          <IconLoader2 className="animate-spin text-brand-blue" size={32} />
        </div>
      }>
        <RequestAccessForm />
      </Suspense>
    </div>
  );
}
