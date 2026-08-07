import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { regionsData } from '../src/lib/regions-data';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const ETHIOPIAN_NAMES = [
  'ዳዊት አበበ', 'ሰሎሞን ተክሌ', 'ትዕግስት ወርቁ', 'አበበ ከበደ', 'መሃሪ ገብረኪዳን',
  'የኔነሽ ታደሰ', 'አለሙ ገብሬ', 'ዘነበች ታደለ', 'እያሱ ሃይሉ', 'መስፈን ወልዴ',
  'ሳራ ተስፋዬ', 'አለማየሁ ካሳዬ', 'ማህሌት ክፍሌ', 'ዮሐንስ ገብረፃድቅ', 'መስከረም ገብረመድህን',
  'ትሩፋት ካሳ', 'በላይነሽ አሰፋ', 'ተክሉ ማሞ', 'ጌታቸው አበራ', 'ወንድወሰን አያሌው',
  'ብሩክታዊት ታደሰ', 'እንዳለ መኮንን', 'ባይሳ ጉታ', 'ሰነይት ተስፋማርያም', 'ፈይሳ ደበላ',
  'ጫላ በየነ', 'ሃና ተሾመ', 'ሰይፉ አየለ', 'ህይወት በርሄ', 'ተክለሃይማኖት ካሳ',
  'ግርማ ወልደጊዮርጊስ', 'አብነት ገብሬ', 'ሙሉጌታ ደስታ', 'ኤልሳቤጥ ታደሰ', 'ታደለ መብራቱ',
  'አጸደ ካሳዬ', 'ፍስሃ ኃይሌ', 'በረከት ተስፋዬ', 'ሮማን ከበደ', 'ነቢዩ ሰለሞን'
];

const MEMBERSHIP_LEVELS = [
  'Abal',
  'Yebeteseb_Yehbret_Amerar',
  'Mekakelegna_Amerar',
  'Keftegna_Amerar',
] as const;

const DIRECTIVE_IDS = Array.from({ length: 27 }, (_, i) => `INS-${(i + 1).toString().padStart(2, '0')}`);

const FEEDBACK_SAMPLES_NEED = [
  'በኢንስፔክሽንና የሥነ-ምግባር መመሪያዎች ዙሪያ የላቀ ተግባራዊ ስልጠና እንዲሰጠን እንፈልጋለን።',
  'የቴክኖሎጂ እና ዲጂታል አሰራርን ያካተተ የክትትል ስልጠና ቢታከልበት ውጤታማ ይሆናል።',
  'በአባላት የህግ ግንዛቤ እና የአመራር ክህሎት ማሳደጊያ ላይ ትኩረት ቢደረግ መልካም ነው።',
  'በዞንና ወረዳ ደረጃ ለሚገኙ አስፈፃሚዎች ተከታታይ የስልጠና ማኑዋል ማዘጋጀት ያስፈልጋል።',
  'የኢንስፔክሽን ሪፖርት አዘገጃጀት እና የክትትል ስልቶችን ያካተተ ስልጠና ቢሰጥ።',
  'የኮሚሽኑን የኢንስፔክሽን አሰራር መመሪያዎች በተግባር ለመተርጎም ተጨማሪ አጋዥ ቁሳቁስ ያስፈልጋል።',
  'የኦዲትና የቁጥጥር ስራዎችን በዘመናዊ መንገድ ማካሄድ የሚያስችል ክህሎት ማሳደጊያ ይጠበቃል።',
  'ምንም ተጨማሪ አስተያየት የለም::'
];

const FEEDBACK_SAMPLES_SATISFACTION = [
  'ስልጠናው በኢንስፔክሽን አሰራር ላይ ያለንን ግንዛቤ አዳብሮልናል።',
  'የመስተንግዶ ሁኔታው እና የሰነድ ዝግጅቱ በጥሩ ደረጃ የተዘጋጀ ነበር::',
  'አሰልጣኞቹ በቂ ዝግጅት ያደረጉ እና ግልጽ ማብራሪያ የሰጡ ነበሩ::',
  'በቀጣይ ተግባራዊ ልምምዶችና የቡድን ውይይቶች በስፋት ቢካተቱ መልካም ነው::',
  'የቀረቡት የኢንስፔክሽን መመሪያዎችና ማኑዋሎች ለስራችን እጅግ ጠቃሚ ናቸው::',
  'የስልጠናው ሰዓትና ቦታ አመቺ ነበር፡ አደረጃጀቱም የሚደነቅ ነው።',
  'መልካም የስልጠና መድረክ ነበር፡ ለቀጣይ ስራችን ትልቅ ስንቅ ሆኖናል::'
];

const SATISFACTION_RATINGS = ['በጣም ከፍተኛ', 'ከፍተኛ', 'መካከለኛ'];

async function seedRealData() {
  console.log('--- Starting Supabase Real Test Data Injection ---');

  // 1. Existing Category IDs from Supabase
  const needCatId = 'cat-1785923023233';
  const satCatId = 'cat-1786083374041';

  // 3. Generate 40 Real Need Submissions
  console.log('Generating 40 Real Need Submissions...');
  const needSubmissions = [];
  const regions = Object.keys(regionsData);

  for (let i = 0; i < 40; i++) {
    const name = ETHIOPIAN_NAMES[i % ETHIOPIAN_NAMES.length];
    const memberId = `MEM-${9000 + i}`;
    const phone = `09${1 + (i % 4)}1${(100000 + i * 1234) % 900000}`;
    const level = MEMBERSHIP_LEVELS[i % MEMBERSHIP_LEVELS.length];
    const region = regions[i % regions.length];
    const zones = regionsData[region as keyof typeof regionsData] || [];
    const zone = zones.length > 0 ? zones[i % zones.length] : 'ክፍለ ከተማ አራዳ';
    const woredaNum = (i % 14) + 1;
    const woreda = `ወረዳ ${woredaNum.toString().padStart(2, '0')}`;

    // Ratings for 27 directives (mostly 1 to 4 to represent real needs)
    const ratings: Record<string, number> = {};
    DIRECTIVE_IDS.forEach((id, idx) => {
      const baseRating = ((idx + i) % 5) + 1;
      ratings[id] = baseRating;
    });

    // Top 3 priority directives (lowest rated ones)
    const sortedDirectives = [...DIRECTIVE_IDS].sort((a, b) => ratings[a] - ratings[b]);
    const topPriority = sortedDirectives.slice(0, 3);

    // Preferred training methods
    const methods = i % 2 === 0 ? ['Physical', 'Media'] : ['Online', 'PrintDocument'];

    // Additional directives requested
    const additional = [DIRECTIVE_IDS[(i + 3) % 27], DIRECTIVE_IDS[(i + 7) % 27]];

    const createdAt = new Date(Date.now() - (39 - i) * 12 * 60 * 60 * 1000).toISOString();

    needSubmissions.push({
      id: `need-sub-${Date.now()}-${i}`,
      category_id: needCatId,
      member_name: name,
      member_id: memberId,
      contact: phone,
      membership_level: level,
      region,
      zone,
      woreda,
      ratings,
      top_priority_directives: topPriority,
      additional_needed_directives: additional,
      preferred_training_methods: methods,
      qualitative_feedback: FEEDBACK_SAMPLES_NEED[i % FEEDBACK_SAMPLES_NEED.length],
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  const { error: needInsertErr } = await supabase.from('sletena_submissions').insert(needSubmissions);
  if (needInsertErr) {
    console.error('Error inserting Need Submissions:', needInsertErr);
  } else {
    console.log('✅ Successfully inserted 40 Need Submissions into Supabase!');
  }

  // 4. Generate 40 Real Satisfaction Submissions
  console.log('Generating 40 Real Satisfaction Submissions...');
  const satSubmissions = [];

  for (let i = 0; i < 40; i++) {
    const name = ETHIOPIAN_NAMES[i % ETHIOPIAN_NAMES.length];
    const region = regions[i % regions.length];

    const trainerRating = 4 + (i % 2); // 4 or 5
    const contentRating = 4 + ((i + 1) % 2);
    const venueRating = 3 + (i % 3);
    const relevanceRating = 4 + (i % 2);
    const overallRating = 4 + (i % 2);
    const recommendScore = 8 + (i % 3); // 8, 9, 10 (NPS Promoters & Passives)

    const createdAt = new Date(Date.now() - (39 - i) * 10 * 60 * 60 * 1000).toISOString();

    satSubmissions.push({
      id: `sat-sub-${Date.now()}-${i}`,
      category_id: satCatId,
      participant_name: name,
      region,
      trainer_rating: trainerRating,
      content_rating: contentRating,
      venue_logistics_rating: venueRating,
      relevance_rating: relevanceRating,
      overall_rating: overallRating,
      recommend_score: recommendScore,
      positive_aspects: FEEDBACK_SAMPLES_SATISFACTION[i % FEEDBACK_SAMPLES_SATISFACTION.length],
      improvement_suggestions: 'በቀጣይ ተጨማሪ ተግባራዊ የስልጠና መድረኮች እንዲዘጋጁ እንጠይቃለን::',
      created_at: createdAt,
      submitted_at: createdAt,
    });
  }

  const { error: satInsertErr } = await supabase.from('sletena_satisfaction_submissions').insert(satSubmissions);
  if (satInsertErr) {
    console.error('Error inserting Satisfaction Submissions:', satInsertErr);
  } else {
    console.log('✅ Successfully inserted 40 Satisfaction Submissions into Supabase!');
  }

  // 5. Update categories submitters_count in Supabase
  await supabase.from('sletena_categories').update({ submitters_count: 40 }).eq('id', needCatId);
  await supabase.from('sletena_categories').update({ submitters_count: 40 }).eq('id', satCatId);

  console.log('--- Supabase Real Test Data Ingestion Completed Successfully! ---');
}

seedRealData().catch(console.error);
