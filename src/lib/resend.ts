const RESEND_API_URL = "https://api.resend.com/emails";

const baseEmailStyle = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F4F4F5; margin: 0; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E4E4E7; box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
  .header { background: #0B2B5E; padding: 36px 40px; text-align: center; border-bottom: 4px solid #F5C242; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.3px; }
  .header p { color: #93C5FD; margin: 6px 0 0; font-size: 13px; }
  .content { padding: 40px; color: #27272A; }
  .content p { font-size: 15px; line-height: 1.6; margin: 0 0 20px; color: #52525B; }
  .box { background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
  .label { font-size: 11px; color: #71717A; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 8px; }
  .value { font-size: 15px; font-weight: 600; color: #18181B; margin-bottom: 12px; }
  .password { font-family: monospace; font-size: 24px; font-weight: 700; color: #0B2B5E; background: #EFF6FF; padding: 10px 20px; border-radius: 6px; display: inline-block; letter-spacing: 3px; border: 1px solid #BFDBFE; }
  .btn { display: inline-block; background: #0B2B5E; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
  .warning { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400E; margin: 16px 0; }
  .footer { padding: 24px 40px; background: #FAFAFA; border-top: 1px solid #E4E4E7; text-align: center; }
  .footer p { margin: 0; font-size: 12px; color: #A1A1AA; line-height: 1.5; }
  .tracking { font-family: monospace; font-size: 18px; font-weight: 700; color: #0B2B5E; background: #EFF6FF; padding: 8px 16px; border-radius: 6px; display: inline-block; letter-spacing: 2px; }
`;

function wrapEmail(title: string, subtitle: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseEmailStyle}</style></head><body>
  <div class="container">
    <div class="header"><h1>${title}</h1><p>${subtitle}</p></div>
    <div class="content">${body}</div>
    <div class="footer"><p>የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን | ICODiS System</p><p>This is an automated message. Please do not reply.</p></div>
  </div></body></html>`;
}

// ─── Core send function ──────────────────────────────────────────────────────

export async function sendEmail(to: string, subject: string, html: string, textContent?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = "ICODiS System <noreply@mail.raey.work>";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY missing — email skipped.");
    return { error: "Resend not configured" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        ...(textContent && { text: textContent }),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[Resend Error ${response.status}]:`, err);
      return { error: `Resend API Error (${response.status}): ${err}` };
    }

    console.log(`[Email SENT via Resend] to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error("[Resend] Fetch error:", error);
    return { error: error.message || "Failed to reach Resend API" };
  }
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export function buildRegistrationEmail(name: string, phone: string, password: string, loginUrl: string) {
  const html = wrapEmail(
    "ICODiS — ምዝገባ ተሳክቷል",
    "Assessment Portal Registration",
    `<p>ሰላም <strong>${name}</strong>፣</p>
    <p>ለምዘና ፖርታሉ ተመዝግበዋል። ከዚህ በታች ያለውን የመግቢያ መረጃ ይጠቀሙ:</p>
    <div class="box">
      <div class="label">ስልክ ቁጥር (Username)</div>
      <div class="value">${phone}</div>
      <div class="label">ጊዜያዊ የይለፍ ቃል (Temp Password)</div>
      <div class="password">${password}</div>
    </div>
    <div class="warning">⚠️ ለደህንነትዎ — ለመጀመሪያ ጊዜ ሲገቡ ይህን የይለፍ ቃል ይለውጡ።</div>
    <div style="text-align:center"><a href="${loginUrl}" class="btn">ወደ ፖርታሉ ይግቡ (Login)</a></div>`
  );
  const text = `ሰላም ${name}፣ ለምዘና ተመዝግበዋል!\nስልክ: ${phone}\nየይለፍ ቃል: ${password}\nመግቢያ: ${loginUrl}`;
  return { html, text };
}

export function buildPasswordResetEmail(name: string, password: string, loginUrl: string) {
  const html = wrapEmail(
    "ICODiS — የይለፍ ቃል ተቀይሯል",
    "Password Reset Notification",
    `<p>ሰላም <strong>${name}</strong>፣</p>
    <p>የይለፍ ቃልዎ ተቀይሯል። ከዚህ በታች ያለውን አዲስ ጊዜያዊ የይለፍ ቃል ይጠቀሙ:</p>
    <div class="box">
      <div class="label">አዲስ ጊዜያዊ የይለፍ ቃል (New Temp Password)</div>
      <div class="password">${password}</div>
    </div>
    <div class="warning">⚠️ ለደህንነትዎ — ሲገቡ ይህን የይለፍ ቃል ወዲያው ይለውጡ።</div>
    <div style="text-align:center"><a href="${loginUrl}" class="btn">ወደ ፖርታሉ ይግቡ (Login)</a></div>`
  );
  const text = `ሰላም ${name}፣ አዲስ የይለፍ ቃል: ${password}\nመግቢያ: ${loginUrl}`;
  return { html, text };
}

export function buildAdminWelcomeEmail(name: string, email: string, password: string, loginUrl: string) {
  const html = wrapEmail(
    "ICODiS — Admin Account Created",
    "Welcome to the Admin Dashboard",
    `<p>Dear <strong>${name}</strong>,</p>
    <p>An administrator account has been created for you on the ICODiS platform. Please use the credentials below to access your dashboard.</p>
    <div class="box">
      <div class="label">Username (Email)</div>
      <div class="value">${email}</div>
      <div class="label">Temporary Password</div>
      <div class="password">${password}</div>
    </div>
    <div class="warning">⚠️ For security, you will be required to change this password on first login.</div>
    <div style="text-align:center"><a href="${loginUrl}" class="btn">Access Dashboard</a></div>`
  );
  const text = `Welcome ${name}! Email: ${email} | Temp Password: ${password} | Login: ${loginUrl}`;
  return { html, text };
}

export function buildComplaintSubmittedEmail(name: string, trackingCode: string, type: string, trackUrl: string) {
  const typeAmh = type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";
  const html = wrapEmail(
    `ICODiS — ${typeAmh} ተቀብሏል`,
    "Complaint / Suggestion Received",
    `<p>ሰላም <strong>${name}</strong>፣</p>
    <p>ያቀረቡት ${typeAmh} በተሳካ ሁኔታ ደርሷል። ሁኔታውን ለመከታተል ከዚህ በታች ያለውን ኮድ ይጠቀሙ:</p>
    <div class="box">
      <div class="label">መከታተያ ኮድ (Tracking Code)</div>
      <div class="tracking">${trackingCode}</div>
    </div>
    <div style="text-align:center"><a href="${trackUrl}" class="btn">ሁኔታ ይከታተሉ (Track Status)</a></div>`
  );
  const text = `ሰላም ${name}፣ ${typeAmh}ዎ ተቀብሏል። መከታተያ ኮድ: ${trackingCode} | ${trackUrl}`;
  return { html, text };
}

export function buildComplaintStatusEmail(name: string, type: string, status: string, trackingCode: string, resolution: string | undefined, trackUrl: string) {
  const typeAmh = type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";
  const statusMap: Record<string, string> = {
    Processing: "በመመርመር ላይ",
    Resolved: "ውሳኔ አግኝቷል",
    Rejected: "ውድቅ ሆኗል",
  };
  const statusAmh = statusMap[status] || status;
  const resolutionBlock = resolution
    ? `<div class="box" style="text-align:left"><div class="label">የተሰጠው ምላሽ</div><p style="margin:8px 0 0;font-size:14px;color:#374151;">${resolution}</p></div>`
    : "";
  const html = wrapEmail(
    `ICODiS — ${typeAmh} ሁኔታ ተሻሽሏል`,
    "Status Update Notification",
    `<p>ሰላም <strong>${name}</strong>፣</p>
    <p>የቀረበው ${typeAmh} ሁኔታ ተሻሽሏል።</p>
    <div class="box">
      <div class="label">አሁናዊ ሁኔታ</div>
      <div class="value" style="font-size:18px;color:#0B2B5E;">${statusAmh}</div>
      <div class="label" style="margin-top:12px;">መከታተያ ኮድ</div>
      <div class="tracking">${trackingCode}</div>
    </div>
    ${resolutionBlock}
    <div style="text-align:center"><a href="${trackUrl}" class="btn">ዝርዝሩን ይከታተሉ</a></div>`
  );
  const text = `ሰላም ${name}፣ ${typeAmh} ሁኔታ: ${statusAmh}. ኮድ: ${trackingCode} | ${trackUrl}`;
  return { html, text };
}

export function buildReportNotificationEmail(name: string, subject: string, message: string, loginUrl: string) {
  const html = wrapEmail(
    "ICODiS — አዲስ ሪፖርት / ማሳወቂያ",
    "Report Notification",
    `<p>ሰላም <strong>${name}</strong>፣</p>
    <p>${message}</p>
    <div style="text-align:center"><a href="${loginUrl}" class="btn">ፖርታሉን ይክፈቱ (Open Portal)</a></div>`
  );
  const text = `ሰላም ${name}፣ ${message} | ${loginUrl}`;
  return { html, text };
}
