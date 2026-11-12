import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { nav, sidebar } from '../.vitepress/navigation.js'
import { filterPublicNavigation, isPublicSource, siteRootSources } from '../project/public-surface.js'
import {
  mapNavigationLinks,
  mapSidebarRoutes,
  publicRoute,
  routeForSource,
  rewriteMarkdownPageLink,
  rewriteSourceId
} from '../project/site-routes.js'

const repoRoot = process.cwd()

function collectMarkdown(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

function sourcePath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/')
}

function excludedFromNavigation(path: string): boolean {
  return readFileSync(path, 'utf8').includes('<!-- nav-exclude: redirect -->')
}

function flattenLinks(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => flattenLinks(item))
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  return [
    ...(typeof record.link === 'string' ? [record.link] : []),
    ...Object.entries(record)
      .filter(([key]) => key !== 'link')
      .flatMap(([, entry]) => flattenLinks(entry))
  ]
}

function isInternalPageRoute(route: string): boolean {
  return route.startsWith('/') && !route.startsWith('/architecture/')
}

function validatePublicRoutes(): void {
  const failures: string[] = []
  const files = [...siteRootSources.map((source) => join(repoRoot, source)), ...collectMarkdown(join(repoRoot, 'docs'))]
  const publicFiles = files.filter((file) => isPublicSource(sourcePath(file)))
  const routeOwners = new Map<string, string>()

  for (const file of publicFiles) {
    const source = sourcePath(file)
    const rewritten = rewriteSourceId(source)
    const route = routeForSource(source)
    const owner = routeOwners.get(route)

    if (owner) failures.push(`public route collision: ${owner} and ${source} -> ${route}`)
    else routeOwners.set(route, source)

    if (rewritten.startsWith('docs/') || route === '/STATUS' || route.startsWith('/docs/')) {
      failures.push(`repository implementation path leaked into public URL: ${source} -> ${route}`)
    }
  }

  const expectedRoutes: Record<string, string> = {
    'index.md': '/',
    'README.md': '/project/repository',
    'docs/reading-guide.md': '/reading-guide',
    'docs/prototypes/README.md': '/prototypes/',
    'docs/prototypes/w2-wall-bay-build-pack.md': '/prototypes/w2-wall-bay-build-pack'
  }

  for (const [source, expected] of Object.entries(expectedRoutes)) {
    const actual = routeForSource(source)
    if (actual !== expected) failures.push(`public route contract changed: ${source} -> ${actual}; expected ${expected}`)
  }

  if (routeOwners.get('/') !== 'index.md') failures.push('the dedicated index.md must be the sole public homepage')
  if (routeOwners.get('/project/repository') !== 'README.md') failures.push('README.md must remain available as the repository guide')

  const linkCases: readonly [string, string, string][] = [
    ['README.md#project-map', 'index.md', '/project/repository#project-map'],
    ['../README.md#build-and-verification', 'docs/reading-guide.md', '/project/repository#build-and-verification'],
    ['../index.md', 'docs/reading-guide.md', '/'],
    ['../', 'docs/reading-guide.md', '/'],
    ['/index.md?from=guide#top', 'README.md', '/?from=guide#top'],
    ['/README.md#project-map', 'index.md', '/project/repository#project-map'],
    ['docs/reference-house/', 'index.md', '/reference-house/'],
    ['docs/manuscript/preface.md', 'index.md', '/manuscript/preface'],
    ['#project-map', 'README.md', '#project-map'],
    ['https://example.org/README.md#section', 'index.md', 'https://example.org/README.md#section']
  ]
  for (const [href, source, expected] of linkCases) {
    const actual = rewriteMarkdownPageLink(href, source, repoRoot)
    if (actual !== expected) failures.push(`entry-page link drift: ${source}: ${href} -> ${actual}; expected ${expected}`)
  }
  if (publicRoute('/README#project-map') !== '/project/repository#project-map') {
    failures.push('repository navigation must preserve its destination and fragment')
  }

  const publicNav = mapNavigationLinks(filterPublicNavigation(nav))
  const publicSidebar = mapSidebarRoutes(filterPublicNavigation(sidebar))
  const navigationLinks = new Set(flattenLinks(publicSidebar).filter(isInternalPageRoute))
  const mappedLinks = [...flattenLinks(publicNav), ...flattenLinks(publicSidebar)].filter(isInternalPageRoute)

  for (const link of mappedLinks) {
    if (link === '/STATUS' || link.startsWith('/docs/')) {
      failures.push(`legacy repository path remains in public navigation: ${link}`)
    }
    const pathname = link.split(/[?#]/, 1)[0]
    if (!routeOwners.has(pathname)) failures.push(`public navigation has no published destination: ${link}`)
  }

  const publishedRoutes = publicFiles
    .filter((file) => !excludedFromNavigation(file))
    .map((file) => routeForSource(sourcePath(file)))

  for (const route of publishedRoutes) {
    if (!navigationLinks.has(route)) failures.push(`public page missing from mapped sidebar navigation: ${route}`)
  }

  if (failures.length) {
    throw new Error(`Public route integrity failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
  }
}

validatePublicRoutes()
console.log('Public route integrity valid: separate homepage and repository guide, clean URL tree and mapped navigation coverage.')
