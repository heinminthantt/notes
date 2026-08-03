// Server-only — uses fs. Never import this in a 'use client' component.
import 'server-only'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

export interface DocMeta {
  slug: string
  index: number
  title: string
  subtitle: string
  filename: string
  createdAt: string // ISO 8601
}

export interface Doc extends DocMeta {
  html: string
  rawContent: string
}

const DOCS_DIR = path.join(process.cwd(), 'design-system-journey')
const MANIFEST_PATH = path.join(DOCS_DIR, 'manifest.json')

export function getManifest(): DocMeta[] {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8')
    return JSON.parse(raw) as DocMeta[]
  } catch {
    return []
  }
}

// Re-exported so callers that used DOC_META still work
export const DOC_META: DocMeta[] = getManifest()

export function getAllDocs(): DocMeta[] {
  return getManifest()
}

export function getDocBySlug(slug: string): Doc | null {
  const manifest = getManifest()
  const meta = manifest.find((d) => d.slug === slug)
  if (!meta) return null

  try {
    const filePath = path.join(DOCS_DIR, meta.filename)
    const rawContent = fs.readFileSync(filePath, 'utf-8')

    marked.setOptions({ gfm: true, breaks: false })
    const html = marked(rawContent) as string

    return { ...meta, html, rawContent }
  } catch {
    return null
  }
}

export function getAdjacentDocs(slug: string): { prev: DocMeta | null; next: DocMeta | null } {
  const manifest = getManifest()
  const index = manifest.findIndex((d) => d.slug === slug)
  return {
    prev: index > 0 ? manifest[index - 1] : null,
    next: index < manifest.length - 1 ? manifest[index + 1] : null,
  }
}
