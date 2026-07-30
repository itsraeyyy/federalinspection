"use server";

import { sendSMS } from "@/lib/textbee";
import {
  sendEmail,
  buildRegistrationEmail,
  buildPasswordResetEmail,
  buildAdminWelcomeEmail,
  buildComplaintSubmittedEmail,
  buildComplaintStatusEmail,
  buildReportNotificationEmail,
} from "@/lib/brevo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ICODS.raey.work";

export type NotifyResult = {
  success: boolean;
  channel: "sms" | "email" | "none";
  smsDelivered: boolean;
  emailDelivered: boolean;
};

// ─── Internal helper ─────────────────────────────────────────────────────────

async function tryNotify(
  phone: string | undefined,
  email: string | undefined,
  smsMessage: string,
  emailSubject: string,
  emailHtml: string,
  emailText?: string
): Promise<NotifyResult> {
  const smsPromise = phone
    ? sendSMS(phone, smsMessage).catch((err) => ({ error: err?.message || err }))
    : Promise.resolve(null);

  const emailPromise = email
    ? sendEmail(email, emailSubject, emailHtml, emailText).catch((err) => ({ error: err?.message || err }))
    : Promise.resolve(null);

  const [smsRes, emailRes] = await Promise.all([smsPromise, emailPromise]);

  const smsDelivered = !!(smsRes && !smsRes.error);
  const emailDelivered = !!(emailRes && !emailRes.error);

  return {
    success: smsDelivered || emailDelivered,
    channel: smsDelivered && emailDelivered ? "sms" : smsDelivered ? "sms" : emailDelivered ? "email" : "none",
    smsDelivered,
    emailDelivered,
  };
}

// ─── Public notification functions ───────────────────────────────────────────

/** Notify user after registration with their temp password */
export async function notifyRegistration(opts: {
  phone: string;
  email?: string;
  name: string;
  password: string;
  role?: "assessment" | "representative";
}): Promise<NotifyResult> {
  const loginPath = opts.role === "representative" ? "/representative/login" : "/assessment/login";
  const loginUrl = `${SITE_URL}${loginPath}`;

  const smsMessage =
    `ሰላም ${opts.name}፣ ለምዘና ፖርታሉ ተመዝግበዋል!\n` +
    `ስልክ: ${opts.phone}\nየይለፍ ቃል: ${opts.password}\nመግቢያ: ${loginUrl}`;

  const { html, text } = buildRegistrationEmail(opts.name, opts.phone, opts.password, loginUrl);

  return tryNotify(opts.phone, opts.email, smsMessage, "ICODiS — ምዝገባ ተሳክቷል", html, text);
}

/** Notify user after password reset with their new temp password */
export async function notifyPasswordReset(opts: {
  phone: string;
  email?: string;
  name: string;
  password: string;
  role?: "assessment" | "representative";
}): Promise<NotifyResult> {
  const loginPath = opts.role === "representative" ? "/representative/login" : "/assessment/login";
  const loginUrl = `${SITE_URL}${loginPath}`;

  const smsMessage =
    `ሰላም ${opts.name}፣ የይለፍ ቃልዎ ተቀይሯል።\n` +
    `አዲሱ የይለፍ ቃል: ${opts.password}\nመግቢያ: ${loginUrl}`;

  const { html, text } = buildPasswordResetEmail(opts.name, opts.password, loginUrl);

  return tryNotify(opts.phone, opts.email, smsMessage, "ICODiS — የይለፍ ቃል ተቀይሯል", html, text);
}

/** Notify admin after their account is created */
export async function notifyAdminCreated(opts: {
  phone?: string;
  email: string;
  name: string;
  password: string;
  role: string;
}): Promise<NotifyResult> {
  const loginUrl = `${SITE_URL}/auth/login`;
  const roleAmharic = opts.role === "super_admin" ? "ዋና አስተዳዳሪ (Super Admin)" : "አስተዳዳሪ (Admin)";

  const smsMessage =
    `ክቡር/ርት ${opts.name}፣ እንደ ${roleAmharic} ሆነው ተመዝግበዋል።\n` +
    `ስልክ: ${opts.phone || opts.email}\nየይለፍ ቃል: ${opts.password}\nመግቢያ: ${loginUrl}`;

  const { html, text } = buildAdminWelcomeEmail(opts.name, opts.email, opts.password, loginUrl);

  return tryNotify(opts.phone, opts.email, smsMessage, "ICODiS — Admin Account Created", html, text);
}

/** Notify complaint submitter that their complaint was received */
export async function notifyComplaintSubmitted(opts: {
  phone?: string;
  email?: string;
  name: string;
  trackingCode: string;
  type: string;
}): Promise<NotifyResult> {
  const trackUrl = `${SITE_URL}/track?code=${opts.trackingCode}`;
  const typeAmh = opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";

  const smsMessage =
    `${typeAmh}ዎ ተቀብሏል!\nመከታተያ ኮድ: ${opts.trackingCode}\n${trackUrl}`;

  const { html, text } = buildComplaintSubmittedEmail(opts.name, opts.trackingCode, opts.type, trackUrl);

  return tryNotify(opts.phone, opts.email, smsMessage, `ICODiS — ${typeAmh} ተቀብሏል`, html, text);
}

/** Notify complaint submitter that their complaint status changed */
export async function notifyComplaintStatusUpdate(opts: {
  phone?: string;
  email?: string;
  name: string;
  type: string;
  status: string;
  trackingCode: string;
  resolution?: string;
}): Promise<NotifyResult> {
  const trackUrl = `${SITE_URL}/track?code=${opts.trackingCode}`;
  const typeAmh = opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";
  const statusMap: Record<string, string> = {
    Processing: "በመመርመር ላይ",
    Resolved: "ውሳኔ አግኝቷል",
    Rejected: "ውድቅ ሆኗል",
  };
  const statusAmh = statusMap[opts.status] || opts.status;

  let smsMessage =
    `${typeAmh} ሁኔታ ተሻሽሏል: ${statusAmh}\n` +
    `ኮድ: ${opts.trackingCode}\n${trackUrl}`;
  if (opts.resolution) smsMessage += `\nምላሽ: ${opts.resolution}`;

  const { html, text } = buildComplaintStatusEmail(
    opts.name, opts.type, opts.status, opts.trackingCode, opts.resolution, trackUrl
  );

  return tryNotify(opts.phone, opts.email, smsMessage, `ICODiS — ${typeAmh} ሁኔታ ተሻሽሏል`, html, text);
}

/** Notify a representative about a report */
export async function notifyReportUpdate(opts: {
  phone?: string;
  email?: string;
  name: string;
  subject: string;
  message: string;
  loginPath?: string;
}): Promise<NotifyResult> {
  const loginUrl = `${SITE_URL}${opts.loginPath || "/representative/login"}`;
  const { html, text } = buildReportNotificationEmail(opts.name, opts.subject, opts.message, loginUrl);

  return tryNotify(opts.phone, opts.email, opts.message, opts.subject, html, text);
}

/** Notify an existing user that they have been added to a new assessment period */
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

  return tryNotify(opts.phone, opts.email, smsMessage, `ICODiS — ለ"${opts.periodName}" ምዘና ጊዜ ተጨምረዋል`, html, text);
}
