<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-04 Reader Reference Architecture

**Status:** NOM-04 architecture frozen; implementation/migration proceeds through NOM-05/NOM-06.  
**NOM-03 pattern decision:** `docs/publication/pattern-identity-decision.md`  
**Canonical nomenclature registry:** `project/nomenclature.ts`  
**Tracking issue:** #156  
**Draft PR:** #157

## 1. The model

A canonical concept may have several identities, but they are not interchangeable.

```text
canonical concept
├─ internalId       exact stable machine join
├─ title            canonical human name
├─ publicReference  optional compact reader reference
├─ version           optional exact specification revision
└─ placement/order   owned by the containing publication/register
```

Only `title` is universally reader-facing.

`publicReference`, `version` and `internalId` are opt-in fields whose visibility is determined by the NOM-01 surface contract. Publication order is never inferred from an identifier.

This architecture replaces the current habit of making one string do several jobs.

## 2. Surface rendering contract

| Surface | Default rendering |
| --- | --- |
| `BOOK_PRIMARY` | `title` only |
| `BOOK_TECHNICAL` | `title`; add `publicReference` or `version` only when the technical task earns it |
| `SITE_PRIMARY` | `title` only |
| `SITE_TECHNICAL` | `title`; optional approved public/technical reference |
| `PUBLIC_MACHINE` | exact `internalId` / schema identity plus human `title` where useful |
| `INTERNAL` | exact internal/workflow identity as required |
| `PROVENANCE` | historical identity may be shown explicitly because history is the subject |

There is no fallback rule of “show the internal ID if no public reference exists.” Absence of `publicReference` means **no compact reader code**.

## 3. Pattern contract

For a pattern after NOM-06:

```ts
{
  internalId: 'PAT-003',
  title: 'Coherent Horizontal Service Route',
  publicReference: undefined
}
```

The canonical pattern Markdown frontmatter remains the source of `internalId` and `title`. Relationship arrays store `internalId`. Renderers resolve those relationships back to titles.

Reader presentation becomes:

```text
Coherent Horizontal Service Route
```

Machine/provenance presentation may become:

```text
PAT-003 — Coherent Horizontal Service Route
```

The Working Edition manifest must not maintain a second manually authored copy of every pattern title. Pattern publication entries should identify the canonical source/internal ID; the publication preparation layer resolves the human title from canonical pattern metadata.

The site pattern index and publication adapters likewise consume canonical pattern metadata rather than independently constructing display labels.

## 4. Order contract

`placement/order` belongs to the container, not the concept.

For patterns this means one explicitly named `patternPublicationOrder` owns full-corpus reader order. It is a list of canonical `internalId` values whose array position carries the order.

The following are prohibited:

- sorting patterns by numeric suffix to obtain reader order;
- embedding a publication ordinal into the pattern title;
- adding an `order` field to every pattern merely to mirror one publication;
- rendering the internal numeric suffix in a way that visually impersonates chapter sequence.

A different publication may select or order the same patterns differently without changing their identities.

## 5. Existing public-reference families

### `G-01`

`G-01` is an approved `PUBLIC_REFERENCE`, not a machine ID accidentally promoted into prose.

First meaningful use should bind code and name:

```text
G-01, the Georgian-derived domestic grammar
```

Subsequent use may use `G-01` alone where context remains clear.

`G-01 v0.1` is narrower. The version belongs on the grammar specification, conformance/validation records and explicit technical references; ordinary architectural prose normally uses `G-01` or the grammar name.

### Maturity levels

Technical status surfaces may render:

```text
M4 — Internally validated / controlled
```

The code never stands alone on first use. Primary prose states the actual condition in words rather than relying on a project-specific maturity token.

### Prototype identities

Prototype/test surfaces may render:

```text
P03 — Structural floor edge
```

or the canonical descriptive specimen name actually owned by the prototype register. Primary architectural prose uses the description unless specimen identity is the subject.

### Machine schemas

Exact schema/version identities such as `HK-RH-COMPILE-1` may appear on explicit technical/data surfaces. They do not become chapter labels or prose shorthand.

## 6. Workflow families

Workflow identities have **no public rendering form**.

There is deliberately no helper that maps `CH-08`, `RH-C5`, `P0`, `PR-01` or `NOM-04` into a prettier public badge. Where useful material originated in such a gate, the public surface names the architectural/technical subject or result.

This prevents a new presentation layer from laundering process history rather than removing it.

## 7. Figures and DRW boundary

PUB-NOM and DRW remain separate authorities.

A future figure record may contain:

```text
sourceId / compileId   internal lineage
figureNumber           reader publication sequence
caption                reader description
```

The reader sees the figure number/caption defined by the publication figure register. Compiler/source IDs may remain inspectable metadata where useful but do not dictate public numbering.

Legacy `D-F*` is not preserved merely to bridge these layers. DRW owns the replacement public figure register; PUB-NOM owns the rule that source lineage and reader numbering remain separate.

## 8. Implementation requirements

NOM-05/NOM-06 must implement the architecture with the smallest useful machinery:

1. canonical pattern metadata remains authored once in pattern frontmatter;
2. publication pattern entries stop duplicating titles;
3. publication entries distinguish their own manifest identity from pattern machine identity;
4. full-corpus pattern order is explicitly named and validated as an ordered set, not inferred from ID sorting;
5. site and print pattern lists resolve IDs to the same canonical titles;
6. renderers never append an internal ID to a human title by default;
7. technical code + title combinations use explicit helpers/data rather than ad-hoc punctuation conventions where repeated;
8. new public compact references must be registered in `project/nomenclature.ts` before use;
9. no reader-facing exception is created by string replacement or page-specific allowlist when a semantic rendering rule can express it.

## 9. Acceptance test

The architecture is correct when a pattern title can change once in canonical pattern metadata and the site index, pattern page, Working Edition contents/entry title and machine human label all follow without separately editing display strings.

Changing that title must **not** change:

- `PAT-NNN` identity;
- URL slug unless deliberately migrated;
- publication order;
- compiler joins.

Likewise, changing publication order must not change the pattern title, machine identity or URL.

That independence is the core NOM-04 invariant.

The next gate is **NOM-05 — canonical namespace governance and validators**.