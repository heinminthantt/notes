'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Eye, EyeOff, Send, CheckCircle, AlertCircle,
  Loader2, PenLine, Save, Trash2, X, ShieldAlert,
} from 'lucide-react'
import { MarkdownToolbar } from './MarkdownToolbar'
import { cn } from '@/lib/utils'

type EditorMode = 'write' | 'preview' | 'split'

const DEFAULT_CONTENT = `## Introduction

Write your chapter content here. Use the toolbar above to format text.

## What You'll Learn

- Key concept one
- Key concept two
- Key concept three

## Going Deeper

Add more sections as needed. Every heading level 2 (\`##\`) will become a major section.

---

> A well-placed blockquote adds weight to an important idea.

`

interface EditorClientProps {
  /** When provided, the editor operates in "edit" mode for an existing chapter */
  editSlug?: string
  initialTitle?: string
  initialSubtitle?: string
  initialContent?: string
}

export function EditorClient({
  editSlug,
  initialTitle = '',
  initialSubtitle = '',
  initialContent,
}: EditorClientProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const deletePasswordRef = useRef<HTMLInputElement>(null)
  const isEditMode = Boolean(editSlug)

  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [slug, setSlug] = useState(editSlug ?? '')
  const [slugEdited, setSlugEdited] = useState(isEditMode)
  const [content, setContent] = useState(initialContent ?? DEFAULT_CONTENT)
  const [mode, setMode] = useState<EditorMode>('split')
  const [previewHtml, setPreviewHtml] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [wordCount, setWordCount] = useState(0)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'deleting' | 'error'>('idle')
  const [deleteError, setDeleteError] = useState('')

  // Auto-derive slug from title unless manually edited
  useEffect(() => {
    if (!slugEdited && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-'),
      )
    }
  }, [title, slugEdited])

  // Live preview via API — debounced 400ms
  useEffect(() => {
    const id = setTimeout(async () => {
      if (!content.trim()) {
        setPreviewHtml('')
        return
      }
      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
        if (res.ok) {
          const { html } = await res.json()
          setPreviewHtml(html)
        }
      } catch {
        // silent — preview is best-effort
      }
    }, 400)
    return () => clearTimeout(id)
  }, [content])

  // Word count
  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0)
  }, [content])

  // Focus delete password input when modal opens
  useEffect(() => {
    if (showDeleteModal) {
      setTimeout(() => deletePasswordRef.current?.focus(), 100)
    }
  }, [showDeleteModal])

  const handlePublish = useCallback(async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setErrorMsg('Title, slug, and content are all required.')
      setStatus('error')
      return
    }
    setStatus('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, slug, content }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('success')
      // Navigate to the new chapter after a brief moment
      setTimeout(() => router.push(`/docs/${data.slug}`), 1200)
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }, [title, subtitle, slug, content, router])

  const handleUpdate = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required.')
      setStatus('error')
      return
    }
    setStatus('saving')
    setErrorMsg('')

    try {
      const res = await fetch('/api/docs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: editSlug, title, subtitle, content }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('success')
      setTimeout(() => router.push(`/docs/${editSlug}`), 1200)
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }, [title, subtitle, editSlug, content, router])

  const handleDelete = useCallback(async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Password is required.')
      setDeleteStatus('error')
      return
    }
    setDeleteStatus('deleting')
    setDeleteError('')

    try {
      const res = await fetch('/api/docs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: editSlug, password: deletePassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete.')
        setDeleteStatus('error')
        return
      }

      // Redirect to home after deletion
      router.push('/')
    } catch {
      setDeleteError('Network error — please try again.')
      setDeleteStatus('error')
    }
  }, [editSlug, deletePassword, router])

  const handleSave = isEditMode ? handleUpdate : handlePublish
  const isPublishable = title.trim() && slug.trim() && content.trim()

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-4 h-12 border-b border-[color:var(--border)] shrink-0 bg-[color:var(--surface)]">
        <div className="flex items-center gap-3">
          <Link
            href={isEditMode ? `/docs/${editSlug}` : '/'}
            className="flex items-center gap-1.5 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            aria-label={isEditMode ? 'Back to chapter' : 'Back to home'}
          >
            <ArrowLeft size={14} />
            <span className="text-[0.75rem] font-mono tracking-wide hidden sm:inline">Back</span>
          </Link>
          <span className="text-[color:var(--border-strong)]">/</span>
          <div className="flex items-center gap-1.5 text-[color:var(--text-muted)]">
            <PenLine size={13} />
            <span className="text-[0.75rem] font-mono tracking-wide">
              {isEditMode ? 'Edit Chapter' : 'New Chapter'}
            </span>
          </div>
        </div>

        {/* Mode toggles */}
        <div className="flex items-center gap-1 bg-[color:var(--surface-raised)] rounded-md p-0.5">
          {(['write', 'split', 'preview'] as EditorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1 rounded text-[0.6875rem] font-mono tracking-wide transition-all capitalize',
                mode === m
                  ? 'bg-[color:var(--accent)] text-[color:var(--accent-foreground)]'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]',
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Delete button — only in edit mode */}
          {isEditMode && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.8125rem] font-medium transition-all',
                'text-red-400 hover:bg-red-500/10 hover:text-red-300',
              )}
              aria-label="Delete this chapter"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {/* Publish / Save button */}
          <button
            onClick={handleSave}
            disabled={!isPublishable || status === 'saving' || status === 'success'}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-md text-[0.8125rem] font-medium transition-all',
              isPublishable && status === 'idle'
                ? 'bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90'
                : 'opacity-40 cursor-not-allowed bg-[color:var(--surface-raised)] text-[color:var(--text-muted)]',
              status === 'success' && 'opacity-100 bg-emerald-500/20 text-emerald-400 cursor-default',
              status === 'error' && 'opacity-100 bg-red-500/20 text-red-400 cursor-pointer',
            )}
          >
            {status === 'saving' && <Loader2 size={13} className="animate-spin" />}
            {status === 'success' && <CheckCircle size={13} />}
            {status === 'error' && <AlertCircle size={13} />}
            {status === 'idle' && (isEditMode ? <Save size={13} /> : <Send size={13} />)}
            <span>
              {status === 'idle' && (isEditMode ? 'Save' : 'Publish')}
              {status === 'saving' && (isEditMode ? 'Saving…' : 'Publishing…')}
              {status === 'success' && 'Saved'}
              {status === 'error' && 'Retry'}
            </span>
          </button>
        </div>
      </header>

      {/* Error banner */}
      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-[0.8125rem]">
          <AlertCircle size={13} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Metadata fields */}
      <div className="flex items-stretch gap-0 border-b border-[color:var(--border)] shrink-0">
        <div className="flex-1 border-r border-[color:var(--border)]">
          <input
            type="text"
            placeholder="Chapter title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              'w-full px-5 py-3.5 bg-transparent text-[1.0625rem] font-semibold',
              'text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)]',
              'outline-none focus:bg-[color:var(--surface-raised)] transition-colors',
            )}
          />
        </div>
        <div className="flex-1 border-r border-[color:var(--border)]">
          <input
            type="text"
            placeholder="One-line subtitle…"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={cn(
              'w-full px-5 py-3.5 bg-transparent text-[0.9375rem]',
              'text-[color:var(--text-secondary)] placeholder:text-[color:var(--text-muted)]',
              'outline-none focus:bg-[color:var(--surface-raised)] transition-colors',
            )}
          />
        </div>
        <div className="w-52 flex items-center gap-1.5 px-4">
          <span className="font-mono text-[11px] text-[color:var(--text-muted)] shrink-0">/docs/</span>
          <input
            type="text"
            placeholder="slug"
            value={slug}
            disabled={isEditMode}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugEdited(true)
            }}
            className={cn(
              'flex-1 min-w-0 bg-transparent font-mono text-[0.8125rem]',
              'text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)]',
              'outline-none',
              isEditMode && 'opacity-50 cursor-not-allowed',
            )}
          />
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Write pane */}
        {(mode === 'write' || mode === 'split') && (
          <div
            className={cn(
              'flex flex-col overflow-hidden',
              mode === 'split' ? 'w-1/2 border-r border-[color:var(--border)]' : 'w-full',
            )}
          >
            <MarkdownToolbar textareaRef={textareaRef} value={content} onChange={setContent} />
            <div className="relative flex-1 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck
                className={cn(
                  'w-full h-full resize-none bg-transparent',
                  'px-6 pt-5 pb-10',
                  'font-mono text-[0.875rem] leading-[1.75] text-[color:var(--text-secondary)]',
                  'placeholder:text-[color:var(--text-muted)]',
                  'outline-none',
                )}
                placeholder="Start writing your chapter…"
                aria-label="Markdown editor"
              />
              {/* Word count */}
              <div className="absolute bottom-4 right-5 font-mono text-[10px] text-[color:var(--text-muted)] pointer-events-none select-none">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </div>
            </div>
          </div>
        )}

        {/* Preview pane */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className={cn(
              'flex flex-col overflow-hidden',
              mode === 'split' ? 'w-1/2' : 'w-full',
            )}
          >
            <div className="flex items-center gap-2 px-4 h-9 border-b border-[color:var(--border)] bg-[color:var(--surface)] shrink-0">
              <Eye size={12} className="text-[color:var(--text-muted)]" />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[color:var(--text-muted)]">
                Preview
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {previewHtml ? (
                <>
                  {/* Mini chapter header */}
                  {title && (
                    <header className="mb-8 pb-6 border-b border-[color:var(--border)]">
                      {subtitle && (
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[color:var(--text-muted)] mb-2">
                          Preview
                        </p>
                      )}
                      <h1 className="text-2xl font-bold tracking-tight text-[color:var(--text-primary)] leading-tight mb-1.5">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-[0.875rem] text-[color:var(--text-secondary)] leading-relaxed">
                          {subtitle}
                        </p>
                      )}
                    </header>
                  )}
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <EyeOff size={20} className="text-[color:var(--text-muted)]" />
                  <p className="text-[0.8125rem] text-[color:var(--text-muted)]">
                    Start writing to see a preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false)
              setDeletePassword('')
              setDeleteError('')
              setDeleteStatus('idle')
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-6 shadow-xl">
              {/* Close button */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
                  <ShieldAlert size={18} className="text-red-400" />
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                    setDeleteError('')
                    setDeleteStatus('idle')
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-raised)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-[1rem] font-semibold text-[color:var(--text-primary)] mb-1.5">
                Delete chapter?
              </h3>
              <p className="text-[0.8125rem] text-[color:var(--text-muted)] leading-relaxed mb-5">
                This will permanently delete <strong className="text-[color:var(--text-secondary)]">&ldquo;{initialTitle}&rdquo;</strong> and its markdown file. This action cannot be undone.
              </p>

              {/* Password form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                className="space-y-3"
              >
                <input
                  ref={deletePasswordRef}
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value)
                    if (deleteError) setDeleteError('')
                  }}
                  placeholder="Enter password to confirm"
                  autoComplete="off"
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-lg bg-[color:var(--surface-raised)] border text-[0.875rem]',
                    'text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)]',
                    'outline-none transition-all',
                    deleteError
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-[color:var(--border)] focus:border-[color:var(--border-strong)]',
                  )}
                />

                {deleteError && (
                  <p className="text-[0.8125rem] text-red-400 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {deleteError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeletePassword('')
                      setDeleteError('')
                      setDeleteStatus('idle')
                    }}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-lg text-[0.875rem] font-medium',
                      'bg-[color:var(--surface-raised)] text-[color:var(--text-secondary)]',
                      'hover:text-[color:var(--text-primary)] transition-colors',
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!deletePassword.trim() || deleteStatus === 'deleting'}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[0.875rem] font-medium transition-all',
                      deletePassword.trim() && deleteStatus !== 'deleting'
                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 active:scale-[0.98]'
                        : 'bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] cursor-not-allowed opacity-50',
                    )}
                  >
                    {deleteStatus === 'deleting' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    {deleteStatus === 'deleting' ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
