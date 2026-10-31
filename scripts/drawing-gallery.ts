import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import { nomenclatureFamilies, nomenclaturePattern } from '../project/nomenclature.js'
import { isPublicSource } from '../project/public-surface.js'
import { routeForSource } from '../project/site-routes.js'
import { publicationFigurePlacements } from '../publication/figures.js'
import { publicationPlatePlacements } from '../publication/plates-current.js'
import { publicationEntries } from '../publication/publication.js'
import { layoutFamilySource, layoutFamilyViews, createLayoutFamilyScene } from '../compiler/reference-house/georgian/layout-family.js'
import { layoutAnalysisSource, layoutAnalysisViews, createLayoutAnalysisScene } from '../compiler/reference-house/georgian/layout-analysis.js'
import { synthesisSource, createCurrentSynthesisScene } from '../compiler/reference-house/georgian/sectional-synthesis.js'
import { exteriorSource, exteriorViews, createExteriorIsometricScene } from '../compiler/reference-house/georgian/exterior-isometrics.js'
import { REFERENCE_HOUSE_OUTPUTS } from '../compiler/reference-house/output/contract.js'
import { renderDrawingSceneV2SvgWithTokens } from '../compiler/publication-drawing-v2/svg.js'
import { PLT_CANDIDATE_TOKENS } from '../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import type { DrawingSceneV2 } from '../compiler/publication-drawing-v2/model.js'

export interface GalleryEntry {
  id: string
  title: string
  description: string
  category: 'architecture' | 'diagrams' | 'details' | 'studies'
  basis: 'current' | 'historical' | 'study'
  collection: string
  sourcePath: string
  sourceId?: string
  href: string
  preview?: string
  mermaid?: string
  context: { label: string; href: string }
}

export interface DrawingGallery {
  catalogue: { entries: GalleryEntry[] }
  assets: { filename: string; content: string }[]
}

const sourceUrl = (path: string) => `https://github.com/adamnoden/architecture/blob/main/${path}`
const hash = (content: string) => createHash('sha256').update(content).digest('hex')
const ignoredDirectories = new Set(['node_modules', 'fixtures', '__fixtures__', '__tests__', 'specimens'])

function walk(root: string, directory: string): string[] {
  if (!existsSync(resolve(root, directory))) return []
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || ignoredDirectories.has(entry.name)) return []
    const path = posix.join(directory, entry.name)
    return entry.isDirectory() ? walk(root, path) : entry.isFile() ? [path] : []
  }).sort()
}

function plainText(value: string): string {
  return value.replace(/<[^>]+>/g, ' ')
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity]!)
    .replace(/\s+/g, ' ').trim()
}

const forbiddenFamilies = nomenclatureFamilies.filter((family) => !(family.allowedSurfaces as readonly string[]).includes('SITE_PRIMARY'))
const hasInternalIdentity = (text: string) => forbiddenFamilies.some((family) => nomenclaturePattern(family).test(text))

function readerTitle(value: string, sourcePath: string): string {
  let result = plainText(value)
  for (const family of forbiddenFamilies) result = result.replace(nomenclaturePattern(family), '')
  // Study programme prefixes identify the owning directory, not the drawing's subject.
  const programme = sourcePath.match(/^project\/([a-z]+)\//)?.[1]
  if (programme) result = result.replace(new RegExp(`^${programme.toUpperCase()}\\b[\\s:—–-]*`), '')
  return result.replace(/^[-—–:/\s]+|[-—–:/\s]+$/g, '').replace(/\s+/g, ' ').trim()
}

function humanise(value: string): string {
  const words = value.replace(/\.svg$/i, '').replace(/^(?:publication-|rhc\d+-|g\d+-d\d+-|p\d+-|w\d+-)/i, '')
    .replace(/-rh\d+$/i, '').replace(/[-_]+/g, ' ')
  return words ? words[0].toUpperCase() + words.slice(1) : 'Drawing'
}

function svgText(svg: string, tag: 'title' | 'desc'): string {
  return plainText(svg.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? '')
}

function contextFor(root: string, source: string): GalleryEntry['context'] {
  if (!existsSync(resolve(root, source))) throw new Error(`Drawing context does not exist: ${source}`)
  return { label: 'Source context', href: source.endsWith('.md') && isPublicSource(source) ? routeForSource(source) : sourceUrl(source) }
}

function referencedSvg(href: string, source: string): string | undefined {
  const path = href.split(/[?#]/, 1)[0]
  if (!path.toLowerCase().endsWith('.svg') || /^(?:[a-z]+:|\/\/)/i.test(path)) return undefined
  return path.startsWith('/') ? path.slice(1) : posix.normalize(posix.join(posix.dirname(source), path))
}

function publicationMetadata() {
  const result = new Map<string, { title: string; description: string; source: string; historical: boolean }>()
  const sources = new Map(publicationEntries.map((entry) => [entry.id, entry.source]))
  for (const placement of publicationFigurePlacements()) {
    const source = sources.get(placement.entryId)!
    result.set(posix.normalize(posix.join(posix.dirname(source), placement.image)), {
      title: placement.alt, description: placement.caption, source, historical: false
    })
  }
  for (const placement of publicationPlatePlacements()) {
    const source = sources.get(placement.entryId)!
    for (const view of placement.views) result.set(posix.normalize(posix.join(posix.dirname(source), view.image)), {
      title: view.title, description: view.caption, source, historical: /historical predecessor/i.test(view.caption)
    })
  }
  return result
}

function classification(path: string, historical: boolean): Pick<GalleryEntry, 'category' | 'basis' | 'collection'> {
  if (path.startsWith('docs/manuscript/')) return {
    category: 'diagrams', basis: historical ? 'historical' : 'study', collection: 'Architectural argument'
  }
  if (path.startsWith('docs/reference-house/')) return {
    category: /topology|sequence|package|morphology|coordination-fixture/.test(path) ? 'diagrams' : 'architecture',
    basis: historical ? 'historical' : 'study', collection: historical ? 'Earlier house drawings' : 'House studies'
  }
  if (path.startsWith('docs/grammar/')) return { category: 'studies', basis: 'study', collection: 'Precedent studies' }
  if (path.startsWith('docs/prototypes/')) return { category: 'details', basis: 'study', collection: 'Prototype details' }
  if (/\/(?:figures|diagrams)\//.test(path)) return { category: 'diagrams', basis: 'study', collection: 'Project diagrams' }
  if (/interface|section|renewal|wall-bay|joint|carrier|terminal|tray|waste/.test(posix.basename(path))) {
    return { category: 'details', basis: 'study', collection: 'Assembly and maintenance studies' }
  }
  return { category: 'studies', basis: 'study', collection: 'Design studies' }
}

function historicalArtwork(root: string): Set<string> {
  // These bounded predecessor records already enumerate their artwork. New
  // figures elsewhere must not inherit historical status from their directory.
  const paths = new Set<string>(Object.values(REFERENCE_HOUSE_OUTPUTS).filter((item) => item.format === 'svg').map((item) => item.path))
  paths.add('docs/reference-house/whole-house-coordination-fixture.svg')
  for (const record of ['publication/pr00d-reference-house-figures.md', 'publication/pr00d-reference-house-systems-figures.md']) {
    if (!existsSync(resolve(root, record))) continue
    for (const match of readFileSync(resolve(root, record), 'utf8').matchAll(/\*\*File:\*\*\s*`([^`]+\.svg)`/g)) paths.add(match[1])
  }
  return paths
}

/** A build projection: no persisted inventory and no second source of drawing geometry. */
export function buildDrawingGallery(root = process.cwd(), options: { includeCurrent?: boolean } = {}): DrawingGallery {
  const entries: GalleryEntry[] = []
  const assets = new Map<string, string>()
  const addSvg = (entry: Omit<GalleryEntry, 'href' | 'preview'>, content: string) => {
    if (!/<svg\b/i.test(content)) throw new Error(`Invalid gallery SVG: ${entry.sourcePath}`)
    const filename = `${hash(content)}.svg`
    assets.set(filename, content)
    const href = `/drawing-gallery/${filename}`
    entries.push({ ...entry, href, preview: href })
  }
  const files = [...walk(root, 'docs'), ...walk(root, 'project'), ...walk(root, 'public/drawings'), ...walk(root, 'public/figures')]
  const markdownPaths = [...(existsSync(resolve(root, 'README.md')) ? ['README.md'] : []), ...files.filter((path) => path.endsWith('.md'))]
  const markdown = markdownPaths.map((path) => ({ path, content: readFileSync(resolve(root, path), 'utf8') }))
  const contexts = new Map<string, string>()
  // Prefer an existing reader-facing page; internal sources remain available through GitHub.
  for (const page of [...markdown].sort((a, b) => Number(isPublicSource(b.path)) - Number(isPublicSource(a.path)) || a.path.localeCompare(b.path))) {
    for (const match of page.content.matchAll(/\]\(<?([^\s)>]+)>?(?:\s+[^)]*)?\)|(?:src|href)=["']([^"']+)["']/g)) {
      const target = referencedSvg(match[1] ?? match[2], page.path)
      if (target && !contexts.has(target)) contexts.set(target, page.path)
    }
  }
  const publications = publicationMetadata()
  const historicalPaths = historicalArtwork(root)
  const currentExteriorPaths = new Set(exteriorViews.map((view) => `public/drawings/exterior-isometrics/${view}.svg`))
  for (const path of files.filter((path) => path.endsWith('.svg'))) {
    if (options.includeCurrent !== false && currentExteriorPaths.has(path)) continue
    const content = readFileSync(resolve(root, path), 'utf8')
    const metadata = publications.get(path)
    const rawTitle = metadata?.title || svgText(content, 'title') || humanise(posix.basename(path))
    const historical = metadata?.historical || historicalPaths.has(path)
      || (path.startsWith('docs/reference-house/') && (/\/(?:rhc[0-4]-)|-rh(?:0\d|1[01])\.svg$/.test(path) || /\bRH-(?:C[0-4]|0\d|1[01])\b/.test(svgText(content, 'title'))))
    const identity = classification(path, historical)
    const title = readerTitle(rawTitle, path) || humanise(posix.basename(path))
    const rawDescription = metadata?.description || svgText(content, 'desc')
    const description = hasInternalIdentity(rawDescription) ? '' : rawDescription
    const sibling = path.replace(/\.svg$/, '.md')
    const context = contexts.get(path) ?? (metadata && existsSync(resolve(root, metadata.source)) ? metadata.source : undefined)
      ?? (existsSync(resolve(root, sibling)) ? sibling : path)
    addSvg({ id: path, title, description, ...identity, sourcePath: path, context: contextFor(root, context) }, content)
  }

  if (options.includeCurrent !== false) {
    const currentContext = contextFor(root, 'docs/reference-house/current-house-basis.md')
    const current = (scene: DrawingSceneV2, sourcePath: string, title: string, collection: string, description = scene.description) => {
      addSvg({
        id: scene.viewId, title, description, category: 'architecture', basis: 'current', collection,
        sourcePath, sourceId: scene.sourceId, context: currentContext
      }, renderDrawingSceneV2SvgWithTokens(scene, PLT_CANDIDATE_TOKENS) + '\n')
    }
    const viewTitles: Record<string, string> = {
      GROUND: 'Ground-floor plan', FIRST: 'First-floor plan', LOCATOR: 'Section locations', PRINCIPAL: 'Principal section',
      'SERVICE-SECTION': 'Service section', FRONT: 'Front elevation', REAR: 'Garden elevation', SERVICE: 'Service-side elevation',
      'COURT-ENTRY': 'Courtyard entrance elevation', 'COURT-WINDOWS': 'Courtyard window elevation', ROOF: 'Roof plan', 'ROOF-WATER': 'Roof drainage plan',
      'GROUND-SERVICES': 'Ground-floor service overlay', 'FIRST-SERVICES': 'First-floor service overlay', STRUCTURE: 'Structural overlay',
      'ROOF-FAILURE': 'Roof water and failure overlay', 'EXTERNAL-ACCESS': 'External maintenance overlay', ADAPTATION: 'Future adaptation overlay'
    }
    for (const view of layoutFamilyViews) current(createLayoutFamilyScene(view, 100), 'compiler/reference-house/georgian/layout-family.ts', viewTitles[view] ?? humanise(view.toLowerCase()), 'Current house', '')
    for (const view of layoutAnalysisViews) current(createLayoutAnalysisScene(view, 100), 'compiler/reference-house/georgian/layout-analysis.ts', viewTitles[view] ?? humanise(view.toLowerCase()), 'Current house overlays')
    current(createCurrentSynthesisScene('BOOK', 'b5'), 'compiler/reference-house/georgian/sectional-synthesis.ts', 'Sectional isometric', 'Current house', synthesisSource.scope)
    for (const view of exteriorViews) current(createExteriorIsometricScene(view, 'svg'), 'compiler/reference-house/georgian/exterior-isometrics.ts', `${humanise(view)} exterior isometric`, 'Current house')
    // Keep identities tied to the exported source families, even if their view lists evolve.
    const families = new Set([layoutFamilySource.id, layoutAnalysisSource.id, synthesisSource.id, exteriorSource.id])
    if (entries.some((entry) => entry.basis === 'current' && !families.has(entry.sourceId!))) throw new Error('Unknown current drawing source family')
  }

  for (const page of markdown.filter((page) => isPublicSource(page.path))) {
    let heading = plainText(page.content.match(/^#\s+(.+)$/m)?.[1] ?? humanise(posix.basename(page.path, '.md')))
    let fence: { marker: string; language: string; lines: string[]; title: string } | undefined
    for (const line of page.content.split('\n')) {
      const marker = line.match(/^ {0,3}(`{3,}|~{3,})([^`]*)$/)
      if (fence) {
        if (marker && marker[1][0] === fence.marker[0] && marker[1].length >= fence.marker.length && !marker[2].trim()) {
          if (fence.language === 'mermaid') {
            const mermaid = fence.lines.join('\n').trim()
            if (!mermaid) throw new Error(`Empty Mermaid drawing in ${page.path}`)
            const context = contextFor(root, page.path)
            entries.push({
              id: `${page.path}#diagram-${hash(mermaid).slice(0, 16)}`, title: readerTitle(fence.title, page.path),
              description: 'Relationship or sequence diagram from the accompanying text.', category: 'diagrams', basis: 'study',
              collection: 'Flows and relationships', sourcePath: page.path, href: context.href, mermaid, context
            })
          }
          fence = undefined
        } else fence.lines.push(line)
      } else if (marker) fence = { marker: marker[1], language: marker[2].trim(), lines: [], title: heading }
      else if (/^#{1,6}\s+/.test(line)) heading = plainText(line.replace(/^#{1,6}\s+/, '').replace(/\s*\{#[^}]+\}\s*$/, ''))
    }
    if (fence?.language === 'mermaid') throw new Error(`Unclosed Mermaid drawing in ${page.path}`)
  }

  const basisOrder = { current: 0, study: 1, historical: 2 }
  entries.sort((a, b) => basisOrder[a.basis] - basisOrder[b.basis] || (a.basis === 'current' ? 0 : a.collection.localeCompare(b.collection) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id)))
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error('Duplicate gallery drawing identity')
  return { catalogue: { entries }, assets: [...assets].map(([filename, content]) => ({ filename, content })).sort((a, b) => a.filename.localeCompare(b.filename)) }
}
