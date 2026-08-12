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

async function testSingleRep() {
  const userId = '194318dc-f14a-4b41-a11e-b91630d7d3ae';
  console.log("=== Testing Single Rep User ===");

  const { data: userData, error: getUserErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  console.log("getUserById result:", userData?.user ? `ID: ${userData.user.id}, Email: ${userData.user.email}, Phone: ${userData.user.phone}` : getUserErr?.message);

  if (!userData?.user) {
    console.log("User does not exist in Auth. Creating user with ID...");
    const { data: newU, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email: '251911000001@federal.local',
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Sample Representative', phone: '+251911000001' }
    });
    console.log("Create user result:", newU?.user ? "CREATED" : createErr?.message);
  } else {
    console.log("Updating password to Password123!...");
    const { data: updatedU, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: '251911000001@federal.local',
      password: 'Password123!',
      email_confirm: true
    });
    console.log("Update user result:", updatedU?.user ? "UPDATED" : updateErr?.message);
  }

  // Now test login with anon client using synthetic email
  console.log("\nAttempting signInWithPassword as 251911000001@federal.local / Password123!...");
  const { data: loginData, error: loginErr } = await supabaseAnon.auth.signInWithPassword({
    email: '251911000001@federal.local',
    password: 'Password123!'
  });

  if (loginErr) {
    console.error("❌ Login failed:", loginErr.message, loginErr);
  } else {
    console.log("✅ LOGIN SUCCESSFUL! User ID:", loginData.user.id);
  }
}

testSingleRep().catch(console.error);
