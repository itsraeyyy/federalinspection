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

interface DiscoveredFile {
  fullPath: string;
  category: 'መተዳደርያ ደንብ' | 'የፓርቲ መመሪያዎች' | 'የኮሚሽኑ መመሪያዎች';
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

async function main() {
  const rootDir = process.cwd();

  const scanTargets: { folder: string; category: 'መተዳደርያ ደንብ' | 'የፓርቲ መመሪያዎች' | 'የኮሚሽኑ መመሪያዎች'; storageFolder: string }[] = [
    { folder: '100 የፓርቲ መመሪያዎች', category: 'የፓርቲ መመሪያዎች', storageFolder: 'party_directives' },
    { folder: '200 የኮሚሽን  መመሪያዎች', category: 'የኮሚሽኑ መመሪያዎች', storageFolder: 'commission_directives' }
  ];

  const discoveredFiles: DiscoveredFile[] = [];

  for (const target of scanTargets) {
    const targetDir = path.join(rootDir, target.folder);
    const files = getAllFilesRecursively(targetDir);

    for (const filePath of files) {
      const relativePath = path.relative(rootDir, filePath);
      const parts = relativePath.split(path.sep);
      const subFolder = parts.length > 2 ? parts[1] : target.folder;
      const fileName = path.basename(filePath);

      discoveredFiles.push({
        fullPath: filePath,
        category: target.category,
        folderName: subFolder,
        originalFileName: fileName,
        storageFolder: target.storageFolder
      });
    }
  }

  console.log(`Discovered ${discoveredFiles.length} files to process.`);

  let successCount = 0;

  for (const item of discoveredFiles) {
    const fileBuffer = fs.readFileSync(item.fullPath);
    const stats = fs.statSync(item.fullPath);
    const fileSizeMb = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

    // Clean title from filename and folder
    const fileExt = path.extname(item.originalFileName);
    const baseNameWithoutExt = path.basename(item.originalFileName, fileExt);

    // Human friendly title: remove numeric prefixes like 110 –, replace underscores with spaces
    const cleanSubFolder = item.folderName.replace(/^[0-9]+\s*–\s*/, '').replace(/,\s*$/, '').trim();
    const cleanFileName = baseNameWithoutExt.replace(/_/g, ' ').trim();
    
    let title = cleanFileName;
    if (cleanSubFolder && !cleanFileName.includes(cleanSubFolder)) {
      title = `${cleanSubFolder} - ${cleanFileName}`;
    }

    const safeAsciiExt = fileExt.toLowerCase().replace(/[^a-z0-9.]/g, '') || '.pdf';
    const storageFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeAsciiExt}`;
    const storagePath = `${item.storageFolder}/${storageFileName}`;

    console.log(`\nUploading [${item.category}] "${title}"...`);
    console.log(`   File: ${item.originalFileName}`);
    console.log(`   Storage Path: ${storagePath}`);

    const contentType = fileExt.toLowerCase() === '.pdf' ? 'application/pdf' : 'application/octet-stream';

    const { error: uploadError } = await supabase.storage
      .from('public_documents')
      .upload(storagePath, fileBuffer, {
        contentType: contentType,
        upsert: true
      });

    if (uploadError) {
      console.error(`Storage upload error for ${item.originalFileName}:`, uploadError);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('public_documents')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('public_files')
      .insert({
        title: title,
        category: item.category,
        file_url: publicUrl,
        file_name: item.originalFileName,
        file_size: fileSizeMb,
        file_type: contentType,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error(`DB insert error for ${item.originalFileName}:`, dbError);
    } else {
      console.log(`   SUCCESS: Uploaded and inserted into public_files!`);
      successCount++;
    }
  }

  console.log(`\nFinished uploading ${successCount} / ${discoveredFiles.length} files successfully!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
