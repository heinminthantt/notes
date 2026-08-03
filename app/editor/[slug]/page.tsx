import type { Metadata } from 'next'
import { getDocBySlug } from '@/lib/docs'
import { notFound } from 'next/navigation'
import { EditorClient } from '@/components/editor/EditorClient'
import { PasswordGate } from '@/components/editor/PasswordGate'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = await getDocBySlug(slug)
  if (!doc) return {}
  return {
    title: `Edit: ${doc.title} — Design System Journey`,
    description: `Editing chapter: ${doc.title}`,
  }
}

export default async function EditDocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)
  if (!doc) notFound()

  return (
    <PasswordGate>
      <EditorClient
        editSlug={doc.slug}
        initialTitle={doc.title}
        initialSubtitle={doc.subtitle}
        initialContent={doc.rawContent}
      />
    </PasswordGate>
  )
}
