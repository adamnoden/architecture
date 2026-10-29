# ROF-02 — Topology and geometry families

**Result:** complete at topology-research scope; no geometry selected or changed.  
**Date:** 2026-10-29.  
**Starting main:** `b8af3e6c` (full identity in integrating PR).  
**Programme:** [ROF](roof-systems-programme.md), issue #991.

## Result and source authority

[Roof topology and water paths](../../docs/research/roof-topology-families.md) defines the face/ridge/hip/valley/abutment/edge/eave/penetration/collection/concentration grammar, compares seven bounded families, treats parapets as a boundary overlay, and identifies hostile concentration/escape/access conditions. It applies the [ROF-01 frame](rof-01-evidence-and-evaluation.md) without creating a scalar complexity score or selecting a covering.

The current ring is more specific than “four hips”: `currentRoofZ()` in `compiler/reference-house/georgian/layout-family.ts` changes the function of each diagonal at the ridge. The outer segment is convex (hip); the inner segment is concave (valley). Thus the nominal source has eight fields, four ridge segments, four outer hips and four inner valleys terminating at the court corners. This is interpretation of the existing controlled geometry, not newly authored geometry or proof of drainage capacity.

`createLayoutRoof()` labels each whole diagonal with the primitive ID `hip-i`. That identifier must not be treated as a semantic classification of its inner part. No renderer ID/output is changed in this research packet. ROF-05 must resolve the four-way ridge/hip/valley junctions and inner valley discharge; later ROF-09/PLT admission should represent the selected topology explicitly rather than relying on these legacy IDs. The visible line itself is not geometrically misplaced by this finding.

## Reproducible geometry check

From this source baseline:

```sh
node --import tsx --input-type=module - <<'JS'
import {currentRoofZ} from './compiler/reference-house/georgian/layout-family.ts';
for (const t of [1000,2125,3000]) console.log({t,
  diagonal:currentRoofZ(t,t),sideA:currentRoofZ(t-100,t+100),sideB:currentRoofZ(t+100,t-100)});
JS
```

| Sample distance from south-west outer corner (mm) | Diagonal z (mm) | Each transverse sample z (mm) | Meaning |
|---|---|---|---|
| 1,000 | 7,266.308 | 7,219.677 | Diagonal is locally higher: outer hip |
| 2,125 | 7,790.904 | 7,744.273 | Ridge junction |
| 3,000 | 7,382.885 | 7,429.515 | Diagonal is locally lower: inner valley |

The south-west inner valley runs from ridge corner (2,125, 2,125) toward court corner (4,250, 4,250); the other three follow square symmetry. Samples are a check of the source expression, not independent physical evidence. For the nominal wall-line geometry its plan run is 2,125√2 ≈ 3,005.204 mm, fall ≈ 990.904 mm and inclination ≈ 18.249°. The calculation excludes selected weathering thickness, finished valley invert, eaves overhang and hydraulic corrections.

The outward-only challenger holds exterior eaves/pitch/wing depth solely for comparison: 6,800 + 4,250 tan(25°) ≈ 8,781.808 mm at the high court edge, about 990.904 mm above the present ridge. It cannot remove the inner valleys while silently retaining the old roof envelope. Lowering pitch or changing levels would require a separate coordinated design decision.

## Located handoff and exclusions

- **RWT:** preserve distributed inner eave flow plus the four valley-corner concentration zones. No equal-eight-way catchment split, effective area, outlet bore, gutter invert or safe courtyard spill route is established. Resolve operating overflow levels and downstream court/threshold consequences, not only the existence of an overflow symbol.
- **ROF-03/04:** test covering/assembly applicability at the actual face and valley conditions; 25° faces do not give 25° valleys. Drying and support continuity must survive corner/junction geometry.
- **ROF-05/06:** locate junction and access sequences, especially court corners, high edges and the ridge/hip/valley meetings. No safe walking surface or access method is assumed.
- **HAD/OAS/BCR:** outward-only geometry changes court enclosure/height and structural/support questions. Threshold authority remains OAS; no implicit opening change is made. BCR-WATER findings must be reconciled at selection when available.
- **ROF-07/RWT-07/shared gate:** use the current ring and outward-only ring as explicit comparison propositions, not a final shortlist that overrides covering/assembly evidence. Inward-only, compound and policy-excluded challengers retain their stated limits.

Simple unbroken gable/hipped roofs are conventional comparators, not ways to erase the accepted open courtyard without owner/design authority. No-flat-roof policy remains operative; low-slope research is not an upstream rewind. MRA/EPR/PHY/DEL/DPL evidence boundaries remain unchanged.

## Validation and completion limit

Checked the grammar against every named programme element, applied the ROF-01 failure/recovery frame, independently reviewed source formula and face construction, and executed the sampling/arithmetic above. External evidence has recoverable edition/section/access provenance in the study. No compiler implementation, physical test, site assumption or compliance claim was introduced. Appropriate repository checks and exact-head CI are recorded in the integrating PR.

This completes the bounded topology study. It removes one real prerequisite from ROF-05 and RWT-07; their remaining dependencies are not bypassed. A future change to the controlled roof invalidates this baseline-specific application and must trigger explicit reconsideration.
