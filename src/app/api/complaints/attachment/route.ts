import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function isFileInComplaint(item: any, targetPath: string): boolean {
  if (!item || !targetPath) return false;
  const cleanTarget = targetPath.toLowerCase().trim();
  const filenameOnly = cleanTarget.includes('/') ? cleanTarget.split('/').pop() || cleanTarget : cleanTarget;

  const checkItem = (fileObj: any): boolean => {
    if (!fileObj) return false;
    if (typeof fileObj === 'string') {
      const str = fileObj.toLowerCase();
      return str.includes(cleanTarget) || (filenameOnly.length > 3 && str.includes(filenameOnly));
    }
    if (typeof fileObj === 'object') {
      const p = (fileObj.filePath || fileObj.path || fileObj.url || fileObj.filename || '').toLowerCase();
      return p.includes(cleanTarget) || (filenameOnly.length > 3 && p.includes(filenameOnly));
    }
    return false;
  };

  const checkList = (list: any): boolean => {
    if (!Array.isArray(list)) return false;
    return list.some(checkItem);
  };

  if (checkList(item.attachments)) return true;

  const res = item.resolution;
  if (res) {
    if (checkList(res.attachments)) return true;
    if (checkList(res.decisionIdeaFiles)) return true;
    if (checkList(res.files)) return true;
    if (checkItem(res)) return true;
  }

  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('filePath') || searchParams.get('path');
  const trackingCode = searchParams.get('trackingCode') || searchParams.get('code');
  const shouldRedirect = searchParams.get('redirect') === 'true';

  if (!rawPath) {
    return NextResponse.json({ error: 'Missing filePath parameter' }, { status: 400 });
  }

  // Clean relative file path inside complaints bucket
  let cleanFilePath = rawPath;
  if (cleanFilePath.includes('/complaints/')) {
    const parts = cleanFilePath.split('/complaints/');
    if (parts.length > 1) {
      cleanFilePath = parts[1].split('?')[0];
    }
  } else if (cleanFilePath.includes('?')) {
    cleanFilePath = cleanFilePath.split('?')[0];
  }

  let isAuthorized = false;

  // 1. Check if user is an authenticated Admin / Leader via Session Header or Cookie
  const authHeader = request.headers.get('Authorization');
  const cookieHeader = request.headers.get('Cookie');

  if (authHeader || cookieHeader) {
    try {
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      if (token) {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (!userErr && userData?.user) {
          isAuthorized = true;
        }
      }
    } catch (e) {
      console.warn('Admin token check warning:', e);
    }
  }

  // 2. Structural path verification (decision-ideas/{id}/..., resolutions/{id}/..., submissions/{trackingCode}/...)
  if (!isAuthorized) {
    try {
      const pathParts = cleanFilePath.split('/');
      if (pathParts.length >= 2) {
        const folder = pathParts[0]; // e.g. 'decision-ideas', 'resolutions', 'submissions'
        const identifier = pathParts[1]; // complaint UUID id or trackingCode

        if (folder === 'submissions') {
          const { data: complaintData } = await supabaseAdmin
            .from('complaints')
            .select('*')
            .eq('tracking_code', identifier)
            .maybeSingle();

          if (complaintData && isFileInComplaint(complaintData, cleanFilePath)) {
            isAuthorized = true;
          }
        } else if (folder === 'decision-ideas' || folder === 'resolutions') {
          const { data: complaintData } = await supabaseAdmin
            .from('complaints')
            .select('*')
            .eq('id', identifier)
            .maybeSingle();

          if (complaintData && isFileInComplaint(complaintData, cleanFilePath)) {
            isAuthorized = true;
          }
        }
      }
    } catch (e) {
      console.error('Path ownership verification error:', e);
    }
  }

  // 3. Fallback: check explicitly passed trackingCode
  if (!isAuthorized && trackingCode) {
    try {
      const { data: complaintData } = await supabaseAdmin
        .from('complaints')
        .select('*')
        .eq('tracking_code', trackingCode)
        .maybeSingle();

      if (complaintData && isFileInComplaint(complaintData, cleanFilePath)) {
        isAuthorized = true;
      }
    } catch (e) {
      console.error('Tracking code verification error:', e);
    }
  }

  // If unauthorized, deny access
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized file access. Valid admin session or matching tracking code required.' },
      { status: 403 }
    );
  }

  // Issue short-lived 5-minute (300s) signed URL for private bucket
  try {
    const { data: signedData, error: signedErr } = await supabaseAdmin
      .storage
      .from('complaints')
      .createSignedUrl(cleanFilePath, 300);

    if (signedErr || !signedData?.signedUrl) {
      console.error('Error generating signed URL:', signedErr);
      return NextResponse.json({ error: 'Could not generate secure file URL' }, { status: 500 });
    }

    if (shouldRedirect) {
      return NextResponse.redirect(signedData.signedUrl);
    }

    return NextResponse.json({ signedUrl: signedData.signedUrl, expiresInSeconds: 300 });
  } catch (err) {
    console.error('Secure download exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
