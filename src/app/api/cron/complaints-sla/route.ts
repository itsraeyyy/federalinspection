import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendSMS } from "@/lib/textbee";
import { notifyReportUpdate } from "@/lib/notify";

export async function GET(request: Request) {
  try {
    // 1. Fetch active complaints/suggestions that haven't been resolved or rejected
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from('complaints')
      .select('id, tracking_code, type, subject, created_at, sla_deadline, sla_notified, reminder_notified, status')
      .not('status', 'in', '("Resolved","Rejected")');

    if (ticketsError || !tickets) {
      return NextResponse.json({ error: ticketsError?.message || "Error fetching tickets" }, { status: 500 });
    }

    const now = Date.now();
    const reminderTickets: typeof tickets = [];
    const escalationTickets: typeof tickets = [];

    for (const ticket of tickets) {
      if (!ticket.sla_deadline) continue; // Skip tickets that haven't started processing yet

      const deadlineMs = new Date(ticket.sla_deadline).getTime();
      const remainingDays = (deadlineMs - now) / (1000 * 60 * 60 * 24);

      // Check if deadline has passed (Escalation to Committee Leader)
      if (remainingDays <= 0) {
        if (!ticket.sla_notified) {
          escalationTickets.push(ticket);
        }
      } 
      // Otherwise check Day 12-14 reminder (3 days or less remaining, but not overdue yet)
      else if (remainingDays <= 3 && remainingDays > 0) {
        if (!ticket.reminder_notified && !ticket.sla_notified) {
          reminderTickets.push(ticket);
        }
      }
    }

    if (reminderTickets.length === 0 && escalationTickets.length === 0) {
      return NextResponse.json({ success: true, message: "No timeline alerts or overdue tickets found.", count: 0 });
    }

    // 2. Fetch Admins and Committee Leaders for alerting
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('admin_profiles')
      .select('phone, email, role, modules, status')
      .eq('status', 'Active');

    if (adminsError || !admins) {
      return NextResponse.json({ error: "Failed fetching admin profiles for notification" }, { status: 500 });
    }

    const complaintsAdmins = admins.filter(a =>
      a.role === 'super_admin' ||
      a.role === 'admin' ||
      (a.modules && (a.modules.includes('complaints') || a.modules.includes('abetuta') || a.modules.includes('tikoma')))
    );

    const committeeLeaders = admins.filter(a =>
      a.role === 'committee_leader' ||
      a.role === 'super_admin'
    );

    const notifiedReminderIds: string[] = [];
    const notifiedEscalationIds: string[] = [];

    // Process 3-Day Reminders to Admins
    for (const ticket of reminderTickets) {
      const typeLabel = ticket.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ';
      const reminderSms = `ማሳሰቢያ፡ የ${typeLabel} መከታተያ ኮድ [${ticket.tracking_code}] የተሰጠው የ15 ቀናት የጊዜ ገደብ ለማለቅ 3 ቀናት ብቻ ይቀሩታል። እባክዎ አስፈላጊውን ማጣራት በአስቸኳይ ያጠናቅቁ።`;

      for (const admin of complaintsAdmins) {
        if (admin.phone) {
          try {
            await sendSMS(admin.phone, reminderSms);
          } catch (e) {
            console.error(`Failed sending reminder SMS to ${admin.phone}:`, e);
          }
        }
        if (admin.email) {
          try {
            await notifyReportUpdate({
              phone: undefined,
              email: admin.email,
              name: 'አስተዳዳሪ (Admin)',
              subject: `ICODiS ማሳሰቢያ፡ የ15 ቀናት የጊዜ ገደብ ለማለቅ 3 ቀናት የቀረው ${typeLabel} (${ticket.tracking_code})`,
              message: reminderSms,
              loginPath: '/dashboard/complaints',
            });
          } catch (e) {
            console.error(`Failed sending reminder email to ${admin.email}:`, e);
          }
        }
      }
      notifiedReminderIds.push(ticket.id);
    }

    // Process Day 15 Escalation Alerts to Committee Leaders
    for (const ticket of escalationTickets) {
      const typeLabel = ticket.type === 'Suggestion' ? 'ጥቆማ' : 'አቤቱታ';
      const escalationSms = `አስቸኳይ ማሳሰቢያ፡ የ${typeLabel} መከታተያ ኮድ [${ticket.tracking_code}] የ15 ቀናት የመፍትሄ የጊዜ ገደብ ተጠናቋል! ጉዳዩ አሁንም ውሳኔ ስላላግኘ እባክዎ አስቸኳይ ክትትል ያድርጉበት።`;

      for (const leader of committeeLeaders) {
        if (leader.phone) {
          try {
            await sendSMS(leader.phone, escalationSms);
          } catch (e) {
            console.error(`Failed sending escalation SMS to ${leader.phone}:`, e);
          }
        }
        if (leader.email) {
          try {
            await notifyReportUpdate({
              phone: undefined,
              email: leader.email,
              name: 'የኮሚቴ ሰብሳቢ (Committee Leader)',
              subject: `ICODiS አስቸኳይ፡ የ15 ቀናት የጊዜ ገደብ ያለቀበት ${typeLabel} (${ticket.tracking_code})`,
              message: escalationSms,
              loginPath: '/dashboard/committee-leader',
            });
          } catch (e) {
            console.error(`Failed sending escalation email to ${leader.email}:`, e);
          }
        }
      }
      notifiedEscalationIds.push(ticket.id);
    }

    // 3. Persist notification flags to database
    if (notifiedReminderIds.length > 0) {
      await supabaseAdmin
        .from('complaints')
        .update({ reminder_notified: true })
        .in('id', notifiedReminderIds);
    }

    if (notifiedEscalationIds.length > 0) {
      await supabaseAdmin
        .from('complaints')
        .update({ sla_notified: true })
        .in('id', notifiedEscalationIds);
    }

    return NextResponse.json({
      success: true,
      message: `Processed timeline alerts: ${notifiedReminderIds.length} reminders sent, ${notifiedEscalationIds.length} escalations sent.`,
      remindersSent: notifiedReminderIds.length,
      escalationsSent: notifiedEscalationIds.length,
    });
  } catch (error: any) {
    console.error('Error executing timeline check cron:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
