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

async function listAndSyncRepresentatives() {
  console.log("=== Fetching Representative Accounts ===");

  // 1. Fetch user_profiles where system_role = 'representative'
  const { data: repProfiles, error: pErr } = await supabaseAdmin
    .from('user_profiles')
    .select('*, users(*)')
    .eq('system_role', 'representative');

  if (pErr) {
    console.error("Error fetching user_profiles:", pErr);
    return;
  }

  console.log(`Found ${repProfiles?.length || 0} representative profile(s) in user_profiles table.\n`);

  const results = [];

  for (const prof of repProfiles || []) {
    const user = prof.users;
    const phone = user?.phone_number || 'N/A';
    const name = user?.full_name || 'Representative User';
    const region = prof.region || 'Addis Ababa';
    const userId = prof.user_id;

    // Update password to DEFAULT_PASSWORD in Supabase Auth to ensure working login
    let authStatus = "OK";
    if (userId) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: DEFAULT_PASSWORD,
        email_confirm: true
      });
      if (authErr) authStatus = `Failed to update password: ${authErr.message}`;
    }

    results.push({
      userId,
      phone,
      name,
      region,
      password: DEFAULT_PASSWORD,
      authStatus
    });
  }

  // Also check if any representative exists in users without user_profiles or if sample rep exists
  if (results.length === 0) {
    console.log("No representative profiles found. Setting up sample representative account...");
    const repPhone = '+251911000001';
    const cleanPhone = '0911000001';
    const repEmail = '251911000001@federal.local';
    const fullName = 'Sample Representative';
    const region = 'አዲስ አበባ (Addis Ababa)';

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existing = usersData?.users?.find(u => u.email?.toLowerCase() === repEmail.toLowerCase() || u.phone === repPhone);

    let repUserId = existing?.id;

    if (existing) {
      await supabaseAdmin.auth.admin.updateUserById(repUserId!, {
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone: repPhone }
      });
    } else {
      const { data: newRep } = await supabaseAdmin.auth.admin.createUser({
        email: repEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone: repPhone }
      });
      repUserId = newRep?.user?.id;
    }

    if (repUserId) {
      await supabaseAdmin.from('users').upsert({ id: repUserId, phone_number: repPhone, full_name: fullName });
      await supabaseAdmin.from('user_profiles').upsert({
        user_id: repUserId,
        system_role: 'representative',
        region: 'አዲስ አበባ'
      });

      results.push({
        userId: repUserId,
        phone: cleanPhone + ' (or ' + repPhone + ')',
        name: fullName,
        region: region,
        password: DEFAULT_PASSWORD,
        authStatus: "Created & Synced"
      });
    }
  }

  console.log("=== REPRESENTATIVE CREDENTIALS SUMMARY ===");
  console.table(results);
}

listAndSyncRepresentatives().catch(console.error);
