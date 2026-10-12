# Reference House — Service Crossing Register

**Status:** current crossing authority through RH-08  
**Date:** 2026-10-12  
**Originating gate:** [RH-06 Services and Failure Geography](service-topology-rh06.md)  
**RH-07 ventilation addendum:** [RH-07 MVHR Service Topology Addendum](service-topology-rh07-mvhr-addendum.md)  
**RH-08 roof/drainage gate:** [RH-08 Roof, Drainage and External Maintenance](roof-drainage-access-rh08.md)  
**Structural authority:** [RH-05 Structural Coordination](structural-coordination.md)

This register exists to stop significant service crossings becoming anonymous holes in permanent fabric.

The IDs below are project occurrences of `HSA-P-005 — Designed Structural Penetration`. They are coordination objects, not approved details. Every final opening remains subject to structural, fire, acoustic, weather, airtightness, thermal, moisture, pest and service-specific design as applicable.

| Occurrence | Route / service | Host / approximate location | Coordination envelope / intent | Protected obligations | Can it disappear? |
|---|---|---|---|---|---|
| `RH-P005-07` / `PEN-UE-01` | grouped utility entries: water, electricity, communications | east outer loadbearing/service wall into `G-PLANT-01` | several adjacent supplier-compliant sleeves / entries; **not** one mixed opening | bearing/lintel as required; weather; airtightness; thermal bridge; damp/pest/security; supplier separation; future replacement | location moves if real utility approach changes, but boundary crossings remain necessary |
| `RH-P005-08` / `PEN-SV-01` | `SV-01` vertical service zone | first-floor structure inside east-middle service/bathroom stack | approx. **1050 × 850 mm structural opening envelope** around 900 × 700 mm clear service reservation; RH-07 includes supply/extract MVHR trunks in the bundle; final size by engineer | engineered trimming; diaphragm continuity; fire/acoustic closure; service supports; inspectable access; keep clear of `EB-*` lines and court reaction nodes | could shrink after MEP sizing; should not multiply into scattered holes without rewind |
| `RH-P005-09` / `PEN-FD-01` | 100 mm-class foul drain exit | east foundation / external wall zone below `G-PLANT-01` | one deliberate drain-wall/foundation crossing to external inspection chamber | foundation/load path; settlement allowance; gas/moisture seal; rodent control; access; flexible joints / detailing to Part H | no, if the selected stack remains here; coordinate vertically before foundations |
| `RH-P005-10` / `PEN-KX-01` | kitchen source-capture extract | east external wall of `G-KIT-02` | short dedicated duct penetration; exact duct size by hood/pressure-loss design | lintel/bearing if relevant; weather; airtightness; thermal; grease/cleaning; condensate; nuisance; terminal clearances | may move to north wall if real site makes east terminal unacceptable |
| `RH-P005-11` / `PEN-BX-01` | **fallback** direct family-bathroom extract | east external wall of `U-BATH-01` | RH-06 direct high-level duct penetration; RH-07 supersedes this as baseline with central MVHR extract but keeps the hole family as fallback if MVHR is rejected | weather; airtightness; thermal/condensate; acoustics; external terminal relation to openings | **yes** — delete if selected MVHR remains viable |
| `RH-P005-12` / `PEN-HS-01` | external heat-source / future plant pipework if selected | east wall of `G-PLANT-01` | bounded sleeve group only if selected plant requires external connection | weather; airtightness; thermal; vibration; condensate; maintenance; replacement | **yes** — delete if selected plant is wholly internal / different topology |
| `RH-P005-13` / `PEN-MV-01` | MVHR outdoor-air intake + exhaust boundary crossing family | **east/service-side high-level wall preferred by RH-08** close to `G-PLANT-01` | two dedicated air routes; may be two separate physical penetrations; short insulated path; no courtyard exhaust | weather; airtightness; thermal/condensation; acoustic breakout; intake/exhaust separation; contamination/nuisance; inspection/cleaning; structural bearing if wall route used | roof route remains fallback if MEP separation/nuisance checks invalidate wall location |
| `RH-P005-14` / `PEN-CD-01` | courtyard primary rainwater drain + independent emergency overflow | east ground/service-side fabric beneath `G-GAL-01` / `G-SVC-02` route to external service-side inspection/discharge | two straight, separately functioning conduits; primary from accessible court collector; overflow inlet set higher and discharging visibly outside | foundation/slab load path; settlement; moisture/gas/pest seal; rodding/access; threshold/overflow levels; no hidden maintainable joint beneath principal room | location may move locally with ground/foundation design; independent overflow principle remains |
| `RH-P005-15` / `PEN-SV-RF-01` | 100 mm-class soil/vent stack roof termination | east/service roof field near outer service edge | single sparse roof penetration; location kept clear of principal front and later MVHR intake clearances | waterproofing/flashing; structure; airtight/thermal continuity; terminal clearances; inspection from planned external roof access | could move to compliant wall/roof alternative if drainage design proves it; current baseline expects roof termination |

## Local penetrations not given separate `HSA-P-005` occurrence IDs

The following are either non-structural, unresolved or too small/local to justify another project identity:

- ordinary cable / small-bore branches through non-loadbearing partitions;
- local MVHR supply/extract branches running parallel within coordinated floor/ceiling bays without crossing primary structure;
- direct utility/WC extract penetrations if later retained outside the central MVHR network;
- outer rainwater downpipe connections into ground gullies — external replaceable drainage interfaces rather than structural fabric crossings;
- window/door service penetrations — none selected.

Issue new IDs only when geometry and host are real enough to coordinate.

## No-drill zones carried from RH-05

The crossing register does **not** license arbitrary drilling elsewhere. The following remain protected:

- courtyard corner reaction nodes;
- `EB-W-S`, `EB-E-S`, `EB-W-N`, `EB-E-N` edge-beam zones;
- stair trimmers around `ST-01`;
- opening lintel / bearing zones;
- primary structural deck/diaphragm except at engineered framed openings.

MVHR branch corridors and RH-08 drainage crossings must respect these zones. Selection of a service route is not permission to perforate the short-span structure indiscriminately.

## Update rule

Update this register when:

- RH-09 creates further opening/threshold/interface crossings;
- competent MEP design changes MVHR duct sizes or terminal geography;
- structural/foundation engineering changes permissible opening families;
- hydraulic design changes courtyard drain/overflow envelopes;
- a real site changes utility/sewer/rainwater approach;
- any route is deleted or duplicated.

An obsolete crossing remains provenance. Do not silently reuse its ID for a different hole.