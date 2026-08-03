import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

const DATABASE_URL = process.env.DATABASE_URL;
console.log('Database URL found:', DATABASE_URL ? 'Yes' : 'No');
console.log('Host:', DATABASE_URL?.split('@')[1]?.split('/')[0]);

const sql = neon(DATABASE_URL);

try {
  console.log('\nTesting connection...');
  const result = await sql`SELECT 1 as test, NOW() as timestamp`;
  console.log('✅ Connection successful!');
  console.log('Result:', result);
  
  console.log('\nChecking for documents table...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log('Tables:', tables);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
