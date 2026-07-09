const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

async function runMigrations() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to db');

    // 1. Run schema migration
    const schemaSql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260709094500_add_form_schemas.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('Schema migration applied.');

    // 2. Run seed migration
    const seedSql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260709094600_seed_form_schemas.sql'), 'utf8');
    await client.query(seedSql);
    console.log('Seed migration applied.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

runMigrations();
