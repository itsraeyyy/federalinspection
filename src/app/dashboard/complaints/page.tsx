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
} from "@tabler/icons-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { complaintService } from "@/services/complaints";
import { Complaint, ComplaintStatus } from "@/types";
import { exportComplaintsToExcel, getResolutionTime } from "@/lib/exportExcel";
import { useAdmin } from "@/lib/hooks/useAdmin";

type TicketType = 'Complaint' | 'Suggestion';
type StatusFilter = 'All' | ComplaintStatus;

const STATUS_ORDER: ComplaintStatus[] = ['New', 'Processing', 'Resolved', 'Rejected'];

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; bgColor: string; dotColor: string; iconColor: string }> = {
  New: { label: 'አዲስ', color: 'text-blue-700', bgColor: 'bg-blue-500/10', dotColor: 'bg-blue-500', iconColor: 'text-blue-500' },
  Processing: { label: 'በሂደት ላይ', color: 'text-amber-700', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-500', iconColor: 'text-amber-500' },
  Resolved: { label: 'የተፈታ', color: 'text-green-700', bgColor: 'bg-green-500/10', dotColor: 'bg-green-500', iconColor: 'text-green-500' },
  Rejected: { label: 'ውድቅ', color: 'text-red-700', bgColor: 'bg-red-500/10', dotColor: 'bg-red-500', iconColor: 'text-red-500' },
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
  const [resolutionAction, setResolutionAction] = useState<'Resolved' | 'Rejected'>('Resolved');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const resFileRef = useRef<HTMLInputElement>(null);

  // Committee Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<string[]>(['']);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTypes, setExportTypes] = useState<TicketType[]>(['Complaint', 'Suggestion']);
  const [exportCategories, setExportCategories] = useState<ComplaintStatus[]>(['New', 'Processing', 'Resolved', 'Rejected']);
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
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    new: typeTickets.filter(t => t.status === 'New').length,
    processing: typeTickets.filter(t => t.status === 'Processing').length,
    resolved: typeTickets.filter(t => t.status === 'Resolved').length,
    rejected: typeTickets.filter(t => t.status === 'Rejected').length,
  };

  // Admin name for tracking
  const adminName = profile?.first_name || 'Admin';

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

    const success = await complaintService.updateComplaintStatus(
      selectedTicket.id,
      resolutionAction,
      adminName,
      { message: resolutionMessage, files: resolutionFiles.length > 0 ? resolutionFiles : undefined }
    );

    if (success) {
      await loadTickets();
      setShowResolutionModal(false);
      setSelectedTicket(null);
    }
    setActionLoading(false);
  };

  const handleCommitteeAssign = async () => {
    const validMembers = committeeMembers.filter(m => m.trim());
    if (!selectedTicket || validMembers.length === 0) return;
    setActionLoading(true);
    
    const assignedStr = validMembers.join('፣ ');
    const assigned = await complaintService.assignCommittee(selectedTicket.id, assignedStr);
    if (assigned) {
      if (selectedTicket.status === 'New') {
        await complaintService.updateComplaintStatus(selectedTicket.id, 'Processing', adminName);
      }
      await loadTickets();
      const updated = await complaintService.getComplaintById(selectedTicket.id);
      setSelectedTicket(updated);
      setShowCommitteeModal(false);
      setCommitteeMembers(['']);
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
    .filter(t => activeStatusFilter === 'All' || t.status === activeStatusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ጥቆማ እና አቤቱታ</h1>
            <p className="text-sm text-text-muted mt-1">የዜጎችን ጥቆማዎች እና ቅሬታዎች ያስተዳድሩ።</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'All', label: 'ጠቅላላ', value: counts.total, color: 'text-text-primary', activeStyle: 'bg-surface-primary shadow-sm border-border/40' },
            { id: 'New', label: 'አዲስ', value: counts.new, color: 'text-blue-600', activeStyle: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/50' },
            { id: 'Processing', label: 'በሂደት ላይ', value: counts.processing, color: 'text-amber-600', activeStyle: 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/50' },
            { id: 'Resolved', label: 'የተፈቱ', value: counts.resolved, color: 'text-green-600', activeStyle: 'bg-green-50/80 dark:bg-green-900/20 border-green-200/50' },
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
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CONFIG[ticket.status].bgColor} ${STATUS_CONFIG[ticket.status].color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[ticket.status].dotColor}`}></span>
                            {STATUS_CONFIG[ticket.status].label}
                          </span>
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
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-1.5 rounded-lg bg-surface-secondary/50 hover:bg-brand-blue hover:text-white text-text-secondary transition-all"
                              title="ዝርዝር ይመልከቱ"
                            >
                              <IconEye size={16} />
                            </button>
                            {ticket.status === 'New' && (
                              <button
                                onClick={() => handleStatusChange(ticket.id, 'Processing')}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg bg-surface-secondary/50 hover:bg-amber-500 hover:text-white text-text-secondary transition-all disabled:opacity-50"
                                title="ወደ ሂደት ውሰድ"
                              >
                                <IconPlayerPlay size={16} />
                              </button>
                            )}
                            {ticket.status === 'Processing' && (
                              <button
                                onClick={() => handleStatusChange(ticket.id, 'Resolved')}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg bg-surface-secondary/50 hover:bg-green-600 hover:text-white text-text-secondary transition-all disabled:opacity-50"
                                title="መፍትሄ ስጥ / ውድቅ አድርግ"
                              >
                                <IconCheck size={16} />
                              </button>
                            )}
                          </div>
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

      {/* Detail Drawer */}
      {selectedTicket && !showResolutionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-end z-50 transition-opacity" onClick={() => setSelectedTicket(null)}>
          <div
            className="w-full max-w-2xl h-full bg-surface-primary overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300 border-l border-border/30 flex flex-col"
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
                  <InfoRow icon={IconUser} label="ሙሉ ስም" value={selectedTicket.name} />
                  <InfoRow icon={IconPhone} label="ስልክ ቁጥር" value={selectedTicket.phone} />
                  {selectedTicket.email && <InfoRow icon={IconMail} label="ኢሜይል" value={selectedTicket.email} />}
                  {selectedTicket.age && <InfoRow icon={IconUser} label="ዕድሜ" value={`${selectedTicket.age} ዓመት`} />}
                  {selectedTicket.gender && <InfoRow icon={IconUser} label="ፆታ" value={selectedTicket.gender} />}
                  {selectedTicket.address && <InfoRow icon={IconMapPin} label="አድራሻ" value={selectedTicket.address} />}
                  {selectedTicket.institution && <InfoRow icon={IconBuilding} label="ተቋም / ክፍል" value={selectedTicket.institution} />}
                  {selectedTicket.assignedCommittee && <InfoRow icon={IconUser} label="የተመደበለት ኮሚቴ" value={selectedTicket.assignedCommittee} />}
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
                        <IconExternalLink size={16} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-brand-blue transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Details */}
              {selectedTicket.resolution && (
                <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden ${selectedTicket.status === 'Rejected' ? 'bg-red-50/50 border-red-200/50 dark:bg-red-950/20 dark:border-red-900/30' : 'bg-green-50/50 border-green-200/50 dark:bg-green-950/20 dark:border-green-900/30'}`}>
                  <div className={`absolute top-0 right-0 p-6 opacity-5 ${selectedTicket.status === 'Rejected' ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedTicket.status === 'Rejected' ? <IconBan size={100} /> : <IconCheck size={100} />}
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${selectedTicket.status === 'Rejected' ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedTicket.status === 'Rejected' ? <><IconBan size={16}/> የውድቅ ምክንያት</> : <><IconCheck size={16}/> የተሰጠ መፍትሄ</>}
                  </h4>
                  <div className="relative z-10">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{selectedTicket.resolution.message}</p>
                    {selectedTicket.resolution.attachments && selectedTicket.resolution.attachments.length > 0 && (
                      <div className="mt-5 space-y-2">
                        <p className="text-xs font-semibold text-text-secondary mb-2">ተያያዥ ሰነዶች:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.resolution.attachments.map((att: any, i: number) => (
                            <a key={i} href={att.url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-primary rounded-xl border border-border/30 text-xs font-medium text-brand-blue hover:border-brand-blue/30 transition-colors shadow-sm">
                              <IconFileText size={14} /> {att.filename}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-5 pt-4 border-t border-border/10 flex items-center gap-4 text-xs text-text-secondary font-medium">
                      {selectedTicket.resolvedBy && <span className="flex items-center gap-1.5"><IconUser size={14} /> {selectedTicket.resolvedBy}</span>}
                      {selectedTicket.resolvedAt && <span className="flex items-center gap-1.5"><IconClock size={14} /> {new Date(selectedTicket.resolvedAt).toLocaleString('am-ET')}</span>}
                    </div>
                  </div>
                </div>
              )}

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
                    { label: 'ተቀብለናል', date: selectedTicket.createdAt, active: true },
                    { label: 'ወደ ሂደት ገብቷል', date: selectedTicket.processedAt, active: !!selectedTicket.processedAt },
                    { label: selectedTicket.status === 'Rejected' ? 'ውድቅ ሆኗል' : 'ተፈቷል', date: selectedTicket.resolvedAt, active: !!selectedTicket.resolvedAt },
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
                            {new Date(step.date).toLocaleString('am-ET', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
            {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Rejected' && (
              <div className="sticky bottom-0 bg-surface-primary/90 backdrop-blur-xl border-t border-border/20 p-6">
                <div className="flex gap-3">
                  {selectedTicket.status === 'New' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, 'Processing')}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <IconPlayerPlay size={18} />
                        ወደ ሂደት ውሰድ
                      </button>
                      {selectedTicket.type === 'Complaint' && (
                        <button
                          onClick={() => setShowCommitteeModal(true)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <IconUser size={18} />
                          ለኮሚቴ ምደባ
                        </button>
                      )}
                    </>
                  )}
                  {selectedTicket.status === 'Processing' && (
                    <>
                      {selectedTicket.type === 'Complaint' && (
                        <button
                          onClick={() => setShowCommitteeModal(true)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          <IconUser size={18} />
                          {selectedTicket.assignedCommittee ? 'ኮሚቴ ቀይር' : 'ለኮሚቴ ምደባ'}
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, 'Resolved')}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <IconCheck size={18} />
                        መፍትሄ ስጥ
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedTicket.id, 'Rejected')}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <IconBan size={18} />
                        ውድቅ አድርግ
                      </button>
                    </>
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
                {resolutionAction === 'Resolved' ? 'መፍትሄ ይስጡ' : 'ውድቅ ያድርጉ'}
              </h3>
              <button onClick={() => setShowResolutionModal(false)} className="p-1.5 hover:bg-surface-secondary rounded-xl transition-colors">
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              {resolutionAction === 'Resolved'
                ? 'የተሰጠውን መፍትሄ ዝርዝር ያስገቡ። ይህ ለአቅራቢው ይላካል።'
                : 'ውድቅ ለማድረግ ምክንያቱን ያስገቡ። ይህ ለአቅራቢው ይላካል።'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  {resolutionAction === 'Resolved' ? 'የመፍትሄ ዝርዝር *' : 'የውድቅ ምክንያት *'}
                </label>
                <textarea
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  rows={4}
                  className="block w-full resize-none rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
                  placeholder={resolutionAction === 'Resolved' ? 'የተሰጠውን መፍትሄ ያስገቡ...' : 'ውድቅ ያደረጉበትን ምክንያት ያስገቡ...'}
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
                  resolutionAction === 'Resolved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading ? 'በመላክ ላይ...' : resolutionAction === 'Resolved' ? 'መፍትሄ ስጥ' : 'ውድቅ አድርግ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Committee Assignment Modal */}
      {showCommitteeModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCommitteeModal(false)}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-text-primary">
                ለኮሚቴ ይመድቡ
              </h3>
              <button onClick={() => setShowCommitteeModal(false)} className="p-1.5 hover:bg-surface-secondary rounded-xl transition-colors">
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              ይህን አቤቱታ የሚያጣሩትን የኮሚቴ አባላት ስም ያስገቡ።
            </p>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto px-1 pb-2">
              {committeeMembers.map((member, index) => (
                <div key={index}>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    የኮሚቴ አባል {index + 1} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => {
                        const newMembers = [...committeeMembers];
                        newMembers[index] = e.target.value;
                        setCommitteeMembers(newMembers);
                      }}
                      className="block w-full rounded-xl border border-border/50 bg-surface-secondary/30 px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors"
                      placeholder={`አባል ${index + 1} ስም`}
                    />
                    {committeeMembers.length > 1 && (
                      <button
                        onClick={() => {
                          const newMembers = committeeMembers.filter((_, i) => i !== index);
                          setCommitteeMembers(newMembers);
                        }}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                      >
                        <IconX size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setCommitteeMembers([...committeeMembers, ''])}
                className="w-full py-3 border-2 border-dashed border-brand-blue/30 text-brand-blue rounded-xl text-sm font-semibold hover:bg-brand-blue/5 transition-colors mt-2"
              >
                + ተጨማሪ አባል ያክሉ
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCommitteeModal(false)}
                className="flex-1 py-2.5 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50"
              >
                ሰርዝ
              </button>
              <button
                onClick={handleCommitteeAssign}
                disabled={actionLoading || !committeeMembers.some(m => m.trim())}
                className="flex-1 py-2.5 px-4 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 bg-brand-blue hover:bg-brand-blue/90"
              >
                {actionLoading ? 'በመመደብ ላይ...' : 'መደብ'}
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


