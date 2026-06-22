import { supabase } from '../lib/supabaseClient';
import { Complaint, ComplaintStatus } from '../types';

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
    requestedResolution: item.requested_resolution,
    attachments: item.attachments || [],
    date: new Date(item.created_at).toLocaleDateString('am-ET'),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    processedAt: item.processed_at,
    resolvedAt: item.resolved_at,
    processedBy: item.processed_by,
    resolvedBy: item.resolved_by,
    status: item.status,
    resolution: item.resolution,
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
    requestedResolution?: string;
    files?: File[];
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
        requested_resolution: formData.requestedResolution || null,
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

    const { error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating complaint status:', error);
      return false;
    }
    return true;
  },
};
