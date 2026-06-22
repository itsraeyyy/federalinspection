"use client";

import { useState, useEffect } from "react";
import { Menubar } from "@/components/menubar";
import { complaintService } from "@/services/complaints";
import { Complaint } from "@/types";
import { Search, Clock, CheckCircle2, XCircle, Loader2, ArrowRight, FileText, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  New: {
    label: 'አዲስ — ገና አልተመረመረም',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: Clock,
  },
  Processing: {
    label: 'በሂደት ላይ — እየተመረመረ ነው',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Loader2,
  },
  Resolved: {
    label: 'ተፈቷል — መፍትሄ ተሰጥቷል',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'ውድቅ ሆኗል',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (searchCode?: string) => {
    const trackingCode = (searchCode || code).trim();
    if (!trackingCode) return;
    setLoading(true);
    setSearched(true);
    setComplaint(null);

    const result = await complaintService.getComplaintByTrackingCode(trackingCode);
    setComplaint(result);
    setLoading(false);
  };

  const statusConfig = complaint ? STATUS_CONFIG[complaint.status] : null;
  const StatusIcon = statusConfig?.icon;

  // Timeline steps
  const steps = [
    { key: 'New', label: 'ተቀብለናል', date: complaint?.createdAt },
    { key: 'Processing', label: 'በመመርመር ላይ', date: complaint?.processedAt },
    { key: 'Resolved', label: complaint?.status === 'Rejected' ? 'ውድቅ ሆኗል' : 'ተፈቷል', date: complaint?.resolvedAt },
  ];

  return (
    <div className="container-site mx-auto max-w-2xl py-12 md:py-20 px-4">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          ሁኔታ ይከታተሉ
        </h1>
        <p className="mt-3 text-base text-slate-600">
          የክትትል ኮድዎን ያስገቡ የጥቆማዎን ወይም የአቤቱታዎን ሁኔታ ለማወቅ
        </p>
      </div>

      {/* Search Box */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm font-mono tracking-wider focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
              placeholder="TRK-XXXXXXX-XXXX"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !code.trim()}
            className="flex items-center gap-2 rounded-xl bg-[#014BAA] hover:bg-[#014BAA]/90 text-white px-6 py-4 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
            <span className="hidden sm:inline">ፈልግ</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-slate-100 text-center">
          <Loader2 className="size-10 animate-spin text-[#014BAA] mx-auto mb-4" />
          <p className="text-sm text-slate-600">በመፈለግ ላይ...</p>
        </div>
      )}

      {searched && !loading && !complaint && (
        <div className="rounded-3xl bg-white p-12 shadow-sm ring-1 ring-slate-100 text-center">
          <XCircle className="size-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">ምንም አልተገኘም</h3>
          <p className="text-sm text-slate-500">የክትትል ኮዱ ትክክል መሆኑን ያረጋግጡ እና እንደገና ይሞክሩ።</p>
        </div>
      )}

      {complaint && !loading && statusConfig && StatusIcon && (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className={`rounded-3xl border p-6 sm:p-8 ${statusConfig.bgColor}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${statusConfig.bgColor}`}>
                <StatusIcon className={`size-7 ${statusConfig.color} ${complaint.status === 'Processing' ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${statusConfig.color}`}>
                  {statusConfig.label}
                </p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {complaint.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'} • {complaint.date}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-6">የሂደት ታሪክ</h3>
            <div className="space-y-0">
              {steps.map((s, i) => {
                const isActive = s.key === complaint.status || (complaint.status === 'Rejected' && s.key === 'Resolved');
                const isPast = s.date != null;
                const isFuture = !isPast && !isActive;
                return (
                  <div key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${isPast ? 'bg-green-500 border-green-500' : isActive ? 'bg-[#014BAA] border-[#014BAA]' : 'bg-white border-slate-300'}`} />
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 h-12 ${isPast ? 'bg-green-300' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-semibold ${isFuture ? 'text-slate-400' : 'text-slate-800'}`}>{s.label}</p>
                      {s.date && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(s.date).toLocaleString('am-ET', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolution Details (if resolved/rejected) */}
          {complaint.resolution && (
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                {complaint.status === 'Rejected' ? 'የውድቅ ምክንያት' : 'የተሰጠ መፍትሄ'}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                {complaint.resolution.message}
              </p>

              {complaint.resolution.attachments && complaint.resolution.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ተያያዥ ሰነዶች</p>
                  {complaint.resolution.attachments.map((att: any, i: number) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#014BAA]/30 transition-colors"
                    >
                      <FileText className="size-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 truncate flex-1">{att.filename}</span>
                      <Download className="size-4 text-[#014BAA]" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submission Summary */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">የቀረበ ዝርዝር</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">ስም</p>
                <p className="font-medium text-slate-800">{complaint.name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">ተቋም</p>
                <p className="font-medium text-slate-800">{complaint.institution || '-'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-slate-500 text-xs mb-1">ዝርዝር</p>
              <p className="text-sm text-slate-700 leading-relaxed">{complaint.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-[#014BAA] transition-colors">
          ← ወደ መነሻ ይመለሱ
        </Link>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <>
      <Menubar />
      <div className="bg-slate-50 min-h-screen pt-24 pb-12">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-[#014BAA]" />
          </div>
        }>
          <TrackingContent />
        </Suspense>
      </div>
    </>
  );
}
