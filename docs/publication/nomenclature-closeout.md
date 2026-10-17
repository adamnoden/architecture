<!-- nav-exclude: redirect -->
# PUB-NOM — programme closeout

**Gate:** NOM-10 — closeout, DRW reconciliation and PR-02 handoff  
**Status:** COMPLETE AT PUB-NOM SCOPE  
**Tracking issue:** #156  
**Draft PR:** #157  
**Programme baseline:** `e031fbabcb17724fb5561839fb4ff0ec27bd9790`  
**Closeout pre-record head:** `5db225a44d189f9a6ffb5c9cb5fd227abe4e520e`

## 1. Result

PUB-NOM is complete as the project's reader-facing nomenclature and identifier architecture.

The programme began because the Working Edition exposed legacy `HSA-P-*` identifiers as though they were publication numbering. It ends with machine identity, reader identity, reading order, version, maturity, workflow provenance and technical lineage represented as separate concepts with explicit surface policies and regression proof.

The governing rule is now enforced rather than editorially aspirational:

> **The publication exposes identifiers only when the reader benefits from their identity.**

This closeout does **not** claim that the eventual combined drawing/reference system is frozen. DRW has not yet begun execution; its next authorised packet is DRW-00A. DRW owns the future figure register and must re-run the PUB-NOM public-surface/regression system at DRW-10/DRW-12 before PR-02 treats nomenclature plus visual references as a single frozen system.

## 2. Canonical authority after closeout

- `project/identity.ts` — current human project/subsystem names;
- `project/nomenclature.ts` — authoritative namespace meaning, class, surfaces, roles, stability, brand coupling and migration state;
- `project/patterns.ts` — independently authored reader pattern order;
- `project/public-surface.ts` — public source/navigation boundary and label transformation;
- `scripts/validate-public-nomenclature.ts` — source/rendered enforcement;
- `scripts/test-public-nomenclature-regressions.ts` — adversarial proof that the rules fail closed;
- `scripts/nomenclature-inventory.ts` — occurrence inventory/discovery;
- `docs/publication/nomenclature-decisions.md` — family-by-family NOM-02 necessity decisions;
- `docs/publication/pattern-identity-decision.md` — pattern identity/order decision;
- `docs/publication/reader-reference-architecture.md` — identity/display architecture;
- this record — final human closeout projection and DRW handoff.

Earlier NOM-00/NOM-01 tables remain historical gate records. Where they describe pre-migration namespaces or provisional migration states, `project/nomenclature.ts` and this closeout supersede them.

## 3. Final namespace / exposure register

| Family | Final class | Reader/public exposure | Final position |
| --- | --- | --- | --- |
| Ovid’s House | `PUBLIC_NAME` | primary + technical + machine | master project name |
| House Kernel | `PUBLIC_NAME` | primary + technical + machine | formal architectural-system name; former master-name use remains provenance-bounded |
| Metamorph Compiler | `PUBLIC_NAME` | primary + technical + machine | compiler subsystem name |
| House Systems Architecture | `PROVENANCE_ONLY` | provenance only | superseded master name |
| House Design Doctrine | `PROVENANCE_ONLY` | provenance only | superseded doctrine/project name |
| Long-Life House | `PROVENANCE_ONLY` | provenance only | superseded project name |
| `HSA-P-*` | `LEGACY_PROHIBITED` | provenance only | superseded brand-coupled pattern identity |
| `PAT-NNN` | `INTERNAL_STABLE` | public-machine/internal only | canonical pattern machine join; title is reader identity |
| `G-01` | `PUBLIC_REFERENCE` | reader + technical + machine | stable grammar-instance identity |
| `G-01 vN.N` | `PUBLIC_TECHNICAL` | technical + machine | exact grammar-specification revision; ordinary prose uses `G-01`/human name |
| grammar `D*` gates | `WORKFLOW` | internal/provenance | derivation/validation chronology |
| project `M1`–`M5` | `PUBLIC_TECHNICAL` | technical + machine | evidence-maturity scale, not reading order |
| `RH-00`–`RH-11` | `WORKFLOW` | internal/provenance | Reference House design/development chronology |
| `RH-C*` | `WORKFLOW` | internal/provenance | Reference House executable/compiler chronology |
| `RHCF-*` | `INTERNAL_STABLE` | site-technical + public-machine/internal | exact canonical source-fact identity where inspection is the task |
| `P0` | `WORKFLOW` | internal/provenance | compiler programme gate |
| `PAT-XW-*` | `WORKFLOW` | internal/provenance | compiler crosswalk gate |
| `CF-*` | `WORKFLOW` | internal/provenance | compiler generality/contrast-fixture gate |
| `CH-*` | `WORKFLOW` | internal/provenance | compiler-hardening gates |
| `COA-*` | `WORKFLOW` | internal/provenance | compiler-output-architecture gates |
| `H1-*` | `WORKFLOW` | internal/provenance | paper-compilation / technical-fixture workflow identity |
| `PR-*` | `WORKFLOW` | internal/provenance | publication/release chronology |
| `PUB-SAN` | `WORKFLOW` | internal/provenance | sanitation programme identity |
| `DRW-*` | `WORKFLOW` | internal/provenance | drawing-programme chronology |
| `PUB-NOM` / `NOM-*` | `WORKFLOW` | internal/provenance | nomenclature-programme chronology |
| `P01`–`P04` | `PUBLIC_TECHNICAL` | technical + machine | physical specimen identity; public overview uses descriptive names |
| `W2` | `PUBLIC_TECHNICAL` | technical + machine | wall-bay challenger/specimen identity |
| `D-F*` | `LEGACY_PROHIBITED` | provenance only | retired publication figure identity; DRW owns replacement architecture |
| `HK-RH-COMPILE-*` | `PUBLIC_TECHNICAL` | site-technical + public-machine/internal | versioned House Kernel compile schema; `HK` is semantically owned by the durable system |
| `OH-RH-*` | `LEGACY_PROHIBITED` | provenance only | superseded Ovid’s-House-coupled output identity |
| `RH-OUTPUT-*`, `RH-PLAN-*`, `RH-SECTION-*`, `RH-STRUCTURE-*`, `RH-SERVICE-*`, `RH-BOUNDARY-*` | `PUBLIC_TECHNICAL` | site-technical + public-machine/internal | neutral Reference House output/artefact identity |
| House-Kernel-derived build metadata keys | `LEGACY_PROHIBITED` | provenance only | superseded; implementation now uses generic build metadata and no reader-visible build stamp |

External professional/technical abbreviations such as RIBA, CIBSE, MEP, MVHR, ISO, RICS and UK regulatory notation such as M4(2)/M4(3) are domain language, not Ovid’s House identity families, unless a future use crosses the registry admission rule.

## 4. Canonical migration map

### 4.1 Patterns

The migration preserved numeric suffixes exactly and introduced no compatibility alias.

| Superseded | Current |
| --- | --- |
| `HSA-P-001` | `PAT-001` |
| `HSA-P-002` | `PAT-002` |
| `HSA-P-003` | `PAT-003` |
| `HSA-P-004` | `PAT-004` |
| `HSA-P-005` | `PAT-005` |
| `HSA-P-007` | `PAT-007` |
| `HSA-P-008` | `PAT-008` |
| `HSA-P-009` | `PAT-009` |
| `HSA-P-010` | `PAT-010` |
| `HSA-P-011` | `PAT-011` |
| `HSA-P-012` | `PAT-012` |
| `HSA-P-013` | `PAT-013` |
| `HSA-P-014` | `PAT-014` |
| `HSA-P-015` | `PAT-015` |
| `HSA-P-016` | `PAT-016` |
| `HSA-P-017` | `PAT-017` |
| `HSA-P-018` | `PAT-018` |
| `HSA-P-019` | `PAT-019` |
| `HSA-P-020` | `PAT-020` |
| `HSA-P-021` | `PAT-021` |
| `HSA-P-022` | `PAT-022` |

`HSA-P-006` was already a retired identity; PUB-NOM did not revive it as `PAT-006` merely to make the namespace contiguous.

Reader order remains the separately authored sequence in `project/patterns.ts` and is intentionally non-numeric.

### 4.2 Reference House generated output

| Superseded | Current |
| --- | --- |
| `OH-RH-OUTPUT-1` | `RH-OUTPUT-1` |
| `OH-RH-PLAN-GROUND-1` | `RH-PLAN-GROUND-1` |
| `OH-RH-PLAN-FIRST-1` | `RH-PLAN-FIRST-1` |
| `OH-RH-SECTION-AA-1` | `RH-SECTION-AA-1` |
| `OH-RH-STRUCTURE-FIRST-1` | `RH-STRUCTURE-FIRST-1` |
| `OH-RH-SERVICE-REGISTER-1` | `RH-SERVICE-REGISTER-1` |
| `OH-RH-BOUNDARY-REGISTER-1` | `RH-BOUNDARY-REGISTER-1` |
| `OH-RH-OUTPUT-MANIFEST-1` | `RH-OUTPUT-MANIFEST-1` |

### 4.3 Site build metadata

Brand-coupled House Kernel build keys were replaced with generic implementation metadata. The generic keys are not promoted into a new project-owned namespace because they perform no reader/reference task. The visible Git SHA/timestamp footer was removed entirely.

## 5. Before → after reader-facing examples

| Before | After | Reason |
| --- | --- | --- |
| pattern contents headed by `HSA-P-001`, `HSA-P-002`, `HSA-P-014`, `HSA-P-003`… | pattern titles only, in authored editorial order | machine identity no longer impersonates chapter numbering |
| pattern/strategy/candidate pages explained hidden/stable machine IDs | ordinary pages discuss only architectural state/relationships | repository machinery performed no reader task |
| Reader’s Guide explained hidden stable IDs as provenance/cross-reference | pattern names are the identity; book order is editorial | reader explanation now matches the actual public system |
| ordinary prose repeatedly used `G-01 v0.1` | ordinary prose uses `G-01` / human grammar name; exact version remains on technical spec/conformance surfaces | version identity is real but not routine typography |
| public grammar precedent cases exposed `D3`, `TRIAL`, pass/run language | durable evidence/method language | research chronology removed from resolved evidence records |
| every site page showed `build <sha> · <timestamp>` | no visible build stamp | Git provenance is implementation metadata, not publication identity |
| Primer used a semantic inspection plan carrying machine entity IDs | reader-level Reference House architectural figure | compact edition should communicate architecture, not inspection lineage |
| internal figure placement retained `D-F01`…`D-F11` | exact figure set keyed by asset/alt identity, with no invented public replacement number | obsolete figure namespace retired; DRW owns future figure register |

## 6. Intentionally retained compact technical identities

Compact identity was retained only where its exactness earns the visual/technical cost.

- **`G-01`** — useful stable cross-reference to one controlled grammar instance.
- **`G-01 v0.1`** — useful when exact specification revision matters; technical surfaces only.
- **`M1`–`M5`** — a defined evidence-maturity enum for technical/machine status; not ordinary prose shorthand.
- **`P01`–`P04`, `W2`** — specimen identities useful in technical prototype records; public overview remains descriptive.
- **`RHCF-*` and generated route/carrier/entity identities** — retained on explicit semantic inspection surfaces where source-fact identity is the subject.
- **`HK-RH-COMPILE-*`** — versioned compiler/schema identity owned by House Kernel.
- **neutral `RH-*` output identities** — stable versioned identities for generated Reference House artefacts.

These exceptions are not precedents for exposing workflow gates. `RH-C5`, `CH-08`, `NOM-09` and similar labels remain development control, not architectural publication language.

## 7. Legacy / provenance boundary

The project intentionally retains historical identity where history is the purpose of the record or where Git itself preserves archaeology. It does not maintain compatibility aliases merely because a prior identifier once existed.

Bounded provenance includes:

- old master/project names;
- `HSA-P-*` migration history;
- old `OH-RH-*` machine-output identity;
- retired build metadata;
- retired `D-F*` figure identity;
- programme/gate histories such as `RH-*`, `CH-*`, `PR-*`, `DRW-*`, `NOM-*` where the record is explicitly about development chronology.

No demonstrated external consumer justified indefinite dual identity for the migrated pattern or Reference House namespaces.

## 8. Enforcement and proof

The permanent enforcement stack now includes:

1. typed central nomenclature registry;
2. public-surface classification;
3. source validator;
4. publication manifest/adapter/order validation;
5. reader-facing SVG scanning;
6. built-site HTML scanning;
7. direct text extraction from **both named canonical PDFs**;
8. repository route/link integrity;
9. public-machine data-plate freshness;
10. adversarial source/publication/rendered regression mutations.

NOM-09 deliberately proved that the system rejects:

- legacy `HSA-P-*` in primary prose and publication SVGs;
- reader-facing `PAT-*`;
- workflow/version/maturity leakage onto primary surfaces;
- legacy project names;
- machine-ID-derived reader pattern titles;
- broken pattern machine joins;
- publication order collapsed to machine-ID sort;
- stale public-machine data plate;
- prohibited identity in built HTML;
- missing built-site corpus;
- either missing canonical PDF;
- prohibited identity physically rebuilt into the Primer and recovered from the final PDF text layer.

Final pre-closeout proof: PR validation run `39056023321` / #530 passed completely at `6ad5a585653acfa4b99ca7c702ec242a51ea9686` with both clean and adversarial checks active.

## 9. DRW reconciliation

PUB-NOM and DRW have different ownership:

- **PUB-NOM owns** whether an identifier is reader-facing, what semantic role it carries, and whether source/compiler lineage may appear on a given surface.
- **DRW owns** drawing quality, drawing selection, plate composition and the future canonical publication figure register/numbering system.
- **Compiler/source drawing IDs may remain internal or technical lineage** even when DRW later introduces publication-local figure numbers.
- **DRW must not resurrect `D-F*`** for continuity and must not expose compiler drawing IDs merely because they exist.
- **PUB-NOM must not invent figure numbers in advance of DRW.**

DRW issue #154 remains open and its next authorised packet is DRW-00A. Its canonical programme states that DRW-10 performs publication integration and DRW-12 performs integration/adversarial proof/freeze.

Therefore the required re-entry gate is:

> **At DRW-10 and again at DRW-12, build the site, Working Edition and Primer with the integrated controlled drawing family; run source nomenclature validation, publication validation, rendered validation, the NOM-09 adversarial suite and nomenclature inventory. Any new public figure-reference family must first enter `project/nomenclature.ts` with an explicit class/surface contract.**

This requirement satisfies the sibling-programme boundary without serialising DRW behind completed nomenclature work.

## 10. Acceptance criteria closeout

1. **PASS** — every governed family has owner/meaning/class/surfaces in `project/nomenclature.ts`.
2. **PASS** — legacy project namespaces are excluded from primary reader surfaces.
3. **PASS** — compact primary-flow references have demonstrated reader tasks.
4. **PASS** — identity/order/version/maturity are separate concepts.
5. **PASS** — pattern contents/order no longer look like erroneous numeric sequence.
6. **PASS** — pattern public display and machine identity are independently controlled.
7. **PASS** — migrations are atomic, mapped, tested and alias-free absent a demonstrated external consumer.
8. **PASS** — workflow identities remain internally useful but reader-bounded.
9. **PASS at current corpus** — site, Working Edition, Primer, figures and public-machine outputs obey surface policy.
10. **PASS at programme boundary** — `D-F*` is retired and the future public figure register is explicitly delegated to DRW; no competing numbering was invented.
11. **PASS** — generated site/PDF/SVG leakage is validated and adversarially proven.
12. **PASS** — repository/publication joins, routes, links and compiler relationships remain green after migration.
13. **PASS at current corpus** — cold-reader audits found no functionless project identity noise requiring repository history.
14. **PASS** — reader-invisible internals were not mass-renamed for aesthetic purity.
15. **PASS WITH EXPLICIT DOWNSTREAM CONDITION** — the current Working Edition is nomenclature-clean; PR-02 may freeze the *combined* nomenclature/visual-reference system only after DRW completes its publication-facing integration and reruns the gate above.

## 11. Known limitations / downstream obligations

- DRW has not yet produced its future figure register; no final reader figure-number syntax exists today.
- Because DRW has not begun execution, NOM-07/08/09 could only audit the current publication figure family. The mandatory DRW-10/12 re-entry gate covers the later integrated family.
- Regex validation intentionally does not police every uppercase external technical acronym. The registry admission rule governs new **project-owned** identity; editorial prose review remains responsible for ordinary clarity.
- Nomenclature validation proves exposure and identity policy, not architectural truth, technical adequacy or external validation.

## 12. Handoff

PUB-NOM requires no standing NOM-11.

The nomenclature architecture should remain stable unless a real new reader/reference need appears. The next project action owned elsewhere is **DRW-00A**. When DRW reaches publication integration, it must consume this closeout and the canonical registry rather than reconstructing a new naming policy.

PR #157 remains draft at this record because the combined PR-02 visual-reference freeze is downstream of the DRW integration obligation. Do not merge/declare PR-02 release from this record alone.
