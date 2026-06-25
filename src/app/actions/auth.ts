"use server";

import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/textbee';
import crypto from 'crypto';

export async function verifyLoginAttempt() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

  // Limit: 50 login attempts per 15 minutes per IP (Sensible for testing/NAT)
  const { allowed } = await checkRateLimit(ip, 'login_attempt', 50, 15);
  
  if (!allowed) {
    throw new Error("Too many login attempts. Please try again later.");
  }
  
  return true;
}

// Use the service role key to bypass RLS and Auth restrictions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function registerUserAction(formData: FormData) {
  try {
    const periodId = formData.get('periodId') as string;
    const fullName = formData.get('fullName') as string;
    const rawPhone = formData.get('phone') as string;
    let password = (formData.get('password') as string)?.trim() || '';

    if (!periodId || !fullName || !rawPhone) {
      return { error: 'Missing required fields' };
    }

    // Format phone number to E.164 standard (e.g. +251...)
    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;

    // Generate random password if not provided (Admin flow)
    const isAdminCreated = !password;
    if (isAdminCreated) {
      password = crypto.randomBytes(4).toString('hex'); // 8 characters random string
    }

    // 1. Create user in Supabase Auth bypassing phone confirmation
    // We use a synthetic email to avoid Supabase's 'Phone Logins Disabled' requirement
    const syntheticEmail = `${phone.replace(/\s+/g, '').replace('+', '')}@federal.local`;
    
    let userId;
    
    // First, check if user exists in public.users to prevent split-brain issues
    const { data: existingUser, error: existErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (existingUser?.id) {
      // User exists from a previous phone registration!
      userId = existingUser.id;
      // Update their auth account with the synthetic email and password
      const updatePayload: any = { email: syntheticEmail, email_confirm: true };
      if (password) updatePayload.password = password;
      
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, updatePayload);
      if (updateErr && !updateErr.message.includes('already been registered')) {
        return { error: 'Failed to update existing user authentication: ' + updateErr.message };
      }
    } else {
      // Create a brand new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: password,
        user_metadata: { full_name: fullName, phone: phone }
      });

      if (authError) {
        return { error: authError.message };
      }
      userId = authData.user.id;
    }

    // 2. Upsert into public.users
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .upsert({ id: userId, phone_number: phone, full_name: fullName });

    if (usersError) {
      return { error: 'Failed to update user profile' };
    }

    // 3. Insert into period_members
    const { error: memberError } = await supabaseAdmin
      .from('period_members')
      .insert({ period_id: periodId, user_id: userId, role: 'regular' });

    if (memberError) {
      // If the user was already a member, insert will fail depending on unique constraints.
      // Assuming conflict doesn't happen for a newly created user.
      return { error: 'Failed to add user to period' };
    }

    // 4. Send SMS via Textbee
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment/login`;
    
    let smsMessage = '';
    if (isAdminCreated) {
      smsMessage = `ሰላም ${fullName}፣ ለግምገማ ተመዝግበዋል! (You are registered for assessment).\nመግቢያ (Link): ${loginUrl}\nስልክ (Phone): ${phone}\nየይለፍ ቃል (Password): ${password}`;
    } else {
      smsMessage = `ሰላም ${fullName}፣ ምዝገባዎ ተሳክቷል! (Registration successful).\nመግቢያ (Link): ${loginUrl}\nስልክ (Phone): ${phone}`;
    }

    const smsResult = await sendSMS(phone, smsMessage);
    if (smsResult.error) {
      console.error("SMS Warning:", smsResult.error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Registration action error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function resolveLoginEmail(identifier: string) {
  const lowerId = identifier.trim().toLowerCase();

  if (lowerId === 'superadmin') {
    return { email: 'superadmin@commission.gov' };
  }

  if (lowerId === 'admin') {
    // Attempt to return the primary admin email
    const { data: defaultAdmin } = await supabaseAdmin
      .from('admin_profiles')
      .select('email')
      .eq('role', 'super_admin')
      .limit(1)
      .maybeSingle();
      
    if (defaultAdmin?.email) {
      return { email: defaultAdmin.email };
    }
    // Fallback just in case
    return { email: 'admin@commission.gov' };
  }

  if (identifier.includes('@')) {
    return { email: identifier.trim() };
  }
  
  const cleanPhone = identifier.trim();
  const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;

  // Check if it's an admin first
  const { data: adminData } = await supabaseAdmin
    .from('admin_profiles')
    .select('email')
    .eq('phone', phone)
    .maybeSingle();

  if (adminData?.email) {
    return { email: adminData.email };
  }

  // Fallback to synthetic email for regular users
  return { email: `${phone.replace(/\s+/g, '').replace('+', '')}@federal.local` };
}

export async function resetPasswordAction(rawPhone: string) {
  try {
    if (!rawPhone) return { error: 'Phone number is required' };

    // Format phone to E.164
    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;

    let userId;
    let userName;

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, full_name')
      .eq('phone_number', phone)
      .maybeSingle();

    if (userData) {
      userId = userData.id;
      userName = userData.full_name;
    } else {
      const { data: adminData } = await supabaseAdmin
        .from('admin_profiles')
        .select('id, first_name, last_name')
        .eq('phone', phone)
        .maybeSingle();
        
      if (adminData) {
        userId = adminData.id;
        userName = `${adminData.first_name} ${adminData.last_name || ''}`.trim();
      }
    }

    if (!userId) {
      return { error: 'User not found' };
    }

    // 2. Generate new password
    const newPassword = crypto.randomBytes(4).toString('hex'); // 8 characters

    // 3. Force update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      return { error: 'Failed to reset password' };
    }

    // 4. Send SMS via Textbee
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment/login`;
    const smsMessage = `ሰላም ${userName}፣ የይለፍ ቃልዎ ተቀይሯል።\nአዲሱ የይለፍ ቃል (New Password): ${newPassword}\nመግቢያ (Link): ${loginUrl}`;

    const smsResult = await sendSMS(phone, smsMessage);
    if (smsResult.error) {
      console.error("SMS Warning in reset:", smsResult.error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function sendOtpAction(rawPhone: string) {
  try {
    if (!rawPhone) return { error: 'Phone number is required' };

    // Format phone
    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;

    let userId;
    let userName;

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, full_name')
      .eq('phone_number', phone)
      .maybeSingle();

    if (userData) {
      userId = userData.id;
      userName = userData.full_name;
    } else {
      const { data: adminData } = await supabaseAdmin
        .from('admin_profiles')
        .select('id, first_name, last_name')
        .eq('phone', phone)
        .maybeSingle();
        
      if (adminData) {
        userId = adminData.id;
        userName = `${adminData.first_name} ${adminData.last_name || ''}`.trim();
      }
    }

    if (!userId) {
      return { error: 'User not found' };
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Save OTP to db
    const { error: otpError } = await supabaseAdmin
      .from('otp_requests')
      .insert({
        phone_number: phone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString()
      });

    if (otpError) {
      console.error("OTP Insert Error:", otpError);
      return { error: 'Failed to generate OTP' };
    }

    // Send SMS
    const smsMessage = `የማረጋገጫ ኮድዎ (Your Verification Code): ${otpCode}\nበ10 ደቂቃ ውስጥ ይጠቀሙ (Expires in 10 mins).`;
    const smsResult = await sendSMS(phone, smsMessage);
    
    if (smsResult.error) {
      console.error("SMS Error:", smsResult.error);
      return { error: 'Failed to send SMS' };
    }

    return { success: true, phone };
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function verifyOtpAction(phone: string, otpCode: string) {
  try {
    if (!phone || !otpCode) return { error: 'Phone and OTP are required' };

    // Find the latest valid OTP for this phone
    const { data: otpRecords, error: otpError } = await supabaseAdmin
      .from('otp_requests')
      .select('id, expires_at, used')
      .eq('phone_number', phone)
      .eq('otp_code', otpCode)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return { error: 'Invalid or expired OTP' };
    }

    const otpRecord = otpRecords[0];
    
    // Check expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      return { error: 'OTP has expired' };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function resetPasswordWithOtpAction(phone: string, otpCode: string, newPassword: string) {
  try {
    if (!phone || !otpCode || !newPassword) return { error: 'Missing required fields' };

    // Find valid OTP again
    const { data: otpRecords, error: otpError } = await supabaseAdmin
      .from('otp_requests')
      .select('id, expires_at, used')
      .eq('phone_number', phone)
      .eq('otp_code', otpCode)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return { error: 'Invalid or expired OTP' };
    }

    const otpRecord = otpRecords[0];
    
    if (new Date(otpRecord.expires_at) < new Date()) {
      return { error: 'OTP has expired' };
    }

    // OTP is valid. Find user ID
    let userId;

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .maybeSingle();

    if (userData) {
      userId = userData.id;
    } else {
      const { data: adminData } = await supabaseAdmin
        .from('admin_profiles')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      if (adminData) {
        userId = adminData.id;
      }
    }

    if (!userId) {
      return { error: 'User not found' };
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      return { error: 'Failed to reset password: ' + updateError.message };
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otp_requests')
      .update({ used: true })
      .eq('id', otpRecord.id);

    return { success: true };
  } catch (error: any) {
    console.error("Reset password with OTP error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}
