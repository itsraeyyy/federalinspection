import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Setting up test data...');
  
  // 1. Create a period
  const { data: period, error: pErr } = await supabase
    .from('assessment_periods')
    .insert({ name: 'E2E Test Period', year: '2018', period_half: '1st', status: 'active' })
    .select().single();
    
  if (pErr) throw pErr;
  console.log('Created period:', period.id);

  const users = [
    { phone: '0911000001', name: 'Test Regular', role: 'regular' },
    { phone: '0911000002', name: 'Test Evaluator', role: 'evaluator' },
    { phone: '0911000003', name: 'Test Approver', role: 'approver' }
  ];

  for (const u of users) {
    const fullPhone = `+251${u.phone.substring(1)}`;
    const syntheticEmail = `${fullPhone.replace('+', '')}@federal.local`;
    
    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: syntheticEmail,
      email_confirm: true,
      password: 'Password123',
      user_metadata: { full_name: u.name, phone: fullPhone }
    });
    
    if (authErr && !authErr.message.includes('already')) {
      console.log('Auth error:', authErr.message);
      continue;
    }
    
    // Get user id (if existed, we need to fetch it)
    let userId = authData?.user?.id;
    if (!userId) {
      const { data: exUser } = await supabase.from('users').select('id').eq('phone_number', fullPhone).single();
      userId = exUser?.id;
      
      // update password
      if (userId) {
        await supabase.auth.admin.updateUserById(userId, { password: 'Password123' });
      }
    }

    if (!userId) {
      console.log('Failed to get user id for', u.name);
      continue;
    }

    // Upsert public.users
    await supabase.from('users').upsert({ id: userId, phone_number: fullPhone, full_name: u.name });
    
    // Insert into period
    await supabase.from('period_members').insert({
      period_id: period.id,
      user_id: userId,
      role: u.role
    });
    
    console.log(`Created ${u.role}: phone=${u.phone}, pass=Password123`);
  }
  
  console.log('Done!');
}

run().catch(console.error);
