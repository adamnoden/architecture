import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectPdf } from '../pdf-inspector.js'
import { publicationFigurePlacements } from '../figures.js'
import { primerPublicationEntries, publicationEntries } from '../publication.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../..')
const metadataPath = resolve(repoRoot, 'publication/metadata.json')

const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
if (writeMode === checkMode) {
  throw new Error('Choose exactly one metadata mode: --write or --check.')
}

interface PdfPageSize {
  readonly format: string | null
  readonly widthMm: number
  readonly heightMm: number
  readonly orientation: 'portrait' | 'landscape' | 'square'
}

interface PdfMetadata {
  readonly file: string
  readonly pages: number
  readonly duplexLeaves: number
  readonly pageSize: PdfPageSize
  readonly entries: number
  readonly figures?: number
}

interface PublicationMetadata {
  readonly schemaVersion: 1
  readonly workingEdition: PdfMetadata
  readonly primer: PdfMetadata
}

function normalizeFormat(widthMm: number, heightMm: number): string | null {
  const short = Math.min(widthMm, heightMm)
  const long = Math.max(widthMm, heightMm)
  if (Math.abs(short - 210) <= 0.5 && Math.abs(long - 297) <= 0.5) return 'A4'
  return null
}

async function publicationPdfMetadata(
  repoRelativePath: string,
  entries: number,
  figures?: number
): Promise<PdfMetadata> {
  const absolutePath = resolve(repoRoot, repoRelativePath)
  if (!existsSync(absolutePath) || statSync(absolutePath).size === 0) {
    throw new Error(`Publication PDF is missing or empty: ${repoRelativePath}`)
  }

  const inspection = await inspectPdf(absolutePath, { links: true })
  const obsoleteLinks = inspection.links!.filter((url) =>
    /^https?:\/\/adamnoden\.github\.io\/architecture\/docs(?:\/|$)/i.test(url)
  )
  if (obsoleteLinks.length) {
    throw new Error(`${repoRelativePath} contains obsolete website routes in PDF URI annotations:\n${[...new Set(obsoleteLinks)].join('\n')}`)
  }
  const { widthMm, heightMm } = inspection.pageSize
  const orientation = widthMm === heightMm ? 'square' : widthMm < heightMm ? 'portrait' : 'landscape'

  return {
    file: repoRelativePath,
    pages: inspection.pages,
    duplexLeaves: Math.ceil(inspection.pages / 2),
    pageSize: {
      format: normalizeFormat(widthMm, heightMm),
      widthMm,
      heightMm,
      orientation
    },
    entries,
    ...(figures === undefined ? {} : { figures })
  }
}

async function generateMetadata(): Promise<PublicationMetadata> {
  const [workingEdition, primer] = await Promise.all([
    publicationPdfMetadata(
      'publication/dist/ovids-house.pdf',
      publicationEntries.length,
      publicationFigurePlacements().length
    ),
    publicationPdfMetadata(
      'publication/dist/ovids-house-primer.pdf',
      primerPublicationEntries.length
    )
  ])

  return {
    schemaVersion: 1,
    workingEdition,
    primer
  }
}

function serialized(metadata: PublicationMetadata): string {
  return `${JSON.stringify(metadata, null, 2)}\n`
}

function summary(metadata: PublicationMetadata): string {
  const lines = [
    '## Publication PDF metadata',
    '',
    '| Edition | Pages | Duplex leaves | Page size | Entries | Figures |',
    '| --- | ---: | ---: | --- | ---: | ---: |',
    `| Working Edition | ${metadata.workingEdition.pages} | ${metadata.workingEdition.duplexLeaves} | ${metadata.workingEdition.pageSize.format ?? `${metadata.workingEdition.pageSize.widthMm} × ${metadata.workingEdition.pageSize.heightMm} mm`} | ${metadata.workingEdition.entries} | ${metadata.workingEdition.figures ?? '—'} |`,
    `| Primer | ${metadata.primer.pages} | ${metadata.primer.duplexLeaves} | ${metadata.primer.pageSize.format ?? `${metadata.primer.pageSize.widthMm} × ${metadata.primer.pageSize.heightMm} mm`} | ${metadata.primer.entries} | ${metadata.primer.figures ?? '—'} |`,
    ''
  ]
  return lines.join('\n')
}

function writeCiSummary(metadata: PublicationMetadata): void {
  const path = process.env.GITHUB_STEP_SUMMARY
  if (!path) return
  writeFileSync(path, summary(metadata), { flag: 'a' })
}

const generated = await generateMetadata()
writeCiSummary(generated)

if (writeMode) {
  writeFileSync(metadataPath, serialized(generated))
  console.log(`Wrote publication metadata to publication/metadata.json.`)
  console.log(summary(generated))
} else {
  if (!existsSync(metadataPath)) {
    throw new Error('publication/metadata.json is missing. Run `npm run publication:metadata:update`.')
  }
  const committed = readFileSync(metadataPath, 'utf8')
  const actual = serialized(generated)
  if (committed !== actual) {
    console.error('Committed publication metadata is stale.')
    console.error('\nExpected committed metadata:\n')
    console.error(actual)
    throw new Error('Run `npm run publication:metadata:update` and commit publication/metadata.json.')
  }
  console.log(`Publication metadata is current.`)
  console.log(summary(generated))
}
