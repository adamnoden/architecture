# DRW-10B — service / maintenance-geography overlays

**Status:** IMPLEMENTED — candidate generation / architectural review pending  
**Programme:** DRW  
**Parent:** #154

## Question

Can the Reference House service strategy be read spatially on the canonical ground and first-floor plans without turning architectural service geography into a pseudo-MEP routing drawing?

## Starting authority

- the controlled ground and first-floor publication plans remain the drawing substrates;
- `compiler/rhc3/fixture.ts` owns the current service-topology host-space relationships;
- `compiler/reference-house/publication-service-section-source.ts` owns the bounded architectural service reservation / access relationships already admitted by DRW-08A/B;
- `docs/reference-house/structural-coordination.md` owns the current technical proposition, including concentration on the eastern flank and the removal of the remote en-suite rather than adding a second permanent stack.

## Result

The retained DRW-02D pair is implemented as two true 1:100 analytical overlays:

1. **ground:** plant / isolation host geography, wet-terminal host spaces, accessible distribution host fields and `SV-01`;
2. **first:** family-bathroom wet concentration, `SV-01`, gallery / stair / landing distribution host fields and the explicit absence of remote en-suite infrastructure.

The canonical plan primitive arrays are copied unchanged and the analytical layer is appended afterwards. The overlay geometry is deliberately **host-space geometry**. It is not pipe, duct, cable, drainage or controls routing.

## Representation boundary

The analytical layer may show:

- room / circulation fields that current RHC3 topology identifies as hosts;
- the already-selected `SV-01` architectural reservation;
- plant / isolation concentration;
- wet concentration;
- accessible distribution geography;
- protected principal-room IDs as metadata / explanatory qualification;
- the remote-en-suite removal as a recorded absence.

It must not show:

- service centrelines;
- branch paths;
- pipe / duct / cable sizes;
- product packing;
- exact penetrations;
- final structural openings;
- a ghost en-suite or second stack;
- any geometry inferred merely to make the diagram look complete.

All DRW-10B analytical primitives are therefore rectangles or text. A regression test rejects analytical line primitives.

## Candidate / proof protocol

The first controlled candidate is generated in CI as a pair and reviewed as an architectural drawing before its bytes are frozen. After review:

- exact accepted SVG bytes are committed;
- deterministic regeneration is byte-locked;
- full repository validation and shared physical SVG typography must be green;
- DRW-10F retains family-level paired-plate physical proof.

## Files

- `compiler/reference-house/publication-service-maintenance-source.ts`
- `compiler/reference-house/publication-service-maintenance-source.test.ts`
- `compiler/reference-house/publication-service-maintenance.ts`
- `compiler/reference-house/publication-service-maintenance.test.ts`
- `compiler/reference-house/generate-publication-service-maintenance-overlays.ts`
- `.github/workflows/drw-service-maintenance-overlays-candidate.yml`

Candidate outputs:

- `docs/reference-house/publication-ground-service-maintenance-overlay.svg`
- `docs/reference-house/publication-first-service-maintenance-overlay.svg`

## What this packet does not prove

It does not prove coordinated MEP design, hydraulic / ventilation performance, service sizing, installation clearances, fire / acoustic closure, plant packing, structural penetrations or product selection. It proves only that the current architectural service strategy has an intelligible and maintainable spatial geography at the authority already owned by the project.

## Next

After reviewed-byte freeze, exact-head validation and merge: **DRW-10C — roof water / failure overlay**.
