"use server";

import crypto from 'crypto';
import { notifyRegistration, notifyPasswordReset, notifyReportUpdate } from '@/lib/notify';
import { canSubmitReport, ReportPeriod } from '@/lib/et-calendar';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function createRepresentativeAction(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string;
    const rawPhone = formData.get('phone') as string;
    const rawEmail = (formData.get('email') as string)?.trim() || undefined;
    const region = formData.get('region') as string;

    if (!fullName || !rawPhone || !region) {
      return { error: 'Missing required fields' };
    }

    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;


    const password = crypto.randomBytes(4).toString('hex'); // 8 characters
    const syntheticEmail = `${phone.replace(/\s+/g, '').replace('+', '')}@federal.local`;

    let userId: string | null = null;

    // Check if user already exists in auth.users by email
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = usersList?.users?.find(u => u.email === syntheticEmail);

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: syntheticEmail,
        email_confirm: true,
        password: password,
        user_metadata: { full_name: fullName, phone: phone, requires_password_change: true }
      });
      if (updateErr) {
        console.error("Failed to update rep password:", updateErr);
        return { error: 'Failed to update user password: ' + updateErr.message };
      }
    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: password,
        user_metadata: { full_name: fullName, phone: phone, requires_password_change: true }
      });
      if (authError) return { error: authError.message };
      userId = authData.user.id;
    }

    // Upsert user
    await supabaseAdmin
      .from('users')
      .upsert({ id: userId, phone_number: phone, full_name: fullName });

    // Update user profile with role and region
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: userId,
        system_role: 'representative',
        region: region
      });

    if (profileError) {
      return { error: 'Failed to update profile: ' + profileError.message };
    }

    // Notify representative (SMS first → email fallback)
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

    const { error } = await supabaseAdmin
      .from('reports')
      .upsert({
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
        status: 'draft'
      }, {
        onConflict: 'region, year, period'
      });

    if (error) return { error: error.message };
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

    const { error } = await supabaseAdmin
      .from('reports')
      .upsert({
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
        status: 'submitted_to_federal',
        submitted_at: new Date().toISOString()
      }, {
        onConflict: 'region, year, period'
      });

    if (error) return { error: error.message };
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
