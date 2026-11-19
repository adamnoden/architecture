# ROF-07 — system synthesis and candidate families

**Result:** complete at comparative-family synthesis scope; no candidate is admitted as the selected house roof.  
**Date:** 29 October 2026.  
**Starting main:** `40a59738c7002251504647a239831a8fdcb09d65`.  
**Programme:** [ROF](roof-systems-programme.md), issue #991.

## Result

[Roof system candidates](../../docs/research/roof-system-candidates.md) combines topology, covering, assembly, junctions and access/renewal into three connected propositions: current ring/discrete eligible tile/ceiling insulation; current ring/documented supported sheet/over-structure insulation; and outward-only pitched ring with the latter coherent sheet/assembly family. Each states intended water, air/thermal, support, movement and recovery relationships. The tile representative is Marley Edgemere Smooth with its documented nail/clip family and Universal Vapour Permeable Underlay in a ceiling-insulated, ventilated cold-space proposition. The sheet representative is VMZINC PLUS Structural Roof on a plywood deck, supported Aludex Max, suitable mineral-board insulation and VMZINC Membrane with through-to-deck fixed/sliding attachment. Direct manufacturer pages support these matched functions and ordinary-face pitch scopes; no selected dimensions, house fixing schedule, load path, local junction or complete fit is inferred. The public source records the dated direct-source check and limits. These are concrete comparison representatives, not permission to mix products or adopt either system.

Seven hostile whole-system cases and eight rejected combinations expose the distinct burdens. The current-ring families retain four inner valleys and unresolved court receivers/escape/access. The outward-only challenger removes ordinary inward roof discharge but raises its high court edge and exterior catchment; it does not resolve direct court rain or higher-edge access. No scalar score, supplier/lifespan preference, technical certification, plot or selection is invented.

## Source arithmetic

Current source remains `layoutRevision` / `layoutFamilySource`. With shell 12000, court 3500, nominal wing 4250, ridge inset 2125, pitch 25° and exterior eave +6800: current ridge +7790.904; outward-only court high edge +8781.808; difference +990.904. Ordinary face length changes 2344.678→4689.356 on slope. These are geometry, not member spans or accepted architectural changes.

Nominal vertical-rain plan allocations are current outside 83.9375 m² / inside 47.8125 m² / court 12.25 m²; the outward-only comparison sends 131.75 m² of roof outside, about 56.96% more than the current exterior share. Direct court remains 12.25 m². This reuses ROF-02 and accepted BCR-WATER's consistent wall-line partition; no selected overhang, hydraulic effective area or outlet capacity is inferred.

Reproduce from source:

```sh
node --import tsx --input-type=module - <<'JS'
import {layoutRevision as d} from './compiler/reference-house/georgian/layout-revision.ts';
import {roofTop} from './compiler/reference-house/georgian/layout-family.ts';
const t=d.roof.upperPitchDeg*Math.PI/180,r=d.roof.ridgeInset,w=d.court.x;
const inner=(d.shell-2*r)**2-d.court.width*d.court.depth;
const outer=d.shell*d.shell-(d.shell-2*r)**2;
console.log({currentRidge:roofTop(),outwardHigh:d.roof.eaves+w*Math.tan(t),
 extra:d.roof.eaves+w*Math.tan(t)-roofTop(),
 faceCurrent:r/Math.cos(t),faceOutward:w/Math.cos(t),
 normalReserve:300*Math.cos(t),inside:inner/1e6,outside:outer/1e6,
 outwardOutside:(inner+outer)/1e6,court:d.court.width*d.court.depth/1e6,
 exteriorIncreasePercent:100*inner/outer});
JS
```

The current 300 vertical / 271.892 normal roof band, shallow ceiling/storage geometry and eave termination obligation remain binding. Neither over-structure insulation nor a changed topology is credited with unallocated depth. ROF-06's ordinary-tower rejection and unadmitted purpose-designed scaffold remain explicit; no access closure is transferred from its completed investigation.

## Gate handoff and completion boundary

ROF-RWT-GATE must compare these concrete families with RWT-07 and actual HAD-03 convergence. RWT-06's partial crossing, threshold and high-access admission holds are not closed by this packet. The gate remains blocked by its independent RWT/HAD dependencies. If the needed layer/support, normal/failure water path, occupied opening or recovery arrangement cannot physically fit, revise/reject the candidate before selection. Those conditions cannot be deferred as routine technical detail.

HAD owns silhouette/daylight/court-edge and source changes; OAS retains opening/threshold authority; RWT owns collection/crossing/exterior receiving and operating-water identity. BCR-STRUCTURE/WATER and later PREFLIGHT retain support/floor/ground/catchment findings. The existing shared RWT material record remains sole compatibility owner. MRA attacks an eventual selected coordinated system; EPR/PHY/DEL retain competent/physical/delivery gates rather than receiving a fictional universal pass.

This packet earns the requested small comparative family set and red-team synthesis, not the programme's final roof selection or a buildable option. Research evidence limits remain in their original accepted records. Source arithmetic was executed directly; repository/control/public-surface/build and exact-head CI evidence belongs in the PR. No source geometry, matrix disposition, historical proof applicability, maturity or manual gate changes.
