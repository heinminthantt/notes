'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
interface DocMeta {
  slug: string
  title: string
  subtitle: string
  createdAt: string
}

// Fetcher that unwraps the paginated API response to extract the docs array
const fetcher = async (url: string): Promise<DocMeta[]> => {
  const res = await fetch(url)
  const json = await res.json()
  
  if (Array.isArray(json)) return json
  if (Array.isArray(json?.items)) return json.items
  if (Array.isArray(json?.data)) return json.data
  if (Array.isArray(json?.docs)) return json.docs
  
  return [] 
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: docs = [] } = useSWR<DocMeta[]>('/api/docs', fetcher, {
    revalidateOnFocus: false,
  })

  return (
    <aside className="flex flex-col h-full">
      {/* Logo / wordmark */}
      <div className="px-6 py-6 border-b border-[color:var(--border)]">
        <Link href="/" className="block group">
          <p className="text-[10px] font-mono tracking-[0.18em] uppercase text-[color:var(--text-muted)] mb-1">
            A personal guide
          </p>
          <h1 className="text-[0.9375rem] font-semibold tracking-tight text-[color:var(--text-primary)] leading-tight group-hover:opacity-80 transition-opacity">
            My Learning
            <br />
            Journey
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Documentation chapters">
        <p className="px-3 mb-3 text-[10px] font-mono tracking-[0.14em] uppercase text-[color:var(--text-muted)]">
          Chapters
        </p>
        <ul className="space-y-0.5">
          {/* Safeguard added to ensure docs is an array before calling .map() */}
          {Array.isArray(docs) && docs.map((doc) => {
            const href = `/docs/${doc.slug}`
            const isActive = pathname === href

            return (
              <li key={doc.slug}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-start gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group',
                    isActive
                      ? 'bg-[color:var(--surface-raised)] text-[color:var(--text-primary)]'
                      : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-raised)] hover:text-[color:var(--text-primary)]',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-[0.8125rem] leading-snug font-medium">{doc.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer — write new chapter */}
      <div className="px-4 py-4 border-t border-[color:var(--border)]">
        <Link
          href="/editor"
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2.5 rounded-md transition-all',
            'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-raised)] hover:text-[color:var(--text-primary)]',
            pathname === '/editor' && 'bg-[color:var(--surface-raised)] text-[color:var(--text-primary)]',
          )}
        >
          <PenLine size={13} />
          <span className="text-[0.8125rem] font-medium">New chapter</span>
        </Link>
      </div>
    </aside>
  )
}