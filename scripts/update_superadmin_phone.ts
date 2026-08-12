import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("Updating superadmin@commission.gov phone in admin_profiles to 0900000000...");
  const { error } = await supabaseAdmin
    .from('admin_profiles')
    .update({ phone: '0900000000' })
    .eq('email', 'superadmin@commission.gov');

  if (error) {
    console.error("Error updating superadmin phone:", error);
  } else {
    console.log("Successfully updated superadmin phone to 0900000000!");
  }
}

main().catch(console.error);
