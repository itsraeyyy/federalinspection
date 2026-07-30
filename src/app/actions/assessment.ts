"use server";

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notifyNewPeriodEnrollment } from '@/lib/notify';

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

/** Fetch all unique users who are members in any assessment period (for re-use in new periods) */
export async function getExistingAssessmentUsersAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('period_members')
      .select('user_id, role, users(id, full_name, phone_number)');

    if (error) throw error;

    // Deduplicate by user_id
    const seen = new Map<string, any>();
    for (const row of (data || [])) {
      const u = row.users as any;
      if (!u) continue;
      if (!seen.has(row.user_id)) {
        seen.set(row.user_id, {
          user_id: row.user_id,
          full_name: u.full_name,
          phone_number: u.phone_number,
          email: undefined,
          last_role: row.role,
        });
      }
    }

    return { success: true, users: Array.from(seen.values()) };
  } catch (error: any) {
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
