import { supabase } from '../lib/supabaseClient';
import { Complaint, ComplaintStatus } from '../types';
import { formatECDate, formatECDateTime } from '../lib/date-formatter';
import { smsService } from './sms';
import { notifyComplaintSubmitted, notifyComplaintStatusUpdate, notifyReportUpdate } from '../lib/notify';

function generateTrackingCode(): string {
  const prefix = 'TRK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function mapRowToComplaint(item: any): Complaint {
  return {
    id: item.id,
    trackingCode: item.tracking_code || '',
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
    attachments: item.attachments || [],
    date: formatECDate(item.created_at),
    createdAt: formatECDateTime(item.created_at),
    updatedAt: item.updated_at ? formatECDateTime(item.updated_at) : undefined,
    processedAt: item.processed_at ? formatECDateTime(item.processed_at) : undefined,
    resolvedAt: item.resolved_at ? formatECDateTime(item.resolved_at) : undefined,
    processedBy: item.processed_by,
    resolvedBy: item.resolved_by,
    status: item.status,
    resolution: item.resolution,
    groupMembers: item.group_members || [],
    assignedCommittee: item.assigned_committee,
    serviceName: item.service_name,
    resolutionRating: item.resolution_rating,
    resolutionFeedback: item.resolution_feedback,
    workflowStep: item.workflow_step || (item.status === 'Accepted' ? 2 : item.status === 'Processing' ? 3 : item.status === 'PendingApproval' ? 4 : item.status === 'Resolved' || item.status === 'Rejected' ? 5 : 1),
    adminInstructions: item.admin_instructions || undefined,
    decisionIdeaSummary: item.decision_idea_summary || undefined,
    decisionIdeaFiles: item.decision_idea_files || [],
    slaDeadline: item.sla_deadline ? formatECDateTime(item.sla_deadline) : undefined,
    slaNotified: item.sla_notified || false,
    reminderNotified: item.reminder_notified || false,
  };
}

export const complaintService = {
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
    return mapRowToComplaint(data);
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
    return mapRowToComplaint(data);
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

        const { data: urlData } = supabase.storage
          .from('complaints')
          .getPublicUrl(filePath);

        attachments.push({
          id: crypto.randomUUID(),
          filename: file.name,
          fileType: file.type || (fileExt ? fileExt.toUpperCase() : 'UNKNOWN'),
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          url: urlData.publicUrl,
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
        await notifyComplaintSubmitted({
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
      const adminMessage = `አዲስ ${typeLabel} ተመዝግቧል። መከታተያ ኮድ፡ ${trackingCode}`;

      for (const admin of targetAdmins) {
        if (admin.phone || admin.email) {
          try {
            await notifyReportUpdate({
              phone: admin.phone || undefined,
              email: admin.email || undefined,
              name: 'አስተዳዳሪ (Admin)',
              subject: `ICODiS — አዲስ ${typeLabel}`,
              message: adminMessage,
              loginPath: '/dashboard',
            });
          } catch (notifyErr) {
            console.error('Failed to notify admin of new complaint:', notifyErr);
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
    const updates: any = { status: newStatus };

    if (newStatus === 'Processing') {
      updates.processed_at = new Date().toISOString();
      updates.processed_by = adminName;
      updates.workflow_step = 3;
    }

    if (newStatus === 'PendingApproval') {
      updates.workflow_step = 4;
      updates.processed_by = adminName;
      if (resolution?.message) {
        updates.decision_idea_summary = resolution.message;
      }
    }

    if (newStatus === 'Resolved' || newStatus === 'Rejected') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = adminName;
      updates.workflow_step = 5;

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

            const { data: urlData } = supabase.storage
              .from('complaints')
              .getPublicUrl(filePath);

            resolutionAttachments.push({
              id: crypto.randomUUID(),
              filename: file.name,
              fileType: file.type || (fileExt ? fileExt.toUpperCase() : 'UNKNOWN'),
              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              url: urlData.publicUrl,
            });
          }
        }

        updates.resolution = {
          message: resolution.message,
          attachments: resolutionAttachments,
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
              await notifyReportUpdate({
                phone: l.phone || undefined,
                email: l.email || undefined,
                name: 'የኮሚቴ ሰብሳቢ (Leader)',
                subject: 'ICODiS — የውሳኔ ሀሳብ ለጽድቅ ቀርቧል (Pending Approval)',
                message: `ለማጽደቅ የቀረበ አዲስ የውሳኔ ሀሳብ አለ። መከታተያ ኮድ፡ [${updatedComplaint?.tracking_code || id}]። እባክዎ በመግባት ውሳኔውን ያረጋግጡና ያጽድቁ።`,
                loginPath: '/dashboard/committee-leader',
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
        await notifyComplaintStatusUpdate({
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

  assignCommittee: async (id: string, committeeName: string): Promise<boolean> => {
    const { error } = await supabase
  acceptComplaintByAdmin: async (id: string, adminName: string): Promise<boolean> => {
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'Accepted', workflow_step: 2, processed_by: adminName })
      .eq('id', id);
    if (error) {
      console.error('Error accepting complaint by admin:', error);
      return false;
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
            await notifyReportUpdate({
              phone: l.phone || undefined,
              email: l.email || undefined,
              name: 'የኮሚቴ ሰብሳቢ (Leader)',
              subject: 'ICODiS — አዲስ ጉዳይ ለኮሚቴ ምደባ (Awaiting Assignment)',
              message: msg,
              loginPath: '/dashboard/committee-leader',
            });
          } catch (e) {
            console.error('Failed notifying leader:', e);
          }
        }
      }
    }

    return true;
  },

  startProcessingByLeader: async (id: string, leaderName: string, committeeName: string): Promise<boolean> => {
    const { error } = await supabase
      .from('complaints')
      .update({
        assigned_committee: committeeName,
        status: 'Processing',
        workflow_step: 3,
        processed_by: leaderName,
        processed_at: new Date().toISOString(),
        sla_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error starting processing by leader:', error);
      return false;
    }
    return true;
  },

  submitDecisionIdea: async (id: string, summary: string, files?: File[], leaderName?: string): Promise<boolean> => {
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

        const { data: urlData } = supabase.storage.from('complaints').getPublicUrl(filePath);
        decisionAttachments.push({
          id: crypto.randomUUID(),
          filename: file.name,
          fileType: file.type || (fileExt ? fileExt.toUpperCase() : 'UNKNOWN'),
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          url: urlData.publicUrl,
        });
      }
    }

    const { error } = await supabase
      .from('complaints')
      .update({
        decision_idea_summary: summary,
        decision_idea_files: decisionAttachments,
        status: 'PendingApproval',
        workflow_step: 4,
        processed_by: leaderName || null,
        updated_at: new Date().toISOString()
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
            await notifyReportUpdate({
              phone: l.phone || undefined,
              email: l.email || undefined,
              name: 'የኮሚቴ ሰብሳቢ (Leader)',
              subject: 'ICODiS — የውሳኔ ሀሳብ ለጽድቅ ቀርቧል (Pending Approval)',
              message: `ለማጽደቅ የቀረበ አዲስ የውሳኔ ሀሳብ አለ። እባክዎ በመግባት ውሳኔውን ያረጋግጡና ያጽድቁ።`,
              loginPath: '/dashboard/committee-leader',
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
    const { error } = await supabase
      .from('complaints')
      .update({
        status: 'RevisionRequested',
        workflow_step: 3,
        admin_instructions: feedbackNotes,
        updated_at: new Date().toISOString()
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
            await notifyReportUpdate({
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
};
