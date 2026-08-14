/**
 * SMS Sending Service
 * Uses Textbee SMS Gateway API with error handling and phone number formatting.
 */

const TEXTBEE_BASE_URL = process.env.TEXTBEE_BASE_URL || "https://api.textbee.dev";
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
 * Sends an SMS message to a mobile recipient.
 */
export async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    return { success: false, error: "Invalid or empty phone number" };
  }

  if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
    console.warn("[SMS Service] TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID missing. SMS log only:", {
      to: formattedPhone,
      message,
    });
    // Return mock success in dev environment if gateway is unconfigured
    return { success: true, messageId: "dev-simulated-sms-id" };
  }

  try {
    const url = `${TEXTBEE_BASE_URL}/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TEXTBEE_API_KEY,
      },
      body: JSON.stringify({
        recipients: [formattedPhone],
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SMS Service Gateway Error ${response.status}]:`, errorText);
      return { success: false, error: `SMS Gateway returned ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    console.log(`[SMS Sent Successfully] to ${formattedPhone}`);
    return { success: true, messageId: data.id || data.messageId };
  } catch (error: any) {
    console.error("[SMS Service Exception]:", error);
    return { success: false, error: error.message || "Failed to send SMS" };
  }
}
