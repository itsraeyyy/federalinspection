"use server";

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notifyNewPeriodEnrollment, notifyFinalScoreApproved } from '@/lib/notify';
import { normalizePhoneToE164 } from '@/app/actions/auth';

export async function createAssessmentPeriodAction(periodName: string, year: string, periodHalf: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('assessment_periods')
      .insert({ name: periodName, year, period_half: periodHalf })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { error: error.message };
  }
}

/** Fetch all unique users in the system for assessment assignment */
export async function getExistingAssessmentUsersAction() {
  try {
    // 1. Fetch all users from public.users
    const { data: usersData, error: usersErr } = await supabaseAdmin
      .from('users')
      .select('id, full_name, phone_number')
      .order('full_name', { ascending: true });

    if (usersErr) throw usersErr;

    // 2. Fetch period_members for roles
    const { data: membersData } = await supabaseAdmin
      .from('period_members')
      .select('user_id, role, created_at')
      .order('created_at', { ascending: false });

    const seenMap = new Map<string, { user_id: string; full_name: string; phone_number: string; last_role: string }>();

    for (const u of (usersData || [])) {
      if (!u.full_name || u.full_name.trim().toLowerCase().startsWith('rep')) continue;
      seenMap.set(u.id, {
        user_id: u.id,
        full_name: u.full_name,
        phone_number: u.phone_number || '',
        last_role: 'regular',
      });
    }

    for (const m of (membersData || [])) {
      if (seenMap.has(m.user_id)) {
        const existing = seenMap.get(m.user_id)!;
        if (existing.last_role === 'regular' && m.role) {
          existing.last_role = m.role;
        }
      }
    }

    const userList = Array.from(seenMap.values()).sort((a, b) => 
      a.full_name.localeCompare(b.full_name)
    );

    return { success: true, users: userList };
  } catch (error: any) {
    console.error('getExistingAssessmentUsersAction error:', error);
    return { error: error.message, users: [] };
  }
}

/** Add existing users to a new assessment period and notify them (no new account created) */
export async function addExistingUsersToNewPeriodAction(opts: {
  periodId: string;
  periodName: string;
  users: { user_id: string; full_name: string; phone_number: string; email?: string; role: string }[];
}) {
  const results: { user_id: string; success: boolean; notified: boolean }[] = [];

  for (const user of opts.users) {
    try {
      // Upsert into period_members (no-op if already enrolled)
      const { error } = await supabaseAdmin
        .from('period_members')
        .upsert({
          period_id: opts.periodId,
          user_id: user.user_id,
          role: user.role,
        }, { onConflict: 'period_id, user_id' });

      if (error) {
        results.push({ user_id: user.user_id, success: false, notified: false });
        continue;
      }

      // Notify the user
      const notifyRes = await notifyNewPeriodEnrollment({
        phone: user.phone_number,
        email: user.email,
        name: user.full_name,
        periodName: opts.periodName,
      });

      results.push({ user_id: user.user_id, success: true, notified: notifyRes.success });
    } catch (err) {
      results.push({ user_id: user.user_id, success: false, notified: false });
    }
  }

  return { results };
}

/** Send SMS notification to user when their final score out of 100 is approved */
export async function notifyFinalApprovalAction(opts: {
  periodId: string;
  userId: string;
  finalScore: number;
}) {
  try {
    const { data: period } = await supabaseAdmin
      .from('assessment_periods')
      .select('name')
      .eq('id', opts.periodId)
      .single();

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('full_name, phone_number')
      .eq('id', opts.userId)
      .single();

    if (!user || !user.phone_number) {
      return { success: false, error: 'User details or phone not found' };
    }

    const res = await notifyFinalScoreApproved({
      phone: user.phone_number,
      name: user.full_name,
      periodName: period?.name || 'ምዘና',
      finalScore: opts.finalScore
    });

    return { success: res.success, notified: res.smsDelivered };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send notification' };
  }
}

/** Update assessment user details */
export async function updateAssessmentUserAction(data: {
  userId: string;
  fullName: string;
  phone: string;
  role?: string;
  gender?: string;
  institution?: string;
  govResponsibility?: string;
  partyResponsibility?: string;
}) {
  try {
    const cleanPhone = normalizePhoneToE164(data.phone);

    // Update public.users
    const { error: userErr } = await supabaseAdmin
      .from('users')
      .update({
        full_name: data.fullName,
        phone_number: cleanPhone,
      })
      .eq('id', data.userId);

    if (userErr) throw userErr;

    // Update Auth user metadata
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      user_metadata: {
        full_name: data.fullName,
        phone: cleanPhone,
      }
    });

    // Upsert into user_profiles
    const profileUpdate: any = {};
    if (data.gender) profileUpdate.gender = data.gender;
    if (data.institution) profileUpdate.institution = data.institution;
    if (data.govResponsibility) profileUpdate.gov_responsibility = data.govResponsibility;
    if (data.partyResponsibility) profileUpdate.party_responsibility = data.partyResponsibility;

    if (Object.keys(profileUpdate).length > 0) {
      await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: data.userId,
          ...profileUpdate,
        }, { onConflict: 'user_id' });
    }

    // Update period_members role if specified
    if (data.role) {
      await supabaseAdmin
        .from('period_members')
        .update({ role: data.role })
        .eq('user_id', data.userId);
    }

    return { success: true };
  } catch (err: any) {
    console.error('updateAssessmentUserAction error:', err);
    return { success: false, error: err?.message || 'ተጠቃሚውን ማዘመን አልተሳካም።' };
  }
}

/** Delete an assessment user from database and Auth */
export async function deleteAssessmentUserAction(userId: string) {
  try {
    if (!userId) return { success: false, error: 'User ID is required' };

    // 1. Delete from period_members
    await supabaseAdmin.from('period_members').delete().eq('user_id', userId);

    // 2. Delete from user_profiles
    await supabaseAdmin.from('user_profiles').delete().eq('user_id', userId);

    // 3. Delete from users table
    await supabaseAdmin.from('users').delete().eq('id', userId);

    // 4. Delete from Supabase Auth
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) console.warn('Warning deleting auth user:', authErr.message);

    return { success: true, message: 'ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል!' };
  } catch (err: any) {
    console.error('deleteAssessmentUserAction error:', err);
    return { success: false, error: err?.message || 'ተጠቃሚውን መሰረዝ አልተሳካም።' };
  }
}

