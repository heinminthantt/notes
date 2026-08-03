import { NextResponse } from 'next/server'

// POST /api/auth/verify — checks editor password
export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    const correct = process.env.EDITOR_PASSWORD ?? 'hein@2509'

    if (password === correct) {
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }
}
