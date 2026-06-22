const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const anonMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], anonMatch[1]);

async function testInsert() {
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      name: 'Full Name',
      phone: '0911223344',
      type: 'Suggestion',
      subject: 'Test Inst',
      message: 'This is the main subject/message',
      tracking_code: 'TRK-FRONTEND-12345',
      age: NaN,
      attachments: [],
      status: 'New',
    })
    .select('id')
    .single();

  if (error) {
    console.log('INSERT ERROR:', error);
  } else {
    console.log('INSERT SUCCESS:', data);
  }
}

testInsert();
