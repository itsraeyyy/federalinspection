import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
import { resolveLoginEmail } from '../src/app/actions/auth';

async function testResolve() {
  console.log("Testing resolveLoginEmail for '+251911000001' with portalRole 'representative':");
  const res1 = await resolveLoginEmail('+251911000001', 'representative');
  console.log("Result for +251911000001:", res1);

  console.log("\nTesting resolveLoginEmail for '0900969037' with portalRole 'representative':");
  const res2 = await resolveLoginEmail('0900969037', 'representative');
  console.log("Result for 0900969037:", res2);
}

testResolve().catch(console.error);
