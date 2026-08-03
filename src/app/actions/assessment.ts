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

/** Fetch all unique users who are registered assessment users (only users present in period_members) */
export async function getExistingAssessmentUsersAction() {
  try {
    const { data: membersData, error: membersErr } = await supabaseAdmin
      .from('period_members')
      .select('user_id, role, created_at, users(id, full_name, phone_number)')
      .order('created_at', { ascending: false });

    if (membersErr) throw membersErr;

    const seenMap = new Map<string, { user_id: string; full_name: string; phone_number: string; last_role: string }>();

    for (const m of (membersData || [])) {
      const u = m.users as any;
      if (!u || !u.full_name) continue;

      if (u.full_name.trim().toLowerCase().startsWith('rep')) continue;

      if (!seenMap.has(m.user_id)) {
        seenMap.set(m.user_id, {
          user_id: m.user_id,
          full_name: u.full_name,
          phone_number: u.phone_number,
          last_role: m.role || 'regular',
        });
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
