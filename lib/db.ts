/**
 * PostgreSQL client for Neon.
 *
 * Uses Neon's HTTP SQL API (/sql endpoint) directly via Node's native
 * `https` module. This bypasses the undici/fetch IPv6 timeout issue
 * that affects Node.js 18+ on networks without IPv6 support.
 *
 * Exposes a `sql` tagged-template function similar to @neondatabase/serverless.
 */
import dns from 'dns'
import https from 'https'

// Force IPv4-first DNS (fixes ETIMEDOUT on networks without full IPv6)
dns.setDefaultResultOrder('ipv4first')

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const DATABASE_URL = process.env.DATABASE_URL
const parsedUrl = new URL(DATABASE_URL.replace(/^postgresql:\/\//, 'https://'))
const API_HOST = parsedUrl.hostname
const CONN_STRING = DATABASE_URL

const httpsAgent = new https.Agent({
  keepAlive: true,
  // @ts-expect-error — Node.js supports `family` but the types may lag
  family: 4, // Force IPv4
})

/** Low-level: execute a parameterized query via Neon's HTTP SQL API */
async function httpQuery(
  query: string, 
  params: unknown[] = []
): Promise<{ rows: Record<string, unknown>[]; fields: { name: string }[]; rowCount: number }> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, params })
    const options: https.RequestOptions = {
      hostname: API_HOST,
      port: 443,
      path: '/sql',
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': CONN_STRING,
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk: string) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (res.statusCode && res.statusCode >= 400) {
            const errorMsg = json.message || json.error || `HTTP ${res.statusCode}`
            console.error('[db] Query error:', errorMsg, '| Query:', query.substring(0, 100))
            reject(new Error(errorMsg))
          } else {
            resolve(json)
          }
        } catch (parseError) {
          console.error('[db] Parse error:', parseError, '| Response:', data.substring(0, 200))
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on('error', (err) => {
      console.error('[db] Connection error:', err.message)
      reject(err)
    })
    
    req.write(body)
    req.end()
  })
}

/**
 * SQL fragment for safe raw SQL injection (e.g., ORDER BY clauses).
 * Only use with trusted/hardcoded strings.
 */
class SqlFragment {
  constructor(public text: string) {}
}

/**
 * Tagged-template SQL function.
 *
 * Usage:
 *   const rows = await sql`SELECT * FROM documents WHERE slug = ${slug}`
 *   const rows = await sql`SELECT count(*)::int as count FROM documents`
 *
 * Returns an array of row objects.
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  // Build parameterized query: replace template values with $1, $2, ...
  let query = ''
  for (let i = 0; i < strings.length; i++) {
    query += strings[i]
    if (i < values.length) {
      const v = values[i]
      if (v instanceof SqlFragment) {
        query += v.text
      } else {
        query += `$${i + 1}`
      }
    }
  }

  // Build the params array, filtering out SqlFragments
  const params = values.filter((v) => !(v instanceof SqlFragment))

  // Re-number placeholders after removing fragments
  let paramIndex = 0
  query = ''
  for (let i = 0; i < strings.length; i++) {
    query += strings[i]
    if (i < values.length) {
      const v = values[i]
      if (v instanceof SqlFragment) {
        query += v.text
      } else {
        paramIndex++
        query += `$${paramIndex}`
      }
    }
  }

  const result = await httpQuery(query, params)
  return result.rows
}

/**
 * Create a raw SQL fragment. USE ONLY WITH HARDCODED STRINGS.
 *
 * Usage:
 *   const order = sql.unsafe('created_at DESC')
 *   const rows = await sql`SELECT * FROM docs ORDER BY ${order}`
 */
sql.unsafe = function (text: string): SqlFragment {
  return new SqlFragment(text)
}

/**
 * Ensures the `documents` table and indexes exist.
 * Safe to call multiple times (all statements use IF NOT EXISTS).
 */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id          SERIAL PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      title       TEXT NOT NULL,
      subtitle    TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_documents_search
      ON documents USING GIN (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, ''))
      )
  `
}
