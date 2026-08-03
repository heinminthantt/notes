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
  createdAt: string
}

function readManifest(): DocMeta[] {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function writeManifest(manifest: DocMeta[]) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
}

// GET /api/docs — returns paginated + sorted manifest
// Query params: sort=newest|oldest|az|za, page=1, per_page=10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sort = (searchParams.get('sort') ?? 'newest') as 'newest' | 'oldest' | 'az' | 'za'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '10', 10)))
  const query = (searchParams.get('q') ?? '').toLowerCase().trim()

  let manifest = readManifest()

  // Filter by search query (title + subtitle)
  if (query) {
    manifest = manifest.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.subtitle.toLowerCase().includes(query),
    )
  }

  // Sort
  if (sort === 'newest') {
    manifest = [...manifest].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  } else if (sort === 'oldest') {
    manifest = [...manifest].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  } else if (sort === 'az') {
    manifest = [...manifest].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort === 'za') {
    manifest = [...manifest].sort((a, b) => b.title.localeCompare(a.title))
  }

  const total = manifest.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const items = manifest.slice(start, start + perPage)

  return NextResponse.json({ items, total, page, totalPages, perPage })
}

// POST /api/docs — creates a new doc and appends it to the manifest
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, subtitle, slug, content } = body as {
      title: string
      subtitle: string
      slug: string
      content: string
    }

    // Validate required fields
    if (!title?.trim() || !slug?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'title, slug, and content are required' },
        { status: 400 },
      )
    }

    // Sanitize slug: lowercase, only a-z 0-9 hyphens
    const safeSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const manifest = readManifest()

    // Guard: no duplicate slug
    if (manifest.some((d) => d.slug === safeSlug)) {
      return NextResponse.json(
        { error: `A chapter with slug "${safeSlug}" already exists.` },
        { status: 409 },
      )
    }

    const nextIndex = manifest.length
    const filename = `${String(nextIndex).padStart(2, '0')}-${safeSlug}.md`
    const filePath = path.join(DOCS_DIR, filename)

    // Write the markdown file
    fs.writeFileSync(filePath, content, 'utf-8')

    // Append to manifest
    const newEntry: DocMeta = {
      slug: safeSlug,
      index: nextIndex,
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      filename,
      createdAt: new Date().toISOString(),
    }
    manifest.push(newEntry)
    writeManifest(manifest)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (err) {
    console.error('[api/docs POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/docs — updates an existing doc's content and/or metadata
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { slug, title, subtitle, content } = body as {
      slug: string
      title?: string
      subtitle?: string
      content?: string
    }

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const manifest = readManifest()
    const idx = manifest.findIndex((d) => d.slug === slug)

    if (idx === -1) {
      return NextResponse.json({ error: `Chapter "${slug}" not found.` }, { status: 404 })
    }

    // Update metadata fields if provided
    if (title) manifest[idx].title = title.trim()
    if (subtitle !== undefined) manifest[idx].subtitle = subtitle.trim()
    writeManifest(manifest)

    // Update file content if provided
    if (content !== undefined) {
      const filePath = path.join(DOCS_DIR, manifest[idx].filename)
      fs.writeFileSync(filePath, content, 'utf-8')
    }

    return NextResponse.json(manifest[idx])
  } catch (err) {
    console.error('[api/docs PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/docs — deletes a chapter (password-protected)
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { slug, password } = body as { slug: string; password: string }

    // Verify password
    const correct = process.env.EDITOR_PASSWORD ?? 'hein@2509'
    if (password !== correct) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    if (!slug?.trim()) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const manifest = readManifest()
    const idx = manifest.findIndex((d) => d.slug === slug)

    if (idx === -1) {
      return NextResponse.json({ error: `Chapter "${slug}" not found.` }, { status: 404 })
    }

    // Delete the markdown file
    const filePath = path.join(DOCS_DIR, manifest[idx].filename)
    try {
      fs.unlinkSync(filePath)
    } catch {
      // File may already be missing — continue with manifest cleanup
    }

    // Remove from manifest and re-index
    manifest.splice(idx, 1)
    manifest.forEach((d, i) => {
      d.index = i
    })
    writeManifest(manifest)

    return NextResponse.json({ ok: true, deleted: slug })
  } catch (err) {
    console.error('[api/docs DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
