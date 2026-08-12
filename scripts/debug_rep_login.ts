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

async function debugRepLogin() {
  console.log("=== Debugging Representative Logins ===");

  const testPhones = [
    '0911000001',
    '+251911000001',
    '0900969037',
    '+251900969037'
  ];

  for (const phoneInput of testPhones) {
    const rawPhone = phoneInput.trim();
    const e164Phone = rawPhone.startsWith('+') ? rawPhone : `+251${rawPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;
    const syntheticEmail = `${e164Phone.replace(/\s+/g, '').replace('+', '')}@federal.local`;

    console.log(`\nTesting Phone Input: "${phoneInput}" -> e164Phone: "${e164Phone}" -> syntheticEmail: "${syntheticEmail}"`);

    // Check public.users
    const { data: pubUser } = await supabaseAdmin.from('users').select('*').or(`phone_number.eq.${phoneInput},phone_number.eq.${e164Phone}`).maybeSingle();
    console.log("public.users record:", pubUser ? `Found ID=${pubUser.id}, Phone=${pubUser.phone_number}` : "NOT FOUND");

    let userId = pubUser?.id;

    // Check user_profiles
    if (userId) {
      const { data: profile } = await supabaseAdmin.from('user_profiles').select('*').eq('user_id', userId).maybeSingle();
      console.log("user_profiles record:", profile ? `Found system_role=${profile.system_role}, region=${profile.region}` : "NOT FOUND");
    }

    // Check Auth user
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authList?.users?.find(u => u.email === syntheticEmail || u.id === userId);
    console.log("auth.users record:", authUser ? `Found AuthID=${authUser.id}, Email=${authUser.email}` : "NOT FOUND");

    if (authUser) {
      // Force update password and confirm email to ensure 100% valid login
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        email: syntheticEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: pubUser?.full_name || 'Representative',
          phone: e164Phone,
          force_password_change: false,
          requires_password_change: false
        }
      });
      if (updateErr) {
        console.error("Error updating auth user password:", updateErr.message);
      } else {
        console.log(`Updated Auth user (${syntheticEmail}) password to "${DEFAULT_PASSWORD}"`);
      }

      // Test signInWithPassword using anon client (same client browser uses)
      const { data: loginData, error: loginErr } = await supabaseAnon.auth.signInWithPassword({
        email: syntheticEmail,
        password: DEFAULT_PASSWORD
      });

      if (loginErr) {
        console.error("❌ Anon login FAILED:", loginErr.message);
      } else {
        console.log("✅ Anon login SUCCESSFUL! User ID:", loginData.user.id);
      }
    }
  }
}

debugRepLogin().catch(console.error);
