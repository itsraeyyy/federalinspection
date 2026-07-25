import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

// Parse user-agent to determine device type
function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'Mobile';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

export async function POST(req: Request) {
  try {
    const { path, referrer } = await req.json();

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
    const deviceType = getDeviceType(userAgent);
    
    // For country, we might use Vercel headers if deployed there, or Cloudflare headers
    const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'Unknown';


    const { error } = await supabase
      .from('page_views')
      .insert([
        {
          path,
          referrer,
          user_agent: userAgent,
          ip_address: ip,
          device_type: deviceType,
          country
        }
      ]);

    if (error) {
      console.error('Failed to insert page view:', error);
      return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
