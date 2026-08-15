'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconSearch,
  IconBulb,
  IconAlertTriangle,
  IconLoader2,
  IconX,
  IconDownload,
  IconEye,
  IconPlayerPlay,
  IconCheck,
  IconBan,
  IconHistory,
  IconFileText,
  IconUpload,
  IconClock,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconBuilding,
  IconCalendar,
  IconPaperclip,
  IconExternalLink,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { complaintService } from "@/services/complaints";
import { Complaint, ComplaintStatus } from "@/types";
import { exportComplaintsToExcel, getResolutionTime } from "@/lib/exportExcel";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { formatECDateTime, convertToEthiopianTimeStr } from "@/lib/date-formatter";

type TicketType = 'Complaint' | 'Suggestion';
type StatusFilter = 'All' | 'NeedsAttention' | ComplaintStatus;

function getDaysLeft(ticket: Complaint): number {
  if (ticket.status === 'Resolved' || ticket.status === 'Rejected') return 999;
  
  const rawDeadline = ticket.slaDeadlineRaw || (ticket.resolution as any)?.slaDeadline;
  if (rawDeadline) {
    const deadlineTime = new Date(rawDeadline).getTime();
    if (!isNaN(deadlineTime)) {
      const diffMs = deadlineTime - Date.now();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  const rawCreated = ticket.createdAtRaw;
  if (rawCreated) {
    const createdTime = new Date(rawCreated).getTime();
    if (!isNaN(createdTime)) {
      const deadlineMs = createdTime + 15 * 24 * 60 * 60 * 1000;
      const diffMs = deadlineMs - Date.now();
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  return 15;
}

const STATUS_ORDER: ComplaintStatus[] = ['New', 'Processing', 'PendingApproval', 'Resolved', 'Rejected'];

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bgColor: string; dotColor: string; iconColor: string }> = {
  New: { label: 'አዲስ', color: 'text-blue-700', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-500', iconColor: 'text-blue-500' },
  Accepted: { label: 'የተቀበሉት', color: 'text-blue-700', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-500', iconColor: 'text-blue-500' },
  Processing: { label: 'በሂደት ላይ', color: 'text-amber-700', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-500', iconColor: 'text-amber-500' },
  PendingApproval: { label: 'ለማጽደቅ የቀረበ', color: 'text-sky-700', bgColor: 'bg-sky-500/10', dotColor: 'bg-sky-500', iconColor: 'text-sky-500' },
  Resolved: { label: 'ውሳኔ የተሰጣቸው', color: 'text-green-700', bgColor: 'bg-green-500/10', dotColor: 'bg-green-500', iconColor: 'text-green-500' },
  Rejected: { label: 'ውድቅ', color: 'text-red-700', bgColor: 'bg-red-500/10', dotColor: 'bg-red-500', iconColor: 'text-red-500' },
  RevisionRequested: { label: 'ማስተካከያ የተጠየቀበት', color: 'text-amber-700', bgColor: 'bg-amber-500/15', dotColor: 'bg-amber-600', iconColor: 'text-amber-600' },
};

export default function ComplaintsPage() {
  const { profile } = useAdmin();
  const [activeTab, setActiveTab] = useState<TicketType>('Suggestion');
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('All');
  const [tickets, setTickets] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<'Resolved' | 'Rejected' | 'PendingApproval'>('Resolved');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const resFileRef = useRef<HTMLInputElement>(null);

  // Committee Group Creation Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [committeeName, setCommitteeName] = useState('የኢንስፔክሽን አጣሪ ኮሚቴ');
  const [committeeMembers, setCommitteeMembers] = useState<{ name: string; phone: string; email?: string }[]>([
    { name: '', phone: '', email: '' }
  ]);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTypes, setExportTypes] = useState<TicketType[]>(['Complaint', 'Suggestion']);
  const [exportCategories, setExportCategories] = useState<ComplaintStatus[]>(['New', 'Processing', 'PendingApproval', 'Resolved', 'Rejected']);
  const [exportTimeframe, setExportTimeframe] = useState<'all' | '1m' | '3m' | '6m' | '1y' | 'custom'>('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const loadTickets = useCallback(async () => {
    const data = await complaintService.getComplaints();
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    const matchesType = t.type === activeTab;
    const matchesSearch = !searchQuery || 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getColumnTickets = (status: ComplaintStatus) => filteredTickets.filter(t => t.status === status);

  // Counts
  const typeTickets = tickets.filter(t => t.type === activeTab);
  const counts = {
    total: typeTickets.length,
    needsAttention: typeTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Rejected' && getDaysLeft(t) <= 5).length,
    new: typeTickets.filter(t => t.status === 'New' || t.status === 'Accepted').length,
    processing: typeTickets.filter(t => t.status === 'Processing' || t.status === 'RevisionRequested').length,
    pendingApproval: typeTickets.filter(t => t.status === 'PendingApproval').length,
    resolved: typeTickets.filter(t => t.status === 'Resolved').length,
    rejected: typeTickets.filter(t => t.status === 'Rejected').length,
  };

  // Admin name for tracking
  const adminName = profile?.first_name || 'Admin';

  // Calculate average resolution time
  const avgResTimeDays = useMemo(() => {
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved' && (t.resolvedAtRaw || t.resolvedAt));
    if (resolvedTickets.length === 0) return 0;
    
    const totalDays = resolvedTickets.reduce((acc, t) => {
      const resDateStr = t.resolvedAtRaw || t.resolvedAt || '';
      const createDateStr = t.createdAtRaw || t.createdAt || '';
      const resolved = resDateStr ? new Date(resDateStr).getTime() : Date.now();
      const created = createDateStr ? new Date(createDateStr).getTime() : Date.now();
      return acc + (resolved - created) / (1000 * 60 * 60 * 24);
    }, 0);
    
    return (totalDays / resolvedTickets.length).toFixed(1);
  }, [tickets]);

  // SLA Helper
  const getSlaIndicator = (ticket: Complaint) => {
    const deadlineRaw = ticket.slaDeadlineRaw || ticket.slaDeadline;
    if ((ticket.status !== 'Processing' && ticket.status !== 'PendingApproval' && ticket.status !== 'RevisionRequested') || !deadlineRaw) return null;
    const daysLeft = Math.ceil((new Date(deadlineRaw).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 1) return { color: 'text-red-700 bg-red-500/10 border-red-500/20', label: 'ጊዜ አልፎበታል' };
    if (daysLeft <= 5) return { color: 'text-amber-700 bg-amber-500/10 border-amber-500/20', label: `${daysLeft} ቀናት ቀርተዋል` };
    return { color: 'text-green-700 bg-green-500/10 border-green-500/20', label: `${daysLeft} ቀናት ቀርተዋል` };
  };

  // Status transition
  const handleStatusChange = async (ticketId: string, newStatus: ComplaintStatus) => {
    if (newStatus === 'Resolved' || newStatus === 'Rejected') {
      const ticket = tickets.find(t => t.id === ticketId);
      setSelectedTicket(ticket || null);
      setResolutionAction(newStatus);
      setResolutionMessage('');
      setResolutionFiles([]);
      setShowResolutionModal(true);
      return;
    }

    setActionLoading(true);
    const success = await complaintService.updateComplaintStatus(ticketId, newStatus, adminName);
    if (success) {
      await loadTickets();
      // Update selected ticket if open
      if (selectedTicket?.id === ticketId) {
        const updated = await complaintService.getComplaintById(ticketId);
        setSelectedTicket(updated);
      }
    }
    setActionLoading(false);
  };

  const handleResolutionSubmit = async () => {
    if (!selectedTicket || !resolutionMessage.trim()) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      let success = false;
      if (resolutionAction === 'PendingApproval') {
        success = await complaintService.submitDecisionIdea(
          selectedTicket.id, 
          resolutionMessage, 
          resolutionFiles.length > 0 ? resolutionFiles : undefined, 
          adminName
        );
      } else {
        success = await complaintService.updateComplaintStatus(
          selectedTicket.id,
          resolutionAction,
          adminName,
          { message: resolutionMessage, files: resolutionFiles.length > 0 ? resolutionFiles : undefined }
        );
      }

      if (success) {
        await loadTickets();
        setShowResolutionModal(false);
        setSelectedTicket(null);
        setFeedbackMsg({ type: 'success', text: 'በትክክል ተልኳል!' });
      } else {
        setFeedbackMsg({ type: 'error', text: 'ስህተት አጋጥሟል።' });
      }
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'ስህተት አጋጥሟል።' });
    }
    setActionLoading(false);
  };

  const handleAcceptComplaint = async () => {
    if (!selectedTicket) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const success = await complaintService.acceptComplaintByAdmin(selectedTicket.id, adminName);
      if (success) {
        await loadTickets();
        const updated = await complaintService.getComplaintById(selectedTicket.id);
        setSelectedTicket(updated);
        setFeedbackMsg({ type: 'success', text: 'ጉዳዩ በተሳካ ሁኔታ ተቀባይነት አግኝቷል።' });
      } else {
        setFeedbackMsg({ type: 'error', text: 'ተቀባይነት ማድረግ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' });
      }
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'ስህተት አጋጥሟል' });
    }
    setActionLoading(false);
  };

  const handleConfirmCommitteeAssignment = async () => {
    if (!selectedTicket || !committeeName.trim()) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const validMembers = committeeMembers.filter(m => m.name.trim());
      const success = await complaintService.startProcessingByLeader(
        selectedTicket.id,
        adminName,
        committeeName.trim(),
        validMembers
      );
      if (success) {
        setShowCommitteeModal(false);
        await loadTickets();
        const updated = await complaintService.getComplaintById(selectedTicket.id);
        setSelectedTicket(updated);
        setFeedbackMsg({ type: 'success', text: 'ጉዳዩ በተሳካ ሁኔታ ተቀባይነት አግኝቶ ኮሚቴ ተመድቦለታል።' });
      } else {
        setFeedbackMsg({ type: 'error', text: 'ኮሚቴ መመደብ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' });
      }
    } catch (e: any) {
      setFeedbackMsg({ type: 'error', text: e.message || 'ስህተት አጋጥሟል' });
    }
    setActionLoading(false);
  };

  // Export
  const handleExport = () => {
    setShowExportModal(true);
  };

  const executeExport = () => {
    let toExport = tickets.filter(t => exportTypes.includes(t.type) && exportCategories.includes(t.status));
    
    let subtitle = 'የተመረጡ: ';
    const typesStr = exportTypes.map(t => t === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ').join(' እና ');
    subtitle += typesStr + ' | ጊዜ: ';

    if (exportTimeframe !== 'all') {
      const now = new Date();
      let start: Date | null = null;
      let end: Date = now;
      let timeStr = '';

      if (exportTimeframe === '1m') { start = new Date(now.setMonth(now.getMonth() - 1)); timeStr = 'ያለፈው 1 ወር'; }
      else if (exportTimeframe === '3m') { start = new Date(now.setMonth(now.getMonth() - 3)); timeStr = 'ያለፉት 3 ወራት'; }
      else if (exportTimeframe === '6m') { start = new Date(now.setMonth(now.getMonth() - 6)); timeStr = 'ያለፉት 6 ወራት'; }
      else if (exportTimeframe === '1y') { start = new Date(now.setFullYear(now.getFullYear() - 1)); timeStr = 'ያለፈው 1 ዓመት'; }
      else if (exportTimeframe === 'custom' && exportStartDate && exportEndDate) {
        start = new Date(exportStartDate);
        end = new Date(exportEndDate);
        end.setHours(23, 59, 59, 999);
        timeStr = `${exportStartDate} እስከ ${exportEndDate}`;
      }

      subtitle += timeStr;

      if (start) {
        toExport = toExport.filter(t => {
          const d = new Date(t.createdAt);
          return d >= start! && d <= end;
        });
      }
    } else {
      subtitle += 'ሁሉም ጊዜ';
    }

    exportComplaintsToExcel(toExport, `ሪፖርት_${new Date().toISOString().split('T')[0]}.xls`, 'ጥቆማ እና አቤቱታ ሪፖርት', subtitle);
    setShowExportModal(false);
  };

  // Table Data based on filter
  const tableTickets = filteredTickets
    .filter(t => {
      if (activeStatusFilter === 'NeedsAttention') {
        return t.status !== 'Resolved' && t.status !== 'Rejected' && getDaysLeft(t) <= 5;
      }
      return activeStatusFilter === 'All' || t.status === activeStatusFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        {feedbackMsg && (
          <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 ${
            feedbackMsg.type === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-2">
              <span>{feedbackMsg.type === 'success' ? '✓' : '⚠'}</span>
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:opacity-75">
              <IconX size={18} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ጥቆማ እና አቤቱታ</h1>
            <p className="text-sm text-text-muted mt-1">የአባላትን ጥቆማዎች እና ቅሬታዎች ያስተዳድሩ።</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-1 w-8 bg-brand-blue rounded-full"></div>
              <div className="h-1 w-4 bg-brand-yellow rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="ፈልግ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              <IconDownload size={18} />
              <span className="hidden sm:inline">ኤክስፖርት</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-primary/40 backdrop-blur-md p-1.5 rounded-2xl border border-border/20 w-fit">
            <button
              onClick={() => setActiveTab('Suggestion')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'Suggestion'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              <IconBulb size={18} stroke={activeTab === 'Suggestion' ? 2 : 1.5} />
              ጥቆማ
              <span className={`ml-1 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === 'Suggestion' ? 'bg-white/20 text-white' : 'bg-surface-secondary text-text-primary'}`}>
                {tickets.filter(t => t.type === 'Suggestion').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('Complaint')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'Complaint'
                  ? 'bg-brand-yellow text-[#3D352E] shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              <IconAlertTriangle size={18} stroke={activeTab === 'Complaint' ? 2 : 1.5} />
              አቤቱታ
              <span className={`ml-1 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === 'Complaint' ? 'bg-[#3D352E]/15 text-[#3D352E]' : 'bg-surface-secondary text-text-primary'}`}>
                {tickets.filter(t => t.type === 'Complaint').length}
              </span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {[
            { id: 'All', label: 'ጠቅላላ', value: counts.total, color: 'text-text-primary', activeStyle: 'bg-surface-primary shadow-sm border-border/40' },
            { id: 'NeedsAttention', label: '🔴 ትኩረት የሚሹ', value: counts.needsAttention, color: 'text-red-600 font-black', activeStyle: 'bg-red-50/90 dark:bg-red-950/40 border-red-300 ring-1 ring-red-400' },
            { id: 'New', label: 'አዲስ', value: counts.new, color: 'text-blue-600', activeStyle: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/50' },
            { id: 'Processing', label: 'በሂደት ላይ', value: counts.processing, color: 'text-amber-600', activeStyle: 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/50' },
            { id: 'PendingApproval', label: 'ለማጽደቅ የቀረበ', value: counts.pendingApproval, color: 'text-sky-600', activeStyle: 'bg-sky-50/80 dark:bg-sky-900/20 border-sky-200/50' },
            { id: 'Resolved', label: 'ውሳኔ የተሰጣቸው', value: counts.resolved, color: 'text-green-600', activeStyle: 'bg-green-50/80 dark:bg-green-900/20 border-green-200/50' },
            { id: 'Rejected', label: 'ውድቅ', value: counts.rejected, color: 'text-red-600', activeStyle: 'bg-red-50/80 dark:bg-red-900/20 border-red-200/50' },
          ].map(stat => {
            const isActive = activeStatusFilter === stat.id;
            return (
              <button
                key={stat.label}
                onClick={() => setActiveStatusFilter(stat.id as StatusFilter)}
                className={`text-left rounded-2xl border p-4 backdrop-blur-md transition-all duration-200 ${
                  isActive 
                    ? stat.activeStyle
                    : 'bg-surface-primary/30 border-border/20 hover:bg-surface-primary/50 hover:border-border/30'
                }`}
              >
                <div className={`text-2xl font-light ${stat.color} tabular-nums`}>{stat.value}</div>
                <div className={`text-xs mt-1 ${isActive ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>{stat.label}</div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <IconLoader2 size={32} className="animate-spin text-brand-blue" />
              <span className="text-sm text-text-muted">በመጫን ላይ...</span>
            </div>
          </div>
        ) : (
          /* Unified Table View */
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 overflow-hidden backdrop-blur-md">
            {tableTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconFileText size={32} className="text-text-muted/50" stroke={1.5} />
                <p className="text-sm text-text-muted">ምንም የተገኘ መረጃ የለም</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20 bg-surface-primary/40">
                      <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">መለያ</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ርዕስ / ማብራሪያ</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">አቅራቢ</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ሁኔታ</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ቀን</th>
                      <th className="text-right px-4 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">ድርጊት</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableTickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-border/10 hover:bg-surface-primary/60 transition-colors group">
                        <td className="px-4 py-4 align-middle">
                          <span className="text-xs font-mono font-medium text-brand-blue bg-brand-blue/5 px-2 py-1 rounded-md">
                            #{ticket.trackingCode?.split('-').pop() || ticket.id.split('-')[0]}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-middle max-w-[300px]">
                          <p className="text-sm text-text-primary font-medium line-clamp-2 leading-snug">{ticket.message}</p>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-col">
                            <span className="text-sm text-text-secondary font-medium">{ticket.name}</span>
                            {ticket.phone && <span className="text-[10px] text-text-muted mt-0.5">{ticket.phone}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CONFIG[ticket.status].bgColor} ${STATUS_CONFIG[ticket.status].color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[ticket.status].dotColor}`}></span>
                              {STATUS_CONFIG[ticket.status].label}
                            </span>
                            {(() => {
                              const daysLeft = getDaysLeft(ticket);
                              if (daysLeft > 5 || ticket.status === 'Resolved' || ticket.status === 'Rejected') return null;
                              if (daysLeft <= 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">🔥 ጊዜው ያለፈበት!</span>;
                              if (daysLeft === 1) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300">🚨 1 ቀን ብቻ!</span>;
                              if (daysLeft <= 3) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-300">⚠️ {daysLeft} ቀናት ቀሩ!</span>;
                              return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏰ {daysLeft} ቀናት ቀሩ!</span>;
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-col">
                            <span className="text-xs text-text-secondary">{ticket.date}</span>
                            {(ticket.status === 'Resolved' || ticket.status === 'Rejected') && ticket.resolvedAt && (
                              <span className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                                <IconClock size={10} /> {getResolutionTime(ticket)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle text-right">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3.5 py-1.5 rounded-xl bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white text-xs font-semibold transition-all shadow-sm inline-flex items-center gap-1.5"
                          >
                            <IconEye size={14} />
                            ዝርዝር
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Detail Modal */}
      {selectedTicket && !showResolutionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setSelectedTicket(null)}>
          <div
            className="w-full h-full sm:h-[95vh] sm:max-w-5xl bg-surface-primary overflow-y-auto sm:rounded-3xl shadow-2xl border border-border/30 flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="sticky top-0 z-20 bg-surface-primary/80 backdrop-blur-xl border-b border-border/20 px-8 py-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${STATUS_CONFIG[selectedTicket.status].bgColor} ${STATUS_CONFIG[selectedTicket.status].color}`}>
                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selectedTicket.status].dotColor}`}></span>
                    {STATUS_CONFIG[selectedTicket.status].label}
                  </span>
                  {selectedTicket.type === 'Suggestion' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full"><IconBulb size={14} /> ጥቆማ</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-500/10 px-3 py-1.5 rounded-full"><IconAlertTriangle size={14} /> አቤቱታ</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-mono font-medium text-text-secondary">
                    {selectedTicket.trackingCode || `#${selectedTicket.id.split('-')[0]}`}
                  </span>
                  <span className="text-text-muted/30">•</span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <IconCalendar size={12} />
                    {selectedTicket.date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2.5 rounded-xl hover:bg-surface-secondary text-text-muted hover:text-text-primary transition-colors bg-surface-primary shadow-sm border border-border/30"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-8 space-y-8 bg-[url('/noise.png')] bg-repeat opacity-100">
              
              {/* Submitter Info Card */}
              <div className="bg-surface-secondary/40 rounded-3xl p-6 border border-border/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <IconUser size={100} />
                </div>
                <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-5 flex items-center gap-2">
                  <IconUser size={16} /> የአቅራቢው መረጃ
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                  <InfoRow icon={IconUser} label="ሙሉ ስም" value={selectedTicket.name || 'ያልተገለጸ'} />
                  <InfoRow icon={IconPhone} label="ስልክ ቁጥር" value={selectedTicket.phone || 'ያልተገለጸ'} />
                  {selectedTicket.email && <InfoRow icon={IconMail} label="ኢሜይል" value={selectedTicket.email} />}
                  {selectedTicket.age && <InfoRow icon={IconUser} label="ዕድሜ" value={`${selectedTicket.age} ዓመት`} />}
                  {selectedTicket.gender && <InfoRow icon={IconUser} label="ፆታ" value={selectedTicket.gender} />}
                  {selectedTicket.address && <InfoRow icon={IconMapPin} label="አድራሻ" value={selectedTicket.address} />}
                  {selectedTicket.institution && <InfoRow icon={IconBuilding} label="ተቋም / ክፍል" value={selectedTicket.institution} />}
                  <InfoRow icon={IconUser} label="የማቅረቢያ መንገድ" value={selectedTicket.submissionMode || 'በግል'} />
                  {selectedTicket.submissionMode === 'በቡድን' && selectedTicket.groupMembers && selectedTicket.groupMembers.length > 0 && (
                    <div className="col-span-2 space-y-1.5 pt-2 border-t border-border/20">
                      <p className="text-xs text-text-muted font-medium">የቡድን አባላት ({selectedTicket.groupMembers.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.groupMembers.map((m, idx) => (
                          <span key={idx} className="px-3 py-1 bg-surface-secondary text-text-primary rounded-xl text-xs font-semibold border border-border/40">
                            {idx + 1}. {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTicket.assignedCommittee && (
                    <div className="col-span-2 p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/20 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-blue uppercase tracking-wide flex items-center gap-1.5">
                          <IconUsers size={16} /> የተመደበለት ኮሚቴ፦ {selectedTicket.assignedCommittee}
                        </span>
                      </div>
                      {((selectedTicket.resolution as any)?.committeeMembers || (selectedTicket.groupMembers && selectedTicket.groupMembers.length > 0)) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {((selectedTicket.resolution as any)?.committeeMembers || selectedTicket.groupMembers || []).map((m: any, idx: number) => {
                            const name = typeof m === 'string' ? m : `${m.name}${m.phone || m.email ? ` (${[m.phone, m.email].filter(Boolean).join(', ')})` : ''}`;
                            return (
                              <span key={idx} className="px-3 py-1 bg-surface-primary text-text-primary rounded-xl text-xs font-semibold border border-border/40 shadow-2xs">
                                • {name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <IconFileText size={16} /> የጉዳዩ ዝርዝር
                </h4>
                <div className="bg-white dark:bg-surface-primary rounded-3xl p-6 border border-border/30 shadow-sm">
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Requested Resolution */}
              {selectedTicket.requestedResolution && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <IconBulb size={16} /> የተጠየቀ መፍትሄ
                  </h4>
                  <div className="bg-brand-blue/5 rounded-3xl p-6 border border-brand-blue/10 shadow-sm">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{selectedTicket.requestedResolution}</p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                    <IconPaperclip size={16} /> ተያያዥ ማስረጃዎች ({selectedTicket.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTicket.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-2xl bg-surface-secondary/50 border border-border/30 hover:border-brand-blue/40 transition-all group hover:shadow-sm"
                      >
                        <div className="p-2 bg-white dark:bg-surface-primary rounded-xl text-brand-blue shadow-sm">
                          <IconFileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{att.filename}</p>
                          <p className="text-xs text-text-muted mt-0.5">{att.fileSize}</p>
                        </div>
                        <IconExternalLink size={16} className="text-text-muted opacity-100 group-hover:text-brand-blue transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Details */}
              {(() => {
                const resolutionText = typeof selectedTicket.resolution === 'string'
                  ? selectedTicket.resolution
                  : (selectedTicket.resolution?.message || selectedTicket.resolution?.decisionIdeaSummary || selectedTicket.decisionIdeaSummary || '');

                const resolutionAttachments = 
                  (selectedTicket.resolution as any)?.decisionIdeaFiles ||
                  (selectedTicket.resolution as any)?.attachments ||
                  (selectedTicket.resolution as any)?.files ||
                  selectedTicket.decisionIdeaFiles ||
                  selectedTicket.resolution?.attachments ||
                  [];

                if (!resolutionText?.trim() && (!resolutionAttachments || resolutionAttachments.length === 0)) return null;

                const dateVal = selectedTicket.resolvedAt || selectedTicket.processedAt || selectedTicket.resolvedAtRaw;
                const displayDate = dateVal ? (dateVal.includes('T') || dateVal.includes('-') ? formatECDateTime(dateVal) : convertToEthiopianTimeStr(dateVal)) : null;

                return (
                  <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden ${selectedTicket.status === 'Rejected' ? 'bg-red-50/50 border-red-200/50 dark:bg-red-950/20 dark:border-red-900/30' : selectedTicket.status === 'PendingApproval' ? 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-900/30' : 'bg-green-50/50 border-green-200/50 dark:bg-green-950/20 dark:border-green-900/30'}`}>
                    <div className={`absolute top-0 right-0 p-6 opacity-5 ${selectedTicket.status === 'Rejected' ? 'text-red-500' : selectedTicket.status === 'PendingApproval' ? 'text-blue-500' : 'text-green-500'}`}>
                      {selectedTicket.status === 'Rejected' ? <IconBan size={100} /> : <IconCheck size={100} />}
                    </div>
                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${selectedTicket.status === 'Rejected' ? 'text-red-600' : selectedTicket.status === 'PendingApproval' ? 'text-blue-600' : 'text-green-600'}`}>
                      {selectedTicket.status === 'Rejected' ? (
                        <><IconBan size={16}/> የውድቅ ምክንያት</>
                      ) : selectedTicket.status === 'PendingApproval' ? (
                        <><IconCheck size={16}/> የተሰጠ ውሳኔ (ለጽድቅ የቀረበ)</>
                      ) : (
                        <><IconCheck size={16}/> የተሰጠ ውሳኔ</>
                      )}
                    </h4>
                    <div className="relative z-10">
                      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{resolutionText}</p>
                      {resolutionAttachments && resolutionAttachments.length > 0 && (
                        <div className="mt-5 space-y-2">
                          <p className="text-xs font-semibold text-text-secondary mb-2">ተያያዥ ሰነዶች:</p>
                          <div className="flex flex-wrap gap-2">
                            {resolutionAttachments.map((att: any, i: number) => {
                              const fileUrl = complaintService.resolveFileUrl(att);
                              const nameStr = att.filename || att.name || `ሰነድ ${i + 1}`;
                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-primary rounded-xl border border-border/30 text-xs font-medium text-brand-blue shadow-sm"
                                >
                                  <IconFileText size={14} className="text-brand-blue shrink-0" />
                                  <span className="truncate max-w-[160px]" title={nameStr}>{nameStr}</span>
                                  
                                  <div className="flex items-center gap-1 ml-1 border-l border-border/20 pl-1.5">
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(fileUrl, '_blank');
                                      }}
                                      className="p-1 rounded hover:bg-surface-secondary text-text-muted hover:text-brand-blue transition-colors"
                                      title="ክፈት (Open)"
                                    >
                                      <IconExternalLink size={13} />
                                    </a>
                                    <a
                                      href={fileUrl}
                                      download={nameStr}
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        try {
                                          const res = await fetch(fileUrl);
                                          const blob = await res.blob();
                                          const blobUrl = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = blobUrl;
                                          a.download = nameStr;
                                          document.body.appendChild(a);
                                          a.click();
                                          a.remove();
                                          URL.revokeObjectURL(blobUrl);
                                        } catch {
                                          window.open(fileUrl, '_blank');
                                        }
                                      }}
                                      className="p-1 rounded hover:bg-surface-secondary text-text-muted hover:text-green-600 transition-colors"
                                      title="አውርድ (Download)"
                                    >
                                      <IconDownload size={13} />
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="mt-5 pt-4 border-t border-border/10 flex items-center gap-4 text-xs text-text-secondary font-medium">
                        {(selectedTicket.resolvedBy || selectedTicket.processedBy) && <span className="flex items-center gap-1.5"><IconUser size={14} /> {selectedTicket.resolvedBy || selectedTicket.processedBy}</span>}
                        {displayDate && (
                          <span className="flex items-center gap-1.5">
                            <IconClock size={14} /> {displayDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* User Review Details */}
              {selectedTicket.resolutionRating && (
                <div className="bg-surface-secondary/20 rounded-3xl p-6 border border-border/20">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4">
                    የአገልግሎት እርካታ (የተገልጋይ አስተያየት)
                  </h4>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`text-xl ${star <= selectedTicket.resolutionRating! ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  {selectedTicket.resolutionFeedback && (
                    <p className="text-sm text-text-secondary italic">"{selectedTicket.resolutionFeedback}"</p>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-surface-secondary/20 rounded-3xl p-6 border border-border/20">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                  <IconHistory size={16} /> የሂደት ታሪክ
                </h4>
                <div className="space-y-0 pl-2">
                  {[
                    { label: 'ተቀብለናል', date: convertToEthiopianTimeStr(selectedTicket.createdAt), active: true },
                    { label: 'ወደ ሂደት ገብቷል', date: convertToEthiopianTimeStr(selectedTicket.processedAt), active: !!selectedTicket.processedAt },
                    { label: selectedTicket.status === 'Rejected' ? 'ውድቅ ሆኗል' : 'ተፈቷል', date: convertToEthiopianTimeStr(selectedTicket.resolvedAt), active: !!selectedTicket.resolvedAt },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 bg-surface-primary shadow-sm ${step.active ? 'border-brand-blue ring-4 ring-brand-blue/10' : 'border-border/50'}`} />
                        {i < arr.length - 1 && <div className={`w-0.5 h-10 -mt-1 ${step.active ? 'bg-brand-blue/30' : 'bg-border/30'}`} />}
                      </div>
                      <div className="pb-6 -mt-1">
                        <p className={`text-sm font-bold ${step.active ? 'text-text-primary' : 'text-text-muted/60'}`}>{step.label}</p>
                        {step.date && (
                          <p className="text-[11px] text-text-secondary mt-1 font-medium">
                            {step.date}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTicket.resolvedAt && (
                  <div className="text-xs font-medium text-text-secondary bg-surface-primary/60 rounded-xl px-4 py-3 mt-2 border border-border/30 shadow-sm inline-flex items-center gap-2">
                    <IconClock size={14} className="text-brand-blue" />
                    ለመፍታት የፈጀ ጊዜ: <strong className="text-text-primary">{getResolutionTime(selectedTicket)}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Footer */}
            {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Rejected' && selectedTicket.status !== 'PendingApproval' && (
              <div className="sticky bottom-0 bg-surface-primary/90 backdrop-blur-xl border-t border-border/20 p-6">
                <div className="flex gap-3">
                  {(selectedTicket.status === 'New' || selectedTicket.status === 'Accepted') && (
                    <>
                      <button
                        onClick={() => {
                          setCommitteeName('የኢንስፔክሽን አጣሪ ኮሚቴ');
                          setCommitteeMembers([{ name: '', phone: '', email: '' }]);
                          setShowCommitteeModal(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        <IconUsers size={18} />
                        ተቀበል እና ኮሚቴ አዋቅር (Accept & Assign Committee)
                      </button>
                      <button
                        onClick={() => { setResolutionAction('Rejected'); setResolutionMessage(''); setResolutionFiles([]); setShowResolutionModal(true); }}
                        disabled={actionLoading}
                        className="w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        <IconBan size={18} />
                        ውድቅ (Reject)
                      </button>
                    </>
                  )}
                  {(selectedTicket.status === 'Processing' || selectedTicket.status === 'RevisionRequested') && (
                    <button
                      onClick={() => { setResolutionAction('PendingApproval' as any); setShowResolutionModal(true); }}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <IconCheck size={18} />
                      የውሳኔ ሀሳብ ለጽድቅ አቅርብ (Submit Decision Proposal)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolutionModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowResolutionModal(false)}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                {resolutionAction === 'PendingApproval' ? 'የውሳኔ ሀሳብ ለጽድቅ ማቅረቢያ' : resolutionAction === 'Resolved' ? 'መፍትሄ ይስጡ' : 'ውድቅ ያድርጉ'}
              </h3>
              <button onClick={() => setShowResolutionModal(false)} className="p-1.5 hover:bg-surface-secondary rounded-xl transition-colors">
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              {resolutionAction === 'PendingApproval'
                ? 'የተሰጠውን የውሳኔ ሀሳብ ማጠቃለያ ያስገቡ። ይህ ለኮሚቴ ሰብሳቢው ይላካል።'
                : resolutionAction === 'Resolved'
                  ? 'የተሰጠውን ውሳኔ ዝርዝር ያስገቡ። ይህ ለአቅራቢው ይላካል።'
                  : 'ውድቅ ለማድረግ ምክንያቱን ያስገቡ። ይህ ለአቅራቢው ይላካል።'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  {resolutionAction === 'PendingApproval' ? 'የውሳኔ ሀሳብ ማጠቃለያ *' : resolutionAction === 'Resolved' ? 'የተሰጠ ውሳኔ ዝርዝር *' : 'የውድቅ ምክንያት *'}
                </label>
                <textarea
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  rows={4}
                  className="block w-full resize-none rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
                  placeholder={resolutionAction === 'PendingApproval' ? 'የውሳኔ ሀሳብ ማጠቃለያዎን እዚህ ያስገቡ...' : resolutionAction === 'Resolved' ? 'የተሰጠውን ውሳኔ ያስገቡ...' : 'ውድቅ ያደረጉበትን ምክንያት ያስገቡ...'}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">ተያያዥ ሰነዶች (ካሉ)</label>
                <button
                  onClick={() => resFileRef.current?.click()}
                  className="flex items-center gap-2 w-full p-3 rounded-xl border-2 border-dashed border-border/40 hover:border-brand-blue/30 text-text-muted hover:text-brand-blue transition-colors text-sm"
                >
                  <IconUpload size={18} />
                  ፋይል ይጫኑ
                </button>
                <input ref={resFileRef} type="file" className="hidden" multiple onChange={(e) => { if (e.target.files) setResolutionFiles(Array.from(e.target.files)); }} />
                {resolutionFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {resolutionFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-text-secondary bg-surface-secondary/50 rounded-lg px-3 py-2">
                        <IconFileText size={14} />
                        <span className="truncate flex-1">{f.name}</span>
                        <button onClick={() => setResolutionFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-red-500">
                          <IconX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 py-2.5 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50"
              >
                ሰርዝ
              </button>
              <button
                onClick={handleResolutionSubmit}
                disabled={actionLoading || !resolutionMessage.trim()}
                className={`flex-1 py-2.5 px-4 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolutionAction === 'PendingApproval'
                    ? 'bg-brand-blue hover:bg-brand-blue/90'
                    : resolutionAction === 'Resolved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading ? 'በመላክ ላይ...' : resolutionAction === 'PendingApproval' ? 'ለጽድቅ አቅርብ' : resolutionAction === 'Resolved' ? 'መፍትሄ ስጥ' : 'ውድቅ አድርግ'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowExportModal(false)}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                ወደ ኤክስፖርት (Excel)
              </h3>
              <button onClick={() => setShowExportModal(false)} className="p-1.5 hover:bg-surface-secondary rounded-xl transition-colors">
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Types Filter */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-3 block">የመረጃ ዓይነት *</label>
                <div className="flex flex-wrap gap-3">
                  {(['Suggestion', 'Complaint'] as TicketType[]).map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) setExportTypes([...exportTypes, type]);
                          else setExportTypes(exportTypes.filter(t => t !== type));
                        }}
                        className="w-4 h-4 rounded border-border/50 text-brand-blue focus:ring-brand-blue/30"
                      />
                      <span className="text-sm text-text-secondary">{type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-3 block">የሂደት ሁኔታ *</label>
                <div className="flex flex-wrap gap-3">
                  {STATUS_ORDER.map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportCategories.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) setExportCategories([...exportCategories, status]);
                          else setExportCategories(exportCategories.filter(s => s !== status));
                        }}
                        className="w-4 h-4 rounded border-border/50 text-brand-blue focus:ring-brand-blue/30"
                      />
                      <span className="text-sm text-text-secondary">{STATUS_CONFIG[status].label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Timeframe Filter */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-3 block">የጊዜ ገደብ *</label>
                <select
                  value={exportTimeframe}
                  onChange={(e) => setExportTimeframe(e.target.value as any)}
                  className="w-full bg-surface-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
                >
                  <option value="all">ሁሉም ጊዜ</option>
                  <option value="1m">ያለፈው 1 ወር</option>
                  <option value="3m">ያለፉት 3 ወራት</option>
                  <option value="6m">ያለፉት 6 ወራት</option>
                  <option value="1y">ያለፈው 1 ዓመት</option>
                  <option value="custom">በመረጡት ጊዜ</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {exportTimeframe === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">መነሻ ቀን</label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full bg-surface-secondary/30 border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1.5 block">መድረሻ ቀን</label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full bg-surface-secondary/30 border border-border/50 rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50"
              >
                ሰርዝ
              </button>
              <button
                onClick={executeExport}
                disabled={exportTypes.length === 0 || exportCategories.length === 0 || (exportTimeframe === 'custom' && (!exportStartDate || !exportEndDate))}
                className="flex-1 py-2.5 px-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <IconDownload size={18} />
                ኤክስፖርት አድርግ
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Committee Group Assignment Modal */}
      {showCommitteeModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCommitteeModal(false)}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 p-6 max-w-lg w-full shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <IconUsers size={20} className="text-brand-blue" />
                አቤቱታውን ተቀበል እና ኮሚቴ አዋቅር
              </h3>
              <button onClick={() => setShowCommitteeModal(false)} className="p-1.5 hover:bg-surface-secondary rounded-xl transition-colors cursor-pointer">
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              ጉዳዩን የሚከታተልና የሚያጣራ ኮሚቴ ስም እና አባላትን ያዋቅሩ::
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-text-primary mb-1 block">የኮሚቴ ስም *</label>
                <input
                  type="text"
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue font-semibold"
                  placeholder="ምሳሌ፦ የኢንስፔክሽን አጣሪ ኮሚቴ"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary mb-2 block">የኮሚቴ አባላት ዝርዝር *</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {committeeMembers.map((member, index) => (
                    <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                      <input
                        type="text"
                        placeholder={`አባል ${index + 1} ስም`}
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...committeeMembers];
                          updated[index].name = e.target.value;
                          setCommitteeMembers(updated);
                        }}
                        className="flex-1 min-w-[120px] px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
                      />
                      <input
                        type="text"
                        placeholder="ስልክ ቁጥር"
                        value={member.phone}
                        onChange={(e) => {
                          const updated = [...committeeMembers];
                          updated[index].phone = e.target.value;
                          setCommitteeMembers(updated);
                        }}
                        className="w-28 px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
                      />
                      <input
                        type="email"
                        placeholder="ኢሜይል (Email)"
                        value={member.email || ''}
                        onChange={(e) => {
                          const updated = [...committeeMembers];
                          updated[index].email = e.target.value;
                          setCommitteeMembers(updated);
                        }}
                        className="flex-1 min-w-[130px] px-3 py-2 text-xs bg-surface-secondary/50 border border-border/50 rounded-xl text-text-primary focus:outline-none focus:border-brand-blue"
                      />
                      {committeeMembers.length > 1 && (
                        <button
                          onClick={() => setCommitteeMembers(committeeMembers.filter((_, i) => i !== index))}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0 cursor-pointer"
                        >
                          <IconX size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCommitteeMembers([...committeeMembers, { name: '', phone: '', email: '' }])}
                  className="mt-2 text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  + አባል ጨምር
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border/20 justify-end">
              <button
                onClick={() => setShowCommitteeModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-text-muted hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                ሰርዝ
              </button>
              <button
                onClick={handleConfirmCommitteeAssignment}
                disabled={actionLoading || !committeeName.trim()}
                className="px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {actionLoading ? 'በማስገባት ላይ...' : 'ተቀበልና ኮሚቴ አጽድቅ (Confirm)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* --- Sub-components --- */

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-text-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-text-muted">{label}</p>
        <p className="text-sm text-text-primary font-medium truncate">{value}</p>
      </div>
    </div>
  );
}


