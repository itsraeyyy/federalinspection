import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.raey.work';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface BylawItem {
  localPath: string;
  title: string;
  fileName: string;
  storageFileName: string;
}

const filesToUpload: BylawItem[] = [
  {
    localPath: '000 መተዳደሪያ/010 – የ2012 መተዳደሪያ ደንብ፣/በመተዳደሪያ ደንብ ማሻሻያ የተደረገባቸው ድንጋጌዎች - 22-4-2017.pdf',
    title: 'የ2012 መተዳደሪያ ደንብ - በመተዳደሪያ ደንብ ማሻሻያ የተደረገባቸው ድንጋጌዎች (22-4-2017)',
    fileName: 'በመተዳደሪያ ደንብ ማሻሻያ የተደረገባቸው ድንጋጌዎች - 22-4-2017.pdf',
    storageFileName: 'bylaws_2012_amendments.pdf'
  },
  {
    localPath: '000 መተዳደሪያ/020 – የ2014 መተዳደሪያ ደንብ፣/በአማረኛ_የታተመ_የብልፅግና_ፓርቲ_መተዳደሪያ_ደንብ_2015-1.pdf',
    title: 'የ2014 የብልፅግና ፓርቲ መተዳደሪያ ደንብ',
    fileName: 'በአማረኛ_የታተመ_የብልፅግና_ፓርቲ_መተዳደሪያ_ደንብ_2015-1.pdf',
    storageFileName: 'prosperity_party_bylaws_2014.pdf'
  },
  {
    localPath: '000 መተዳደሪያ/030 – የ2017 መተዳደሪያ ደንብ፣/በመተዳደሪያ ደንብ ማሻሻያ የተደረገባቸው ድንጋጌዎች - 22-4-2017.pdf',
    title: 'የ2017 በመተዳደሪያ ደንብ ማሻሻያ የተደረገባቸው ድንጋጌዎች (22-4-2017)',
    fileName: 'በመተዳደሪያ ደንብ ማሻሻያ የተደረገባቸው ድንጋጌዎች - 22-4-2017.pdf',
    storageFileName: 'bylaws_2017_amendments.pdf'
  },
  {
    localPath: '000 መተዳደሪያ/030 – የ2017 መተዳደሪያ ደንብ፣/የብልፅግና መተዳደሪያ ደንብ - ጥር 24-2017 በጉባዔ የጸደቀና የታረመ 12.06.2017.pdf',
    title: 'የብልፅግና መተዳደሪያ ደንብ - ጥር 24-2017 በጉባዔ የጸደቀና የታረመ (12.06.2017)',
    fileName: 'የብልፅግና መተዳደሪያ ደንብ - ጥር 24-2017 በጉባዔ የጸደቀና የታረመ 12.06.2017.pdf',
    storageFileName: 'prosperity_bylaws_2017_assembly.pdf'
  }
];

async function main() {
  const rootDir = process.cwd();

  for (const item of filesToUpload) {
    const fullPath = path.join(rootDir, item.localPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const stats = fs.statSync(fullPath);
    const fileSizeMb = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

    const storagePath = `bylaws/${Date.now()}_${item.storageFileName}`;

    console.log(`Uploading ${item.title} to storage at ${storagePath}...`);

    const { error: uploadError } = await supabase.storage
      .from('public_documents')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error(`Storage upload error for ${item.title}:`, uploadError);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('public_documents')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    console.log(`Inserting metadata into public_files DB table...`);

    const { data: dbData, error: dbError } = await supabase
      .from('public_files')
      .insert({
        title: item.title,
        category: 'መተዳደርያ ደንብ',
        file_url: publicUrl,
        file_name: item.fileName,
        file_size: fileSizeMb,
        file_type: 'application/pdf',
        created_at: new Date().toISOString()
      })
      .select('*');

    if (dbError) {
      console.error(`DB Insert error for ${item.title}:`, dbError);
    } else {
      console.log(`Successfully uploaded & registered: ${item.title}`);
    }
  }

  console.log('\nAll bylaws upload processes completed!');
}

main().catch(err => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
