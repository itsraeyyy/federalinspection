import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  // Try to authenticate as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@federal.local',
    password: 'password123'
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  console.log('User signed in:', authData.user?.id);

  // create a dummy file
  const fileContent = 'dummy content';
  const fileBuffer = Buffer.from(fileContent);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('public_documents')
    .upload('test.txt', fileBuffer, {
      contentType: 'text/plain',
      upsert: true
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
  } else {
    console.log('Upload success:', uploadData);
  }

  // test DB insert
  const { data: dbData, error: dbError } = await supabase
    .from('public_files')
    .insert({
      title: 'test',
      category: 'መተዳደርያ ደንብ',
      file_url: 'http://test.com/test.txt',
      file_name: 'test.txt',
      file_size: '0.00 MB',
      file_type: 'text/plain',
      uploaded_by: authData.user?.id,
    });

  if (dbError) {
    console.error('DB insert error:', dbError);
  } else {
    console.log('DB insert success:', dbData);
  }
}

testUpload();
