import { NextResponse } from 'next/server'
import { sql, initDb } from '@/lib/db'

// Ensure the table exists on first request
let dbReady: Promise<void> | null = null
function ensureDb() {
  if (!dbReady) dbReady = initDb()
  return dbReady
}

// GET /api/docs — returns paginated + sorted documents
// Query params: sort=newest|oldest|az|za, page=1, per_page=10, q=search
export async function GET(req: Request) {
  await ensureDb()

  const { searchParams } = new URL(req.url)
  const sort = (searchParams.get('sort') ?? 'newest') as 'newest' | 'oldest' | 'az' | 'za'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '10', 10)))
  const query = (searchParams.get('q') ?? '').trim()
  const offset = (page - 1) * perPage

  // Build ORDER BY clause
  const orderMap: Record<string, ReturnType<typeof sql.unsafe>> = {
    newest: sql.unsafe('created_at DESC'),
    oldest: sql.unsafe('created_at ASC'),
    az: sql.unsafe('title ASC'),
    za: sql.unsafe('title DESC'),
  }
  const orderClause = orderMap[sort] ?? orderMap.newest

  try {
    let items
    let countResult

    if (query) {
      // Full-text search across title, subtitle, and content + ILIKE fallback
      const pattern = `%${query}%`
      items = await sql`
        SELECT slug, title, subtitle, created_at as "createdAt"
        FROM documents
        WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, ''))
              @@ plainto_tsquery('english', ${query})
           OR title ILIKE ${pattern}
           OR subtitle ILIKE ${pattern}
        ORDER BY ${orderClause}
        LIMIT ${perPage} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as count
        FROM documents
        WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(content, ''))
              @@ plainto_tsquery('english', ${query})
           OR title ILIKE ${pattern}
           OR subtitle ILIKE ${pattern}
      `
    } else {
      items = await sql`
        SELECT slug, title, subtitle, created_at as "createdAt"
        FROM documents
        ORDER BY ${orderClause}
        LIMIT ${perPage} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as count FROM documents
      `
    }

    const total = countResult[0]?.count ?? 0
    const totalPages = Math.ceil(total / perPage)

    return NextResponse.json({ items, total, page, totalPages, perPage })
  } catch (err) {
    console.error('[api/docs GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/docs — creates a new document
export async function POST(req: Request) {
  await ensureDb()

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

    // Check for duplicate slug
    const existing = await sql`SELECT slug FROM documents WHERE slug = ${safeSlug}`
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `A document with slug "${safeSlug}" already exists.` },
        { status: 409 },
      )
    }

    const result = await sql`
      INSERT INTO documents (slug, title, subtitle, content)
      VALUES (${safeSlug}, ${title.trim()}, ${(subtitle ?? '').trim()}, ${content})
      RETURNING slug, title, subtitle, created_at as "createdAt"
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (err) {
    console.error('[api/docs POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/docs — updates an existing document's content and/or metadata
export async function PUT(req: Request) {
  await ensureDb()

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

    // Check document exists
    const existing = await sql`SELECT id FROM documents WHERE slug = ${slug}`
    if (existing.length === 0) {
      return NextResponse.json({ error: `Document "${slug}" not found.` }, { status: 404 })
    }

    // Update all fields using COALESCE to keep existing values for null params
    const result = await sql`
      UPDATE documents
      SET title = COALESCE(${title?.trim() ?? null}, title),
          subtitle = COALESCE(${subtitle !== undefined ? subtitle.trim() : null}, subtitle),
          content = COALESCE(${content ?? null}, content),
          updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING slug, title, subtitle, created_at as "createdAt"
    `

    return NextResponse.json(result[0])
  } catch (err) {
    console.error('[api/docs PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/docs — deletes a document (password-protected)
export async function DELETE(req: Request) {
  await ensureDb()

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

    const result = await sql`DELETE FROM documents WHERE slug = ${slug} RETURNING slug`

    if (result.length === 0) {
      return NextResponse.json({ error: `Document "${slug}" not found.` }, { status: 404 })
    }

    return NextResponse.json({ ok: true, deleted: slug })
  } catch (err) {
    console.error('[api/docs DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
