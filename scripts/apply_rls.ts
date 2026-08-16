// @ts-ignore
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function main() {
  const connectionStrings = [
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    'postgresql://postgres:postgres@localhost:54322/postgres',
    'postgresql://postgres:postgres@db.raey.work:5432/postgres',
    'postgresql://postgres:postgres@db.raey.work:6543/postgres'
  ];

  const sqlPath = path.join(__dirname, '../supabase/migrations/20260814_security_rls_hardening.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  for (const connStr of connectionStrings) {
    console.log(`Trying connection: ${connStr}...`);
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log(`Connected successfully to ${connStr}! Executing RLS migration...`);
      await client.query(sql);
      console.log('Successfully applied RLS migration SQL!');
      await client.end();
      return;
    } catch (e: any) {
      console.log(`Connection failed for ${connStr}: ${e.message}`);
      try { await client.end(); } catch {}
    }
  }
}

main();
