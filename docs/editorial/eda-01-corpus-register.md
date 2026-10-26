# EDA-01 — Corpus and prose-mode register

**Status:** CLOSED — register established  
**Programme:** [EDA — Editorial Doctrine Audit](eda-programme.md)  
**Audit standard:** Editorial Doctrine v0.4, blob `30fb6b2d67c356664430bca4996e38898ce91084`  
**Repository baseline:** `770f4cb9f0a579b6a58c9da12e1d0f9d60a5f08d`  
**Mechanical Working Edition / Primer manifest:** `publication/publication.ts`, blob `8f865514141c57d0b4ae92ae4deda1b2a04deaad`  
**Public website boundary:** `project/public-surface.ts`, blob `cb1f259565071747ab856c11e0b032c497f6f03f`  
**Publication-structure authority:** `docs/manuscript/publication-architecture.md`, blob `93e08e42025c947a6bffc33984850cfd42c5ea99`

---

## 1. Result

EDA-01 establishes the corpus that EDA will audit and gives every in-scope surface an editorial owner, prose mode and audit disposition.

The register deliberately does **not** duplicate every file already owned by a stronger mechanical manifest. The Working Edition and Primer memberships come from `publication/publication.ts`; the broader website membership comes from `project/public-surface.ts`. This document owns only the editorial classification placed on those existing sets.

The scope is broader than the printed book because the project also presents current architectural, evidential, Reference House and computational material on the public website. It is narrower than the repository because development history, migration records, gate records, editorial controls and other internal provenance are not reader-facing prose merely because they are retained in Git.

No new prose mode is required. The six modes in Editorial Doctrine v0.4 are sufficient when applied by function rather than directory name.

---

## 2. Dispositions

Every in-scope surface receives one of four dispositions.

### A — full EDA / PR-02 blocking

Text that enters the Working Edition. It receives the complete EDA sequence, including staged-significance review, whole-book recurrence review and fixed-layout proof. A material unresolved defect blocks EDA close and therefore PR-02 manufacture.

### B — canonical-source audit / derived rendering inherits

Text that is deterministically adapted into another reader surface. Audit the canonical source once under its assigned mode. The derived rendering does not become a second prose authority, but EDA-08 still inspects the rendered result for page-level staging or adaptation artefacts.

### C — full EDA / public web

Current external-reader material exposed by the public website but not part of the Working Edition. It receives sentence/paragraph/section conformance review and the later adversarial read. It is not allowed to retain obvious Editorial Doctrine failures merely because it is outside the book.

### D — excluded from EDA prose conformance

Internal provenance, development history, programme/gate administration, generated machine records not intended as authored prose, and other surfaces excluded by the canonical public-surface boundary. They remain subject to epistemic and repository controls, not publication voice polishing.

---

## 3. Prose-mode key

The register uses the six modes already defined by Editorial Doctrine v0.4:

- **M1 — Preface / authorial essay**
- **M2 — Governing doctrine**
- **M3 — Technical explanation**
- **M4 — Pattern catalogue**
- **M5 — Reference House**
- **M6 — Research and evidence notes**

A source is assigned by its editorial job, not by the folder in which it happens to live. Composite publication entries inherit the mode of embedded canonical sources where the adapter inserts them.

---

## 4. Working Edition — disposition A unless marked B

Membership is exactly `publicationEntries` plus adapter dependencies from `publication/publication.ts` / `publication/adapters.ts` at the baseline above. If that manifest changes before EDA close, this register must be reconciled before the new text can be treated as audited.

| Surface / manifest family | Editorial owner | Mode | Disposition | Audit note |
|---|---|---:|---|---|
| `docs/manuscript/preface.md` | manuscript / Preface | M1 | A | Highest-rhetoric calibration surface; EDA-03 first target. |
| `docs/manuscript/readers-guide.md` | manuscript / reader orientation | M3 | A | Explain authority and evidence plainly; low appetite for aphoristic staging. |
| `docs/manuscript/part-i.md` | manuscript / Part I | M1 | A | Authorial argument and historical/intellectual framing. Embedded constitution material is audited under its own source mode below. |
| `docs/manuscript/governing-principles.md` | manuscript / governing constitution | M2 | B | Canonical dependency inserted into Part I. Audit source once; print adaptation inherits. |
| `docs/manuscript/principle-08-repose.md` | manuscript / Principle 8 | M2 | B | Canonical governing-doctrine dependency inserted into Part I. Evidence qualification must survive compression. |
| `docs/manuscript/part-ii.md` | manuscript / Part II | M3 | A | Mechanism-first architectural explanation. |
| `docs/manuscript/maintenance-geography-external.md` | manuscript / maintenance geography | M3 | B | Canonical dependency inserted into Part II. |
| `publication/part-iii.md` | publication / Part III wrapper | M4 | A | Pattern-language entry and generative-sequence framing; low rhetoric. |
| 21 active pattern sources selected by `publicationEntries` | canonical pattern records | M4 | A | Each pattern audited as usable architectural response, not sales copy. |
| 3 strategy sources selected by `publicationEntries` | pattern strategies | M4 | A | Same low-rhetoric comparative discipline as patterns. |
| 4 held-candidate sources selected by `publicationEntries` | pattern candidates | M4 | A | Must retain unresolved/admission status; prose must not promote candidates by tone. |
| `docs/manuscript/part-iv.md` | manuscript / Reference House | M5 | A | Project-specific, accountable, materially specific. |
| `docs/manuscript/part-v.md` | manuscript / Part V | M3 | A | Testing, assembly, stewardship and implementation mechanisms. |
| `docs/manuscript/evidence-and-precedent-notes.md` | manuscript / Appendix A | M6 | A | Evidence-sensitive; accuracy outranks literary finish. |
| `docs/manuscript/research-agenda.md` | manuscript / Appendix B | M6 | A | Open questions must remain genuinely open. |
| `docs/manuscript/reference-house-implementation-schedule.md` | manuscript / Appendix C | M5 | A | Project-bound implementation/proof boundary; do not universalise. |
| `docs/manuscript/glossary.md` | manuscript / Appendix D | M6 | A | Definitional neutrality; no decorative synonymy. |
| `docs/manuscript/sources-and-further-reading.md` | manuscript / Appendix E | M6 | A | Reference function dominates voice. |

### Working Edition ownership invariant

Publication adapters may change headings, remove internal provenance or compose canonical sources, but they do not own architectural prose. EDA repairs the canonical source wherever possible. Publication-only wording is edited only where the wording itself is genuinely owned by the wrapper or adapter.

---

## 5. Primer

The Primer is reader-facing and therefore in EDA scope, but it must not become a second doctrine.

| Surface | Editorial owner | Mode | Disposition | Audit note |
|---|---|---:|---|---|
| `publication/primer/proposition.md` | Primer authored edge | M1 | C | Short authorial route into the proposition; audit directly. |
| `docs/manuscript/governing-principles.md` via `primer-principles` | canonical constitution | M2 | B | Inherits the canonical-source audit; adapter compression checked for distortion. |
| `docs/patterns/README.md` + representative pattern dependencies via `primer-patterns` | canonical pattern language | M4 | B | Audit canonical sources; inspect derived compression for accidental promotion or flattening. |
| `docs/reference-house/README.md` via `primer-reference-house` | canonical Reference House overview | M5 | B | Audit canonical source; adapter may not turn project choice into doctrine. |
| `publication/primer/outlook.md` | Primer authored edge | M3 | C | Making/testing explanation; direct audit. |

EDA-08 inspects the Primer as a rendered object only if it remains a current external-reader artefact at EDA close. The Working Edition remains the PR-02 blocking physical object.

---

## 6. Public website — disposition C unless already A/B

Website membership is whatever `isPublicSource()` in `project/public-surface.ts` admits at the point of audit. Files already audited as Working Edition or canonical dependencies are **not** rewritten a second time; their website rendering inherits the source audit.

The rules below are ordered. The first matching row controls the mode. This makes every current public Markdown surface classifiable without copying the public-source manifest into a second hand-maintained file list.

| Membership rule | Editorial owner | Mode | Disposition | Notes |
|---|---|---:|---|---|
| `README.md`, `docs/reading-guide.md`, `docs/manuscript/README.md` | public orientation | M3 | C | Explain project and reading paths without manifesto inflation. |
| Working Edition / canonical dependency source | owning manuscript/pattern source | as §4 | A/B | Audit once at source. |
| `docs/patterns/README.md`, `docs/patterns/language-model.md`, `docs/patterns/service-topology-sequence.md` | pattern language | M4 | C | Pattern-language explanation should remain inspectable and low-rhetoric. |
| public `docs/patterns/*.md`, `docs/patterns/strategies/**`, `docs/patterns/candidates/**` | canonical pattern / strategy / held candidate | M4 | A or C | Publication-selected records are A; website-only current records are C. Retired/pilot/history paths are excluded upstream by `public-surface.ts`. |
| `docs/grammar/README.md`, `docs/grammar/architectural-grammar-and-proportion.md`, `docs/grammar/g01-v0.1.md`, `docs/grammar/g01-grammar-charter.md` | grammar framework / current specification | M3 | C | Explain a bounded grammar; no false universality or historical cosplay. |
| other public `docs/grammar/**` including precedent cases, corpus, annotation and derivation evidence | grammar evidence | M6 | C | Evidence-sensitive; permit dullness where it protects provenance and scope. |
| public `docs/reference-house/**` | Reference House | M5 | C | Project-specific technical and architectural account. Generated inspection prose that is machine-owned is reviewed for reader clarity but not stylistically rewritten at the output layer. |
| `docs/reference-house/external-review-brief.md` | Reference House evidence/review boundary | M6 | C | Review questions and uncertainty, not project narrative. |
| public `docs/research/**` | research / evidence | M6 | C | Evidence status and source quality dominate. |
| public `docs/prototypes/**` | physical testing / evidence | M6 | C | Testable propositions, protocols and results; avoid theatrical certainty. |
| public `docs/delivery/**` | delivery explanation / requirements | M3 | C | Technical requirements and ownership explained sequentially. |
| `docs/computational/prior-art-map.md`, public paths containing `evidence`, and current external-review/evidence-trial surfaces admitted by `public-surface.ts` | computational evidence | M6 | C | Provenance, scope and proof limits first. |
| other public `docs/computational/**` | current computational concepts / semantics | M3 | C | Explain models and obligations without turning the architecture into a software pitch. |

### Website rendering rule

A source can be editorially conformant while its rendered page still manufactures emphasis through theme/layout. EDA-08's fixed-layout requirement applies to print; website-only layout problems are handled during EDA-06/07 by inspecting representative rendered pages where typography materially changes rhetorical force.

---

## 7. Explicit exclusions — disposition D

The following are outside EDA prose-conformance scope unless their public status changes:

- anything excluded by `publicSourceExcludeGlobs` in `project/public-surface.ts`;
- `docs/editorial/**`, including EDA itself;
- `docs/development/**` and publication/development programme records;
- `project/**`, `compiler/**`, `scripts/**` and CI/workflow implementation;
- `STATUS.md` and repository-operational control prose;
- retired pattern identities, pilots and migration aggregates excluded from the public surface;
- superseded Reference House development/gate records excluded from the public surface;
- superseded computational paper-compilation and programme histories excluded from the public surface;
- generated machine artefacts where the text is data projection rather than authored reader prose.

Exclusion does not mean the material may be inaccurate or incoherent. It means EDA's publication voice and rhetorical-conformance machinery is the wrong control for it.

---

## 8. Mixed and generated surfaces

### Composite parts

Part I and Part II are mechanically composed for print. Their embedded canonical dependencies keep their own modes. This prevents a Part I authorial register from leaking into governing doctrine simply because the files appear on adjacent pages.

### Generated inspection

Generated Reference House or computational inspection pages may be public while being machine-owned. EDA may flag headings, labels or explanatory framing that obstruct readers, but it must fix the owning generator/semantic source rather than hand-polish generated output.

### Figures and captions

Reader-facing authored captions, labels and explanatory figure text belong to the prose mode of the surrounding source and are in scope. Pure drawing notation remains primarily under drawing/graphic standards, though corny rhetorical labels are still editorial defects.

### Notes and references

Notes, source annotations and reference prose inherit the mode of the source unless they are functioning primarily as evidence records, in which case M6 governs. Citation mechanics themselves are not rewritten for voice.

---

## 9. Audit order resulting from the register

EDA proceeds in this order:

1. **EDA-02 mechanical candidate scan** across all A and C authored prose, using B sources at their canonical location and ignoring D.
2. **EDA-03** Preface, Reader's Guide and other front-matter / M1 high-rhetoric surfaces.
3. **EDA-04** Parts I, II and V plus M2/M3 manuscript material.
4. **EDA-05** patterns, strategies, candidates, Reference House, technical/public web and M6 evidence surfaces.
5. **EDA-06** whole-book and cross-site recurrence/dynamic-range review.
6. **EDA-07** adversarial cold read.
7. **EDA-08** fixed-layout Working Edition proof and final closeout.

Publication-critical A surfaces take precedence if parallel programme work changes the corpus while EDA is running.

---

## 10. Drift and reclassification rules

EDA-01 is a register, not a freeze on the rest of the project.

Before any later EDA gate closes:

- if `publication/publication.ts` adds or removes a Working Edition or Primer entry, classify the changed surface before accepting the gate;
- if an adapter gains a new canonical prose dependency, classify that dependency before accepting the gate;
- if `project/public-surface.ts` changes public membership, classify the newly public surface before accepting the gate;
- if a source's function changes materially, reclassify its prose mode rather than forcing it through the old one;
- if a generated surface begins carrying authored explanatory prose, promote that authored layer into the register rather than treating it as machine output.

No source becomes EDA-conformant merely because it matches a path rule. The rule assigns the audit mode; later gates establish conformance.

---

## 11. Gate result

EDA-01 passes.

Every current reader-facing prose surface has an owning membership authority, a prose-mode rule and an audit disposition. The Working Edition is fully identified through its existing mechanical manifest and dependencies; the Primer has no independent doctrine layer; and the broader public website is covered by ordered functional rules tied to the existing public-surface boundary.

The register intentionally makes **no conformance claim** about the prose itself.

**Next:** EDA-02 — mechanical candidate scan.