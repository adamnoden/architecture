export const publicSourceExcludeGlobs = [
  'STATUS.md',
  'docs/development/**',
  'docs/editorial/**',
  'docs/publication/**',
  'docs/manuscript/doctrine-register-crosswalk.md',
  'docs/manuscript/publication-architecture.md',
  'docs/manuscript/publication-credibility-release-programme.md',
  'docs/manuscript/pr00-*.md',
  'docs/patterns/core-12.md',
  'docs/patterns/reversible-assembly-candidates.md',
  'docs/patterns/retired/**',
  'docs/patterns/pilot/**',
  'docs/patterns/candidates/accessible-vertical-service-zone.md',
  'docs/reference-house/model-baseline-rhc0.md',
  'docs/reference-house/rhc0-*.md',
  'docs/reference-house/rhc1-*.md',
  'docs/reference-house/morphology-options.md',
  'docs/reference-house/ground-floor-development.md',
  'docs/reference-house/upper-floor-and-stair-development.md',
  'docs/reference-house/service-topology-rh06.md',
  'docs/reference-house/service-crossing-register-rh06.md',
  'docs/reference-house/service-topology-rh07-mvhr-addendum.md',
  'docs/reference-house/whole-house-coordination-audit.md',
  'docs/reference-house/prototype-handoff-rh09.md',
  'docs/reference-house/tectonic-integration-rh09.md',
  'docs/reference-house/plan-section-elevation-gate.md',
  'docs/reference-house/service-topology-coordination.md',
  'docs/reference-house/service-topology-run-01.md',
  'docs/research/pattern-language-phase6-targeted-evidence.md',
  'docs/computational/reference-house-model-freeze-rhc0.md',
  'docs/computational/reference-house-executable-slice.md',
  'docs/computational/compiler-hardening-programme.md',
  'docs/computational/compiler-output-architecture-programme.md',
  'docs/computational/pattern-crosswalk-*.md',
  'docs/computational/paper-compilation-*.md',
  'docs/computational/s0-*.md',
  'docs/computational/s1-*.md',
  'docs/computational/s2-*.md',
  'docs/computational/h1-paper-*.md'
] as const

function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  const pattern = escaped
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*')
  return new RegExp(`^${pattern}$`)
}

const publicSourceExcludeMatchers = publicSourceExcludeGlobs.map(globToRegExp)

export function isPublicSource(source: string): boolean {
  return !publicSourceExcludeMatchers.some((matcher) => matcher.test(source))
}

function sourceForNavigationLink(link: string): string | null {
  if (!link.startsWith('/') || link.startsWith('//')) return null
  if (link === '/') return 'README.md'
  if (link === '/STATUS' || link === '/STATUS.md') return 'STATUS.md'
  if (link === '/docs' || link === '/docs/') return 'docs/README.md'
  if (!link.startsWith('/docs/')) return null

  const path = link.slice(1).split(/[?#]/, 1)[0]
  if (path.endsWith('/')) return `${path}README.md`
  if (path.endsWith('.md')) return path
  return `${path}.md`
}

export function filterPublicNavigation<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => filterPublicNavigation(item))
      .filter((item) => item !== null) as T
  }
  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  if (typeof record.link === 'string') {
    const source = sourceForNavigationLink(record.link)
    if (source && !isPublicSource(source)) return null as T
  }

  const mapped = Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, key === 'items' ? filterPublicNavigation(entry) : entry])
  ) as Record<string, unknown>

  if (Array.isArray(mapped.items) && mapped.items.length === 0 && typeof mapped.link !== 'string') {
    return null as T
  }

  return mapped as T
}
