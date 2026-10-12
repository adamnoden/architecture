# Reference House — RH-06 Service Crossing Register

**Status:** current RH-06 crossing authority  
**Date:** 2026-10-12  
**Parent gate:** [RH-06 Services and Failure Geography](service-topology-rh06.md)  
**Structural authority:** [RH-05 Structural Coordination](structural-coordination.md)

This register exists to stop significant service crossings becoming anonymous holes in permanent fabric.

The IDs below are project occurrences of `HSA-P-005 — Designed Structural Penetration`. They are coordination objects, not approved details. Every final opening remains subject to structural, fire, acoustic, weather, airtightness, thermal, moisture, pest and service-specific design as applicable.

| Occurrence | Route / service | Host / approximate location | Coordination envelope / intent | Protected obligations | Can it disappear? |
|---|---|---|---|---|---|
| `RH-P005-07` / `PEN-UE-01` | grouped utility entries: water, electricity, communications | east outer loadbearing/service wall into `G-PLANT-01` | several adjacent supplier-compliant sleeves / entries; **not** one mixed opening | bearing/lintel as required; weather; airtightness; thermal bridge; damp/pest/security; supplier separation; future replacement | location moves if real utility approach changes, but boundary crossings remain necessary |
| `RH-P005-08` / `PEN-SV-01` | `SV-01` vertical service zone | first-floor structure inside east-middle service/bathroom stack | approx. **1050 × 850 mm structural opening envelope** around 900 × 700 mm clear service reservation; final size by engineer | engineered trimming; diaphragm continuity; fire/acoustic closure; service supports; inspectable access; keep clear of `EB-*` lines and court reaction nodes | could shrink after MEP sizing; should not multiply into scattered holes without rewind |
| `RH-P005-09` / `PEN-FD-01` | 100 mm-class foul drain exit | east foundation / external wall zone below `G-PLANT-01` | one deliberate drain-wall/foundation crossing to external inspection chamber | foundation/load path; settlement allowance; gas/moisture seal; rodent control; access; flexible joints / detailing to Part H | no, if the selected stack remains here; coordinate vertically before foundations |
| `RH-P005-10` / `PEN-KX-01` | kitchen source-capture extract | east external wall of `G-KIT-02` | short dedicated duct penetration; exact duct size by hood/pressure-loss design | lintel/bearing if relevant; weather; airtightness; thermal; grease/cleaning; condensate; nuisance; terminal clearances | may move to north wall if real site makes east terminal unacceptable |
| `RH-P005-11` / `PEN-BX-01` | family-bathroom extract | east external wall of `U-BATH-01` | short high-level duct penetration | weather; airtightness; thermal/condensate; acoustics; external terminal relation to openings | may move locally with bathroom layout; no reason to route through floor structure |
| `RH-P005-12` / `PEN-HS-01` | external heat-source / future plant pipework if selected | east wall of `G-PLANT-01` | bounded sleeve group only if selected plant requires external connection | weather; airtightness; thermal; vibration; condensate; maintenance; replacement | **yes** — delete if selected plant is wholly internal / different topology |

## Local penetrations not yet given `HSA-P-005` occurrence IDs

The following are either non-structural, unresolved or too small/local to justify a project identity at RH-06:

- ordinary cable / small-bore branches through non-loadbearing partitions;
- direct utility/WC extract penetrations until the final south-service-band partition confirms their exact wall positions;
- roof termination of `FS-01` — RH-08 owns roof form and terminal geometry;
- future whole-dwelling ventilation ducts — no system has been selected;
- rainwater and courtyard drainage — RH-08;
- window/door service penetrations — none selected.

Issue new IDs only when geometry and host are real enough to coordinate.

## No-drill zones carried from RH-05

The crossing register does **not** license arbitrary drilling elsewhere. The following remain protected:

- courtyard corner reaction nodes;
- `EB-W-S`, `EB-E-S`, `EB-W-N`, `EB-E-N` edge-beam zones;
- stair trimmers around `ST-01`;
- opening lintel / bearing zones;
- primary structural deck/diaphragm except at engineered framed openings.

Service routes should move before these zones are casually penetrated.

## Update rule

Update this register when:

- RH-07 selects a whole-dwelling mechanical ventilation family;
- RH-08 resolves roof terminals / drainage;
- structural engineering changes the permissible opening families;
- service sizing changes an opening envelope materially;
- a real site changes utility/sewer approach;
- any route is deleted or duplicated.

An obsolete crossing remains provenance. Do not silently reuse its ID for a different hole.