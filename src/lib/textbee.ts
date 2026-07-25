"use server";

export async function sendSMS(to: string, message: string) {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;

  const formattedPhone = to.startsWith('+') ? to : `+251${to.replace(/^0+/, '').replace(/\s+/g, '')}`;

  if (!apiKey || !deviceId) {
    console.warn(`\n=== [SMS DISPATCH SIMULATION] ===\nTo: ${formattedPhone}\nMessage: ${message}\nNote: Add TEXTBEE_API_KEY and TEXTBEE_DEVICE_ID to .env for live SMS delivery via Textbee gateway.\n=================================\n`);
    return { 
      success: true, 
      simulated: true, 
      warning: "Textbee configuration missing in .env. SMS outputted to terminal console." 
    };
  }

  try {
    const response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        receivers: [formattedPhone],
        smsBody: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Textbee Error ${response.status}]:`, errorText);
      return { error: `Textbee API Error (${response.status}): ${errorText}` };
    }

    const data = await response.json();
    console.log(`[SMS SENT via Textbee] to ${formattedPhone}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending SMS via Textbee:", error);
    return { error: error.message || "Failed to reach Textbee SMS Gateway" };
  }
}

