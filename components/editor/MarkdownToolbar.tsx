'use client'

import { useCallback } from 'react'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  prefix: string
  suffix?: string
  block?: boolean
  placeholder?: string
}

const ACTIONS: ToolbarAction[] = [
  { icon: <Heading2 size={14} />, label: 'Heading 2', prefix: '## ', block: true, placeholder: 'Heading' },
  { icon: <Heading3 size={14} />, label: 'Heading 3', prefix: '### ', block: true, placeholder: 'Heading' },
  { icon: <Bold size={14} />, label: 'Bold', prefix: '**', suffix: '**', placeholder: 'bold text' },
  { icon: <Italic size={14} />, label: 'Italic', prefix: '_', suffix: '_', placeholder: 'italic text' },
  { icon: <Code size={14} />, label: 'Inline code', prefix: '`', suffix: '`', placeholder: 'code' },
  { icon: <Quote size={14} />, label: 'Blockquote', prefix: '> ', block: true, placeholder: 'quote' },
  { icon: <List size={14} />, label: 'Bullet list', prefix: '- ', block: true, placeholder: 'list item' },
  { icon: <ListOrdered size={14} />, label: 'Numbered list', prefix: '1. ', block: true, placeholder: 'list item' },
  { icon: <Link size={14} />, label: 'Link', prefix: '[', suffix: '](url)', placeholder: 'link text' },
  { icon: <Minus size={14} />, label: 'Divider', prefix: '\n---\n', block: true, placeholder: '' },
]

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onChange: (value: string) => void
  value: string
}

export function MarkdownToolbar({ textareaRef, onChange, value }: MarkdownToolbarProps) {
  const applyAction = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current
      if (!ta) return

      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = value.slice(start, end)
      const prefix = action.prefix
      const suffix = action.suffix ?? ''
      const placeholder = action.placeholder ?? ''

      let insertion: string
      let newCursorStart: number
      let newCursorEnd: number

      if (action.block) {
        // Insert prefix at the start of the line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const insert = prefix + (selected || placeholder)
        const before = value.slice(0, lineStart)
        const after = value.slice(end)
        const newValue = before + insert + after
        onChange(newValue)
        newCursorStart = lineStart + prefix.length
        newCursorEnd = newCursorStart + (selected || placeholder).length
      } else {
        const insert = prefix + (selected || placeholder) + suffix
        const before = value.slice(0, start)
        const after = value.slice(end)
        const newValue = before + insert + after
        onChange(newValue)
        newCursorStart = start + prefix.length
        newCursorEnd = newCursorStart + (selected || placeholder).length
      }

      // Restore focus + selection after state update
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(newCursorStart, newCursorEnd)
      })
    },
    [value, onChange, textareaRef],
  )

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[color:var(--border)] bg-[color:var(--surface)]">
      {ACTIONS.map((action, i) => (
        <button
          key={i}
          type="button"
          title={action.label}
          aria-label={action.label}
          onClick={() => applyAction(action)}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded text-[color:var(--text-muted)]',
            'hover:bg-[color:var(--surface-raised)] hover:text-[color:var(--text-primary)] transition-colors',
            // visual separator groups
            i === 4 && 'ml-2',
            i === 7 && 'ml-2',
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}
