# RDM-01 — README inventory, authority and drift audit

## Result

**PASS — the current entry-surface topology is recoverable, but it has outgrown its README layer.**

The repository does not need a blanket documentation rewrite. It needs a bounded information-architecture correction:

1. reconstruct the root `README.md` as a durable repository/project map rather than a partial architectural essay plus an obsolete system diagram;
2. retain local READMEs that genuinely own a subsystem contract, workflow, compatibility boundary or generated-surface warning;
3. narrow READMEs that have accumulated live programme state or duplicate facts owned elsewhere;
4. correct two confirmed stale Reference House stair descriptions downstream of the controlled source;
5. add only those missing entry surfaces whose absence currently hides a real contract or ownership boundary;
6. guard only objective navigation/edit-boundary invariants after the rewrite has settled.

This audit does **not** establish a new project ontology. Where DPL, publication/drawing work or another active programme is still refining an authority boundary, later README work must point to that owner rather than editorially settle it here.

## Baseline and method

Audit lease at write time:

- `main`: `db7dc91cd31260ba0c851afe985003ac787796a5`
- immediate prior audited base: `d6926c9cdc5161152f3e1d68bc74cf9fe39fb442`
- intervening change: DRW-09D only; comparison showed no README or README-like entry surface changed.

The audit inspected the root entry surfaces; every `README.md` found under `compiler/`, `docs/` and `publication/`; the README-like `docs/reading-guide.md`; generated-surface notices; repository commands in `package.json`; and the absence/presence of local entry documents in `project/`, `public/`, `scripts/`, `.github/`, `.vitepress/` and publication-related trees.

Disposition vocabulary is fixed by RDM-01:

- **KEEP** — role is legitimate and the surface is already substantially fit for that role;
- **REWRITE** — role is legitimate but the current contents materially misdescribe or underdescribe it;
- **NARROW** — retain the surface but remove duplicated status/facts or reduce it to its earned local contract;
- **MERGE** — fold the role into another surface;
- **REMOVE** — the surface is an accidental competing entry point with no continuing compatibility role;
- **CREATE** — a missing entry point appears justified by a genuine contract/authority/workflow. `CREATE` remains a candidate until RDM-03 verifies that no existing canonical surface already does the job.

## Recovered authority graph

The current repository already supports the following distinction; README work should expose it rather than replace it.

```text
Ovid's House / public architectural proposition
  ├─ governing architectural argument      docs/manuscript/
  ├─ reusable responses                    docs/patterns/
  ├─ selectable architectural grammar      docs/grammar/
  ├─ evidence / precedent / appraisal      docs/research/
  └─ one coordinated project instance      docs/reference-house/

Executable / inspection system
  ├─ computational research + proof scope  docs/computational/
  ├─ executable implementation             compiler/
  └─ generated semantic inspection         docs/reference-house/generated/

Production / delivery
  ├─ publication & drawing records          docs/publication/
  ├─ publication build machinery            publication/
  └─ appointed-team requirements            docs/delivery/

Repository governance
  ├─ documentation ownership               docs/README.md
  ├─ current project-wide state             STATUS.md
  ├─ agent operating constitution           AGENTS.md
  ├─ machine claim ceiling                  project/authority.ts
  └─ durable programme/audit history         project/
```

DPL adds a distinct target/jurisdiction/site/deployment authority layer between the controlled architectural proposition and eventual real-site deployment. That layer is now first-class programme scope, but its foundation packets are still the owner of its exact model. RDM-02 must make the layer discoverable without pretending that unfinished DPL machinery already exists.

The important negative rule is unchanged: **Reference House choices, compiler representability, generated drawings, publication graphics and project history do not become doctrine merely because they are easier to find.**

## Complete entry-surface inventory

### Repository-level surfaces

| Surface | Class | Audience / job | Authority relationship | State | Disposition |
|---|---|---|---|---|---|
| `README.md` | global repo map + public landing | reader, architect, contributor | paraphrases manuscript/doctrine and points into major areas | durable prose, incomplete topology | **REWRITE** |
| `AGENTS.md` | repository operating constitution | agents/contributors | governs behaviour only; explicitly defers facts/status to owners | durable | **KEEP** |
| `STATUS.md` | current-state index | contributors/maintainers | canonical present-state summary; typed maturity block is generated from `project/maturity.ts` | intentionally live | **KEEP** |
| `docs/README.md` | documentation ownership contract | authors/contributors | owns filesystem-role semantics inside `docs/`; must defer live state and architectural facts | mixes durable ownership with some live summaries | **NARROW** |
| `docs/reading-guide.md` | reader navigation/index | publication reader | reading order/navigation only; not filesystem or architectural authority | durable navigation | **KEEP** |

There is no root `CONTRIBUTING.md` on this baseline. `AGENTS.md` is therefore not duplicating an existing contributor constitution.

### Architectural/documentation subsystem surfaces

| Surface | Class | Owned job | Drift / boundary note | Disposition |
|---|---|---|---|---|
| `docs/manuscript/README.md` | subsystem/nav contract | manuscript/publication-facing corpus | legitimate local index; manuscript remains architectural-argument owner | **KEEP** |
| `docs/patterns/README.md` | subsystem contract | canonical pattern-language structure/status semantics | genuine reusable-knowledge boundary | **KEEP** |
| `docs/patterns/candidates/README.md` | local state/collection contract | held candidate semantics | local lifecycle distinction is material | **KEEP** |
| `docs/patterns/pilot/README.md` | historical/local contract | pilot corpus provenance | history is explicit and locally useful | **KEEP** |
| `docs/patterns/retired/README.md` | historical/local contract | retired-pattern provenance | prevents retired material masquerading as canonical | **KEEP** |
| `docs/grammar/README.md` | subsystem contract | architectural-grammar framework/instances | necessary separation from doctrine/computation | **KEEP** |
| `docs/grammar/g01-cases/README.md` | local corpus contract | G-01 case/evidence collection | genuine case-set boundary | **KEEP** |
| `docs/research/README.md` | subsystem contract | evidence, precedent, appraisal | necessary evidence-vs-doctrine distinction | **KEEP** |
| `docs/reference-house/README.md` | subsystem contract + worked-instance entry | Reference House architecture and proof limits | **confirmed stale stair values: 280 mm prose after controlled 300 mm rewind**; also carries many copied project facts vulnerable to drift | **REWRITE** |
| `docs/reference-house/generated/README.md` | generated-surface notice | semantic inspection outputs | correctly says generated output is not architectural source authority and documents uncertainty/proof boundary | **KEEP** |
| `docs/delivery/README.md` | subsystem contract | translation into appointed-team requirements | role is legitimate; should remain requirement/delivery-specific, not project status | **NARROW** |
| `docs/development/README.md` | historical/project navigation | integration, migration and programme records | area intentionally mixes closed and live controls; local README should explain provenance, not become present-state authority | **NARROW** |
| `docs/editorial/README.md` | local operational contract | editorial controls/modes | legitimate local workflow; architectural claims remain elsewhere | **KEEP** |
| `docs/prototypes/README.md` | subsystem contract | build/test artefacts and evidence | legitimate distinction between planned test and recorded result | **KEEP** |
| `docs/computational/README.md` | subsystem contract + proof boundary | executable-architecture research scope | **confirmed stale 280 mm worked stair example**; duplicates volatile model values that source/status now own | **REWRITE** |
| `docs/computational/g01-cases/README.md` | compatibility landing page | old-link redirect | explicitly states grammar moved and computational track does not own it | **KEEP** |

### Compiler surfaces

`compiler/` is not one README. It has a real hierarchy of executable contracts. The chapter/COA/RH-C READMEs earn their existence because each defines a bounded implementation/proof stage; they are not project-level entry points.

| Surface | Class | Disposition |
|---|---|---|
| `compiler/README.md` | subsystem contract / operational entry | **NARROW** — retain Metamorph/House Kernel boundary, commands and output contract; remove avoidable programme-status duplication |
| `compiler/ch00/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch01/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch02/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch03/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch04/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch05/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch06/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch07/README.md` | local executable/proof contract | **KEEP** |
| `compiler/ch08/README.md` | local executable/proof contract | **KEEP** |
| `compiler/coa00/README.md` | local output/proof contract | **KEEP** |
| `compiler/coa01/README.md` | local output/proof contract | **KEEP** |
| `compiler/coa02/README.md` | local output/proof contract | **KEEP** |
| `compiler/coa03/README.md` | local output/proof contract | **KEEP** |
| `compiler/coa04/README.md` | local output/proof contract | **KEEP** |
| `compiler/coa05/README.md` | local output/proof contract | **KEEP** |
| `compiler/coa06/README.md` | local output/proof contract | **KEEP** |
| `compiler/rhc3/README.md` | local Reference House executable/proof contract | **KEEP** |
| `compiler/rhc4/README.md` | local Reference House executable/proof contract | **KEEP** |
| `compiler/rhc5/README.md` | local selected-calculation/proof contract | **KEEP** |

The absence of a README in every compiler directory is intentional and should remain so. A directory does not earn an entry document merely by containing code.

### Publication/build surface

| Surface | Class | Boundary note | Disposition |
|---|---|---|---|
| `publication/primer/README.md` | local publication artefact/reader contract | primer-specific entry point | **KEEP** |

No top-level `publication/README.md` exists despite `publication/` owning build preparation, validation, metadata, print configuration and specimen proof machinery. No `docs/publication/README.md` exists despite `docs/publication/` now owning a substantial architectural-drawing/publication record family. These are candidates, not automatic omissions; see RDM-03 below.

## Confirmed drift and duplication findings

### F1 — root README topology is now incomplete

The root README still explains the project through a pre-DPL five-stage diagram: foundations → reusable design knowledge → Reference House → testing → outputs. That is no longer sufficient as the repository map. It does not expose the distinct target/jurisdiction/site/deployment layer, the authored/generated split, the compiler/source/output boundary, `project/` as durable history, or publication build machinery.

The prose itself contains useful and still-valid distinctions — notably that the Reference House is not universal and computation is subordinate to architecture. RDM-02 should preserve those truths while making the document much more navigational and less duplicative.

### F2 — `docs/README.md` overclaims whole-repository ownership

`docs/README.md` calls `docs/` the source-of-truth corpus for Ovid's House. That is directionally useful for architectural documents but too broad for the present repository: executable authority lives in `compiler/`, operational commands in `package.json`, agent rules in `AGENTS.md`, current state in `STATUS.md`, production machinery in `publication/`, and programme/audit evidence in `project/`.

The file remains the correct owner of **documentation placement/ownership semantics inside `docs/`**. RDM-03 should narrow the claim rather than delete the document.

### F3 — live status has leaked into otherwise durable subsystem READMEs

`compiler/README.md` includes current CH/COA completion/no-next-packet statements. `docs/README.md` includes current pattern/computational programme summaries. Those facts are legitimate today but already have a status owner. Keeping them copied in durable contract surfaces guarantees future drift.

Rule for RDM-02/03: a local README may state a durable capability/proof boundary and link to current status; it should not maintain a second project-status ledger.

### F4 — two confirmed stale stair descriptions

The controlled present state records the principal Reference House stair at a preferred **300 mm going**, with approximately 183.33 mm rise, 31.43° pitch and 666.67 mm `2R + G` at the current datum. Two READMEs remain on the previous state:

- `docs/reference-house/README.md` says **280 mm planning going**;
- `docs/computational/README.md` gives **280 mm / 33.215° / 646.667 mm** in its worked example.

This is precisely the failure mode the README programme exists to reduce: a correct source and regression chain can coexist with stale explanatory prose.

RDM-01 deliberately does not patch the values. RDM-03 should either derive/link the values or reduce copied numerics to a stable example whose source is explicit.

### F5 — compatibility copies are not competing authority when they say so

`docs/computational/g01-cases/README.md` is a deliberate old-path landing page. It explicitly says architectural grammar moved to `docs/grammar/` and that the computational track does not own it. Its surrounding 308/311-byte compatibility files follow the same migration pattern. This is not duplicate authority and should not be removed merely to make the tree look cleaner.

### F6 — generated inspection surface is already well-bounded

`docs/reference-house/generated/README.md` correctly states that the generated family is a human semantic-inspection surface, not architectural source authority or a construction drawing set, and points to `npm run outputs:check`. No RDM rewrite is justified there.

### F7 — public drawing/publication records have outgrown their missing local entry point

`docs/publication/` contains a large DRW authority/proof record family but is not declared in the `docs/README.md` area table and has no local README. Separately, top-level `publication/` contains the actual print/publication build pipeline and specimen proof machinery but only the primer has a README.

This creates a real discoverability problem: “publication records” and “publication build system” are two different things with nearly identical path names and no local contract explaining the boundary.

RDM-03 should test two **CREATE** candidates:

- `docs/publication/README.md` — if needed to define drawing/publication record ownership and its relationship to source drawings, manuscript and generated outputs;
- `publication/README.md` — if needed to define build inputs, generated intermediates/outputs, edit boundaries, proof commands and the relationship to `docs/publication/`.

Neither should be created if a smaller existing canonical surface can make the boundary unambiguous.

## Navigation findings

1. The root README is a good architectural landing page but a weak repository map. A contributor must already know where authority lives.
2. `docs/README.md` has the strongest existing ownership model, but it stops at `docs/` and omits the now-material `docs/publication/` area.
3. `docs/reading-guide.md` and website navigation are reader structures, not substitutes for repository ownership navigation.
4. The root README should link `AGENTS.md` for operating rules rather than duplicate them.
5. The root README should link `STATUS.md` for present state rather than copy packet progress, issue IDs, hashes or “next” work.
6. Generated Reference House output already has a correct local warning and verification command.
7. Compatibility landing pages with explicit non-authority language are useful navigation, not clutter.

## RDM-02 — frozen root README requirements

RDM-02 may rewrite the root README after this audit closes. It should answer, in this order or an equivalently clear architecture:

1. **What is Ovid's House?** A compact project identity, not a second preface.
2. **What are the major objects/layers?** At minimum distinguish architectural proposition/House Kernel, reusable knowledge, Reference House, evidence, external target/jurisdiction/site/deployment, executable implementation, generated inspection, publication and project history.
3. **What is authoritative for what?** A small authority legend/map with links, not copied doctrine.
4. **Where should I start?** Separate routes for architect/reader, developer/contributor and decision investigator.
5. **What does each top-level repository area do?** Role-based map of `docs/`, `compiler/`, `publication/`, `project/`, `scripts/`, `public/` and repository governance files where material.
6. **What may I edit?** Make source/generated boundaries discoverable, especially Reference House generated outputs and publication artefacts.
7. **How do I verify the repository?** `npm run check` is the canonical repository-health entry point; explain only its bounded meaning and link narrower workflows rather than listing every test.
8. **Where is current state?** Link `STATUS.md`; do not reproduce active packet status.
9. **Where are agent/contributor rules?** Link `AGENTS.md`; do not duplicate the constitution.

The root README must not imply that a compiler target/site/deployment implementation exists before DPL establishes it, and must not imply that passing CI proves architecture, engineering or compliance.

## RDM-03 — subsystem actions and candidates

RDM-03 should work from the dispositions above rather than applying a universal template.

Required actions:

- rewrite stale Reference House and computational entry prose, removing or sourcing duplicated controlled numerics;
- narrow `docs/README.md` to documentation ownership and make `docs/publication/` explicit if that remains a first-class area;
- narrow `compiler/README.md` to durable compiler contract, commands and proof boundaries, with status linked rather than copied;
- narrow `docs/development/README.md` and `docs/delivery/README.md` where live programme prose competes with their durable local roles;
- preserve explicit compatibility redirects and historical/candidate/retired indexes where those states are semantically important;
- evaluate, rather than automatically create, local READMEs for `docs/publication/` and `publication/`;
- do **not** create READMEs for `project/`, `scripts/`, `.github/`, `.vitepress/`, `public/` or every compiler/source directory merely for symmetry.

A subsystem README earns existence when a competent entrant otherwise cannot tell at least one of: what the area owns, what it does not own, which inputs are canonical, which outputs are generated, what may be edited, or how its specific proof boundary is verified.

## RDM-04 — candidate structural invariants

These are candidates only. RDM-04 must decide `GUARD / DO NOT GUARD` against the post-RDM-02/03 tree.

**Likely guardable:**

- repository-relative links in the canonical entry surfaces resolve;
- destinations named by the root repo map exist;
- required generated-surface warning/verification entry remains present where hand-edit risk is material;
- build/verification commands named by README surfaces still exist in `package.json`;
- canonical entry surfaces remain reachable from the root map;
- known compatibility landing pages are not accidentally promoted into primary navigation/authority if an existing deterministic navigation classification can express this cheaply.

**Do not guard as prose:**

- exact headings or paragraph text;
- an exact number of README files;
- current packet names, maturity text or issue IDs;
- architectural completeness or truth;
- whether prose is “good enough”;
- duplicated numeric architectural facts by regex where the real fix is not to duplicate them.

The stale stair examples demonstrate the preferred prevention strategy: reduce hand-copied controlled facts first. A brittle test asserting README prose equals `300` would merely create a second semantic coupling.

## Explicit non-findings

The audit also looked for problems that would have justified broader intervention and did **not** find them:

- no root `CONTRIBUTING.md` competing with `AGENTS.md`;
- no README under `project/`, and no reason to create one merely because that tree is large;
- no README proliferation under `public/`, `scripts/`, `.github/` or `.vitepress/`;
- no evidence that the generated Reference House inspection README invites direct editing or overclaims technical authority;
- no need to collapse compiler chapter/COA READMEs into one file: their local proof contracts are real and bounded;
- no need to delete compatibility landing pages whose non-authority role is explicit;
- no need for RDM to redefine House Kernel, Reference House, architectural grammar, DPL target/site semantics or publication authority from scratch;
- no justification for a generic Markdown-style/lint programme as part of RDM.

## Questions deliberately routed to owning work

RDM-01 does not answer the following because their owners are elsewhere:

- the final DPL target-stack/site/deployment ontology and what becomes executable;
- whether all DRW authority records ultimately remain under `docs/publication/` or are reorganised by their own programme;
- publication/private-object release strategy;
- whether future compiler capabilities warrant new local contracts;
- architectural or regulatory validity of any underlying building proposition.

README work should link the eventual answers; it must not manufacture them.

## Gate to RDM-02 / RDM-03

The audit dispositions are now frozen at this baseline. RDM-02 and RDM-03 are unblocked **after this packet lands on `main`**. They may proceed laterally because one owns the global root map and the other owns subsystem alignment. RDM-04 remains blocked until both have settled, so guards are written against the resulting topology rather than today’s drift.
