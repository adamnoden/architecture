# DPL-T9 — Lennard measured side-boundary and maintenance geometry brief

**Control:** `DPL-T-CONTROL-004` — 41 Lennard Road, Bromley, BR2 8LN  
**Candidate:** `DPL-T-CANDIDATE-004-01` / rev 0.1  
**Assurance:** SCREENING evidence acquisition brief only  
**Status:** brief authored; **nothing commissioned**

## Decision question

> For the already-authored unchanged Reference House placement, what are the real physical side clearances along the east and west elevations, and do those dimensions support both the protected maintenance geography and the explicit Bromley Policy 8 one-metre side-space floor?

One measured-geometry package must answer both questions. Do not procure two surveys for the same geometry.

## Why this evidence is now earned

The admitted HMLR / Planning Data index polygon is good enough to screen containment but is not a determined legal boundary or a measured site survey.

Against that indicative polygon, the unchanged two-storey Reference House gives approximately:

```text
west side indicative minimum = 0.7603636181699739 m
east side indicative minimum = 0.6400238446118391 m
Bromley Policy 8 floor        = 1.0000000000000000 m
```

Both indicative sides fall below the explicit numeric floor. That cannot prove failure, because the source lacks the required authority and precision. It does make the side geometry decision-critical.

The same narrow evidence is also needed for `RH-PROT-14`: the Reference House protects ordinary future maintenance access as an architectural requirement, and RH-08 already identifies side strips as important maintenance geography.

## Minimum field / survey scope

Acquire only the geometry needed to answer the decision question:

1. establish a survey control suitable for repeatable centimetre-scale plan measurement and declare the coordinate/datum basis;
2. capture the physical east and west boundary features adjacent to the full Reference House side elevations and enough continuation beyond each end to remove endpoint ambiguity;
3. capture any wall, fence, hedge line, retained structure, level change, drain/chamber, fixed obstruction or other feature that materially constrains ordinary side access;
4. overlay the exact T3/T4 rigid candidate transform **without moving, rotating, mirroring or optimising the house**;
5. report the minimum orthogonal distance from each Reference House side façade to the measured physical boundary/control line over the full building length;
6. report the usable physical passage width separately where a boundary feature itself has thickness or overhang;
7. record the measurement accuracy / uncertainty and identify any segment where the physical feature cannot confidently be treated as the relevant control line;
8. provide a simple plan extract showing the house, measured boundary features, minimum-clearance locations and the RH-08 maintenance-support/passages affected.

## Required deliverable

Return:

```text
coordinate / datum basis
survey date and method
west-side physical control feature(s)
east-side physical control feature(s)
west minimum façade-to-control distance
west usable passage width
west uncertainty / accuracy
east minimum façade-to-control distance
east usable passage width
east uncertainty / accuracy
locations of minima
fixed obstructions relevant to maintenance
plan extract with exact T3/T4 candidate overlaid
```

The deliverable must distinguish **measured physical geometry** from **legal boundary opinion**.

## Decision rules

### Policy 8 numeric floor

For each relevant side:

- if the lower confidence bound of the measured façade-to-relevant-control distance is **>= 1.000 m**, the explicit Policy 8 numeric floor is supported on that measured/control basis; this does **not** resolve Policy 8's qualitative higher-separation remainder;
- if the upper confidence bound is **< 1.000 m**, record a measured numeric conflict indication and escalate the planning/boundary basis; this is **not** whole-site incompatibility;
- if the uncertainty interval straddles 1.000 m, or it is unclear which physical feature corresponds to the relevant boundary/control line, keep the item unresolved and escalate only the ambiguous portion.

### RH-PROT-14 maintenance geography

Test the measured side widths against the already-controlled RH-08 maintenance tasks. Do not invent a universal minimum maintenance corridor. Report whether ordinary ground-supported access / working positions remain credible, constrained-but-manageable, or not credibly available for the identified task set.

A finding that ordinary access is constrained must identify the affected task(s) and geometry. It must not silently author a specialist-access redesign.

## Explicit exclusions

This brief does **not** request by default:

- a determined legal boundary;
- full title interpretation or covenant/easement review;
- a full measured building survey of neighbouring properties;
- a whole-site topographic survey;
- drainage or utility tracing;
- tree survey;
- Party Wall advice;
- planning judgement;
- redesign or route search;
- movement of the Reference House candidate.

If measured physical features create a genuine boundary/control discrepancy, legal-title work may then accelerate under its own DPL authority. Do not pre-authorise it now.

## Evidence users

This one package serves exactly:

```text
REFERENCE_HOUSE:RH-PROT-14
PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY
```

The same measurements may inform the later planning design-context review, but that review remains qualitative judgement and is not discharged automatically by a numeric side-space result.
