import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { PostList } from '@/components/blog/PostList'
import { ThemeToggle } from '@/components/blog/ThemeToggle'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top nav */}
      <div className="border-b border-[color:var(--border)] px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="font-mono text-[11px] tracking-[0.16em] uppercase text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors">
          Notes
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-px h-4 bg-[color:var(--border)]" aria-hidden="true" />
          <Link
            href="/editor"
            className="flex items-center gap-2 text-[0.75rem] font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
          >
            <PenLine size={13} />
            <span>New post</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Header */}
        <header className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[color:var(--text-muted)] mb-5">
            Writing
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[color:var(--text-primary)] leading-[1.1] text-balance mb-5">
            Ideas worth writing down.
          </h1>
          <p className="text-[1rem] text-[color:var(--text-secondary)] leading-relaxed max-w-[48ch]">
            A personal blog for notes, essays, and anything that needs a permanent home.
          </p>
        </header>

        {/* Post list with sort + pagination */}
        <PostList />
      </div>
    </main>
  )
}
