import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testQuery() {
  const phone = "+251911000001";
  const { data: user } = await supabaseAdmin.from('users').select('*').eq('phone_number', phone).single();
  console.log("public.users record:", user);

  if (user) {
    const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(user.id);
    console.log("auth.users record:", authUser?.user?.email, authUser?.user?.phone);
    if (error) {
       console.log("Auth error:", error);
    }
  }
}

testQuery().catch(console.error);
