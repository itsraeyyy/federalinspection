/**
 * SMS Sending Service
 * Uses Textbee SMS Gateway API with error handling and phone number formatting.
 */

const TEXTBEE_BASE_URL = process.env.TEXTBEE_BASE_URL || "https://api.text.raey.work";
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Format phone number to standard international format or clean 09/07 format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9+]/g, "");

  // Convert 09... or 07... to +2519... / +2517... if international format needed
  if (cleaned.startsWith("0")) {
    cleaned = "+251" + cleaned.substring(1);
  } else if (!cleaned.startsWith("+") && cleaned.startsWith("251")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

/**
 * Sends an SMS message to a mobile recipient via Textbee gateway.
 */
export async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    return { success: false, error: "Invalid or empty phone number" };
  }

  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  const baseUrl = process.env.TEXTBEE_BASE_URL || "https://api.text.raey.work";

  if (!apiKey || !deviceId) {
    console.warn("[SMS Service] TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID missing. SMS log only:", {
      to: formattedPhone,
      message,
    });
    return { success: true, messageId: "dev-simulated-sms-id" };
  }

  const baseUrls = Array.from(new Set([
    baseUrl,
    "https://api.text.raey.work",
    "https://api.textbee.dev"
  ]));

  let lastError = "";

  for (const currentUrl of baseUrls) {
    // Format 1: send-sms (recipients / message)
    try {
      const url1 = `${currentUrl}/api/v1/gateway/devices/${deviceId}/send-sms`;
      const response1 = await fetch(url1, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          recipients: [formattedPhone],
          message: message,
        }),
      });

      if (response1.ok) {
        const data = await response1.json();
        console.log(`[SMS Sent Successfully via ${currentUrl}] to ${formattedPhone}`);
        return { success: true, messageId: data.id || data.messageId || "sent" };
      }
      lastError = await response1.text();
    } catch (err: any) {
      lastError = err.message || "Network error";
    }

    // Format 2: sendSMS (receivers / smsBody)
    try {
      const url2 = `${currentUrl}/api/v1/gateway/devices/${deviceId}/sendSMS`;
      const response2 = await fetch(url2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          receivers: [formattedPhone],
          smsBody: message,
        }),
      });

      if (response2.ok) {
        const data = await response2.json();
        console.log(`[SMS Sent Successfully via ${currentUrl} sendSMS] to ${formattedPhone}`);
        return { success: true, messageId: data.id || data.messageId || "sent" };
      }
      lastError = await response2.text();
    } catch (err: any) {
      lastError = err.message || "Network error";
    }
  }

  console.error(`[SMS Service Error]:`, lastError);
  return { success: false, error: lastError || "Failed to send SMS" };
}
