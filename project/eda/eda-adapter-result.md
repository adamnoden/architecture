# Authored ownership of Primer prose

**Result:** complete as a bounded source-ownership correction. This is not renewed editorial assurance, physical print acceptance or architectural validation.

## Question and starting authority

At main `d419d4b72b6691ddff26804dbef66ed4d9cc1c58`, could every substantive assertion emitted by the Primer be traced to an authored source, and would changing that source reach publication preparation and the editorial corpus?

The [owning programme](../../docs/editorial/eda-programme.md#eda-adapter--authored-ownership-of-publication-prose), [editorial doctrine](../../docs/editorial/editorial-doctrine.md) and [publication architecture](../../docs/manuscript/publication-architecture.md) govern this repair. The adapter previously contained architectural framing for patterns and the Reference House, plus the constitution's introductory qualification. The former pattern dependency list covered only six expanded examples even though the map consumed all active pattern titles.

## Ownership and composition

| Emitted material | Authored owner after repair | Mechanical adapter duty |
|---|---|---|
| Constitution introduction and heading | [constitution fragment](../../publication/primer/constitution.md) | Insert governing constraints and the eleven ordered source provisions, retaining each first supporting paragraph |
| Four authority levels, pattern scope/evidence qualification, inventory sentence and example-selection explanation | [pattern fragment](../../publication/primer/patterns.md) | Insert the complete canonical pattern map and six existing selected source excerpts; derive inventory numbers |
| Reference House framing, inter-layer qualification and orientation caption | [Reference House fragment](../../publication/primer/reference-house.md) | Insert the existing two scope paragraphs, authority chain, two coordination paragraphs and figure location |
| Proposition and outlook | Existing authored Primer pages | No change |

These narrow fragments use the existing `publication/primer/` authored-source exception. They are editorial compositions, not a second doctrine or a replacement for the governing manuscript, pattern or Reference House sources. The [build README](../../publication/README.md#authored-primer-framing) makes this distinction discoverable. Presentation, selection and compression remain in the adapter; substantive framing no longer does.

Explicit composition markers must occur once. Missing, duplicate or unknown markers fail, rather than silently omitting a qualification. There is no new prose or inventory registry. Active pattern count uses the same canonical ordered active metadata as the map; strategy/candidate counts use the existing publication manifest, currently 21 / 3 / 4. English number formatting preserves the existing sentence bytes. No pattern maturity is inferred from those counts.

## Dependency and mutation evidence

All three authored fragments are declared through `dependenciesForAdapter`. The pattern adapter declares every pattern source selected by the existing publication manifest, including the fifteen unexpanded examples. Publication preparation hashes these dependencies and reads their working copies; the existing EDA candidate discovery includes and hashes the same sources. Its existing committed membership check continues to bind the publication manifest, adapter, public boundary and canonical pattern order. No parallel membership list or new build cache is introduced.

Three permanent regressions exercise actual source changes in isolated temporary copies: each framing source changes emitted text and source identity; a non-expanded pattern title changes the full map and is a declared dependency; missing, duplicate and unknown composition slots reject. These are propagation and fail-closed checks, not architectural truth tests. The actual EDA discovery command is also run against the committed source; its historical accepted candidate register is restored byte-for-byte after inspection, because this ownership repair does not reopen that prior audit.

The actual committed-source discovery at local validation tree `a4e3c3c35b8751a10690e95a317b807077a8681c` found all three new fragments among 152 sources with SHA-256 values matching their bytes. A private Git-tree mutation of only the constitution fragment was then supplied to the same unmodified discovery command: its recorded hash changed from `8502b02055a6599b303467169b4b5b4c506130b515938751b3f6c4d6dc510468` to `78d8df7e15f19c6f752b973a79d38a45f43163dac39fcada4180888d62aaa0eb`. Membership imports and canonical working files stayed unchanged. This directly verifies corpus identity propagation; it does not claim a build-cache invalidation mechanism. The private probe is not a publication source or released evidence object.

## Before/after comparison and validation

All five adapted Primer entries and all five prepared entry Markdown files are byte-identical before and after this correction. No deliberate reader-text or layout change is introduced. Adapted UTF-8 SHA-256 identities are:

| Entry | Unchanged SHA-256 |
|---|---|
| Proposition | `841ff6aef605ab99bebf48db5f4ae519ba4de984a4e2b174a42c560b71be6ffe` |
| Constitution | `936e2bbcdd1a5e7a8bcd52258bf2a5a999191eba30ffe4624a19785bc725fa44` |
| Patterns | `9b661526881f7e87a9e8eb2621f16641271a6ad016e1b9022b0c887d8b4282e1` |
| Reference House | `63f6b64ebc8083bef153c337332138caebe68443622d5549fba2f064a97f2c60` |
| Outlook | `93a59ef952bb74a39e7970ae0f23887558871d022fe494dddbb23ad34145ff89` |

Local checks cover the three regressions, TypeScript, publication source/adapter validation, publication integrity, Primer preparation, repository/workflow integrity and public-source checks. The new regression command is part of canonical repository health. Exact-head full CI, including applicable publication proofs, is required before merge and recorded in the integrating PR. Local pinned Chrome is unavailable; byte-identical prepared input is the direct evidence that this repair does not alter layout, not a claim of a new physical print verdict.

## Consequences and limits

The source-ownership prerequisite is discharged. Enlarged-book assurance still depends on the final publication gate; manuscript argument review remains separate. Existing qualifications, inventory meaning and architectural authority are preserved. Future architectural or editorial corrections must change their authored owners, propagate through the declared composition and be reviewed on their own merits. This repair does not endorse every inherited assertion merely because it now has a discoverable source.
