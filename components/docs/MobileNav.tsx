'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { Menu, X, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DOC_META, type DocMeta } from '@/lib/doc-meta'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (Array.isArray(json)) return json
  if (Array.isArray(json?.items)) return json.items
  if (Array.isArray(json?.data)) return json.data
  if (Array.isArray(json?.docs)) return json.docs
  return []
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data } = useSWR('/api/docs', fetcher, {
    revalidateOnFocus: false,
    fallbackData: DOC_META,
  })

  // Ensure docs is safely fallback-checked as an array
  const docs: DocMeta[] = Array.isArray(data) ? data : data?.items ?? data?.docs ?? DOC_META

  const currentDoc = docs.find((d) => pathname === `/docs/${d.slug}`)

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 h-14 bg-background border-b border-[color:var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-[0.8125rem] font-semibold tracking-tight text-[color:var(--text-primary)]">
           My Learning Journey
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/editor"
            className="flex items-center justify-center w-8 h-8 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            aria-label="Write new chapter"
          >
            <PenLine size={16} />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-8 h-8 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'lg:hidden fixed top-14 left-0 right-0 z-35 bg-background border-b border-[color:var(--border)] transition-all duration-200',
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
      >
        <nav className="px-4 py-3">
          <ul className="space-y-0.5">
            {docs.map((doc) => {
              const href = `/docs/${doc.slug}`
              const isActive = pathname === href
              return (
                <li key={doc.slug}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all',
                      isActive
                        ? 'bg-[color:var(--surface-raised)] text-[color:var(--text-primary)]'
                        : 'text-[color:var(--text-secondary)]',
                    )}
                  >
                    <span className="font-mono text-[10px] text-[color:var(--text-muted)]">
                      {String(doc.index).padStart(2, '0')}
                    </span>
                    <span className="text-[0.8125rem] font-medium">{doc.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Current chapter indicator */}
      {currentDoc && !open && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-20 px-5 py-2 bg-background border-b border-[color:var(--border)]">
          <p className="text-[11px] text-[color:var(--text-muted)] font-mono">
            {String(currentDoc.index).padStart(2, '0')} &mdash; {currentDoc.title}
          </p>
        </div>
      )}
    </>
  )
}