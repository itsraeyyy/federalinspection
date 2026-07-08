import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/textbee";
import { getCurrentPeriod, getCurrentFiscalYear, getCurrentEtDate } from "@/lib/et-calendar";

export async function GET(request: Request) {
  // Simple auth check for the cron job (e.g., using a secret token in header or search params)
  const authHeader = request.headers.get("Authorization");
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // 1. Check if today is a reporting day
    const period = getCurrentPeriod();
    const { day } = getCurrentEtDate();
    
    // Only send reminders on the 1st day of submission (20th) and the last day (25th)
    if (period === 'NONE' || (day !== 20 && day !== 25)) {
      return NextResponse.json({ message: "Not a reminder day." });
    }

    // 2. Fetch all representatives
    const { data: reps, error: repsError } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        user_id,
        region,
        users:user_id ( full_name, phone_number )
      `)
      .eq('system_role', 'representative');

    if (repsError || !reps) {
      throw new Error(repsError?.message || "No reps found");
    }

    // 3. Fetch all reports already submitted for this period
    const currentYear = getCurrentFiscalYear();
    const { data: submittedReports, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('user_id')
      .eq('year', currentYear)
      .eq('period', period)
      .in('status', ['submitted', 'reviewed', 'approved']);

    if (reportsError) {
      throw new Error(reportsError.message);
    }

    const submittedUserIds = new Set(submittedReports?.map(r => r.user_id) || []);

    // 4. Send SMS to reps who haven't submitted yet
    const notificationsSent = [];
    
    for (const rep of reps) {
      if (!submittedUserIds.has(rep.user_id)) {
        const phone = (rep.users as any)?.phone_number;
        const name = (rep.users as any)?.full_name;

        if (phone) {
          const message = `ሰላም ${name}፣ የ ${currentYear} በጀት ዓመት ${period} ማቅረቢያ ጊዜ ደርሷል። እባክዎ ወደ ሲስተሙ በመግባት ሪፖርትዎን ይሙሉ (Please submit your report).`;
          
          await sendSMS(phone, message);
          notificationsSent.push(phone);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${notificationsSent.length} reminders.`,
      period
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
