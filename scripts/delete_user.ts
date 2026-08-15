import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.raey.work';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4NDk4MDUwMCwiZXhwIjo0OTQwNjU0MTAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.h5xXpfoh0SpKZo2Rm5M-OSMKwA6_j6y8aw8vhLTYvEQ';

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function purgeUser() {
  const targetEmail = 'samarega95@gmail.com';
  const phoneVariations = ['0987279591', '+251987279591', '251987279591', '987279591'];
  const syntheticEmail = '251987279591@federal.local';

  console.log('Searching for target user across database tables...');

  // 1. Find in auth.users by email using generateLink
  const emailsToPurge = [targetEmail, syntheticEmail];
  for (const email of emailsToPurge) {
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });
    if (linkData?.user) {
      console.log(`Found auth user ID via generateLink for ${email}: ${linkData.user.id}`);
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(linkData.user.id);
      if (delErr) {
        console.error(`Failed to delete auth user ${linkData.user.id}:`, delErr);
      } else {
        console.log(`Successfully deleted auth user ${linkData.user.id} (${email})`);
      }
    } else {
      console.log(`No auth user found for email: ${email}`);
    }
  }

  // 2. Find in public.users
  const { data: publicUsers } = await supabaseAdmin
    .from('users')
    .select('id, full_name, phone_number')
    .in('phone_number', phoneVariations);

  console.log(`Found ${publicUsers?.length || 0} matching record(s) in public.users:`, publicUsers);

  if (publicUsers && publicUsers.length > 0) {
    for (const pu of publicUsers) {
      console.log(`Deleting public.users record ID: ${pu.id}...`);
      await supabaseAdmin.from('period_members').delete().eq('user_id', pu.id);
      await supabaseAdmin.from('user_profiles').delete().eq('user_id', pu.id);
      await supabaseAdmin.from('users').delete().eq('id', pu.id);
    }
  }

  // 4. Verify cleanup
  const { data: checkAdmin } = await supabaseAdmin.from('admin_profiles').select('id, email, phone').or(`email.eq.${targetEmail},phone.in.(${phoneVariations.join(',')})`);
  const { data: checkUsers } = await supabaseAdmin.from('users').select('id, phone_number').in('phone_number', phoneVariations);

  console.log(`VERIFICATION RESULT:`);
  console.log(`admin_profiles remaining: ${checkAdmin?.length || 0}`);
  console.log(`public.users remaining: ${checkUsers?.length || 0}`);
}

purgeUser().catch(console.error);
