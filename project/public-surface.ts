export const publicSourceExcludeGlobs = [
  'STATUS.md',
  'docs/README.md',
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
  'docs/grammar/architectural-grammar-modelling-corrections-v01.md',
  'docs/grammar/g01-research-brief.md',
  'docs/grammar/g01-completion-programme.md',
  'docs/grammar/g01-d5-d6-web-pass-v02.md',
  'docs/grammar/g01-d5-d6-web-pass-v03.md',
  'docs/grammar/g01-d6-mutation-run-01-danson-sequence.md',
  'docs/grammar/g01-d8-falsification-result.md',
  'docs/grammar/g01-d9-held-out-validation.md',
  'docs/grammar/g01-d10-normative-reduction.md',
  'docs/grammar/g01-d10s-positive-specificity-programme.md',
  'docs/grammar/g01-d10s-positive-specificity-register-v01.md',
  'docs/grammar/g01-d10s-validation-result.md',
  'docs/grammar/g01-d13-adversarial-closeout.md',
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
  'docs/reference-house/external-review-*-rh11.md',
  'docs/research/pattern-language-phase6-targeted-evidence.md',
  'docs/prototypes/p03-structural-floor-edge-handoff.md',
  'docs/computational/reference-house-model-freeze-rhc0.md',
  'docs/computational/reference-house-executable-slice.md',
  'docs/computational/compiler-generality-assurance-cf01.md',
  'docs/computational/compiler-hardening-programme.md',
  'docs/computational/compiler-output-architecture-programme.md',
  'docs/computational/pattern-crosswalk-*.md',
  'docs/computational/paper-compilation-*.md',
  'docs/computational/s0-*.md',
  'docs/computational/s1-*.md',
  'docs/computational/s2-*.md',
  'docs/computational/h1-paper-*.md',
  'docs/computational/h1-capability-matrix-v*.md',
  'docs/computational/research-programme*.md',
  'docs/computational/p0-implementation-plan.md',
  'docs/computational/p0-pat-xw-01-result.md',
  'docs/computational/doctrine-delta-external-maintenance-v01.md',
  'docs/computational/external-review-pack-*.md'
] as const

const publicLabelOverrides: Readonly<Record<string, string>> = {
  'G-01 v0.1 — frozen grammar': 'G-01 v0.1 — specification',
  'G-01 v0.1 conformance — D12': 'G-01 v0.1 conformance',
  'RH-C0 / RH-C1 fixture programme': 'Project definition',
  'Reference House development history': 'Technical coordination',
  'RH-11 external review': 'Independent review',
  'Programme history': 'Engineering & test artefacts',
  'Reference House compiler programme': 'Compiler validation',
  'H1 environmental & services decisions': 'Environmental & services decisions',
  'External evidence trial — Mapeguard WP — completed': 'Scoped manufacturer evidence — Mapeguard WP',
  'External review brief': 'Independent review questions'
}

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
    Object.entries(record).map(([key, entry]) => {
      if (key === 'items') return [key, filterPublicNavigation(entry)]
      if (key === 'text' && typeof entry === 'string') return [key, publicLabelOverrides[entry] ?? entry]
      return [key, entry]
    })
  ) as Record<string, unknown>

  if (Array.isArray(mapped.items) && mapped.items.length === 0 && typeof mapped.link !== 'string') {
    return null as T
  }

  return mapped as T
}
