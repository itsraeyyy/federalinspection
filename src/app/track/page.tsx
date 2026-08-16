"use client";

import { useState, useEffect } from "react";
import { Menubar } from "@/components/menubar";
import { complaintService } from "@/services/complaints";
import { Complaint } from "@/types";
import { Search, Clock, CheckCircle2, XCircle, Loader2, ArrowRight, FileText, Download, Users, ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  New: {
    label: 'ደርሷል (Submitted)',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: Clock,
  },
  Accepted: {
    label: 'ተቀብሏል (Accepted)',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    icon: Clock,
  },
  Processing: {
    label: 'በማጣራት ላይ (In Process)',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Loader2,
  },
  UnderInvestigation: {
    label: 'በማጣራት ላይ (In Process)',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Loader2,
  },
  RevisionRequested: {
    label: 'በማስተካከያ ላይ (Revision Requested)',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: Loader2,
  },
  PendingApproval: {
    label: 'ውሳኔ ለመጽደቅ ቀርቧል (Pending Approval)',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200',
    icon: Clock,
  },
  Resolved: {
    label: 'ውሳኔ ተሰጥቶበታል (Decision Made)',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'ውድቅ ሆኗል (Rejected)',
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

  // Acknowledgment state
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  // Review form state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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
    if (result) {
      const acked = Boolean((result as any)?.acknowledgedAt || (result?.resolution as any)?.acknowledgedBySubmitter);
      setIsAcknowledged(acked);

      if (result.resolutionRating) {
        setRating(result.resolutionRating);
        setFeedback(result.resolutionFeedback || '');
        setReviewSubmitted(true);
      } else {
        setRating(0);
        setFeedback('');
        setReviewSubmitted(false);
      }
    }
    setLoading(false);
  };

  const handleAcknowledgeDecision = async () => {
    if (!complaint) return;
    setAcknowledging(true);
    const success = await complaintService.acknowledgeDecisionBySubmitter(complaint.trackingCode);
    if (success) {
      setIsAcknowledged(true);
      const updated = await complaintService.getComplaintByTrackingCode(complaint.trackingCode);
      if (updated) setComplaint(updated);
    }
    setAcknowledging(false);
  };

  const handleSubmitReview = async () => {
    if (!complaint || rating === 0) return;
    setSubmittingReview(true);
    const success = await complaintService.submitResolutionReview(complaint.id, rating, feedback);
    if (success) {
      setReviewSubmitted(true);
      const result = await complaintService.getComplaintByTrackingCode(complaint.trackingCode);
      setComplaint(result);
    }
    setSubmittingReview(false);
  };

  const statusConfig = complaint ? STATUS_CONFIG[complaint.status] : null;
  const StatusIcon = statusConfig?.icon;

  // 4 Process History Steps for Submitters
  const steps = [
    {
      key: 'New',
      label: '1. ደርሷል (Submitted)',
      date: complaint?.createdAt
    },
    {
      key: 'Accepted',
      label: '2. ተቀብሏል (Accepted)',
      date: (complaint?.status === 'Accepted' || complaint?.status === 'Processing' || (complaint as any)?.status === 'UnderInvestigation' || complaint?.status === 'PendingApproval' || complaint?.status === 'Resolved' || complaint?.status === 'Rejected') ? (complaint?.processedAt || complaint?.createdAt) : undefined
    },
    {
      key: 'Processing',
      label: '3. ኮሚቴ ተመድቦ በማጣራት ላይ (In Process)',
      date: (complaint?.status === 'Processing' || (complaint as any)?.status === 'UnderInvestigation' || complaint?.status === 'PendingApproval' || complaint?.status === 'Resolved' || complaint?.status === 'Rejected') ? (complaint?.processedAt || complaint?.createdAt) : undefined
    },
    {
      key: 'Resolved',
      label: complaint?.status === 'Rejected' ? '4. ውድቅ ሆኗል (Rejected)' : '4. ውሳኔ ተሰጥቶበታል (Decision Made)',
      date: complaint?.resolvedAt
    },
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
            <h3 className="text-sm font-semibold text-slate-800 mb-6">የሂደት ታሪክ (Process History)</h3>
            <div className="space-y-0">
              {(() => {
                const statusOrderMap: Record<string, number> = {
                  New: 1,
                  Accepted: 2,
                  Processing: 3,
                  UnderInvestigation: 3,
                  RevisionRequested: 3,
                  PendingApproval: 3,
                  Resolved: 4,
                  Rejected: 4,
                };
                const stepOrderMap: Record<string, number> = {
                  New: 1,
                  Accepted: 2,
                  Processing: 3,
                  Resolved: 4,
                };
                const currentOrder = statusOrderMap[complaint.status] || 1;

                return steps.map((s, i) => {
                  const stepOrder = stepOrderMap[s.key] || 1;
                  const isPast = stepOrder < currentOrder;
                  const isActive = stepOrder === currentOrder;
                  const isFuture = stepOrder > currentOrder;

                  return (
                    <div key={s.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isPast ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bg-[#014BAA] border-[#014BAA] text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                          {isPast ? '✓' : i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-0.5 h-12 ${isPast ? 'bg-green-500' : isActive ? 'bg-[#014BAA]' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <div className="pb-8">
                        <p className={`text-sm font-bold ${isActive ? 'text-[#014BAA]' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</p>
                        {s.date && (
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {s.date}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Resolution Details (if resolved/rejected) */}
          {(complaint.status === 'Resolved' || complaint.status === 'Rejected') && complaint.resolution && (
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {complaint.status === 'Rejected' ? 'የውድቅ ምክንያት' : 'የተሰጠ የመጨረሻ ውሳኔ'}
                </h3>
                {isAcknowledged && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold w-fit">
                    <CheckCircle2 size={14} /> ውሳኔው መድረሱን አረጋግጠዋል
                  </span>
                )}
              </div>

              {!isAcknowledged ? (
                <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-5">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">የመጨረሻ ውሳኔዎ ዝግጁ ሆኗል!</h4>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        የተሰጠውን የመጨረሻ ውሳኔና ተያያዥ ሰነዶችን ሙሉ በሙሉ ለማየት እባክዎን <strong>"ውሳኔ ደርሶኛል"</strong> የሚለውን አዝራር ይጫኑ።
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-center sm:justify-start">
                    <button
                      onClick={handleAcknowledgeDecision}
                      disabled={acknowledging}
                      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      {acknowledging ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                      <span>ውሳኔ ደርሶኛል (Acknowledge Decision)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Resolution Message */}
                  {complaint.resolution && (
                    <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 rounded-xl p-5 border border-slate-200 font-medium whitespace-pre-wrap">
                      {typeof complaint.resolution === 'string' ? complaint.resolution : (complaint.resolution.message || '')}
                    </p>
                  )}

                  {/* Decision Files Grid */}
                  {(() => {
                    const resolutionFiles: any[] =
                      (complaint.resolution as any)?.attachments ||
                      (complaint.resolution as any)?.files ||
                      [];

                    if (resolutionFiles.length === 0) return null;

                    return (
                      <div className="mt-6 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="size-4 text-[#014BAA]" /> ተያያዥ ውሳኔ ሰነዶች ({resolutionFiles.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {resolutionFiles.map((file: any, idx: number) => {
                            const fileUrl = complaintService.resolveFileUrl(file, complaint.trackingCode);
                            const fileName = file.filename || file.name || `ውሳኔ ሰነድ ${idx + 1}`;
                            return (
                              <div
                                key={file.id || idx}
                                className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-bold transition-all"
                              >
                                <FileText className="size-4 text-[#014BAA] shrink-0" />
                                <span className="truncate flex-1 text-slate-800" title={fileName}>
                                  {fileName}
                                </span>
                                {file.fileSize && <span className="text-[10px] text-slate-400">({file.fileSize})</span>}

                                <div className="flex items-center gap-1 ml-1 border-l border-slate-200 pl-1.5">
                                  {/* Open in Browser */}
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.open(fileUrl, '_blank');
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-[#014BAA] transition-colors"
                                    title="ክፈት (Open)"
                                  >
                                    <ExternalLink className="size-3.5" />
                                  </a>

                                  {/* Download file */}
                                  <a
                                    href={fileUrl}
                                    download={fileName}
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      try {
                                        const res = await fetch(fileUrl);
                                        const blob = await res.blob();
                                        const blobUrl = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = blobUrl;
                                        a.download = fileName;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        URL.revokeObjectURL(blobUrl);
                                      } catch {
                                        window.open(fileUrl, '_blank');
                                      }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-green-600 transition-colors"
                                    title="አውርድ (Download)"
                                  >
                                    <Download className="size-3.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Review Section */}
              {isAcknowledged && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    {reviewSubmitted ? 'የሰጡት አስተያየት እና ደረጃ' : 'የአገልግሎት እርካታዎን ይግለጹ'}
                  </h3>

                  {reviewSubmitted ? (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      {feedback && (
                        <p className="text-sm text-slate-700 italic">"{feedback}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 mb-2">ለተሰጠዎት መፍትሄ ያለዎትን እርካታ ከ1 እስከ 5 ኮከብ ይስጡን።</p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`size-8 ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="ተጨማሪ አስተያየት ካለዎት እዚህ ይጻፉ (አማራጭ)..."
                        className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white bg-slate-50 transition-colors"
                        rows={3}
                      />
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || rating === 0}
                        className="bg-[#014BAA] hover:bg-[#014BAA]/90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? <Loader2 className="size-5 animate-spin" /> : 'አስተያየት ላክ'}
                      </button>
                    </div>
                  )}
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
              {complaint.serviceName && (
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">አገልግሎት</p>
                  <p className="font-medium text-slate-800">{complaint.serviceName}</p>
                </div>
              )}
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
