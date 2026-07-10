import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  const { data: reports, error: err1 } = await supabaseAdmin.from('reports').select('*').is('region', null);
  if (err1) console.error("Reports error:", err1.message);
  else {
    console.log(`Fixing ${reports.length} legacy reports with null region.`);
    for (const rep of reports) {
      let yr = parseInt(rep.budget_year);
      if (isNaN(yr)) yr = 2016;

      const { data, error } = await supabaseAdmin.from('reports').update({ 
        region: rep.region_name,
        year: yr,
        period: rep.period_category === 'q1' ? '1ኛ ሩብ አመት' :
                rep.period_category === 'q2' ? '2ኛ ሩብ አመት' :
                rep.period_category === 'q3' ? '3ኛ ሩብ አመት' :
                rep.period_category === 'q4' ? '4ኛ ሩብ አመት' : '3ኛ ሩብ አመት',
        status: 'submitted'
      }).eq('id', rep.id).select();

      if (error) {
        console.error(`Error updating report ${rep.id}:`, error.message);
      }
    }
    console.log('Finished updating legacy reports.');
  }

  const { data: profiles, error: err2 } = await supabaseAdmin.from('user_profiles').select('*');
  if (err2) console.error("Profiles error:", err2.message);
  else console.log(`Found ${profiles.length} total profiles.`);

  const { data: users, error: err3 } = await supabaseAdmin.from('users').select('*');
  if (err3) console.error("Users error:", err3.message);
  else console.log(`Found ${users.length} total users.`);
}

checkData();
