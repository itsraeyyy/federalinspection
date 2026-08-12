import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'Password123!';

async function setupComplaintAndSystemUsers() {
  console.log("Setting up Complaint & System Users in Supabase Auth...");

  // Known user IDs from database admin_profiles
  const adminUsers = [
    {
      id: 'd20d57dc-4f3c-4155-8cb4-b250b4feaaee',
      email: 'leader@commission.gov',
      phone: '0911223344',
      password: DEFAULT_PASSWORD,
      first_name: 'ኮሚቴ',
      last_name: 'ሰብሳቢ (Leader 1)',
      role: 'committee_leader',
      access_level: 'specific',
      modules: ['complaints', 'abetuta', 'tikoma'],
      requires_password_change: false
    },
    {
      id: '91abdad8-0256-46f0-abb4-fb85b439d01b',
      email: 'leader2@commission.gov',
      phone: '0911223345',
      password: DEFAULT_PASSWORD,
      first_name: 'Committee',
      last_name: 'Leader 2',
      role: 'committee_leader',
      access_level: 'specific',
      modules: ['complaints', 'abetuta', 'tikoma'],
      requires_password_change: false
    },
    {
      id: 'b8fcb741-2f9b-41d8-b9c5-4a279051153a',
      email: 'superadmin@commission.gov',
      phone: '0911000001',
      password: 'SuperAdmin#123',
      first_name: 'Super',
      last_name: 'Admin User',
      role: 'super_admin',
      access_level: 'all',
      modules: [],
      requires_password_change: false
    },
    {
      id: 'b61f38f6-00b8-4c6c-8b97-f437df23976f',
      email: 'mainadmin@commission.gov',
      phone: '0911223355',
      password: DEFAULT_PASSWORD,
      first_name: 'ዋና',
      last_name: 'አስተዳዳሪ (Admin)',
      role: 'super_admin',
      access_level: 'all',
      modules: [],
      requires_password_change: false
    },
    {
      id: 'a38b4ed4-fdcf-4b3e-aec9-1a41392f4bba',
      email: 'admin@commission.gov',
      phone: '000000000',
      password: 'Admin@123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'super_admin',
      access_level: 'all',
      modules: [],
      requires_password_change: false
    }
  ];

  for (const user of adminUsers) {
    console.log(`Processing admin user: ${user.email} (${user.role})...`);

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: `${user.first_name} ${user.last_name}`,
        phone: user.phone
      }
    });

    if (updateErr) {
      console.error(`Error updating password for ${user.email}:`, updateErr.message);
    } else {
      console.log(`Successfully updated password for ${user.email} -> Password: ${user.password}`);
    }

    // Upsert admin profile
    const { error: profileErr } = await supabaseAdmin.from('admin_profiles').upsert({
      id: user.id,
      role: user.role,
      permissions: [],
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      access_level: user.access_level,
      groups: [],
      modules: user.modules,
      status: 'Active',
      requires_password_change: user.requires_password_change
    });

    if (profileErr) {
      console.error(`Error upserting admin profile for ${user.email}:`, profileErr.message);
    } else {
      console.log(`Admin profile synced for ${user.email}`);
    }
  }

  // Verify Committee Leader login with anon client
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseAnon = createClient(supabaseUrl, anonKey);

  console.log("\nTesting Committee Leader login (leader@commission.gov)...");
  const { data: loginData, error: loginErr } = await supabaseAnon.auth.signInWithPassword({
    email: 'leader@commission.gov',
    password: DEFAULT_PASSWORD
  });

  if (loginErr) {
    console.error("Login verification failed:", loginErr.message);
  } else {
    console.log("✅ Login verification SUCCESSFUL for leader@commission.gov!");
  }

  console.log("\nSetup and verification completed successfully!");
}

setupComplaintAndSystemUsers().catch(console.error);
