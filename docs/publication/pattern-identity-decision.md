<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-03 Pattern Identity and Order Decision

**Status:** NOM-03 policy frozen; migration remains deferred to NOM-06.  
**NOM-02 decisions:** `docs/publication/nomenclature-decisions.md`  
**Pattern model:** `docs/patterns/language-model.md`  
**Tracking issue:** #156  
**Draft PR:** #157

## 1. Decision

Pattern identity, reader identity, URL identity and publication order are separate dimensions.

The frozen policy is:

1. **pattern title is the primary reader identity**;
2. **ordinary reader surfaces show no compact pattern code by default**;
3. **canonical machine IDs migrate atomically from `HSA-P-NNN` to brand-neutral `PAT-NNN`**;
4. **the existing three-digit suffix is preserved one-to-one** — no renumbering, gap filling or re-sequencing;
5. **publication order remains an explicit curated ordered list**, never an ID sort;
6. **site list order uses the same curated reader order where the full active corpus is presented**;
7. **human-readable filenames and URL slugs remain unchanged**;
8. **pattern relationships, compiler provenance/crosswalks, tests and machine artefacts migrate to the new canonical IDs atomically**;
9. **no runtime compatibility alias is retained for `HSA-P-*` unless a real external consumer is demonstrated before migration**;
10. the closeout record preserves a generated old→new mapping for archaeology and review.

The mapping rule is mechanical:

```text
HSA-P-001  →  PAT-001
HSA-P-002  →  PAT-002
HSA-P-014  →  PAT-014
...
```

This is deliberately **not** a change from one project brand to another. `PAT` names the semantic domain — pattern identity — rather than Ovid’s House, House Kernel or any historical project title.

## 2. Why a machine ID still exists

The red-team alternative is to abolish compact pattern IDs and use titles or URL slugs as canonical identity.

That is rejected.

Patterns participate in machine joins across:

- frontmatter relationship arrays;
- generative-sequence records;
- Reference House pattern selection/occurrence records;
- compiler provenance and pattern crosswalks;
- tests and deterministic data projections.

A stable opaque-enough key is useful here. It allows a title to improve editorially without forcing machine relationships to migrate, while still requiring a new identity if the underlying recurring problem/invariant response changes materially.

The machine ID therefore earns its existence. It does **not** earn routine typography in the book.

## 3. Why `PAT-NNN`

The following candidates were attacked explicitly.

| Candidate | Decision | Reason |
| --- | --- | --- |
| keep `HSA-P-NNN` internally | reject | The legacy master-project prefix remains embedded in canonical identity and guarantees future archaeology leaks. Hiding it would cure presentation while retaining the structural coupling that caused the problem. |
| `OH-P-NNN` | reject | Repeats the exact design error with the current master-project brand. |
| `HK-P-NNN` | reject | Couples pattern identity to House Kernel even though patterns are an architectural layer independent from the computational/formal system. |
| `P-NNN` | reject | Too ambiguous beside prototype identities and ordinary project notation. |
| semantic slug only | reject as canonical machine ID | Excellent URL/human identity, but longer joins and unnecessary migration if editorial titles/slugs evolve while the pattern itself remains the same. |
| UUID/hash identity | reject | Solves no present collision problem and makes inspection, authoring and review worse. |
| `PAT-NNN` | **accept** | Short, brand-neutral, obvious in machine context, preserves the existing stable suffix and does not claim category/evidence/order semantics. |

`PAT-NNN` remains an identity-only namespace. The digits do not mean chapter number, category, priority, evidence, maturity or publication position.

## 4. Reader display policy

### Book primary surfaces

Contents, pattern openings, ordinary captions and prose lead with the pattern title.

```text
Controlled Utility Entry
Plant Room as Service Hub
Accessible Vertical Service Zone
```

Not:

```text
PAT-001 — Controlled Utility Entry
PAT-002 — Plant Room as Service Hub
PAT-014 — Accessible Vertical Service Zone
```

The second form would reproduce the original false-order cue even after removing `HSA`.

### Site primary surfaces

Pattern index/list cards and headings use the title as the visible identity. Evidence state or other useful human metadata may accompany it; the machine ID does not.

### Technical and machine surfaces

`PAT-NNN` may appear where exact identity is genuinely useful: machine-readable data, compiler provenance, debug/inspection records or an explicitly technical identity register. It is not promoted into publication typography merely because a technical page exposes underlying data.

### Cross-references

Human cross-references use the pattern title, normally as a link on the site and as ordinary titled reference in print. Relationship rendering should resolve canonical machine IDs to titles rather than expose the IDs themselves.

No separate public compact pattern-reference code is introduced at this gate. If a future publication demonstrates a genuine need for one, NOM-04/NOM-05 require it to be defined separately rather than silently reusing the machine ID.

## 5. Publication order policy

The current curated sequence is architectural/generative reading order:

```text
001, 002, 014, 003, 015, 004, 005, 016, 017, 018, 009,
007, 019, 020, 008, 022, 010, 021, 011, 013, 012
```

That sequence is intentionally not ID order.

NOM-03 freezes the following architecture:

- one explicit **reader/publication-order list** owns full-corpus presentation order;
- it references canonical pattern identities but does not derive order from their numeric suffixes;
- the Working Edition pattern sequence consumes that list;
- the site active-pattern index consumes the same list when presenting the full active corpus;
- Primer selections remain separately curated subsets rather than pretending to be the full order;
- pattern metadata does not gain a fake `order` field merely to duplicate publication structure;
- ID validators test identity syntax and uniqueness only, never sequence meaning.

During NOM-06 the existing `canonicalPatternOrder` should be renamed to make its reader/publication role explicit (for example `patternPublicationOrder`) and all full-corpus reader renderers should consume it instead of independently sorting by ID.

## 6. URL and filename stability

Current pattern routes are derived from human-readable filenames such as:

```text
controlled-utility-entry.md
coherent-horizontal-service-route.md
movement-slip-junction.md
```

These remain unchanged.

The machine-ID migration therefore does **not** require URL churn, redirects or reader-visible route aliases. URL identity and machine identity remain independent.

This is important: a canonical machine migration should not be allowed to create a second, unnecessary public-web migration.

## 7. Blast radius proved before migration

The NOM-00 baseline found `HSA-P-*` at:

- **1,103 repository occurrences across 84 files**;
- **88** current public-site-source occurrences;
- **135** publication-source occurrences;
- **11** public-media occurrences;
- **8** public-machine occurrences;
- **179** rendered-site occurrences;
- **122** Working Edition occurrences;
- **6** Primer occurrences.

The coupling is not merely textual. Current canonical IDs participate in at least these dependency classes:

1. pattern frontmatter `id` values;
2. pattern relationship arrays and sequence references;
3. pattern-data validation (`HSA-P-xxx` syntax and referential integrity);
4. page headings and generated pattern indexes;
5. publication manifest/order and adapter-generated labels;
6. Reference House pattern selection/occurrence records;
7. compiler requirement provenance and pattern crosswalk fixtures;
8. tests/fixtures and deterministic reports;
9. public machine/data outputs;
10. SVG/generated/public artefact text where present.

This is sufficient to reject piecemeal replacement. NOM-06 must make the canonical-ID migration as one dependency-complete change and then regenerate outputs.

## 8. External compatibility position

No external consumer of the current pattern IDs is documented anywhere in the project’s authority, publication, compiler or release records. The repository currently has no declared public API contract for `HSA-P-*`.

That does **not** prove that nobody has ever copied an ID. It means there is no demonstrated compatibility obligation strong enough to justify permanent dual identity.

Therefore:

- do not add `legacyId` fields to every pattern;
- do not make loaders accept both `HSA-P-*` and `PAT-*` indefinitely;
- do not publish redirect/alias tables as a runtime contract;
- retain the migration mapping in the NOM closeout record and Git history;
- if a real external consumer is produced before NOM-06, reopen only the compatibility mechanism, not the reader-display decision.

## 9. Atomic migration contract for NOM-06

NOM-06 must satisfy all of the following in one migration slice:

1. generate/freeze the complete old→new mapping for active and retired canonical patterns;
2. update every canonical frontmatter ID;
3. update every relationship/sequence reference;
4. update Reference House occurrence/selection references;
5. update compiler provenance/crosswalk references and tests;
6. update pattern-ID validators to `^PAT-\d{3}$`;
7. update publication order references while preserving the exact curated order;
8. stop constructing public titles/headings/index labels by concatenating machine IDs;
9. make site full-corpus ordering consume the explicit reader order rather than ID sorting;
10. update public-machine artefacts deliberately;
11. regenerate site/PDF/generated outputs;
12. prove no current canonical/public `HSA-P-*` remains outside bounded migration/provenance records;
13. prove no runtime dual-ID compatibility layer was accidentally left behind.

The numeric suffix is preserved exactly during migration. `PAT-014` remains the successor of `HSA-P-014`; it does **not** become `PAT-003` merely because it is the third pattern encountered in the book.

## 10. Gate result

NOM-03 freezes two independent contracts:

### Display contract

**Pattern title is the reader identity. Machine IDs are hidden from ordinary book/site presentation.**

### Canonical identity contract

**Pattern machine identity migrates from `HSA-P-NNN` to `PAT-NNN`, preserving suffixes and joins, with no indefinite compatibility alias.**

Publication order remains a third, explicitly authored dimension.

The next gate is **NOM-04 — reader-facing reference architecture**.