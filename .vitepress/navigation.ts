import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type { DefaultTheme } from 'vitepress'

const page = (text: string, link: string): DefaultTheme.SidebarItem => ({ text, link })
const group = (
  text: string,
  items: DefaultTheme.SidebarItem[],
  collapsed = true
): DefaultTheme.SidebarItem => ({ text, items, collapsed })

const manuscriptSidebar: DefaultTheme.SidebarItem[] = [
  group('Manuscript', [
    page('Architectural argument', '/docs/manuscript/'),
    page('Preface', '/docs/manuscript/00-preface'),
    page('Part I — The Problem', '/docs/manuscript/01-the-problem'),
    page('Part II — Principles', '/docs/manuscript/02-principles'),
    page('Part III — Architectural Consequences', '/docs/manuscript/03-architectural-consequences'),
    page('Part IV — Reference House', '/docs/manuscript/04-reference-house'),
    page('Part V — Delivery', '/docs/manuscript/05-delivery')
  ], false)
]

const patternsSidebar: DefaultTheme.SidebarItem[] = [
  group('Pattern language', [
    page('Pattern language', '/docs/patterns/'),
    page('P-001 — Permanent / replaceable split', '/docs/patterns/P-001'),
    page('P-002 — Accessible ≠ exposed', '/docs/patterns/P-002'),
    page('P-003 — Permanent fabric exclusion', '/docs/patterns/P-003'),
    page('P-004 — Service hierarchy', '/docs/patterns/P-004'),
    page('P-005 — Service routes', '/docs/patterns/P-005'),
    page('P-006 — Service crossings', '/docs/patterns/P-006'),
    page('P-007 — Isolation', '/docs/patterns/P-007'),
    page('P-008 — Wet-room clustering', '/docs/patterns/P-008'),
    page('P-009 — Wet-room edge', '/docs/patterns/P-009'),
    page('P-010 — Maintainable drainage', '/docs/patterns/P-010'),
    page('P-011 — Replaceable openings', '/docs/patterns/P-011'),
    page('P-012 — Slip interfaces', '/docs/patterns/P-012'),
    page('P-013 — Controlled movement', '/docs/patterns/P-013'),
    page('P-014 — Seated floor structure', '/docs/patterns/P-014'),
    page('P-015 — Dry assembly preference', '/docs/patterns/P-015'),
    page('P-016 — Moisture hierarchy', '/docs/patterns/P-016'),
    page('P-017 — Passive-first environment', '/docs/patterns/P-017'),
    page('P-018 — Roof drainage', '/docs/patterns/P-018'),
    page('P-019 — Roof access', '/docs/patterns/P-019'),
    page('P-020 — Legible structure', '/docs/patterns/P-020'),
    page('P-021 — Bounded change', '/docs/patterns/P-021')
  ], false)
]

const grammarSidebar: DefaultTheme.SidebarItem[] = [
  group('Architectural grammar', [
    page('Architectural grammar', '/docs/grammar/'),
    page('Grammar framework', '/docs/grammar/grammar-framework'),
    page('G-01 Reference House instance', '/docs/grammar/g01-reference-house')
  ], false)
]

const referenceHouseSidebar: DefaultTheme.SidebarItem[] = [
  group('Reference House', [
    page('Reference House', '/docs/reference-house/'),
    page('Reference House overview', '/docs/reference-house/reference-house'),
    page('RH-01 — Plan order', '/docs/reference-house/RH-01'),
    page('RH-02 — Ground floor', '/docs/reference-house/RH-02'),
    page('RH-03 — First floor', '/docs/reference-house/RH-03'),
    page('RH-04 — Stair and circulation', '/docs/reference-house/RH-04'),
    page('RH-05 — Structure', '/docs/reference-house/RH-05'),
    page('RH-06 — Services', '/docs/reference-house/RH-06'),
    page('RH-07 — Wet rooms', '/docs/reference-house/RH-07'),
    page('RH-08 — Roof and water', '/docs/reference-house/RH-08'),
    page('RH-09 — Openings and envelope', '/docs/reference-house/RH-09'),
    page('RH-10 — External interfaces', '/docs/reference-house/RH-10'),
    page('RH-11 — Engineering review brief', '/docs/reference-house/RH-11')
  ], false)
]

const researchSidebar: DefaultTheme.SidebarItem[] = [
  group('Research', [
    page('Research overview', '/docs/research/'),
    page('Evidence architecture', '/docs/research/evidence-architecture'),
    page('Intellectual lineage', '/docs/research/intellectual-lineage'),
    page('Human factors', '/docs/research/human-factors'),
    page('Occupied change', '/docs/research/occupied-change'),
    page('Deployment', '/docs/research/deployment')
  ], false)
]

const prototypesSidebar: DefaultTheme.SidebarItem[] = [
  group('Physical prototypes', [
    page('Prototype overview', '/docs/prototypes/'),
    page('Prototype programme', '/docs/prototypes/prototype-programme')
  ], false)
]

const deliverySidebar: DefaultTheme.SidebarItem[] = [
  group('Delivery', [
    page('Delivery overview', '/docs/delivery/'),
    page('Delivery principles', '/docs/delivery/delivery-principles')
  ], false)
]

const computationalSidebar: DefaultTheme.SidebarItem[] = [
  group('Computational track', [
    page('Computational overview', '/docs/computational/'),
    page('Compiler architecture', '/docs/computational/compiler-architecture'),
    page('Reference House compiler', '/docs/computational/reference-house-compiler'),
    page('Deployment compiler', '/docs/computational/deployment-compiler')
  ], false),
  group('Controlled research fixtures', [
    group('S0', [
      page('S0 research brief', '/docs/computational/s0-research-brief'),
      page('S0 source package', '/docs/computational/s0-source-package'),
      page('S0 paper compile run 01', '/docs/computational/s0-paper-compile-run-01'),
      page('S0 red-team run 01', '/docs/computational/s0-red-team-run-01')
    ]),
    group('S1', [
      page('S1 research brief', '/docs/computational/s1-research-brief'),
      page('S1 source package', '/docs/computational/s1-source-package'),
      page('S1 target snapshot v0.1', '/docs/computational/s1-target-snapshot-v01'),
      page('S1 paper compile run 01', '/docs/computational/s1-paper-compile-run-01')
    ]),
    group('S2', [
      page('S2 research brief', '/docs/computational/s2-research-brief'),
      page('S2 source package', '/docs/computational/s2-source-package'),
      page('S2 paper compile run 01', '/docs/computational/s2-paper-compile-run-01')
    ]),
    group('H1', [
      page('H1 paper research brief', '/docs/computational/h1-paper-research-brief'),
      page('H1 paper source package', '/docs/computational/h1-paper-source-package'),
      page('H1 paper compile run 01', '/docs/computational/h1-paper-compile-run-01'),
      page('H1 paper final red team', '/docs/computational/h1-paper-final-red-team'),
      page('H1 capability matrix v0.1', '/docs/computational/h1-capability-matrix-v01'),
      page('H1 capability matrix v0.2', '/docs/computational/h1-capability-matrix-v02'),
      page('H1 capability matrix v0.3', '/docs/computational/h1-capability-matrix-v03'),
      page('H1 capability matrix v0.4', '/docs/computational/h1-capability-matrix-v04'),
      page('External review pack — S0 / S1 / H1', '/docs/computational/external-review-pack-s0-s1-h1-v01')
    ])
  ]),
  group('Programme history', [
    page('Research programme v0.1', '/docs/computational/research-programme'),
    page('Research programme v0.2', '/docs/computational/research-programme-v02'),
    page('Research programme v0.3', '/docs/computational/research-programme-v03'),
    page('Research programme v0.4', '/docs/computational/research-programme-v04'),
    page('Research programme v0.5', '/docs/computational/research-programme-v05'),
    page('Research programme v0.6 — frozen', '/docs/computational/research-programme-v06'),
    page('P0 implementation plan — completed', '/docs/computational/p0-implementation-plan')
  ])
]

const developmentSidebar: DefaultTheme.SidebarItem[] = [
  group('Development', [
    page('Development overview', '/docs/development/'),
    page('Human factors programme', '/docs/development/human-factors-low-friction-inhabitation-programme'),
    page('Human factors execution plan', '/docs/development/human-factors-low-friction-inhabitation-execution-plan'),
    page('Ovid’s House migration', '/docs/development/ovids-house-migration'),
    page('Information architecture migration', '/docs/development/information-architecture-migration'),
    page('Architectural specificity boundary', '/docs/development/architectural-specificity-boundary'),
    page('Prototype programme', '/docs/development/tectonic-prototype-programme'),
    page('Manufacturing strategy', '/docs/development/manufacturing-strategy')
  ], false),
  group('Reference House execution records', [
    page('Reference House design programme', '/docs/development/reference-house-design-programme'),
    page('RH-C0 handoff', '/docs/development/handoff-reference-house-rhc0'),
    page('RH-C0 stage state', '/docs/development/rhc0-stage-state'),
    page('RH-C1 stage state', '/docs/development/rhc1-stage-state'),
    page('Validation execution register', '/docs/development/validation-execution-register')
  ]),
  group('Print publication', [
    page('Pipeline & recovery record', '/docs/development/print-publication-pipeline'),
    page('Publication scope crosswalk', '/docs/development/print-publication-scope-crosswalk'),
    page('Editorial proof ledger', '/docs/development/print-publication-editorial-proof')
  ]),
  group('Completed architectural-specificity audit', [
    page('Architectural specificity audit', '/docs/development/architectural-specificity-audit'),
    page('Architectural specificity claim ledger', '/docs/development/architectural-specificity-ledger'),
    page('Architectural specificity adversarial test', '/docs/development/architectural-specificity-adversarial-test')
  ]),
  group('Pattern-language migration history', [
    page('Pattern-language overhaul', '/docs/development/pattern-language-overhaul'),
    page('Pattern-language Phase 8 plan', '/docs/development/pattern-language-phase8-plan'),
    page('Pattern-language Phase 8 review', '/docs/development/pattern-language-phase8-review'),
    page('Phase 8 pilot red-team', '/docs/development/pattern-language-phase8-pilot-review'),
    page('Pattern-language Phase 7 plan', '/docs/development/pattern-language-phase7-plan'),
    page('Pattern-language Phase 7 review', '/docs/development/pattern-language-phase7-review'),
    page('Pattern-language Phase 6 review', '/docs/development/pattern-language-phase6-review'),
    page('Pattern-language corpus audit', '/docs/development/pattern-language-corpus-audit'),
    page('Pattern-language Phase 5 review', '/docs/development/pattern-language-phase5-review'),
    page('Service-topology Reference House trial', '/docs/development/service-topology-reference-house-trial')
  ]),
  group('Integration records', [
    page('Tectonic honesty', '/docs/development/tectonic-honesty'),
    page('Tectonic integration register', '/docs/development/tectonic-integration-register'),
    page('Tectonic migration plan', '/docs/development/tectonic-migration-plan'),
    page('Repose integration register', '/docs/development/repose-integration-register'),
    page('Preface architecture', '/docs/development/preface-architecture')
  ])
]

const editorialSidebar: DefaultTheme.SidebarItem[] = [
  group('Editorial', [
    page('Editorial overview', '/docs/editorial/'),
    page('Editorial doctrine', '/docs/editorial/editorial-doctrine'),
    page('EDA programme', '/docs/editorial/eda-programme'),
    page('EDA-00 doctrine audit', '/docs/editorial/eda-00-doctrine-audit'),
    page('Editorial overhaul plan — completed provenance', '/docs/editorial/editorial-overhaul-plan')
  ], false)
]

const projectSidebar: DefaultTheme.SidebarItem[] = [
  group('Project records', [
    page('Project status', '/STATUS'),
    page('Documentation structure', '/docs/'),
    page('Development', '/docs/development/'),
    page('Editorial', '/docs/editorial/')
  ], false)
]

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Start reading', link: '/docs/reading-guide' },
  {
    text: 'Architecture',
    items: [
      { text: 'Architectural argument', link: '/docs/manuscript/' },
      { text: 'Pattern language', link: '/docs/patterns/' },
      { text: 'Architectural grammar', link: '/docs/grammar/' },
      { text: 'Reference House', link: '/docs/reference-house/' }
    ]
  },
  {
    text: 'Evidence & testing',
    items: [
      { text: 'Research', link: '/docs/research/' },
      { text: 'Physical prototypes', link: '/docs/prototypes/' },
      { text: 'Computational track', link: '/docs/computational/' }
    ]
  },
  { text: 'Delivery', link: '/docs/delivery/' },
  {
    text: 'Project',
    items: [
      { text: 'Project status', link: '/STATUS' },
      { text: 'Documentation structure', link: '/docs/' },
      { text: 'Development records', link: '/docs/development/' },
      { text: 'Editorial system', link: '/docs/editorial/' }
    ]
  }
]

export const sidebar = {
  '/docs/manuscript/': manuscriptSidebar,
  '/docs/patterns/': patternsSidebar,
  '/docs/grammar/': grammarSidebar,
  '/docs/reference-house/': referenceHouseSidebar,
  '/docs/research/': researchSidebar,
  '/docs/prototypes/': prototypesSidebar,
  '/docs/delivery/': deliverySidebar,
  '/docs/computational/': computationalSidebar,
  '/docs/development/': developmentSidebar,
  '/docs/editorial/': editorialSidebar,
  '/docs/reading-guide': startSidebar,
  '/STATUS': projectSidebar,
  '/docs/': projectSidebar,
  '/': startSidebar
}

function collectMarkdown(dir: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path)
  }

  return files
}

function flattenLinks(items: DefaultTheme.SidebarItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.link ? [item.link] : []),
    ...(item.items ? flattenLinks(item.items) : [])
  ])
}

function sourceRoute(source: string): string {
  const normal = source.split(sep).join('/')
  if (normal === 'README.md') return '/'
  if (normal.endsWith('/README.md')) return `/${normal.slice(0, -'README.md'.length)}`
  return `/${normal.slice(0, -'.md'.length)}`
}

function excludedFromNavigation(source: string): boolean {
  return readFileSync(source, 'utf8').includes('<!-- nav-exclude: redirect -->')
}

/**
 * VitePress publishes every Markdown source by default. Keep the curated site
 * honest: every substantive page must be deliberately classified in at least
 * one route-specific sidebar. Compatibility redirect pages are the sole
 * explicit exception.
 */
export function assertNavigationCoverage(): void {
  const root = process.cwd()
  const sources = [join(root, 'README.md'), join(root, 'STATUS.md'), ...collectMarkdown(join(root, 'docs'))]
  const publishedRoutes = sources
    .filter((source) => !excludedFromNavigation(source))
    .map((source) => sourceRoute(relative(root, source)))
  const navigationRoutes = new Set(
    Object.values(sidebar).flatMap((items) => flattenLinks(items))
  )
  const missing = publishedRoutes.filter((route) => !navigationRoutes.has(route))

  if (missing.length) {
    throw new Error(
      `Published Markdown pages missing from curated navigation:\n${missing.map((route) => `  - ${route}`).join('\n')}`
    )
  }
}
