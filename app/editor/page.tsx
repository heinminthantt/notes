import type { Metadata } from 'next'
import { EditorClient } from '@/components/editor/EditorClient'
import { PasswordGate } from '@/components/editor/PasswordGate'

export const metadata: Metadata = {
  title: 'Editor — Design System Journey',
  description: 'Write and publish a new chapter.',
}

export default function EditorPage() {
  return (
    <PasswordGate>
      <EditorClient />
    </PasswordGate>
  )
}
