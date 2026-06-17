'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function provisionAdmin(email: string, role: 'admin' | 'super_admin', permissions: string[]) {
  try {
    // 1. Create the user using Supabase Admin Auth API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (authError) {
      console.error('Error inviting user:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User creation failed.' };
    }

    const userId = authData.user.id;

    // 2. Insert into admin_profiles
    const { error: profileError } = await supabaseAdmin.from('admin_profiles').insert({
      id: userId,
      role: role,
      permissions: permissions,
    });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      // Rollback is manual here if needed, but since invite is sent, maybe just return error.
      return { success: false, error: 'Profile creation failed: ' + profileError.message };
    }

    return { success: true, message: `Admin ${email} provisioned successfully.` };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}
