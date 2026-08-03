import Link from 'next/link'
import type { Doc, DocMeta } from '@/lib/docs'
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocReaderProps {
  doc: Doc
  prev: DocMeta | null
  next: DocMeta | null
}

export function DocReader({ doc, prev, next }: DocReaderProps) {
  return (
    <article className="min-h-full flex flex-col">
      {/* Chapter header */}
      <header className="mb-10 pb-8 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <time
              dateTime={doc.createdAt}
              className="font-mono text-[11px] tracking-[0.14em] uppercase text-[color:var(--text-muted)] mb-3 block"
            >
              {new Date(doc.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            <h1 className="text-3xl font-bold tracking-tight text-[color:var(--text-primary)] leading-tight mb-3">
              {doc.title}
            </h1>
            <p className="text-[0.9375rem] text-[color:var(--text-secondary)] leading-relaxed max-w-[52ch]">
              {doc.subtitle}
            </p>
          </div>
          <Link
            href={`/editor/${doc.slug}`}
            className={cn(
              'flex items-center gap-2 shrink-0 mt-1',
              'px-3.5 py-2 rounded-md text-[0.8125rem] font-medium',
              'text-[color:var(--text-muted)] bg-[color:var(--surface-raised)]',
              'hover:text-[color:var(--text-primary)] hover:bg-[color:var(--border)]',
              'transition-all duration-150',
            )}
            aria-label="Edit this chapter"
          >
            <PenLine size={13} />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>
      </header>

      {/* Rendered markdown content */}
      <div
        className="prose flex-1"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />

      {/* Pagination */}
      <footer className="mt-16 pt-8 border-t border-border">
        <div className="flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className={cn(
                'flex items-center gap-3 group',
                'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors',
              )}
            >
              <ArrowLeft
                size={16}
                className="shrink-0 transition-transform group-hover:-translate-x-1"
              />
              <div className="text-left">
                <p className="text-[10px] font-mono tracking-[0.12em] uppercase text-[color:var(--text-muted)] mb-0.5">
                  Previous
                </p>
                <p className="text-[0.8125rem] font-medium leading-snug">{prev.title}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className={cn(
                'flex items-center gap-3 group text-right ml-auto',
                'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors',
              )}
            >
              <div className="text-right">
                <p className="text-[10px] font-mono tracking-[0.12em] uppercase text-[color:var(--text-muted)] mb-0.5">
                  Next
                </p>
                <p className="text-[0.8125rem] font-medium leading-snug">{next.title}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 transition-transform group-hover:translate-x-1"
              />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </footer>
    </article>
  )
}
