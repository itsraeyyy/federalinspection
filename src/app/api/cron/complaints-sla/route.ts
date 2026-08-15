import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendSMS } from "@/lib/textbee";
import { sendEmail } from "@/notifications/email-service";
import { buildSlaReminderTemplates } from "@/notifications/templates";

export async function GET(request: Request) {
  // Simple auth check for the cron job (e.g., using a secret token in header or search params)
  const authHeader = request.headers.get("Authorization");
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch active complaints/suggestions that haven't been resolved or rejected
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from('complaints')
      .select('id, tracking_code, type, subject, created_at, resolution, assigned_committee, group_members, status')
      .not('status', 'in', '("Resolved","Rejected")');

    if (ticketsError || !tickets) {
      return NextResponse.json({ error: ticketsError?.message || "Error fetching tickets" }, { status: 500 });
    }

    const now = Date.now();
    let remindersSentCount = 0;

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

    for (const ticket of tickets) {
      const slaDeadline = (ticket.resolution as any)?.slaDeadline;
      const deadlineMs = slaDeadline
        ? new Date(slaDeadline).getTime()
        : new Date(ticket.created_at).getTime() + 15 * 24 * 60 * 60 * 1000;

      const remainingMs = deadlineMs - now;
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

      // Trigger reminders at 5 days, 3 days, 1 day left, or overdue (remainingDays <= 0)
      if (remainingDays === 5 || remainingDays === 3 || remainingDays === 1 || remainingDays <= 0) {
        remindersSentCount++;

        // A. Notify Complaint Accepters / Admins (WITH LINK)
        const adminTpl = buildSlaReminderTemplates({
          trackingCode: ticket.tracking_code,
          daysLeft: remainingDays,
          role: 'admin',
        });
        for (const admin of complaintsAdmins) {
          if (admin.phone) {
            try { await sendSMS(admin.phone, adminTpl.sms); } catch (e) {}
          }
          if (admin.email) {
            try { await sendEmail(admin.email, `ICODiS ማሳሰቢያ፡ በአቤቱታ ${ticket.tracking_code} ላይ ውሳኔ ለመስጠት ${remainingDays} ቀናት ቀሩ`, adminTpl.html, adminTpl.text); } catch (e) {}
          }
        }

        // B. Notify Committee Leaders (WITH LINK)
        const leaderTpl = buildSlaReminderTemplates({
          trackingCode: ticket.tracking_code,
          daysLeft: remainingDays,
          role: 'leader',
        });
        for (const leader of committeeLeaders) {
          if (leader.phone) {
            try { await sendSMS(leader.phone, leaderTpl.sms); } catch (e) {}
          }
          if (leader.email) {
            try { await sendEmail(leader.email, `ICODiS ማሳሰቢያ፡ በአቤቱታ ${ticket.tracking_code} ላይ ውሳኔ ለማጽደቅ ${remainingDays} ቀናት ቀሩ`, leaderTpl.html, leaderTpl.text); } catch (e) {}
          }
        }

        // C. Notify Committee Group Members (WITHOUT LINK)
        const memberTpl = buildSlaReminderTemplates({
          trackingCode: ticket.tracking_code,
          daysLeft: remainingDays,
          role: 'member',
          committeeName: ticket.assigned_committee || undefined,
        });

        const membersList: any[] = (ticket.resolution as any)?.committeeMembers || ticket.group_members || [];
        for (const member of membersList) {
          const memberPhone = typeof member === 'object' ? member.phone : (member.includes('(') ? member.split('(')[1]?.replace(')', '').trim() : undefined);
          const memberEmail = typeof member === 'object' ? member.email : undefined;

          if (memberPhone) {
            try { await sendSMS(memberPhone, memberTpl.sms); } catch (e) {}
          }
          if (memberEmail) {
            try { await sendEmail(memberEmail, `ICODiS ማሳሰቢያ፡ በኮሚቴዎ አቤቱታ ${ticket.tracking_code} ላይ ${remainingDays} ቀናት ቀሩ`, memberTpl.html, memberTpl.text); } catch (e) {}
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed SLA reminders. Sent notifications for ${remindersSentCount} tickets.`,
      remindersSentCount,
    });
  } catch (error: any) {
    console.error('Error executing SLA check cron:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
