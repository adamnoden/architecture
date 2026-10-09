import { readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type { DefaultTheme } from 'vitepress'

const page = (text: string, link: string): DefaultTheme.SidebarItem => ({ text, link })
const group = (
  text: string,
  items: DefaultTheme.SidebarItem[],
  collapsed = true
): DefaultTheme.SidebarItem => ({ text, items, collapsed })
const section = (
  text: string,
  link: string,
  items: DefaultTheme.SidebarItem[] = [],
  collapsed = false
): DefaultTheme.SidebarItem => ({ text, link, items, collapsed })

const startSidebar: DefaultTheme.SidebarItem[] = [
  group('Start here', [
    page('Project overview', '/'),
    page('How to read this project', '/docs/reading-guide'),
    page('Project status', '/STATUS')
  ], false)
]

const manuscriptSidebar: DefaultTheme.SidebarItem[] = [
  group('Architectural argument', [
    page('Manuscript overview', '/docs/manuscript/'),
    page('Preface', '/docs/manuscript/preface'),
    section('Part I — The Proposition', '/docs/manuscript/part-i', [
      page('Eleven governing principles', '/docs/manuscript/governing-principles'),
      page('Principle 8 — Design for Repose', '/docs/manuscript/principle-08-repose')
    ]),
    section('Part II — Architecture of the Platform', '/docs/manuscript/part-ii', [
      page('Maintenance Geography — The Exterior', '/docs/manuscript/maintenance-geography-external')
    ]),
    page('Part III — Pattern Language', '/docs/patterns/'),
    page('Part IV — Reference House', '/docs/reference-house/'),
    page('Part V — Making and Testing the Platform', '/docs/manuscript/part-v'),
    group('Structure & reference', [
      page('Publication architecture', '/docs/manuscript/publication-architecture')
    ])
  ], false)
]

const patternsSidebar: DefaultTheme.SidebarItem[] = [
  group('Pattern language', [
    page('Pattern overview', '/docs/patterns/'),
    page('Language model & authoring contract', '/docs/patterns/language-model'),
    page('Service-topology generative sequence', '/docs/patterns/service-topology-sequence')
  ], false),
  group('Canonical patterns', [
    group('A · Service geography & distribution', [
      page('HSA-P-001 — Controlled Utility Entry', '/docs/patterns/controlled-utility-entry'),
      page('HSA-P-002 — Plant Room as Service Hub', '/docs/patterns/plant-room-service-hub'),
      page('HSA-P-014 — Accessible Vertical Service Zone', '/docs/patterns/accessible-vertical-service-zone'),
      page('HSA-P-003 — Coherent Horizontal Service Route', '/docs/patterns/coherent-horizontal-service-route'),
      page('HSA-P-015 — Accessible Room Service Route', '/docs/patterns/accessible-room-service-route'),
      page('HSA-P-004 — High-Service-Room Service Wall', '/docs/patterns/high-service-room-service-wall'),
      page('HSA-P-005 — Designed Structural Penetration', '/docs/patterns/designed-structural-penetration'),
      page('HSA-P-016 — Compartmented Service Void', '/docs/patterns/compartmented-service-void')
    ], false),
    group('B · Water, leakage & failure', [
      page('HSA-P-017 — Visible Leakage Path', '/docs/patterns/visible-leakage-path'),
      page('HSA-P-018 — Failure-Tolerant Wet Service Room', '/docs/patterns/failure-tolerant-wet-service-room'),
      page('HSA-P-009 — Accessible Rainwater Route', '/docs/patterns/accessible-rainwater-route')
    ]),
    group('C · Openings, movement & attachment', [
      page('HSA-P-007 — Permanent Opening / Replaceable Window', '/docs/patterns/permanent-opening-replaceable-window'),
      page('HSA-P-019 — Permanent Opening / Replaceable Door', '/docs/patterns/permanent-opening-replaceable-door'),
      page('HSA-P-020 — Designed Threshold', '/docs/patterns/designed-threshold'),
      page('HSA-P-008 — Movement / Slip Junction', '/docs/patterns/movement-slip-junction'),
      page('HSA-P-022 — Controlled Attachment Plane', '/docs/patterns/controlled-attachment-plane')
    ]),
    group('D · Environment & external maintenance', [
      page('HSA-P-010 — Source-Capture Kitchen Extract', '/docs/patterns/source-capture-kitchen-extract'),
      page('HSA-P-021 — Source-Capture Bathroom Extract', '/docs/patterns/source-capture-bathroom-extract'),
      page('HSA-P-011 — Roof Maintenance Route', '/docs/patterns/roof-maintenance-route'),
      page('HSA-P-013 — Ground-Supported Façade Access', '/docs/patterns/ground-supported-facade-access')
    ]),
    group('E · Stewardship', [
      page('HSA-P-012 — Physical Service Index', '/docs/patterns/physical-service-index')
    ])
  ], false),
  group('Strategies', [
    page('Strategy overview', '/docs/patterns/strategies/'),
    page('Fail-Safe Water Distribution', '/docs/patterns/strategies/fail-safe-water-distribution'),
    page('Decompose Structural Interface Functions', '/docs/patterns/strategies/decompose-structural-interface-functions'),
    page('Separate Structural Floor from Changeable Layers', '/docs/patterns/strategies/separate-structural-floor-changeable-layers')
  ]),
  group('Held candidates', [
    page('Candidate overview', '/docs/patterns/candidates/'),
    page('Replaceable Architectural Lining', '/docs/patterns/candidates/replaceable-architectural-lining'),
    page('Individually Isolatable Manifold Distribution', '/docs/patterns/candidates/individually-isolatable-manifold-distribution'),
    page('Local Deep Service Zone', '/docs/patterns/candidates/local-deep-service-zone'),
    page('Selective Floor Access', '/docs/patterns/candidates/selective-floor-access')
  ]),
  group('Retired identities', [
    page('Retired pattern overview', '/docs/patterns/retired/'),
    page('HSA-P-006 — Water-Damage-Safe Service Route', '/docs/patterns/retired/hsa-p-006-water-damage-safe-service-route')
  ]),
  group('History & provenance', [
    page('Core 12 — legacy aggregate', '/docs/patterns/core-12'),
    page('Reversible assembly candidates — legacy aggregate', '/docs/patterns/reversible-assembly-candidates'),
    page('Accessible Vertical Service Zone — pre-admission candidate', '/docs/patterns/candidates/accessible-vertical-service-zone'),
    group('Service-topology pilot', [
      page('Pilot index', '/docs/patterns/pilot/'),
      page('HSA-P-001 — Controlled Utility Entry', '/docs/patterns/pilot/controlled-utility-entry'),
      page('HSA-P-002 — Plant Room as Service Hub', '/docs/patterns/pilot/plant-room-service-hub'),
      page('HSA-P-003 — Horizontal Service Spine', '/docs/patterns/pilot/horizontal-service-spine'),
      page('HSA-P-004 — High-Service-Room Service Wall', '/docs/patterns/pilot/high-service-room-service-wall'),
      page('HSA-P-005 — Designed Structural Penetration', '/docs/patterns/pilot/designed-structural-penetration'),
      page('HSA-P-012 — Physical Service Index', '/docs/patterns/pilot/physical-service-index')
    ])
  ])
]

const grammarSidebar: DefaultTheme.SidebarItem[] = [
  group('Architectural grammar', [
    page('Grammar overview', '/docs/grammar/'),
    page('Grammar framework', '/docs/computational/architectural-grammar-and-proportion'),
    page('Modelling corrections', '/docs/computational/architectural-grammar-modelling-corrections-v01')
  ], false),
  group('G-01 · Georgian-derived domestic grammar', [
    page('Grammar charter', '/docs/computational/g01-grammar-charter'),
    page('Research brief', '/docs/computational/g01-research-brief'),
    page('Corpus & source-quality register', '/docs/computational/g01-corpus-register'),
    page('Annotation schema', '/docs/computational/g01-annotation-schema'),
    page('Topology comparison', '/docs/computational/g01-topology-comparison'),
    page('Dimensional analysis', '/docs/computational/g01-dimensional-analysis'),
    page('Plan / section / elevation coupling', '/docs/computational/g01-plan-section-elevation-coupling'),
    page('Candidate constraints', '/docs/computational/g01-candidate-constraints-v01')
  ], false),
  group('Precedent cases', [
    page('Case index', '/docs/computational/g01-cases/'),
    page('76 Dean Street', '/docs/computational/g01-cases/76-dean-street'),
    page('Bedford Square', '/docs/computational/g01-cases/bedford-square'),
    page('Danson House', '/docs/computational/g01-cases/danson-house'),
    page('Danson House — D5/D6 web evidence', '/docs/computational/g01-cases/danson-d5-d6-web-evidence-v02'),
    page('Marble Hill House', '/docs/computational/g01-cases/marble-hill-house'),
    page('Marble Hill House — D5/D6 web evidence', '/docs/computational/g01-cases/marble-hill-d5-d6-web-evidence-v02')
  ]),
  group('Evidence & derivation', [
    page('D5/D6 web pass v0.2 — superseded', '/docs/computational/g01-d5-d6-web-pass-v02'),
    page('D5/D6 evidence gate v0.3 — current', '/docs/computational/g01-d5-d6-web-pass-v03'),
    page('D6 mutation run — Danson sequence', '/docs/computational/g01-d6-mutation-run-01-danson-sequence')
  ])
]

const referenceHouseSidebar: DefaultTheme.SidebarItem[] = [
  group('Reference House', [
    page('Reference House overview', '/docs/reference-house/'),
    page('Pattern occurrence register', '/docs/reference-house/pattern-occurrence-register'),
    page('Tectonic architectural language', '/docs/reference-house/tectonic-architectural-language'),
    page('Whole-house coordination fixture', '/docs/reference-house/whole-house-coordination-fixture'),
    page('Vertical bay options', '/docs/reference-house/vertical-bay-options'),
    page('Vertical bay coordination', '/docs/reference-house/vertical-bay-coordination'),
    page('External access & maintenance', '/docs/reference-house/external-access-maintenance-plan')
  ], false),
  group('History & provenance', [
    page('Service topology coordination brief', '/docs/reference-house/service-topology-coordination'),
    page('Service topology run 01', '/docs/reference-house/service-topology-run-01')
  ])
]

const researchSidebar: DefaultTheme.SidebarItem[] = [
  group('Research & evidence', [
    page('Research overview', '/docs/research/')
  ], false),
  group('Human factors & repose', [
    page('Repose & low vigilance', '/docs/research/repose-and-low-vigilance'),
    page('Repose evidence audit', '/docs/research/repose-evidence-audit')
  ], false),
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
  ]),
  group('Historical targeted evidence', [
    page('Pattern-language Phase 6 evidence', '/docs/research/pattern-language-phase6-targeted-evidence')
  ])
]

const prototypesSidebar: DefaultTheme.SidebarItem[] = [
  group('Physical prototypes', [
    page('Prototype overview', '/docs/prototypes/'),
    page('W2 wall-bay build pack', '/docs/prototypes/w2-wall-bay-build-pack'),
    page('W2 wall-bay evidence protocol', '/docs/prototypes/w2-wall-bay-test-protocol')
  ], false)
]

const deliverySidebar: DefaultTheme.SidebarItem[] = [
  group('Delivery', [
    page('Delivery overview', '/docs/delivery/'),
    page('RIBA implementation brief', '/docs/delivery/riba-implementation-brief-template'),
    page('External maintenance access requirements', '/docs/delivery/external-maintenance-access-requirements')
  ], false)
]

const computationalSidebar: DefaultTheme.SidebarItem[] = [
  group('Computational track', [
    page('Computational overview', '/docs/computational/')
  ], false),
  group('Executable result & external review', [
    page('P0 + PAT-XW-01 executable result — PASS', '/docs/computational/p0-pat-xw-01-result'),
    page('H1 capability matrix v0.5 — frozen paper baseline', '/docs/computational/h1-capability-matrix-v05'),
    page('External-maintenance doctrine delta — open fixture candidate', '/docs/computational/doctrine-delta-external-maintenance-v01'),
    page('External review pack — H1 paper — open', '/docs/computational/external-review-pack-h1-paper-v02'),
    page('External evidence trial — Mapeguard WP — completed', '/docs/computational/external-evidence-trial-mapeguard-wp-v01')
  ], false),
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
  group('Pattern crosswalk', [
    page('Crosswalk model', '/docs/computational/pattern-crosswalk-model'),
    page('Service-topology pilot', '/docs/computational/pattern-crosswalk-service-topology-pilot'),
    page('Remaining active patterns', '/docs/computational/pattern-crosswalk-remaining-active'),
    page('Strategies & held candidates', '/docs/computational/pattern-crosswalk-strategies-candidates'),
    page('Implementation handoff', '/docs/computational/pattern-crosswalk-implementation-handoff')
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
  group('Paper-compilation history', [
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
    page('Research programme v0.4', '/docs/computational/research-programme-v04'),
    page('Research programme v0.5', '/docs/computational/research-programme-v05'),
    page('Research programme v0.6 — frozen', '/docs/computational/research-programme-v06'),
    page('P0 implementation plan — completed', '/docs/computational/p0-implementation-plan')
  ])
]

const developmentSidebar: DefaultTheme.SidebarItem[] = [
  group('Development', [
    page('Development overview', '/docs/development/'),
    page('Information architecture migration', '/docs/development/information-architecture-migration'),
    page('Architectural specificity boundary', '/docs/development/architectural-specificity-boundary'),
    page('Prototype programme', '/docs/development/tectonic-prototype-programme'),
    page('Manufacturing strategy', '/docs/development/manufacturing-strategy')
  ], false),
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
    page('Editorial overhaul plan — completed provenance', '/docs/editorial/editorial-overhaul-plan')
  ], false)
]

const sourceSidebar: DefaultTheme.SidebarItem[] = [
  group('Source archive', [
    page('Source overview', '/docs/source/'),
    page('House Design Doctrine v7', '/docs/source/house-design-doctrine-v7')
  ], false)
]

const projectSidebar: DefaultTheme.SidebarItem[] = [
  group('Project records', [
    page('Documentation model', '/docs/'),
    page('Project status', '/STATUS'),
    page('Development', '/docs/development/'),
    page('Editorial', '/docs/editorial/'),
    page('Source archive', '/docs/source/')
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
      { text: 'Documentation model', link: '/docs/' },
      { text: 'Development records', link: '/docs/development/' },
      { text: 'Editorial system', link: '/docs/editorial/' },
      { text: 'Source archive', link: '/docs/source/' }
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
  '/docs/source/': sourceSidebar,
  '/docs/reading-guide': startSidebar,
  '/STATUS': startSidebar,
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

/**
 * VitePress publishes every Markdown source by default. Keep the curated site
 * honest: every published page must be deliberately classified in at least one
 * route-specific sidebar, even when it sits only under history/provenance.
 */
export function assertNavigationCoverage(): void {
  const root = process.cwd()
  const sources = [join(root, 'README.md'), join(root, 'STATUS.md'), ...collectMarkdown(join(root, 'docs'))]
  const publishedRoutes = sources.map((source) => sourceRoute(relative(root, source)))
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
