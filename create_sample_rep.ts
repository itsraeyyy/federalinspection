import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const fullName = "Sample Representative";
  const phone = "+251911000001";
  const region = "አዲስ አበባ";
  const syntheticEmail = `251911000001@federal.local`;
  const password = crypto.randomBytes(4).toString('hex');

  console.log('Creating sample representative...');
  
  // 1. Create auth user
  let userId;
  const { data: existing } = await supabaseAdmin.from('users').select('id').eq('phone_number', phone).single();
  
  if (existing) {
    userId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(userId, { email: syntheticEmail, password });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      email_confirm: true,
      password: password,
      user_metadata: { full_name: fullName, phone: phone }
    });
    if (error) {
      console.error('Error creating user:', error);
      return;
    }
    userId = data.user.id;
  }

  // 2. Upsert users
  await supabaseAdmin.from('users').upsert({ id: userId, phone_number: phone, full_name: fullName });

  // 3. Upsert profile
  const { error: profileErr } = await supabaseAdmin.from('user_profiles').upsert({
    user_id: userId,
    system_role: 'representative',
    region: region
  });

  if (profileErr) {
    console.error('Profile error:', profileErr);
    return;
  }

  console.log('\n--- SAMPLE REPRESENTATIVE CREATED ---');
  console.log('Phone / Username:', phone);
  console.log('Password:', password);
  console.log('Region:', region);
  console.log('-------------------------------------\n');
}

main().catch(console.error);
