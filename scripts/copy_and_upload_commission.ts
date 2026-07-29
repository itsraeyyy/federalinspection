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

interface DirectivesToUpload {
  localPath: string;
  category: 'የኮሚሽኑ መመሪያዎች' | 'የፓርቲ መመሪያዎች';
  folderName: string;
  originalFileName: string;
  storageFolder: string;
}

function getAllFilesRecursively(dirPath: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const list = fs.readdirSync(dirPath);
  list.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(filePath));
    } else {
      if (file.toLowerCase().endsWith('.pdf') || file.toLowerCase().endsWith('.docx') || file.toLowerCase().endsWith('.doc')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

async function uploadWithRetry(storagePath: string, buffer: Buffer, contentType: string, retries = 5): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`   Attempt ${attempt}/${retries} uploading to storage (${(buffer.length / 1024 / 1024).toFixed(2)} MB)...`);
      const { error } = await supabase.storage
        .from('public_documents')
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('public_documents')
          .getPublicUrl(storagePath);
        return urlData.publicUrl;
      }

      console.warn(`   Attempt ${attempt} failed: ${error.message}`);
    } catch (e: any) {
      console.warn(`   Attempt ${attempt} exception: ${e.message}`);
    }
    // Wait before retry
    await new Promise(res => setTimeout(res, 2000 * attempt));
  }
  return null;
}

async function main() {
  const rootDir = process.cwd();
  const publicDocsDir = path.join(rootDir, 'public', 'documents');

  if (!fs.existsSync(publicDocsDir)) {
    fs.mkdirSync(publicDocsDir, { recursive: true });
  }

  const commissionFolder = path.join(rootDir, '200 የኮሚሽን  መመሪያዎች');
  const files = getAllFilesRecursively(commissionFolder);

  console.log(`Found ${files.length} Commission Directives files.`);

  for (const filePath of files) {
    const relativePath = path.relative(rootDir, filePath);
    const parts = relativePath.split(path.sep);
    const subFolder = parts.length > 2 ? parts[1] : '200 የኮሚሽን  መመሪያዎች';
    const originalFileName = path.basename(filePath);
    const fileExt = path.extname(originalFileName);
    const baseNameWithoutExt = path.basename(originalFileName, fileExt);

    const cleanSubFolder = subFolder.replace(/^[0-9]+\s*–\s*/, '').replace(/,\s*$/, '').trim();
    const cleanFileName = baseNameWithoutExt.replace(/_/g, ' ').trim();

    let title = cleanFileName;
    if (cleanSubFolder && !cleanFileName.includes(cleanSubFolder)) {
      title = `${cleanSubFolder} - ${cleanFileName}`;
    }

    // Check if already in DB
    const { data: existing } = await supabase
      .from('public_files')
      .select('id')
      .eq('file_name', originalFileName)
      .eq('category', 'የኮሚሽኑ መመሪያዎች')
      .maybeSingle();

    if (existing) {
      console.log(`\nAlready in DB: "${title}" (${originalFileName}) -> Skipping`);
      continue;
    }

    // 1. Copy file to public/documents/ for static local serving fallback
    const targetPublicFolder = path.join(publicDocsDir, 'commission_directives');
    if (!fs.existsSync(targetPublicFolder)) {
      fs.mkdirSync(targetPublicFolder, { recursive: true });
    }

    const safeAsciiExt = fileExt.toLowerCase().replace(/[^a-z0-9.]/g, '') || '.pdf';
    const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeAsciiExt}`;
    const localCopyPath = path.join(targetPublicFolder, safeFileName);

    fs.copyFileSync(filePath, localCopyPath);
    console.log(`\nCopied local fallback to public/documents/commission_directives/${safeFileName}`);

    // Local static URL fallback
    const localStaticUrl = `/documents/commission_directives/${safeFileName}`;

    // 2. Upload to Supabase Storage
    const buffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    const fileSizeMb = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
    const contentType = fileExt.toLowerCase() === '.pdf' ? 'application/pdf' : 'application/octet-stream';
    const storagePath = `commission_directives/${safeFileName}`;

    const remoteUrl = await uploadWithRetry(storagePath, buffer, contentType, 4);

    const finalUrl = remoteUrl || localStaticUrl;

    console.log(`Inserting metadata into DB with URL: ${finalUrl}...`);

    const { error: dbError } = await supabase
      .from('public_files')
      .insert({
        title: title,
        category: 'የኮሚሽኑ መመሪያዎች',
        file_url: finalUrl,
        file_name: originalFileName,
        file_size: fileSizeMb,
        file_type: contentType,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error(`DB Insert error for ${originalFileName}:`, dbError);
    } else {
      console.log(`SUCCESS: Registered "${title}" in public_files!`);
    }
  }

  console.log('\nFinished processing all Commission Directives!');
}

main().catch(err => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
