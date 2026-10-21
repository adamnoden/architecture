import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'
import { publicationPlatePlacements } from '../plates.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const workingEditionPath = resolve(repoRoot, 'publication/dist/ovids-house.pdf')
const primerPath = resolve(repoRoot, 'publication/dist/ovids-house-primer.pdf')

interface DestroyablePdfDocument {
  destroy?: () => Promise<void> | void
}

function normalized(value: string): string {
  return value
    .replace(/[\u00ad\u2010]\s*/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function extractPageText(path: string): Promise<readonly string[]> {
  if (!existsSync(path)) throw new Error(`Publication PDF is missing: ${path}`)

  const bytes = await readFile(path)
  const document = await getDocumentProxy(new Uint8Array(bytes))
  try {
    const extracted = await extractText(document, { mergePages: false })
    if (!Array.isArray(extracted.text)) {
      throw new Error(`Expected page-separated PDF text for ${path}.`)
    }
    if (extracted.totalPages !== document.numPages || extracted.text.length !== document.numPages) {
      throw new Error(
        `PDF page-text count mismatch for ${path}: ` +
        `${extracted.text.length} text pages, ${document.numPages} document pages.`
      )
    }
    return extracted.text.map(normalized)
  } finally {
    const destroy = (document as DestroyablePdfDocument).destroy
    if (destroy) await destroy.call(document)
  }
}

function pagesContaining(pages: readonly string[], value: string): number[] {
  const needle = normalized(value)
  return pages.flatMap((page, index) => page.includes(needle) ? [index + 1] : [])
}

function expectPages(label: string, actual: readonly number[], expected: readonly number[]): void {
  if (actual.length !== expected.length || actual.some((page, index) => page !== expected[index])) {
    throw new Error(`${label}: expected pages ${expected.join('/')}, got ${actual.join('/') || 'none'}.`)
  }
}

const [workingPages, primerPages] = await Promise.all([
  extractPageText(workingEditionPath),
  extractPageText(primerPath)
])

const summaries: string[] = []

for (const placement of publicationPlatePlacements()) {
  const located = placement.views.map((view) => {
    const titlePages = pagesContaining(workingPages, view.title)
    const captionPages = pagesContaining(workingPages, view.caption)
    expectPages(`${view.title} caption`, captionPages, titlePages)

    if (pagesContaining(primerPages, view.title).length > 0 || pagesContaining(primerPages, view.caption).length > 0) {
      throw new Error(`${view.title}: controlled Part IV plate leaked into the Primer.`)
    }

    return { view, titlePages }
  })

  if (placement.pageClass === 'PLATE_SINGLE') {
    const [{ view, titlePages }] = located
    if (titlePages.length !== 1) {
      throw new Error(`${view.title}: PLATE_SINGLE must render exactly once, got ${titlePages.length}.`)
    }
    summaries.push(`${placement.pageClass} ${view.title}: ${titlePages[0]}`)
    continue
  }

  if (placement.pageClass === 'PLATE_PAIR') {
    const [left, right] = located
    if (left.titlePages.length !== 1 || right.titlePages.length !== 1) {
      throw new Error(`${left.view.title} / ${right.view.title}: PLATE_PAIR views must each render exactly once.`)
    }
    const leftPage = left.titlePages[0]
    const rightPage = right.titlePages[0]
    if (leftPage % 2 !== 0 || rightPage !== leftPage + 1) {
      throw new Error(
        `${left.view.title} / ${right.view.title}: PLATE_PAIR must occupy an even/odd facing pair, got ${leftPage}/${rightPage}.`
      )
    }
    summaries.push(`${placement.pageClass} ${left.view.title} / ${right.view.title}: ${leftPage}/${rightPage}`)
    continue
  }

  const [{ view, titlePages }] = located
  if (titlePages.length !== 2) {
    throw new Error(`${view.title}: PLATE_SPREAD must render furniture + drawing exactly twice, got ${titlePages.length}.`)
  }
  const [leftPage, rightPage] = titlePages
  if (leftPage % 2 !== 0 || rightPage !== leftPage + 1) {
    throw new Error(
      `${view.title}: PLATE_SPREAD must occupy an even/odd facing pair, got ${leftPage}/${rightPage}.`
    )
  }
  summaries.push(`${placement.pageClass} ${view.title}: ${leftPage}/${rightPage}`)
}

console.log(`Publication plate rhythm valid across ${workingPages.length} Working Edition pages; Primer remains plate-free.`)
for (const summary of summaries) console.log(`- ${summary}`)
