# ROF-04 — Assembly beneath the covering

**Result:** complete at bounded comparison scope; no roof assembly selected.  
**Date:** 2026-10-29.  
**Starting main:** `fde0b81d7fca2a39d9d01532a80e0125485583d5`.  
**Programme:** [ROF](roof-systems-programme.md), issue #991.  
**Canonical packet:** ROF-04, including aliases ROF-04A and ROF-04B under one lease.

## Question and answer

Which under-covering assemblies deserve coordinated comparison for the owner's house, and what hidden fit or recovery assumptions would invalidate them?

The [assembly study](../../docs/research/roof-assembly-options.md) compares ceiling insulation/unheated roof space, slope insulation with ventilation above, over-structure insulation and system-specific compact construction. It retains the first and third as ordinary starting comparators, makes the slope-ventilated alternative conditional on located continuity, and rejects unassessed hybrid changes rather than all technically justified hybrid roofs. This is a research shortlist, not an architectural/thermal selection.

ROF-04A covers air/vapour/thermal boundaries, water versus ventilation/drying routes, construction moisture, ring obstructions, junction continuity and repair. ROF-04B traces covering-to-building support, underlay drainage, substrate chemistry/stiffness, fixed/sliding movement, over-insulation attachment, wind/fire dependencies and renewal. Neither alias needs a new node, schema or separate authority.

## Source-derived fit findings

Read `compiler/reference-house/georgian/layout-family.ts`, `layout-revision.ts`, `section-source.ts` and their current exported objects. The roof band uses `currentRoofZ - roofBuildZone` with `roofBuildZone = 300`: a vertical separation. On the 25° face its normal separation is `300 cos(25°) = 271.892336 mm`, not a selected build-up.

`sectionAssemblyChoices.roofCeiling` records top 6690, member 125, lining 15 and deck 22 mm. The represented ceiling underside is 6550 mm; deck top is 6712 mm. `layoutSectionAt(5900).storageDeckRuns` returns south `[1000,3250]` and north `[8750,11000]`. On the south run, `currentRoofZ(5900,y)-300-6712` is 254.307658 mm at y=1000/3250 and 778.903774 mm at y=2125. This is raw geometric space, not task/access/insulation clearance or a selected storage use. At the eave reference lower trace6500 versus ceiling underside6550 flags a located edge-section obligation, not proof of an occupied-room clash.

These calculations were reproduced by importing the exported current functions/objects. No source/model change, visual tolerance or numerical performance test was introduced. They make the 300 mm reserve and supposed loft access explicit constraints for candidate design, rather than allowing a generic roof detail to imply fit.

## Evidence and discrimination

The public record identifies retrieved government, NHBC, manufacturer, trade-association and Historic England evidence with locators, editions and limits. The 2025 NHBC chapter was available through indexed primary extracts; direct retrieval returned403, so the result does not claim to have read the current2026 manual. No paywalled standard, system certification, installation dimension, lifespan, wind loading or condensation calculation is invented.

The comparison survives six adverse cases: air-boundary defect, enclosed construction moisture, obstructed ventilation/storage, primary damage with common blocked secondary exit, restrained movement, and renewal of a buried layer. It distinguishes actual ventilation from vapour permeability, secondary drainage from emergency overflow, and demountability from local access. Conventional systems can win if they earn fit and recovery; no bespoke roof or test is presumed necessary.

## Handoffs and acceptance boundary

- ROF-03 supplies covering-specific support, separation, movement and compatibility; ROF-05 locates ridge/valley/eave/penetration assemblies using ROF-02's four inner valley corners.
- ROF-06 must test actual approach, working position, tool/part handling and removal order. The shallow storage representation is not an internal maintenance route.
- RWT-02/03 and later failure/access work receive separately located covering and secondary-drainage exits, collector back-up effects and ventilation/renewal envelopes. Do not assume a common collector is independent redundancy.
- [BCR-014](../bcr/construction-resolution-matrix.md), BCR-STRUCTURE/WATER and the shared roof-water gate receive support, full-layer fit, edge and access obligations. This study does not amend or close the shared matrix; the owning physical studies and PREFLIGHT retain that role. Essential fit conflicts cannot be deferred as generic specialist detail.
- MRA/EPR receive the selected moisture/structural/fire propositions when available; DEL receives closure/inspection and reinstatement duties. Actual site exposure and competent review remain outside this research completion.

The study could be falsified by a viable missing assembly family, a real route that overturns a claimed obstruction, an incompatible shortlisted system, or a located assembly/access section that changes the source-derived fit assessment. Reconcile the result explicitly when those facts arrive.

## Validation and limits

Programme coverage, current-source arithmetic, known roof/water seams and evidence attribution were checked. Repository/control/public-surface checks and exact-head full CI are recorded in the integrating PR. No physical, structural, hygrothermal, regulatory or workmanship validation is claimed. No geometry, no-flat-roof constraint, covering/insulation selection, maturity or authority ceiling changes. Completing ROF-04 removes only its dependency from ROF-05; ROF-03 remains independently required.
