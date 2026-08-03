import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocBySlug, getAdjacentDocs } from '@/lib/docs'
import { DocReader } from '@/components/docs/DocReader'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Dynamic — no static params so newly published chapters are served immediately
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) return {}
  return {
    title: `${doc.title} — Design System Journey`,
    description: doc.subtitle,
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) notFound()

  const { prev, next } = getAdjacentDocs(slug)

  return <DocReader doc={doc} prev={prev} next={next} />
}
