import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.TEXTBEE_API_KEY;
const deviceId = process.env.TEXTBEE_DEVICE_ID;
const baseUrl = process.env.TEXTBEE_BASE_URL || 'https://api.text.raey.work';

async function test1() {
  const url = `${baseUrl}/api/v1/gateway/devices/${deviceId}/sendSMS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ receivers: ['+251911000000'], smsBody: 'test from self-hosted textbee' })
  });
  console.log('Test 1 (path var) status:', res.status);
  console.log('Test 1 body:', await res.text());
}

async function test2() {
  const url = `${baseUrl}/api/v1/gateway/devices/${deviceId}/send-sms`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ recipients: ['+251911000000'], message: 'test from self-hosted textbee 2' })
  });
  console.log('Test 2 (send-sms) status:', res.status);
  console.log('Test 2 body:', await res.text());
}

test1().then(test2);
