/**
 * Notifications Central Manager
 * High-level unified dispatcher for SMS & Email notifications across the application.
 */

import { sendSMS } from "./sms-service";
import { sendEmail } from "./email-service";
import { getPerformanceGradeLabel } from "@/lib/assessment-data";
import {
  buildComplaintSubmittedTemplates,
  buildNewComplaintAdminAlertTemplates,
  buildDecisionApprovedAdminAlertTemplates,
  buildDecisionAcknowledgedLeaderAlertTemplates,
  buildCommitteeAssignedTemplates,
  buildDecisionProposalTemplates,
  buildComplaintStatusTemplates,
  buildAdminWelcomeTemplates,
  buildRegistrationTemplates,
  buildPasswordResetTemplates,
  buildReportNotificationTemplates,
} from "./templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ICODS.raey.work";

export interface NotifyResult {
  success: boolean;
  channel: "sms" | "email" | "both" | "none";
  smsDelivered: boolean;
  emailDelivered: boolean;
  smsError?: string;
  emailError?: string;
}

/**
 * Dispatch notification through both SMS and Email simultaneously
 */
async function dispatchNotification(
  phone: string | undefined,
  email: string | undefined,
  smsText: string,
  emailSubject: string,
  emailHtml: string,
  emailText?: string
): Promise<NotifyResult> {
  const smsPromise = phone
    ? sendSMS(phone, smsText)
    : Promise.resolve(null);

  const emailPromise = email
    ? sendEmail(email, emailSubject, emailHtml, emailText)
    : Promise.resolve(null);

  const [smsRes, emailRes] = await Promise.all([smsPromise, emailPromise]);

  const smsDelivered = !!(smsRes && smsRes.success);
  const emailDelivered = !!(emailRes && emailRes.success);

  return {
    success: smsDelivered || emailDelivered,
    channel:
      smsDelivered && emailDelivered
        ? "both"
        : smsDelivered
        ? "sms"
        : emailDelivered
        ? "email"
        : "none",
    smsDelivered,
    emailDelivered,
    smsError: smsRes?.error,
    emailError: emailRes?.error,
  };
}

// ─── Public Notification Triggers ───────────────────────────────────────────

/** 1. Notify citizen upon submitting a complaint or suggestion */
export async function notifyComplaintSubmitted(opts: {
  phone?: string;
  email?: string;
  name: string;
  trackingCode: string;
  type: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildComplaintSubmittedTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    `የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን — ${opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ"}ዎ በስኬት ተመዝግቧል`,
    html,
    text
  );
}

/** 1.5. Notify Complaint Receiver / Admin when new complaint/suggestion is registered */
export async function notifyNewComplaintAdminAlert(opts: {
  phone?: string;
  email?: string;
  trackingCode: string;
  type: string;
  institution?: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildNewComplaintAdminAlertTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    `ICODiS — አዲስ ${opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ"} ተመዝግቧል (${opts.trackingCode})`,
    html,
    text
  );
}

/** 1.6. Notify Complaint Receiver / Admin when decision is approved by committee leader */
export async function notifyDecisionApprovedAdminAlert(opts: {
  phone?: string;
  email?: string;
  trackingCode: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildDecisionApprovedAdminAlertTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    `ICODiS — የውሳኔ ሀሳብ ጸድቋል (${opts.trackingCode})`,
    html,
    text
  );
}

export async function notifyDecisionAcknowledged(opts: {
  phone?: string;
  email?: string;
  trackingCode: string;
  submitterName: string;
}): Promise<NotifyResult> {
  const leaderPhone = opts.phone || process.env.LEADER_NOTIFICATION_PHONE;
  const leaderEmail = opts.email || process.env.LEADER_NOTIFICATION_EMAIL;
  const { sms, html, text } = buildDecisionAcknowledgedLeaderAlertTemplates(opts);
  return dispatchNotification(
    leaderPhone,
    leaderEmail,
    sms,
    `የኮሚሽን ጽ/ቤት ሃላፊ ማሳወቂያ — አመልካች ውሳኔው እንደደረሳቸው አረጋግጠዋል (${opts.trackingCode})`,
    html,
    text
  );
}

/** 2. Notify committee members when assigned to a complaint */
export async function notifyCommitteeAssigned(opts: {
  phone?: string;
  email?: string;
  name?: string;
  role?: string;
  committeeName: string;
  trackingCode: string;
  institution?: string;
  slaDeadline?: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildCommitteeAssignedTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    `የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን — የኮሚቴ ምደባ ማስታወቂያ (${opts.trackingCode})`,
    html,
    text
  );
}

/** 3. Notify committee leader when committee submits decision proposal */
export async function notifyDecisionProposalSubmitted(opts: {
  phone?: string;
  email?: string;
  committeeLeaderName?: string;
  trackingCode: string;
  committeeName?: string;
  proposalSummary?: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildDecisionProposalTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    `ICODiS — የአቤቱታ (${opts.trackingCode}) የውሳኔ ሀሳብ ቀርቧል`,
    html,
    text
  );
}

/** 4. Notify citizen when complaint status or resolution is updated */
export async function notifyComplaintStatusUpdate(opts: {
  phone?: string;
  email?: string;
  name: string;
  type: string;
  status: string;
  trackingCode: string;
  resolution?: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildComplaintStatusTemplates(opts);
  const typeAmh = opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    `ICODiS — ${typeAmh}ዎ ሁኔታ ተሻሽሏል (${opts.trackingCode})`,
    html,
    text
  );
}

/** 5. Notify newly provisioned admin / committee leader */
export async function notifyAdminCreated(opts: {
  phone?: string;
  email: string;
  name: string;
  password: string;
  role: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildAdminWelcomeTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    "ICODiS — የአስተዳዳሪ መለያ ተፈጥሯል (Admin Account Created)",
    html,
    text
  );
}

/** 6. Notify user on registration */
export async function notifyRegistration(opts: {
  phone: string;
  email?: string;
  name: string;
  password: string;
  role?: "assessment" | "representative";
}): Promise<NotifyResult> {
  const { sms, html, text } = buildRegistrationTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    "ICODiS — ምዝገባ ተሳክቷል",
    html,
    text
  );
}

/** 7. Notify user on password reset */
export async function notifyPasswordReset(opts: {
  phone: string;
  email?: string;
  name: string;
  password: string;
  role?: "assessment" | "representative";
}): Promise<NotifyResult> {
  const { sms, html, text } = buildPasswordResetTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    "ICODiS — የይለፍ ቃል ተቀይሯል",
    html,
    text
  );
}

/** 8. Notify representative about a report */
export async function notifyReportUpdate(opts: {
  phone?: string;
  email?: string;
  name: string;
  subject: string;
  message: string;
  loginPath?: string;
}): Promise<NotifyResult> {
  const { sms, html, text } = buildReportNotificationTemplates(opts);
  return dispatchNotification(
    opts.phone,
    opts.email,
    sms,
    opts.subject,
    html,
    text
  );
}

/** 9. Notify user when enrolled in a new assessment period */
export async function notifyNewPeriodEnrollment(opts: {
  phone: string;
  email?: string;
  name: string;
  periodName: string;
}): Promise<NotifyResult> {
  const loginUrl = `${SITE_URL}/assessment/login`;
  const smsMessage =
    `ሰላም ${opts.name}፣\n` +
    `ለ"${opts.periodName}" አዲስ ምዘና ጊዜ ተመዝግበዋል።\n` +
    `የቀድሞ የይለፍ ቃልዎን ተጠቅመው ይግቡ: ${loginUrl}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
      <h2 style="color:#1d4ed8;margin-bottom:8px;">ለምዘና ጊዜ ተጨምረዋል!</h2>
      <p style="color:#333;font-size:15px;">ሰላም <strong>${opts.name}</strong>፣</p>
      <p style="color:#333;font-size:15px;">ለ <strong>"${opts.periodName}"</strong> አዲስ ምዘና ጊዜ ተጨምረዋል።</p>
      <p style="color:#555;font-size:14px;">የቀድሞ የይለፍ ቃልዎን ተጠቅመው ከዚህ ሊገቡ ይችላሉ፡</p>
      <a href="${loginUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#1d4ed8;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
        ወደ ምዘና ፖርታሉ ግባ
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px;">ICODiS — የምዘና ፖርታል</p>
    </div>`;

  const text = `ሰላም ${opts.name}፣\nለ"${opts.periodName}" ምዘና ጊዜ ተጨምረዋል።\nይግቡ: ${loginUrl}`;

  return dispatchNotification(opts.phone, opts.email, smsMessage, `ICODiS — ለ"${opts.periodName}" ምዘና ጊዜ ተጨምረዋል`, html, text);
}

/** 10. Notify user when final score out of 100 is approved */
export async function notifyFinalScoreApproved(opts: {
  phone: string;
  email?: string;
  name: string;
  periodName: string;
  finalScore: number;
}): Promise<NotifyResult> {
  const loginUrl = `${SITE_URL}/assessment/login`;
  const gradeLabel = getPerformanceGradeLabel(opts.finalScore);

  const smsMessage =
    `ሰላም ${opts.name}፣\n` +
    `የ"${opts.periodName}" ምዘና አጠቃላይ ውጤትዎ ${opts.finalScore.toFixed(1)}/100 (${gradeLabel}) ሆኖ ፀድቋል!\n` +
    `በስልክ ቁጥርዎ እና በይለፍ ቃልዎ በመግባት ዝርዝሩን ይመልከቱ: ${loginUrl}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
      <h2 style="color:#059669;margin-bottom:8px;">የምዘና ውጤትዎ ፀድቋል!</h2>
      <p style="color:#333;font-size:15px;">ሰላም <strong>${opts.name}</strong>፣</p>
      <p style="color:#333;font-size:15px;">የ <strong>"${opts.periodName}"</strong> ምዘና አጠቃላይ ውጤትዎ <strong>${opts.finalScore.toFixed(1)} / 100 (${gradeLabel})</strong> ሆኖ በአጽዳቂው ፀድቋል።</p>
      <p style="color:#555;font-size:14px;">በስልክ ቁጥርዎ እና በይለፍ ቃልዎ በመግባት ዝርዝር የምዘና መረጃዎችን ከዚህ ይመልከቱ፡</p>
      <a href="${loginUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
        ውጤቱን ይመልከቱ
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px;">ICODiS — የምዘና ፖርታል</p>
    </div>`;

  const text = `ሰላም ${opts.name}፣\nየ"${opts.periodName}" ምዘና አጠቃላይ ውጤትዎ ${opts.finalScore.toFixed(1)}/100 (${gradeLabel}) ሆኖ ፀድቋል!\nበስልክ ቁጥርዎና በይለፍ ቃልዎ በመግባት ዝርዝሩን ይመልከቱ: ${loginUrl}`;

  return dispatchNotification(opts.phone, opts.email, smsMessage, `ICODiS — የምዘና ውጤትዎ ፀድቋል (${opts.finalScore.toFixed(1)}/100 - ${gradeLabel})`, html, text);
}

// Re-export low-level services for specialized use
export { sendSMS } from "./sms-service";
export { sendEmail } from "./email-service";
export * from "./templates";
