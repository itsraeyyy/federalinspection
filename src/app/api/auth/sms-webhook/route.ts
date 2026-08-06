import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Supabase custom SMS provider payload format
    const phone = body.user?.phone;
    const otp = body.sms?.otp;

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Missing phone or OTP in payload' }, { status: 400 });
    }

    const deviceId = process.env.TEXTBEE_DEVICE_ID;
    const apiKey = process.env.TEXTBEE_API_KEY;
    const baseUrl = process.env.TEXTBEE_BASE_URL || "https://api.text.raey.work";

    if (!deviceId || !apiKey) {
      console.error('Textbee environment variables (TEXTBEE_DEVICE_ID, TEXTBEE_API_KEY) are missing');
      // For local development, if missing, just log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV MODE] Would send SMS to ${phone} with OTP: ${otp}`);
        return NextResponse.json({ success: true, mock: true });
      }
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Format phone number if needed (Textbee expects international format usually)
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const response = await fetch(`${baseUrl}/api/v1/gateway/devices/${deviceId}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        recipients: [formattedPhone],
        message: `Your Federal Inspection Assessment login code is: ${otp}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Textbee API Error:', errorText);
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SMS webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
