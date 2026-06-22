'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconSearch,
  IconBulb,
  IconAlertTriangle,
  IconLoader2,
  IconX,
  IconChevronRight,
  IconGripVertical,
  IconDownload,
  IconEye,
  IconPlayerPlay,
  IconCheck,
  IconBan,
  IconHistory,
  IconLayoutKanban,
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
type ViewMode = 'kanban' | 'history';

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
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [tickets, setTickets] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionAction, setResolutionAction] = useState<'Resolved' | 'Rejected'>('Resolved');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const resFileRef = useRef<HTMLInputElement>(null);

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

  // Drag and Drop handlers
  const handleDragStart = (ticketId: string) => {
    setDraggedTicketId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ComplaintStatus) => {
    e.preventDefault();
    if (!draggedTicketId) return;

    const ticket = tickets.find(t => t.id === draggedTicketId);
    if (!ticket || ticket.status === targetStatus) {
      setDraggedTicketId(null);
      return;
    }

    // Validate transition
    const currentIdx = STATUS_ORDER.indexOf(ticket.status);
    const targetIdx = STATUS_ORDER.indexOf(targetStatus);
    
    // Only allow forward movement and specific transitions
    if (
      (ticket.status === 'New' && targetStatus === 'Processing') ||
      (ticket.status === 'Processing' && (targetStatus === 'Resolved' || targetStatus === 'Rejected'))
    ) {
      handleStatusChange(draggedTicketId, targetStatus);
    }

    setDraggedTicketId(null);
  };

  // Export
  const handleExport = () => {
    const dataToExport = filteredTickets.length > 0 ? filteredTickets : typeTickets;
    const typeName = activeTab === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ';
    exportComplaintsToExcel(dataToExport, `${typeName}_${new Date().toISOString().split('T')[0]}.xls`);
  };

  // History data (resolved + rejected)
  const historyTickets = filteredTickets
    .filter(t => t.status === 'Resolved' || t.status === 'Rejected')
    .sort((a, b) => new Date(b.resolvedAt || b.createdAt).getTime() - new Date(a.resolvedAt || a.createdAt).getTime());

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

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-surface-primary/40 backdrop-blur-md p-1 rounded-xl border border-border/20">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'kanban' ? 'bg-surface-secondary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              <IconLayoutKanban size={14} />
              ካንባን
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'history' ? 'bg-surface-secondary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              <IconHistory size={14} />
              ታሪክ
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'ጠቅላላ', value: counts.total, color: 'text-text-primary' },
            { label: 'አዲስ', value: counts.new, color: 'text-blue-600' },
            { label: 'በሂደት ላይ', value: counts.processing, color: 'text-amber-600' },
            { label: 'የተፈቱ', value: counts.resolved, color: 'text-green-600' },
            { label: 'ውድቅ', value: counts.rejected, color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
              <div className={`text-2xl font-light ${stat.color} tabular-nums`}>{stat.value}</div>
              <div className="text-xs text-text-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <IconLoader2 size={32} className="animate-spin text-brand-blue" />
              <span className="text-sm text-text-muted">በመጫን ላይ...</span>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[400px]">
            {STATUS_ORDER.map(status => {
              const columnTickets = getColumnTickets(status);
              const config = STATUS_CONFIG[status];
              return (
                <div
                  key={status}
                  className="flex flex-col gap-3"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}></span>
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">{config.label}</h3>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-surface-secondary flex items-center justify-center text-[10px] font-bold text-text-primary">
                      {columnTickets.length}
                    </span>
                  </div>

                  {/* Drop Zone */}
                  <div className={`flex-1 rounded-2xl transition-all duration-200 ${draggedTicketId ? 'border-2 border-dashed border-border/40 bg-surface-primary/10 p-2' : ''}`}>
                    {columnTickets.length === 0 && (
                      <div className="border-2 border-dashed border-border/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 h-32 bg-surface-primary/20">
                        {status === 'New' ? <IconAlertTriangle size={24} className="text-text-muted/30" /> : <IconLayoutKanban size={24} className="text-text-muted/30" />}
                        <span className="text-xs text-text-muted font-medium">ምንም የለም</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      {columnTickets.map(ticket => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          activeTab={activeTab}
                          onView={() => setSelectedTicket(ticket)}
                          onStatusChange={(newStatus) => handleStatusChange(ticket.id, newStatus)}
                          onDragStart={() => handleDragStart(ticket.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* History Table View */
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 overflow-hidden backdrop-blur-md">
            {historyTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <IconHistory size={32} className="text-text-muted" stroke={1.5} />
                <p className="text-sm text-text-muted">ምንም የተፈቱ ወይም ውድቅ ጉዳዮች የሉም</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">መለያ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">ርዕስ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">አቅራቢ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">ሁኔታ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">ቀን</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">ለመፍታት የፈጀ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyTickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-border/10 hover:bg-surface-primary/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-brand-blue">#{ticket.trackingCode?.split('-').pop() || ticket.id.split('-')[0]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-primary font-medium line-clamp-1">{ticket.message.substring(0, 60)}...</span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{ticket.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CONFIG[ticket.status].bgColor} ${STATUS_CONFIG[ticket.status].color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[ticket.status].dotColor}`}></span>
                            {STATUS_CONFIG[ticket.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs">{ticket.date}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-secondary font-medium">{getResolutionTime(ticket)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-1.5 rounded-lg hover:bg-brand-blue/10 text-text-muted hover:text-brand-blue transition-colors"
                          >
                            <IconEye size={16} />
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
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, 'Processing')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      <IconPlayerPlay size={18} />
                      ወደ ሂደት ውሰድ
                    </button>
                  )}
                  {selectedTicket.status === 'Processing' && (
                    <>
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

function TicketCard({
  ticket,
  activeTab,
  onView,
  onStatusChange,
  onDragStart,
}: {
  ticket: Complaint;
  activeTab: TicketType;
  onView: () => void;
  onStatusChange: (status: ComplaintStatus) => void;
  onDragStart: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const accentColor = activeTab === 'Suggestion' ? 'brand-blue' : 'brand-yellow';

  const nextAction = ticket.status === 'New'
    ? { label: 'ወደ ሂደት ውሰድ', status: 'Processing' as ComplaintStatus, icon: IconPlayerPlay }
    : ticket.status === 'Processing'
    ? { label: 'ፍታው / ውድቅ', status: null, icon: IconCheck }
    : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-surface-primary/40 border border-border/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-surface-primary/60 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col gap-2.5 group hover:border-border/40 hover:shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <IconGripVertical size={14} className="text-text-muted/40 group-hover:text-text-muted transition-colors" />
          <span className={`text-[11px] font-mono font-medium text-${accentColor}`}>
            #{ticket.trackingCode?.split('-').pop() || ticket.id.split('-')[0]}
          </span>
        </div>
        <span className="text-[10px] text-text-muted">{ticket.date}</span>
      </div>

      <div className="pl-5">
        <p className="text-sm text-text-primary font-medium line-clamp-2 leading-snug">{ticket.message.substring(0, 80)}{ticket.message.length > 80 ? '...' : ''}</p>
      </div>

      <div className="flex items-center justify-between pl-5 pt-2 border-t border-border/10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-text-secondary">{ticket.name}</span>
          {ticket.attachments && ticket.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
              <IconPaperclip size={10} />
              {ticket.attachments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-1.5 rounded-lg hover:bg-brand-blue/10 text-text-muted hover:text-brand-blue transition-colors"
            title="ዝርዝር ይመልከቱ"
          >
            <IconEye size={14} />
          </button>
          {nextAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (nextAction.status) {
                  onStatusChange(nextAction.status);
                } else {
                  onView();
                }
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                ticket.status === 'New'
                  ? 'hover:bg-amber-500/10 text-text-muted hover:text-amber-600'
                  : 'hover:bg-green-500/10 text-text-muted hover:text-green-600'
              }`}
              title={nextAction.label}
            >
              <nextAction.icon size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
