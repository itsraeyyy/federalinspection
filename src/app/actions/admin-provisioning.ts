'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { notifyAdminCreated } from '@/lib/notify';

function generateTempPassword(length = 6) {
  const charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function provisionAdmin(data: any) {
  try {
    let role = data.accessLevel === 'all' ? 'super_admin' : 'admin';
    let modules = data.modules || [];

    if (data.accessLevel === 'specific') {
      if (data.specificRoleType === 'committee_leader' || data.role === 'committee_leader') {
        role = 'committee_leader';
        modules = Array.from(new Set([...modules, 'complaints', 'committee-leader', 'abetuta', 'tikoma']));
      } else if (data.specificRoleType === 'complaint_receiver') {
        role = 'admin';
        modules = Array.from(new Set([...modules, 'complaints']));
      } else if (data.specificRoleType === 'content_manager') {
        role = 'admin';
        modules = Array.from(new Set([...modules, 'news', 'documents']));
      } else if (data.specificRoleType === 'assessment_coordinator') {
        role = 'admin';
        modules = Array.from(new Set([...modules, 'assessment', 'personnel', 'statistics']));
      } else if (data.specificRoleType === 'reports_officer') {
        role = 'admin';
        modules = Array.from(new Set([...modules, 'forms', 'admin_forms', 'statistics', 'map']));
      } else if (data.specificRoleType === 'training_coordinator') {
        role = 'admin';
        modules = Array.from(new Set([...modules, 'sletena', 'feedback', 'qr-access']));
      } else if (data.specificRoleType === 'personnel_manager') {
        role = 'admin';
        modules = Array.from(new Set([...modules, 'personnel', 'qr-access']));
      } else {
        role = 'admin';
      }
    } else if (data.accessLevel === 'all') {
      role = 'super_admin';
      modules = [];
    }

    const email = data.email;
    const tempPassword = generateTempPassword();

    // 1. Create the user using Supabase Admin Auth API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.name,
        phone: data.phone,
        role: role,
        force_password_change: true,
        requires_password_change: true,
      },
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
      modules: modules,
      status: data.status,
      requires_password_change: true,
    });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return { success: false, error: 'Profile creation failed: ' + profileError.message };
    }

    // Upsert into users table for cross-table phone mapping
    if (data.phone) {
      const cleanPhone = data.phone.startsWith('+') ? data.phone.trim() : `+251${data.phone.trim().replace(/^0+/, '').replace(/\s+/g, '')}`;
      await supabaseAdmin.from('users').upsert({
        id: userId,
        phone_number: cleanPhone,
        full_name: data.name,
      });
    }

    // 3. Send welcome notification (email first for admins, SMS as fallback)
    await notifyAdminCreated({
      phone: data.phone,
      email: data.email,
      name: data.name,
      password: tempPassword,
      role,
    });

    revalidatePath('/dashboard/admins');
    return { success: true, message: `Admin ${email} provisioned successfully.` };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    if (!id) {
      return { success: false, error: 'Admin ID is required' };
    }

    // 1. Delete profile record from admin_profiles table in DB
    const { error: dbError } = await supabaseAdmin
      .from('admin_profiles')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting admin profile from database:', dbError);
      return { success: false, error: 'Database deletion failed: ' + dbError.message };
    }

    // 2. Delete user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Error deleting user from Supabase Auth:', authError);
    }

    revalidatePath('/dashboard/admins');
    return { success: true, message: 'Admin user deleted successfully from database and auth.' };
  } catch (err: any) {
    console.error('Error deleting admin user:', err);
    return { success: false, error: err.message || 'An error occurred while deleting admin.' };
  }
}
