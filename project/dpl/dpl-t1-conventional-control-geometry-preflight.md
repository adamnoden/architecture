# DPL-T1 — conventional replacement-control geometry preflight

**Parent gate:** #700 — DPL-T  
**Baseline main:** `59622075cf67e0bd7592480864ad37b5ef177817`  
**Date:** 2026-10-25  
**State:** `PREFLIGHT_IN_PROGRESS`

## Purpose

Find one conventional Greater-London street-front replacement-house control whose exact controlled SCREENING parcel geometry does **not** disprove placement of the unchanged `12.0 m × 10.8 m` Reference House.

Do geometry first. Do not spend on datum/access/full R1–R6 evidence until the parcel survives the footprint preflight.

## Typology filter

Prefer:

- existing house or bungalow demolished / credible one-for-one replacement lineage;
- detached dwelling on an ordinary road frontage / building line;
- reasonably conventional parcel shape;
- no rear-garage/backland access proposition;
- instrumented control only; excluded from DPL-16.

Do not select for planning likelihood, price or architectural sympathy.

## Initial bounded candidates

| Id | Site | Planning lineage | Initial typology disposition |
|---|---|---|---|
| `T1-01` | 41 Lennard Road, Bromley, BR2 8LN | `26/02618/FPA` | `ADMIT_TO_GEOMETRY_PREFLIGHT` — bungalow → detached house; ordinary frontage; prior applicant statement reports a large 827 m² curtilage, but that figure is context only, not geometry authority. |
| `T1-02` | 4 Ninhams Wood, Orpington, BR6 8NJ | `26/03641/FPA` / prior replacement lineage | `ADMIT_TO_GEOMETRY_PREFLIGHT` — bungalow → detached house; prior scheme reports dwelling width 12.93 m / amendment 11.8 m, useful context only. |
| `T1-03` | The Vicarage, 1B St James Road, Purley, CR8 2DL | `24/03371/FUL` | `ADMIT_TO_GEOMETRY_PREFLIGHT` — existing detached house + garage → detached house; driveway retained/altered; clean street-front replacement condition. |
| `T1-04` | 15 Fairholme Gardens, London, N3 3ED | `26/2227/FUL` | `ADMIT_TO_GEOMETRY_PREFLIGHT` — existing dwelling → detached dwelling with off-street parking. |
| `T1-05` | The Bungalow, Routh Road, London, SW18 3SW | `2025/1326` | `ADMIT_TO_GEOMETRY_PREFLIGHT` — bungalow → detached house; exact council coordinates already published. |
| `T1-X1` | 17 Tower Terrace, Wood Green, N22 6SX | `HGY/2026/2487` | `REJECT_TYPOLOGY_BEFORE_GEOMETRY` — although current wording says one new home, earlier Haringey history establishes garages/portacabins and prior rear-garden dwelling proposals; this is another backland/rear-site condition, not the clean road-front replacement experiment. |

## Preflight contract

For each admitted candidate, attempt in order:

1. exact address identity / UPRN;
2. exact HMLR / Planning Data title-boundary entity or equivalent controlled polygon;
3. freeze CRS, source identity and authority limitations;
4. transform to a metric CRS and test rigid containment of a `12.0 m × 10.8 m` rectangle;
5. classify only:
   - `CONTROLLED_SCREENING_GEOMETRY_DOES_NOT_DISPROVE_PLACEMENT`;
   - `CONTROL_SITE_SCREENING_GEOMETRY_NO_UNCHANGED_RH_PLACEMENT`;
   - `PREFLIGHT_IDENTITY_OR_SOURCE_NOT_RESOLVED`.

A positive preflight is not candidate readiness and not compatibility.

## Current source note

A disposable branch-only GitHub Actions probe is being used to cross public-source transport seams. It is acquisition scaffolding only and must be removed before any merge to `main`.
