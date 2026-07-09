import { supabase } from '../lib/supabaseClient';
import { Complaint, ComplaintStatus } from '../types';
import { formatECDate, formatECDateTime } from '../lib/date-formatter';
import { smsService } from './sms';

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
    name: string;
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
        const filePath = `submissions/${trackingCode}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('complaints')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('complaints')
            .getPublicUrl(filePath);

          attachments.push({
            id: crypto.randomUUID(),
            filename: file.name,
            fileType: file.type,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            url: urlData.publicUrl,
          });
        }
      }
    }

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        name: formData.name,
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
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting complaint:', error.message, error.details, error.hint, error);
      return null;
    }

    if (formData.phone) {
      smsService.sendSMS(
        formData.phone,
        `የእርስዎ ${formData.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'} በተሳካ ሁኔታ ቀርቧል። መከታተያ ኮድ: ${trackingCode}`
      );
    }

    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('phone, modules, role')
      .eq('status', 'Active')
      .not('phone', 'is', null)
      .neq('phone', '');

    if (admins) {
      const targetAdmins = admins.filter(a => 
        a.role === 'super_admin' || 
        (a.modules && (a.modules.includes('complaints') || a.modules.includes('abetuta') || a.modules.includes('tikoma')))
      );
      
      const adminMessage = `አዲስ ${formData.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'} ገብቷል። መከታተያ ኮድ: ${trackingCode}`;
      for (const admin of targetAdmins) {
        if (admin.phone) {
          smsService.sendSMS(admin.phone, adminMessage);
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
    }

    if (newStatus === 'Resolved' || newStatus === 'Rejected') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = adminName;

      if (resolution) {
        let resolutionAttachments: any[] = [];
        if (resolution.files && resolution.files.length > 0) {
          for (const file of resolution.files) {
            const filePath = `resolutions/${id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('complaints')
              .upload(filePath, file);

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('complaints')
                .getPublicUrl(filePath);

              resolutionAttachments.push({
                id: crypto.randomUUID(),
                filename: file.name,
                fileType: file.type,
                fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                url: urlData.publicUrl,
              });
            }
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
      .select('phone, type')
      .single();

    if (error) {
      console.error('Error updating complaint status:', error);
      return false;
    }

    if (updatedComplaint && updatedComplaint.phone) {
      let statusMsg = '';
      if (newStatus === 'Processing') {
         statusMsg = 'በመታየት ላይ ነው';
      } else if (newStatus === 'Resolved') {
         statusMsg = 'ውሳኔ አግኝቷል';
      } else if (newStatus === 'Rejected') {
         statusMsg = 'ውድቅ ተደርጓል';
      }
      
      if (statusMsg) {
         smsService.sendSMS(
           updatedComplaint.phone,
           `የእርስዎ ${updatedComplaint.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ'} ${statusMsg}።`
         );
      }
    }

    return true;
  },

  assignCommittee: async (id: string, committeeName: string): Promise<boolean> => {
    const { error } = await supabase
      .from('complaints')
      .update({ assigned_committee: committeeName })
      .eq('id', id);

    if (error) {
      console.error('Error assigning committee:', error);
      return false;
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
