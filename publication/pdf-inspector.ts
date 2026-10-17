import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { extractText, getDocumentProxy } from 'unpdf'

const POINTS_PER_INCH = 72
const MILLIMETRES_PER_INCH = 25.4
const CACHE_SCHEMA = 'unpdf-1.8.1-v1'
const CACHE_DIRECTORY = resolve(
  process.cwd(),
  'node_modules/.cache/ovids-house/pdf-inspector'
)

export interface PdfPageSize {
  readonly widthPt: number
  readonly heightPt: number
  readonly widthMm: number
  readonly heightMm: number
}

export interface PdfInspection {
  readonly pages: number
  readonly pageSize: PdfPageSize
  readonly text?: string
}

export interface PdfInspectionOptions {
  readonly text?: boolean
}

interface CachedPdfInspection extends PdfInspection {
  readonly schema: string
  readonly sha256: string
}

interface DestroyablePdfDocument {
  destroy?: () => Promise<void> | void
}

function round(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function pointsToMillimetres(points: number): number {
  return round(points * MILLIMETRES_PER_INCH / POINTS_PER_INCH, 2)
}

function digest(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function cachePath(sha256: string): string {
  return resolve(CACHE_DIRECTORY, `${CACHE_SCHEMA}-${sha256}.json`)
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function validCachedInspection(
  value: unknown,
  sha256: string,
  requireText: boolean
): value is CachedPdfInspection {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CachedPdfInspection>
  if (candidate.schema !== CACHE_SCHEMA || candidate.sha256 !== sha256) return false
  if (!Number.isInteger(candidate.pages) || (candidate.pages ?? 0) < 1) return false
  if (!candidate.pageSize || typeof candidate.pageSize !== 'object') return false
  if (!isPositiveFinite(candidate.pageSize.widthPt)) return false
  if (!isPositiveFinite(candidate.pageSize.heightPt)) return false
  if (!isPositiveFinite(candidate.pageSize.widthMm)) return false
  if (!isPositiveFinite(candidate.pageSize.heightMm)) return false
  if (requireText && typeof candidate.text !== 'string') return false
  if (candidate.text !== undefined && typeof candidate.text !== 'string') return false
  return true
}

async function readCachedInspection(
  sha256: string,
  requireText: boolean
): Promise<PdfInspection | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(cachePath(sha256), 'utf8'))
    if (!validCachedInspection(parsed, sha256, requireText)) return null
    return {
      pages: parsed.pages,
      pageSize: parsed.pageSize,
      ...(parsed.text === undefined ? {} : { text: parsed.text })
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    return null
  }
}

async function writeCachedInspection(
  sha256: string,
  inspection: PdfInspection
): Promise<void> {
  await mkdir(CACHE_DIRECTORY, { recursive: true })
  const payload: CachedPdfInspection = {
    schema: CACHE_SCHEMA,
    sha256,
    ...inspection
  }
  await writeFile(cachePath(sha256), `${JSON.stringify(payload)}\n`, 'utf8')
}

export async function inspectPdf(
  path: string,
  options: PdfInspectionOptions = {}
): Promise<PdfInspection> {
  const bytes = await readFile(path)
  if (bytes.byteLength === 0) throw new Error(`PDF is empty: ${path}`)

  const sha256 = digest(bytes)
  const cached = await readCachedInspection(sha256, options.text === true)
  if (cached) return cached

  const document = await getDocumentProxy(new Uint8Array(bytes))
  try {
    if (document.numPages < 1) throw new Error(`PDF contains no pages: ${path}`)

    const firstPage = await document.getPage(1)
    const viewport = firstPage.getViewport({ scale: 1 })
    firstPage.cleanup()

    let text: string | undefined
    if (options.text) {
      const extracted = await extractText(document, { mergePages: true })
      if (extracted.totalPages !== document.numPages) {
        throw new Error(
          `PDF text extraction page count mismatch for ${path}: ` +
          `${extracted.totalPages} extracted, ${document.numPages} in document.`
        )
      }
      text = Array.isArray(extracted.text) ? extracted.text.join('\n') : extracted.text
    }

    const inspection: PdfInspection = {
      pages: document.numPages,
      pageSize: {
        widthPt: viewport.width,
        heightPt: viewport.height,
        widthMm: pointsToMillimetres(viewport.width),
        heightMm: pointsToMillimetres(viewport.height)
      },
      ...(text === undefined ? {} : { text })
    }

    await writeCachedInspection(sha256, inspection)
    return inspection
  } finally {
    const destroy = (document as DestroyablePdfDocument).destroy
    if (destroy) await destroy.call(document)
  }
}

export async function extractPdfText(path: string): Promise<string> {
  const inspection = await inspectPdf(path, { text: true })
  if (inspection.text === undefined) throw new Error(`PDF text extraction produced no text result: ${path}`)
  return inspection.text
}
