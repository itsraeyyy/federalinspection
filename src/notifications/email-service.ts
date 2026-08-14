/**
 * Email Sending Service
 * Uses Resend HTTP API with clean HTML template wrapper.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM_EMAIL = "ICODiS System <noreply@mail.raey.work>";

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

const baseEmailStyle = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #F4F6F9; margin: 0; padding: 40px 20px; }
  .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 35px rgba(0,0,0,0.06); }
  .header { background: #0B2B5E; padding: 36px 40px; text-align: center; border-bottom: 4px solid #F5C242; }
  .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
  .header p { color: #93C5FD; margin: 6px 0 0; font-size: 13px; }
  .content { padding: 40px; color: #1E293B; }
  .content p { font-size: 15px; line-height: 1.6; margin: 0 0 20px; color: #475569; }
  .box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
  .label { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 8px; }
  .value { font-size: 15px; font-weight: 600; color: #0F172A; margin-bottom: 12px; }
  .code-badge { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 22px; font-weight: 800; color: #0B2B5E; background: #EFF6FF; padding: 10px 20px; border-radius: 8px; display: inline-block; letter-spacing: 3px; border: 1px solid #BFDBFE; }
  .btn { display: inline-block; background: #0B2B5E; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 20px 0; box-shadow: 0 4px 12px rgba(11,43,94,0.15); }
  .warning { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #92400E; margin: 20px 0; }
  .footer { padding: 24px 40px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; }
  .footer p { margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5; }
`;

/**
 * Wraps email body HTML with default brand layout
 */
export function wrapEmailTemplate(title: string, subtitle: string, bodyContent: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseEmailStyle}</style></head><body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    <div class="content">${bodyContent}</div>
    <div class="footer">
      <p>የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን | ICODiS System</p>
      <p>ይህ አውቶማቲክ መልዕክት ነው። እባክዎን ለዚህ ኢሜይል ምላሽ አይስጡ።</p>
    </div>
  </div></body></html>`;
}

/**
 * Sends an email using Resend HTTP API.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  textContent?: string
): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.warn("[Email Service] RESEND_API_KEY missing — Email skipped:", { to, subject });
    return { success: false, error: "Resend API Key missing" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM_EMAIL,
        to: [to],
        subject: subject,
        html: html,
        ...(textContent && { text: textContent }),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Email Service Resend Error ${response.status}]:`, errText);
      return { success: false, error: `Resend returned ${response.status}: ${errText}` };
    }

    console.log(`[Email Sent Successfully] to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error("[Email Service Exception]:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
