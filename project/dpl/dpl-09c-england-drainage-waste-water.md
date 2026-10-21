# DPL-09C — England Drainage and Waste-Water Target Slice

**Issue:** [#400 — DPL-09C — England drainage and waste-water target slice](https://github.com/adamnoden/architecture/issues/400)  
**Programme:** [#299 — DPL](https://github.com/adamnoden/architecture/issues/299)  
**Authorised by:** [#390 — DPL-B2](https://github.com/adamnoden/architecture/issues/390)  
**Research baseline:** `c087127be0e184001a60728c437888fa9011f802`  
**Research date:** 2026-10-21  
**Disposition:** **PASS — bounded Part H technical target established; drainage design and whole-Part-H compliance remain external/unresolved**

## 1. Question

> **Which current England drainage obligations for one new detached dwelling can be represented natively, which depend on site/network facts, and which require external drainage/civil/authority evidence?**

The answer is deliberately asymmetric.

DPL can represent the exact Part H authority, obligation identity, statutory priority order and conditional applicability structure. It cannot infer the real sewer, decide whether a route is reasonably practicable, calculate hydraulic adequacy, author an infiltration system or manufacture sewer/environmental consent.

The resulting target is:

`project/dpl/targets/england-drainage-waste-water-v1.json`

---

# 2. Source hierarchy recovered

## 2.1 Statutory requirement

Primary target authority remains:

**The Building Regulations 2010, Schedule 1, Part H — Drainage and waste disposal.**

For this vertical the admitted requirements are:

- `H1` — foul water drainage;
- `H2` — wastewater treatment systems and cesspools, conditionally;
- `H3` — rainwater drainage;
- `H4` — building over sewers, conditionally;
- `H5` — separate systems of drainage, conditionally.

`H6` solid-waste storage is deliberately excluded from this water/waste-water vertical.

Canonical source snapshot remains the same Schedule 1 point-in-time source already used by DPL-09B:

`https://www.legislation.gov.uk/uksi/2010/2214/schedule/1/2026-07-20?wrap=true`

## 2.2 Official compliance guidance

Current official guidance page:

`https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h`

The GOV.UK page identifies Approved Document H as the current England statutory guidance and serves the **2015 edition**.

DPL-09C preserves the same distinction frozen in DPL-09A:

> **Approved Document H is an official compliance route/guidance source. It is not the statutory requirement itself.**

Detailed pipe sizing, gradients, protection, chambers and similar guidance may later support a selected technical method. DPL-09C does not reproduce or implement the entire document.

## 2.3 Sewerage law remains external authority

Water Industry Act 1991 section 106 provides the legal context for communication with public sewers:

`https://www.legislation.gov.uk/ukpga/1991/56/section/106`

That source is represented as **external primary legislation**, not as a hidden subsection of Part H.

A statutory right/process around communication with a public sewer is not proof that a particular connection:

- is physically available at the required level;
- has the represented ownership/status;
- can be made without undertaker requirements;
- is technically adequate;
- has actually been consented or constructed.

## 2.4 Non-mains environmental regime remains external authority

If a site leaves mains foul drainage and proposes a septic tank or small sewage treatment plant, a separate environmental-permitting regime may apply.

Current official Environment Agency source:

`https://www.gov.uk/government/publications/small-sewage-discharges-in-england-the-general-binding-rules/general-binding-rules-for-small-sewage-discharges-ssds-with-effect-from-2-october-2023`

The general binding rules applying from 2 October 2023 are legally distinct from Part H. Current guidance for discharges to ground was updated in July 2026, which reinforces the need to version this source independently rather than bury it inside an evergreen `H2` implementation.

DPL-09C therefore records an external-regime edge rather than pretending Building Regulations approval automatically establishes environmental-discharge legality.

---

# 3. H1 — foul water drainage

## Statutory structure

H1 requires an adequate foul-water drainage system carrying foul water to an ordered set of disposal routes:

1. public sewer;
2. where that is not reasonably practicable, a private sewer communicating with a public sewer;
3. where that is not reasonably practicable, a septic tank with appropriate secondary treatment or another wastewater treatment system;
4. where preceding routes are not reasonably practicable, a cesspool.

This is real deterministic authority: **the order itself is not optional project preference**.

But DPL-09C does not turn “reasonably practicable” into a boolean guessed from map distance.

## Method class

`EXTERNAL_DRAINAGE_DESIGN_EVIDENCE`

The target therefore requires, as applicable:

- external route geometry and levels;
- public/private sewer evidence;
- evidence supporting whether higher-priority routes are reasonably practicable;
- connection/legal evidence where relevant;
- competent drainage design.

## Reference House state

The house already has a strong building-side foul handoff through RH-06 / DPL-08C `W-H01`.

That is **partial architectural evidence only**.

Current result:

`UNRESOLVED`

because no real external foul destination, invert, route or connection evidence is admitted for the Reference Site.

---

# 4. H2 — non-mains treatment / cesspool

H2 is not universally due merely because Part H exists.

DPL-09C treats it as:

`CONDITIONAL_ON_NON_MAINS_FOUL_DISPOSAL_SELECTION`

If H1 resolves through mains/private sewer, H2's treatment-system duties are not the selected foul-disposal route.

If a septic tank / wastewater treatment system / cesspool is selected, H2 introduces separate requirements around:

- health and contamination avoidance;
- access for emptying and maintenance;
- power-failure performance where relevant;
- capacity;
- impermeability;
- ventilation;
- durable maintenance information where applicable.

The technical system remains external design.

Where the system discharges treated sewage to ground/surface water, Environment Agency general-binding-rule / permitting authority remains separate and must be independently satisfied.

Current result:

`UNRESOLVED`

because the foul-disposal class itself has not been evidenced/selected.

---

# 5. H3 — rainwater drainage

DPL-09C splits H3 into three obligations because they have different evidence/applicability questions.

## 5.1 `ENG-BR-H3-1-ROOF-RAINWATER`

H3(1) requires adequate provision for rainwater to be carried from the roof.

This applies to the Reference House work class.

Existing project evidence is unusually strong architecturally:

- RH-08 fixes outward-draining roof fields;
- outer collection is inspectable;
- primary roof drainage stays out of the courtyard;
- DRW-10C shows outward failure direction and collection relationships.

But none of that supplies:

- design rainfall;
- finished hydraulic falls;
- gutter/downpipe capacity;
- downstream hydraulic adequacy.

Therefore the method remains external drainage design and current result remains:

`UNRESOLVED`.

The architectural topology is useful evidence. It is not a statutory pass.

## 5.2 `ENG-BR-H3-2-PAVED-AREA-DRAINAGE`

H3(2) applies only to specified classes of paved area, including relevant access to buildings/dwellings and access to waste-storage areas/common passages within the statutory conditions.

It is therefore represented as a conditional obligation rather than “every external paved surface must satisfy this exact paragraph”.

DPL-08B establishes a principal accessible approach duty, but final paved extent/material/levels/drainage are not fixed.

Current result:

`UNRESOLVED`.

## 5.3 `ENG-BR-H3-3-RAINWATER-DISCHARGE`

Where H3 rainwater is discharged, the statutory priority is:

1. adequate soakaway / other adequate infiltration system;
2. watercourse where infiltration is not reasonably practicable;
3. sewer where neither preceding route is reasonably practicable.

The statutory exception for rainwater gathered for reuse is preserved.

DPL-09C records the priority order but deliberately does not auto-select a route.

Why:

- “adequate” infiltration needs real ground/groundwater/site design evidence;
- “reasonably practicable” is not reducible to garden area;
- watercourse legality/availability is external;
- sewer availability/connection is external;
- DPL-08C preserves several distinct building-side handoffs which may or may not ultimately share site infrastructure.

Current result:

`UNRESOLVED`.

---

# 6. H4 — building over sewers

H4 is strongly fact-gated.

Its application is tied to work over a drain/sewer/disposal main shown on the statutory map-of-sewers record, or work that may interfere with use/access to such an asset.

DPL-09C therefore requires:

- current sewerage-undertaker map evidence;
- site/building relationship to the mapped asset;
- surveyed position/depth where material;
- maintenance/access implications;
- undertaker evidence where build-over/diversion matters arise.

A line on:

- a marketing plan;
- a planning drawing;
- a generic web map

is not automatically the “map of sewers” evidence referenced by H4.

Current Reference Site / pilot evidence is insufficient to resolve applicability.

Current result:

`UNRESOLVED`.

---

# 7. H5 — separate drainage systems

A common modelling error would be to encode H5 as:

> `surfaceWaterSystemMustAlwaysBeSeparateFromFoul = true`

DPL-09C rejects that simplification.

The statutory application condition matters: H5 applies to the relevant erection/extension where it is reasonably practicable for H3 water to discharge directly/indirectly to a **separate surface-water sewer** shown on the map of sewers or under construction within the stated conditions.

Therefore the target requires evidence for:

- whether the H3 route is sewer-based;
- separate surface-water sewer evidence;
- statutory map / under-construction status;
- reasonable-practicability evidence;
- competent network/drainage design.

Current result:

`UNRESOLVED`.

This preserves law rather than generalising one familiar drainage convention into a fake universal rule.

---

# 8. H6 deliberately excluded

H6 covers solid-waste storage/access.

It shares the lettered Part H heading but is not a drainage/waste-water obligation.

DPL-09C therefore leaves it for a later refuse/access/planning vertical rather than broadening this packet for alphabetical completeness.

This is consistent with the DPL rule:

> **Decompose by coherent evidence/authority family, not by document table of contents.**

---

# 9. Part G boundary

DPL-09C does not implement Part G.

H1 already defines the foul-water drainage obligation from sanitary/food-preparation/washing wastewater.

Part G owns separate sanitary conveniences, water supply, hot-water safety/efficiency and related requirements. Those may later create source fixtures which connect physically to H1, but the legal authorities remain distinct.

No additional Part G obligation is required merely to prove this first external drainage target slice.

---

# 10. DPL-08C ownership seam

The coupled interface is now clean.

## DPL-08C owns

- `W-H01` foul building-side handoff;
- `W-H02` outer-roof ground handoffs;
- `W-H03` courtyard primary handoff;
- `W-H04` independent emergency-overflow handoff;
- `W-H05` building-edge/site-surface duties;
- architectural inspectability/failure/maintenance rules;
- Reference House rewind triggers.

## DPL-09C owns

- H1/H2/H3/H4/H5 source identity;
- statutory applicability;
- source-defined priority orders;
- method/evidence classification;
- statutory target result state.

## External actors own

- hydraulic adequacy;
- site/network survey;
- infiltration/ground adequacy;
- detailed drainage design;
- undertaker connection/build-over determinations;
- environmental-permitting / small-sewage-discharge legality;
- planning conditions/permission where applicable.

The same fact can be referenced by several objects without duplicating authority.

---

# 11. Structured target design

The target uses the already-controlled:

`dpl.englandTechnicalSlice.v1`

shape rather than inventing a new drainage-specific schema.

Method classes are deliberately compatible with the DPL-12A orchestration vocabulary:

- `NATIVE_DETERMINISTIC` for explicit applicability gates only;
- `EXTERNAL_PROFESSIONAL_EVIDENCE` for drainage/ground engineering;
- `EXTERNAL_EVIDENCE_AND_INSPECTION` for network/asset/consent and environmental evidence.

No new runtime method class was required.

This is evidence that the DPL-12A abstraction survives its first post-B2 technical target without immediate generalisation.

DPL-12A is not automatically extended to compile this target in this packet. The post-Wave-C integration gate should decide whether target-composition expansion belongs in 12B or is already naturally supported by the existing loader/orchestrator.

---

# 12. Current Reference House target disposition

| Obligation | Current state | Why |
|---|---|---|
| H1 foul drainage | `UNRESOLVED` | Building-side handoff exists; external route/network/levels/design absent. |
| H2 treatment/cesspool | `UNRESOLVED` | Applicability depends on selected/evidenced foul-disposal route. |
| H3(1) roof rainwater | `UNRESOLVED` | Strong architectural topology; no hydraulic sizing/receiving-route proof. |
| H3(2) paved-area drainage | `UNRESOLVED` | Applicable paved-area extent/final levels/drainage unresolved. |
| H3(3) rainwater discharge | `UNRESOLVED` | Infiltration/watercourse/sewer priority outcome not evidenced. |
| H4 mapped sewer | `UNRESOLVED` | No authoritative mapped-asset/site-interference evidence admitted. |
| H5 separate systems | `UNRESOLVED` | Sewer route + separate-surface-water-sewer application conditions unknown. |

This is a useful target result, not failure of the model.

---

# 13. Red-team findings

## “Approved Document H says it, therefore it is law”

**REJECTED.** Schedule 1 is the statutory requirement; Approved Document H remains official compliance guidance.

## “H1 means public sewer must always be used”

**REJECTED.** Public sewer is first in the statutory priority, but the requirement itself contains reasonable-practicability fallbacks.

## “A public sewer right means the connection is solved”

**REJECTED.** Water Industry Act authority, physical/network facts, undertaker process and technical adequacy remain distinct.

## “H3 requires a soakaway”

**REJECTED.** H3 establishes a priority order beginning with adequate infiltration where reasonably practicable. It does not establish that this site has adequate infiltration.

## “H5 always requires separate systems”

**REJECTED.** The statutory application conditions are part of the rule.

## “RH-08 already passes H3”

**REJECTED.** RH-08 proves a strong architectural water topology and explicitly defers hydraulic/site discharge.

## “Non-mains H2 compliance means Environment Agency discharge rules are solved”

**REJECTED.** Environmental discharge legality is separate authority.

## “Part G belongs here because toilets make foul water”

**REJECTED.** Physical connection does not erase legal/evidence boundaries.

---

# 14. Consequences

## For DPL-12A

No new fundamental orchestration concept is earned.

The new target reuses:

- source snapshots;
- applicability;
- method classes;
- external evidence;
- unresolved result semantics;
- external-authority edges.

The post-Wave-C gate can therefore test DPL-12A against this target without first redesigning the runtime.

## For DPL-14C

The five-site gap-correction cohort now has precise drainage evidence questions to attack, especially:

- authoritative sewer evidence;
- flood/water context;
- reliable topography/levels;
- environmental discharge constraints;
- source/spatial/temporal provenance.

## For DPL-10C

Croydon planning drainage conditions/history may supply proposal-specific evidence, but must not be misused as current site network proof or Part H discharge.

## For DRW

No new construction drawing authority is created.

A future analytical handoff may show statutory/site uncertainty around the existing water topology, but not pipe sizes, underground routes, chambers or compliance marks.

---

# 15. Disposition

**DPL-09C PASS — the first England drainage/waste-water target slice is now controlled.**

The model is intentionally honest:

```text
EXACT PART H AUTHORITY
        +
CONTROLLED HOUSE HANDOFFS
        +
REAL SITE / NETWORK EVIDENCE
        +
EXTERNAL TECHNICAL METHOD
        ↓
PART-H OBLIGATION RESULT
```

not:

```text
HOUSE HAS GUTTERS
        ↓
PART H PASS
```

No drainage design, environmental permit, sewer consent, whole-Part-H compliance or site compatibility is claimed.