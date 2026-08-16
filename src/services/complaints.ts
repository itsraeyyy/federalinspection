import { supabase } from '../lib/supabaseClient';
import { Complaint, ComplaintStatus } from '../types';
import { formatECDate, formatECDateTime } from '../lib/date-formatter';
/**
 * Client-safe notification trigger.
 * Routes through /api/internal/notify so that TEXTBEE_API_KEY (a server-only
 * env var) is available. Calling sendSMS directly here would silently fail
 * in the browser because process.env.TEXTBEE_API_KEY is undefined client-side.
 */
async function notifyViaAPI(type: string, opts: Record<string, any>): Promise<void> {
  try {
    await fetch('/api/internal/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, opts }),
    });
  } catch (err) {
    console.error(`[ComplaintService] Notification failed (type=${type}):`, err);
  }
}

function generateTrackingCode(): string {
  const prefix = 'TRK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function resolveFileUrl(file: any, trackingCode?: string): string {
  if (!file) return '#';
  let rawUrl = typeof file === 'string' ? file : (file.url || file.filePath || '#');
  let filePath = typeof file === 'object' ? file.filePath : undefined;

  if (!filePath && rawUrl && rawUrl.includes('/complaints/')) {
    const parts = rawUrl.split('/complaints/');
    if (parts.length > 1) {
      filePath = parts[1].split('?')[0];
    }
  } else if (!filePath && rawUrl && !rawUrl.startsWith('http') && !rawUrl.startsWith('/') && !rawUrl.startsWith('#')) {
    filePath = rawUrl;
  }

  if (filePath) {
    const cleanPath = filePath.split('?')[0];
    let secureEndpoint = `/api/complaints/attachment?filePath=${encodeURIComponent(cleanPath)}&redirect=true`;
    if (trackingCode) {
      secureEndpoint += `&trackingCode=${encodeURIComponent(trackingCode)}`;
    }
    return secureEndpoint;
  }

  return rawUrl || '#';
}

function cleanFileAttachment(att: any, trackingCode?: string): any {
  if (!att) return att;
  const resolvedUrl = resolveFileUrl(att, trackingCode);
  const path = typeof att === 'string' ? att : (att.filePath || att.path || att.url || '');
  if (typeof att === 'string') return { url: resolvedUrl, filename: 'ሰነድ', filePath: path };
  return {
    ...att,
    url: resolvedUrl || att.url
  };
}

function mapRowToComplaint(item: any): Complaint {
  const code = item.tracking_code || '';
  const rawAttachments = (item.attachments || []).map((att: any) => cleanFileAttachment(att, code));
  const rawResolution = item.resolution ? {
    ...item.resolution,
    attachments: (item.resolution.attachments || []).map((att: any) => cleanFileAttachment(att, code)),
    decisionIdeaFiles: (item.resolution.decisionIdeaFiles || []).map((att: any) => cleanFileAttachment(att, code)),
    files: (item.resolution.files || []).map((att: any) => cleanFileAttachment(att, code)),
  } : item.resolution;

  const rawDecisionFiles = (
    (item.resolution as any)?.decisionIdeaFiles ||
    (item.resolution as any)?.attachments ||
    []
  ).map((att: any) => cleanFileAttachment(att, code));

  return {
    id: item.id,
    trackingCode: code,
    name: item.name,
    phone: item.phone,
    email: item.email || '',
    age: item.age,
    gender: item.gender,
    address: item.address,
    submissionMode: item.submission_mode || 'በግል',
    memberCount: item.member_count,
    institution: item.institution,
    type: item.type,
    subject: item.subject,
    message: item.message,
    targetRegion: item.target_region,
    targetZone: item.target_zone,
    requestedResolution: item.requested_resolution,
    attachments: rawAttachments,
    date: formatECDate(item.created_at),
    createdAt: formatECDateTime(item.created_at),
    createdAtRaw: item.created_at,
    updatedAt: item.updated_at ? formatECDateTime(item.updated_at) : undefined,
    processedAt: item.processed_at ? formatECDateTime(item.processed_at) : undefined,
    resolvedAt: item.resolved_at ? formatECDateTime(item.resolved_at) : undefined,
    resolvedAtRaw: item.resolved_at,
    processedBy: item.processed_by,
    resolvedBy: item.resolved_by,
    status: item.status,
    resolution: rawResolution,
    groupMembers: item.group_members || [],
    assignedCommittee: item.assigned_committee || (item.resolution as any)?.assignedCommittee || undefined,
    serviceName: item.service_name,
    resolutionRating: item.resolution_rating,
    resolutionFeedback: item.resolution_feedback,
    workflowStep: (item.resolution as any)?.workflowStep || (item.status === 'Accepted' ? 2 : item.status === 'Processing' ? 3 : item.status === 'PendingApproval' ? 4 : item.status === 'Resolved' || item.status === 'Rejected' ? 5 : 1),
    adminInstructions: (item.resolution as any)?.adminInstructions || undefined,
    decisionIdeaSummary: (item.resolution as any)?.decisionIdeaSummary || undefined,
    decisionIdeaFiles: rawDecisionFiles,
    slaDeadline: (item.resolution as any)?.slaDeadline ? formatECDateTime((item.resolution as any).slaDeadline) : undefined,
    slaDeadlineRaw: (item.resolution as any)?.slaDeadline || undefined,
    slaNotified: item.sla_notified || false,
    reminderNotified: item.reminder_notified || false,
  };
}

export const complaintService = {
  resolveFileUrl: resolveFileUrl,

  getSecureAttachmentUrl: async (filePath: string, trackingCode?: string): Promise<string | null> => {
    if (!filePath) return null;
    return resolveFileUrl(filePath, trackingCode);
  },

  refreshSecureUrls: async (complaint: Complaint): Promise<Complaint> => {
    if (complaint.attachments) {
      for (const att of complaint.attachments) {
        if (att.filePath) {
          att.url = await complaintService.getSecureAttachmentUrl(att.filePath) || att.url;
        }
      }
    }
    if (complaint.resolution?.attachments) {
      for (const att of complaint.resolution.attachments) {
        if (att.filePath) {
          att.url = await complaintService.getSecureAttachmentUrl(att.filePath) || att.url;
        }
      }
    }
    if (complaint.decisionIdeaFiles) {
      for (const att of complaint.decisionIdeaFiles) {
        if (att.filePath) {
          att.url = await complaintService.getSecureAttachmentUrl(att.filePath) || att.url;
        }
      }
    }
    return complaint;
  },

  getComplaints: async (): Promise<Complaint[]> => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
    return data.map(mapRowToComplaint);
  },

  getComplaintById: async (id: string): Promise<Complaint | null> => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching complaint:', error);
      return null;
    }
    const complaint = mapRowToComplaint(data);
    return await complaintService.refreshSecureUrls(complaint);
  },

  getComplaintByTrackingCode: async (trackingCode: string): Promise<Complaint | null> => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('tracking_code', trackingCode)
      .single();
    if (error) {
      return null;
    }
    const complaint = mapRowToComplaint(data);
    return await complaintService.refreshSecureUrls(complaint);
  },

  submitComplaint: async (formData: {
    name?: string;
    phone: string;
    email?: string;
    age?: number;
    gender?: string;
    address?: string;
    submissionMode: string;
    memberCount?: number;
    institution: string;
    type: 'Complaint' | 'Suggestion';
    subject: string;
    message: string;
    targetRegion?: string;
    targetZone?: string;
    requestedResolution?: string;
    files?: File[];
    groupMembers?: string[];
    serviceName?: string;
  }): Promise<{ trackingCode: string; id: string } | null> => {
    const trackingCode = generateTrackingCode();

    // Upload files if any
    let attachments: any[] = [];
    if (formData.files && formData.files.length > 0) {
      for (const file of formData.files) {
        const fileExt = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
        const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
        const safeExt = cleanExt ? `.${cleanExt}` : '';
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
        const filePath = `submissions/${trackingCode}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaints')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file to complaints storage:', uploadError);
          throw uploadError;
        }

        const fileUrl = resolveFileUrl({ filePath });

        attachments.push({
          id: crypto.randomUUID(),
          filename: file.name,
          fileType: file.type || (fileExt ? fileExt.toUpperCase() : 'UNKNOWN'),
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          url: fileUrl,
          filePath: filePath,
        });
      }
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        name: formData.name || 'አልተገለጸም (Anonymous)',
        phone: formData.phone,
        email: formData.email || null,
        age: formData.age || null,
        gender: formData.gender || null,
        address: formData.address || null,
        submission_mode: formData.submissionMode,
        member_count: formData.memberCount || null,
        institution: formData.institution,
        type: formData.type,
        subject: formData.institution, // institution as subject context
        message: formData.message,
        target_region: formData.targetRegion || null,
        target_zone: formData.targetZone || null,
        requested_resolution: formData.requestedResolution || null,
        group_members: formData.groupMembers || [],
        service_name: formData.serviceName || null,
        tracking_code: trackingCode,
        attachments,
        status: 'New',
        sla_notified: false,
        reminder_notified: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting complaint:', error.message, error.details, error.hint, error);
      return null;
    }

    if (formData.phone || formData.email) {
      try {
        await notifyViaAPI('complaint_submitted', {
          phone: formData.phone,
          email: formData.email,
          name: formData.name || 'አልተገለጸም (Anonymous)',
          trackingCode,
          type: formData.type,
        });
      } catch (notifyErr) {
        console.error('Failed to send complaint submission notification:', notifyErr);
      }
    }

    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('phone, email, modules, role')
      .eq('status', 'Active');

    if (admins) {
      const targetAdmins = admins.filter(a =>
        a.role === 'super_admin' ||
        (a.modules && (a.modules.includes('complaints') || a.modules.includes('abetuta') || a.modules.includes('tikoma')))
      );

      const typeLabel = formData.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ';
      for (const admin of targetAdmins) {
        if (admin.phone || admin.email) {
          try {
            await notifyViaAPI('new_complaint_admin_alert', {
              phone: admin.phone || undefined,
              email: admin.email || undefined,
              trackingCode,
              type: formData.type,
              institution: formData.institution,
            });
          } catch (adminErr) {
            console.error('Failed to notify admin of new complaint:', adminErr);
          }
        }
      }
    }

    return { trackingCode, id: data.id };
  },

  updateComplaintStatus: async (
    id: string,
    newStatus: ComplaintStatus,
    adminName: string,
    resolution?: { message: string; files?: File[] }
  ): Promise<boolean> => {
    // Fetch existing record to preserve resolution data
    const { data: existing } = await supabase.from('complaints').select('resolution').eq('id', id).single();
    const updates: any = { status: newStatus };

    if (newStatus === 'Processing') {
      updates.processed_at = new Date().toISOString();
      updates.processed_by = adminName;
    }

    if (newStatus === 'PendingApproval') {
      updates.processed_by = adminName;
      if (resolution?.message) {
        updates.resolution = { ...(existing?.resolution as any || {}), decisionIdeaSummary: resolution.message, message: resolution.message };
      }
    }

    if (newStatus === 'Resolved' || newStatus === 'Rejected') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = adminName;

      if (resolution) {
        let resolutionAttachments: any[] = [];
        if (resolution.files && resolution.files.length > 0) {
          for (const file of resolution.files) {
            const fileExt = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
            const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
            const safeExt = cleanExt ? `.${cleanExt}` : '';
            const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
            const filePath = `resolutions/${id}/${safeFileName}`;

            const { error: uploadError } = await supabase.storage
              .from('complaints')
              .upload(filePath, file);

            if (uploadError) {
              console.error('Error uploading resolution file to complaints storage:', uploadError);
              throw uploadError;
            }

            const fileUrl = resolveFileUrl({ filePath });

            resolutionAttachments.push({
              id: crypto.randomUUID(),
              filename: file.name,
              fileType: file.type || (fileExt ? fileExt.toUpperCase() : 'UNKNOWN'),
              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              url: fileUrl,
              filePath: filePath,
            });
          }
        }

        const existingAttachments = (existing?.resolution as any)?.attachments || (existing?.resolution as any)?.finalDecisionFiles || [];
        const finalAttachments = resolutionAttachments.length > 0 ? resolutionAttachments : existingAttachments;

        updates.resolution = {
          ...(existing?.resolution as any || {}),
          message: resolution.message,
          attachments: finalAttachments,
          finalDecisionFiles: finalAttachments,
          resolvedAt: new Date().toISOString(),
          resolvedBy: adminName,
        };
      }
    }

    const { data: updatedComplaint, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select('name, phone, email, type, tracking_code')
      .single();

    if (error) {
      console.error('Error updating complaint status:', error);
      return false;
    }

    if (newStatus === 'PendingApproval') {
      // Alert Committee Leaders for approval; do NOT notify the user yet
      const { data: admins } = await supabase
        .from('admin_profiles')
        .select('phone, email, role, modules')
        .eq('status', 'Active');
      if (admins) {
        const leaders = admins.filter(a => a.role === 'committee_leader' || a.role === 'super_admin');
        for (const l of leaders) {
          if (l.phone || l.email) {
            try {
              await notifyViaAPI('report_update', {
                phone: l.phone || undefined,
                email: l.email || undefined,
                name: 'የኮሚሽን ጽ/ቤት ሃላፊ (Leader)',
                subject: 'ICODiS — የውሳኔ ሀሳብ ለመጽደቅ ቀርቧል (Pending Approval)',
                message: `ለማጽደቅ የቀረበ አዲስ የውሳኔ ሀሳብ አለ። መከታተያ ኮድ፡ [${updatedComplaint?.tracking_code || id}]። እባክዎ በመግባት ውሳኔውን ያረጋግጡና ያጽድቁ።`,
                loginPath: '/complaint/dashboard',
              });
            } catch (e) {
              console.error('Failed notifying committee leader:', e);
            }
          }
        }
      }
      return true;
    }

    if (updatedComplaint && (updatedComplaint.phone || (updatedComplaint as any).email)) {
      try {
        await notifyViaAPI('complaint_status_update', {
          phone: updatedComplaint.phone,
          email: (updatedComplaint as any).email,
          name: updatedComplaint.name,
          type: updatedComplaint.type,
          status: newStatus,
          trackingCode: updatedComplaint.tracking_code || '',
          resolution: resolution?.message,
        });
      } catch (notifyErr) {
        console.error('Failed to send complaint status notification:', notifyErr);
      }
    }

    return true;
  },

  acceptComplaintByAdmin: async (id: string, adminName: string): Promise<boolean> => {
    const { data: updatedComplaint, error } = await supabase
      .from('complaints')
      .update({ status: 'Accepted', processed_by: adminName })
      .eq('id', id)
      .select('name, phone, email, type, tracking_code')
      .single();

    if (error) {
      console.error('Error accepting complaint by admin:', error);
      return false;
    }

    // Notify submitter that complaint has been accepted
    if (updatedComplaint && (updatedComplaint.phone || (updatedComplaint as any).email)) {
      try {
        await notifyViaAPI('complaint_status_update', {
          phone: updatedComplaint.phone,
          email: (updatedComplaint as any).email,
          name: updatedComplaint.name,
          type: updatedComplaint.type,
          status: 'Accepted',
          trackingCode: updatedComplaint.tracking_code || '',
        });
      } catch (e) {
        console.error('Failed to notify submitter of acceptance:', e);
      }
    }

    // Notify Committee Leaders via sms/notify
    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('phone, email, role')
      .eq('status', 'Active');
    if (admins) {
      const leaders = admins.filter(a => a.role === 'committee_leader' || a.role === 'super_admin');
      const msg = `አዲስ ጉዳይ በአስተዳዳሪ ተቀባይነት አግኝቷል እና ለኮሚቴ ምደባ ዝግጁ ነው። እባክዎ ኮሚቴ ይመድቡ እና ሂደቱን ያስጀምሩ።`;
      for (const l of leaders) {
        if (l.phone || l.email) {
          try {
            await notifyViaAPI('report_update', {
              phone: l.phone || undefined,
              email: l.email || undefined,
              name: 'የኮሚሽን ጽ/ቤት ሃላፊ (Leader)',
              subject: 'ICODiS — አዲስ ጉዳይ ለኮሚቴ ምደባ (Awaiting Assignment)',
              message: msg,
              loginPath: '/complaint/dashboard',
            });
          } catch (e) {
            console.error('Failed notifying leader:', e);
          }
        }
      }
    }

    return true;
  },

  startProcessingByLeader: async (id: string, leaderName: string, committeeName: string, members?: { name: string; role?: string; phone: string; email?: string }[]): Promise<boolean> => {
    const { data: existing } = await supabase.from('complaints').select('resolution').eq('id', id).single();
    const existingRes = (existing?.resolution as any) || {};

    const formattedMembers = members && members.length > 0
      ? members.filter(m => m.name.trim()).map(m => {
        const roleStr = m.role?.trim() ? ` [${m.role.trim()}]` : '';
        const contact = [m.phone?.trim(), m.email?.trim()].filter(Boolean).join(', ');
        return `${m.name.trim()}${roleStr}${contact ? ` (${contact})` : ''}`;
      })
      : undefined;

    const { data: updatedComplaint, error } = await supabase
      .from('complaints')
      .update({
        status: 'Processing',
        processed_by: leaderName,
        processed_at: new Date().toISOString(),
        assigned_committee: committeeName,
        ...(formattedMembers ? { group_members: formattedMembers } : {}),
        resolution: {
          ...existingRes,
          assignedCommittee: committeeName,
          committeeMembers: members || [],
          slaDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        }
      })
      .eq('id', id)
      .select('name, phone, email, type, tracking_code')
      .single();

    if (error) {
      console.error('Error starting processing by leader:', error);
      return false;
    }

    if (updatedComplaint && (updatedComplaint.phone || (updatedComplaint as any).email)) {
      try {
        await notifyViaAPI('complaint_status_update', {
          phone: updatedComplaint.phone,
          email: (updatedComplaint as any).email,
          name: updatedComplaint.name,
          type: updatedComplaint.type,
          status: 'Processing',
          trackingCode: updatedComplaint.tracking_code || '',
        });
      } catch (notifyErr) {
        console.error('Failed to send complaint status notification:', notifyErr);
      }
    }

    // Notify assigned committee group members (without link)
    if (updatedComplaint && members && members.length > 0) {
      for (const m of members) {
        if (m.name && (m.phone || m.email)) {
          try {
            await notifyViaAPI('committee_assigned', {
              name: m.name.trim(),
              role: m.role ? m.role.trim() : undefined,
              phone: m.phone ? m.phone.trim() : undefined,
              email: m.email ? m.email.trim() : undefined,
              committeeName,
              trackingCode: updatedComplaint.tracking_code || '',
              slaDeadline: '15 ቀናት',
            });
          } catch (e) {
            console.error('Failed to notify committee member of assignment:', e);
          }
        }
      }
    }

    return true;
  },

  approveDecisionByLeader: async (id: string, leaderName: string, confirmationMessage?: string, files?: File[]): Promise<boolean> => {
    const { data: existing } = await supabase.from('complaints').select('resolution, name, phone, email, type, tracking_code').eq('id', id).single();
    const existingRes = (existing?.resolution as any) || {};
    const finalMsg = confirmationMessage?.trim() || existingRes.decisionIdeaSummary || existingRes.message || 'የውሳኔ ሀሳቡ በኮሚቴ ሰብሳቢ ተረጋግቶና ጸድቆ ተጠናቋል።';

    let resolutionAttachments: any[] = existingRes.attachments || [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileExt = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
        const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
        const safeExt = cleanExt ? `.${cleanExt}` : '';
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
        const filePath = `resolutions/${id}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage.from('complaints').upload(filePath, file);
        if (!uploadError) {
          const fileUrl = resolveFileUrl({ filePath });
          resolutionAttachments.push({
            filename: file.name,
            fileType: file.type,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            url: fileUrl,
            filePath
          });
        }
      }
    }

    const { error } = await supabase
      .from('complaints')
      .update({
        status: 'Resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: leaderName,
        resolution: {
          ...existingRes,
          message: finalMsg,
          attachments: resolutionAttachments,
          approvedByLeaderAt: new Date().toISOString(),
          approvedByLeaderName: leaderName,
        }
      })
      .eq('id', id);

    if (error) {
      console.error('Error approving decision by leader:', error);
      return false;
    }

    if (existing && (existing.phone || (existing as any).email)) {
      try {
        await notifyViaAPI('complaint_status_update', {
          phone: existing.phone,
          email: (existing as any).email,
          name: existing.name,
          type: existing.type,
          status: 'Resolved',
          trackingCode: existing.tracking_code || '',
        });
      } catch (notifyErr) {
        console.error('Failed to send complaint status notification:', notifyErr);
      }
    }

    // Also notify Complaint Receivers / Admins that decision was approved
    const { data: admins } = await supabase.from('admin_profiles').select('phone, email, modules, role').eq('status', 'Active');
    if (admins && existing?.tracking_code) {
      const targetAdmins = admins.filter(a =>
        a.role === 'super_admin' ||
        (a.modules && (a.modules.includes('complaints') || a.modules.includes('abetuta') || a.modules.includes('tikoma')))
      );
      for (const admin of targetAdmins) {
        if (admin.phone || admin.email) {
          try {
            await notifyViaAPI('decision_approved_admin_alert', {
              phone: admin.phone || undefined,
              email: admin.email || undefined,
              trackingCode: existing.tracking_code,
            });
          } catch (adminErr) {
            console.error('Failed to notify admin of approved decision:', adminErr);
          }
        }
      }
    }

    return true;
  },

  submitDecisionIdea: async (id: string, summary: string, files?: File[], leaderName?: string): Promise<boolean> => {
    const { data: existing } = await supabase.from('complaints').select('tracking_code').eq('id', id).maybeSingle();
    let decisionAttachments: any[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileExt = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
        const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
        const safeExt = cleanExt ? `.${cleanExt}` : '';
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
        const filePath = `decision-ideas/${id}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage.from('complaints').upload(filePath, file);
        if (uploadError) {
          console.error('Error uploading decision idea file:', uploadError);
          throw uploadError;
        }

        const fileUrl = resolveFileUrl({ filePath });
        decisionAttachments.push({
          id: crypto.randomUUID(),
          filename: file.name,
          fileType: file.type || (fileExt ? fileExt.toUpperCase() : 'UNKNOWN'),
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          url: fileUrl,
          filePath: filePath,
        });
      }
    }

    const { error } = await supabase
      .from('complaints')
      .update({
        status: 'PendingApproval',
        processed_by: leaderName || null,
        updated_at: new Date().toISOString(),
        resolution: {
          decisionIdeaSummary: summary,
          decisionIdeaFiles: decisionAttachments,
        }
      })
      .eq('id', id);

    if (error) {
      console.error('Error submitting decision idea:', error);
      return false;
    }

    // Notify Committee Leaders for Final Approval
    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('phone, email, role, modules')
      .eq('status', 'Active');
    if (admins) {
      const leaders = admins.filter(a => a.role === 'committee_leader' || (a.modules && (a.modules.includes('complaints') || a.modules.includes('abetuta') || a.modules.includes('tikoma'))));
      for (const l of leaders) {
        if (l.phone || l.email) {
          try {
            await notifyViaAPI('decision_proposal_submitted', {
              phone: l.phone || undefined,
              email: l.email || undefined,
              committeeLeaderName: 'የኮሚሽን ጽ/ቤት ሃላፊ (Leader)',
              trackingCode: existing?.tracking_code || id,
              proposalSummary: summary,
            });
          } catch (e) {
            console.error('Failed notifying leader for approval:', e);
          }
        }
      }
    }

    return true;
  },

  requestRevisions: async (id: string, feedbackNotes: string, adminName: string): Promise<boolean> => {
    const { data: existing } = await supabase.from('complaints').select('resolution').eq('id', id).maybeSingle();
    const existingRes = (existing?.resolution as any) || {};

    const { error } = await supabase
      .from('complaints')
      .update({
        status: 'RevisionRequested',
        updated_at: new Date().toISOString(),
        resolution: {
          ...existingRes,
          adminInstructions: feedbackNotes,
          revisionNotes: feedbackNotes,
          requestedBy: adminName,
          requestedAt: new Date().toISOString()
        }
      })
      .eq('id', id);

    if (error) {
      console.error('Error requesting revisions:', error);
      return false;
    }

    // Notify Main Admins that revision is needed
    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('phone, email, role')
      .eq('status', 'Active');
    if (admins) {
      const mainAdmins = admins.filter(a => a.role === 'super_admin' || a.role === 'admin');
      for (const m of mainAdmins) {
        if (m.phone || m.email) {
          try {
            await notifyViaAPI('report_update', {
              phone: m.phone || undefined,
              email: m.email || undefined,
              name: 'ዋና አስተዳዳሪ',
              subject: 'ICODiS — በውሳኔ ሃሳብ ላይ ማስተካከያ ተጠይቋል (Revision Requested)',
              message: `በእዲቴ ሰብሳቢ (${adminName}) ማስተካከያ ተጠይቋል። መመሪያ፡ ${feedbackNotes}`,
              loginPath: '/complaint/login',
            });
          } catch (e) {
            console.error('Failed notifying admin of revision request:', e);
          }
        }
      }
    }

    return true;
  },

  submitResolutionReview: async (id: string, rating: number, feedback: string): Promise<boolean> => {
    const { error } = await supabase
      .from('complaints')
      .update({
        resolution_rating: rating,
        resolution_feedback: feedback
      })
      .eq('id', id);

    if (error) {
      console.error('Error submitting resolution review:', error);
      return false;
    }
    return true;
  },

  acknowledgeDecisionBySubmitter: async (trackingCode: string): Promise<boolean> => {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('complaints')
        .select('*')
        .eq('tracking_code', trackingCode)
        .single();

      if (fetchErr || !existing) {
        console.error('Error fetching complaint for acknowledgment:', fetchErr);
        return false;
      }

      const ackTime = new Date().toISOString();
      const updatedResolution = {
        ...(typeof existing.resolution === 'object' ? existing.resolution : {}),
        acknowledgedBySubmitter: true,
        acknowledgedAt: ackTime,
      };

      const { error: updateErr } = await supabase
        .from('complaints')
        .update({
          resolution: updatedResolution,
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.error('Error updating complaint acknowledgment:', updateErr);
        return false;
      }

      // Notify the የኮሚሽን ጽ/ቤት ሃላፊ (Head of Commission Office) that decision was acknowledged
      try {
        await notifyViaAPI('decision_acknowledged', {
          trackingCode: existing.tracking_code,
          submitterName: existing.name || 'አመልካች',
        });
      } catch (notifyErr) {
        console.error('Failed sending decision_acknowledged notification:', notifyErr);
      }

      return true;
    } catch (err) {
      console.error('Failed to acknowledge decision:', err);
      return false;
    }
  },
};
