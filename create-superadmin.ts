import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'superadmin@commission.gov';
  const password = 'SuperAdmin#123';

  console.log(`Creating super admin: ${email}...`);

  // 1. Create or update user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId = authData?.user?.id;

  if (authError) {
    if (authError.message.includes('already exists')) {
      console.log('User already exists in auth.users. Fetching ID...');
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (!listError) {
        const user = usersData.users.find((u: any) => u.email === email);
        if (user) {
          userId = user.id;
          // Update password just in case
          await supabase.auth.admin.updateUserById(userId, { password });
          console.log('Password updated for existing user.');
        }
      }
    } else {
      console.error('Error creating user:', authError);
      return;
    }
  }

  if (!userId) {
    console.error('Could not get user ID.');
    return;
  }

  // 2. Upsert into admin_profiles
  const { error: profileError } = await supabase.from('admin_profiles').upsert({
    id: userId,
    role: 'super_admin',
    permissions: [],
    first_name: 'Super',
    last_name: 'Admin User',
    email: email,
    phone: '0911000001',
    access_level: 'all',
    groups: [],
    modules: [],
    status: 'Active',
    requires_password_change: false,
  });

  if (profileError) {
    console.error('Error inserting admin profile:', profileError);
  } else {
    console.log('Superadmin profile created successfully for', email);
  }
}

main();
