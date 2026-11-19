# Read-only model inspection for the front Study bay

ADE resolves `BAY-FRONT-STUDY-01` to `GROUND/south-window-0` on `GROUND/outer-south` in the exact `RH-LAYOUT-REVISION-02` snapshot. The [bay brief](../bcr/bay-brief-result.md) owns the occurrence and inspection purpose. [CCR-CURRENT-SOURCE](../ccr/current-source-result.md) owns the versioned layout and its source bindings.

[The inspection adapter](../../compiler/reference-house/construction-bay/opening-inspection.ts) validates the supplied snapshot through the current-design resolver. It looks up the host through the existing snapshot wall geometry and resolves its assembly by ID. ADE compiles the wall cut from the derived host and opening. The schedule row then measures that same cut. The [generated inspection](studies/front-study-inspection.json) records the 1000 mm aperture at X1300–2300, the 417.5 mm nominal host-depth reservation, the source ID and semantic digest, the ground datum and the unresolved fields. The shared occurrence and assembly IDs carry through the view and row.

The accepted Georgian plan basis carries its nominal layout scope. A contrast specimen carries candidate scope and receives an empty discipline-binding list. Geometry values remain provisional for construction. Inspection exposes unresolved sill and head data, installed component records and quantities with references to the owning section, OAS and BCR inputs. The authored section stays with its existing source. Nominal assembly depth supplies the plan thickness used by the inspector. Selection of a complete assembly and its component identities requires an admitted design input.

## Technical bay applicability

The [composed SAP-C1 investigation](../bcr/bay-interface-study.md#use-the-selected-service-house-with-its-structural-boundary-intact) uses the same hosted Study opening identifier at X2100, with a 429.5 mm room-side wall, segmental head and RC jambs. The nominal snapshot locates it at X1800. The inspector reports `technicalBayApplicability: withheld` and links the composed study. A later source adapter must join the actual occupied geometry, structural backing and adopted assembly on their controlling versions. Retain the BCR-BAY-DESIGN and HRS-TECHNICAL requirements for technical details, schedules and evidence. ADE-EVIDENCE also retains CCR-IDENTITY and PCO-APPLICABILITY.

## Verification

The [tests](../../compiler/reference-house/ade-opening-inspection.test.ts) exercise the model and row together.

| Input change | Observed result |
| --- | --- |
| Widen the candidate Study aperture from 1000 to 1100 mm | The ADE cut and row move from X1300–2300 to X1250–2350. The occurrence, cut and row IDs stay stable, and the independent first-floor row stays equal. |
| Add 20 mm to the candidate host assembly depth | The cut and row use 437.5 mm. The opening width, assembly ID and unresolved fields stay equal. |
| Remove or rename the host assembly or aperture, or use the wrong host or storey | Reference resolution rejects the input. |
| Present changed geometry with the accepted Georgian source label | Current-design applicability rejects it. |

```sh
node --import tsx --test compiler/reference-house/*.test.ts compiler/architectural-drawing/*.test.ts
npm run typecheck
node --import tsx project/ade/studies/front-study-inspection.ts | diff - project/ade/studies/front-study-inspection.json
```
