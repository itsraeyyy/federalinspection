"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
