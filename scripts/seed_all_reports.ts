import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ALL_REGIONS = [
  'ኦሮሚያ', 'አማራ', 'ሶማሌ', 'አፋር', 'ቤን-ጉሙዝ', 'ጋምቤላ', 'ሐረሪ', 'ሲዳማ', 
  'ደ/ም/ኢ/ያ', 'ደቡብ ኢ/ያ', 'ማዕ/ኢ/ያ', 'አዲስ አበባ', 'ድሬ ዳዋ', 'ፌዴራል ተቋማት'
];

async function main() {
  console.log('Fixing lost legacy reports...');
  // Fix legacy reports that have region_name but no region
  const { data: legacyReports, error: legacyErr } = await supabaseAdmin.from('reports').select('*').is('region', null);
  if (!legacyErr && legacyReports && legacyReports.length > 0) {
    for (const report of legacyReports) {
      if (report.region_name) {
        const formsData = report.forms_data || {};
        if (report.report_type === 'narration') {
          formsData.narration_report = {
            text: `(Legacy migrated) ይህ የጽሁፍ ሪፖርት ነው። ${report.title}`,
            attachment_url: report.file_url,
          };
        } else if (report.report_type === 'numerical' && report.numerical_data) {
          // just an example of migrating numerical data
          formsData.legacy_data = report.numerical_data;
        }

        await supabaseAdmin.from('reports').update({
          region: report.region_name,
          year: parseInt(report.budget_year) || 2016,
          period: report.period_category === 'q1' ? '1ኛ ሩብ አመት' :
                  report.period_category === 'q2' ? '2ኛ ሩብ አመት' :
                  report.period_category === 'q3' ? '3ኛ ሩብ አመት' :
                  report.period_category === 'q4' ? '4ኛ ሩብ አመት' : '3ኛ ሩብ አመት',
          forms_data: formsData,
          status: 'submitted'
        }).eq('id', report.id);
      }
    }
    console.log(`Migrated ${legacyReports.length} legacy reports.`);
  }

  console.log('Seeding new reports for all regions...');
  
  const schemaPath = path.resolve(process.cwd(), 'src/data/forms-schema.json');
  let schemas = [];
  if (fs.existsSync(schemaPath)) {
    schemas = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } else {
    console.log("Could not find forms-schema.json, generating minimal data.");
  }

  for (const region of ALL_REGIONS) {
    const dummyEmail = `rep_${Buffer.from(region).toString('hex').slice(0, 8)}@seed.local`;
    
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
    }

    // Ensure public users and user_profiles exist
    await supabaseAdmin.from('users').upsert({ 
      id: userId, 
      phone_number: '+251900' + Math.floor(100000 + Math.random()*900000), 
      full_name: 'Rep ' + region 
    });
    
    await supabaseAdmin.from('user_profiles').upsert({ 
      user_id: userId, 
      region: region, 
      system_role: 'representative' 
    });

    // 1. Create a structured form report
    const formsData: any = {};
    if (schemas.length > 0) {
      schemas.forEach((schema: any) => {
        formsData[schema.id] = {};
        schema.columns.forEach((col: any) => {
          if (col.subKeys && col.subKeys.length > 0) {
            formsData[schema.id][col.key] = {};
            col.subKeys.forEach((sub: string) => {
              formsData[schema.id][col.key][sub] = Math.floor(Math.random() * 50) + 10;
            });
          } else {
            formsData[schema.id][col.key] = Math.floor(Math.random() * 50) + 10;
          }
        });
      });
    }

    // Add narration report data to formsData
    formsData.narration_report = {
      text: `ይህ ለ${region} ክልል የተዘጋጀ የናሙና የጽሁፍ ሪፖርት ነው። በዚህ ሩብ አመት የተከናወኑ ዋና ዋና ስራዎች፡\n\n1. የአባላት ግምገማ እና ምዘና በተሳካ ሁኔታ ተጠናቋል\n2. ከህብረተሰቡ የቀረቡ 34 ቅሬታዎች ምላሽ አግኝተዋል\n3. የክልሉ ቅርንጫፍ ጽ/ቤቶች በሙሉ በኔትወርክ ተገናኝተዋል\n\nበቀጣይ ሩብ አመት ትኩረት የሚሹ ጉዳዮች፡\n- የአቅም ግንባታ ስልጠናዎችን አጠናክሮ መቀጠል\n- የዲጂታል ሪፖርት አቀራረብን ሙሉ በሙሉ መተግበር`,
      attachment_url: 'https://example.com/sample_attachment.pdf',
      attachment_name: `${region}_Q3_Narration_Report.pdf`
    };

    // Clean up old duplicated sample reports
    await supabaseAdmin
      .from('reports')
      .delete()
      .eq('region', region)
      .eq('year', 2016)
      .eq('period', '3ኛ ሩብ አመት');

    // Insert single combined report
    const { error: upsertErr } = await supabaseAdmin
      .from('reports')
      .upsert({
        title: `የ${region} ክልል ሪፖርት (Q3)`,
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
        status: 'submitted_to_federal',
        submitted_at: new Date().toISOString()
      });

    if (upsertErr) {
      console.error(`Error upserting for ${region}:`, upsertErr.message);
    } else {
      console.log(`Seeded combined report and rep for ${region}`);
    }
  }

  console.log('All regions seeded successfully!');
}

main();
