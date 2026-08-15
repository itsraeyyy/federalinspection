"use server";

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notifyNewPeriodEnrollment, notifyFinalScoreApproved } from '@/lib/notify';

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
