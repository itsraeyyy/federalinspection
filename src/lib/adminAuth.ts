import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function verifyAdminUser(userId: string, email?: string): Promise<boolean> {
  try {
    let { data: profile } = await supabaseAdmin
      .from('admin_profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    // Auto-heal missing profile record for initial default superadmin/admin accounts
    const isSuperAdminEmail = email === 'superadmin@commission.gov' || email === 'admin@commission.gov';

    if (!profile && isSuperAdminEmail && email) {
      const { data: newProfile } = await supabaseAdmin
        .from('admin_profiles')
        .upsert({
          id: userId,
          email: email,
          role: 'super_admin',
          status: 'Active',
          first_name: 'Super',
          last_name: 'Admin',
          phone: '0911000001',
          access_level: 'all',
          groups: [],
          modules: [],
          permissions: [],
          requires_password_change: false,
        })
        .select('role, status')
        .maybeSingle();
        
      profile = newProfile || { role: 'super_admin', status: 'Active' };
    }

    if (!profile) return false;
    
    // Accept active status (case-insensitive) or active role
    if (profile.status && profile.status.toLowerCase() !== 'active') {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Admin verification error:", error);
    return false;
  }
}
