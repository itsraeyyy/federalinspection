'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateTempPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function provisionAdmin(data: any) {
  try {
    const role = data.accessLevel === 'all' ? 'super_admin' : 'admin';
    const email = data.email;
    const tempPassword = generateTempPassword();

    // 1. Create the user using Supabase Admin Auth API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User creation failed.' };
    }

    const userId = authData.user.id;
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // 2. Insert into admin_profiles
    const { error: profileError } = await supabaseAdmin.from('admin_profiles').insert({
      id: userId,
      role: role,
      permissions: [], 
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: data.phone,
      access_level: data.accessLevel,
      groups: [],
      modules: data.modules || [],
      status: data.status,
      requires_password_change: true,
    });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return { success: false, error: 'Profile creation failed: ' + profileError.message };
    }

    // 3. Send email via Resend
    const { error: resendError } = await resend.emails.send({
      from: 'CIDMS Admin <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to CIDMS - Admin Access',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset & Typography */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F4F4F5;
      margin: 0;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Main Container */
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
      border: 1px solid #E4E4E7;
    }

    /* Prosperity Brand Header */
    .header {
      background-color: #0B2B5E; /* Deep Prosperity Navy */
      padding: 40px;
      text-align: center;
      border-bottom: 4px solid #F5C242; /* Refined Gold/Yellow Accent */
    }
    
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    /* Body Content */
    .content {
      padding: 48px 40px;
      color: #27272A;
    }
    
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px;
      color: #52525B;
    }

    /* Secure Credentials Block */
    .credentials-box {
      background-color: #FAFAFA;
      border: 1px solid #E4E4E7;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .credentials-box .label {
      margin: 0 0 12px;
      font-size: 12px;
      color: #71717A;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    
    .password {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 22px;
      font-weight: 700;
      color: #18181B;
      background: #E4E4E7;
      padding: 10px 20px;
      border-radius: 6px;
      display: inline-block;
      letter-spacing: 2px;
    }

    /* Primary Action Button */
    .btn-container {
      text-align: center;
      margin-bottom: 10px;
    }
    
    .btn {
      display: inline-block;
      background-color: #0B2B5E;
      color: #FFFFFF;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 16px;
      transition: background-color 0.2s ease;
    }

    /* Footer */
    .footer {
      padding: 32px 40px;
      background-color: #FAFAFA;
      text-align: center;
      border-top: 1px solid #E4E4E7;
    }
    
    .footer p {
      margin: 0;
      font-size: 13px;
      color: #A1A1AA;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <h1>CIDMS Admin Portal</h1>
    </div>

    <div class="content">
      <p>Welcome to the dashboard,</p>
      <p>An administrator account has been provisioned for you. You now have access to the secure portal to manage system configurations and oversight.</p>
      
      <div class="credentials-box">
        <div class="label">Your Temporary Password</div>
        <div class="password">${tempPassword}</div>
      </div>

      <p style="font-size: 14px; color: #71717A; text-align: center; margin-bottom: 32px;">
        For security purposes, you will be required to change this password immediately upon your first login.
      </p>

      <div class="btn-container">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login" class="btn">Access Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated security message from the CIDMS Infrastructure.</p>
      <p>If you did not expect this invitation, please contact your system administrator.</p>
    </div>
  </div>

</body>
</html>
      `,
    });

    if (resendError) {
      console.error('Error sending email:', resendError);
    }

    revalidatePath('/dashboard/admins');
    return { success: true, message: `Admin ${email} provisioned successfully.` };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}
