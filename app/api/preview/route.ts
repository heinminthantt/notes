import { NextResponse } from 'next/server'
import { marked } from 'marked'

// POST /api/preview — converts raw markdown to HTML for the live preview
export async function POST(req: Request) {
  try {
    const { content } = await req.json()
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ html: '' })
    }
    marked.setOptions({ gfm: true, breaks: false })
    const html = marked(content) as string
    return NextResponse.json({ html })
  } catch {
    return NextResponse.json({ html: '' })
  }
}
