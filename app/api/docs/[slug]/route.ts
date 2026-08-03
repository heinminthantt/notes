import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), 'design-system-journey')
const MANIFEST_PATH = path.join(DOCS_DIR, 'manifest.json')

interface DocMeta {
  slug: string
  index: number
  title: string
  subtitle: string
  filename: string
}

function readManifest(): DocMeta[] {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  } catch {
    return []
  }
}

// GET /api/docs/[slug] — returns metadata + raw markdown for editing
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const manifest = readManifest()
  const meta = manifest.find((d) => d.slug === slug)

  if (!meta) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const filePath = path.join(DOCS_DIR, meta.filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return NextResponse.json({ ...meta, content })
  } catch {
    return NextResponse.json({ error: 'Could not read file' }, { status: 500 })
  }
}
