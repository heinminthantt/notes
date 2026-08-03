/**
 * Seed script — migrates existing markdown files from the
 * `design-system-journey/` directory into the Neon PostgreSQL database.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import dns from 'dns'
import fs from 'fs'
import path from 'path'
import postgres from 'postgres'
import { config } from 'dotenv'

// Force IPv4-first DNS (fixes ETIMEDOUT on networks without full IPv6 support)
dns.setDefaultResultOrder('ipv4first')

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { ssl: 'require', idle_timeout: 5 })

interface ManifestEntry {
  slug: string
  index: number
  title: string
  subtitle: string
  filename: string
  createdAt?: string
}

const DOCS_DIR = path.join(process.cwd(), 'design-system-journey')
const MANIFEST_PATH = path.join(DOCS_DIR, 'manifest.json')

async function main() {
  console.log('🔧 Creating table if not exists…')

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

  console.log('✅ Table ready.')

  // Read manifest
  let manifest: ManifestEntry[] = []
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  } catch {
    console.log('⚠️  No manifest.json found — nothing to seed.')
    await sql.end()
    return
  }

  if (manifest.length === 0) {
    console.log('⚠️  manifest.json is empty — nothing to seed.')
    await sql.end()
    return
  }

  console.log(`📄 Found ${manifest.length} documents to seed.\n`)

  let inserted = 0
  let skipped = 0

  for (const entry of manifest) {
    const filePath = path.join(DOCS_DIR, entry.filename)
    let content = ''
    try {
      content = fs.readFileSync(filePath, 'utf-8')
    } catch {
      console.log(`  ⚠️  Skipping "${entry.slug}" — file not found: ${entry.filename}`)
      skipped++
      continue
    }

    // Check if already exists
    const existing = await sql`SELECT slug FROM documents WHERE slug = ${entry.slug}`
    if (existing.length > 0) {
      console.log(`  ⏭️  "${entry.slug}" already exists — skipping.`)
      skipped++
      continue
    }

    const createdAt = entry.createdAt ?? new Date().toISOString()

    await sql`
      INSERT INTO documents (slug, title, subtitle, content, created_at, updated_at)
      VALUES (${entry.slug}, ${entry.title}, ${entry.subtitle || ''}, ${content}, ${createdAt}::timestamptz, ${createdAt}::timestamptz)
    `

    console.log(`  ✅ Inserted "${entry.slug}"`)
    inserted++
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`)
  await sql.end()
}

main().catch(async (err) => {
  console.error('❌ Seed failed:', err)
  await sql.end()
  process.exit(1)
})
