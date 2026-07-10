import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54521';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runTests() {
  console.log('--- Database Verification Tests ---');

  const testRead = async (tableName: string, client = supabaseAdmin, limit = 5) => {
    console.log(`\nTesting Read: ${tableName}...`);
    try {
      const { data, error } = await client.from(tableName).select('*').limit(limit);
      if (error) {
        console.error(`❌ Error reading ${tableName}:`, error.message, error.details, error.hint);
      } else {
        console.log(`✅ Success reading ${tableName}. Rows fetched: ${data.length}`);
      }
    } catch (e: any) {
      console.error(`❌ Exception reading ${tableName}:`, e.message);
    }
  };

  // Forms and Reports
  await testRead('form_schemas');
  await testRead('reports');

  // Complaints & Feedbacks
  await testRead('complaints');
  await testRead('feedbacks');

  // Personnel & User Profiles
  await testRead('personnel');
  await testRead('user_profiles');
  await testRead('admin_profiles');

  // Documents & Public Files
  await testRead('documents');
  await testRead('public_files');

  // Assessments & News
  await testRead('assessment_periods');
  await testRead('news_articles');
  
  // OTP Requests
  await testRead('otp_requests', supabaseAdmin);

  // Write tests
  console.log('\n--- Write Verification Tests ---');

  const testComplaintWrite = async () => {
    console.log('\nTesting Write: complaints (Anon)...');
    try {
      const { error } = await supabaseAnon.from('complaints').insert({
        type: 'Complaint',
        name: 'Test Write User',
        phone: '+251911000099',
        subject: 'Test Subject',
        message: 'Test Message',
        status: 'New',
        target_region: 'አዲስ አበባ',
        target_zone: 'አራዳ'
      });
      if (error) {
        console.error('❌ Error writing complaint:', error.message, error.details);
      } else {
        console.log('✅ Success writing complaint.');
        // Can't clean up easily without ID, but it's mock data anyway.
      }
    } catch (e: any) {
      console.error('❌ Exception writing complaint:', e.message);
    }
  };

  const testReportWrite = async () => {
    console.log('\nTesting Write: reports (Admin)...');
    try {
      // First, fetch columns to see what we have
      const { data: cols } = await supabaseAdmin.rpc('get_reports_columns');
      // Actually Supabase JS doesn't let us query information_schema directly easily without a view or rpc.
      // Let's just try inserting only required columns. Let's try omitting 'content'.
      
      const { data, error } = await supabaseAdmin.from('reports').insert({
        title: 'Test Report',
        schema_snapshot: { key: "value" },
        status: 'draft',
        form_schema_id: 'form_01'
      }).select();
      if (error) {
        console.error('❌ Error writing report:', error.message, error.details);
      } else {
        console.log('✅ Success writing report:', data[0].id);
        // Clean up
        await supabaseAdmin.from('reports').delete().eq('id', data[0].id);
      }
    } catch (e: any) {
      console.error('❌ Exception writing report:', e.message);
    }
  };

  await testComplaintWrite();
  await testReportWrite();

  console.log('\n--- Tests Complete ---');
}

runTests().catch(console.error);
