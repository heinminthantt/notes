// Server-only — uses database. Never import this in a 'use client' component.
import 'server-only'
import { marked } from 'marked'
import { sql, initDb } from '@/lib/db'

export interface DocMeta {
  slug: string
  title: string
  subtitle: string
  createdAt: string // ISO 8601
}

export interface Doc extends DocMeta {
  html: string
  rawContent: string
}

// Ensure the table exists on first call
let dbReady: Promise<void> | null = null
function ensureDb() {
  if (!dbReady) dbReady = initDb()
  return dbReady
}

export async function getAllDocs(): Promise<DocMeta[]> {
  await ensureDb()
  const rows = await sql`
    SELECT slug, title, subtitle, created_at as "createdAt"
    FROM documents
    ORDER BY created_at DESC
  `
  return rows as DocMeta[]
}

export async function getDocBySlug(slug: string): Promise<Doc | null> {
  await ensureDb()
  const rows = await sql`
    SELECT slug, title, subtitle, content, created_at as "createdAt"
    FROM documents
    WHERE slug = ${slug}
    LIMIT 1
  `

  if (rows.length === 0) return null

  const row = rows[0] as { slug: string; title: string; subtitle: string; content: string; createdAt: string }

  marked.setOptions({ gfm: true, breaks: false })
  const html = marked(row.content) as string

  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    createdAt: row.createdAt,
    html,
    rawContent: row.content,
  }
}

export async function getAdjacentDocs(slug: string): Promise<{ prev: DocMeta | null; next: DocMeta | null }> {
  await ensureDb()

  // Get the current doc's created_at
  const current = await sql`
    SELECT created_at FROM documents WHERE slug = ${slug} LIMIT 1
  `

  if (current.length === 0) return { prev: null, next: null }

  const createdAt = current[0].created_at

  // Previous doc: the one created just before this one (more recent in reading order = older created_at)
  const prevRows = await sql`
    SELECT slug, title, subtitle, created_at as "createdAt"
    FROM documents
    WHERE created_at < ${createdAt}
    ORDER BY created_at DESC
    LIMIT 1
  `

  // Next doc: the one created just after this one
  const nextRows = await sql`
    SELECT slug, title, subtitle, created_at as "createdAt"
    FROM documents
    WHERE created_at > ${createdAt}
    ORDER BY created_at ASC
    LIMIT 1
  `

  return {
    prev: prevRows.length > 0 ? (prevRows[0] as DocMeta) : null,
    next: nextRows.length > 0 ? (nextRows[0] as DocMeta) : null,
  }
}

// Re-export for backward compat — now dynamically loaded
export const DOC_META: DocMeta[] = []

// Synchronous wrapper is no longer possible with DB — callers should use getAllDocs()
export function getManifest(): DocMeta[] {
  // This is kept for import compatibility but returns empty.
  // Server components should use getAllDocs() instead.
  return []
}
