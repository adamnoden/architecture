# Architectural Specificity Audit — Claim Ledger

**Status:** complete; all material findings dispositioned and verified  
**Control:** [Architectural Specificity Audit — Programme Control](architectural-specificity-audit.md)  
**Governing rule:** [Architectural Specificity Boundary](architectural-specificity-boundary.md)  
**Adversarial verification:** [Architectural Specificity Audit — Adversarial Verification](architectural-specificity-adversarial-test.md)

This ledger records material scope findings. It deliberately does not list every benign reference to masonry, cornices, Georgian precedent or the Reference House. An example is not contamination merely because it is specific.

## Gate record

| Gate | State | Result |
|---|---|---|
| 0 — baseline / canonicality | PASS | Active doctrine, pattern, computational, Reference House, research, development and provenance roles are distinguishable. Frozen v7 remains provenance. |
| 1 — upstream purity | PASS | Governing principles, 21 active patterns, three strategies and held candidates are portable. Manuscript examples are now governed explicitly as examples rather than hidden requirements; Part V material-specific leakage was repaired. |
| 2 — computational authority | PASS | Core semantics, validity model and H1 domain distinguish doctrine, grammar, technical support and project authority. G-01 now has an explicit independent grammar charter; legacy research-brief naming is superseded on identity/authority without cosmetic provenance rewriting. |
| 3 — prototype / evidence authority | PASS | Prototype programme and prototype-area guidance now require separate general-HSA evidence and Reference House/G-01 fit verdicts. |
| 4 — Reference House / G-01 | PASS | Reference House index now names doctrine, patterns, technical families, G-01, site/programme, project morphology, local dialect and tectonic dialect as separate inputs. |
| 5 — cross-layer repair | PASS | Every material finding is repaired, explicitly scoped, kept, or archived. No concept was deleted merely to look neutral. |
| 6 — adversarial verification | PASS | Different architectural-language and technical-family counterfactuals use the same HSA/framework without inheriting G-01/H1 assumptions. |
| 7 — publication/status reconciliation | PASS | Manuscript authoring rule and project status record the durable boundary; no book-structure rewrite was required. |

## Material findings

| ID | Document / location | Finding | Proper scope | Disposition | Status |
|---|---|---|---|---|---|
| AS-001 | `docs/source/house-design-doctrine-v7.md` | Frozen source contains explicit Georgian/classical preferences inside what was then called doctrine. | G — provenance | ARCHIVE | VERIFIED — intentionally untouched. |
| AS-002 | `docs/manuscript/governing-principles.md` | Current public doctrine contains no Georgian requirement; repose, tectonic honesty and passive-first are stated independently of style. | A — HSA general | KEEP | VERIFIED |
| AS-003 | `docs/manuscript/part-i.md` — temporal bands / permanent fabric | `major masonry` appears in generic examples of long-lived/permanent fabric. It is illustrative, and Part I explicitly says doctrine survives a modern rather than Georgian project. | A with example | KEEP | VERIFIED |
| AS-004 | `docs/manuscript/part-i.md` — designed interfaces | Cornice, architrave, threshold and masonry-window examples illustrate a general interface principle; text explicitly says visible expression is optional. | A with examples | KEEP | VERIFIED |
| AS-005 | `docs/manuscript/part-ii.md` — tolerance / tectonic honesty | Traditional joinery and classical-element examples are illustrative; Part II explicitly labels the Reference House language a project choice rather than doctrine. | A with examples | KEEP | VERIFIED |
| AS-006 | `docs/manuscript/part-v.md` — permanent construction | `primary masonry` sat too close to a generic definition of permanent construction. | A — HSA general | GENERALISE | CHANGED — permanent construction is now material-neutral; masonry is explicitly one implementation. |
| AS-007 | `docs/manuscript/part-v.md` — deception review | Generic review asked specifically whether brass/bronze performed a genuine function. Functional signalling is general; brass/bronze belongs to the Reference House dialect. | A + E/F | SPLIT / GENERALISE | CHANGED — general signal/material test upstream; brass/bronze example explicitly scoped to Reference House. |
| AS-008 | `docs/manuscript/preface.md` — authorial material preference | First-person preference for mass, brick, timber, brass and traditional elements expresses origin/temperament rather than a formal requirement. | G/E — authorial/project context | KEEP | VERIFIED — preface may contain situated preference. |
| AS-009 | all 21 active pattern pages | Canonical pattern invariants are style-portable. Specific forms/materials occur as variants, contextual examples or explicit Reference House applications. | A/B | KEEP | VERIFIED |
| AS-010 | three canonical strategies | Strategies preserve general analytical/lifecycle propositions and explicitly keep implementation families downstream. | A/B | KEEP | VERIFIED |
| AS-011 | held candidates | Candidate records are explicit about uncertainty, alternatives and conventional comparators; none makes Reference House taste into doctrine. | B/F | KEEP | VERIFIED |
| AS-012 | `docs/computational/formal-architectural-model.md` | Core entity and relationship families are generic. `courtyard`, `masonry`, drawing-room, W2 and backplane references are candidate/example/fixture semantics, not mandatory ontology. | A/C | KEEP | VERIFIED |
| AS-013 | `docs/computational/validity-and-obligations.md` | Validity dimensions explicitly separate supported domain, doctrine, technical resolution, grammar and project requirements. G-01 failure means only non-membership in G-01. | A/C/D | KEEP | VERIFIED |
| AS-014 | `docs/computational/supported-domain.md` + H1 matrix | Detached, one/two-storey, cavity-masonry, trussed-roof and other H1 restrictions are competence boundaries; documents explicitly deny architectural universality. | C | KEEP | VERIFIED |
| AS-015 | `compiler/p0/model.ts` | Executable kernel semantics contain no Georgian/classical entities or rules. | A/C | KEEP | VERIFIED |
| AS-016 | `docs/computational/architectural-grammar-and-proportion.md` | Earlier generic grammar paper mixed framework and G-01 assumptions. | A/D | GENERALISE | VERIFIED — framework v0.3 is style-neutral with selectable grammar instances. |
| AS-017 | `docs/computational/architectural-grammar-modelling-corrections-v01.md` | G-01 case research promotes only representational capabilities upstream and explicitly leaves Georgian rules downstream. | A/D/G | KEEP | VERIFIED |
| AS-018 | `docs/computational/g01-research-brief.md` — title / opening definition | Legacy `Long-Life House grammar` wording couples grammar identity too tightly to HSA, while the body already separates doctrine/grammar/dialect. | D | SCOPE | CHANGED — `g01-grammar-charter.md` is canonical for identity/authority and supersedes the legacy wording; research brief remains active for corpus/method until substantive editorial revision. |
| AS-019 | G-01 courtyard / Andalusian sections | Brief explicitly rejects treating courtyard as generic Georgian and keeps Andalusian influence as local dialect. | D/E | KEEP | VERIFIED |
| AS-020 | `docs/prototypes/w2-wall-bay-test-protocol.md` | General evidence criteria are style-neutral: solidity, visual calm, durability, installer robustness and comparison with excellent conventional wall. | F → possible B evidence | KEEP | VERIFIED |
| AS-021 | `docs/development/tectonic-prototype-programme.md` — P01 | Georgian room-fit question was mixed into the same question set as general evidence. | B/F + D/E | SPLIT | CHANGED — general evidence questions and Reference House/G-01 fit question now produce independent verdicts. |
| AS-022 | `docs/prototypes/w2-wall-bay-build-pack.md` | The physical specimen is intentionally G-01/Reference-House-specific while also generating general system evidence. | F + D/E | SCOPE / SPLIT | CHANGED — prototype-area rules and programme control now identify P01 as a Reference-House-specific specimen and prohibit its target-fit verdict from promoting general evidence. Build pack retains Georgian criteria because that is what this specimen is meant to build. |
| AS-023 | `docs/development/tectonic-prototype-programme.md` — P04 | Cornice and brass/bronze variants are valid Reference House tectonic prototypes, not generic HSA requirements. | E/F | SCOPE | CHANGED — P04 explicitly labelled Reference House prototype; general interface questions separated from target-fit questions. |
| AS-024 | `docs/reference-house/README.md` | G-01, courtyard morphology and tectonic dialect were correctly called project choices but future decision ownership could be clearer. | E | SCOPE | CHANGED — explicit composition/authority stack added. |
| AS-025 | `docs/reference-house/tectonic-architectural-language.md` | Explicitly states HSA does not require Georgian architecture, brass or visible joints; the Reference House does. Repose remains style-neutral. | E/F | KEEP | VERIFIED |
| AS-026 | `docs/manuscript/publication-architecture.md` — Part IV | Reference House is explicitly one interpretation, not proof. Part IV can retain architectural specificity. | E | KEEP | VERIFIED |

## Family-level result

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

These areas were deliberately **not** rewritten merely to reduce the number of specific examples.

### Repairs made

The audit concentrated repairs in four places:

1. **Manuscript authority** — general prose now distinguishes material-neutral principles from construction examples, and the manuscript has a durable specificity rule.
2. **G-01 identity** — a canonical charter defines G-01 as a Georgian-derived domestic grammar independent of HSA doctrine; HSA conformance is a separate axis.
3. **Prototype evidence** — general HSA evidence and Reference House/G-01 target fit now produce independent verdicts.
4. **Reference House authority** — doctrine, patterns, technical families, grammar, site/programme, courtyard morphology, local dialect and tectonic dialect are explicitly distinct inputs.

## Audit conclusion

The project had less active Georgian contamination than its frozen source suggested.

The modern governing principles and pattern language are already substantially style-neutral. The principal residual risk was **authority drift through the worked example**: repeated use of one Georgian-derived Reference House could allow its construction, composition or prototype-success criteria to acquire accidental general authority.

The durable defence is not lexical neutrality. It is explicit dependency structure:

> **Generalise the reason; localise the taste.**
