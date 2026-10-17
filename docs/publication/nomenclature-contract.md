<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-01 Nomenclature Contract

**Status:** NOM-01 contract frozen on the `pub-nom` branch; migration decisions remain subject to NOM-02/NOM-03.  
**Canonical machine source:** `project/nomenclature.ts`  
**Baseline register:** `docs/publication/nomenclature-register.md`  
**Tracking issue:** #156  
**Draft PR:** #157

## 1. Contract

Reader-facing nomenclature and machine identity are now separate concerns.

The canonical registry in `project/nomenclature.ts` owns, for every governed family:

- meaning and owning subsystem;
- syntax/pattern;
- classification;
- allowed surfaces;
- semantic role;
- stability promise;
- brand-coupling rule;
- migration status;
- any explicit exception.

`scripts/nomenclature-inventory.ts` imports that registry. There is no longer a second hand-maintained namespace-family list in the scanner.

The governing rule remains:

> **The publication exposes identifiers only when the reader benefits from their identity.**

NOM-01 does not itself perform the migrations. It establishes the contract against which NOM-02 can red-team each visible family and NOM-03 can settle the pattern namespace.

## 2. Frozen classes

| Class | Contract |
| --- | --- |
| `PUBLIC_NAME` | Human-readable identity intended as ordinary publication language. |
| `PUBLIC_REFERENCE` | Compact stable identity that performs a real reader-facing cross-reference task. |
| `PUBLIC_TECHNICAL` | Identity useful on explicitly technical or machine-facing public surfaces, but not ordinary reading flow. |
| `INTERNAL_STABLE` | Durable machine identity used for joins, semantics, tests or lineage and not intended as reader-facing nomenclature. |
| `WORKFLOW` | Development phase, gate, programme, experiment or proof identity. |
| `PROVENANCE_ONLY` | Historical identity retained only in deliberately historical records. |
| `LEGACY_PROHIBITED` | Obsolete identity with no current semantic role outside bounded provenance. |

## 3. Frozen surfaces

| Surface | Meaning |
| --- | --- |
| `BOOK_PRIMARY` | Main book prose, contents, headings and ordinary captions. |
| `BOOK_TECHNICAL` | Indexes, technical notes and controlled appendices. |
| `SITE_PRIMARY` | Reader-facing architectural and publication pages. |
| `SITE_TECHNICAL` | Computational, evidence and machine-reference pages deliberately exposed. |
| `PUBLIC_MACHINE` | Machine-readable data and artefact metadata intended for expert or machine inspection. |
| `INTERNAL` | Repository-only implementation, tests and development records. |
| `PROVENANCE` | Deliberately historical records. |

This vocabulary is deliberately about **use**, not file location. NOM-05 can implement enforcement mappings from actual files/rendered outputs to these surfaces.

## 4. Family contract

The table below is a human projection of `project/nomenclature.ts`. The TypeScript registry is authoritative.

| Family | Class | Allowed public exposure | Role | Stability | Brand coupling | Migration |
| --- | --- | --- | --- | --- | --- | --- |
| `project.ovids-house` | `PUBLIC_NAME` | primary + technical + machine | semantic name | durable | allowed | current |
| `project.house-kernel` | `PUBLIC_NAME` | primary + technical + machine | semantic name | durable | allowed | current |
| `project.metamorph-compiler` | `PUBLIC_NAME` | primary + technical + machine | semantic name | durable | allowed | current |
| `legacy.house-systems-architecture` | `PROVENANCE_ONLY` | none | provenance | provenance only | n/a | legacy |
| `legacy.house-design-doctrine` | `PROVENANCE_ONLY` | none | provenance | provenance only | n/a | legacy |
| `legacy.long-life-house` | `PROVENANCE_ONLY` | none | provenance | provenance only | n/a | legacy |
| `pattern.hsa` | `INTERNAL_STABLE` | public machine only | identity only | migratable | **prohibited** | NOM-03 |
| `grammar.g01` | `PUBLIC_REFERENCE` | primary + technical + machine | identity only | durable | n/a | NOM-02 review |
| `grammar.g01-version` | `PUBLIC_TECHNICAL` | technical + machine | identity + version | versioned | n/a | NOM-02 review |
| `grammar.gate` | `WORKFLOW` | none | workflow | workflow lifetime | n/a | current |
| `maturity.level` | `PUBLIC_TECHNICAL` | technical + machine | maturity | durable | n/a | NOM-02 review |
| `reference-house.design-gate` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | current |
| `reference-house.compiler-gate` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | NOM-02 review |
| `reference-house.fact` | `INTERNAL_STABLE` | public machine only | identity only | durable | n/a | current |
| `compiler.p0` | `WORKFLOW` | none | workflow | workflow lifetime | n/a | NOM-02 review |
| `compiler.pattern-crosswalk` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | NOM-02 review |
| `compiler.cf` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | NOM-02 review |
| `compiler.ch` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | NOM-02 review |
| `compiler.coa` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | current |
| `compiler.h1` | `WORKFLOW` | none | workflow + fixture identity | workflow lifetime | n/a | NOM-02 review |
| `publication.pr` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | current |
| `publication.pub-san` | `WORKFLOW` | none | workflow | workflow lifetime | n/a | current |
| `publication.drw` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | current |
| `publication.pub-nom` | `WORKFLOW` | none | workflow | workflow lifetime | n/a | current |
| `publication.nom-gate` | `WORKFLOW` | none | workflow + ordinal | workflow lifetime | n/a | current |
| `prototype.id` | `PUBLIC_TECHNICAL` | technical + machine | identity only | durable | n/a | NOM-02 review |
| `prototype.w2` | `PUBLIC_TECHNICAL` | technical + machine | identity only | durable | n/a | NOM-02 review |
| `figure.legacy-df` | `LEGACY_PROHIBITED` | none | provenance | provenance only | n/a | replace via DRW |
| `machine.rh-compile-schema` | `PUBLIC_TECHNICAL` | site technical + machine | identity + version | versioned | allowed | NOM-02 review |
| `machine.rh-output` | `PUBLIC_TECHNICAL` | site technical + machine | identity + version | migratable | **prohibited** | NOM-02 review |
| `machine.house-kernel-build-meta` | `INTERNAL_STABLE` | none | identity only | migratable | **prohibited** | NOM-02 review |

“Allowed public exposure” omits `INTERNAL` and `PROVENANCE`, which are represented explicitly in the canonical registry.

## 5. Important decisions frozen here

### 5.1 Workflow codes are not resolved-public nomenclature

`RH-C*`, `P0`, `PAT-XW-*`, `CF-*`, `CH-*`, `COA-*`, `H1-*`, `PR-*`, `PUB-SAN`, `DRW-*`, `PUB-NOM`, `NOM-*` and grammar-development gates are workflow identities.

Their current appearance in the book or ordinary site flow is therefore not legitimised merely because the material they identify is technically serious. NOM-02 must either remove those occurrences, replace them with human names, or prove that a specific token is not actually a workflow identity and reclassify it explicitly.

### 5.2 `HSA-P-*` is machine identity, not reader order

The current pattern namespace is classified `INTERNAL_STABLE`, with public-machine exposure tolerated while NOM-03 settles the canonical replacement/retention decision. It is **not** approved for `BOOK_PRIMARY`, `BOOK_TECHNICAL`, `SITE_PRIMARY` or `SITE_TECHNICAL` display.

Its current brand coupling is prohibited. NOM-03 must decide whether a neutral replacement is necessary and whether any public compact pattern reference survives at all.

This freezes the conceptual separation without pre-empting the final syntax decision:

- pattern **name** = reader identity;
- pattern **machine ID** = stable join;
- publication **order** = separately authored sequence;
- any future public **reference code** = only if NOM-02/NOM-03 proves reader utility.

### 5.3 `G-01` is not treated as a workflow gate

`G-01` identifies a grammar instance and is provisionally a `PUBLIC_REFERENCE`. Its explicit version form is narrower: `PUBLIC_TECHNICAL`. NOM-02 must still test whether the compact label improves the cold-reader experience, but the ontology does not confuse it with `D8`/`D12` development gates.

### 5.4 Maturity is technical semantics, not programme history

`M1`–`M5` are classified `PUBLIC_TECHNICAL`: they encode an explicit maturity model rather than a development phase. That does not automatically justify every current appearance. Primary prose should normally state the actual maturity meaning rather than relying on an unexplained compact label.

### 5.5 Brand-derived machine namespaces are judged by semantic ownership

Brand coupling is not banned mechanically.

- `HK-RH-COMPILE-*` is provisionally permitted because `HK` denotes the durable House Kernel architectural system that owns the compile schema.
- `OH-RH-*` is project-title coupled and therefore marked for review/migration rather than treated as inherently durable machine identity.
- `__HOUSE_KERNEL_BUILD_*__` is internal metadata, but its former-master-name coupling has no reader value and is likewise marked for review.

This is the same rule that rejects simply changing `HSA-P-*` to `OH-P-*`.

### 5.6 Prototype IDs are technical specimen identities

`P01`–`P04` and `W2` identify experimental/prototype artefacts rather than publication order. They are provisionally `PUBLIC_TECHNICAL`, not primary reader nomenclature. NOM-02 must test whether the public site needs those compact labels or whether descriptive specimen names are sufficient.

## 6. Secondary-token admission rule

The NOM-00 generic queue is not promoted wholesale into the canonical registry.

A token becomes a governed family when at least one of these is true:

1. Ovid’s House owns it and expects stability across more than one artefact or subsystem;
2. it is intentionally exposed as a reader or machine cross-reference;
3. it carries order, version, maturity or authority semantics whose interpretation affects readers;
4. it is workflow/provenance identity that must be actively excluded from resolved public surfaces.

A token is not promoted merely because it is uppercase. Ordinary external technical notation, material/standard acronyms, bibliographic/source shorthand and one-off local datum/test labels remain domain data unless they cross the rule above.

Obvious queue examples such as `IEA-EBC`, `UCL-EBL`, `SHA-256`, `CAD-CAM` and `PVC-U` are therefore outside PUB-NOM governance as domain/reference data. Syntax variants of an existing project-owned workflow family inherit that family classification until NOM-02/NOM-05 either broadens the canonical family pattern or proves that the variant is a distinct identity system.

This closes the NOM-00 “unclassified tail” problem without turning PUB-NOM into a universal acronym catalogue.

## 7. Gate boundary

NOM-01 has deliberately **not**:

- renamed `HSA-P-*`;
- changed pattern order or slugs;
- removed current workflow-code leaks;
- migrated `OH-RH-*` or build metadata;
- changed grammar/maturity/prototype presentation;
- created compatibility aliases;
- changed any architectural claim or evidence status.

The next gate is **NOM-02 — necessity red-team**. It must test every currently visible governed family against the reader task it claims to serve, and may amend this contract only through an explicit recorded decision rather than an incidental edit.