<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-06 migration closeout

**Gate:** NOM-06 — execute approved migrations in dependency order  
**Status:** COMPLETE  
**Draft PR:** #157  
**Tracking issue:** #156  
**Migration implementation head before this record:** `61a55804e75606755b5d57d3afd4fae7439a3479`

## Result

The approved nomenclature migrations are complete. NOM-06 changed identity and exposure contracts without broadening the architectural proposition.

The resolved system now separates:

- reader-facing names from machine identity;
- stable identity from publication order;
- public/technical references from workflow provenance;
- current neutral machine namespaces from superseded brand-coupled namespaces.

## Pattern identity

Canonical pattern machine identity migrated atomically from `HSA-P-NNN` to `PAT-NNN`, preserving numeric suffixes. Human-readable pattern routes remain unchanged. Pattern titles are the ordinary reader identity and publication order is authored independently through the reader-order contract rather than inferred from machine IDs.

No compatibility alias was retained because no external consumer requiring one was demonstrated. The old `HSA-P-*` family is explicitly legacy/prohibited outside bounded provenance.

## Reference House output identity

The remaining approved brand-coupled machine migration was completed at NOM-06 closeout:

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

`RH` denotes the stable Reference House domain rather than the current master-project title. `HK-RH-COMPILE-*` remains separately valid because `HK` denotes the durable House Kernel architectural system, not Ovid’s House.

The generated output manifest and project data plate were regenerated to the neutral contract. The old `OH-RH-*` family is now explicitly legacy/prohibited outside provenance.

## Other namespace decisions

All families resolved by NOM-02/NOM-03 now carry final migration status in `project/nomenclature.ts`; temporary `NOM02_REVIEW` / `NOM03_REVIEW` states have been removed from the registry type.

Legacy House-Kernel-derived site build metadata keys are recorded as prohibited legacy identity. The implementation now uses neutral generic build metadata and therefore does not require a new project-owned namespace family.

Legacy `D-F*` figure identity remains `REPLACE_REQUIRED` because replacement publication figure-reference architecture belongs to DRW. This is an explicit sibling-programme dependency, not unfinished NOM-06 migration work.

## Enforcement

The NOM validator is active in both source and rendered modes. PR CI builds the site, Working Edition and Primer, checks source nomenclature, scans reader-facing SVG assets, validates rendered outputs and exercises the pattern display/order regression locks.

NOM-06 does not claim that every surviving reader-visible number is editorially optimal. That judgement is deliberately deferred to NOM-07/NOM-08.

## Handoff

Resume at **NOM-07 — whole-corpus first-reader nomenclature audit**.

Do not reopen the completed migrations by preference. New evidence may reopen a decision; ordinary editorial discomfort belongs in the NOM-07 cold-reader audit and NOM-08 number/order/version semantics audit.
