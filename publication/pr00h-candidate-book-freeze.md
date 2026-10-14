# PR-00H — Candidate-Book Freeze

**Status:** FROZEN CANDIDATE — PR-00 COMPLETE  
**Date:** 2026-10-14  
**Parent:** PR-00 — Candidate-Book Freeze Execution Programme  
**Umbrella issue:** #71 — PUB-01 publication credibility and release programme

PR-00H freezes one exact candidate book for PR-01 adversarial review. The freeze is a versioned review boundary, not a claim that the work is correct, externally validated or ready for public release.

> **The object is now stable enough to attack fairly.**

## 1. Frozen candidate identity

The candidate book content is frozen at the **PR-00G merge commit**:

`f6b286e883f24b322f41f85d8d3ad796b103a53d`

PR-00H itself adds control/status records after that commit. Those records are deliberately outside the publication manifest and do not alter the frozen book content.

Publication identities at the frozen candidate:

- publication architecture: **Ovid’s House — Publication Architecture v0.14**;
- publication architecture blob: `99cf66b703633439f689eb3c18415fa428d58f12`;
- mechanical publication manifest: `publication/publication.ts`;
- manifest blob: `a0bda5f689cd9ce771a73a17b67968ef1905e471`;
- full-book manifest: **41 deliberate entries**;
- retained principal figures: **D-F01 through D-F11**;
- intentionally omitted standalone figures: **D-F12 and D-F13**.

## 2. Frozen proof artifact

PR-00G rendered and inspected the full candidate before freeze.

Proof identity:

- file: `ovids-house.pdf`;
- page count: **212**;
- build source head: `325b1b940544a0cacb75597de3b71147ab97148d`;
- successful workflow run: `38607568015`;
- artifact digest: `sha256:6b57e4b83f5dabcfadad948c7afb799ba067238e80d82cda97232a7346ddd273`;
- renderer: Vivliostyle.js 2.45.1 / Chrome 153;
- page size: A4.

The later PR-00G commits changed only the PR-00G control record and removed temporary CI artifact-upload machinery. They did not change publication prose, figures, adapters, manifest or theme. The inspected artifact therefore represents the frozen candidate book content.

PR-00G found no freeze-blocking pagination, figure, clipping, glyph, table or structural-layout defect.

## 3. What is frozen for PR-01

For the purpose of adversarial review, PR-01 must treat the following as one controlled object rather than a moving target:

- Preface and Reader’s Guide;
- Parts I–V;
- the eleven governing principles as published;
- the canonical 21-pattern language as represented in Part III;
- three strategies and four held candidates in their current status;
- G-01 v0.1 as the grammar authority used by the book;
- the six-chapter Reference House publication synthesis;
- retained appendices A–F;
- the D-F01→D-F11 visual argument;
- the current evidence / maturity boundaries;
- current terminology: Ovid’s House, House Kernel and Metamorph Compiler.

The freeze does **not** convert any of those into external proof.

## 4. Explicit maturity boundaries at freeze

The book is internally controlled as a publication object, while the work it describes remains at different maturities.

- **Public architectural position:** M3 — coordinated; not independently validated as a whole architectural proposition.
- **Pattern language:** M4 — internally validated / controlled at current scope.
- **Architectural grammar framework:** M3.
- **G-01 v0.1:** M4 at its bounded Georgian-derived scope.
- **Reference House:** M3 at coordinated virtual-design scope.
- **Physical prototypes:** M2; P03 and P04 remain unresolved evidence obligations.
- **External professional review:** M1; no competent discipline-review response has yet been resolved.
- **Computational track:** M4 at bounded proof scope; not proof of physical, regulatory or whole-building adequacy.
- **Publication:** promoted by PR-00H to M4 at **candidate-book / internal-review scope only**.

Publication M4 means the book has survived structured internal completion, authority reconciliation, visual-argument review, whole-book editorial hardening, integrity checks and an inspected print proof, and is stable enough to act as the controlled baseline for PR-01. It does **not** mean the architectural thesis is externally validated or the book is release-ready. Publication M5 remains downstream of appropriate independent criticism / release evidence.

## 5. Retained research debt

The candidate deliberately freezes with visible unresolved work rather than manufacturing completeness.

### Architectural / grammar

- G-01 v0.1 has stronger positive specificity at body/elevation/threshold scale than in Georgian-derived internal-plan morphology.
- The architectural grammar framework has not yet demonstrated neutrality across a materially different second grammar.
- The Reference House remains one worked interpretation, not proof of doctrine, patterns or grammar quality.

### Engineering / physical

- P03 structural floor-edge engineering and physical validation remain open.
- P04 wall/ceiling movement-junction comparison remains open.
- Structural capacity, connection design, robustness, vibration/deflection and foundation adequacy remain specialist obligations.
- Product-level window, threshold and envelope-interface development remains open.

### Environment / services

- Real-site environmental modelling, planning constraints and site-specific drainage remain open.
- U-values, thermal bridges, condensation risk, rainwater capacity and MEP sizing are not established by the bounded compiler.
- Long-duration construction, maintenance and occupation evidence does not yet exist.

### External review

- RH-11 review packages are issue-ready, but competent structural, fire/building-control, MEP/acoustic and building-physics/energy findings have not yet been received and resolved.

These are evidence boundaries and future work, not reasons to keep the publication structurally fluid during PR-01.

## 6. Accepted non-blocking publication defects / choices

The following are explicitly accepted at freeze:

- the internal candidate proof calls itself **Working Edition** and carries date/revision provenance;
- the internal proof includes the live project URL; this is not authority for the later private physical-object treatment;
- the candidate is 212 A4 pages; earlier ~400-page expectations were production-planning assumptions, never a manuscript quota;
- D-F12 future-intervention scenarios remain prose rather than a forced common diagram;
- D-F13 evidence/maturity visualisation remains omitted because the table/prose is clearer;
- low-level PDF name-token warnings observed during proof inspection produced no visible content/rendering defect and are not freeze blockers.

The later PR-02 private edition retains separate physical-design authority, including the already-recorded stripped-object posture.

## 7. Freeze semantics

### Allowed without breaking this candidate revision

Only argument-neutral corrections may be made while retaining the same candidate identity for review:

- spelling or grammar corrections;
- broken-link, caption or reference repairs;
- typographic defects;
- accessibility/metadata repairs that do not alter the argument;
- other changes demonstrably incapable of changing a PR-01 reader’s substantive judgement.

Any such correction must be logged against the freeze.

### Breaks the freeze

The candidate revision is broken and must be re-frozen if any of the following occurs:

- adding, removing or materially changing a governing principle;
- adding/removing a canonical pattern or promoting/demoting a held candidate in a way relevant to the book;
- materially changing a major architectural proposition;
- substantially restructuring chapters or Parts;
- changing Reference House architecture in a way material to the publication;
- changing G-01 rules or the grammar scope used by the book;
- materially changing evidence or maturity boundaries;
- adding a major new research claim;
- materially changing the principal visual argument;
- changing Publication Architecture v0.14 in a way that alters the reviewed object.

PR-01 is expected to break the freeze where it finds real defects. That is the purpose of the review.

## 8. Reopen protocol during PR-01

A PR-01 finding must be classified before the candidate moves:

- **PUBLICATION DEFECT** — fix in manuscript/figure/integrity layer;
- **QUALIFICATION** — narrow or clarify a claim without changing upstream architecture;
- **MATERIAL ARCHITECTURAL FINDING** — reopen the owning doctrine/pattern/grammar/Reference House workstream;
- **EVIDENCE FINDING** — reopen the owning evidence/prototype/review obligation;
- **OUTSIDE REVIEW SCOPE** — record without forcing change.

Substantive changes produce a new candidate revision and a new freeze identity. Do not quietly mutate the object under review.

## 9. PR-00 result

**PR-00 — PASS.**

The candidate now has:

- complete publication-native Parts I–V;
- publication-native Part III framing and Part IV synthesis;
- retained back matter authored and integrated;
- reconciled authority / claim / evidence boundaries;
- eleven bounded principal figures;
- whole-book editorial hardening;
- fail-closed nomenclature / provenance / figure integrity checks;
- one inspected 212-page candidate print proof;
- one exact frozen candidate content commit.

This is **not a release decision**.

The next programme is **PR-01 — internal adversarial review**: attack the frozen candidate for where it is wrong, weak, derivative, naïve, overstated, incomplete, inconsistent or unmemorable, including hostile-architect and steelman-opposition passes.