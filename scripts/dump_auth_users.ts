import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function dumpAuthUsers() {
  console.log("=== Dumping All Auth Users in Supabase ===");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    phone: u.phone,
    user_metadata: u.user_metadata,
    created_at: u.created_at
  }));

  console.log(`Total Auth Users: ${users.length}`);
  console.log(JSON.stringify(users, null, 2));
}

dumpAuthUsers().catch(console.error);
