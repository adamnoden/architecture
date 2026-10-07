import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type { DefaultTheme } from 'vitepress'

const page = (text: string, link: string): DefaultTheme.SidebarItem => ({ text, link })
const group = (
  text: string,
  items: DefaultTheme.SidebarItem[],
  collapsed = true
): DefaultTheme.SidebarItem => ({ text, items, collapsed })

export const sidebar: DefaultTheme.SidebarItem[] = [
  group('Start here', [
    page('Project overview', '/'),
    page('How to read this project', '/docs/reading-guide'),
    page('Project status', '/STATUS')
  ], false),

  group('Architectural argument', [
    page('Manuscript overview', '/docs/manuscript/'),
    page('Preface', '/docs/manuscript/preface'),
    page('Governing principles', '/docs/manuscript/governing-principles'),
    page('Part I — The Proposition', '/docs/manuscript/part-i'),
    page('Part II — Architecture of the Platform', '/docs/manuscript/part-ii'),
    page('Repose', '/docs/manuscript/principle-08-repose'),
    page('External maintenance geography', '/docs/manuscript/maintenance-geography-external'),
    page('Part V — Making and Testing the Platform', '/docs/manuscript/part-v')
  ], false),

  group('Patterns', [
    page('Pattern catalogue', '/docs/patterns/'),
    page('Core patterns', '/docs/patterns/core-12'),
    page('Ground-supported façade access', '/docs/patterns/ground-supported-facade-access'),
    page('Reversible assembly candidates', '/docs/patterns/reversible-assembly-candidates')
  ]),

  group('Reference house', [
    page('Reference house overview', '/docs/reference-house/'),
    page('Tectonic architectural language', '/docs/reference-house/tectonic-architectural-language'),
    page('Vertical bay options', '/docs/reference-house/vertical-bay-options'),
    page('Vertical bay coordination', '/docs/reference-house/vertical-bay-coordination'),
    page('External access & maintenance', '/docs/reference-house/external-access-maintenance-plan')
  ]),

  group('Research', [
    page('Research overview', '/docs/research/'),
    group('Human factors & repose', [
      page('Repose & low vigilance', '/docs/research/repose-and-low-vigilance'),
      page('Repose evidence audit', '/docs/research/repose-evidence-audit')
    ]),
    group('Construction & robustness', [
      page('Workmanship robustness', '/docs/research/workmanship-robustness'),
      page('Candidate pattern hardening', '/docs/research/candidate-pattern-hardening-summary')
    ]),
    group('Floor & wall systems', [
      page('Primary floor structure baseline', '/docs/research/primary-floor-structure-baseline'),
      page('Seated floor structure options', '/docs/research/seated-floor-structure-options'),
      page('Finish-agnostic floor platform options', '/docs/research/finish-agnostic-floor-platform-options'),
      page('Replaceable wall system options', '/docs/research/replaceable-wall-system-options')
    ]),
    group('Maintenance & precedent', [
      page('External maintenance access', '/docs/research/external-maintenance-access'),
      page('Preface precedents', '/docs/research/preface-precedents')
    ])
  ]),

  group('Delivery & testing', [
    group('Delivery', [
      page('Delivery overview', '/docs/delivery/'),
      page('RIBA implementation brief', '/docs/delivery/riba-implementation-brief-template'),
      page('External maintenance access requirements', '/docs/delivery/external-maintenance-access-requirements')
    ], false),
    group('Prototypes', [
      page('Prototype overview', '/docs/prototypes/'),
      page('W2 wall-bay build pack', '/docs/prototypes/w2-wall-bay-build-pack')
    ]),
    group('Development', [
      page('Development overview', '/docs/development/'),
      page('Manufacturing strategy', '/docs/development/manufacturing-strategy'),
      page('Prototype programme', '/docs/development/tectonic-prototype-programme'),
      page('Tectonic honesty', '/docs/development/tectonic-honesty'),
      group('Integration records', [
        page('Tectonic integration register', '/docs/development/tectonic-integration-register'),
        page('Tectonic migration plan', '/docs/development/tectonic-migration-plan'),
        page('Repose integration register', '/docs/development/repose-integration-register'),
        page('Preface architecture', '/docs/development/preface-architecture')
      ])
    ])
  ]),

  group('Computational track', [
    page('Computational overview', '/docs/computational/'),

    group('Core model', [
      page('Executable architecture', '/docs/computational/executable-architecture'),
      page('Formal architectural model', '/docs/computational/formal-architectural-model'),
      page('Validity & obligations', '/docs/computational/validity-and-obligations'),
      page('Evidence & provenance', '/docs/computational/evidence-and-provenance'),
      page('Compiler targets', '/docs/computational/compiler-targets'),
      page('Structural semantics', '/docs/computational/structural-semantics'),
      page('Boundary semantics', '/docs/computational/boundary-semantics'),
      page('Interface obligation bundles', '/docs/computational/interface-obligation-bundles'),
      page('Supported domain', '/docs/computational/supported-domain'),
      page('Prior-art map', '/docs/computational/prior-art-map')
    ], false),

    group('Current programme & review', [
      page('Research programme v0.5', '/docs/computational/research-programme-v05'),
      page('H1 capability matrix v0.5', '/docs/computational/h1-capability-matrix-v05'),
      page('Doctrine delta — external maintenance', '/docs/computational/doctrine-delta-external-maintenance-v01'),
      page('External review pack — H1 paper v0.2', '/docs/computational/external-review-pack-h1-paper-v02'),
      page('External evidence trial — Mapeguard WP', '/docs/computational/external-evidence-trial-mapeguard-wp-v01')
    ]),

    group('Architectural grammar study', [
      page('Architectural grammar & proportion', '/docs/computational/architectural-grammar-and-proportion'),
      page('G-01 research brief', '/docs/computational/g01-research-brief'),
      page('G-01 corpus register', '/docs/computational/g01-corpus-register'),
      page('G-01 annotation schema', '/docs/computational/g01-annotation-schema'),
      group('G-01 precedent cases', [
        page('Case index', '/docs/computational/g01-cases/'),
        page('76 Dean Street', '/docs/computational/g01-cases/76-dean-street'),
        page('Danson House', '/docs/computational/g01-cases/danson-house'),
        page('Marble Hill House', '/docs/computational/g01-cases/marble-hill-house')
      ]),
      page('G-01 topology comparison', '/docs/computational/g01-topology-comparison'),
      page('G-01 dimensional analysis', '/docs/computational/g01-dimensional-analysis'),
      page('G-01 plan / section / elevation coupling', '/docs/computational/g01-plan-section-elevation-coupling'),
      page('G-01 candidate constraints', '/docs/computational/g01-candidate-constraints-v01')
    ]),

    group('Building & system families', [
      page('S0 wall-bay assembly composition', '/docs/computational/assembly-composition-s0-wall-bay'),
      group('Boundary families', [
        page('Controlled service penetration', '/docs/computational/boundary-family-controlled-penetration-v01'),
        page('External masonry corner', '/docs/computational/boundary-family-external-masonry-corner-v01'),
        page('Ground floor / masonry perimeter', '/docs/computational/boundary-family-ground-floor-masonry-v01'),
        page('Window / masonry wall', '/docs/computational/boundary-family-window-masonry-v01')
      ]),
      page('Principal masonry entrance', '/docs/computational/entrance-family-principal-masonry-v01'),
      page('Two-storey fire / egress family', '/docs/computational/fire-family-two-storey-egress-v01'),
      page('ASHP + radiator heating family', '/docs/computational/heating-family-ashp-radiators-v01'),
      page('Floor / masonry interface bundle', '/docs/computational/interface-bundle-floor-masonry'),
      page('Window / masonry interface bundle', '/docs/computational/interface-bundle-window-masonry'),
      page('Trussed duo-pitch roof family', '/docs/computational/roof-family-trussed-duopitch-v01'),
      page('Room low-level service family', '/docs/computational/service-family-room-low-level-v01'),
      page('Private stair family', '/docs/computational/stair-family-private-v01'),
      page('Structural assurance boundary — H1', '/docs/computational/structural-assurance-boundary-h1-v01'),
      page('cMEV ventilation family', '/docs/computational/ventilation-family-cmev-v01'),
      page('Hybrid stack ventilation family', '/docs/computational/ventilation-family-hybrid-stack-v01'),
      page('Wet service core family', '/docs/computational/wet-service-family-core-v01'),
      page('Bonded sheet wet-zone family', '/docs/computational/wet-zone-family-bonded-sheet-v01')
    ]),

    group('H1 environmental & services decisions', [
      page('Heating strategy decision v0.1', '/docs/computational/h1-heating-strategy-decision-v01'),
      page('Hybrid ventilation evidence trial v0.1', '/docs/computational/h1-hybrid-ventilation-evidence-trial-v01'),
      page('Passive environmental strategy v0.1', '/docs/computational/h1-passive-environmental-strategy-v01'),
      page('Services target extension v0.1', '/docs/computational/h1-services-target-extension-v01'),
      page('Ventilation strategy decision v0.1', '/docs/computational/h1-ventilation-strategy-decision-v01'),
      page('Ventilation strategy decision v0.2', '/docs/computational/h1-ventilation-strategy-decision-v02')
    ]),

    group('Paper compilation history', [
      group('S0', [
        page('Paper compilation S0', '/docs/computational/paper-compilation-s0'),
        page('S0 complexity gate', '/docs/computational/s0-complexity-gate'),
        page('S0 conventional workmanship route', '/docs/computational/s0-conventional-workmanship-route'),
        page('S0 source package v0.1', '/docs/computational/s0-source-package'),
        page('S0 source package v0.2', '/docs/computational/s0-source-package-v02'),
        page('S0 target snapshot v0.1', '/docs/computational/s0-target-snapshot'),
        page('S0 target snapshot v0.2', '/docs/computational/s0-target-snapshot-v02'),
        page('S0 target snapshot v0.3', '/docs/computational/s0-target-snapshot-v03'),
        page('S0 paper compile run 01', '/docs/computational/s0-paper-compile-run-01'),
        page('S0 paper compile run 02', '/docs/computational/s0-paper-compile-run-02'),
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
      page('Research programme v0.4', '/docs/computational/research-programme-v04')
    ])
  ]),

  group('Project & provenance', [
    page('Documentation model', '/docs/'),
    page('Publication architecture', '/docs/manuscript/publication-architecture'),
    group('Editorial', [
      page('Editorial overview', '/docs/editorial/'),
      page('Editorial doctrine', '/docs/editorial/editorial-doctrine'),
      page('Editorial overhaul plan', '/docs/editorial/editorial-overhaul-plan')
    ]),
    group('Source archive', [
      page('Source overview', '/docs/source/'),
      page('House Design Doctrine v7', '/docs/source/house-design-doctrine-v7')
    ])
  ])
]

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

/**
 * VitePress will publish every Markdown source by default. Keep the curated tree
 * honest: a new page must be deliberately placed in navigation before the build
 * is allowed to pass.
 */
export function assertNavigationCoverage(): void {
  const root = process.cwd()
  const sources = [join(root, 'README.md'), join(root, 'STATUS.md'), ...collectMarkdown(join(root, 'docs'))]
  const publishedRoutes = sources.map((source) => sourceRoute(relative(root, source)))
  const navigationRoutes = new Set(flattenLinks(sidebar))
  const missing = publishedRoutes.filter((route) => !navigationRoutes.has(route))

  if (missing.length) {
    throw new Error(`Published Markdown pages missing from the global navigation:\n${missing.map((route) => `  - ${route}`).join('\n')}`)
  }
}
