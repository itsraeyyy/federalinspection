import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const regionsToSeed = ["ኦሮሚያ", "አማራ", "ሶማሌ"];

async function main() {
  console.log('Seeding reports for regions:', regionsToSeed);
  
  const schemaPath = path.resolve(__dirname, '../src/data/forms-schema.json');
  const schemas = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  for (const region of regionsToSeed) {
    // Check if a dummy user exists for this region, else create one
    // But since `user_id` can be anything for a seed if we don't have foreign key strict constraints, 
    // actually `reports` table probably references `user_profiles.user_id` or `users.id`.
    // Let's create a dummy user
    const dummyEmail = `dummy_${Buffer.from(region).toString('hex')}@seed.local`;
    
    let userId;
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    let foundUser = existingUser?.users.find(u => u.email === dummyEmail);

    if (foundUser) {
      userId = foundUser.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password: 'password123',
        email_confirm: true,
      });
      if (createError) {
        console.error('Error creating user for', region, createError);
        continue;
      }
      userId = newUser.user.id;

      // Create user profile
      await supabaseAdmin.from('users').upsert({ id: userId, phone_number: '+2519999' + Math.floor(Math.random()*10000), full_name: 'Seed User ' + region });
      await supabaseAdmin.from('user_profiles').upsert({ user_id: userId, region: region, system_role: 'representative' });
    }

    console.log(`Generating form data for ${region}...`);
    const formsData: any = {};
    
    schemas.forEach((schema: any) => {
      formsData[schema.id] = {};
      schema.columns.forEach((col: any) => {
        if (col.subKeys && col.subKeys.length > 0) {
          formsData[schema.id][col.key] = {};
          col.subKeys.forEach((sub: string) => {
            formsData[schema.id][col.key][sub] = Math.floor(Math.random() * 50) + 10; // random number 10-59
          });
        } else {
          formsData[schema.id][col.key] = Math.floor(Math.random() * 50) + 10;
        }
      });
    });

    console.log(`Inserting report for ${region}...`);
    const { error: insertError } = await supabaseAdmin
      .from('reports')
      .upsert({
        title: `Seed Report for ${region}`,
        report_type: 'numerical',
        period_category: 'q3',
        budget_year: '2016',
        submitter_id: userId,
        submitter_level: 'region',
        user_id: userId,
        region: region,
        year: 2016,
        period: "3ኛ ሩብ አመት",
        forms_data: formsData,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }, {
        onConflict: 'region, year, period'
      });

    if (insertError) {
      console.error(`Error inserting report for ${region}:`, insertError);
    } else {
      console.log(`Successfully seeded report for ${region}!`);
    }
  }

  console.log('Done!');
}

main();
