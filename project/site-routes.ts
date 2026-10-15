import { existsSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import { isPublicSource } from './public-surface.js'

const externalOrAnchor = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i
const repositoryBlobRoot = 'https://github.com/adamnoden/architecture/blob/main/'

function splitSuffix(value: string): [string, string] {
  const index = value.search(/[?#]/)
  return index < 0 ? [value, ''] : [value.slice(0, index), value.slice(index)]
}

function normaliseSource(source: string): string {
  return source.replace(/^\/+/, '').replace(/\\/g, '/')
}

export function rewriteSourceId(id: string): string {
  const source = normaliseSource(id)

  if (source === 'README.md') return 'index.md'
  if (source === 'STATUS.md') return 'project/status.md'
  if (source === 'docs/README.md') return 'project/documentation.md'
  if (source === 'docs/reading-guide.md') return 'reading-guide.md'

  const withoutDocs = source.startsWith('docs/') ? source.slice('docs/'.length) : source
  return withoutDocs.replace(/(^|\/)README\.md$/, '$1index.md')
}

export function routeForSource(source: string): string {
  const rewritten = rewriteSourceId(source)
  if (rewritten === 'index.md') return '/'
  if (rewritten.endsWith('/index.md')) {
    return `/${rewritten.slice(0, -'index.md'.length)}`
  }
  return `/${rewritten.replace(/\.md$/, '')}`
}

export function publicRoute(route: string): string {
  if (externalOrAnchor.test(route)) return route

  const [pathname, suffix] = splitSuffix(route)
  if (pathname === '/STATUS' || pathname === '/STATUS.md') return `/project/status${suffix}`
  if (pathname === '/docs' || pathname === '/docs/' || pathname === '/docs/README.md') {
    return `/project/documentation${suffix}`
  }
  if (pathname === '/docs/reading-guide' || pathname === '/docs/reading-guide.md') {
    return `/reading-guide${suffix}`
  }
  if (pathname.startsWith('/docs/')) return `${pathname.slice('/docs'.length)}${suffix}`
  return route
}

function candidateSourceTargets(pathname: string, sourceFile: string): string[] {
  if (pathname.startsWith('/')) {
    if (pathname === '/STATUS' || pathname === '/STATUS.md') return ['STATUS.md']
    if (pathname === '/docs' || pathname === '/docs/' || pathname === '/docs/README.md') {
      return ['docs/README.md']
    }
    if (!pathname.startsWith('/docs/')) return []

    const sourcePath = normaliseSource(pathname.slice(1))
    if (sourcePath.endsWith('/')) return [`${sourcePath}README.md`]
    if (sourcePath.endsWith('.md')) return [sourcePath]
    return [`${sourcePath}.md`, `${sourcePath}/README.md`]
  }

  const sourceDir = dirname(normaliseSource(sourceFile)).replace(/\\/g, '/')
  const target = posix.normalize(posix.join(sourceDir === '.' ? '' : sourceDir, pathname))
  if (target.endsWith('/')) return [`${target}README.md`]
  if (target.endsWith('.md')) return [target]
  return [`${target}.md`, `${target}/README.md`]
}

function repositorySourceUrl(source: string, suffix: string): string {
  return `${repositoryBlobRoot}${source}${suffix}`
}

/**
 * Markdown stays authored against repository paths so links work on GitHub.
 * VitePress rendering translates public sources to the public route tree.
 * Links to records intentionally excluded from the reader-facing site remain
 * available as source references in the repository rather than becoming dead
 * public routes.
 */
export function rewriteMarkdownPageLink(
  href: string,
  sourceFile: string,
  repoRoot = process.cwd()
): string {
  if (!href || href.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
    return href
  }

  const [pathname, suffix] = splitSuffix(href)
  const target = candidateSourceTargets(pathname, sourceFile).find((candidate) =>
    existsSync(resolve(repoRoot, candidate))
  )

  if (!target) return publicRoute(href)
  if (!isPublicSource(target)) return repositorySourceUrl(target, suffix)
  return `${routeForSource(target)}${suffix}`
}

export function mapNavigationLinks<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => mapNavigationLinks(item)) as T
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      key === 'link' && typeof entry === 'string' ? publicRoute(entry) : mapNavigationLinks(entry)
    ])
  ) as T
}

export function mapSidebarRoutes<T>(sidebar: Record<string, T>): Record<string, T> {
  const mapped: Record<string, T> = {}

  for (const [sourceRoute, items] of Object.entries(sidebar)) {
    const route = publicRoute(sourceRoute)
    if (mapped[route]) throw new Error(`Public sidebar route collision: ${sourceRoute} -> ${route}`)
    mapped[route] = mapNavigationLinks(items)
  }

  return mapped
}
