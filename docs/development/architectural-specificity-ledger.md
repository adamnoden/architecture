# Architectural Specificity Audit — Claim Ledger

**Status:** active; Phases 0–4 audited, repairs in progress  
**Control:** [Architectural Specificity Audit — Programme Control](architectural-specificity-audit.md)  
**Governing rule:** [Architectural Specificity Boundary](architectural-specificity-boundary.md)

This ledger records material scope findings. It deliberately does not list every benign reference to masonry, cornices, Georgian precedent or the Reference House. An example is not contamination merely because it is specific.

## Gate record

| Gate | State | Result |
|---|---|---|
| 0 — baseline / canonicality | PASS | Active doctrine, pattern, computational, Reference House, research, development and provenance roles are distinguishable. Frozen v7 remains provenance. |
| 1 — upstream purity | PASS WITH REPAIRS | Governing principles, 21 active patterns, three strategies and held candidates are portable. A small number of manuscript passages use construction/tectonic examples too generically. |
| 2 — computational authority | PASS WITH ONE NAMING REPAIR | Core semantics, validity model and H1 domain distinguish doctrine, grammar, technical support and project authority. G-01 research still carries legacy `Long-Life House grammar` naming despite already arguing for separation internally. |
| 3 — prototype / evidence authority | REPAIR REQUIRED | P01 general evidence protocol is style-neutral, but prototype programme/build pack mix general promotion evidence with a Georgian Reference House fit criterion. |
| 4 — Reference House / G-01 | PASS WITH CLARIFICATION | Current material already separates G-01, courtyard morphology and tectonic dialect conceptually. Reference House index should make the composition/authority stack explicit enough to govern future work. |
| 5 — cross-layer repair | IN PROGRESS | Apply the repairs below, then verify. |
| 6 — adversarial verification | PENDING | Run materially different grammar and technical-family tests after repairs. |
| 7 — publication/status reconciliation | PENDING | Update project status and close audit after verification. |

## Material findings

| ID | Document / location | Finding | Proper scope | Disposition | Status |
|---|---|---|---|---|---|
| AS-001 | `docs/source/house-design-doctrine-v7.md` | Frozen source contains explicit Georgian/classical preferences inside what was then called doctrine. | G — provenance | ARCHIVE | VERIFIED — do not rewrite. |
| AS-002 | `docs/manuscript/governing-principles.md` | Current public doctrine contains no Georgian requirement; repose, tectonic honesty and passive-first are stated independently of style. | A — HSA general | KEEP | VERIFIED |
| AS-003 | `docs/manuscript/part-i.md` — temporal bands / permanent fabric | `major masonry` appears in generic examples of long-lived/permanent fabric. This is an example, not a stated requirement, and Part I later explicitly says doctrine survives a modern rather than Georgian project. | A with example | KEEP | VERIFIED — no rewrite warranted. |
| AS-004 | `docs/manuscript/part-i.md` — designed interfaces | Cornice, architrave, threshold and masonry-window examples illustrate a general interface principle; text explicitly says visible expression is optional. | A with examples | KEEP | VERIFIED |
| AS-005 | `docs/manuscript/part-ii.md` — tolerance / tectonic honesty | Traditional joinery and classical-element examples are used illustratively; Part II explicitly labels the Reference House language a project choice rather than doctrine. | A with examples | KEEP | VERIFIED |
| AS-006 | `docs/manuscript/part-v.md` — permanent construction | `primary masonry` is named as though naturally part of the generic permanent-construction layer. The actual principle is long-lived primary construction, independent of material family. | A — HSA general | GENERALISE | OPEN REPAIR |
| AS-007 | `docs/manuscript/part-v.md` — deception review | Generic review question asks whether `brass or bronze` performs a genuine function. Functional signalling is general; brass/bronze is the Reference House tectonic dialect. | A + E/F | SPLIT / GENERALISE | OPEN REPAIR |
| AS-008 | `docs/manuscript/preface.md` — authorial material preference | First-person preference for mass, brick, timber, brass and traditional elements expresses the origin/temperament of the enquiry rather than a formal requirement. | G/E — authorial/project context | KEEP | VERIFIED — preface may contain situated preference. |
| AS-009 | all 21 active pattern pages | Canonical pattern invariants are style-portable. Specific forms/materials occur as variants, contextual examples or explicit Reference House applications. | A/B | KEEP | VERIFIED |
| AS-010 | three canonical strategies | Strategies preserve general analytical/lifecycle propositions and explicitly keep seated floors, manifold families, floor systems etc. downstream. | A/B | KEEP | VERIFIED |
| AS-011 | held candidates | Candidate records are explicit about uncertainty, alternatives and conventional comparators; none makes Reference House taste into doctrine. | B/F | KEEP | VERIFIED |
| AS-012 | `docs/computational/formal-architectural-model.md` | Core entity and relationship families are generic. `courtyard`, `masonry`, `drawing room`, W2 and backplane appear as candidate/example/fixture semantics, not mandatory ontology. | A/C | KEEP | VERIFIED |
| AS-013 | `docs/computational/validity-and-obligations.md` | Validity dimensions explicitly separate supported domain, doctrine, technical resolution, grammar and project requirements. G-01 failure means only non-membership in G-01. | A/C/D | KEEP | VERIFIED |
| AS-014 | `docs/computational/supported-domain.md` + H1 matrix | Detached, one/two-storey, cavity-masonry, trussed-roof and other H1 restrictions are competence boundaries; documents explicitly deny architectural universality. | C | KEEP | VERIFIED |
| AS-015 | `compiler/p0/model.ts` | Executable kernel semantics contain no Georgian/classical entities or rules. | A/C | KEEP | VERIFIED |
| AS-016 | `docs/computational/architectural-grammar-and-proportion.md` | Earlier generic grammar paper was contaminated by G-01 assumptions; framework v0.3 has already been repaired to style-neutral machinery with selectable grammar instances. | A/D | GENERALISE | VERIFIED — repaired before this execution phase. |
| AS-017 | `docs/computational/architectural-grammar-modelling-corrections-v01.md` | G-01 case research promotes only representational capabilities upstream and explicitly leaves Georgian rules downstream. | A/D/G | KEEP | VERIFIED |
| AS-018 | `docs/computational/g01-research-brief.md` — title / opening definition | Legacy title says `Georgian-Derived Long-Life House Grammar`; opening definition says the grammar is modified by HSA doctrine, while later sections correctly insist doctrine/grammar/dialect remain separate. Grammar identity should be Georgian-derived domestic architecture; HSA conformance is an overlay/project requirement. | D | SCOPE / GENERALISE NAME | OPEN REPAIR |
| AS-019 | G-01 courtyard / Andalusian sections | Brief explicitly rejects treating courtyard as generic Georgian and keeps Andalusian influence as local dialect. | D/E | KEEP | VERIFIED |
| AS-020 | `docs/prototypes/w2-wall-bay-test-protocol.md` | General evidence criteria are style-neutral: solidity, visual calm, durability, installer robustness, comparison with excellent conventional wall. | F → possible B evidence | KEEP | VERIFIED |
| AS-021 | `docs/development/tectonic-prototype-programme.md` — P01 question | `Does it read as a serious Georgian room?` is mixed into questions used around a prototype that may feed general candidate promotion. This is a legitimate RH fit test but not general evidence. | B/F + D/E | SPLIT | OPEN REPAIR |
| AS-022 | `docs/prototypes/w2-wall-bay-build-pack.md` — prototype question | Build pack begins with `looks like a serious Georgian interior`, while the same specimen generates general system evidence. The physical specimen may be G-01-specific, but its evidence channels need named authority. | F + D/E | SCOPE / SPLIT | OPEN REPAIR |
| AS-023 | `docs/development/tectonic-prototype-programme.md` — P04 | Cornice and brass/bronze variants are valid Reference House tectonic prototypes, not generic HSA requirements. | E/F | SCOPE | OPEN REPAIR |
| AS-024 | `docs/reference-house/README.md` | Correctly says G-01, courtyard morphology and tectonic dialect are project choices; authority composition can be made more explicit for future decisions. | E | SCOPE | OPEN REPAIR |
| AS-025 | `docs/reference-house/tectonic-architectural-language.md` | Explicitly states HSA does not require Georgian architecture, brass or visible joints; the Reference House does. Repose remains style-neutral. | E/F | KEEP | VERIFIED |
| AS-026 | `docs/manuscript/publication-architecture.md` — Part IV | Reference House is explicitly one interpretation, not proof. Part IV can retain architectural specificity; later edits should name selected grammar/project dialect rather than neutralise it. | E | KEEP | VERIFIED |

## Family-level audit result

### Clean upstream

- root project explanation;
- eleven governing principles;
- pattern-language authoring contract;
- all active canonical patterns;
- all canonical strategies;
- held candidates;
- repose evidence architecture;
- formal semantic model;
- validity/obligation architecture;
- supported-domain/H1 competence boundary;
- executable P0 kernel.

These areas should not be rewritten merely to reduce the number of specific examples.

### Repair concentration

The material dependency defects are concentrated in four places:

1. a small amount of generic manuscript wording that names one construction/material family where the reason is general;
2. legacy G-01 naming that still couples grammar identity to HSA despite the body text already separating them;
3. prototype records that use one G-01 Reference House specimen to answer both general-system and target-fit questions without an explicit evidence firewall;
4. Reference House indexing that should state the authority stack explicitly so future project choices do not drift upstream.

That concentration is itself an audit result: the modern project is substantially cleaner than the frozen source from which it grew.
