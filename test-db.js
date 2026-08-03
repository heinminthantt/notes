// Test database connection
const dns = require('dns');
const https = require('https');

dns.setDefaultResultOrder('ipv4first');

require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
console.log('Database URL found:', DATABASE_URL ? 'Yes' : 'No');
console.log('Host:', DATABASE_URL?.split('@')[1]?.split('/')[0]);

const parsedUrl = new URL(DATABASE_URL.replace(/^postgresql:\/\//, 'https://'));
const API_HOST = parsedUrl.hostname;

const body = JSON.stringify({ query: 'SELECT 1 as test, NOW() as timestamp', params: [] });

const options = {
  hostname: API_HOST,
  port: 443,
  path: '/sql',
  method: 'POST',
  agent: new https.Agent({ keepAlive: true, family: 4 }),
  headers: {
    'Content-Type': 'application/json',
    'Neon-Connection-String': DATABASE_URL,
    'Content-Length': Buffer.byteLength(body),
  },
};

console.log('\nTesting connection to:', API_HOST);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const json = JSON.parse(data);
      if (json.rows) {
        console.log('\n✅ Connection successful!');
        console.log('Test query result:', json.rows);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  console.error('Code:', err.code);
});

req.write(body);
req.end();

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n⏱️  Request timeout (10s)');
  process.exit(1);
}, 10000);
