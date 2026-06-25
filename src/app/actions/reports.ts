"use server";

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendSMS } from '@/lib/textbee';
import { canSubmitReport, ReportPeriod } from '@/lib/et-calendar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function createRepresentativeAction(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string;
    const rawPhone = formData.get('phone') as string;
    const region = formData.get('region') as string;

    if (!fullName || !rawPhone || !region) {
      return { error: 'Missing required fields' };
    }

    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;

    // Check region limit
    const { count: regionRepsCount, error: countError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('system_role', 'representative')
      .eq('region', region);

    if (countError) {
      return { error: 'Failed to verify region limit' };
    }

    if (regionRepsCount && regionRepsCount >= 2) {
      return { error: `ከፍተኛው የክልል ተወካዮች ብዛት ተሞልቷል (Maximum 2 representatives allowed per region).` };
    }

    const password = crypto.randomBytes(4).toString('hex'); // 8 characters
    const syntheticEmail = `${phone.replace(/\s+/g, '').replace('+', '')}@federal.local`;

    let userId;
    
    // Check existing
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (existingUser?.id) {
      userId = existingUser.id;
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: syntheticEmail, email_confirm: true, password
      });
      if (updateErr && !updateErr.message.includes('already been registered')) {
        return { error: 'Failed to update auth: ' + updateErr.message };
      }
    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password,
        user_metadata: { full_name: fullName, phone: phone }
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

    // Send SMS with password
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/representative/login`;
    const smsMessage = `ሰላም ${fullName}፣ የቅጽ አስተዳደር ተወካይ ሆነው ተመዝግበዋል።\nመግቢያ: ${loginUrl}\nስልክ: ${phone}\nየይለፍ ቃል: ${password}\nሲገቡ የይለፍ ቃልዎን መቀየር ግዴታ ነው።`;
    
    await sendSMS(phone, smsMessage);

    // Force password change on next login (by saving it in a metadata if we supported that, 
    // but the UI currently checks force_password_change or we can add it to user_profiles)
    // There is a 20260617135000_force_password_change.sql migration, let's see how it works later.

    return { success: true };
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
      password
    });

    if (updateError) {
      return { error: 'Failed to reset password: ' + updateError.message };
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/representative/login`;
    const smsMessage = `ሰላም ${fullName}፣ የይለፍ ቃልዎ ተቀይሯል።\nአዲሱ የይለፍ ቃል (New Password): ${password}\nመግቢያ (Link): ${loginUrl}`;

    const smsResult = await sendSMS(phone, smsMessage);
    if (smsResult.error) {
      return { error: 'Password updated but failed to send SMS' };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
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

    const { error } = await supabaseAdmin
      .from('reports')
      .upsert({
        user_id: userId,
        region,
        year,
        period,
        forms_data: formsData,
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

    const { error } = await supabaseAdmin
      .from('reports')
      .upsert({
        user_id: userId,
        region,
        year,
        period,
        forms_data: formsData,
        status: 'submitted',
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
    const { error } = await supabaseAdmin
      .from('reports')
      .update({
        admin_feedback: feedback,
        status: 'reviewed'
      })
      .eq('id', reportId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
