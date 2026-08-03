'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, PenLine, Search, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

type SortOption = 'newest' | 'oldest' | 'az' | 'za'

interface DocMeta {
  slug: string
  index: number
  title: string
  subtitle: string
  createdAt: string
}

interface ApiResponse {
  items: DocMeta[]
  total: number
  page: number
  totalPages: number
  perPage: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  az: 'A → Z',
  za: 'Z → A',
}

const SORT_ICONS: Record<SortOption, React.ReactNode> = {
  newest: <ArrowDown size={12} />,
  oldest: <ArrowUp size={12} />,
  az: <ArrowUpDown size={12} />,
  za: <ArrowUpDown size={12} />,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Highlight matching text in a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[color:var(--accent)] text-[color:var(--accent-foreground)] rounded-[2px] px-[1px]"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function PostList() {
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [rawQuery, setRawQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const PER_PAGE = 10

  const query = useDebounce(rawQuery, 250)

  const params = new URLSearchParams({
    sort,
    page: String(page),
    per_page: String(PER_PAGE),
    ...(query ? { q: query } : {}),
  })

  const { data, isLoading } = useSWR<ApiResponse>(
    `/api/docs?${params}`,
    fetcher,
    { keepPreviousData: true },
  )

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const isSearching = query.length > 0

  function handleSort(next: SortOption) {
    setSort(next)
    setPage(1)
  }

  function handleSearch(value: string) {
    setRawQuery(value)
    setPage(1)
  }

  function clearSearch() {
    setRawQuery('')
    setPage(1)
    searchRef.current?.focus()
  }

  return (
    <section aria-label="Post list">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none"
        />
        <input
          ref={searchRef}
          type="search"
          value={rawQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search posts…"
          aria-label="Search posts"
          className="w-full bg-[color:var(--surface-raised)] border border-[color:var(--border)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] text-[0.875rem] rounded-md pl-9 pr-9 py-2 outline-none focus:border-[color:var(--border-strong)] focus:ring-1 focus:ring-[color:var(--ring)] transition-colors"
        />
        {rawQuery && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[color:var(--text-muted)] hidden sm:block">
            Sort
          </span>
          <div className="flex items-center gap-1 sm:ml-2">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
              <button
                key={s}
                onClick={() => handleSort(s)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[0.75rem] font-medium transition-colors ${
                  sort === s
                    ? 'bg-[color:var(--surface-raised)] text-[color:var(--text-primary)] border border-[color:var(--border-strong)]'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-raised)]'
                }`}
              >
                {SORT_ICONS[s]}
                <span className="hidden sm:inline ml-1">{SORT_LABELS[s]}</span>
              </button>
            ))}
          </div>
        </div>
        <span className="font-mono text-[10px] text-[color:var(--text-muted)] tabular-nums">
          {isLoading
            ? '—'
            : isSearching
              ? `${total} result${total !== 1 ? 's' : ''}`
              : `${total} post${total !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* List */}
      {isLoading && items.length === 0 ? (
        <ul className="divide-y divide-[color:var(--border)]" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="py-5">
              <div className="flex items-start gap-6">
                <div className="w-5 h-3 rounded bg-[color:var(--surface-raised)] animate-pulse mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-[color:var(--surface-raised)] animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[color:var(--surface-raised)] animate-pulse" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          {isSearching ? (
            <>
              <p className="text-[color:var(--text-muted)] text-[0.875rem] mb-3">
                No posts matched &ldquo;{rawQuery}&rdquo;
              </p>
              <button
                onClick={clearSearch}
                className="text-[0.8125rem] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] underline underline-offset-2 transition-colors"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p className="text-[color:var(--text-muted)] text-[0.875rem]">No posts yet.</p>
              <Link
                href="/editor"
                className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
              >
                <PenLine size={13} />
                Write the first one
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-[color:var(--border)]">
          {items.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/docs/${doc.slug}`}
                className="flex items-start gap-6 py-5 group hover:bg-[color:var(--surface-raised)] -mx-4 px-4 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-[color:var(--text-primary)] mb-1 group-hover:underline underline-offset-2 text-balance">
                    <Highlight text={doc.title} query={query} />
                  </p>
                  <p className="text-[0.8125rem] text-[color:var(--text-muted)] leading-relaxed mb-2">
                    <Highlight text={doc.subtitle} query={query} />
                  </p>
                  <time
                    dateTime={doc.createdAt}
                    className="font-mono text-[10px] tracking-wide text-[color:var(--text-muted)] opacity-70"
                  >
                    {formatDate(doc.createdAt)}
                  </time>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 mt-1.5 text-[color:var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Write new CTA — always at bottom of list */}
      {!isLoading && (
        <Link
          href="/editor"
          className="flex items-center gap-3 py-5 -mx-4 px-4 rounded-lg group transition-colors hover:bg-[color:var(--surface-raised)] border-t border-dashed border-[color:var(--border)]"
        >
          <div className="flex items-center gap-2 text-[color:var(--text-muted)] group-hover:text-[color:var(--text-secondary)] transition-colors">
            <PenLine size={13} />
            <span className="text-[0.875rem] font-medium">Write a new post…</span>
          </div>
        </Link>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.8125rem] font-medium text-[color:var(--text-secondary)] border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              const isActive = p === page
              // Show first, last, current ±1, ellipsis otherwise
              const show =
                p === 1 || p === totalPages || Math.abs(p - page) <= 1
              const showEllipsisBefore = p === page - 2 && page > 3
              const showEllipsisAfter = p === page + 2 && page < totalPages - 2

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <span
                    key={p}
                    className="w-7 text-center font-mono text-[0.75rem] text-[color:var(--text-muted)]"
                  >
                    …
                  </span>
                )
              }

              if (!show) return null

              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-[0.8125rem] font-mono tabular-nums transition-colors ${
                    isActive
                      ? 'bg-[color:var(--accent)] text-[color:var(--accent-foreground)] font-semibold'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-raised)]'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.8125rem] font-medium text-[color:var(--text-secondary)] border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  )
}
