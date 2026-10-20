<!-- nav-exclude: redirect -->
# DRW-10B — service / maintenance-geography overlays

**Status:** RECOVERED + PHYSICALLY RE-PROVED UNDER DRW-10F  
**Programme:** DRW  
**Parent:** #154

## Question

Can the Reference House service strategy be read spatially on the canonical ground and first-floor plans without turning architectural service geography into a pseudo-MEP routing drawing?

## Result

Yes. The retained pair is two true 1:100 analytical overlays:

1. **ground:** plant / isolation host geography, wet-terminal host spaces, accessible distribution host fields and `SV-01`;
2. **first:** family-bathroom wet concentration, `SV-01`, gallery / stair / landing distribution host fields and the explicit absence of remote en-suite infrastructure.

The canonical plan primitive arrays remain unchanged underneath. Analytical geometry is host-space geography only: no pipe, duct, cable, drainage or controls routing is inferred.

## Representation boundary

The analytical layer may show host room/circulation fields, the selected `SV-01` reservation, plant/isolation and wet concentration, accessible distribution geography, protected principal-room metadata and the removed remote en-suite as an explicit absence.

It does **not** show service centrelines, branch paths, pipe/duct/cable sizes, product packing, exact penetrations, final structural openings, a ghost en-suite/second stack or geometry invented merely to complete the picture.

## DRW-10F recovery

DRW-10F found a control defect rather than a drawing defect: the original freeze workflow tested ordinary `git diff` before staging the ignored generated SVGs. The reviewed pair therefore existed in candidate generation but had never actually become tracked controlled artifacts.

The freeze was corrected to `git add -f` both generated SVGs before testing the cached diff. The canonical pair was recovered at commit `d5b96c19b9da767121b8cefc2dd30a55ee2f7c59`:

- `docs/reference-house/publication-ground-service-maintenance-overlay.svg`
- `docs/reference-house/publication-first-service-maintenance-overlay.svg`

DRW-10F added deterministic committed-artifact regressions and scene-prefix proof that both overlays preserve their canonical ground/first-floor substrates exactly.

## Physical proof

The recovered pair was then proved in its actual frozen publication role as a facing 1:100 pair at both A4 and conservative B5, with no fit-scaling. The accepted family proof is workflow run `39486843600`; artifact digest `sha256:23fce67a06629fcd8a98a30aa8f3bcdf03fc35afa4160779c5a207049362e572`.

Direct review found the service pair legible and collision-free at both sizes.

## Files

- `compiler/reference-house/publication-service-maintenance-source.ts`
- `compiler/reference-house/publication-service-maintenance-source.test.ts`
- `compiler/reference-house/publication-service-maintenance.ts`
- `compiler/reference-house/publication-service-maintenance.test.ts`
- `compiler/reference-house/publication-service-maintenance-artifact.test.ts`
- `compiler/reference-house/generate-publication-service-maintenance-overlays.ts`
- `.github/workflows/drw-service-maintenance-overlays-candidate.yml`
- `docs/reference-house/publication-ground-service-maintenance-overlay.svg`
- `docs/reference-house/publication-first-service-maintenance-overlay.svg`

## Nonclaim

This pair does not prove coordinated MEP design, hydraulic/ventilation performance, service sizing, installation clearances, fire/acoustic closure, plant packing, structural penetrations or product selection. It proves only that the current architectural service strategy has an intelligible service/maintenance geography at the authority already owned by the project.
