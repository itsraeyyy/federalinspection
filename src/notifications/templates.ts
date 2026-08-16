/**
 * Centralized Text & Email Templates Repository
 * Contains all localized Amharic + English SMS messages and HTML email templates.
 */

import { wrapEmailTemplate } from "./email-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://icods.raey.work";

// ─── 1. Complaint / Suggestion Submission Templates ─────────────────────────

export function buildComplaintSubmittedTemplates(opts: {
  name: string;
  trackingCode: string;
  type: string;
  trackUrl?: string;
}) {
  const trackUrl = opts.trackUrl || `${SITE_URL}/track?code=${opts.trackingCode}`;
  const typeAmh = opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";
  const dateStr = new Date().toLocaleDateString("am-ET");

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ክቡር/ርት ${opts.name}፣ ያቀረቡት ${typeAmh} በሲስተማችን ላይ በስኬት ተመዝግቧል።\n` +
    `የክትትል ኮድዎ: ${opts.trackingCode}\n` +
    `ጉዳይዎ በቅርቡ ተመርምሮ ምላሽ የሚሰጠው ይሆናል።\n` +
    `👉 የሂደት ደረጃውን አሁኑኑ ለመከታተል ይህን ይጫኑ: ${trackUrl}`;

  const html = wrapEmailTemplate(
    `የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን — ${typeAmh}ዎ በስኬት ተመዝግቧል`,
    "Submission Confirmation",
    `<p>ሰላም ክቡር/ርት <strong>${opts.name}</strong>፣</p>
    <p>በብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን የኦንላይን አቤቱታና ጥቆማ ማስተናገጃ ፖርታል (ICODiS) ያቀረቡት <strong>${typeAmh}</strong> በስኬት ተመዝግቧል።</p>
    <div class="box">
      <div class="label">የመከታተያ ኮድ (Tracking Code)</div>
      <div class="code-badge">${opts.trackingCode}</div>
      <div className="label" style="margin-top:10px;">የቀረበበት ቀን</div>
      <div class="value">${dateStr}</div>
    </div>
    <p>ያቀረቡት ጉዳይ በሚመለከተው ክፍል ታይቶና በኮሚቴ ተመርምሮ አስፈላጊው ውሳኔ የሚሰጠው ሲሆን፣ የሂደቱን ደረጃ በክትትል ኮድዎ አማካኝነት በየጊዜው መከታተል ይችላሉ።</p>
    <div style="text-align:center">
      <a href="${trackUrl}" class="btn">👉 የ ${typeAmh}ዎን የሂደት ደረጃ አሁኑኑ ተከታተል (Track Submission)</a>
    </div>`
  );

  const text = `ሰላም ክቡር/ርት ${opts.name}፣ ያቀረቡት ${typeAmh} ተቀብሏል!\nየክትትል ኮድ: ${opts.trackingCode}\nመከታተያ: ${trackUrl}`;

  return { sms, html, text };
}

// ─── 1.5. Admin / Complaint Receiver Alert Templates ─────────────────────────

export function buildNewComplaintAdminAlertTemplates(opts: {
  trackingCode: string;
  type: string;
  institution?: string;
  dashboardUrl?: string;
}) {
  const dashboardUrl = opts.dashboardUrl || `${SITE_URL}/dashboard/complaints`;
  const typeAmh = opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";
  const dateStr = new Date().toLocaleDateString("am-ET");

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `አዲስ ${typeAmh} በሲስተሙ ላይ ተመዝግቧል።\n` +
    `የአቤቱታ ኮድ: ${opts.trackingCode}\n` +
    `${opts.institution ? `ተቋም: ${opts.institution}\n` : ""}` +
    `👉 ገብተው ለመቀበልና ለማስተናገድ: ${dashboardUrl}`;

  const html = wrapEmailTemplate(
    `ICODiS — አዲስ ${typeAmh} ተመዝግቧል (${opts.trackingCode})`,
    "New Submission Admin Alert",
    `<p>ሰላም የአቤቱታ ተቀባይ / አስተዳዳሪ፣</p>
    <p>በብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ኦንላይን ፖርታል አዲስ <strong>${typeAmh}</strong> መመዝገቡን እንገልፃለን።</p>
    <div class="box">
      <div class="label">የአቤቱታ ኮድ</div>
      <div class="value">${opts.trackingCode}</div>
      ${opts.institution ? `<div class="label">ተከሰሰበት ተቋም</div><div class="value">${opts.institution}</div>` : ""}
      <div class="label">የቀረበበት ቀን</div>
      <div class="value">${dateStr}</div>
    </div>
    <div style="text-align:center">
      <a href="${dashboardUrl}" class="btn">👉 ወደ አስተዳዳሪ ዳሽቦርድ በመግባት አቤቱታውን ተቀብለው አስተናግዱ</a>
    </div>`
  );

  const text = `አዲስ ${typeAmh} ተመዝግቧል (ኮድ: ${opts.trackingCode})። ገብተው አስተናግዱ: ${dashboardUrl}`;

  return { sms, html, text };
}

export function buildDecisionApprovedAdminAlertTemplates(opts: {
  trackingCode: string;
  dashboardUrl?: string;
}) {
  const dashboardUrl = opts.dashboardUrl || `${SITE_URL}/dashboard/complaints`;

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `የአቤቱታ (ኮድ: ${opts.trackingCode}) የውሳኔ ሀሳብ በኮሚቴ ሰብሳቢው ተጸድቆ የመጨረሻ ውሳኔ አግኝቷል።\n` +
    `👉 ዝርዝሩን በዳሽቦርድ ለመመልከት: ${dashboardUrl}`;

  const html = wrapEmailTemplate(
    `ICODiS — የውሳኔ ሀሳብ ጸድቋል (${opts.trackingCode})`,
    "Decision Approved Alert",
    `<p>ሰላም የአቤቱታ ተቀባይ / አስተዳዳሪ፣</p>
    <p>አቤቱታ ቁጥር <strong>${opts.trackingCode}</strong> በኮሚቴ ሰብሳቢው ተመርምሮ የውሳኔ ሀሳቡ መጽደቁንና የመጨረሻ ውሳኔ ማግኘቱን እንገልፃለን።</p>
    <div style="text-align:center">
      <a href="${dashboardUrl}" class="btn">👉 ዝርዝሩን በዳሽቦርድ ለመመልከት</a>
    </div>`
  );

  const text = `የአቤቱታ ${opts.trackingCode} ውሳኔ ጸድቋል። ዳሽቦርድ: ${dashboardUrl}`;

  return { sms, html, text };
}

export function buildDecisionAcknowledgedLeaderAlertTemplates(opts: {
  trackingCode: string;
  submitterName: string;
  dashboardUrl?: string;
}) {
  const dashboardUrl = opts.dashboardUrl || `${SITE_URL}/complaint/dashboard`;

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `የክቡር/ርት ${opts.submitterName} (ኮድ: ${opts.trackingCode}) የመጨረሻ ውሳኔ እንደደረሳቸው በሲስተሙ አረጋግጠዋል (ውሳኔ ደርሶኛል ብለዋል)።\n` +
    `👉 ዳሽቦርድ: ${dashboardUrl}`;

  const html = wrapEmailTemplate(
    `የኮሚሽን ጽ/ቤት ሃላፊ ማሳወቂያ — አመልካች ውሳኔው እንደደረሳቸው አረጋግጠዋል (${opts.trackingCode})`,
    "Decision Receipt Acknowledgment Alert",
    `<p>ሰላም <strong>የኮሚሽን ጽ/ቤት ሃላፊ</strong>፣</p>
    <p>አመልካች <strong>${opts.submitterName}</strong> የመከታተያ ኮድ <strong>${opts.trackingCode}</strong> የተሰጠው የመጨረሻ ውሳኔ በስኬት እንደደረሳቸው በሲስተሙ ላይ በይፋ አረጋግጠዋል (ውሳኔ ደርሶኛል ብለዋል)።</p>
    <div class="box">
      <div class="label">አመልካች</div>
      <div class="value">${opts.submitterName}</div>
      <div class="label">የመከታተያ ኮድ</div>
      <div class="value">${opts.trackingCode}</div>
      <div class="label">የተረጋገጠበት ሰዓት</div>
      <div class="value">${new Date().toLocaleString('am-ET')}</div>
    </div>
    <div style="text-align:center">
      <a href="${dashboardUrl}" class="btn">👉 ወደ ኮሚሽን ጽ/ቤት ሃላፊ ዳሽቦርድ ይግቡ</a>
    </div>`
  );

  const text = `የአመልካች ${opts.submitterName} (ኮድ: ${opts.trackingCode}) የመጨረሻ ውሳኔ እንደደረሳቸው አረጋግጠዋል።`;

  return { sms, html, text };
}

// ─── 2. Committee Assignment Templates ──────────────────────────────────────

export function buildCommitteeAssignedTemplates(opts: {
  name?: string;
  committeeName: string;
  trackingCode: string;
  institution?: string;
  slaDeadline?: string;
}) {
  const memberName = opts.name || "የኮሚቴ አባል";
  const deadlineText = opts.slaDeadline || "15 ቀናት";

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ክቡር/ርት ${memberName}፣ በአቤቱታ ቁጥር ${opts.trackingCode} ላይ የማጣራት ስራ እንዲያካሂዱ በ ${opts.committeeName} አባልነት ተመድበዋል።\n` +
    `የማጣሪያ ቀነ ገደብ: ${deadlineText}።`;

  const html = wrapEmailTemplate(
    "የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን — የኮሚቴ ምደባ ማስታወቂያ",
    "Committee Assignment Notification",
    `<p>ሰላም ክቡር/ርት <strong>${memberName}</strong>፣</p>
    <p>በብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን በአቤቱታ ቁጥር <strong>${opts.trackingCode}</strong> ላይ ዝርዝር ማጣራት እንዲያካሂዱ በ <strong>${opts.committeeName}</strong> ውስጥ የኮሚቴ አባል ሆነው መመደብዎን እንገልፃለን።</p>
    <div class="box">
      <div class="label">የአቤቱታ ኮድ</div>
      <div class="value">${opts.trackingCode}</div>
      <div class="label">የኮሚቴ ስም</div>
      <div class="value">${opts.committeeName}</div>
      ${opts.institution ? `<div class="label">ተከሰሰበት ተቋም</div><div class="value">${opts.institution}</div>` : ""}
      <div class="label">የማጣሪያ ቀነ ገደብ (SLA)</div>
      <div class="value" style="color:#D97706;">${deadlineText}</div>
    </div>
    <p>እባክዎ ከኮሚቴ ሰብሳቢዎ ጋር በመሆን አስፈላጊውን የማጣራት ስራ እንድታካሂዱ እናሳስባለን።</p>`
  );

  const text = `ሰላም ${memberName}፣ በአቤቱታ ${opts.trackingCode} ላይ በ${opts.committeeName} አባልነት ተመድበዋል። ቀነ ገደብ: ${deadlineText}።`;

  return { sms, html, text };
}

// ─── 3. Decision Proposal Submitted Templates ────────────────────────────────

export function buildDecisionProposalTemplates(opts: {
  committeeLeaderName?: string;
  trackingCode: string;
  committeeName?: string;
  proposalSummary?: string;
  dashboardUrl?: string;
}) {
  const dashboardUrl = opts.dashboardUrl || `${SITE_URL}/complaint/dashboard`;

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ክቡር/ርት የኮሚሽን ጽ/ቤት ሃላፊ፣ በአቤቱታ ቁጥር ${opts.trackingCode} ላይ በአጣሪ ኮሚቴው የተዘጋጀው የውሳኔ ሀሳብ (Proposal) ለማጽደቅ ቀርቧል።\n` +
    `👉 ገብተው ውሳኔውን መርምረው ለማጽደቅ: ${dashboardUrl}`;

  const html = wrapEmailTemplate(
    "ICODiS — የውሳኔ ሀሳብ ለማጽደቅ ቀርቧል",
    "Decision Proposal Pending Approval",
    `<p>ሰላም ክቡር/ርት የኮሚሽን ጽ/ቤት ሃላፊ <strong>${opts.committeeLeaderName || "የኮሚሽን ጽ/ቤት ሃላፊ"}</strong>፣</p>
    <p>በአቤቱታ ቁጥር <strong>${opts.trackingCode}</strong> ላይ በአጣሪ ኮሚቴው የማጣራት ስራ ተጠናቆ የቀረበው የውሳኔ ሀሳብ (Decision Proposal) በእርስዎ እንዲጸድቅ ቀርቧል።</p>
    ${
      opts.proposalSummary
        ? `<div class="box"><div class="label">የውሳኔ ሀሳብ ጭምቅ</div><div class="value" style="font-weight:normal;text-align:left;">"${opts.proposalSummary}"</div></div>`
        : ""
    }
    <div style="text-align:center">
      <a href="${dashboardUrl}" class="btn">👉 የቀረበውን ውሳኔ መርምርና አጽድቅ (Ratify Decision)</a>
    </div>`
  );

  const text = `የአቤቱታ ${opts.trackingCode} የውሳኔ ሀሳብ ለማጽደቅ ቀርቧል። መግቢያ: ${dashboardUrl}`;

  return { sms, html, text };
}

// ─── 4. Complaint Resolution / Status Update Templates ──────────────────────

export function buildComplaintStatusTemplates(opts: {
  name: string;
  type: string;
  status: string;
  trackingCode: string;
  resolution?: string;
  trackUrl?: string;
}) {
  const trackUrl = opts.trackUrl || `${SITE_URL}/track?code=${opts.trackingCode}`;
  const typeAmh = opts.type === "Suggestion" ? "ጥቆማ" : "አቤቱታ";

  const statusMap: Record<string, string> = {
    Accepted: "ተቀብሏል (Accepted)",
    UnderInvestigation: "በማጣራት ላይ (In Process)",
    Processing: "በማጣራት ላይ (In Process)",
    PendingApproval: "ለጽድቅ ቀርቧል",
    Resolved: "ውሳኔ ተሰጥቶበታል (Decision Made)",
    Rejected: "ውድቅ ሆኗል (Rejected)",
  };
  const statusAmh = statusMap[opts.status] || opts.status;

  let sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ክቡር/ርት ${opts.name}፣ ያቀረቡት ${typeAmh} (ኮድ: ${opts.trackingCode}) ሁኔታ: ${statusAmh}።\n`;
  if (opts.resolution) sms += `የተሰጠ ውሳኔ: ${opts.resolution}\n`;
  sms += `👉 የተሰጠውን ውሳኔና የተያያዙ ሰነዶችን ለማየት: ${trackUrl}`;

  const html = wrapEmailTemplate(
    `የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን — የ ${typeAmh}ዎ የመጨረሻ ውሳኔ`,
    "Submission Status Update",
    `<p>ሰላም ክቡር/ርት <strong>${opts.name}</strong>፣</p>
    <p>በብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን ያቀረቡት <strong>${typeAmh}</strong> (የክትትል ኮድ: <strong>${opts.trackingCode}</strong>) በኮሚቴ ተመርምሮ የመጨረሻ ውሳኔ አግኝቷል: <strong style="color:#0B2B5E;">${statusAmh}</strong>።</p>
    ${
      opts.resolution
        ? `<div class="box">
            <div class="label">የመጨረሻ ውሳኔ ምላሽ (Final Resolution)</div>
            <div class="value" style="font-weight:500;text-align:left;line-height:1.6;">"${opts.resolution}"</div>
           </div>`
        : ""
    }
    <div style="text-align:center">
      <a href="${trackUrl}" class="btn">👉 የተሰጠውን ውሳኔና ይፋዊ ሰነዶችን ለማየትና ለማውረድ ይህን ይጫኑ</a>
    </div>`
  );

  const text = `${typeAmh} ${opts.trackingCode} ሁኔታ: ${statusAmh}።\n${opts.resolution ? `ምላሽ: ${opts.resolution}\n` : ""}${trackUrl}`;

  return { sms, html, text };
}

// ─── 4.5. SLA Reminder & Attention Templates ─────────────────────────────

export function buildSlaReminderTemplates(opts: {
  trackingCode: string;
  daysLeft: number;
  role: 'admin' | 'leader' | 'member';
  committeeName?: string;
  linkUrl?: string;
}) {
  const isOverdue = opts.daysLeft <= 0;
  const timeText = isOverdue
    ? 'የማጣሪያ ጊዜ ገደቡ አልፏል (Overdue)'
    : `${opts.daysLeft} ቀናት ብቻ ቀርተዋል`;

  let sms = '';
  let htmlBody = '';

  if (opts.role === 'admin') {
    const url = opts.linkUrl || `${SITE_URL}/dashboard/complaints`;
    sms =
      `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
      `አስቸኳይ ማሳሰቢያ፡ በአቤቱታ (ኮድ: ${opts.trackingCode}) ላይ ውሳኔ ለመስጠት ${timeText}።\n` +
      `👉 ገብተው ያፋጥኑ፡ ${url}`;

    htmlBody =
      `<p>ሰላም የአቤቱታ ተቀባይ / አስተዳዳሪ፣</p>` +
      `<p>በአቤቱታ ቁጥር <strong>${opts.trackingCode}</strong> ላይ አስፈላጊውን ውሳኔ ለመስጠት <strong>${timeText}</strong>።</p>` +
      `<div class="warning">⚠️ አቤቱታው ትኩረት የሚሻ በመሆኑ እባክዎ በአስቸኳይ ገብተው ያፋጥኑ።</div>` +
      `<div style="text-align:center"><a href="${url}" class="btn">👉 ወደ አስተዳዳሪ ዳሽቦርድ ይግቡ</a></div>`;
  } else if (opts.role === 'leader') {
    const url = opts.linkUrl || `${SITE_URL}/complaint/dashboard`;
    sms =
      `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
      `አስቸኳይ ማሳሰቢያ፡ በአቤቱታ (ኮድ: ${opts.trackingCode}) ላይ የቀረበውን የውሳኔ ሀሳብ ለማጽደቅ ${timeText}።\n` +
      `👉 ገብተው ያፋጥኑ፡ ${url}`;

    htmlBody =
      `<p>ሰላም የኮሚሽን ጽ/ቤት ሃላፊ፣</p>` +
      `<p>በአቤቱታ ቁጥር <strong>${opts.trackingCode}</strong> ላይ የቀረበውን የውሳኔ ሀሳብ መርምረው ለማጽደቅ <strong>${timeText}</strong>።</p>` +
      `<div class="warning">⚠️ ጉዳዩ ትኩረት የሚሻ በመሆኑ እባክዎ ገብተው ያጽድቁ።</div>` +
      `<div style="text-align:center"><a href="${url}" class="btn">👉 ወደ ጽ/ቤት ሃላፊ ዳሽቦርድ ይግቡ</a></div>`;
  } else {
    // Committee Group Member - NO LINK
    sms =
      `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
      `አስቸኳይ ማሳሰቢያ፡ በ${opts.committeeName || 'ኮሚቴው'} ስር ለተመደበው አቤቱታ (ኮድ: ${opts.trackingCode}) የማጣሪያ ቀነ ገደብ ለማጠናቀቅ ${timeText}።\n` +
      `እባክዎ ከጽ/ቤት ሃላፊዎ ጋር በመሆን ማጣራቱን ያፋጥኑ።`;

    htmlBody =
      `<p>ሰላም የኮሚቴ አባል፣</p>` +
      `<p>በ <strong>${opts.committeeName || 'ኮሚቴዎ'}</strong> ስር ለተመደበው አቤቱታ ቁጥር <strong>${opts.trackingCode}</strong> የማጣሪያ ቀነ ገደብ ለማጠናቀቅ <strong>${timeText}</strong>።</p>` +
      `<p>እባክዎ ከጽ/ቤት ሃላፊዎ ጋር በመሆን ማጣራቱን በአስቸኳይ እንድታፋጥኑ እናሳስባለን።</p>`;
  }

  const html = wrapEmailTemplate(
    `ICODiS አስቸኳይ ማሳሰቢያ — በአቤቱታ ${opts.trackingCode} ላይ ${timeText}`,
    "SLA Reminder Notification",
    htmlBody
  );

  return { sms, html, text: sms };
}

// ─── 5. Admin Welcome Templates ──────────────────────────────────────────────

export function buildAdminWelcomeTemplates(opts: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  loginUrl?: string;
}) {
  const loginUrl = opts.loginUrl || `${SITE_URL}/auth/login`;
  const roleAmharic = opts.role === "super_admin" ? "ዋና አስተዳዳሪ (Super Admin)" : "አስተዳዳሪ (Admin)";

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ክቡር/ርት ${opts.name}፣ በ ICODiS ሲስተም ላይ እንደ ${roleAmharic} የመግቢያ መለያዎ ተፈጥሯል።\n` +
    `ስልክ/ኢሜይል: ${opts.phone || opts.email}\nየይለፍ ቃል: ${opts.password}\n` +
    `👉 አሁኑኑ ገብተው የይለፍ ቃልዎን ለመቀየር: ${loginUrl}`;

  const html = wrapEmailTemplate(
    "ICODiS — የአስተዳዳሪ መለያ ተፈጥሯል (Admin Account Created)",
    "Admin Credentials Notification",
    `<p>ሰላም ክቡር/ርት <strong>${opts.name}</strong>፣</p>
    <p>በብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን የኦንላይን ሲስተም (ICODiS) ላይ እንደ <strong>${roleAmharic}</strong> ሆነው መመደብዎን እንገልፃለን። የመግቢያ መረጃዎ ከዚህ በታች ቀርቧል፡</p>
    <div class="box">
      <div class="label">መለያ (Username / Email)</div>
      <div class="value">${opts.email}</div>
      <div class="label">ጊዜያዊ የይለፍ ቃል</div>
      <div class="code-badge">${opts.password}</div>
    </div>
    <div class="warning">⚠️ ማሳሰቢያ፡ ለደህንነትዎ ሲባል ለመጀመሪያ ጊዜ ሲገቡ ጊዜያዊ የይለፍ ቃልዎን ወዲያውኑ ይቀይሩ።</div>
    <div style="text-align:center">
      <a href="${loginUrl}" class="btn">👉 ወደ አስተዳዳሪ ፖርታሉ ለመግባት</a>
    </div>`
  );

  const text = `ሰላም ${opts.name}፣ እንደ ${roleAmharic} ተመዝግበዋል!\nመለያ: ${opts.email}\nየይለፍ ቃል: ${opts.password}\nመግቢያ: ${loginUrl}`;

  return { sms, html, text };
}

// ─── 6. Assessment User Registration Templates ─────────────────────────────

export function buildRegistrationTemplates(opts: {
  name: string;
  phone: string;
  password: string;
  role?: "assessment" | "representative";
  loginUrl?: string;
}) {
  const loginPath = opts.role === "representative" ? "/representative/login" : "/assessment/login";
  const loginUrl = opts.loginUrl || `${SITE_URL}${loginPath}`;

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ሰላም ${opts.name}፣ ለምዘና ፖርታሉ ተመዝግበዋል።\n` +
    `ስልክ: ${opts.phone}\nየይለፍ ቃል: ${opts.password}\n` +
    `👉 ገብተው ለመመዘን: ${loginUrl}`;

  const html = wrapEmailTemplate(
    "ICODiS — ምዝገባ ተሳክቷል",
    "Assessment Portal Registration",
    `<p>ሰላም <strong>${opts.name}</strong>፣</p>
    <p>ለምዘና ፖርታሉ ተመዝግበዋል። የመግቢያ መረጃዎ ከዚህ በታች ይገኛል:</p>
    <div class="box">
      <div class="label">ስልክ ቁጥር</div>
      <div class="value">${opts.phone}</div>
      <div class="label">ጊዜያዊ የይለፍ ቃል</div>
      <div class="code-badge">${opts.password}</div>
    </div>
    <div class="warning">⚠️ ለደህንነትዎ — ለመጀመሪያ ጊዜ ሲገቡ ይህን የይለፍ ቃል ይለውጡ።</div>
    <div style="text-align:center">
      <a href="${loginUrl}" class="btn">👉 ወደ ምዘና ፖርታሉ ይግቡ</a>
    </div>`
  );

  const text = `ሰላም ${opts.name}፣ ለምዘና ተመዝግበዋል!\nስልክ: ${opts.phone}\nየይለፍ ቃል: ${opts.password}\nመግቢያ: ${loginUrl}`;

  return { sms, html, text };
}

// ─── 7. Password Reset Templates ─────────────────────────────────────────────

export function buildPasswordResetTemplates(opts: {
  name: string;
  password: string;
  role?: "assessment" | "representative";
  loginUrl?: string;
}) {
  const loginPath = opts.role === "representative" ? "/representative/login" : "/assessment/login";
  const loginUrl = opts.loginUrl || `${SITE_URL}${loginPath}`;

  const sms =
    `[የብልፅግና ኢንስፔክሽንና ሥነ-ምግባር ኮሚሽን]\n` +
    `ሰላም ${opts.name}፣ የምዘና ፖርታል የይለፍ ቃልዎ ተቀይሯል።\n` +
    `አዲሱ የይለፍ ቃል: ${opts.password}\n` +
    `👉 ለመግባት ይህን ይጫኑ: ${loginUrl}`;

  const html = wrapEmailTemplate(
    "ICODiS — የይለፍ ቃል ተቀይሯል",
    "Password Reset Notification",
    `<p>ሰላም <strong>${opts.name}</strong>፣</p>
    <p>የይለፍ ቃልዎ ተቀይሯል። ከዚህ በታች ያለውን አዲስ ጊዜያዊ የይለፍ ቃል ይጠቀሙ:</p>
    <div class="box">
      <div class="label">አዲስ ጊዜያዊ የይለፍ ቃል</div>
      <div class="code-badge">${opts.password}</div>
    </div>
    <div style="text-align:center">
      <a href="${loginUrl}" class="btn">👉 ወደ ፖርታሉ ይግቡ</a>
    </div>`
  );

  const text = `ሰላም ${opts.name}፣ የይለፍ ቃልዎ ተቀይሯል።\nአዲሱ የይለፍ ቃል: ${opts.password}\nመግቢያ: ${loginUrl}`;

  return { sms, html, text };
}

// ─── 8. Report Notification Templates ───────────────────────────────────────

export function buildReportNotificationTemplates(opts: {
  name: string;
  subject: string;
  message: string;
  loginPath?: string;
}) {
  const loginUrl = `${SITE_URL}${opts.loginPath || "/representative/login"}`;

  const html = wrapEmailTemplate(
    opts.subject,
    "Report Notification",
    `<p>ሰላም ክቡር/ርት <strong>${opts.name}</strong>፣</p>
    <p>${opts.message}</p>
    <div style="text-align:center">
      <a href="${loginUrl}" class="btn">👉 ዝርዝሩን ይመልከቱ</a>
    </div>`
  );

  const text = `ሰላም ${opts.name}፣\n${opts.message}\nመግቢያ: ${loginUrl}`;

  return { sms: opts.message, html, text };
}
