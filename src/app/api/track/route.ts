import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Use Service Role Key to bypass RLS since this is a server-side analytics insertion
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase URL or Service Role Key missing. Analytics track failed.');
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
