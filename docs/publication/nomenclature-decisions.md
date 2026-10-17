<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-02 Identifier Necessity Decisions

**Status:** NOM-02 decision gate frozen; no migration is executed by this record.  
**NOM-01 contract:** `docs/publication/nomenclature-contract.md`  
**Canonical registry:** `project/nomenclature.ts`  
**Baseline register:** `docs/publication/nomenclature-register.md`  
**Tracking issue:** #156  
**Draft PR:** #157

## 1. Decision rule

NOM-02 asks a stricter question than whether a code is technically valid:

> **Would a cold reader lose useful meaning, navigation or traceability if this compact identifier disappeared from the surface they are reading?**

A visible code survives only if its reader function is stronger than the human-readable alternative. Repository convenience, chronology and existing prevalence are not reader functions.

The permitted outcomes are:

- `KEEP_PUBLIC` — retain as reader-facing identity;
- `TECHNICAL_ONLY` — retain only on explicitly technical/reference or machine surfaces;
- `HIDE_PUBLIC` — keep internally/provenance-side but expose no current public compact code;
- `RENAME_NEUTRAL` — identity remains useful, but the current syntax is coupled to a project/brand name that should not own durable identity;
- `REPLACE_WITH_NAME` — retain the underlying internal identity but render a human-readable name on public surfaces;
- `MIGRATE_INTERNAL` — preserve machine identity/joins while removing it from reader-facing nomenclature;
- `RETIRE` — remove the identity from the current system, with Git/provenance sufficient for archaeology.

NOM-02 decides **whether and where** each code earns exposure. NOM-03 owns the final pattern namespace/order decision; NOM-04 owns the eventual reader-reference architecture; NOM-06 performs approved migrations.

## 2. Red-team findings

### R2-01 — workflow identity fails the cold-reader test

A workflow gate tells the repository how the work was produced, not the reader what the resolved thing is. `RH-C5`, `CH-08`, `CF-01`, `P0` and similar codes require project-history knowledge before they convey meaning. Where the underlying technical material remains useful, the public surface should name the technical subject or result directly.

The existing publication adapters already apply this principle selectively: Reference House print adaptation removes an internal H1 comparator section and fails if H1 provenance remains. NOM-02 generalises that discipline instead of treating H1 as a one-off exception.

### R2-02 — stable identity does not by itself justify visible identity

`HSA-P-*` is useful as a join today, but that does not make it useful book typography. Its prefix is historical, its number falsely suggests reading order, and the pattern title already identifies the architectural proposition. Reader display therefore fails even before NOM-03 decides whether the canonical machine ID itself should migrate.

### R2-03 — `G-01` earns a narrower exception

`G-01` identifies a specific grammar rather than a development gate. It enables concise cross-reference between the grammar specification, validation material and Reference House selection. It survives as a public reference **only when introduced or contextually tied to its human name**. The explicit `v0.1` form is a specification/version concern and should not become routine primary prose.

### R2-04 — maturity codes describe real semantics but are not self-explanatory

`M1`–`M5` map to named, explicit maturity states. They are not workflow chronology. However, a cold reader cannot infer “M3 = Coordinated” or the project’s evidence boundary from the token alone. The compact form therefore belongs on technical status/data surfaces; ordinary publication prose should state the maturity meaning in words.

### R2-05 — machine schemas can remain public without becoming publication language

A downloadable schema or deterministic output needs exact identity. That is a legitimate machine/expert task. Such identifiers belong on technical/machine surfaces, not in ordinary architectural reading flow. Brand coupling is judged by the semantic owner: `HK-RH-COMPILE-*` can legitimately refer to House Kernel, while `OH-RH-*` is coupled to a changeable master-project name and should be neutralised.

### R2-06 — prototype labels are specimen references, not architectural vocabulary

`P01`–`P04` and `W2` can help compare test artefacts and protocols. They add little to a reader who only needs to understand the architectural question. Retain them on prototype/test surfaces, but use descriptive names in primary architectural prose.

## 3. Family decision table

| Family | Reader task tested | Failure mode if exposed broadly | NOM-02 decision | Destination / rendering rule |
| --- | --- | --- | --- | --- |
| `project.ovids-house` | Identify the work itself. | None; this is the human master name. | `KEEP_PUBLIC` | Use normally wherever the project itself is meant. |
| `project.house-kernel` | Name the formal architectural/computational system. | Can regress into the former master-project identity if context is sloppy. | `KEEP_PUBLIC` | Keep when it denotes the system; never use as a substitute title for Ovid’s House. |
| `project.metamorph-compiler` | Name the compiler/software subsystem. | Unnecessary product naming in architectural prose where the software is irrelevant. | `KEEP_PUBLIC` | Keep where compiler agency matters; omit where it does not. |
| `legacy.house-systems-architecture` | None for a current reader. | Reintroduces superseded project history. | `HIDE_PUBLIC` | Provenance only. |
| `legacy.house-design-doctrine` | None for a current reader. | Makes resolved work read like a version-history narrative. | `HIDE_PUBLIC` | Provenance only. |
| `legacy.long-life-house` | None for a current reader. | Reintroduces superseded project naming. | `HIDE_PUBLIC` | Provenance only. |
| `pattern.hsa` | Stable machine join across pattern corpus/compiler relationships. | Legacy prefix; false ordinal cue; title already performs reader identification. | `REPLACE_WITH_NAME` | Pattern title is the ordinary reader identity. Keep machine identity behind the surface until NOM-03 settles neutral canonical syntax/compatibility. |
| `grammar.g01` | Concise stable reference to one concrete grammar across specification, evidence and Reference House. | Opaque if used without the long grammar name. | `KEEP_PUBLIC` | Introduce/contextualise as G-01, the Georgian-derived domestic grammar; avoid code-only first mention. |
| `grammar.g01-version` | Identify an exact grammar specification revision. | Version noise in ordinary architectural prose; can make the whole project look provisional. | `TECHNICAL_ONLY` | Use on the specification, conformance/validation and controlled technical references. Primary prose should normally use `G-01` or the grammar name. |
| `grammar.gate` | Organise derivation/validation chronology. | Pure process leakage; meaningless without repo history. | `HIDE_PUBLIC` | Internal/provenance only; public evidence pages use subject/result names. |
| `maturity.level` | Compactly report the project’s defined maturity state. | Not self-explanatory; can be mistaken for industry-standard certification. | `TECHNICAL_ONLY` | Technical status/data surfaces may show code + named state; primary prose states the maturity meaning. |
| `reference-house.design-gate` | Organise Reference House development stages. | Development chronology masquerades as architectural content. | `HIDE_PUBLIC` | Internal/provenance only. |
| `reference-house.compiler-gate` | Organise executable Reference House/compiler stages. | Reader sees implementation chronology rather than the resolved technical subject. | `REPLACE_WITH_NAME` | Public material names the compiled model, inspection output or technical result; retain gate IDs internally. |
| `reference-house.fact` | Stable fact-level joins in the executable model. | Low-level machine identity has no ordinary reader task. | `MIGRATE_INTERNAL` | Preserve in compiler/public-machine data where exact joins are needed; never ordinary reader typography. |
| `compiler.p0` | Organise the compiler programme’s initial gate. | Internal programme shorthand with no cold-reader semantics. | `REPLACE_WITH_NAME` | Public technical prose names the model/contract/result; retain `P0` internally/provenance-side. |
| `compiler.pattern-crosswalk` | Organise the pattern-to-compiler crosswalk programme. | Gate ID distracts from the actual authority-boundary explanation. | `REPLACE_WITH_NAME` | Public material says “pattern crosswalk” / “pattern-to-model relationship”; retain gate ID internally. |
| `compiler.cf` | Organise compiler generality/contrast-fixture validation. | Validation chronology leaks instead of the result being stated. | `REPLACE_WITH_NAME` | Public material names contrast-fixture/generalisation evidence; retain gate ID internally. |
| `compiler.ch` | Organise Compiler Hardening stages. | Software-development programme history, not architectural meaning. | `REPLACE_WITH_NAME` | Public technical material states the hardening property/result; retain `CH-*` internally. |
| `compiler.coa` | Organise Compiler Output Architecture stages. | Process label adds no reader value. | `HIDE_PUBLIC` | Internal/provenance only; public outputs are named by what they are. |
| `compiler.h1` | Identify H1 paper-compilation/technical fixtures and workflow. | Fixture provenance competes with Reference House architectural meaning; already selectively stripped from print. | `REPLACE_WITH_NAME` | Public material names the actual environmental/services/fixture subject; keep H1 identities internally. |
| `publication.pr` | Organise publication release/credibility gates. | Turns the book into commentary on its own production. | `HIDE_PUBLIC` | Internal/provenance only. |
| `publication.pub-san` | Organise resolved-work sanitation programme. | Pure editorial process leakage. | `HIDE_PUBLIC` | Internal/provenance only. |
| `publication.drw` | Organise drawing programme stages. | Confuses workflow gates with eventual public figure references. | `HIDE_PUBLIC` | Internal/provenance only; DRW may create a separate public figure-number system. |
| `publication.pub-nom` | Organise nomenclature programme. | Pure editorial process leakage. | `HIDE_PUBLIC` | Internal/provenance only. |
| `publication.nom-gate` | Organise NOM stages. | Pure editorial process leakage. | `HIDE_PUBLIC` | Internal/provenance only. |
| `prototype.id` | Cross-reference a physical specimen/test package. | Looks like unexplained project sequencing in ordinary architecture prose. | `TECHNICAL_ONLY` | Keep on prototype protocols/results and technical references, paired with descriptive specimen names. |
| `prototype.w2` | Cross-reference the wall-bay challenger/specimen. | Opaque outside prototype context; can be mistaken for wall type/specification. | `TECHNICAL_ONLY` | Keep only on explicit prototype/test surfaces, paired with “wall-bay challenger” or equivalent. |
| `figure.legacy-df` | None in the current publication. | Competes with the forthcoming DRW public figure architecture and preserves obsolete identity. | `RETIRE` | No current public/canonical use; provenance/Git history is sufficient. |
| `machine.rh-compile-schema` | Exact schema/version reference for expert or machine consumers. | Becomes implementation noise if it enters architectural prose. | `TECHNICAL_ONLY` | Keep on public-machine and explicit technical schema surfaces. `HK` is semantically owned by House Kernel. |
| `machine.rh-output` | Exact generated-output/schema/artefact identity. | `OH` couples durable machine identity to a changeable master-project title. | `RENAME_NEUTRAL` | Preserve the machine contract but migrate to a brand-neutral namespace; no primary-reader display. |
| `machine.house-kernel-build-meta` | Build provenance for site tooling. | Former-master branding in an identity that has no reader task and little reason for long-term semantic coupling. | `RENAME_NEUTRAL` | Keep internal only under neutral build-metadata keys when migrated. |

## 4. Secondary NOM-00 queue disposition

The generic candidate queue is resolved by the NOM-01 admission rule rather than by inventing dozens of new families.

### Govern through an existing family

Tokens that are merely syntax variants, sub-gates or fixture labels of an already governed workflow inherit that family’s NOM-02 outcome. Examples include `COA-CLOSEOUT`, `CH-F1`, `ML-H1`, `MHW-D5`, `DSH-D6`, `P01-W2` and similar local workflow/test composites. They do not earn independent public identities merely because the scanner can see them.

### Keep as project-owned technical/local data unless a public cross-reference emerges

Tokens such as `SYS-REP-001`, `RH-STR-001`, `RH-STR-002`, `RH-TOL-001`, `RH-KO-001`, `RH-OCC-01`, `WALL-EXT-A` and local test/datum labels can remain in technical source or machine artefacts. NOM-02 does **not** promote them into publication nomenclature. If a later public surface deliberately uses one as a durable cross-reference, NOM-05 requires it to enter the canonical registry first.

### Dismiss as external/domain notation

External/source/technical notation such as `IEA-EBC`, `UCL-EBL`, `SHA-256`, `CAD-CAM` and `PVC-U` is outside PUB-NOM unless Ovid’s House begins using it as a project-owned identity.

This is intentionally asymmetric: the project must justify adding a compact public identity; it does not need a registry entry to mention every legitimate technical acronym.

## 5. Migration consequences queued by NOM-02

NOM-02 creates the following bounded work for later gates:

1. **NOM-03:** settle pattern machine identity, public pattern-reference policy and publication order independently. The reader-display decision is already fixed: ordinary pattern presentation leads with the pattern name, not `HSA-P-*`.
2. **NOM-04:** define how public cross-references look, including first-use treatment for `G-01`, technical maturity labels, prototype references and DRW figure references.
3. **NOM-05:** encode validators that reject workflow/provenance identities from prohibited rendered surfaces and require newly public compact identities to be registered.
4. **NOM-06:** remove/replace current public workflow-code leakage, neutralise `OH-RH-*` and build-metadata naming where approved, and preserve machine joins without unnecessary compatibility aliases.
5. **NOM-07/08/09:** prove the final site, Working Edition and Primer contain only identifiers that satisfy this contract and do not imply false order/version/maturity semantics.

## 6. Gate boundary

NOM-02 has deliberately **not** renamed a token, changed a route, changed pattern order, altered machine joins, created aliases or edited reader-facing pages. It has only made the retain/hide/replace/neutralise decisions required before migration.

The next gate is **NOM-03 — pattern identity and order decision**.