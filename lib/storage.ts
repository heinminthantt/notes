/**
 * Storage abstraction layer.
 *
 * - Local dev  → uses the filesystem (`design-system-journey/` directory)
 * - Vercel     → uses Vercel Blob Storage (read-only filesystem)
 *
 * The environment is detected via the BLOB_READ_WRITE_TOKEN env var.
 * If present, we use Blob; otherwise we fall back to fs.
 */
import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), 'design-system-journey')
const MANIFEST_PATH = path.join(DOCS_DIR, 'manifest.json')

// Blob storage prefix for all docs
const BLOB_PREFIX = 'design-system-journey'

export interface StoredDocMeta {
  slug: string
  index: number
  title: string
  subtitle: string
  filename: string
  createdAt: string
}

function isVercel(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

// ─── Manifest operations ────────────────────────────────────────────

export async function readManifest(): Promise<StoredDocMeta[]> {
  if (isVercel()) {
    return readManifestFromBlob()
  }
  return readManifestFromFs()
}

export async function writeManifest(manifest: StoredDocMeta[]): Promise<void> {
  if (isVercel()) {
    return writeManifestToBlob(manifest)
  }
  return writeManifestToFs(manifest)
}

// ─── Content operations ─────────────────────────────────────────────

export async function readContent(filename: string): Promise<string | null> {
  if (isVercel()) {
    return readContentFromBlob(filename)
  }
  return readContentFromFs(filename)
}

export async function writeContent(filename: string, content: string): Promise<void> {
  if (isVercel()) {
    return writeContentToBlob(filename, content)
  }
  return writeContentToFs(filename, content)
}

export async function deleteContent(filename: string): Promise<void> {
  if (isVercel()) {
    return deleteContentFromBlob(filename)
  }
  return deleteContentFromFs(filename)
}

// ─── Filesystem implementations ─────────────────────────────────────

function readManifestFromFs(): StoredDocMeta[] {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function writeManifestToFs(manifest: StoredDocMeta[]): void {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
}

function readContentFromFs(filename: string): string | null {
  try {
    return fs.readFileSync(path.join(DOCS_DIR, filename), 'utf-8')
  } catch {
    return null
  }
}

function writeContentToFs(filename: string, content: string): void {
  fs.writeFileSync(path.join(DOCS_DIR, filename), content, 'utf-8')
}

function deleteContentFromFs(filename: string): void {
  try {
    fs.unlinkSync(path.join(DOCS_DIR, filename))
  } catch {
    // File may already be missing
  }
}

// ─── Vercel Blob implementations ────────────────────────────────────

async function getBlobModule() {
  // Dynamic import to avoid bundling issues when not on Vercel
  const blob = await import('@vercel/blob')
  return blob
}

const MANIFEST_BLOB_PATH = `${BLOB_PREFIX}/manifest.json`

async function readManifestFromBlob(): Promise<StoredDocMeta[]> {
  try {
    const { list } = await getBlobModule()
    const { blobs } = await list({ prefix: MANIFEST_BLOB_PATH })

    if (blobs.length === 0) {
      // First run on Vercel — seed from bundled filesystem manifest
      const fsManifest = readManifestFromFs()
      if (fsManifest.length > 0) {
        await writeManifestToBlob(fsManifest)
        // Also seed all content files
        for (const doc of fsManifest) {
          const content = readContentFromFs(doc.filename)
          if (content) {
            await writeContentToBlob(doc.filename, content)
          }
        }
        return fsManifest
      }
      return []
    }

    const res = await fetch(blobs[0].url)
    return await res.json()
  } catch (err) {
    console.error('[storage] readManifestFromBlob error:', err)
    // Fallback to filesystem manifest (bundled at build time)
    return readManifestFromFs()
  }
}

async function writeManifestToBlob(manifest: StoredDocMeta[]): Promise<void> {
  const { put } = await getBlobModule()
  await put(MANIFEST_BLOB_PATH, JSON.stringify(manifest, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  })
}

async function readContentFromBlob(filename: string): Promise<string | null> {
  try {
    const { list } = await getBlobModule()
    const blobPath = `${BLOB_PREFIX}/${filename}`
    const { blobs } = await list({ prefix: blobPath })

    if (blobs.length === 0) {
      // Try filesystem fallback (bundled content)
      return readContentFromFs(filename)
    }

    const res = await fetch(blobs[0].url)
    return await res.text()
  } catch {
    return readContentFromFs(filename)
  }
}

async function writeContentToBlob(filename: string, content: string): Promise<void> {
  const { put } = await getBlobModule()
  await put(`${BLOB_PREFIX}/${filename}`, content, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'text/markdown',
  })
}

async function deleteContentFromBlob(filename: string): Promise<void> {
  try {
    const { list, del } = await getBlobModule()
    const blobPath = `${BLOB_PREFIX}/${filename}`
    const { blobs } = await list({ prefix: blobPath })
    if (blobs.length > 0) {
      await del(blobs.map((b) => b.url))
    }
  } catch {
    // Best-effort deletion
  }
}
