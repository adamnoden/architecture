export const maturityLevels = [
  {
    id: 'M1',
    name: 'Framed',
    criterion: 'The problem, scope and intended direction are explicit enough to guide further work.'
  },
  {
    id: 'M2',
    name: 'Developed',
    criterion: 'Substantive design or research material exists and the main choices and trade-offs are visible, but important coordination remains.'
  },
  {
    id: 'M3',
    name: 'Coordinated',
    criterion: 'The workstream has been reconciled with adjacent parts of the project and is internally coherent at its stated scope.'
  },
  {
    id: 'M4',
    name: 'Internally validated / controlled',
    criterion: 'The proposition has been deliberately challenged against internal tests or evidence and is stable enough to act as the controlled baseline.'
  },
  {
    id: 'M5',
    name: 'Externally validated / release-ready',
    criterion: 'Competent independent review or real-world validation has tested the proposition, material findings are resolved, and it is release-ready at its stated scope.'
  }
] as const

export type MaturityLevel = (typeof maturityLevels)[number]['id']
export type EvidencePath = `${string}.md` | `${string}.ts`
export type ReviewDate = `${number}-${number}-${number}`

type EvidenceSet = readonly [EvidencePath, ...EvidencePath[]]

interface WorkstreamBase {
  id: string
  name: string
  currentState: string
  nextGate: string
  reviewedOn: ReviewDate
}

type M1Assessment = WorkstreamBase & {
  maturity: 'M1'
  evidence: {
    framed: EvidenceSet
  }
}

type M2Assessment = WorkstreamBase & {
  maturity: 'M2'
  evidence: {
    framed: EvidenceSet
    developed: EvidenceSet
  }
}

type M3Assessment = WorkstreamBase & {
  maturity: 'M3'
  evidence: {
    framed: EvidenceSet
    developed: EvidenceSet
    coordinated: EvidenceSet
  }
}

type M4Assessment = WorkstreamBase & {
  maturity: 'M4'
  evidence: {
    framed: EvidenceSet
    developed: EvidenceSet
    coordinated: EvidenceSet
    internallyValidated: EvidenceSet
  }
}

type M5Assessment = WorkstreamBase & {
  maturity: 'M5'
  evidence: {
    framed: EvidenceSet
    developed: EvidenceSet
    coordinated: EvidenceSet
    internallyValidated: EvidenceSet
    externallyValidated: EvidenceSet
  }
}

export type WorkstreamStatus =
  | M1Assessment
  | M2Assessment
  | M3Assessment
  | M4Assessment
  | M5Assessment

export const workstreamStatuses = [
  {
    id: 'public-architectural-position',
    name: 'Public architectural position',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState:
      'Governing principles, selective permanence, interface design, failure architecture, maintenance geography, workmanship robustness, repose and passive-first hierarchy are coordinated and style-neutral.',
    nextGate: 'Evidence and figure hardening, followed by final whole-book proof.',
    evidence: {
      framed: ['docs/manuscript/governing-principles.md'],
      developed: ['docs/manuscript/part-i.md', 'docs/manuscript/part-ii.md'],
      coordinated: ['docs/development/architectural-specificity-adversarial-test.md']
    }
  },
  {
    id: 'pattern-language',
    name: 'Pattern language',
    maturity: 'M4',
    reviewedOn: '2026-10-12',
    currentState:
      '21 active patterns, three strategies and four held candidates are canonical at current internal scope.',
    nextGate: 'Reopen only when new architectural, physical or external evidence requires change.',
    evidence: {
      framed: ['docs/patterns/language-model.md'],
      developed: ['docs/patterns/README.md'],
      coordinated: ['docs/development/pattern-language-phase8-review.md'],
      internallyValidated: [
        'docs/development/pattern-language-phase7-review.md',
        'docs/development/pattern-language-phase8-review.md'
      ]
    }
  },
  {
    id: 'architectural-grammar-framework',
    name: 'Architectural grammar framework',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState:
      'Grammar is a first-class layer separate from House Kernel doctrine and is coordinated at framework level.',
    nextGate: 'Continue to test neutrality across concrete grammar instances.',
    evidence: {
      framed: ['docs/grammar/architectural-grammar-and-proportion.md'],
      developed: ['docs/grammar/architectural-grammar-modelling-corrections-v01.md'],
      coordinated: ['docs/development/architectural-specificity-adversarial-test.md']
    }
  },
  {
    id: 'g01-grammar-instance',
    name: 'G-01 grammar instance',
    maturity: 'M2',
    reviewedOn: '2026-10-12',
    currentState:
      'The Georgian-derived instance has corpus, dimensional and coupling work, but derivation remains incomplete.',
    nextGate:
      'Complete evidence-led derivation and test it against the Reference House without promoting project taste into doctrine.',
    evidence: {
      framed: ['docs/grammar/g01-grammar-charter.md'],
      developed: ['docs/grammar/g01-candidate-constraints-v01.md']
    }
  },
  {
    id: 'reference-house',
    name: 'Reference House',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState:
      'RH-00 through RH-10 are coordinated at virtual-design scope; the whole-house audit reconciles architecture, structure, services, environment, roof/maintenance, occupied interfaces, heating/renewables and envelope, with remaining uncertainty bounded to engineering, simulation, prototype, real-site and external-review work.',
    nextGate:
      'RH-11 competent structural, fire/building-control, MEP/acoustic and building-physics review; resolve any material rewinds before claiming further maturity.',
    evidence: {
      framed: ['docs/reference-house/README.md'],
      developed: [
        'docs/reference-house/pattern-occurrence-register.md',
        'docs/reference-house/whole-house-coordination-fixture.md',
        'docs/reference-house/tectonic-integration-rh09.md'
      ],
      coordinated: [
        'docs/reference-house/whole-house-coordination-audit.md',
        'docs/reference-house/energy-heat-coordination-rh10.md',
        'docs/reference-house/envelope-coordination-rh10.md'
      ]
    }
  },
  {
    id: 'physical-prototypes',
    name: 'Physical prototypes',
    maturity: 'M2',
    reviewedOn: '2026-10-12',
    currentState:
      'The programme, acceptance criteria and W2 build/test material exist; no physical validation has yet been recorded.',
    nextGate:
      'Build and test the wall bay; engineer and test the floor edge; then the floor platform and tectonic joint.',
    evidence: {
      framed: ['docs/development/tectonic-prototype-programme.md'],
      developed: [
        'docs/prototypes/w2-wall-bay-build-pack.md',
        'docs/prototypes/w2-wall-bay-test-protocol.md'
      ]
    }
  },
  {
    id: 'external-professional-review',
    name: 'External professional review',
    maturity: 'M1',
    reviewedOn: '2026-10-12',
    currentState:
      'Review targets and computational review material exist; competent broad external review has not yet occurred.',
    nextGate: 'Structural, fire/building-control and building-services review.',
    evidence: {
      framed: ['docs/computational/external-review-pack-h1-paper-v02.md']
    }
  },
  {
    id: 'computational-track',
    name: 'Computational track',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState:
      'P0 passed 17/17 tests and PAT-XW-01 passed 6/6; generic compiler growth is intentionally stopped.',
    nextGate:
      'Add a fixture only when another workstream exposes a concrete high-value question.',
    evidence: {
      framed: ['docs/computational/executable-architecture.md'],
      developed: ['compiler/p0/p0.test.ts'],
      coordinated: ['docs/computational/p0-pat-xw-01-result.md']
    }
  },
  {
    id: 'evidence-research',
    name: 'Evidence / precedent research',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState:
      'Major evidence packages exist and taxonomy ambiguities are largely closed.',
    nextGate: 'Targeted claim hardening where physical or publication maturity requires it.',
    evidence: {
      framed: ['docs/research/README.md'],
      developed: ['docs/research/workmanship-robustness.md'],
      coordinated: ['docs/research/candidate-pattern-hardening-summary.md']
    }
  },
  {
    id: 'publication',
    name: 'Publication',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState:
      'Publication Architecture v0.12 is established; Parts III/IV and figure language remain less mature than the main argument.',
    nextGate: 'Finish Part III/IV development, figures and evidence presentation.',
    evidence: {
      framed: ['docs/manuscript/publication-architecture.md'],
      developed: ['publication/publication.ts'],
      coordinated: ['docs/development/print-publication-editorial-proof.md']
    }
  },
  {
    id: 'delivery',
    name: 'Delivery',
    maturity: 'M2',
    reviewedOn: '2026-10-12',
    currentState:
      'The implementation-brief structure exists, but downstream requirements remain intentionally incomplete.',
    nextGate: 'Populate only as architectural and validation decisions mature.',
    evidence: {
      framed: ['docs/delivery/README.md'],
      developed: ['docs/delivery/riba-implementation-brief-template.md']
    }
  }
] as const satisfies readonly WorkstreamStatus[]

function tableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

export function maturityEvidencePaths(): EvidencePath[] {
  const paths = new Set<EvidencePath>()

  for (const workstream of workstreamStatuses) {
    for (const evidenceSet of Object.values(workstream.evidence) as readonly EvidenceSet[]) {
      for (const path of evidenceSet) paths.add(path)
    }
  }

  return [...paths]
}

export function renderMaturityStatusBlock(): string {
  const scaleRows = maturityLevels.map(
    (level) => `| **${level.id}** | **${level.name}** | ${tableCell(level.criterion)} |`
  )
  const workstreamRows = workstreamStatuses.map(
    (workstream) =>
      `| **${tableCell(workstream.name)}** | **${workstream.maturity}** | ${workstream.reviewedOn} | ${tableCell(workstream.currentState)} | ${tableCell(workstream.nextGate)} |`
  )

  return [
    'House Kernel uses a **project-specific maturity model**. It is not a RIBA Plan of Work stage, BIM level-of-detail convention, Technology Readiness Level or other external industry standard. The codes use **M** for maturity so they are less likely to be mistaken for those systems.',
    '',
    '### Scale',
    '',
    '| Level | Meaning | Gate |',
    '|---|---|---|',
    ...scaleRows,
    '',
    'The levels are cumulative. An **M3** assessment asserts that the framing and development gates are also satisfied; **M4** adds internal validation; **M5** requires external validation. A level applies only to the stated scope of that workstream.',
    '',
    '### Governance',
    '',
    'The canonical ratings live in `project/maturity.ts`, not in this Markdown table. TypeScript makes the evidence chain cumulative: a workstream cannot be declared M3 without framing, development and coordination evidence, and M5 cannot be declared without external-validation evidence. Repository validation checks that every registered evidence path exists and that this rendered block exactly matches the typed registry.',
    '',
    'That enforcement prevents invalid codes, missing evidence references and duplicated status text from drifting apart. It cannot decide whether the evidence is architecturally convincing, nor can it detect a real-world change that nobody records. Promotion, demotion and reassessment therefore remain explicit architectural/editorial judgements. The per-workstream review date makes the age of those judgements visible rather than pretending they are automatically current.',
    '',
    '### Current ratings',
    '',
    '| Workstream | Maturity | Reviewed | Current state | Next meaningful gate |',
    '|---|---:|---|---|---|',
    ...workstreamRows
  ].join('\n')
}
