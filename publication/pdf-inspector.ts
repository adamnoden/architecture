import { readFile } from 'node:fs/promises'
import { extractText, getDocumentProxy } from 'unpdf'

const POINTS_PER_INCH = 72
const MILLIMETRES_PER_INCH = 25.4

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

function round(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function pointsToMillimetres(points: number): number {
  return round(points * MILLIMETRES_PER_INCH / POINTS_PER_INCH, 2)
}

export async function inspectPdf(
  path: string,
  options: PdfInspectionOptions = {}
): Promise<PdfInspection> {
  const bytes = await readFile(path)
  if (bytes.byteLength === 0) throw new Error(`PDF is empty: ${path}`)

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

    return {
      pages: document.numPages,
      pageSize: {
        widthPt: viewport.width,
        heightPt: viewport.height,
        widthMm: pointsToMillimetres(viewport.width),
        heightMm: pointsToMillimetres(viewport.height)
      },
      ...(text === undefined ? {} : { text })
    }
  } finally {
    await document.destroy()
  }
}

export async function extractPdfText(path: string): Promise<string> {
  const inspection = await inspectPdf(path, { text: true })
  if (inspection.text === undefined) throw new Error(`PDF text extraction produced no text result: ${path}`)
  return inspection.text
}
