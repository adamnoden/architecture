<!-- nav-exclude: redirect -->
# DRW-10C — roof water / failure analytical overlay

**Status:** REVIEWED + BYTE-FROZEN — final exact-head validation pending  
**Programme:** DRW  
**Parent:** #154

## Question

Can the controlled DRW-07 roof/drainage drawing make failure behaviour legible without inventing drainage engineering?

## Starting authority

DRW-07 already owns everything required for this analytical reading:

- four provisional low-slope roof fields falling outward from the courtyard;
- inspectable external perimeter collection;
- qualitative RWP return zones with exact positions absent;
- visible outward overflow behaviour clear of vulnerable fabric;
- an east/service-side courtyard primary collector with removable-grate / silt access;
- a short primary route to an external service-side inspection point, exact centreline absent;
- an **independent** higher emergency overflow to a visible east/service-side outlet before occupied thresholds flood;
- explicit absence of internal roof outlets and a courtyard roof gutter;
- explicit technical absence of gutter profiles, RWP sizes/coordinates, drain centreline/depth/gradient/diameter, overflow level, threshold datums, site discharge and hydraulic sizing.

No source-hardening packet is therefore required.

## Representation rule

The complete controlled DRW-07 roof/drainage scene is reused unchanged as the substrate. DRW-10C appends only analytical paper-space notation.

Added marks mean:

- **offset perimeter zone:** inspectable external collection / failure territory, not a gutter profile;
- **outward arrows:** visible failure direction, not overflow-outlet coordinates;
- **east courtyard bracket:** selected collector / inspection zone, not exact collector geometry;
- **PRIMARY / EMERGENCY notes:** semantic redundancy and consequence order, not drain routes.

The analytical layer must never make the unknown engineering look spatially solved.

## Failure reading

### Outer roof

The useful failure argument is geometric and inspectable: water falls outward; collection stays at external edges; blockage/overflow should discharge visibly outward rather than first announcing itself as hidden damp inside the house.

The overlay therefore reinforces all four external collection edges as a single analytical failure zone and adds outward-direction notation. It does not locate overflows or RWPs.

### Courtyard

The courtyard reading deliberately separates two systems:

1. **PRIMARY** — east/service-side collector with removable-grate / silt access; short route to an external service-side inspection point;
2. **EMERGENCY** — independent higher-level overflow to a visible external outlet, required to discharge before occupied thresholds flood.

The two are shown as a hierarchy of consequences, not as drawn pipework.

## Explicit absences

DRW-10C does not draw or infer:

- gutter section/profile;
- RWP coordinates or diameter;
- collector dimensions;
- drain centreline, depth, gradient or diameter;
- emergency-overflow inlet/outlet coordinate or level;
- threshold datums;
- waterproofing build-up;
- real-site discharge;
- hydraulic sizing.

These remain technical design. The overlay proves only the architectural failure geography already selected by RH-08 / DRW-07.

## Architectural review result

The generated drawing was reviewed at rendered output rather than accepted from CI alone. It passes the packet's architectural reading test:

- the controlled DRW-07 roof remains legible and unchanged beneath the analytical layer;
- the perimeter collection/failure territory and four outward directions read immediately;
- courtyard **PRIMARY** and **EMERGENCY** consequences remain distinct;
- the inspection bracket reads as analytical territory rather than pipework;
- the explicit absence note prevents the provisional marks from masquerading as hydraulic geometry.

The review found no architectural or renderer defect requiring a source change. The only failed regression was an over-broad test predicate that counted two explanatory text nodes alongside the intended twelve arrow line primitives; the assertion was narrowed to line primitives without altering drawing semantics.

The accepted generated SVG is now tracked at `docs/reference-house/publication-roof-water-failure-overlay.svg`. The freeze workflow stages the generated file before comparing it, so a newly generated untracked SVG cannot be mistaken for a clean byte match.

DRW-10F retains analytical-family plate/physical proof.

## Files

- `compiler/reference-house/publication-roof-water-failure.ts`
- `compiler/reference-house/publication-roof-water-failure.test.ts`
- `compiler/reference-house/generate-publication-roof-water-failure-overlay.ts`
- `.github/workflows/drw-roof-water-failure-candidate.yml`
- `docs/reference-house/publication-roof-water-failure-overlay.svg`

## Next

After final exact-head validation and merge: **DRW-10D — external-maintenance / setting overlay**.
