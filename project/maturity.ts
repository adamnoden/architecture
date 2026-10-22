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
  evidence: { framed: EvidenceSet }
}

type M2Assessment = WorkstreamBase & {
  maturity: 'M2'
  evidence: { framed: EvidenceSet; developed: EvidenceSet }
}

type M3Assessment = WorkstreamBase & {
  maturity: 'M3'
  evidence: { framed: EvidenceSet; developed: EvidenceSet; coordinated: EvidenceSet }
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
    maturity: 'M4',
    reviewedOn: '2026-10-19',
    currentState:
      'The core architectural position remains the internally controlled PR-01 baseline after material narrowing: proportional serviceability can reject overprovision, transfer claims are bounded, foreseeable human life-course and future-climate change are explicit, the Repose structural-perception claim is qualified, and architecture is separated from delivery and stewardship assumptions. The completed HFI programme has now integrated foreseeable human variance and complete-action / low-vigilance consequences into the governing principles without creating a parallel human-factors doctrine.',
    nextGate:
      'Hold the corrected position as the internally controlled baseline through PR-02; PR-03/PR-04 external critical reading and downstream physical/professional evidence remain capable of reopening it. M5 requires competent independent validation at the stated scope.',
    evidence: {
      framed: ['docs/manuscript/governing-principles.md'],
      developed: ['docs/manuscript/part-i.md', 'docs/manuscript/part-ii.md'],
      coordinated: ['docs/development/architectural-specificity-adversarial-test.md'],
      internallyValidated: [
        'publication/pr01-r1-core-proposition-attack.md',
        'publication/pr01-r4-hostile-architect-pass.md',
        'publication/pr01-r5-steelman-opposition.md',
        'publication/pr01-r6-cross-book-contradiction-omission.md',
        'publication/pr01-r8a-comparative-proportionality-closeout.md',
        'publication/pr01-r8f-local-findings-constitution-climate.md',
        'publication/pr01-r9-reproof-refreeze.md',
        'project/hfi/hfi-10-adversarial-closeout.md'
      ]
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
      'Grammar is a first-class layer separate from Ovid’s House doctrine and is coordinated at framework level.',
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
    maturity: 'M4',
    reviewedOn: '2026-10-14',
    currentState:
      'G-01 v0.1 is frozen as a bounded Georgian-derived domestic grammar. D8 falsification, predeclared D9 hold-outs, D10 normative reduction, fresh D10-S positive-specificity validation, freeze-before-project D12 conformance and D13 negative controls leave a small controlled rule set with explicit limitations: no universal ratios, centred-entry rule, fixed roof type or historical service topology. Positive specificity is strongest at architectural body/elevation/threshold scale; morphology-specific interior grammar remains open research debt rather than an invented rule set.',
    nextGate:
      'Hold v0.1 as the controlled baseline. Reopen only when competent external criticism, a real-project contradiction, a materially different second grammar, publication adversarial review or material new evidence creates a concrete question. M5 requires independent architectural validation at the stated scope.',
    evidence: {
      framed: ['docs/grammar/g01-grammar-charter.md'],
      developed: ['docs/grammar/g01-research-brief.md', 'docs/grammar/g01-v0.1.md'],
      coordinated: [
        'docs/grammar/g01-d10-normative-reduction.md',
        'docs/reference-house/g01-v0.1-conformance-d12.md'
      ],
      internallyValidated: [
        'docs/grammar/g01-d8-falsification-result.md',
        'docs/grammar/g01-d9-held-out-validation.md',
        'docs/grammar/g01-d10s-validation-result.md',
        'docs/grammar/g01-d13-adversarial-closeout.md'
      ]
    }
  },
  {
    id: 'reference-house',
    name: 'Reference House',
    maturity: 'M3',
    reviewedOn: '2026-10-19',
    currentState:
      'RH-00 through RH-10 remain coordinated at virtual-design scope and RH-11 remains issue-ready. HFI-RW-01 has deliberately rewound the principal stair from 280 mm to the project-preferred 300 mm going while preserving the shell, courtyard, programme and circulation topology; the HFI review handoff is integrated without claiming external validation.',
    nextGate:
      'Issue RH-11 packages, resolve material reviewer findings through the owning RH gates, progress P03/P04 validation, and retain the explicitly unresolved HFI handoffs for finished interfaces, real-site access, stairlift compatibility, future lift provision and laundry topology with their downstream owners.',
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
        'docs/reference-house/envelope-coordination-rh10.md',
        'docs/reference-house/model-baseline-rhc0.md',
        'project/hfi/hfi-08b-rh03-stair-rewind.md'
      ]
    }
  },
  {
    id: 'physical-prototypes',
    name: 'Physical prototypes',
    maturity: 'M2',
    reviewedOn: '2026-10-12',
    currentState:
      'The validation programme is defined but no physical result has yet been recorded; after RH-09/RH-10, P03 floor-edge and P04 wall/ceiling-joint evidence are the Reference House priorities, while P01 W2 remains an optional challenger and P02 is not a current house dependency.',
    nextGate:
      'Engineer and test P03 structural floor edge, then build/test P04 wall/ceiling joint; continue P01 W2 only as optional research where resources justify it.',
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
      'RH-11 now provides issue-ready structural, fire/building-control, MEP/acoustic and building-physics/energy review briefs with explicit rewind criteria; no competent review response has yet been recorded.',
    nextGate:
      'Obtain and process competent discipline reviews; material findings reopen the owning Reference House gate and remain unresolved until closure evidence is recorded.',
    evidence: {
      framed: [
        'docs/reference-house/external-review-brief.md',
        'docs/reference-house/external-review-regulatory-baseline-rh11.md',
        'docs/computational/external-review-pack-h1-paper-v02.md'
      ]
    }
  },
  {
    id: 'computational-track',
    name: 'Computational track',
    maturity: 'M4',
    reviewedOn: '2026-10-19',
    currentState:
      'The bounded Reference House executable sequence remains closed PASS through RH-C5 and CH-00 through CH-08 remain complete. The intentional HFI stair rewind has propagated through the controlled semantic source and deterministic projections; RH-C5 now checks the selected 300 mm going while HFI-09C/09D explicitly refuse to turn that project preference into a universal human-factors or statutory rule.',
    nextGate:
      'Hold this bounded compiler as the controlled baseline. There is no standing CH-09 or RH-C6; future computational capability should be demand-led by external review, physical validation, DPL target/site work, a real project, newly authoritative inputs or another concrete proof family. M5 requires appropriate external validation of the computational proposition at its stated scope.',
    evidence: {
      framed: ['docs/computational/executable-architecture.md'],
      developed: ['compiler/p0/p0.test.ts'],
      coordinated: [
        'docs/computational/p0-pat-xw-01-result.md',
        'docs/reference-house/model-baseline-rhc0.md',
        'docs/reference-house/rhc1-drawing-parity-result.md',
        'docs/computational/compiler-generality-assurance-cf01.md',
        'docs/computational/reference-house-executable-slice.md',
        'docs/computational/compiler-hardening-programme.md',
        'compiler/ch00/README.md',
        'compiler/ch01/README.md',
        'compiler/ch02/README.md',
        'compiler/ch03/README.md',
        'compiler/ch03/ch03.test.ts',
        'compiler/ch04/README.md',
        'compiler/ch04/ch04.test.ts',
        'compiler/ch05/README.md',
        'compiler/ch05/ch05.test.ts',
        'compiler/ch06/README.md',
        'compiler/ch06/ch06.test.ts',
        'compiler/ch06/geometry-positive.test.ts',
        'compiler/ch07/README.md',
        'compiler/ch07/ch07.test.ts',
        'compiler/ch08/README.md',
        'compiler/ch08/ch08.test.ts',
        'compiler/README.md',
        'compiler/core/identity.ts',
        'compiler/reference-house/identity.ts',
        'compiler/reference-house/system-compile.ts',
        'compiler/reference-house/reference-house.test.ts',
        'compiler/reference-house/drawings.test.ts',
        'compiler/cf01/cf01.test.ts',
        'compiler/rhc2/rhc2.test.ts',
        'compiler/rhc2/drawing.test.ts',
        'compiler/rhc3/rhc3.test.ts',
        'compiler/rhc3/hardening.test.ts',
        'compiler/rhc3/drawing.test.ts',
        'compiler/rhc4/rhc4.test.ts',
        'compiler/rhc4/occurrence.test.ts',
        'compiler/rhc4/drawing.test.ts',
        'compiler/rhc5/rhc5.test.ts'
      ],
      internallyValidated: [
        'compiler/ch00/reference-house-baseline.test.ts',
        'compiler/ch01/ch01.test.ts',
        'compiler/ch02/architecture.test.ts',
        'compiler/ch03/ch03.test.ts',
        'compiler/ch04/ch04.test.ts',
        'compiler/ch05/ch05.test.ts',
        'compiler/ch06/ch06.test.ts',
        'compiler/ch06/geometry-positive.test.ts',
        'compiler/ch07/ch07.test.ts',
        'compiler/ch08/ch08.test.ts',
        'project/hfi/hfi-09c-computational-admission.md',
        'project/hfi/hfi-09d-regression-locks.md'
      ]
    }
  },
  {
    id: 'evidence-research',
    name: 'Evidence / precedent research',
    maturity: 'M3',
    reviewedOn: '2026-10-12',
    currentState: 'Major evidence packages exist and taxonomy ambiguities are largely closed.',
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
    maturity: 'M4',
    reviewedOn: '2026-10-21',
    currentState:
      'PR-00, PR-01, PUB-SAN and PUB-NOM remain complete. DRW is fully closed and frozen through its final integration/physical-proof programme; the controlled architectural drawing family is released at the existing internal publication proof boundary without inventing construction or site authority.',
    nextGate:
      'Proceed to PR-02 private physical-object production without reopening frozen drawing authority by preference. PR-03/PR-04 then provide the independent critical cycle required before M5 or public release. Any later DPL-earned drawing duty requires an explicit DRW reopen or separately owned post-DRW representation authority.',
    evidence: {
      framed: ['docs/manuscript/publication-architecture.md'],
      developed: ['publication/publication.ts'],
      coordinated: [
        'publication/pr00h-candidate-book-freeze.md',
        'publication/pr01-r8f-local-findings-constitution-climate.md',
        'docs/publication/architectural-drawing-programme.md',
        'docs/publication/architectural-drawing-execution-plan.md'
      ],
      internallyValidated: [
        'publication/pr01-r7-findings-freeze.md',
        'publication/pr01-r9-reproof-refreeze.md',
        'docs/publication/resolved-work-sanitation-closeout.md',
        'docs/publication/nomenclature-closeout.md'
      ]
    }
  },
  {
    id: 'deployment-real-site',
    name: 'Deployment / real-site integration',
    maturity: 'M3',
    reviewedOn: '2026-10-22',
    currentState:
      'Wave C is complete and DPL is coordinated at its current bounded scope. DPL-12A now executes one deterministic deployment-case ledger across controlled Reference House identity, genuine real-site evidence, the first England technical target, London strategic planning, mixed method classes, evidence lifecycle and cross-target edges. DPL-08C/09C add a coherent water/drainage vertical, DPL-10C proves the first borough plug-in, and DPL-14C expands the controlled corpus to eight sites across seven boroughs. Candidate/conformance routing and full Wave-C runtime composition remain deliberately absent.',
    nextGate:
      'Execute bounded Wave D only: DPL-12B authored candidate + Reference House conformance orchestration and DPL-10D Bromley adversarial replay may proceed laterally; DPL-12C then composes the landed Wave-C water, borough and eight-site corpus objects through the runtime; DPL-D re-tests admission of DPL-13. Whole-site compatibility remains forbidden until candidate/conformance, due-obligation completeness and route-exhaustion semantics are explicitly earned.',
    evidence: {
      framed: ['project/dpl/deployment-programme.md'],
      developed: [
        'project/dpl/dpl-01-deployment-ontology.md',
        'project/dpl/dpl-02-reference-house-conformance.md',
        'project/dpl/dpl-03-assurance-result-semantics.md',
        'project/dpl/dpl-04-compilation-maturity.md',
        'project/dpl/dpl-05-target-stack-model.md',
        'project/dpl/dpl-06-site-manifest-model.md',
        'project/dpl/dpl-foundation-coherence-review.md',
        'project/dpl/dpl-08b-ground-datum-plinth-approach-interface.md',
        'project/dpl/dpl-09b-structure-ground-moisture-materials.md',
        'project/dpl/dpl-10b-london-strategic-residential-design.md',
        'project/dpl/dpl-14b-three-site-real-corpus-pilot.md'
      ],
      coordinated: [
        'project/dpl/dpl-12a-minimal-orchestration.md',
        'compiler/dpl/compile.ts',
        'project/dpl/dpl-08c-foul-surface-site-water-interface.md',
        'project/dpl/dpl-09c-england-drainage-waste-water.md',
        'project/dpl/dpl-10c-croydon-planning-plugin.md',
        'project/dpl/dpl-14c-five-site-gap-correction.md',
        'project/dpl/dpl-wave-c-integration-maturity-review.md'
      ]
    }
  },
  {
    id: 'delivery',
    name: 'Delivery',
    maturity: 'M2',
    reviewedOn: '2026-10-19',
    currentState:
      'The implementation-brief structure exists and N17 now carries complete-action / finished-interface human-factors verification into RIBA 3/4 as appropriate, but downstream delivery requirements remain intentionally incomplete.',
    nextGate:
      'Populate only as architectural, DPL, professional-review and physical-validation decisions mature; delivery must remain a consequence of controlled architecture rather than a second source of doctrine.',
    evidence: {
      framed: ['docs/delivery/README.md'],
      developed: [
        'docs/delivery/riba-implementation-brief-template.md',
        'docs/delivery/human-factors-verification-requirements.md'
      ]
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
    'Ovid’s House uses a **project-specific maturity model**. It is not a RIBA Plan of Work stage, BIM level-of-detail convention, Technology Readiness Level or other external industry standard. The codes use **M** for maturity so they are less likely to be mistaken for those systems.',
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