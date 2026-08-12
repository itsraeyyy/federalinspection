import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_PASSWORD = 'Password123!';

async function syncAllRepresentativesToAuth() {
  console.log("=== Synchronizing ALL Representative Accounts into Supabase Auth ===");

  // Fetch all user_profiles with system_role = 'representative'
  const { data: repProfiles, error: profErr } = await supabaseAdmin
    .from('user_profiles')
    .select('*, users(*)')
    .eq('system_role', 'representative');

  if (profErr) {
    console.error("Error fetching representative profiles:", profErr);
    return;
  }

  console.log(`Found ${repProfiles?.length || 0} representative profiles in database.`);

  for (const prof of repProfiles || []) {
    const user = prof.users;
    if (!user || !user.phone_number) {
      console.log(`Skipping profile ${prof.user_id} - missing user or phone number.`);
      continue;
    }

    const rawPhone = user.phone_number.trim();
    const e164Phone = rawPhone.startsWith('+') ? rawPhone : `+251${rawPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;
    const syntheticEmail = `${e164Phone.replace(/\s+/g, '').replace('+', '')}@federal.local`;
    const userId = prof.user_id;

    console.log(`\nSyncing Rep: ${user.full_name} (${rawPhone}) -> ID: ${userId} -> Synthetic Email: ${syntheticEmail}`);

    // Check if auth user exists by ID or by email
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (existingUser?.user) {
      console.log(`Found existing auth user for ID ${userId}. Updating password and email...`);
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: syntheticEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          phone: e164Phone,
          force_password_change: false,
          requires_password_change: false
        }
      });
      if (updateErr) console.error("Error updating auth user:", updateErr.message);
      else console.log("Updated auth user successfully!");
    } else {
      console.log(`Creating new auth user for ID ${userId}...`);
      const { data: newAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        id: userId,
        email: syntheticEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          phone: e164Phone,
          force_password_change: false,
          requires_password_change: false
        }
      });

      if (createErr) {
        if (createErr.message.includes('already registered')) {
          // If email was registered under a different ID, update that auth user's password
          const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
          const found = usersList?.users?.find(u => u.email === syntheticEmail);
          if (found) {
            await supabaseAdmin.auth.admin.updateUserById(found.id, {
              password: DEFAULT_PASSWORD,
              email_confirm: true,
              user_metadata: { full_name: user.full_name, phone: e164Phone }
            });
            console.log(`Updated existing email auth user ID ${found.id}`);
          }
        } else {
          console.error("Error creating auth user:", createErr.message);
        }
      } else {
        console.log("Created auth user successfully!");
      }
    }

    // Verify login with anon client
    const { error: loginErr } = await supabaseAnon.auth.signInWithPassword({
      email: syntheticEmail,
      password: DEFAULT_PASSWORD
    });

    if (loginErr) {
      console.error(`❌ Verification login FAILED for ${syntheticEmail}:`, loginErr.message);
    } else {
      console.log(`✅ Verification login SUCCESSFUL for ${user.full_name} (${syntheticEmail})`);
    }
  }

  console.log("\n=== ALL REPRESENTATIVE ACCOUNTS SYNCHRONIZED AND VERIFIED ===");
}

syncAllRepresentativesToAuth().catch(console.error);
