#!/usr/bin/env node
const readline = require('readline');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://db.raey.work';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;


const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === 'initialize') {
      sendResult(req.id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'db-raey-work', version: '1.0.0' }
      });
    } else if (req.method === 'notifications/initialized') {
      // no response needed
    } else if (req.method === 'tools/list') {
      sendResult(req.id, {
        tools: [
          {
            name: 'query_table',
            description: 'Query any table from db.raey.work using Supabase PostgREST API',
            inputSchema: {
              type: 'object',
              properties: {
                table: { type: 'string', description: 'Table name (e.g. complaints, admin_profiles)' },
                select: { type: 'string', description: 'Columns to select (e.g. *, count)' },
                limit: { type: 'number', description: 'Max rows to return (default 50)' }
              },
              required: ['table']
            }
          },
          {
            name: 'raw_rest',
            description: 'Perform a REST fetch request against db.raey.work PostgREST API',
            inputSchema: {
              type: 'object',
              properties: {
                endpoint: { type: 'string', description: 'Endpoint path (e.g. /rest/v1/complaints?select=*)' },
                method: { type: 'string', description: 'HTTP Method (GET, POST, PATCH, DELETE)' },
                body: { type: 'object', description: 'JSON payload body if POST/PATCH' }
              },
              required: ['endpoint']
            }
          }
        ]
      });
    } else if (req.method === 'tools/call') {
      const { name, arguments: args } = req.params;
      if (name === 'query_table') {
        const table = args.table;
        const select = args.select || '*';
        const limit = args.limit || 50;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=${limit}`, { headers });
        const data = await res.json();
        sendResult(req.id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
      } else if (name === 'raw_rest') {
        const endpoint = args.endpoint.startsWith('/') ? args.endpoint : `/${args.endpoint}`;
        const method = args.method || 'GET';
        const options = { method, headers };
        if (args.body) options.body = JSON.stringify(args.body);
        const res = await fetch(`${SUPABASE_URL}${endpoint}`, options);
        const data = await res.json();
        sendResult(req.id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
      } else {
        sendError(req.id, -32601, 'Method not found');
      }
    }
  } catch (err) {
    // ignore invalid json lines
  }
});

function sendResult(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function sendError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}
