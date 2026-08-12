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

const targetPhones = [
  '0987279591',
  '+251987279591',
  '251987279591'
];

const targetEmails = [
  'samsonarega8@gmailil.com',
  'samsonarega8@gmail.com'
];

async function inspectAndDeleteUser() {
  console.log("=== Searching for users with target phone numbers / emails ===");
  console.log("Phones:", targetPhones);
  console.log("Emails:", targetEmails);

  const matchedUserIds = new Set<string>();

  // 1. Check Supabase Auth Users
  const { data: usersResponse, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.error("Error listing auth users:", listErr);
  } else {
    const authUsers = usersResponse.users;
    console.log(`Found ${authUsers.length} total auth users.`);

    for (const u of authUsers) {
      const emailMatch = u.email && targetEmails.includes(u.email.toLowerCase());
      const phoneMatch = u.phone && targetPhones.includes(u.phone);
      const metaPhoneMatch = u.user_metadata?.phone && targetPhones.includes(u.user_metadata.phone);
      
      if (emailMatch || phoneMatch || metaPhoneMatch) {
        console.log(`MATCHED Auth User: ID=${u.id}, Email=${u.email}, Phone=${u.phone || u.user_metadata?.phone}`);
        matchedUserIds.add(u.id);
      }
    }
  }

  // 2. Check public.admin_profiles
  const { data: adminProfiles } = await supabaseAdmin.from('admin_profiles').select('*');
  if (adminProfiles) {
    for (const ap of adminProfiles) {
      const emailMatch = ap.email && targetEmails.includes(ap.email.toLowerCase());
      const phoneMatch = ap.phone && targetPhones.includes(ap.phone);
      if (emailMatch || phoneMatch) {
        console.log(`MATCHED admin_profile: ID=${ap.id}, Email=${ap.email}, Phone=${ap.phone}`);
        matchedUserIds.add(ap.id);
      }
    }
  }

  // 3. Check public.users
  const { data: publicUsers } = await supabaseAdmin.from('users').select('*');
  if (publicUsers) {
    for (const pu of publicUsers) {
      const phoneMatch = pu.phone_number && targetPhones.includes(pu.phone_number);
      const emailMatch = pu.email && targetEmails.includes(pu.email.toLowerCase());
      if (phoneMatch || emailMatch) {
        console.log(`MATCHED public.users: ID=${pu.id}, Name=${pu.full_name}, Phone=${pu.phone_number}`);
        matchedUserIds.add(pu.id);
      }
    }
  }

  // 4. Check public.user_profiles
  const { data: userProfiles } = await supabaseAdmin.from('user_profiles').select('*');
  if (userProfiles) {
    for (const up of userProfiles) {
      if (matchedUserIds.has(up.user_id)) {
        console.log(`MATCHED user_profile: UserID=${up.user_id}`);
      }
    }
  }

  console.log(`\nFound ${matchedUserIds.size} unique matched user ID(s) to delete:`, Array.from(matchedUserIds));

  // Perform Deletions
  for (const id of Array.from(matchedUserIds)) {
    console.log(`\n--- DELETING USER ID: ${id} ---`);

    // Delete from admin_profiles
    const { error: apErr } = await supabaseAdmin.from('admin_profiles').delete().eq('id', id);
    console.log("Deleted from admin_profiles:", apErr ? apErr.message : "OK");

    // Delete from user_profiles
    const { error: upErr } = await supabaseAdmin.from('user_profiles').delete().eq('user_id', id);
    console.log("Deleted from user_profiles:", upErr ? upErr.message : "OK");

    // Delete from period_members
    const { error: pmErr } = await supabaseAdmin.from('period_members').delete().eq('user_id', id);
    console.log("Deleted from period_members:", pmErr ? pmErr.message : "OK");

    // Delete from evaluations (as evaluatee or evaluator)
    const { error: ev1Err } = await supabaseAdmin.from('evaluations').delete().eq('evaluatee_id', id);
    const { error: ev2Err } = await supabaseAdmin.from('evaluations').delete().eq('evaluator_id', id);
    console.log("Deleted from evaluations:", ev1Err ? ev1Err.message : "OK", ev2Err ? ev2Err.message : "OK");

    // Delete from evaluator_assignments
    const { error: ea1Err } = await supabaseAdmin.from('evaluator_assignments').delete().eq('evaluator_id', id);
    const { error: ea2Err } = await supabaseAdmin.from('evaluator_assignments').delete().eq('evaluatee_id', id);
    console.log("Deleted from evaluator_assignments:", ea1Err ? ea1Err.message : "OK", ea2Err ? ea2Err.message : "OK");

    // Delete from public.users
    const { error: puErr } = await supabaseAdmin.from('users').delete().eq('id', id);
    console.log("Deleted from public.users:", puErr ? puErr.message : "OK");

    // Delete from Auth Users
    const { error: authDelErr } = await supabaseAdmin.auth.admin.deleteUser(id);
    console.log("Deleted from Supabase Auth:", authDelErr ? authDelErr.message : "OK");
  }

  // Also clean up any loose records matching phone numbers or emails directly in tables that don't use foreign key ID
  console.log("\n--- Cleaning direct phone/email matches in other tables ---");
  for (const phone of targetPhones) {
    const { error: cErr } = await supabaseAdmin.from('complaints').delete().eq('phone', phone);
    console.log(`Deleted complaints with phone ${phone}:`, cErr ? cErr.message : "OK");

    const { error: uErr } = await supabaseAdmin.from('users').delete().eq('phone_number', phone);
    console.log(`Deleted public.users with phone ${phone}:`, uErr ? uErr.message : "OK");

    const { error: apErr } = await supabaseAdmin.from('admin_profiles').delete().eq('phone', phone);
    console.log(`Deleted admin_profiles with phone ${phone}:`, apErr ? apErr.message : "OK");
  }

  for (const email of targetEmails) {
    const { error: apErr } = await supabaseAdmin.from('admin_profiles').delete().eq('email', email);
    console.log(`Deleted admin_profiles with email ${email}:`, apErr ? apErr.message : "OK");
  }

  console.log("\n=== Deletion completed successfully! ===");
}

inspectAndDeleteUser().catch(console.error);
