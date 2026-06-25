import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const users = [
  { phone: '0911000001', name: 'Test Regular', role: 'regular' },
  { phone: '0911000002', name: 'Test Evaluator', role: 'evaluator' },
  { phone: '0911000003', name: 'Test Approver', role: 'approver' }
];

async function runTest() {
  console.log('--- Starting Assessment Flow Test ---');
  
  // Need the period ID from earlier
  // Since we don't have it directly, we can fetch it via anon with the admin client or just query it
  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: period } = await adminClient.from('assessment_periods').select('id').eq('name', 'E2E Test Period').single();
  
  if (!period) throw new Error('Period not found');
  const periodId = period.id;
  
  const { data: members } = await adminClient.from('period_members').select('user_id, role').eq('period_id', periodId);
  const targetUserId = members?.find(m => m.role === 'regular')?.user_id;

  console.log('\\n0. Cleaning up old test data...');
  await adminClient.from('self_assessments').delete().eq('period_id', periodId);
  await adminClient.from('evaluations').delete().eq('period_id', periodId);
  await adminClient.from('approver_evaluations').delete().eq('period_id', periodId);
  await adminClient.from('final_scores').delete().eq('period_id', periodId);
  await adminClient.from('assessment_periods').update({ status: 'active' }).eq('id', periodId);

  // 1. Regular User: Self Assessment
  console.log('\\n1. Logging in as Regular User...');
  const regularClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: regAuth, error: authErr } = await regularClient.auth.signInWithPassword({
    email: '251911000001@federal.local',
    password: 'Password123'
  });
  if (authErr) console.error('   Auth Error:', authErr);
  
  console.log('   Auth ID:', regAuth.user?.id);
  console.log('   Target User ID:', targetUserId);
  console.log('   Submitting self assessment (10 points)...');
  const { error: saErr } = await regularClient.from('self_assessments').upsert({
    period_id: periodId,
    user_id: targetUserId,
    responses: { 'cat.1': 5, 'cat.2': 5 },
    score_10: 10,
    is_locked: true
  });
  if (saErr) console.error('   Error:', saErr);
  else console.log('   Self assessment submitted and locked successfully.');

  // 2. Evaluator User: Evaluate Regular
  console.log('\\n2. Logging in as Evaluator User...');
  const evalClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: evalAuth } = await evalClient.auth.signInWithPassword({
    email: '251911000002@federal.local',
    password: 'Password123'
  });
  
  console.log('   Evaluator submitting self assessment...');
  await evalClient.from('self_assessments').upsert({
    period_id: periodId,
    user_id: evalAuth.user?.id,
    responses: { 'cat.1': 5, 'cat.2': 5 },
    score_10: 10,
    is_locked: true
  });

  console.log('   Submitting evaluation (20 points)...');
  for (const m of members || []) {
    await evalClient.from('evaluations').upsert({
      period_id: periodId,
      evaluator_id: evalAuth.user?.id,
      target_user_id: m.user_id,
      score_20: 20,
      is_locked: true
    });
  }
  console.log('   Evaluation submitted and locked successfully.');

  // 3. Approver User: Evaluate Regular and Finalize
  console.log('\\n3. Logging in as Approver User...');
  const appClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: appAuth } = await appClient.auth.signInWithPassword({
    email: '251911000003@federal.local',
    password: 'Password123'
  });
  
  console.log('   Approver submitting self assessment...');
  await appClient.from('self_assessments').upsert({
    period_id: periodId,
    user_id: appAuth.user?.id,
    responses: { 'cat.1': 5, 'cat.2': 5 },
    score_10: 10,
    is_locked: true
  });

  console.log('   Submitting approver evaluation (70 points)...');
  for (const m of members || []) {
    await appClient.from('approver_evaluations').upsert({
      period_id: periodId,
      approver_id: appAuth.user?.id,
      target_user_id: m.user_id,
      score_70: 70,
      is_locked: true
    });
  }
  console.log('   Approver evaluation submitted and locked successfully.');

  console.log('\\n4. Approver finalizes the period...');
  const { data: finalRes, error: finalErr } = await appClient.rpc('finalize_period_scores', {
    p_period_id: periodId
  });
  
  if (finalErr) {
    console.error('   Error finalizing:', finalErr);
  } else {
    console.log('   Scores finalized successfully.');
  }

  // 5. Admin Verification
  console.log('\\n5. Verifying final scores via Admin...');
  const { data: finalScore } = await adminClient.from('final_scores').select('*').eq('period_id', periodId).eq('user_id', targetUserId).single();
  console.log('   Final Score Data:', finalScore);
  
  if (finalScore && finalScore.final_score_100 === 100) {
    console.log('\\n✅ ALL TESTS PASSED: Scoring pipeline is perfectly functional! (10 + 20 + 70 = 100)');
  } else {
    console.log('\\n❌ TEST FAILED: Final score is incorrect or missing.');
  }
}

runTest().catch(console.error);
