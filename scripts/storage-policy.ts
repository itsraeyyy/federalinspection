import { Client } from 'pg';

async function runSQL() {
  const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // First, allow insert
    await client.query(`
      CREATE POLICY "Allow public insert to report_attachments" 
      ON storage.objects FOR INSERT 
      WITH CHECK ( bucket_id = 'report_attachments' );
    `);
    console.log("Insert policy created.");

  } catch (e: any) {
    if (e.message.includes("already exists")) {
       console.log("Policy already exists.");
    } else {
       console.error("Insert policy error:", e.message);
    }
  }

  try {
    // Then allow select
    await client.query(`
      CREATE POLICY "Allow public select from report_attachments" 
      ON storage.objects FOR SELECT 
      USING ( bucket_id = 'report_attachments' );
    `);
    console.log("Select policy created.");
  } catch (e: any) {
    if (e.message.includes("already exists")) {
       console.log("Select policy already exists.");
    } else {
       console.error("Select policy error:", e.message);
    }
  }

  await client.end();
}

runSQL();
