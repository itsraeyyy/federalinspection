"use server";

export async function sendSMS(to: string, message: string) {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;

  if (!apiKey || !deviceId) {
    console.error("Textbee API key or device ID not configured");
    return { error: "Textbee configuration missing" };
  }

  try {
    const response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/sendSMS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        receivers: [to],
        smsBody: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Textbee API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    console.error("Error sending SMS via Textbee:", error);
    return { error: error.message };
  }
}
