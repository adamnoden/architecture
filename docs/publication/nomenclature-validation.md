<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-05 Namespace Governance and Validation

**Status:** NOM-05 contract established; source/rendered enforcement is active and adversarially proven through NOM-09.
**Canonical registry:** `project/nomenclature.ts`  
**Validator:** `scripts/validate-public-nomenclature.ts`  
**Inventory:** `scripts/nomenclature-inventory.ts`  
**Tracking issue:** #156  
**Draft PR:** #157

## 1. Authority

`project/nomenclature.ts` is the single owner of governed namespace meaning, class, allowed surfaces, stability and brand-coupling policy.

The inventory scanner and public validator consume that registry. They do not maintain independent regex catalogues for the same families.

`project/identity.ts` remains authoritative for project/subsystem human names. The nomenclature registry imports those names rather than redefining them.

This gives the repository three deliberately different layers:

```text
project/identity.ts
    human project/subsystem identity

project/nomenclature.ts
    namespace meaning + exposure contract

validators/renderers
    consume the above contracts
```

## 2. High-confidence validation boundary

The new public validator deliberately enforces only claims regex can establish reliably.

A family is **reader-prohibited** when its NOM registry has no allowed surface among:

- `BOOK_PRIMARY`;
- `BOOK_TECHNICAL`;
- `SITE_PRIMARY`;
- `SITE_TECHNICAL`.

Those families must not appear in:

- current public Markdown/source dependencies;
- rendered site HTML;
- Working Edition text;
- Primer text.

This catches workflow, provenance-only, legacy-prohibited and machine-only identities without pretending that a regex can understand every editorial context.

By contrast, a family such as `M1`–`M5` is `PUBLIC_TECHNICAL`. The validator does **not** simply ban it everywhere. NOM-07/NOM-08 and surface-specific rendering rules judge whether a particular occurrence is useful and explained.

That asymmetry is intentional. The automated rule is strict where meaning is unambiguous and conservative where interpretation requires reading.

## 3. Source and rendered modes

`scripts/validate-public-nomenclature.ts` has two explicit modes.

### `--source`

Scans:

- `README.md`;
- reader-facing Markdown selected by `project/public-surface.ts`;
- all Working Edition and Primer primary/adaptor dependency sources.

It requires no generated site or PDF and can therefore run inside the ordinary repository test phase.

### `--rendered`

Requires and scans:

- `.vitepress/dist/**/*.html`;
- `publication/dist/ovids-house.pdf` text extraction;
- `publication/dist/ovids-house-primer.pdf` text extraction.

This closes the source-only gap: adapter-generated strings, headings assembled during publication preparation and rendered navigation are governed too.

The CI activation point is after the site and both PDFs exist.

## 4. Why enforcement is not activated before NOM-06

The NOM-00 baseline proves that several newly prohibited families still occur on current public surfaces by design debt rather than validator failure. Most visibly, `HSA-P-*` occurs 122 times in the Working Edition and 179 times in the rendered site.

Turning the new validator on before migration would create one of two bad outcomes:

1. knowingly red CI with no additional information; or
2. a large temporary allowlist that immediately becomes new sediment.

NOM-05 therefore freezes the validator **without** wiring it into required CI yet. NOM-06 performs the approved migrations and activates source/rendered enforcement in the same bounded change that removes the known violations.

There is no baseline exemption list.

## 5. Existing sanitation validator

`scripts/validate-resolved-public-surface.ts` remains useful for prose/process residue and links into internal records. It is not replaced wholesale.

Its existing hand-written namespace checks should be reduced over time where the canonical NOM registry expresses the same rule, but PUB-NOM does not broaden into an unrelated sanitation refactor. The new validator owns governed identifier families; the existing validator continues to own other high-confidence resolved-surface residue.

Likewise `scripts/validate-project-brand.ts` remains the project-name boundary check. Namespace validation complements it by governing acronyms/prefixes and compact machine/workflow identities.

## 6. New-family admission rule

A new compact public identity is not valid merely because it avoids an existing regex.

Before a project-owned identifier family can be intentionally public it must:

1. enter `project/nomenclature.ts`;
2. state its meaning and owner;
3. receive one of the canonical NOM classes;
4. declare allowed surfaces;
5. declare stability and brand-coupling policy;
6. have a real reader or machine task.

NOM-05 does not attempt to auto-detect every possible uppercase token. The generic inventory queue remains the discovery mechanism; governance begins when a project-owned family crosses the admission rule.

## 7. Pattern migration proof support

`nomenclature-inventory.ts` now accepts a targeted file-list argument:

```text
npm run nomenclature:inventory -- --files=pattern.hsa
```

This exposes the complete repository file set carrying one governed family while retaining the normal aggregate baseline report. It exists to prove migration blast radius before an atomic namespace change, not as a second source of namespace definitions.

## 8. NOM-06 activation requirements

NOM-06 must not declare migration complete until all of the following are true:

- `pattern.hsa` is reclassified as legacy/prohibited and the new neutral pattern family is registered;
- all machine joins use the new canonical pattern identity;
- reader renderers suppress machine pattern IDs;
- approved workflow-code replacements are applied on public sources;
- approved neutral machine-name migrations are complete or explicitly deferred with rationale;
- `validate-public-nomenclature.ts --source` passes;
- site and both PDFs are regenerated;
- `validate-public-nomenclature.ts --rendered` passes;
- both modes are wired into CI at their appropriate lifecycle points;
- no permanent compatibility allowlist was introduced merely to obtain green CI.

The next gate is **NOM-06 — execute approved migrations in dependency order**.