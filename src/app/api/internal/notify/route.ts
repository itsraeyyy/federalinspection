import { NextRequest, NextResponse } from 'next/server';
import {
  notifyComplaintSubmitted,
  notifyComplaintStatusUpdate,
  notifyNewComplaintAdminAlert,
  notifyDecisionApprovedAdminAlert,
  notifyCommitteeAssigned,
  notifyDecisionProposalSubmitted,
  notifyReportUpdate,
} from '@/notifications';

/**
 * Internal Notification API Route
 *
 * This route exists to handle SMS/email notifications that are triggered from
 * client-side code (e.g., complaint service, client components). Since
 * process.env.TEXTBEE_API_KEY is only available server-side, all notification
 * calls from client components must go through this route.
 *
 * POST /api/internal/notify
 * Body: { type: string, opts: object }
 */
export async function POST(req: NextRequest) {
  try {
    const { type, opts } = await req.json();

    if (!type || !opts) {
      return NextResponse.json({ error: 'Missing type or opts' }, { status: 400 });
    }

    switch (type) {
      case 'complaint_submitted':
        await notifyComplaintSubmitted(opts);
        break;
      case 'complaint_status_update':
        await notifyComplaintStatusUpdate(opts);
        break;
      case 'new_complaint_admin_alert':
        await notifyNewComplaintAdminAlert(opts);
        break;
      case 'decision_approved_admin_alert':
        await notifyDecisionApprovedAdminAlert(opts);
        break;
      case 'committee_assigned':
        await notifyCommitteeAssigned(opts);
        break;
      case 'decision_proposal_submitted':
        await notifyDecisionProposalSubmitted(opts);
        break;
      case 'report_update':
        await notifyReportUpdate(opts);
        break;
      default:
        return NextResponse.json({ error: `Unknown notification type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Notify API] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
