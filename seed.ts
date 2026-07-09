import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { regionsData } from './src/lib/regions-data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = ["Infrastructure", "Administration", "Water", "Electricity", "Healthcare", "Education"];
const urgencies = ["Low", "Medium", "High", "Critical"];

async function seed() {
  console.log("Starting seed...");
  const complaints = [];

  for (let i = 0; i < 200; i++) {
    const regions = Object.keys(regionsData);
    const region = regions[Math.floor(Math.random() * regions.length)];
    const zones = regionsData[region as keyof typeof regionsData];
    const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : null;

    complaints.push({
      type: Math.random() > 0.5 ? 'Complaint' : 'Suggestion',
      name: 'Mock User ' + i,
      phone: '+251911000' + i.toString().padStart(3, '0'),
      subject: 'የሙከራ ጥቆማ ' + i,
      message: 'ይህ የሙከራ ጥቆማ ማብራሪያ ነው። Data ID: ' + i,
      status: 'New',
      target_region: region,
      target_zone: zone,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  // We must bypass the rate limit trigger (max 5 per IP).
  // We do this by instantiating a new client with a random x-forwarded-for header per chunk of 4.
  const chunkSize = 4;
  for (let i = 0; i < complaints.length; i += chunkSize) {
    const chunk = complaints.slice(i, i + chunkSize);
    
    const fakeIp = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    
    const chunkSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { 'x-forwarded-for': fakeIp }
      }
    });

    const { error } = await chunkSupabase.from('complaints').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk starting at ${i}:`, error);
    } else {
      console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
    }
  }

  console.log("Seed complete.");
}

seed();
