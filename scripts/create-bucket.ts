import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setup() {
  const { data: getBucket } = await supabaseAdmin.storage.getBucket('report_attachments');
  if (getBucket) {
    console.log("Bucket already exists. Updating size limit...");
    const { data, error } = await supabaseAdmin.storage.updateBucket('report_attachments', {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    });
    if (error) console.error("Error updating:", error);
    else console.log("Updated:", data);
  } else {
    console.log("Creating bucket...");
    const { data, error } = await supabaseAdmin.storage.createBucket('report_attachments', {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    });
    if (error) console.error("Error creating:", error);
    else console.log("Created:", data);
  }
}

setup();
