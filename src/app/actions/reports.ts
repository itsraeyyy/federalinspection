"use server";

import crypto from 'crypto';
import { notifyRegistration, notifyPasswordReset, notifyReportUpdate } from '@/lib/notify';
import { canSubmitReport, ReportPeriod } from '@/lib/et-calendar';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@/utils/supabase/server';

export async function createRepresentativeAction(formData: FormData) {
  try {
    const fullName = (formData.get('fullName') as string)?.trim();
    const rawPhone = (formData.get('phone') as string)?.trim();
    const rawEmail = (formData.get('email') as string)?.trim() || undefined;
    const region = (formData.get('region') as string)?.trim();

    if (!fullName || !rawPhone || !region) {
      return { error: 'Missing required fields' };
    }

    const cleanPhone = rawPhone.replace(/\s+/g, '');
    const phone = cleanPhone.startsWith('+') 
      ? cleanPhone 
      : `+251${cleanPhone.replace(/^0+/, '')}`;

    const password = crypto.randomBytes(4).toString('hex'); // 8 characters
    const digitsOnly = phone.replace('+', '');
    const syntheticEmail = `${digitsOnly}@federal.local`;

    let userId: string | null = null;

    // 1. Check if user already exists in public.users by phone variations
    const phoneNoPlus = phone.replace('+', '');
    const phoneWith0 = `0${phone.replace(/^\+251/, '')}`;
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id')
      .in('phone_number', [phone, phoneNoPlus, phoneWith0, rawPhone]);

    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
    }

    if (!userId) {
      // Check auth user using generateLink (bypasses listUsers 50 limit)
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: syntheticEmail,
      });
      if (linkData?.user) {
        userId = linkData.user.id;
      }
    }

    if (userId) {
      // User exists — update password and user_metadata
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: syntheticEmail,
        email_confirm: true,
        password: password,
        user_metadata: {
          full_name: fullName,
          phone: phone,
          requires_password_change: true,
          force_password_change: true
        }
      });
      if (updateErr) {
        console.error("Failed to update rep password:", updateErr);
        return { error: 'Failed to update user password: ' + updateErr.message };
      }
    } else {
      // Create new Auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: password,
        user_metadata: {
          full_name: fullName,
          phone: phone,
          requires_password_change: true,
          force_password_change: true
        }
      });

      if (authError) {
        if (authError.message.includes('already') || authError.message.includes('registered') || authError.message.includes('exists')) {
          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({ type: 'magiclink', email: syntheticEmail });
          if (linkData?.user) {
            userId = linkData.user.id;
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              email: syntheticEmail,
              email_confirm: true,
              password: password,
              user_metadata: { full_name: fullName, phone: phone, requires_password_change: true, force_password_change: true }
            });
          } else {
            return { error: authError.message };
          }
        } else {
          return { error: authError.message };
        }
      } else {
        userId = authData.user.id;
      }
    }

    // 2. Upsert public.users table
    await supabaseAdmin
      .from('users')
      .upsert({ id: userId, phone_number: phone, full_name: fullName });

    // 3. Upsert user_profiles table with role and region
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        system_role: 'representative',
        region: region
      }, { onConflict: 'user_id' });

    if (profileError) {
      return { error: 'Failed to update profile: ' + profileError.message };
    }

    // 4. Notify representative (SMS first → email fallback)
    const notifyResult = await notifyRegistration({
      phone,
      email: rawEmail,
      name: fullName,
      password,
      role: 'representative',
    });

    if (!notifyResult.smsDelivered && !notifyResult.emailDelivered) {
      return { success: true, smsDelivered: false, tempPassword: password, phone };
    }

    return { success: true, smsDelivered: notifyResult.smsDelivered, emailDelivered: notifyResult.emailDelivered };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteRepresentativeAction(userId: string) {
  try {
    // Delete from auth.admin (cascades to public.users and user_profiles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return { error: error.message };
    }

    // Fallback: also try to delete from public.users manually just in case
    await supabaseAdmin.from('users').delete().eq('id', userId);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function resetRepresentativePasswordAction(userId: string, phone: string, fullName: string) {
  try {
    const password = crypto.randomBytes(4).toString('hex'); // 8 characters

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { requires_password_change: true }
    });

    if (updateError) {
      return { error: 'Failed to reset password: ' + updateError.message };
    }

    const notifyResult = await notifyPasswordReset({
      phone,
      name: fullName,
      password,
      role: 'representative',
    });

    if (!notifyResult.smsDelivered && !notifyResult.emailDelivered) {
      return { success: true, smsDelivered: false, tempPassword: password };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

function getPeriodCategory(period: string): string {
  if (period.includes('1ኛ')) return 'q1';
  if (period.includes('2ኛ')) return 'q2';
  if (period.includes('3ኛ')) return 'q3';
  if (period.includes('4ኛ')) return 'q4';
  return 'q3';
}

export async function saveReportFormAction(
  userId: string,
  region: string,
  year: number,
  period: ReportPeriod,
  formsData: any
) {
  try {
    // Check if period is valid
    if (!canSubmitReport(period)) {
      return { error: 'ሪፖርት ማቅረቢያ ጊዜ አይደለም። (Not in reporting window)' };
    }

    // Fetch current form schemas to snapshot
    const { data: schemas } = await supabaseAdmin.from('form_schemas').select('*');

    const payload = {
      user_id: userId,
      submitter_id: userId,
      title: `የ${region} ክልል ${period} ሪፖርት`,
      report_type: 'numerical',
      budget_year: String(year),
      period_category: getPeriodCategory(period),
      submitter_level: 'region',
      region_name: region,
      region,
      year,
      period,
      forms_data: formsData,
      numerical_data: formsData,
      schema_snapshot: schemas || [],
      status: 'draft',
      updated_at: new Date().toISOString()
    };

    // 1. Check if report already exists for (region, year, period)
    const { data: existingReports } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('region', region)
      .eq('year', year)
      .eq('period', period)
      .limit(1);

    if (existingReports && existingReports.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('reports')
        .update(payload)
        .eq('id', existingReports[0].id);

      if (updateError) return { error: updateError.message };
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('reports')
        .insert(payload);

      if (insertError) return { error: insertError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function submitReportAction(
  userId: string,
  region: string,
  year: number,
  period: ReportPeriod,
  formsData: any
) {
  try {
    if (!canSubmitReport(period)) {
      return { error: 'ሪፖርት ማቅረቢያ ጊዜ አይደለም። (Not in reporting window)' };
    }

    // Fetch current form schemas to snapshot
    const { data: schemas } = await supabaseAdmin.from('form_schemas').select('*');

    const payload = {
      user_id: userId,
      submitter_id: userId,
      title: `የ${region} ክልል ${period} ሪፖርት`,
      report_type: 'numerical',
      budget_year: String(year),
      period_category: getPeriodCategory(period),
      submitter_level: 'region',
      region_name: region,
      region,
      year,
      period,
      forms_data: formsData,
      numerical_data: formsData,
      schema_snapshot: schemas || [],
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Check if report already exists for (region, year, period)
    const { data: existingReports } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('region', region)
      .eq('year', year)
      .eq('period', period)
      .limit(1);

    if (existingReports && existingReports.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('reports')
        .update(payload)
        .eq('id', existingReports[0].id);

      if (updateError) return { error: updateError.message };
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('reports')
        .insert(payload);

      if (insertError) return { error: insertError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function provideAdminFeedbackAction(
  reportId: string,
  feedback: string
) {
  try {
    const { data: report, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('region, user_id')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) return { error: 'Failed to fetch report details' };

    const { error } = await supabaseAdmin
      .from('reports')
      .update({
        admin_feedback: feedback,
        status: 'reviewed'
      })
      .eq('id', reportId);

    if (error) return { error: error.message };

    // Send SMS notification to representative
    if (report.user_id) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('phone_number, full_name')
        .eq('id', report.user_id)
        .single();

      if (user && (user.phone_number || (user as any).email)) {
        await notifyReportUpdate({
          phone: user.phone_number,
          email: (user as any).email,
          name: user.full_name || 'ተወካይ',
          subject: 'ICODiS — የሪፖርት ግብረ መልስ',
          message: `ለ${report.region} ክልል ባስገቡት ሪፖርት ላይ ግብረ መልስ ተሰጥቷል። እባክዎ ዳሽቦርድዎን ይጎብኙ።`,
          loginPath: '/representative/login',
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function approveReportAction(reportId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('reports')
      .update({
        status: 'approved'
      })
      .eq('id', reportId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function uploadReportAttachmentAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const year = (formData.get('year') as string) || 'general';
    const region = (formData.get('region') as string) || 'all';

    if (!file || file.size === 0) {
      return { error: 'No file provided' };
    }

    const sanitizeSegment = (str: string) => {
      return encodeURIComponent((str || '').trim())
        .replace(/%/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_') || 'default';
    };

    const safeYear = sanitizeSegment(year);
    const safeRegion = sanitizeSegment(region);
    const fileExt = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${safeYear}/${safeRegion}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || 'application/octet-stream';

    let lastError: string = '';

    // 1. Try server client with user session
    try {
      const serverSupabase = await createClient();
      const { error: userUploadError } = await serverSupabase.storage
        .from('report_attachments')
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!userUploadError) {
        const { data } = serverSupabase.storage
          .from('report_attachments')
          .getPublicUrl(storagePath);
        if (data?.publicUrl) return { url: data.publicUrl };
      } else {
        lastError = userUploadError.message;
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
    }

    // 2. Try supabaseAdmin with candidate buckets
    const candidateBuckets = ['report_attachments', 'documents', 'public_files', 'complaints'];
    for (const bucket of candidateBuckets) {
      try {
        const { error: adminUploadError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(storagePath, buffer, {
            contentType,
            upsert: true,
          });

        if (!adminUploadError) {
          const { data } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(storagePath);
          if (data?.publicUrl) return { url: data.publicUrl };
        } else {
          lastError = adminUploadError.message;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    return { error: lastError || 'Failed to upload attachment' };
  } catch (err: any) {
    return { error: err.message || 'Unknown upload error' };
  }
}

export async function uploadFeedbackAttachmentAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'feedback_attachments';

    if (!file || file.size === 0) {
      return { error: 'No file provided' };
    }

    const fileExt = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || 'application/octet-stream';

    let lastError: string = '';

    // 1. Try server client with user session
    try {
      const serverSupabase = await createClient();
      const { error: userUploadError } = await serverSupabase.storage
        .from('report_attachments')
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!userUploadError) {
        const { data } = serverSupabase.storage
          .from('report_attachments')
          .getPublicUrl(storagePath);
        if (data?.publicUrl) return { url: data.publicUrl };
      } else {
        lastError = userUploadError.message;
      }
    } catch (e: any) {
      lastError = e?.message || String(e);
    }

    // 2. Try supabaseAdmin with candidate buckets
    const candidateBuckets = ['report_attachments', 'documents', 'public_files', 'complaints'];
    for (const bucket of candidateBuckets) {
      try {
        const { error: adminUploadError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(storagePath, buffer, {
            contentType,
            upsert: true,
          });

        if (!adminUploadError) {
          const { data } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(storagePath);
          if (data?.publicUrl) return { url: data.publicUrl };
        } else {
          lastError = adminUploadError.message;
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    return { error: lastError || 'Failed to upload attachment' };
  } catch (err: any) {
    return { error: err.message || 'Upload error' };
  }
}

