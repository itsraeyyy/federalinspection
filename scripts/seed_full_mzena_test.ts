import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'Password123!';

// Self Assessment Questions Definition (matching assessment-data.ts)
const SELF_QUESTIONS = [
  { id: "1.1", weight: 1.0 }, { id: "1.2", weight: 1.0 }, { id: "1.3", weight: 0.5 }, { id: "1.4", weight: 1.0 }, { id: "1.5", weight: 1.0 },
  { id: "2.1", weight: 0.5 }, { id: "2.2", weight: 0.5 }, { id: "2.3", weight: 0.5 }, { id: "2.4", weight: 0.5 }, { id: "2.5", weight: 0.5 }, { id: "2.6", weight: 0.5 }, { id: "2.7", weight: 0.5 }, { id: "2.8", weight: 0.5 },
  { id: "3.1", weight: 0.25 }, { id: "3.2", weight: 0.25 }, { id: "3.3", weight: 0.25 }, { id: "3.4", weight: 0.25 }, { id: "3.5", weight: 0.25 }, { id: "3.6", weight: 0.25 }, { id: "3.7", weight: 0.25 }, { id: "3.8", weight: 0.25 }, { id: "3.9", weight: 0.25 }, { id: "3.10", weight: 0.25 }, { id: "3.11", weight: 0.5 }, { id: "3.12", weight: 0.5 }, { id: "3.13", weight: 0.5 },
  { id: "4.1", weight: 0.25 }, { id: "4.2", weight: 0.25 }, { id: "4.3", weight: 0.5 }, { id: "4.4", weight: 1.0 }, { id: "4.5", weight: 0.5 }, { id: "4.6", weight: 0.5 }, { id: "4.7", weight: 0.5 }
];

// 20-Point Evaluation Questions Definition
const EVAL_QUESTIONS = [
  { id: "1.1", weight: 1.0 }, { id: "1.2", weight: 1.0 }, { id: "1.3", weight: 0.5 }, { id: "1.4", weight: 1.0 }, { id: "1.5", weight: 1.0 },
  { id: "2.1", weight: 0.5 }, { id: "2.2", weight: 0.5 }, { id: "2.3", weight: 0.5 }, { id: "2.4", weight: 0.5 }, { id: "2.5", weight: 0.5 }, { id: "2.6", weight: 0.5 }, { id: "2.7", weight: 0.5 }, { id: "2.8", weight: 0.5 },
  { id: "3.1", weight: 0.25 }, { id: "3.2", weight: 0.25 }, { id: "3.3", weight: 0.25 }, { id: "3.4", weight: 0.25 }, { id: "3.5", weight: 0.25 }, { id: "3.6", weight: 0.25 }, { id: "3.7", weight: 0.25 }, { id: "3.8", weight: 0.25 }, { id: "3.9", weight: 0.25 }, { id: "3.10", weight: 0.25 }, { id: "3.11", weight: 0.5 }, { id: "3.12", weight: 0.5 }, { id: "3.13", weight: 0.5 },
  { id: "4.1", weight: 0.25 }, { id: "4.2", weight: 0.25 }, { id: "4.3", weight: 0.5 }, { id: "4.4", weight: 1.0 }, { id: "4.5", weight: 0.5 }, { id: "4.6", weight: 0.5 }, { id: "4.7", weight: 0.5 }
];

function generateSelfResponses(baseScore: number) {
  const responses: Record<string, number> = {};
  let totalRawScore = 0;
  SELF_QUESTIONS.forEach(q => {
    // slight variation per question around baseScore (between 3 and 5)
    const val = Math.min(5, Math.max(3, baseScore + (Math.random() > 0.5 ? 0 : -1)));
    responses[q.id] = val;
    totalRawScore += q.weight * val;
  });
  const score_10 = parseFloat((totalRawScore / 10).toFixed(2));
  return { responses, score_10 };
}

function generateEvalResponses(baseScore: number) {
  const responses: Record<string, number> = {};
  let totalRawScore = 0;
  EVAL_QUESTIONS.forEach(q => {
    const val = Math.min(5, Math.max(3, baseScore + (Math.random() > 0.5 ? 0 : -1)));
    responses[q.id] = val;
    totalRawScore += q.weight * val;
  });
  const score_20 = parseFloat((totalRawScore / 5).toFixed(2));
  return { responses, score_20 };
}

async function run() {
  console.log('--- Starting Comprehensive Mzena Test Environment Seeding ---');

  // 1. Create or fetch Active Period
  const periodName = 'የምዘና ሙከራ ጊዜ (Mzena Comprehensive Test)';
  
  let periodId: string;
  const { data: existingPeriod } = await supabase
    .from('assessment_periods')
    .select('id')
    .eq('name', periodName)
    .maybeSingle();

  if (existingPeriod) {
    periodId = existingPeriod.id;
    console.log(`Using existing test period: ${periodId}`);
  } else {
    const { data: period, error: pErr } = await supabase
      .from('assessment_periods')
      .insert({ name: periodName, year: '2018', period_half: '1st', status: 'active' })
      .select().single();
    if (pErr) throw pErr;
    periodId = period.id;
    console.log(`Created new test period: ${periodId}`);
  }

  // 2. Define the 9 Users
  const userDefs = [
    // 5 Tegemgami (Regular)
    { phone: '0911000101', name: 'አበበ ከበደ (Tegemgami 1)', role: 'regular', baseScore: 4, autoSubmitSelf: true },
    { phone: '0911000102', name: 'ቻላ በቀለ (Tegemgami 2)', role: 'regular', baseScore: 5, autoSubmitSelf: true },
    { phone: '0911000103', name: 'ሰለሞን ተስፋዬ (Tegemgami 3)', role: 'regular', baseScore: 4, autoSubmitSelf: true },
    { phone: '0911000104', name: 'መሳይ ሀይሉ (Tegemgami 4)', role: 'regular', baseScore: 5, autoSubmitSelf: true },
    { phone: '0911000105', name: 'ትግስት አለሙ (Tegemgami 5)', role: 'regular', baseScore: 4, autoSubmitSelf: false }, // LEFT FOR USER TO CHECK!

    // 3 Evaluators
    { phone: '0922000201', name: 'ዳዊት ገብሬ (Evaluator 1)', role: 'evaluator', baseScore: 5, autoSubmitSelf: true, autoSubmitEval: true },
    { phone: '0922000202', name: 'ማርታ ታደሰ (Evaluator 2)', role: 'evaluator', baseScore: 4, autoSubmitSelf: true, autoSubmitEval: true },
    { phone: '0922000203', name: 'ዮናስ ታሪኩ (Evaluator 3)', role: 'evaluator', baseScore: 4, autoSubmitSelf: true, autoSubmitEval: false }, // LEFT FOR USER TO CHECK!

    // 1 Approver
    { phone: '0933000301', name: 'ተክሌ ወልደጻድቅ (Approver 1)', role: 'approver', baseScore: 5, autoSubmitSelf: true, autoSubmitEval: false } // LEFT UNFINALIZED FOR USER TO CHECK!
  ];

  const createdUserMap: Record<string, { id: string, name: string, phone: string, role: string, def: typeof userDefs[0] }> = {};

  for (const u of userDefs) {
    const fullPhone = `+251${u.phone.substring(1)}`;
    const syntheticEmail = `${fullPhone.replace('+', '')}@federal.local`;

    let userId: string | null = null;

    // Check existing auth user
    const { data: usersList } = await supabase.auth.admin.listUsers();
    const existingAuthUser = usersList?.users?.find(usr => usr.email === syntheticEmail);

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        password: DEFAULT_PASSWORD,
        user_metadata: { full_name: u.name, phone: fullPhone, force_password_change: false, requires_password_change: false }
      });
    } else {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: DEFAULT_PASSWORD,
        user_metadata: { full_name: u.name, phone: fullPhone, force_password_change: false, requires_password_change: false }
      });

      if (authErr) {
        console.error(`Error creating auth user ${u.name}:`, authErr.message);
        continue;
      }
      userId = authData.user.id;
    }

    if (!userId) continue;

    // 2b. Upsert into public.users
    await supabase.from('users').upsert({ id: userId, phone_number: fullPhone, full_name: u.name });

    // 2c. Upsert into period_members
    const { data: existingMember } = await supabase
      .from('period_members')
      .select('id')
      .eq('period_id', periodId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      await supabase.from('period_members').update({ role: u.role }).eq('id', existingMember.id);
    } else {
      await supabase.from('period_members').insert({ period_id: periodId, user_id: userId, role: u.role });
    }

    createdUserMap[u.phone] = { id: userId, name: u.name, phone: u.phone, role: u.role, def: u };
    console.log(`✓ User setup ready: [${u.role.toUpperCase()}] ${u.name} (Phone: ${u.phone})`);
  }

  // 3. Pre-fill Self Assessments
  console.log('\n--- Pre-filling Self Assessments (ቅፅ-1 / Self 10 Points) ---');
  for (const phone of Object.keys(createdUserMap)) {
    const userObj = createdUserMap[phone];
    if (userObj.def.autoSubmitSelf) {
      const { responses, score_10 } = generateSelfResponses(userObj.def.baseScore);
      await supabase.from('self_assessments').upsert({
        period_id: periodId,
        user_id: userObj.id,
        responses: responses,
        score_10: score_10,
        is_locked: false
      }, { onConflict: 'period_id, user_id' });
      console.log(`  - ${userObj.name}: Self assessment pre-filled & UNLOCKED (${score_10}/10)`);
    } else {
      console.log(`  * ${userObj.name}: Left UNSUBMITTED for manual testing!`);
    }
  }

  // 4. Pre-fill Team Evaluations for Evaluators (Evaluator 1 & Evaluator 2)
  console.log('\n--- Pre-filling Team Evaluations (ቅፅ-2 / Evaluator 20 Points) ---');
  const allUserIds = Object.values(createdUserMap).map(u => u.id);

  for (const phone of ['0922000201', '0922000202', '0922000203']) {
    const evalUser = createdUserMap[phone];
    if (!evalUser) continue;

    for (const targetId of allUserIds) {
      if (targetId === evalUser.id) continue; // skip evaluating self in team evals

      const { responses, score_20 } = generateEvalResponses(evalUser.def.baseScore);
      await supabase.from('evaluations').upsert({
        period_id: periodId,
        evaluator_id: evalUser.id,
        target_user_id: targetId,
        responses: responses,
        score_20: score_20,
        is_locked: false
      }, { onConflict: 'period_id, evaluator_id, target_user_id' });
    }
    console.log(`  - ${evalUser.name}: Pre-filled & UNLOCKED evaluations for team members (${allUserIds.length - 1} members)`);
  }
  console.log(`  * Evaluator 3 (ዮናስ ታሪኩ - 0922000203): Left UNLOCKED/UNSUBMITTED for manual testing!`);

  // 5. Pre-fill Approver Scores (Approver 1)
  console.log('\n--- Pre-filling Approver Scores (ቅፅ-3 / Approver 70 Points) ---');
  const approverUser = createdUserMap['0933000301'];
  if (approverUser) {
    for (const targetId of allUserIds) {
      // Pre-fill a score out of 70 (e.g. 58-66)
      const randomScore70 = parseFloat((56 + Math.random() * 10).toFixed(2));
      await supabase.from('approver_evaluations').upsert({
        period_id: periodId,
        approver_id: approverUser.id,
        target_user_id: targetId,
        score_70: randomScore70,
        is_locked: false // UNLOCKED so Approver can review and click Approve/Finalize!
      }, { onConflict: 'period_id, approver_id, target_user_id' });
    }
    console.log(`  - ${approverUser.name}: Pre-filled 70-point scores for all members (unlocked for final approval testing)`);
  }

  console.log('\n=== Mzena Test Environment Seeding Complete! ===\n');
}

run().catch(console.error);
